import {Wrapper, Status} from '@googlemaps/react-wrapper';
import {Spinner} from './spinner';

import {useEffect, useRef, useState} from 'react';

const apiKey =
	process.env.NEXT_PUBLIC_MAPS_API_KEY ??
	'AIzaSyAraArYVkLFb2koHks3iO1z8lIe85Zyphk';

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

export interface Props {
	center: google.maps.LatLngLiteral;
	zoom: number;
}

export function GoogleMap(props: Props) {
	return (
		<Wrapper apiKey={apiKey} render={render}>
			<Map {...props} />
		</Wrapper>
	);
}

export function Map({center, zoom}: Props) {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!ref.current) {
			return;
		}

		const map = new google.maps.Map(ref.current, {
			center,
			zoom,
		});
	}, [center, zoom]);

	return <div ref={ref} id="bruh" style={{height: 400}} />;
}
