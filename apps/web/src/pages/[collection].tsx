import {Artist, Collection} from '@prisma/client';
import {GetStaticPaths, GetStaticProps} from 'next';
import {Circle, Marker} from 'react-google-maps';
import {GoogleMap} from '../client/components/map';
import {collectionSchema} from '../schemas/collection';
import {prisma} from '../server/prisma';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {fetcher} from '../client/fetcher';
import type CollectionAPI from './api/collection/[id]';
import {InferAPIResponse} from 'nextkit';
import colors from 'tailwindcss/colors';
import {io} from 'socket.io-client';
import {FaCheckCircle} from 'react-icons/fa';
import {FiXCircle} from 'react-icons/fi';
import {useThrottle} from 'alistair/hooks';
import clsx from 'clsx';
import {motion, AnimatePresence} from 'framer-motion';
import {humanizeDistanceString} from '../shared/util/distance';
import {HiOutlineTicket} from 'react-icons/hi';

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

	const [usrPos, setUsrPos] = useState<null | Pos>(null);
	const [ticketsRemaining, setTicketsRemaining] = useState(0);
	const [_distance, setDistance] = useState(-1);
	const [hasTicket, setHasTicket] = useState(false);

	const distance = useThrottle(_distance, 500);

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

	const attemptTicketClaim = () => {
		if (!usrPos) {
			return;
		}

		// Emit the user pos to the server
		console.log('emitting ', usrPos);

		void fetcher('/api/location', {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({longitude: usrPos.lng, latitude: usrPos.lat}),
		});
	};

	const withinRange = distance <= 150;

	return (
		<div>
			<div className="h-[calc(100vh-4rem)] relative">
				<AnimatePresence>
					{distance !== -1 && (
						<motion.div
							initial={{opacity: 0}}
							animate={{opacity: 1}}
							className={clsx(
								'absolute space-y-2 left-12 top-12 z-10 rounded-md p-7',
								hasTicket
									? 'bg-gradient-to-r from-green-500 to-green-600'
									: 'bg-white',
							)}
						>
							<h1 className="text-4xl font-bold tracking-tighter">
								{hasTicket ? (
									<>
										<FaCheckCircle className="inline -mt-1" />{' '}
										{props.collection.artist.name}
									</>
								) : (
									<>
										<FiXCircle className="inline -mt-1" />{' '}
										{distance === -1
											? 'Loading...'
											: `${humanizeDistanceString(distance)}`}
										&nbsp;
										<span className="text-black/50">away</span>
									</>
								)}{' '}
							</h1>

							<p>
								{hasTicket ? (
									`We've reserved your ticket for ${props.collection.artist.name}`
								) : (
									<>
										You{' '}
										<span className="text-red-500 font-semibold">
											have not reserved
										</span>{' '}
										a ticket!
									</>
								)}
							</p>

							{distance !== -1 &&
							withinRange &&
							ticketsRemaining > 0 &&
							!hasTicket ? (
								<button
									type="button"
									className="bg-green-500/25 border border-green-500/50 w-full flex justify-between items-center text-left py-2 px-3 rounded-md text-black/75 font-semibold text-sm"
									onClick={attemptTicketClaim}
								>
									<span>Reserve Ticket</span>
									<HiOutlineTicket className="inline-block" />
								</button>
							) : (
								<button
									disabled
									type="button"
									className="cursor-not-allowed bg-red-500/25 border border-red-500/50 w-full flex justify-between items-center text-left py-2 px-3 rounded-md text-black/75 font-semibold text-sm"
								>
									<span>Too far!</span>
									<HiOutlineTicket className="inline-block" />
								</button>
							)}
						</motion.div>
					)}
				</AnimatePresence>

				<GoogleMap
					key={`gmap-${props.collection.id}`}
					options={{
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
