import {NextkitException} from 'nextkit';
import {api} from '../../server/api';
import {prisma} from '../../server/prisma';
import {stripe} from '../../server/stripe';
import {env} from '../../server/env';

export default api({
	async POST({context}) {
		if (!context.userId) {
			throw new NextkitException(401, 'You are not signed in!');
		}

		// Check if this user has paid
		const userPaidStatus = await prisma.user.findFirst({
			where: {
				id: context.userId,
			},
			select: {
				paid: true,
			},
		});

		if (userPaidStatus?.paid) {
			throw new NextkitException(422, 'You have already paid!');
		}

		// Send them a checkout link
		const session = await stripe.checkout.sessions.create({
			metadata: {
				userId: context.userId,
			},
			line_items: [
				{
					quantity: 1,
					price_data: {
						product_data: {
							images: [
								'https://pbs.twimg.com/profile_images/1484426337699909638/7okkW-p9_400x400.jpg',
							],
							name: 'Geogig access',
							description:
								'Gain access to Geogig. The money you pay will be used to purchase the concert tickets.',
						},
						unit_amount: 500, // $5 USD
						currency: 'USD',
					},
				},
			],
			payment_method_types: ['card'],
			success_url: `${env.SERVER_BASE_URL}/payment/success`,
			cancel_url: `${env.SERVER_BASE_URL}/payment/failure`,
			mode: 'payment',
		});

		return {
			url: session.url,
		};
	},
});
