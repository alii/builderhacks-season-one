import {z} from 'zod';

export const collectionSchema = {
	id: z.string(),
	slug: z.string().min(4).max(128), // .regex(/^[a-z0-9-]+$/),
};
