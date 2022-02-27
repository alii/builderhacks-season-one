import {serialize} from 'cookie';
import {api} from '../../server/api';
import {redis} from '../../server/redis';
import {COOKIE_NAME, TokenPrefix} from '../../server/sessions';

export default api({
	async GET({req, res}) {
		const cookie = req.cookies[COOKIE_NAME];

		await redis.del(`${TokenPrefix.USER}:${cookie}`);

		res.setHeader(
			'Set-Cookie',
			serialize(COOKIE_NAME, '', {
				expires: new Date(),
				secure: process.env.NODE_ENV !== 'development',
				httpOnly: true,
				path: '/',
			}),
		);
	},
});
