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
					has_tickets: coll.tickets.length > 0,
					tickets_remaining: await prisma.ticket.count({
						where: {
							collection_id: coll.id,
							user_id: null,
						},
					}),
				})),
			)
		).sort(a => {
			if (a.tickets_remaining === 0) {
				return 1;
			}

			return -1;
		});
	},
});
