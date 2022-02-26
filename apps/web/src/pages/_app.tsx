import React, {useEffect, useRef} from 'react';
import {AppProps} from 'next/app';
import {SWRConfig} from 'swr';
import {fetcher} from '../client/fetcher';
import {Toaster} from 'react-hot-toast';

import 'tailwindcss/tailwind.css';
import {io, Socket} from 'socket.io-client';

export default function App({Component, pageProps}: AppProps) {
	const socketRef = useRef<Socket>(io(`http://localhost:8081`));

	useEffect(() => {
		if (typeof window === 'undefined') {
			return;
		}

		socketRef.current.on('request-authentication', () => {
			socketRef.current.emit('authentication', {
				token: window.localStorage.getItem('realtime-token'),
			});
		});
	}, []);

	return (
		<SWRConfig value={{fetcher}}>
			<Toaster />
			<Component {...pageProps} />
		</SWRConfig>
	);
}
