import {envsafe, str} from 'envsafe';

export const env = envsafe({
	DISCORD_CLIENT_ID: str({
		desc: 'Discord client ID',
	}),

	DISCORD_BOT_TOKEN: str({
		desc: 'Discord bot token',
	}),

	DISCORD_CLIENT_SECRET: str({
		desc: 'Discord client secret',
	}),
});
