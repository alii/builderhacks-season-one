import React from 'react';
import {AppProps} from 'next/app';
import useSWR, {SWRConfig} from 'swr';
import {fetcher} from '../client/fetcher';
import {Toaster} from 'react-hot-toast';
import {NextkitClientException} from 'nextkit/client';
import {InferAPIResponse} from 'nextkit';

import Link from 'next/link';
import {useRouter} from 'next/router';
import clsx from 'clsx';

import type UserAtMe from './api/users/@me';

import '../client/styles/global.css';
import 'react-tippy/dist/tippy.css';
import 'tailwindcss/tailwind.css';

function Navbar() {
	const {data: user} = useSWR<
		InferAPIResponse<typeof UserAtMe, 'GET'>,
		NextkitClientException
	>('/api/users/@me');

	return (
		<nav className="h-16 flex items-center px-8 bg-neutral-900 text-white space-x-8">
			<h2 className="text-3xl uppercase tracking-tighter font-black select-none">
				geogig.
			</h2>

			{user && (
				<div className="flex space-x-2">
					<NavLink href="/home">Home</NavLink>
					<NavLink href="/inventory">My Tickets</NavLink>
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
					'block px-3 py-2 transition-all duration-200 rounded-md',
					router.asPath === href
						? 'bg-gradient-to-tr from-indigo-500/25 to-indigo-500/10 text-indigo-500'
						: 'text-white',
				)}
			>
				{children}
			</a>
		</Link>
	);
}

export default function App({Component, pageProps}: AppProps) {
	return (
		<SWRConfig value={{fetcher}}>
			<Toaster />

			<Navbar />

			<main>
				<Component {...pageProps} />
			</main>
		</SWRConfig>
	);
}
