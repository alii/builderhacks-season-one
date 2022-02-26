import {Collection} from '@prisma/client';
import {GetStaticPaths, GetStaticProps} from 'next';
import {Circle, Marker} from 'react-google-maps';
import {GoogleMap} from '../client/components/map';
import {collectionSchema} from '../schemas/collection';
import {prisma} from '../server/prisma';
import {useCallback, useEffect, useRef, useState} from 'react';
import {fetcher} from '../client/fetcher';
import type CollectionAPI from './api/collection/[id]';
import {InferAPIResponse} from 'nextkit';
import colors from 'tailwindcss/colors';
import {io, Socket} from 'socket.io-client';

interface Props {
	collection: Collection;
}

interface Pos {
	lat: number;
	lng: number;
}

export default function CollectionPage(props: Props) {
	const socketRef = useRef<Socket>(io(`http://localhost:8081`));

	const [usrPos, setUsrPos] = useState<null | Pos>(null);
	const [ticketsRemaining, setTicketsRemaining] = useState(0);
	const [distance, setDistance] = useState(-1);
	const [hasTicket, setHasTicket] = useState(false);

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

		socketRef.current.on('request-authentication', () => {
			socketRef.current.emit('authentication', {
				token: window.localStorage.getItem('realtime-token'),
			});

			socketRef.current.on('authentication-completed', () => {
				socketRef.current.emit('subscribe-collection', {
					collectionId: props.collection.id,
				});
			});

			socketRef.current.on(
				'ticket-claimed',
				({collectionId}: {collectionId: string}) => {
					console.log('received ticket claimed update');
					if (collectionId === props.collection.id) {
						revalidateTicketsRemaining();
					}
				},
			);
		});
	}, [props.collection.id, revalidateTicketsRemaining]);

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

	async function attemptTicketClaim() {
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
	}

	return (
		<div>
			<h1>
				Distance: {distance === -1 ? 'Loading...' : `${distance}m`} -{' '}
				{hasTicket ? 'YOU HAVE A TICKET!!!' : 'You do not have a ticket yet :('}
			</h1>
			<div className="h-[80vh]">
				<GoogleMap
					key={`gmap-${props.collection.id}`}
					options={{
						minZoom: 15,
						maxZoom: 18,
					}}
					zoom={18}
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
							strokeColor: colors.orange[500],
							strokeOpacity: 0.3,
							fillColor: colors.orange[500],
							fillOpacity: 0.1,
						}}
						radius={150}
					/>

					<Marker
						position={{
							lat: props.collection.latitude,
							lng: props.collection.longitude,
						}}
						label={{
							text: `${ticketsRemaining} ticket${
								ticketsRemaining === 1 ? '' : 's'
							} remaining!`,
							color: '#ffffff',
							className: 'ticket-remaining-label',
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
			{distance !== -1 && distance < 150 && ticketsRemaining > 0 && !hasTicket && (
				<button type="button" onClick={async () => attemptTicketClaim()}>
					You're close enough - Attempt Ticket Claim
				</button>
			)}
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
