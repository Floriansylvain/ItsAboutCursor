import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

const users = new Map(); // socket.id => { username, x, y }

io.on("connection", (socket) => {
    console.log("User connected", socket.id);

    socket.on("register", (username) => {
        users.set(socket.id, { username, x: 0, y: 0 });
        io.emit("users", Array.from(users.entries()));
    });

    socket.on("move", ({ x, y }) => {
        if (users.has(socket.id)) {
            users.get(socket.id).x = x;
            users.get(socket.id).y = y;
            io.emit("users", Array.from(users.entries()));
        }
    });

    socket.on("disconnect", () => {
        users.delete(socket.id);
        io.emit("users", Array.from(users.entries()));
        console.log("User disconnected", socket.id);
    });
});

server.listen(3000, () => {
    console.log("Server listening on port 3000");
});
