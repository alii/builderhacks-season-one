import {useEffect, useState} from 'react';
import {fetcher} from '../fetcher';
import type PaymentsAPI from '../../pages/api/pay/index';
import {InferAPIResponse} from 'nextkit';

export type PaidState = 'paid' | 'not_paid' | 'loading';

export function usePaid(options?: {refreshPeriod?: number}) {
	const [paid, setPaid] = useState<PaidState>('loading');

	useEffect(() => {
		function getData() {
			fetcher<InferAPIResponse<typeof PaymentsAPI, 'GET'>>(`/api/pay`)
				.then(data => {
					setPaid(data.paid ? 'paid' : 'not_paid');
				})
				.catch(() => null);
		}

		getData();

		if ((options?.refreshPeriod ?? 0) > 0) {
			const interval = setInterval(getData, options!.refreshPeriod! * 1000);
			return () => {
				clearInterval(interval);
			};
		}
	}, [options]);

	return paid;
}
