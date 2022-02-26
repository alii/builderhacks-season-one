import {z} from 'zod';

export const locationSchema = {
	longitude: z.number(),
	latitude: z.number(),
};
