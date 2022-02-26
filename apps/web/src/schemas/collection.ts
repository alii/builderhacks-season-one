import {z} from 'zod';

export const collectionSchema = {
	slug: z
		.string()
		.min(4)
		.max(18)
		.regex(/^[a-z0-9-]+$/),
};

export const userSchema = {
	email: z.string().email(),
};
