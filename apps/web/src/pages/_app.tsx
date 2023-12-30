import 'tailwindcss/tailwind.css';
import '../client/styles/global.css';

import {Menu, Transition} from '@headlessui/react';
import clsx from 'clsx';
import {AppProps} from 'next/app';
import Link from 'next/link';
import {useRouter} from 'next/router';
import {Fragment, useEffect} from 'react';
import toast, {Toaster} from 'react-hot-toast';
import {SWRConfig} from 'swr';
import {fetcher} from '../client/fetcher';
import {useMe} from '../client/hooks/use-user';

// Paths that do NOT require a user to be logged in
const PUBLIC_PATHS = ['/', '/auth'];

function Navbar() {
	const {data: user, mutate} = useMe();
	const router = useRouter();

	return (
		<nav className="h-16 flex items-center px-8 bg-neutral-900 text-white justify-between">
			<div className="space-x-8 flex items-center">
				<Link href="/">
					<h2 className="text-3xl uppercase tracking-tighter font-black select-none">
						geogig.
					</h2>
				</Link>

				{user && (
					<div className="flex space-x-2">
						<NavLink href="/home">Home</NavLink>
						<NavLink href="/inventory">My Tickets</NavLink>
					</div>
				)}
			</div>

			{user && (
				<Menu as="div" className="relative inline-block text-left">
					<div>
						<Menu.Button className="outline-none focus:outline-none inline-flex items-center space-x-2 justify-center w-full px-4 py-0.5 rounded-lg text-sm font-medium text-white hover:bg-neutral-600 bg-opacity-20 hover:bg-opacity-30 focus:ring-1 focus:ring-indigo-500">
							<span>{user.phone_number}</span>

							<img
								className="bg-white rounded-full object-cover h-12 w-12"
								src={`https://robohash.org/${user.id}`}
								alt=""
							/>
						</Menu.Button>
					</div>

					<Transition
						as={Fragment}
						enter="transition ease-out duration-100"
						enterFrom="transform opacity-0 scale-95"
						enterTo="transform opacity-100 scale-100"
						leave="transition ease-in duration-75"
						leaveFrom="transform opacity-100 scale-100"
						leaveTo="transform opacity-0 scale-95"
					>
						<Menu.Items className="absolute z-30 right-0 w-56 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
							<div className="px-1 py-1">
								<Menu.Item>
									{({active}) => (
										<button
											type="button"
											className={`${
												active ? 'bg-violet-500 text-white' : 'text-gray-900'
											} group flex rounded-md items-center w-full px-2 py-2 text-sm`}
											onClick={async () => {
												const promise = fetcher('/api/logout');

												await toast
													.promise(promise, {
														loading: 'Logging out...',
														success: 'Logged out',
														error: 'Error logging out',
													})
													.catch(() => null);

												await mutate(null);
												await router.push('/');
											}}
										>
											Logout
										</button>
									)}
								</Menu.Item>
							</div>
						</Menu.Items>
					</Transition>
				</Menu>
			)}
		</nav>
	);
}

function NavLink({href, children}: {children: string; href: string}) {
	const router = useRouter();

	return (
		<Link
			href={href}
			className={clsx(
				'focus:outline-none ring-2 ring-transparent focus:ring-2 focus:ring-indigo-500 block px-3 uppercase text-sm tracking-tighter font-semibold py-2 transition-all duration-200 rounded-md',
				router.asPath === href
					? 'bg-gradient-to-tr from-indigo-500/25 to-indigo-500/10 text-indigo-500'
					: 'text-neutral-400',
			)}
		>
			{children}
		</Link>
	);
}

function Main({Component, pageProps}: AppProps) {
	const {data: user, error} = useMe();
	const router = useRouter();

	useEffect(() => {
		if (
			!user &&
			error?.code === 401 &&
			!PUBLIC_PATHS.includes(router.pathname)
		) {
			void router.push('/auth');
		}
	}, [user, error, router]);

	return (
		<main>
			<Component {...pageProps} />
		</main>
	);
}

export default function App(props: AppProps) {
	return (
		<SWRConfig value={{fetcher}}>
			<Toaster />
			<Navbar />
			<Main {...props} />
		</SWRConfig>
	);
}
