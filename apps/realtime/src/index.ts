import express from 'express';
import http from 'http';
import {Server, Socket} from 'socket.io';
import {getRealtimeToken} from './token';
import cors from 'cors';

const app = express();
app.use(cors());

const server = http.createServer(app);

interface SocketWrapper {
	socket: Socket;
	userId: string;
	subscribedToCollection?: string;
}

export const SocketPool: SocketWrapper[] = [];

const io = new Server(server, {
	cors: {
		methods: ['GET', 'POST', 'OPTIONS'],
		origin: '*',
	},
});
io.on('connection', (socket: Socket) => {
	let userId: null | string = null;
	const wrapper: SocketWrapper = {
		socket,
		userId: '-1',
	};

	socket.emit('request-authentication', {});
	socket.on('authentication', async (payload: {token: string}) => {
		console.log(`received realtime authentication request: ${payload.token}`);

		userId = await getRealtimeToken(payload.token);
		if (!userId) {
			socket.disconnect(true);
			return;
		}

		console.log(`${userId} is now connected!`);

		wrapper.userId = userId;
		SocketPool.push(wrapper);

		socket.emit('authentication-completed', {});
	});

	socket.on('subscribe-collection', (payload: {collectionId: string}) => {
		if (userId) {
			console.log(`subscribed ${userId} to ${payload.collectionId}`);
			wrapper.subscribedToCollection = payload.collectionId;
		}
	});

	socket.on('disconnect', () => {
		if (userId) {
			SocketPool.splice(SocketPool.indexOf(wrapper), 1);
		}
	});
});

server.listen(process.env.PORT ?? '8081', () => {
	console.log('starting...');
});
