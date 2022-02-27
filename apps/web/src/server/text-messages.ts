import aws from 'aws-sdk';
import {env} from './env';

const SNS = new aws.SNS({
	region: env.AWS_SNS_REGION,
	credentials: {
		accessKeyId: env.AWS_SNS_ACCESS_KEY_ID,
		secretAccessKey: env.AWS_SNS_SECRET_ACCESS_KEY,
	},
});

export async function sendSMSMessage(number: string, content: string) {
	await SNS.publish({
		Message: content,
		PhoneNumber: number,
		MessageAttributes: {
			'AWS.SNS.SMS.SenderID': {
				DataType: 'String',
				StringValue: 'geogig',
			},
			'AWS.SNS.SMS.SMSType': {
				DataType: 'String',
				StringValue: 'Transactional',
			},
		},
	}).promise();
}
