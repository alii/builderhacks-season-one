import {PrismaClient} from '@prisma/client';

// File is messy but we have to store prisma on a global variable
// to make it survive hot reloads in Next.js
//
// This means that you have to restart your dev server
// after you change the prisma schema

const getClient = () => new PrismaClient();

const g = global as unknown as {__prisma__: ReturnType<typeof getClient>};

export const prisma = g.__prisma__ || (g.__prisma__ = getClient());
