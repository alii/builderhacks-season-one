import {useRouter} from 'next/router';
import {useEffect} from 'react';
import {usePaid} from '../../client/hooks/usePaid';

export default function PaymentSuccess() {
	const paid = usePaid({
		refreshPeriod: 5,
	});
	const router = useRouter();

	useEffect(() => {
		if (paid === 'paid') {
			void router.push(`/home`);
		}
	}, [paid, router]);

	return (
		<div className="mx-auto max-w-7xl px-4 py-12">
			<h1>Thanks!</h1>
			<h1>
				Hold tight, we're just confirming that payment - this should only take a
				few seconds...
			</h1>
		</div>
	);
}
