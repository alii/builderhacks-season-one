import 'dotenv/config';

import {envsafe, str} from 'envsafe';

export const env = envsafe({
	AWS_SQS_REGION: str(),
	AWS_SQS_ACCESS_KEY_ID: str(),
	AWS_SQS_SECRET_ACCESS_KEY: str(),
	SQS_URL: str(),
	REDIS_URL: str(),

	AWS_SNS_REGION: str(),
	AWS_SNS_ACCESS_KEY_ID: str(),
	AWS_SNS_SECRET_ACCESS_KEY: str(),
});
