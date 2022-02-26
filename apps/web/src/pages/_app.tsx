import React from 'react';
import {AppProps} from 'next/app';
import {SWRConfig} from 'swr';
import {fetcher} from '../client/fetcher';
import {Toaster} from 'react-hot-toast';

import '../client/styles/global.css';
import 'tailwindcss/tailwind.css';

export default function App({Component, pageProps}: AppProps) {
	return (
		<SWRConfig value={{fetcher}}>
			<Toaster />

			<nav className="h-16 flex items-center px-8 bg-neutral-900 text-white">
				<h2 className="text-3xl uppercase tracking-tighter font-black select-none">
					geogig.
				</h2>
			</nav>

			<main>
				<Component {...pageProps} />
			</main>
		</SWRConfig>
	);
}
