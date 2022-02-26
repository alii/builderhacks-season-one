import {api} from '../../server/api';

export default api({
	GET: async ({context}) => context.userId,
});
