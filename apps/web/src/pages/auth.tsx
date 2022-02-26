import {InferAPIResponse} from 'nextkit';
import {useState} from 'react';
import {fetcher} from '../client/fetcher';
import type Account from '../pages/api/account';
import toast from 'react-hot-toast';
import {NextkitClientException} from 'nextkit/client';

export default function AuthPage() {
	const [phone, set] = useState('');

	return (
		<div>
			<h1>Continue to geogig</h1>

			<form
				onSubmit={async e => {
					e.preventDefault();

					const promise = fetcher<InferAPIResponse<typeof Account, 'POST'>>(
						'/api/account',
						{
							method: 'POST',
							headers: {'Content-Type': 'application/json'},
							body: JSON.stringify({phone}),
						},
					);

					await toast
						.promise(promise, {
							success: 'Please check your phone for a verification code',
							loading: 'Sending verification code',
							error: (e: NextkitClientException) => `${e.code}: ${e.message}`,
						})
						.catch(() => null);
				}}
			>
				<label>
					<span>Enter your phone number</span>
					<input
						required
						value={phone}
						type="tel"
						onChange={e => {
							set(e.target.value);
						}}
					/>
				</label>
			</form>
		</div>
	);
}
