import {
	withScriptjs,
	withGoogleMap,
	GoogleMap as GMap,
	Marker,
} from 'react-google-maps';
import React from 'react';

const apiKey =
	process.env.NEXT_PUBLIC_MAPS_API_KEY ??
	'AIzaSyAraArYVkLFb2koHks3iO1z8lIe85Zyphk';

export interface Props {
	isMarkerShown: boolean;
}

export const ComposableGoogleMap = withScriptjs(
	withGoogleMap<Props>(props => (
		<GMap defaultZoom={8} defaultCenter={{lat: -34.397, lng: 150.644}}>
			{props.isMarkerShown && (
				<Marker position={{lat: -34.397, lng: 150.644}} />
			)}
		</GMap>
	)),
);

export function GoogleMap() {
	return <ComposableGoogleMap />;
}
