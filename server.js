// const express = require(`express`);
// const next = require(`next`);
// const http = require(`http`);
// const { Server } = require(`socket.io`);

// const dev = process.env.NODE_ENV !== `production`;
// const port = 3030;

// const app = next({ dev });
// const handle = app.getRequestHandler();

// app.prepare().then(() => {
//   const server = express();
//   const httpServer = http.createServer(server);

//   // Create Socket.IO server
//   const io = new Server(httpServer);

//   io.on(`connection`, (socket) => {
//     // Handle Socket.IO connection
//     socket.on(`joinRoom`, (roomName) => {
//       // Join the specified room
//       socket.join(roomName);
//     });

//     socket.on(`message`, (data) => {

//       // Broadcast the message to all clients in the same room
//       socket.to(data.roomName).emit(`message`, data.messagetobepassed);
//     });

//     socket.on(`disconnect`, () => {
      

//       // Leave all rooms the client has joined
//       socket.rooms.forEach((room) => {
//         socket.leave(room);
//       });
//     });
//   });

 

//   server.all(`*`, (req, res) => {
//     return handle(req, res);
//   });

//   httpServer.listen(port, (err) => {
//     if (err) throw err;
//   });
// });


// the above code makes socket connections which i think might lead to too many connections


// new code -2 more simple

// const express = require(`express`);
// const next = require(`next`);
// const http = require(`http`);

// const dev = process.env.NODE_ENV !== `production`;
// const port = 3030;

// const app = next({ dev });
// const handle = app.getRequestHandler();

// app.prepare().then(() => {
//   const server = express();
//   const httpServer = http.createServer(server);

//   // No message handling logic needed here (since messages are not supported)

//   // Next.js request handling
//   server.all(`*`, (req, res) => {
//     return handle(req, res);
//   });

//   httpServer.listen(port, (err) => {
//     if (err) throw err;
//     console.info(`> Ready on http://localhost:${port}`);
//   });
// });






// this file supports flutter for localhost

const express = require(`express`);
const next = require(`next`);
const http = require(`http`);
const cors = require(`cors`); // Import the CORS middleware

const dev = process.env.NODE_ENV !== `production`;
const port = 3030;

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();
  const httpServer = http.createServer(server);

  // Add CORS middleware
  server.use(
    cors({
      origin: '*', //for all origins of api request //'http://localhost:58622', // Replace with your Flutter web app's URL
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed methods
      allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
    })
  );

  // Next.js request handling
  server.all(`*`, (req, res) => {
    return handle(req, res);
  });

  httpServer.listen(port, (err) => {
    if (err) throw err;
    console.info(`> Ready on http://localhost:${port}`);
  });
});
