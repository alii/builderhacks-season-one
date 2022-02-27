import {InferAPIResponse} from 'nextkit';
import {NextkitClientException} from 'nextkit/client';
import useSWR from 'swr';

import type CollectionListAPI from '../../pages/api/collection';
import type UserAtMe from '../../pages/api/users/@me';

export function useMe() {
	return useSWR<
		InferAPIResponse<typeof UserAtMe, 'GET'> | null,
		NextkitClientException
	>('/api/users/@me');
}

type CollectionResponse = InferAPIResponse<typeof CollectionListAPI, 'GET'>;

export function useMyCollections() {
	return useSWR<CollectionResponse>('/api/collection');
}
