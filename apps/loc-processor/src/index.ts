import {getMessage, markMessageComplete} from './sqs';
import {UserGeoLocationMessage} from './types';

async function runIteration() {
	try {
		console.log('Finding message...');

		const message = await getMessage();
		console.log('Message found! Processing it...');

		if (!message.Body) {
			throw new Error('Unable to find body!');
		}

		const messageData = JSON.parse(message.Body) as UserGeoLocationMessage;
		console.log(messageData);

		console.log('All done, cleaning up...');
		await markMessageComplete(message);
	} catch (e: unknown) {
		console.error('Failed to process geo message', e);
	} finally {
		void runIteration();
	}
}

(async () => runIteration())();
