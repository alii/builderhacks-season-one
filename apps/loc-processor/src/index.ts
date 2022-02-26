import {getMessage, markMessageComplete} from './sqs';

async function start() {
	const message = await getMessage();

	// TODO: Get the geo data from the message

	await markMessageComplete(message);
}

(async () => start())();
