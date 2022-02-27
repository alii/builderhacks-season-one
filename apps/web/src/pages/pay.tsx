import {InferAPIResponse} from 'nextkit';
import {fetcher} from '../client/fetcher';
import type PaymentAPI from './api/pay';
import {useEffect, useState} from 'react';
import {usePaid} from '../client/hooks/usePaid';
import {useRouter} from 'next/router';

export default function Pay() {
	const [loading, setLoading] = useState(false);
	const paidState = usePaid();
	const router = useRouter();

	useEffect(() => {
		if (paidState === 'paid') {
			void router.push('/home');
		}
	}, [paidState, router]);

	async function handlePay() {
		if (loading) {
			return;
		}

		setLoading(true);
		const url = await fetcher<InferAPIResponse<typeof PaymentAPI, 'POST'>>(
			'/api/pay',
			{
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify({}),
			},
		).catch(() => {
			setLoading(false);
		});
		if (url) {
			window.location.href = url;
		}
	}

	return (
		<div className="mx-auto max-w-7xl px-4 py-12">
			{paidState === 'loading' ? (
				<h1>Loading...</h1>
			) : (
				<>
					<h1>To use Geogig, you must pay the $5 entry fee.</h1>
					<p>
						This entry fee goes into a pool of money that is used to pay for the
						concert tickets.
					</p>

					<button
						className="mt-10"
						type="button"
						onClick={() => {
							void handlePay();
						}}
					>
						{loading ? 'Loading...' : 'Pay Now'} &rarr;
					</button>
				</>
			)}
		</div>
	);
}
