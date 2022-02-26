import React from 'react';
import {AppProps} from 'next/app';
import {SWRConfig} from 'swr';
import {fetcher} from '../client/fetcher';
import {Toaster} from 'react-hot-toast';

import 'tailwindcss/tailwind.css';

export default function App({Component, pageProps}: AppProps) {
	return (
		<SWRConfig value={{fetcher}}>
			<Toaster />
			<Component {...pageProps} />
		</SWRConfig>
	);
}
