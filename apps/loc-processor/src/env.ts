import dotenv from 'dotenv';
import {envsafe, str} from 'envsafe';
dotenv.config({path: './.env.local'});

export const env = envsafe({
	AWS_REGION: str(),
	AWS_ACCESS_KEY_ID: str(),
	AWS_SECRET_ACCESS_KEY: str(),
	SQS_URL: str(),
	REDIS_URL: str(),
});
