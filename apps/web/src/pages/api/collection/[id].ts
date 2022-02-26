import {api} from '../../../server/api';
import {prisma} from '../../../server/prisma';
import {z} from 'zod';
import {collectionSchema} from '../../../schemas/collection';
import {NextkitException} from 'nextkit';

export default api({
	async GET({req, context}) {
		if (!context.userId) {
			throw new NextkitException(401, 'You are not signed in!');
		}

		const {id} = getIdSchema.parse(req.query);

		const remainingTicketCount = await prisma.ticket.count({
			where: {
				collection_id: id,
				user_id: null,
			},
		});

		const hasTicket = await prisma.ticket.findFirst({
			where: {
				collection_id: id,
				user_id: context.userId,
			},
		});

		return {
			remainingTicketCount,
			hasTicket: hasTicket !== null,
		};
	},
});

const getIdSchema = z.object({
	id: collectionSchema.id,
});
