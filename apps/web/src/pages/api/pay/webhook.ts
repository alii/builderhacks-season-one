import {PageConfig} from 'next';
import {NextkitException} from 'nextkit';
import {api} from '../../../server/api';
import {env} from '../../../server/env';
import {prisma} from '../../../server/prisma';
import {stripe} from '../../../server/stripe';

export const config: PageConfig = {
	api: {
		bodyParser: false,
	},
};

export default api({
	async POST({req}) {
		// Webhook signature verification
		const stripeSignatureHeader = req.headers['stripe-signature'];
		if (!stripeSignatureHeader) {
			return new NextkitException(422, 'Signature is not present!');
		}

		const body = await new Promise<string | null>(res => {
			let body = '';

			req.on('data', (chunk: string) => {
				body += chunk;
			});

			req.on('end', () => {
				res(body);
			});

			req.on('error', () => {
				res(null);
			});
		});

		if (!body) {
			throw new NextkitException(500, 'Failed to read body!');
		}

		const event = await stripe.webhooks.constructEventAsync(
			body,
			stripeSignatureHeader,
			env.STRIPE_WEBHOOK_SIGNATURE,
		);

		if (event.type === 'checkout.session.completed') {
			const {userId} = (
				event.data.object as {metadata: {userId: string | undefined}}
			).metadata;

			if (!userId) {
				throw new NextkitException(
					400,
					'No userId specified - invocation was possibly created with the Stripe CLI (this is currently unsupported without specifying the userId',
				);
			}

			// Update this user data
			console.log(`${userId} Paid!!!`);

			await prisma.user.update({
				where: {
					id: userId,
				},
				data: {
					paid: true,
				},
			});
		}
	},
});
