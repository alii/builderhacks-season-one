import {api} from '../../server/api';
import {z} from 'zod';
import {locationSchema} from '../../schemas/location';

export default api({
	async POST({req}) {
		const body = sendLocationSchema.parse(req.body);

		// Construct this into an SQS message
		const sqsPayload: UserGeoLocationMessage = {
			userId: '123123', // TODO: carry through user id,
		};
	},
});

interface UserGeoLocationMessage {
	userId: string;
	latitude: number;
	longitude: number;
	sentAt: string;
}

const sendLocationSchema = z.object({
	longitude: locationSchema.longitude,
	latitude: locationSchema.latitude,
});
