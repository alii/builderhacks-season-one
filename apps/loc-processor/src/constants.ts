import {envsafe, str} from 'envsafe';

export const {AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, SQS_URL} =
	envsafe({
		AWS_REGION: str(),
		AWS_ACCESS_KEY_ID: str(),
		AWS_SECRET_ACCESS_KEY: str(),
		SQS_URL: str(),
	});
