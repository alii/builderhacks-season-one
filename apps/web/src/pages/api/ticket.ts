import { NextkitException } from 'nextkit';
import { api } from '../../server/api';
import { prisma } from '../../server/prisma';

export default api({
	async GET({context}) {
		if (!context.userId) {
			throw new NextkitException(401, 'You are not signed in!');
		}

		// Get the tickets that the user has
		return prisma.ticket.findMany({
			where: {
				user_id: context.userId,
			},
			include: {
				collection: {
					include: {
						artist: true,
					},
				},
			},
		});
	},
});
