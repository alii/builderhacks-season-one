import dayjs from 'dayjs';
import {prisma} from './prisma';
import {redis} from './redis';
import {sendSMSMessage} from './text-messages';
import {UserGeoLocationMessage} from './types';

export async function processMessage(message: UserGeoLocationMessage) {
	const parsedDate = dayjs(message.sentAt).toDate();

	const foundTicketRes = await prisma.$queryRaw<
		Array<{
			id: string;
			distance: number;
			collection_id: string;
			artist_id: string;
		}>
	>`
		SELECT "Ticket".id, distance, "Ticket".collection_id, C.artist_id FROM "Ticket"
			INNER JOIN "Collection" C on C.id = "Ticket".collection_id
			LEFT JOIN LATERAL (
				SELECT ( 3959 * acos( cos( radians(latitude) ) * cos( radians( ${message.latitude} ) ) * cos( radians( ${message.longitude} ) - radians(longitude) )
						+ sin( radians(latitude) ) * sin( radians( ${message.latitude} ) ) ) ) AS distance
				) AS calculated_distance ON TRUE
		WHERE user_id IS NULL
			AND releases_at < ${parsedDate} AND closes_at > ${parsedDate}
			AND distance < 0.15
			AND (
				SELECT count(*) FROM "Ticket"
				WHERE user_id = ${message.userId}
					AND collection_id = C.id
			) = 0
		LIMIT 1
	`;

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
				collectionId: ticketData.collection_id,
			}),
		);

		// Send a text message to this person telling them that they've got a drop
		// Get the user phone number
		const user = await prisma.user.findFirst({
			where: {
				id: message.userId,
			},
			select: {
				phone_number: true,
			},
		});

		if (user) {
			const artist = await prisma.artist.findFirst({
				where: {
					id: ticketData.artist_id,
				},
				select: {
					name: true,
				},
			});

			if (artist) {
				void sendSMSMessage(
					user.phone_number,
					`Nice work! You've just reserved a ticket for ${artist.name}. Check 'My Tickets' in geogig to see next steps!`,
				);
			}
		}
	}
}
