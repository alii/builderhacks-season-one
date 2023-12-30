import aws from 'aws-sdk';
import {randomUUID} from 'crypto';
import {env} from './env';

const SQS = new aws.SQS({
	credentials: {
		accessKeyId: env.AWS_SQS_ACCESS_KEY_ID,
		secretAccessKey: env.AWS_SQS_SECRET_ACCESS_KEY,
	},
	region: env.AWS_SQS_REGION,
});

export interface UserGeoLocationMessage {
	userId: string;
	latitude: number;
	longitude: number;
	sentAt: string;
}

export async function createMessage(payload: UserGeoLocationMessage) {
	await SQS.sendMessage({
		QueueUrl: env.SQS_URL,
		MessageBody: JSON.stringify(payload),
		MessageDeduplicationId: randomUUID(),
		MessageGroupId: randomUUID(),
	}).promise();
}
