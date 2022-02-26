import {UserGeoLocationMessage} from './types';
import {prisma} from './prisma';

export async function processMessage(message: UserGeoLocationMessage) {
	console.log(message);

	await prisma.ticket.findFirst({
		where: {},
	});
}
