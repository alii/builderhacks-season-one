import {Wrapper, Status} from '@googlemaps/react-wrapper';
import {Spinner} from './spinner';

import {Loader} from '@googlemaps/js-api-loader';
import {useEffect, useRef, useState} from 'react';

const loader = new Loader({
	apiKey: '',
	version: 'weekly',
	libraries: ['places'],
});

export function useGoogleMaps<T extends HTMLElement = HTMLElement>(
	options?: google.maps.MapOptions,
) {
	const [map, setMap] = useState<google.maps.Map<T> | null>(null);

	const ref = useRef<T>(null);

	useEffect(() => {
		if (!ref.current) {
			return;
		}

		void loader.loadPromise().then(google => {
			if (!ref.current) {
				throw new Error('Tried to attach map to null ref');
			}

			const map = new google.maps.Map(ref.current, options);

			setMap(map);
		});
	}, [options]);

	return [ref, map] as const;
}

const render = (status: Status) => {
	switch (status) {
		case Status.LOADING:
			return <Spinner />;

		case Status.FAILURE:
			return <ErrorComponent />;

		case Status.SUCCESS:
			return <MyMapComponent />;

		default:
			throw new Error('Unknown status');
	}
};

export function GoogleMaps() {
	return <Wrapper apiKey="YOUR_API_KEY" render={render} />;
}
