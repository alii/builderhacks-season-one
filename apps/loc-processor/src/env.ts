import {envsafe, str} from 'envsafe';

export const env = envsafe({
	AWS_REGION: str(),
	AWS_ACCESS_KEY_ID: str(),
	AWS_SECRET_ACCESS_KEY: str(),
	SQS_URL: str(),
});
