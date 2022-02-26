import {UserGeoLocationMessage} from './types';
import {prisma} from './prisma';
import dayjs from 'dayjs';
import {redis} from './redis';

export async function processMessage(message: UserGeoLocationMessage) {
	const parsedDate = dayjs(message.sentAt).toDate();

	const foundTicketRes = await prisma.$queryRaw<
		Array<{
			id: string;
			distance: number;
		}>
	>`
		SELECT "Ticket".id, distance FROM "Ticket"
			INNER JOIN "Collection" C on C.id = "Ticket".collection_id
			LEFT JOIN LATERAL (
				SELECT ( 3959 * acos( cos( radians(latitude) ) * cos( radians( ${message.latitude} ) ) * cos( radians( ${message.longitude} ) - radians(longitude) )
						+ sin( radians(latitude) ) * sin( radians( ${message.latitude} ) ) ) ) AS distance
				) AS calculated_distance ON TRUE
		WHERE user_id IS NULL
			AND releases_at < ${parsedDate} AND closes_at > ${parsedDate}
			AND distance < 1
			AND (
				SELECT count(*) FROM "Ticket"
				WHERE user_id = ${message.userId}
					AND collection_id = C.id
			) = 0
		LIMIT 1
	`;
	console.log(foundTicketRes);

	if (foundTicketRes.length) {
		const ticketData = foundTicketRes[0];
		// They need to be given a ticket, with the ID in foundTicketRes
		console.log(
			`Found match for ticket id ${ticketData.id}, user id ${message.userId}, distance ${ticketData.distance}`,
		);

		// Grant this ticket
		await prisma.ticket.update({
			where: {
				id: ticketData.id,
			},
			data: {
				user_id: message.userId,
			},
		});

		// Publish this to redis
		await redis.publish(
			'ticket-claimed',
			JSON.stringify({
				userId: message.userId,
				ticketId: ticketData.id,
			}),
		);
	}
}
