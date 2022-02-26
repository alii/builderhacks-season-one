import {
	withScriptjs,
	withGoogleMap,
	GoogleMap as GMap,
} from 'react-google-maps';
import React, {ReactNode} from 'react';

const apiKey =
	process.env.NEXT_PUBLIC_MAPS_API_KEY ??
	'AIzaSyAraArYVkLFb2koHks3iO1z8lIe85Zyphk';

export interface Props {
	children: ReactNode;
}

/**
 * @internal
 */
export const ComposableGoogleMap = withScriptjs(
	withGoogleMap<Props>(props => (
		<GMap defaultZoom={8} defaultCenter={{lat: -34.397, lng: 150.644}}>
			{props.children}
		</GMap>
	)),
);

export function GoogleMap(props: Props) {
	return (
		<ComposableGoogleMap
			googleMapURL={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=3.exp&libraries=geometry,drawing,places`}
			loadingElement={<div style={{height: `100%`}} />}
			containerElement={<div style={{height: `400px`}} />}
			mapElement={<div style={{height: `100%`}} />}
			{...props}
		/>
	);
}
