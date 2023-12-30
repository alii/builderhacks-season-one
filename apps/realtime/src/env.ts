import 'dotenv/config';

import {envsafe, str} from 'envsafe';

export const env = envsafe({
	REDIS_URL: str(),
});
