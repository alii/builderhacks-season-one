import {InferAPIResponse} from 'nextkit';
import type CollectionListAPI from './api/collection';
import {useCallback, useEffect, useState} from 'react';
import {fetcher} from '../client/fetcher';
import {useRouter} from 'next/router';
import dayjs from 'dayjs';
import {usePaid} from '../client/hooks/usePaid';

type CollectionResponse = InferAPIResponse<typeof CollectionListAPI, 'GET'>;

export default function Home() {
	const [collections, setCollections] = useState<CollectionResponse>([]);
	const router = useRouter();
	const paidState = usePaid();

	useEffect(() => {
		if (paidState === 'not_paid') {
			void router.push('/pay');
		}
	}, [paidState, router]);

	const revalidateCollections = useCallback(() => {
		fetcher<CollectionResponse>(`/api/collection`)
			.then(data => {
				setCollections(data);
			})
			.catch(() => {
				void router.push('/auth');
			});
	}, [router]);

	useEffect(() => {
		revalidateCollections();
	}, [revalidateCollections]);

	return (
		<div className="mx-auto max-w-7xl px-4 py-12">
			<h1>Current Collections</h1>
			<table className="table-auto w-full">
				<thead>
					<tr>
						<th>Collection</th>
						<th>Artist</th>
						<th>Tickets Remaining</th>
						<th>Drop starts</th>
						<th>Do you have it?</th>
						<th>Hunt this ticket</th>
					</tr>
				</thead>
				<tbody>
					{collections.map(coll => (
						<tr key={`collection-${coll.id}`}>
							<td>{coll.name}</td>
							<td>{coll.artist.name}</td>
							<td>{coll.ticketsRemaining}</td>
							<td>
								{dayjs(coll.releases_at).isBefore(dayjs())
									? 'ACTIVE NOW!'
									: dayjs(coll.releases_at).format('DD/MM/YYYY HH:mm:ss')}
							</td>
							<td>{coll.hasTicket ? 'YES' : 'Not yet'}</td>
							<td>
								<button
									type="button"
									onClick={() => {
										void router.push(`/${coll.slug}`);
									}}
								>
									Hunt this ticket
								</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
