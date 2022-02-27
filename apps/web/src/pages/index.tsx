import Link from 'next/link';
import {DotDisplay} from '../client/components/dotdisplay';

export default function Home() {
	return (
		<div className="bg-zinc-800 min-h-[calc(100vh-4rem)]">
			<div className="absolute z-0 w-full h-[calc(100vh-4rem)]">
				<DotDisplay />
			</div>
			<div className="z-1 absolute w-full">
				<div className="mx-auto max-w-7xl px-4 pt-5">
					<h1 className="text-center text-6xl font-black uppercase text-white py-20">
						Hunt for concert tickets in geographical regions
					</h1>

					<div className="flex justify-center mb-14">
						<div>
							<Link href="/auth">
								<a className="text-white bg-indigo-600 p-5 rounded-md">
									Continue with phone number &rarr;
								</a>
							</Link>
						</div>
					</div>

					<img
						src="https://media.discordapp.net/attachments/947139212426244206/947275072018731048/unknown.png?width=1432&height=936"
						alt="example image"
					/>

					<p className="text-center text-gray-400">
						Made by Scott Hiett & Alistair Smith
					</p>
					<a href="https://github.com/alii/builderhacks-season-one">
						<p className="text-center text-indigo-400 pt-1 pb-5">
							Read the source code on GitHub &rarr;
						</p>
					</a>
				</div>
			</div>
		</div>
	);
}
