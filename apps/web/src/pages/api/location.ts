import {api} from '../../server/api';
import {z} from 'zod';
import {locationSchema} from '../../schemas/location';
import {createMessage, UserGeoLocationMessage} from '../../server/sqs';
import dayjs from 'dayjs';
import {NextkitException} from 'nextkit';
import {prisma} from '../../server/prisma';

export default api({
	async POST({req, context}) {
		if (context.userId === null) {
			throw new NextkitException(401, 'You are not signed in!');
		}

		// Check that the user has paid
		// Get if the user has paid
		const paid = await prisma.user.findFirst({
			where: {
				paid: true,
				id: context.userId,
			},
		});
		if (!paid) {
			throw new NextkitException(422, 'You must have paid to do that!');
		}

		const {longitude, latitude} = sendLocationSchema.parse(req.body);

		// Construct this into an SQS message
		const sqsPayload: UserGeoLocationMessage = {
			userId: context.userId,
			longitude,
			latitude,
			sentAt: dayjs().toString(),
		};

		await createMessage(sqsPayload);
	},
});

const sendLocationSchema = z.object({
	longitude: locationSchema.longitude,
	latitude: locationSchema.latitude,
});
