import {config} from 'dotenv';

import {envsafe, str} from 'envsafe';

config({path: '.env.local'});

export const env = envsafe({
	REDIS_URL: str(),
});
