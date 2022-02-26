import {PrismaClient} from '@prisma/client';

const client = new PrismaClient();

console.log(client.$on);

export {};
