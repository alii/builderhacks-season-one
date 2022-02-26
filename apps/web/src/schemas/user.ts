import {z} from 'zod';
import parsePhoneNumber, {PhoneNumber} from 'libphonenumber-js';

export const userSchema = {
	phoneNumber: z
		.string()
		.min(1)
		.transform(str => parsePhoneNumber(str))
		.refine((value): value is PhoneNumber => Boolean(value)),
	authCode: z.string().length(6),
};
