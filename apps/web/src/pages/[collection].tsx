import {Collection} from '@prisma/client';
import {GetStaticPaths, GetStaticProps} from 'next';
import {Marker} from 'react-google-maps';
import {GoogleMap} from '../client/components/map';
import {collectionSchema} from '../schemas/collection';
import {prisma} from '../server/prisma';
import {useEffect, useState} from 'react';
import {fetcher} from '../client/fetcher';
import Account from './api/account';

interface Props {
	collection: Collection;
}

interface Pos {
	lat: number;
	lng: number;
}

export default function CollectionPage(props: Props) {
	const [usrPos, setUsrPos] = useState<null | Pos>(null);

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
					/>
					{usrPos && <Marker position={usrPos} opacity={0.3} />}
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
