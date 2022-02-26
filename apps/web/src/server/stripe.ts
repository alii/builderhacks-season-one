import StripeApi from 'stripe';
import {env} from './env';

export const stripe = new StripeApi(env.STRIPE_SECRET_KEY, {
	apiVersion: '2020-08-27',
});
