const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors'); // Add CORS module

const app = express();

// Allow multiple origins for CORS
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001'
];
app.use(cors({
    origin: function(origin, callback){
        // allow requests with no origin (like mobile apps, curl, etc.)
        if(!origin) return callback(null, true);
        if(allowedOrigins.indexOf(origin) === -1){
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    methods: ["GET", "POST"]
}));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"]
    }
});

const PORT = 3001;

// Serve static files (HTML, CSS, JS) from the 'public' folder
app.use(express.static('public'));

// Simulate bus location updates and broadcast to all clients
let busLocation = {
    latitude: 31.1471,  // Punjab center latitude
    longitude: 75.3412  // Punjab center longitude
};
setInterval(() => {
    busLocation = {
        latitude: busLocation.latitude + (Math.random() - 0.5) * 0.01,
        longitude: busLocation.longitude + (Math.random() - 0.5) * 0.01
    };
    io.emit('busLocation', busLocation);
}, 3000); // Update every 3 seconds

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('userInfo', (userInfo) => {
        console.log('User Info:', userInfo);
    });

    socket.on('chatMessage', (msg) => {
        io.emit('chatMessage', msg);
    });

    socket.on('userLocation', (userLoc) => {
        io.emit('userLocation', userLoc);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
}); 