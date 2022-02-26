import Link from 'next/link';
import {Marker} from 'react-google-maps';
import {GoogleMap} from '../client/components/map';

export default function Home() {
	return (
		<div>
			<h1>welcome to geogig</h1>
			<h2>we need a few things from you before we get you started</h2>

			<div className="flex space-x-2 items-center">
				<div>
					<Link href="/login">Login</Link>
				</div>

				<div>
					<Link href="/signup">Sign up</Link>
				</div>
			</div>

			<GoogleMap>
				<Marker
					position={{
						lat: 51.750032,
						lng: -1.974938,
					}}
				/>
			</GoogleMap>
		</div>
	);
}
