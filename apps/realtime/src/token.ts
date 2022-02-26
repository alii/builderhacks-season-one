import {redis} from './redis';

export async function getRealtimeToken(token: string): Promise<string | null> {
	return redis.get(`realtime-token:${token}`);
}
