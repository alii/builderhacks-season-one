import React, {useEffect} from 'react';
import {AppProps} from 'next/app';
import {SWRConfig} from 'swr';
import {fetcher} from '../client/fetcher';
import {Toaster} from 'react-hot-toast';

import Link from 'next/link';
import {useRouter} from 'next/router';
import clsx from 'clsx';

import '../client/styles/global.css';
import 'react-tippy/dist/tippy.css';
import 'tailwindcss/tailwind.css';
import {useMe} from '../client/hooks/use-user';

// Paths that do NOT require a user to be logged in
const PUBLIC_PATHS = ['/', '/auth'];

function Navbar() {
	const {data: user} = useMe();

	return (
		<nav className="h-16 flex items-center px-8 bg-neutral-900 text-white justify-between">
			<div className="space-x-8 flex items-center">
				<h2 className="text-3xl uppercase tracking-tighter font-black select-none">
					geogig.
				</h2>

				{user && (
					<div className="flex space-x-2">
						<NavLink href="/home">Home</NavLink>
						<NavLink href="/inventory">My Tickets</NavLink>
					</div>
				)}
			</div>

			{user && (
				<div className="flex space-x-2 items-center">
					<p>{user.phone_number}</p>

					<img
						className="bg-white rounded-full object-cover h-12 w-12"
						src={`https://robohash.org/${user.id}`}
						alt=""
					/>
				</div>
			)}
		</nav>
	);
}

function NavLink({href, children}: {children: string; href: string}) {
	const router = useRouter();

	return (
		<Link href={href}>
			<a
				className={clsx(
					'block px-3 uppercase text-sm tracking-tighter font-semibold py-2 transition-all duration-200 rounded-md',
					router.asPath === href
						? 'bg-gradient-to-tr from-indigo-500/25 to-indigo-500/10 text-indigo-500'
						: 'text-neutral-400',
				)}
			>
				{children}
			</a>
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
