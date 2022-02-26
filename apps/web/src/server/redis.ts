import IORedis from 'ioredis';
import {env} from './env';

export const redis = new IORedis(env.REDIS_URL);

const subscriberRedis = redis.duplicate();
subscriberRedis.subscribe(['ticket-claimed'], (err, count) => {
	console.log(`Subscribed to ${count} channels in Redis PubSub`);
});
subscriberRedis.on('message', (channel: string, message: string) => {
	console.log(`[Redis] Channel=${channel}, Message=${message}`);
});
