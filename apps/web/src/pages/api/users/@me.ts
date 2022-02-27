import {NextkitException} from 'nextkit';
import {api} from '../../../server/api';
import {prisma} from '../../../server/prisma';

export default api({
	async GET({context}) {
		if (!context.userId) {
			throw new NextkitException(401, 'You are not logged in');
		}

		const user = await prisma.user.findFirst({
			where: {
				id: context.userId,
			},
		});

		if (!user) {
			throw new NextkitException(404, 'User deleted since session was made');
		}

		return user;
	},
});
