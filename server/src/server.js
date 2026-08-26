import http from "http";
import { Server } from "socket.io";

import app from "./app.js";

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173"
    }
});

io.on("connection", (socket) => {
    console.log(`Player connected: ${socket.id}`);

	socket.on("ping:test", (data) => {
		console.log("Client says:" ,data);

		socket.emit("pong:test", {
			message: "hello client"
		});
	});

    socket.on("disconnect", () => {
        console.log(`Player disconnected: ${socket.id}`);
    });
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});