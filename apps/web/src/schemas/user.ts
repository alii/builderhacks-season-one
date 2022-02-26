import {z} from 'zod';

export const userSchema = {
	phoneNumber: z
		.string()
		.min(1)
		.regex(/^\+?[1-9]\d{1,14}$/),
	authCode: z.string().length(6),
};
