import crypto from 'crypto';
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
	const session = await redis.get(`session:${req.cookies[COOKIE_NAME]}`);

	if (!session) {
		throw new NextkitException(401, 'You are not logged in!');
	}

	return session;
}

export async function createSession(userId: string): Promise<string> {
	const token = await generateUniqueSessionToken();
	await redis.set(`token:${token}`, userId);
	return token;
}