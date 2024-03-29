import {Artist, Collection} from '@prisma/client';
import {useThrottle, useToggle} from 'alistair/hooks';
import clsx from 'clsx';
import dayjs from 'dayjs';
import {AnimatePresence, motion} from 'framer-motion';
import {GetStaticPaths, GetStaticProps} from 'next';
import {useRouter} from 'next/router';
import {InferAPIResponse} from 'nextkit';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Circle, Marker} from 'react-google-maps';
import {FaCheckCircle} from 'react-icons/fa';
import {FiXCircle} from 'react-icons/fi';
import {HiOutlineTicket} from 'react-icons/hi';
import {HashLoader, PulseLoader} from 'react-spinners';
import {io} from 'socket.io-client';
import colors from 'tailwindcss/colors';
import {GoogleMap} from '../client/components/map';
import {fetcher} from '../client/fetcher';
import {usePaid} from '../client/hooks/usePaid';
import {collectionSchema} from '../schemas/collection';
import {prisma} from '../server/prisma';
import {humanizeDistanceString} from '../shared/util/distance';

import type CollectionAPI from './api/collection/[id]';

interface Props {
	collection: Collection & {
		artist: Artist;
	};
}

interface Pos {
	lat: number;
	lng: number;
}

export default function CollectionPage(props: Props) {
	const socket = useMemo(() => io(`http://localhost:8081`), []);
	const paidState = usePaid();
	const router = useRouter();
	const [usrPos, setUsrPos] = useState<null | Pos>(null);
	const [ticketsRemaining, setTicketsRemaining] = useState(0);
	const [hasTicket, setHasTicket] = useState(false);

	const [_distance, setDistance] = useState(-1);
	const [_loadingReservation, loadingReservationControls] = useToggle();

	// Throttle values to "slow down" the ui so users can
	// actually see the changes and have a chance to process
	// what is on their screen (it's good UX + ratio + L + buildergroop)
	const distance = useThrottle(_distance, 1000);
	const loadingReservation = useThrottle(_loadingReservation, 1000);

	const disabledReservedButtonRef = useRef<HTMLButtonElement | null>(null);

	const revalidateTicketsRemaining = useCallback(() => {
		fetcher<InferAPIResponse<typeof CollectionAPI, 'GET'>>(
			`/api/collection/${props.collection.id}`,
		)
			.then(data => {
				setTicketsRemaining(data.remainingTicketCount);
				setHasTicket(data.hasTicket);
			})
			.catch(() => null);
	}, [props.collection.id]);

	useEffect(() => {
		if (paidState === 'not_paid') {
			void router.push('/pay');
		}
	}, [paidState, router]);

	useEffect(() => {
		if (typeof window === 'undefined') {
			return;
		}

		socket.on('request-authentication', () => {
			socket.emit('authentication', {
				token: window.localStorage.getItem('realtime-token'),
			});

			socket.on('authentication-completed', () => {
				socket.emit('subscribe-collection', {
					collectionId: props.collection.id,
				});
			});

			socket.on('ticket-claimed', ({collectionId}: {collectionId: string}) => {
				console.log('received ticket claimed update');
				if (collectionId === props.collection.id) {
					revalidateTicketsRemaining();
				}
			});
		});
	}, [props.collection.id, revalidateTicketsRemaining, socket]);

	useEffect(() => {
		revalidateTicketsRemaining();
	}, [revalidateTicketsRemaining]);

	useEffect(() => {
		if (typeof window === 'undefined') {
			return;
		}

		const watchId = window.navigator.geolocation.watchPosition(pos => {
			// if (process.env.NODE_ENV === 'development') {
			// 	setUsrPos({
			// 		// LONDON
			// 		lat: 51.5032616,
			// 		lng: -0.157833,
			// 	});

			// 	return;
			// }

			setUsrPos({
				lat: pos.coords.latitude,
				lng: pos.coords.longitude,
			});
		});
		return () => {
			window.navigator.geolocation.clearWatch(watchId);
		};
	}, []);

	useEffect(() => {
		if (!usrPos) {
			return;
		}

		// Calculate the distance between the two points
		const R = 6371e3;
		const φ1 = (usrPos.lat * Math.PI) / 180;
		const φ2 = (props.collection.latitude * Math.PI) / 180;
		const Δφ = ((props.collection.latitude - usrPos.lat) * Math.PI) / 180;
		const Δλ = ((props.collection.longitude - usrPos.lng) * Math.PI) / 180;

		const a =
			Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
			Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		const d = R * c;

		setDistance(d);
	}, [usrPos, props.collection]);

	const shake = () => {
		if (!disabledReservedButtonRef.current) {
			return;
		}

		disabledReservedButtonRef.current.classList.add('shake');

		setTimeout(() => {
			disabledReservedButtonRef.current?.classList.remove('shake');
		}, 200);
	};

	const attemptTicketClaim = async () => {
		if (!usrPos) {
			return;
		}

		loadingReservationControls.on();

		await fetcher('/api/location', {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({longitude: usrPos.lng, latitude: usrPos.lat}),
		}).finally(loadingReservationControls.off);
	};

	const withinRange = distance <= 150;

	const tooLate = Boolean(
		ticketsRemaining === 0 ||
			(props.collection.closes_at &&
				dayjs().isAfter(props.collection.closes_at)),
	);

	const infoBoxClassname = clsx(
		'absolute shadow-md space-y-2 left-12 top-12 z-10 rounded-md p-7',
		{
			'bg-gradient-to-tr shadow-green-400/25 from-green-500 to-green-400':
				hasTicket,
			'bg-white': !hasTicket,
		},
	);

	return (
		<div>
			<div className="h-[calc(100vh-4rem)] relative">
				<AnimatePresence mode="wait">
					{distance === -1 ? (
						<motion.div
							key="loading"
							animate={{opacity: 1}}
							exit={{opacity: 0}}
							className={infoBoxClassname}
						>
							<div className="h-24 w-24 flex items-center justify-center">
								<HashLoader />
							</div>
						</motion.div>
					) : (
						<motion.div
							key="not-loading"
							initial={{opacity: 0}}
							animate={{opacity: 1}}
							className={infoBoxClassname}
						>
							<h1 className="text-4xl font-bold tracking-tighter text-black/75">
								{tooLate ? (
									<span>
										{ticketsRemaining === 0
											? 'Too late!'
											: 'The collection has closed!'}
									</span>
								) : hasTicket ? (
									<>
										<FaCheckCircle className="inline -mt-1" />{' '}
										{props.collection.artist.name}
									</>
								) : (
									<>
										{distance === -1
											? 'Loading...'
											: `${humanizeDistanceString(distance)}`}
										&nbsp;
										<span className="text-black/50">away</span>
									</>
								)}{' '}
							</h1>

							{tooLate ? (
								<p>This collection has already sold out.</p>
							) : (
								<p>
									{hasTicket ? (
										`We've reserved your ticket for ${props.collection.artist.name}.`
									) : (
										<>
											<FiXCircle className="inline -mt-1" /> You{' '}
											<span className="text-red-500 font-semibold">
												have not reserved
											</span>{' '}
											a ticket!
										</>
									)}
								</p>
							)}

							{!tooLate &&
								!hasTicket &&
								(distance !== -1 && withinRange && ticketsRemaining > 0 ? (
									<button
										type="button"
										className="bg-amber-500/25 border border-amber-500/50 w-full flex justify-between items-center text-left py-2 px-3 rounded-md text-black/75 font-semibold text-sm"
										onClick={attemptTicketClaim}
									>
										<span>Reserve Ticket</span>
										<HiOutlineTicket className="inline-block" />
									</button>
								) : (
									<div>
										<button
											title="You are not within 150 metres of this collection"
											ref={disabledReservedButtonRef}
											type="button"
											className="relative overflow-hidden cursor-not-allowed bg-red-500/25 border border-red-500/50 w-full flex justify-between items-center text-left py-2 px-3 rounded-md text-black/75 font-semibold text-sm"
											onClick={shake}
										>
											<span>Reserve Ticket</span>
											<HiOutlineTicket className="inline-block" />

											{loadingReservation && (
												<span className="absolute flex items-center justify-center inset-0 z-10 bg-red-500">
													<PulseLoader />
												</span>
											)}
										</button>
									</div>
								))}
						</motion.div>
					)}
				</AnimatePresence>

				<GoogleMap
					key={`gmap-${props.collection.id}`}
					options={{
						minZoom: 5,
						maxZoom: 18,
						scrollwheel: true,
						panControl: false,
					}}
					zoom={17}
					center={{
						lat: props.collection.latitude,
						lng: props.collection.longitude,
					}}
				>
					<Circle
						center={{
							lat: props.collection.latitude,
							lng: props.collection.longitude,
						}}
						options={{
							strokeColor: colors.neutral[500],
							strokeOpacity: 0.3,
							fillColor: colors.neutral[500],
							fillOpacity: 0.1,
						}}
						radius={150}
					/>

					<Marker
						position={{
							lat: props.collection.latitude,
							lng: props.collection.longitude,
						}}
						options={{
							icon: '/',
						}}
						label={{
							fontFamily: 'Roboto, sans-serif',
							text: `${ticketsRemaining} ticket${
								ticketsRemaining === 1 ? '' : 's'
							} remaining!`,
							color: colors.white,
							className:
								'ticket-remaining-label rounded-md bg-neutral-500/75 py-2 px-3',
						}}
					/>

					{usrPos && (
						<Circle
							center={usrPos}
							options={{
								strokeColor: colors.indigo[500],
								fillColor: colors.indigo[500],
								radius: 5,
							}}
						/>
					)}
				</GoogleMap>
			</div>
		</div>
	);
}

export const getStaticProps: GetStaticProps<
	Props,
	{collection: string}
> = async ctx => {
	const collection = await prisma.collection.findFirst({
		where: {
			slug: collectionSchema.slug.parse(ctx.params?.collection),
		},
		include: {
			artist: true,
		},
	});

	if (!collection) {
		return {
			notFound: true,
		};
	}

	return {
		revalidate: 240,
		props: {collection},
	};
};

export const getStaticPaths: GetStaticPaths = async () => ({
	paths: [],
	fallback: 'blocking',
});
