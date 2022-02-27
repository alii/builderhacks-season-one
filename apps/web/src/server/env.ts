import {envsafe, str, url} from 'envsafe';

export const env = envsafe({
	REDIS_URL: str({
		desc: 'Redis connection string',
	}),

	AWS_REGION: str(),
	AWS_ACCESS_KEY_ID: str(),
	AWS_SECRET_ACCESS_KEY: str(),
	SQS_URL: str(),

	STRIPE_SECRET_KEY: str(),

	SERVER_BASE_URL: url({
		devDefault: 'http://localhost:3000',
	}),

	STRIPE_WEBHOOK_SIGNATURE: str(),
});
