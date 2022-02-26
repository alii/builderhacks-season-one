import crypto from 'crypto';
import dayjs from 'dayjs';
import {NextApiRequest} from 'next';
import {NextkitException} from 'nextkit';
import {redis} from './redis';

export const COOKIE_NAME = 'token';

/**
 * Generates a unique session token
 * @returns A string that was generated
 */
async function generateUniqueSessionToken(): Promise<string> {
	const token = crypto.randomBytes(64).toString('hex');
	const existing = await redis.get(`token:${token}`);

	if (typeof existing === 'string') {
		return generateUniqueSessionToken();
	}

	return token;
}

/**
 * Gets a user from a request via redis session
 * @param req The request object
 * @returns The user's id
 */
export async function getSessionFromRequest(req: NextApiRequest) {
	const session = await redis.get(`token:${req.cookies[COOKIE_NAME]}`);

	if (!session) {
		throw new NextkitException(401, 'You are not logged in!');
	}

	return session;
}

export async function createSession(
	userId: string,
): Promise<[token: string, expires: Date]> {
	const token = await generateUniqueSessionToken();
	const expiration = dayjs().add(3, 'days');

	await redis.set(`token:${token}`, userId, 'ex', expiration.diff() * 1000);

	return [token, expiration.toDate()];
}

export async function createRealtimeSession(userId: string): Promise<string> {
	const token = crypto.randomBytes(64).toString('hex');
	await redis.set(
		`realtime-token:${token}`,
		userId,
		'EX',
		dayjs().add(3, 'days').diff() * 1000,
	);

	return token;
}
