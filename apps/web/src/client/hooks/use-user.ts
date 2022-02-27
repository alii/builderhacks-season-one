import {InferAPIResponse} from 'nextkit';
import {NextkitClientException} from 'nextkit/client';
import useSWR from 'swr';

import type UserAtMe from '../../pages/api/users/@me';

export function useMe() {
	return useSWR<
		InferAPIResponse<typeof UserAtMe, 'GET'>,
		NextkitClientException
	>('/api/users/@me');
}
