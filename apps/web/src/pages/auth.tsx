import {InferAPIResponse} from 'nextkit';
import {useState} from 'react';
import {fetcher} from '../client/fetcher';
import type Account from '../pages/api/account';
import type AccountValidate from '../pages/api/account/validate';
import toast from 'react-hot-toast';
import {NextkitClientException} from 'nextkit/client';
import {useRouter} from 'next/router';
import {useMe} from '../client/hooks/use-user';

export default function AuthPage() {
	const [phone, set] = useState('');
	const [submittedPhone, setSubmittedPhone] = useState(false);
	const [authCode, setAuthCode] = useState('');
	const router = useRouter();

	const {mutate} = useMe();

	return (
		<div className="mx-auto max-w-7xl px-4 pt-5">
			<h1 className="text-center text-4xl font-bold mt-5">
				Continue to geogig
			</h1>

			{submittedPhone ? (
				<form
					className="flex flex-col"
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

						if (!res) {
							return;
						}

						window.localStorage.setItem('realtime-token', res.realtimeToken);

						await mutate(res.user);
						void router.push('/home');
					}}
				>
					<label>
						<span>Enter your auth code</span>
					</label>
					<input
						required
						value={authCode}
						type="text"
						onChange={e => {
							setAuthCode(e.target.value);
						}}
					/>
					<button type="submit" className="mt-5">
						Log me in &rarr;
					</button>
				</form>
			) : (
				<form
					className="flex flex-col"
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
					</label>
					<input
						required
						value={phone}
						type="tel"
						onChange={e => {
							set(e.target.value);
						}}
					/>
					<button type="submit" className="mt-5">
						Next &rarr;
					</button>
				</form>
			)}
		</div>
	);
}
