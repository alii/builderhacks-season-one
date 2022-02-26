import {Collection} from '@prisma/client';
import {GetStaticPaths, GetStaticProps} from 'next';
import {Marker} from 'react-google-maps';
import {GoogleMap} from '../client/components/map';
import {collectionSchema} from '../schemas/collection';
import {prisma} from '../server/prisma';
import {useCallback, useEffect, useState} from 'react';
import {fetcher} from '../client/fetcher';
import type CollectionAPI from './api/collection/[id]';
import {InferAPIResponse} from 'nextkit';

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

		// Emit the user pos to the server
		console.log('emitting ', usrPos);

		void fetcher('/api/location', {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({longitude: usrPos.lng, latitude: usrPos.lat}),
		});
	}, [usrPos]);

	return (
		<div>
			<div className="h-[100vh]">
				<GoogleMap
					key={`gmap-${props.collection.id}`}
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
						<Marker
							position={usrPos}
							opacity={0.3}
							label={{
								text: 'Your position',
								color: '#ffffff',
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
