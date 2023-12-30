import {id} from 'alistair/id';
import {z} from 'zod';
import {userSchema} from '../../../schemas/user';
import {api} from '../../../server/api';
import {redis} from '../../../server/redis';
import {sendSMSMessage} from '../../../server/text-messages';

export default api({
	async POST({req}) {
		const body = z.object({phone: userSchema.phoneNumber}).parse(req.body);

		// Send the 2fa text message
		const authenticationCode = id(6, '0123456789');

		console.log(body.phone.number);

		// Put this in redis
		await redis.set(
			`authcode:${body.phone.number}`,
			authenticationCode,
			'EX',
			120,
		);

		// Send the text message
		console.log(`2FA CODE FOR ${body.phone.number}: ${authenticationCode}`);

		await sendSMSMessage(
			body.phone.number,
			`Your geogig authentication code is: ${authenticationCode}. Expires in 2 minutes.`,
		);
	},
});
