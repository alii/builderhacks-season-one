/* eslint-disable no-await-in-loop */
// eslint-disable no-await-in-loop

import {PrismaClient} from '@prisma/client';
import {snowflake} from '@geogig/web/src/server/snowflake';
import faker from '@faker-js/faker';
import {id} from 'alistair/id';
import dayjs from 'dayjs';

const client = new PrismaClient();

async function run() {
	const userIdPool: string[] = [];

	for (let i = 0; i < 50; i++) {
		const user = await client.user.create({
			data: {
				id: snowflake(),
				phone_number: faker.phone.phoneNumber(),
			},
		});

		userIdPool.push(user.id);
	}

	const artistIdPool: string[] = [];
	for (let i = 0; i < 10; i++) {
		const artist = await client.artist.create({
			data: {
				id: snowflake(),
				name: `${faker.name.firstName()} ${faker.name.lastName()}`,
				image: faker.image.imageUrl(),
				slug: id(10, 'abcdef1234567890'),
			},
		});

		artistIdPool.push(artist.id);
	}

	const collectionIdPool: string[] = [];
	for (let i = 0; i < 5; i++) {
		const collection = await client.collection.create({
			data: {
				id: snowflake(),
				slug: id(),
				name: faker.company.companyName(),
				latitude: 51.748465, // 51.748465, -1.974616
				longitude: -1.974616,
				releases_at: dayjs().subtract(1, 'hour').toDate(),
				closes_at: dayjs().add(1, 'day').toDate(),
				artist_id:
					artistIdPool[Math.floor(Math.random() * artistIdPool.length)],
			},
		});

		collectionIdPool.push(collection.id);
	}

	for (let i = 0; i < 20; i++) {
		await client.ticket.create({
			data: {
				id: snowflake(),
				collection_id:
					collectionIdPool[Math.floor(Math.random() * collectionIdPool.length)],
				user_id:
					Math.random() > 0.5
						? userIdPool[Math.floor(Math.random() * userIdPool.length)]
						: undefined,
			},
		});
	}
}

void run();

export {};
