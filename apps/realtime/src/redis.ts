import IORedis from 'ioredis';
import {env} from './env';
import {SocketPool} from './index';

export const redis = new IORedis(env.REDIS_URL);

const subscriberRedis = redis.duplicate();
subscriberRedis.subscribe(['ticket-claimed'], (err, count) => {
	console.log(`Subscribed to ${count} channels in Redis PubSub`);
});
subscriberRedis.on('message', (channel: string, message: string) => {
	console.log(`[Redis Sub] Channel=${channel}, Message=${message}`);

	switch (channel) {
		case 'ticket-claimed': {
			const payload = JSON.parse(message) as {
				userId: string;
				ticketId: string;
				collectionId: string;
			};

			SocketPool.filter(
				s => s.subscribedToCollection === payload.collectionId,
			).forEach(({socket}) =>
				socket.emit('ticket-claimed', {
					collectionId: payload.collectionId,
				}),
			);

			break;
		}

		default: {
			console.warn(`No handler for channel ${channel}!`);
			break;
		}
	}
});
