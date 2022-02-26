import {Collection} from '@prisma/client';
import {GetStaticPaths, GetStaticProps} from 'next';
import {collectionSchema} from '../schemas/collection';
import {prisma} from '../server/prisma';

interface Props {
	collection: Collection;
}

export default function CollectionPage(props: Props) {
	return (
		<div>
			<h1>Collection</h1>

			<h2>{props.collection.id}</h2>
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
		revalidate: 120,
		props: {collection},
	};
};

export const getStaticPaths: GetStaticPaths = async () => ({
	paths: [],
	fallback: true,
});
