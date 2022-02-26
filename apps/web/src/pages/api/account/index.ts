import {api} from '../../../server/api';
import {userSchema} from '../../../schemas/user';
import {z} from 'zod';
import {id} from 'alistair/id';
import {redis} from '../../../server/redis';

export default api({
	async POST({req}) {
		const body = schema.parse(req.body);

		// Send the 2fa text message
		const authenticationCode = id(6, '0123456789');

		// Put this in redis
		await redis.set(`authcode:${body.phone}`, authenticationCode, 'EX', 120);

		// Send the text message
		console.log(`2FA CODE FOR ${body.phone}: ${authenticationCode}`);

		// TODO: send a text message
	},
});

const schema = z.object({
	phone: userSchema.phoneNumber,
});
