import {z} from 'zod';

export const collectionSchema = {
	slug: z.string().min(4).max(128), // .regex(/^[a-z0-9-]+$/),
};
