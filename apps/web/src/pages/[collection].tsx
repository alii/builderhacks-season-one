import {Collection} from '@prisma/client';
import {GetStaticPaths, GetStaticProps} from 'next';
import {collectionSchema} from '../schemas/collection';
import {prisma} from '../server/prisma';
import dayjs from 'dayjs';
import {TransformDates} from '../shared/types';

interface Props {
	collection: TransformDates<Collection>;
}

export default function CollectionPage(props: Props) {
	return (
		<div>
			<h1>Collection</h1>
			<h2>{JSON.stringify(props.collection)}</h2>
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

	const mapped = {
		...collection,
		releases_at: dayjs(collection.releases_at).toISOString(),
		closes_at: dayjs(collection.closes_at).toISOString(),
	};

	return {
		revalidate: 240,
		props: {
			collection: mapped,
		},
	};
};

export const getStaticPaths: GetStaticPaths = async () => ({
	paths: [],
	fallback: true,
});
