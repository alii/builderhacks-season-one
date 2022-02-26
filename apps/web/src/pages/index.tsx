import Link from 'next/link';

export default function Home() {
	return (
		<div>
			<h1>welcome to geogig</h1>
			<h2>we need a few things from you before we get you started</h2>
			<div className="flex space-x-2 items-center">
				<div>
					<Link href="/login">Already have an account?</Link>
				</div>

				<div>
					<Link href="/signup">Sign up</Link>
				</div>
			</div>
		</div>
	);
}
