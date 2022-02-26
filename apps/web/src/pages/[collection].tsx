import {Collection} from '@prisma/client';
import {GetStaticPaths, GetStaticProps} from 'next';
import {Circle, Marker} from 'react-google-maps';
import {GoogleMap} from '../client/components/map';
import {collectionSchema} from '../schemas/collection';
import {prisma} from '../server/prisma';
import {useCallback, useEffect, useState} from 'react';
import {fetcher} from '../client/fetcher';
import type CollectionAPI from './api/collection/[id]';
import {InferAPIResponse} from 'nextkit';
import colors from 'tailwindcss/colors';

interface Props {
	collection: Collection;
}

interface Pos {
	lat: number;
	lng: number;
}

export default function CollectionPage(props: Props) {
	const [usrPos, setUsrPos] = useState<null | Pos>(null);
	const [ticketsRemaining, setTicketsRemaining] = useState(0);
	const [distance, setDistance] = useState(-1);
	const [hasTicket, setHasTicket] = useState(false);

	const revalidateTicketsRemaining = useCallback(() => {
		fetcher<InferAPIResponse<typeof CollectionAPI, 'GET'>>(
			`/api/collection/${props.collection.id}`,
			{
				method: 'GET',
				headers: {'Content-Type': 'application/json'},
			},
		)
			.then(data => {
				setTicketsRemaining(data.remainingTicketCount);
				setHasTicket(data.hasTicket);
			})
			.catch(() => null);
	}, [props.collection.id]);

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

		// Calculate the distance between the two
		const lat1 = usrPos.lat;
		const lat2 = props.collection.latitude;
		const lon1 = usrPos.lng;
		const lon2 = props.collection.longitude;

		const R = 6371e3;
		const φ1 = (lat1 * Math.PI) / 180;
		const φ2 = (lat2 * Math.PI) / 180;
		const Δφ = ((lat2 - lat1) * Math.PI) / 180;
		const Δλ = ((lon2 - lon1) * Math.PI) / 180;

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
			{distance !== -1 && distance < 1000 && ticketsRemaining > 0 && (
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
