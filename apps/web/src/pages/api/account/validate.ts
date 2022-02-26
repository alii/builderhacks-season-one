import {api} from '../../../server/api';
import {z} from 'zod';
import {userSchema} from '../../../schemas/user';
import {redis} from '../../../server/redis';
import {NextkitException} from 'nextkit';
import {prisma} from '../../../server/prisma';
import {snowflake} from '../../../server/snowflake';

export default api({
	async POST({req}) {
		const {authCode, phone} = authSchema.parse(req.body);

		// Check the auth code in redis
		const redisEntry = await redis.get(`authcode:${phone}`);
		if (!redisEntry || redisEntry.trim() !== authCode.trim()) {
			throw new NextkitException(422, 'Unable to find that code!');
		}

		// Find if a user already exists, and if so, return its id.
		// If not, create a new user
		let currentUser = await prisma.user.findFirst({
			where: {
				phone_number: phone,
			},
		});

		if (!currentUser) {
			currentUser = await prisma.user.create({
				data: {
					id: snowflake(),
					phone_number: phone,
				},
			});
		}

		return {
			token: 'yourmother',
			userId: currentUser.id,
		};
	},
});

const authSchema = z.object({
	phone: userSchema.phoneNumber,
	authCode: userSchema.authCode,
});
