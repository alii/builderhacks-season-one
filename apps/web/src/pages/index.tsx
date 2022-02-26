import Link from 'next/link';

export default function Home() {
	return (
		<div>
			<h1>welcome to geogig</h1>
			<h2>we need a few things from you before we get you started</h2>

			<div className="flex space-x-2 items-center">
				<div>
					<Link href="/auth">
						<a className="text-indigo-500">Continue with phone number</a>
					</Link>
				</div>
			</div>
		</div>
	);
}
