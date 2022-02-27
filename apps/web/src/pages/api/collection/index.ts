import {NextkitException} from 'nextkit';
import {api} from '../../../server/api';
import {prisma} from '../../../server/prisma';

export default api({
	async GET({context}) {
		if (!context.userId) {
			throw new NextkitException(401, 'You are not signed in!');
		}

		// Get the current active / future collections
		const collections = await prisma.collection.findMany({
			where: {
				OR: [
					{
						closes_at: {
							gt: new Date(),
						},
					},
					{
						closes_at: null,
					},
				],
			},
			include: {
				artist: true,
				tickets: {
					where: {
						user_id: context.userId,
					},
				},
			},
		});

		return (
			await Promise.all(
				collections.map(async coll => ({
					...coll,
					hasTicket: coll.tickets.length > 0,
					ticketsRemaining: await prisma.ticket.count({
						where: {
							collection_id: coll.id,
							user_id: null,
						},
					}),
				})),
			)
		).filter(coll => coll.ticketsRemaining > 0);
	},
});
