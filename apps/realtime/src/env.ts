import dotenv from 'dotenv';
import {envsafe, str} from 'envsafe';
dotenv.config({path: './.env.local'});

export const env = envsafe({
	REDIS_URL: str(),
});
