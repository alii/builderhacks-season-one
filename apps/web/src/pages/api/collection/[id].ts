import {api} from '../../../server/api';
import {prisma} from '../../../server/prisma';
import {z} from 'zod';
import {collectionSchema} from '../../../schemas/collection';

export default api({
	async GET({req}) {
		const {id} = getIdSchema.parse(req.query);

		const remainingTicketCount = await prisma.ticket.count({
			where: {
				collection_id: id,
				user_id: null,
			},
		});

		return {
			remainingTicketCount,
		};
	},
});

const getIdSchema = z.object({
	id: collectionSchema.id,
});
