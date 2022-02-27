import {InferAPIResponse} from 'nextkit';
import {HashLoader} from 'react-spinners';
import useSWR from 'swr';
import type TicketAPI from './api/ticket';
import {Ticket} from '../client/components/ticket';

type TicketResponse = InferAPIResponse<typeof TicketAPI, 'GET'>;

export default function Inventory() {
	const {data: tickets} = useSWR<TicketResponse>('/api/ticket');

	return (
		<div className="mx-auto max-w-7xl px-4 py-12">
			<h1 className="text-2xl font-bold mb-8">Your inventory of Tickets</h1>

			<div className="flex flex-row gap-5">
				{tickets ? (
					tickets.map(ticket => (
						<Ticket
							key={`ticket-${ticket.id}`}
							artist={ticket.collection.artist.name}
							collection={ticket.collection.name}
							onClaimClick={() => {
								// eslint-disable-next-line no-alert
								alert("This is where you'd send us an email or something...");
							}}
						/>
					))
				) : (
					<HashLoader />
				)}
			</div>

			{tickets && (
				<p className="text-center text-gray-500 mt-10">
					That's all! Keep hunting for tickets to build up your library!
				</p>
			)}
		</div>
	);
}
