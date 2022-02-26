import {envsafe, str, url} from 'envsafe';

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

	AWS_REGION: str(),
	AWS_ACCESS_KEY_ID: str(),
	AWS_SECRET_ACCESS_KEY: str(),
	SQS_URL: str(),

	STRIPE_SECRET_KEY: str(),

	SERVER_BASE_URL: url({
		devDefault: 'http://localhost:3000',
	}),
});
