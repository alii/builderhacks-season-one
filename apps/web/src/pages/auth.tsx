import {InferAPIResponse} from 'nextkit';
import {useState} from 'react';
import {fetcher} from '../client/fetcher';
import type Account from '../pages/api/account';
import type AccountValidate from '../pages/api/account/validate';
import toast from 'react-hot-toast';
import {NextkitClientException} from 'nextkit/client';

export default function AuthPage() {
	const [phone, set] = useState('');
	const [submittedPhone, setSubmittedPhone] = useState(false);
	const [authCode, setAuthCode] = useState('');

	return (
		<div>
			<h1>Continue to geogig</h1>

			{submittedPhone ? (
				<form
					onSubmit={async e => {
						e.preventDefault();

						const promise = fetcher<
							InferAPIResponse<typeof AccountValidate, 'POST'>
						>('/api/account/validate', {
							method: 'POST',
							headers: {'Content-Type': 'application/json'},
							body: JSON.stringify({phone, authCode}),
						});

						const res = await toast
							.promise(promise, {
								success: "BOOOM you're logged in baby!",
								loading: 'Checking...',
								error: (e: NextkitClientException) => `${e.code}: ${e.message}`,
							})
							.catch(() => null);

						if (res) {
							console.log('setting local token');
							window.localStorage.setItem('realtime-token', res.realtimeToken);

							if (!res.paid) {
								// Trigger payments flow
							}
						}
					}}
				>
					<label>
						<span>Enter your auth code</span>
						<input
							required
							value={authCode}
							type="text"
							onChange={e => {
								setAuthCode(e.target.value);
							}}
						/>
					</label>
				</form>
			) : (
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

						setSubmittedPhone(true);
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
			)}
		</div>
	);
}
