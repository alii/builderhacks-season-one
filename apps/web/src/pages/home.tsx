import {useEffect} from 'react';
import {useRouter} from 'next/router';
import dayjs from 'dayjs';
import {usePaid} from '../client/hooks/usePaid';
import {HashLoader} from 'react-spinners';
import {useMyCollections} from '../client/hooks/use-user';
import {Ticket} from '../client/components/ticket';

export default function Home() {
	const {data: collections} = useMyCollections();

	const router = useRouter();
	const paidState = usePaid();

	useEffect(() => {
		if (paidState === 'not_paid') {
			void router.push('/pay');
		}
	}, [paidState, router]);

	return (
		<div className="mx-auto max-w-7xl px-4 py-12">
			<h1 className="text-2xl font-bold mb-8">Current Collections</h1>

			<div className="flex flex-row gap-5 flex-wrap">
				{collections &&
					collections.map(collection => (
						<Ticket
							key={`collection-${collection.id}`}
							artist={collection.artist.name}
							collection={collection.name}
							claimText="HUNT"
							ticketsRemaining={collection.ticketsRemaining}
							image={collection.artist.image}
							activityText={
								dayjs(collection.releases_at).isBefore(dayjs())
									? 'ACTIVE NOW!'
									: dayjs(collection.releases_at).format('DD/MM/YYYY HH:mm:ss')
							}
							onClaimClick={() => {
								void router.push(`/${collection.slug}`);
							}}
						/>
					))}
			</div>
		</div>
	);
}
