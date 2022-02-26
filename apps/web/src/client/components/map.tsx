import {
	withScriptjs,
	withGoogleMap,
	GoogleMap as GMap,
	GoogleMapProps,
} from 'react-google-maps';
import React, {ReactNode} from 'react';

const apiKey =
	process.env.NEXT_PUBLIC_MAPS_API_KEY ??
	'AIzaSyAraArYVkLFb2koHks3iO1z8lIe85Zyphk';

export interface Props extends GoogleMapProps {
	children: ReactNode;
}

/**
 * @internal
 */
export const ComposableGoogleMap = withScriptjs(
	withGoogleMap<Props>(props => (
		<GMap
			options={{
				backgroundColor: '#333333',
				disableDefaultUI: true,
				styles: [
					{
						featureType: 'all',
						elementType: 'labels.text.fill',
						stylers: [
							{
								saturation: 36,
							},
							{
								color: '#000000',
							},
							{
								lightness: 40,
							},
						],
					},
					{
						featureType: 'all',
						elementType: 'labels.text.stroke',
						stylers: [
							{
								visibility: 'on',
							},
							{
								color: '#000000',
							},
							{
								lightness: 16,
							},
						],
					},
					{
						featureType: 'all',
						elementType: 'labels.icon',
						stylers: [
							{
								visibility: 'off',
							},
						],
					},
					{
						featureType: 'administrative',
						elementType: 'geometry.fill',
						stylers: [
							{
								color: '#000000',
							},
							{
								lightness: 20,
							},
						],
					},
					{
						featureType: 'administrative',
						elementType: 'geometry.stroke',
						stylers: [
							{
								color: '#000000',
							},
							{
								lightness: 17,
							},
							{
								weight: 1.2,
							},
						],
					},
					{
						featureType: 'administrative',
						elementType: 'labels',
						stylers: [
							{
								visibility: 'off',
							},
						],
					},
					{
						featureType: 'administrative.country',
						elementType: 'all',
						stylers: [
							{
								visibility: 'simplified',
							},
						],
					},
					{
						featureType: 'administrative.country',
						elementType: 'geometry',
						stylers: [
							{
								visibility: 'simplified',
							},
						],
					},
					{
						featureType: 'administrative.country',
						elementType: 'labels.text',
						stylers: [
							{
								visibility: 'simplified',
							},
						],
					},
					{
						featureType: 'administrative.province',
						elementType: 'all',
						stylers: [
							{
								visibility: 'off',
							},
						],
					},
					{
						featureType: 'administrative.locality',
						elementType: 'all',
						stylers: [
							{
								visibility: 'simplified',
							},
							{
								saturation: -100,
							},
							{
								lightness: 30,
							},
						],
					},
					{
						featureType: 'administrative.neighborhood',
						elementType: 'all',
						stylers: [
							{
								visibility: 'off',
							},
						],
					},
					{
						featureType: 'administrative.land_parcel',
						elementType: 'all',
						stylers: [
							{
								visibility: 'off',
							},
						],
					},
					{
						featureType: 'landscape',
						elementType: 'all',
						stylers: [
							{
								visibility: 'simplified',
							},
							{
								gamma: 0.0,
							},
							{
								lightness: 74,
							},
						],
					},
					{
						featureType: 'landscape',
						elementType: 'geometry',
						stylers: [
							{
								color: '#000000',
							},
							{
								lightness: 20,
							},
						],
					},
					{
						featureType: 'landscape.man_made',
						elementType: 'all',
						stylers: [
							{
								lightness: 3,
							},
						],
					},
					{
						featureType: 'poi',
						elementType: 'all',
						stylers: [
							{
								visibility: 'off',
							},
						],
					},
					{
						featureType: 'poi',
						elementType: 'geometry',
						stylers: [
							{
								color: '#000000',
							},
							{
								lightness: 21,
							},
						],
					},
					{
						featureType: 'road',
						elementType: 'geometry',
						stylers: [
							{
								visibility: 'simplified',
							},
						],
					},
					{
						featureType: 'road.highway',
						elementType: 'geometry.fill',
						stylers: [
							{
								color: '#000000',
							},
							{
								lightness: 17,
							},
						],
					},
					{
						featureType: 'road.highway',
						elementType: 'geometry.stroke',
						stylers: [
							{
								color: '#000000',
							},
							{
								lightness: 29,
							},
							{
								weight: 0.2,
							},
						],
					},
					{
						featureType: 'road.arterial',
						elementType: 'geometry',
						stylers: [
							{
								color: '#000000',
							},
							{
								lightness: 18,
							},
						],
					},
					{
						featureType: 'road.local',
						elementType: 'geometry',
						stylers: [
							{
								color: '#000000',
							},
							{
								lightness: 16,
							},
						],
					},
					{
						featureType: 'transit',
						elementType: 'geometry',
						stylers: [
							{
								color: '#000000',
							},
							{
								lightness: 19,
							},
						],
					},
					{
						featureType: 'water',
						elementType: 'geometry',
						stylers: [
							{
								color: '#000000',
							},
							{
								lightness: 17,
							},
						],
					},
				],
			}}
			defaultZoom={14}
			defaultCenter={{lat: -34.397, lng: 150.644}}
			{...props}
		>
			{props.children}
		</GMap>
	)),
);

export function GoogleMap(props: Props) {
	return (
		<ComposableGoogleMap
			googleMapURL={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=3.exp&libraries=geometry,drawing,places`}
			loadingElement={<div style={{height: '100%'}} />}
			containerElement={<div style={{height: '100%'}} />}
			mapElement={<div style={{height: '100%'}} />}
			{...props}
		/>
	);
}
