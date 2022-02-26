import {api} from '../../server/api';

export default api({
	async GET({context}) {
		return context.userId;
	},
});
