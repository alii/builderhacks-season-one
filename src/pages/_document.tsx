import React from 'react';
import Document, {Head, Html, Main, NextScript} from 'next/document';

export default class BuilderhacksDocument extends Document {
	render() {
		return (
			<Html lang="en">
				<Head>
					<meta charSet="utf-8" />
					<meta name="theme-color" content="#ffffff" />
					<link rel="preconnect" href="https://fonts.gstatic.com" />
					<link
						href="https://fonts.googleapis.com/css2?family=Krona+One&family=Roboto:wght@400;700&display=swap"
						rel="stylesheet"
					/>
				</Head>
				<body>
					<Main />
					<NextScript />
				</body>
			</Html>
		);
	}
}
