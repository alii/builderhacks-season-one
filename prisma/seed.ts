/* eslint-disable no-await-in-loop */

import {faker} from '@faker-js/faker';
import {PrismaClient} from '@prisma/client';
import {id} from 'alistair/id';
import dayjs from 'dayjs';
import * as fs from 'fs/promises';
import {snowflake} from '../apps/web/src/server/snowflake';

const client = new PrismaClient();

async function run() {
	const userIdPool: string[] = [];

	for (let i = 0; i < 50; i++) {
		const user = await client.user.create({
			data: {
				id: snowflake(),
				phone_number: faker.phone.number('+447#########'),
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

	// Load in town data
	const townDataJson = await fs.readFile('./prisma/gb.json', 'utf-8');

	const townData = JSON.parse(townDataJson) as Array<{
		lat: string;
		lng: string;
	}>;

	const collectionIdPool: string[] = [];

	// London collection for doing demos (in development, the location is fixed)
	const bruh = await client.collection.create({
		data: {
			id: snowflake(),
			slug: id(),
			name: 'Eras Tour',
			latitude: 51.5032616,
			longitude: -0.1575,
			releases_at: dayjs().subtract(1, 'hour').toDate(),
			closes_at: dayjs().add(1, 'day').toDate(),
			artist_id: artistIdPool[0],
		},
	});

	collectionIdPool.push(bruh.id);

	for (let i = 0; i < 20; i++) {
		const town = townData[Math.floor(Math.random() * townData.length)];

		const collection = await client.collection.create({
			data: {
				id: snowflake(),
				slug: id(),
				name: faker.company.name(),
				latitude: parseFloat(town.lat),
				longitude: parseFloat(town.lng),
				releases_at: dayjs().subtract(1, 'hour').toDate(),
				closes_at: dayjs().add(1, 'day').toDate(),
				artist_id:
					artistIdPool[Math.floor(Math.random() * artistIdPool.length)],
			},
		});

		collectionIdPool.push(collection.id);
	}

	for (let i = 0; i < 100; i++) {
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
