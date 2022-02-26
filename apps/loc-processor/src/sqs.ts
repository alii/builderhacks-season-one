import aws from 'aws-sdk';
import {env} from './constants';

const SQS = new aws.SQS({
	credentials: {
		accessKeyId: env.AWS_ACCESS_KEY_ID,
		secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
	},
	region: env.AWS_REGION,
});

export async function getMessage(): Promise<aws.SQS.Message> {
	const messages = await SQS.receiveMessage({
		QueueUrl: env.SQS_URL,
		WaitTimeSeconds: 20,
		MaxNumberOfMessages: 1,
	}).promise();

	if (!messages.Messages || !messages.Messages.length) {
		return getMessage();
	}

	return messages.Messages[0];
}

export async function markMessageComplete(message: aws.SQS.Message) {
	const {ReceiptHandle} = message;

	if (!ReceiptHandle) {
		throw new Error('Message missing receipt handle, cannot delete!');
	}

	await SQS.deleteMessage({
		QueueUrl: env.SQS_URL,
		ReceiptHandle,
	}).promise();
}
