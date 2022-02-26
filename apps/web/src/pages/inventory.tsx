import {InferAPIResponse} from 'nextkit';
import {useCallback, useEffect, useState} from 'react';
import type TicketAPI from './api/ticket';
import {fetcher} from '../client/fetcher';
import {useRouter} from 'next/router';

type TicketResponse = InferAPIResponse<typeof TicketAPI, 'GET'>;

export default function Inventory() {
	const [tickets, setTickets] = useState<TicketResponse>([]);
	const router = useRouter();

	const revalidateTickets = useCallback(() => {
		fetcher<TicketResponse>(`/api/ticket`)
			.then(data => {
				setTickets(data);
			})
			.catch(() => {
				void router.push('/auth');
			});
	}, []);

	useEffect(() => {
		revalidateTickets();
	}, [revalidateTickets]);

	return (
		<div className="mx-auto max-w-7xl px-4 py-12">
			<h1>Your inventory of Tickets</h1>
			<table className="table-auto w-full">
				<thead>
					<tr>
						<th>Artist</th>
						<th>Collection</th>
						<th>Claim</th>
					</tr>
				</thead>
				<tbody>
					{tickets.map(ticket => (
						<tr key={`ticket-${ticket.id}`}>
							<td>{ticket.collection.artist.name}</td>
							<td>{ticket.collection.name}</td>
							<td>
								<button
									type="button"
									onClick={() => {
										// eslint-disable-next-line no-alert
										alert(
											"This is where you'd send us an email or something...",
										);
									}}
								>
									Claim me!
								</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
