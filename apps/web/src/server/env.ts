import {envsafe, str} from 'envsafe';

export const env = envsafe({
	REDIS_URL: str({
		desc: 'Redis connection string',
	}),

	// Not actually needed inside the app,
	// but useful to force it to exist
	DATABASE_URL: str({
		desc: 'Database connection string',
		devDefault: 'postgres://postgres:postgres@localhost:5432/postgres',
	}),
});