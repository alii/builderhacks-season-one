import {api} from '../../../server/api';
import {z} from 'zod';
import {userSchema} from '../../../schemas/user';
import {redis} from '../../../server/redis';
import {NextkitException} from 'nextkit';
import {prisma} from '../../../server/prisma';
import {snowflake} from '../../../server/snowflake';
import {
	COOKIE_NAME,
	createRealtimeSession,
	createSession,
} from '../../../server/sessions';
import {serialize} from 'cookie';

export default api({
	async POST({req, res}) {
		const {authCode, phone} = authSchema.parse(req.body);

		// Check the auth code in redis
		const redisEntry = await redis.get(`authcode:${phone.number}`);

		if (!redisEntry || redisEntry.trim() !== authCode.trim()) {
			throw new NextkitException(422, 'Unable to find that code!');
		}

		// Find if a user already exists, and if so, return its id.
		// If not, create a new user
		let currentUser = await prisma.user.findFirst({
			where: {
				phone_number: phone.number,
			},
		});

		if (!currentUser) {
			currentUser = await prisma.user.create({
				data: {
					id: snowflake(),
					phone_number: phone.number,
				},
			});
		}

		const [token, expires] = await createSession(currentUser.id);

		res.setHeader(
			'Set-Cookie',
			serialize(COOKIE_NAME, token, {
				httpOnly: true,
				secure: process.env.NODE_ENV !== 'development',
				path: '/',
				expires,
			}),
		);

		// Send pack the realtime status
		const realtimeToken = await createRealtimeSession(currentUser.id);

		// Delete used 2fa code
		await redis.del(`authcode:${phone.number}`);

		return {
			paid: currentUser.paid,
			realtimeToken,
		};
	},
});

const authSchema = z.object({
	phone: userSchema.phoneNumber,
	authCode: userSchema.authCode,
});
