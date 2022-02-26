import {Collection} from '@prisma/client';
import {GetStaticPaths, GetStaticProps} from 'next';
import {Marker} from 'react-google-maps';
import {GoogleMap} from '../client/components/map';
import {collectionSchema} from '../schemas/collection';
import {prisma} from '../server/prisma';

interface Props {
	collection: Collection;
}

export default function CollectionPage(props: Props) {
	return (
		<div>
			<div className="h-[80vh]">
				<GoogleMap
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
