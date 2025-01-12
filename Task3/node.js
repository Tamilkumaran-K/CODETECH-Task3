const WebSocket = require('ws');
const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static('public'));

let messageHistory = [];

wss.on('connection', (ws) => {
  console.log('New client connected');

  ws.send(JSON.stringify({ type: 'history', messages: messageHistory }));

  ws.on('message', (message) => {
    const parsedMessage = JSON.parse(message);

    if (parsedMessage.type === 'message') {
      const newMessage = {
        id: Date.now(),
        user: parsedMessage.user,
        text: parsedMessage.text,
        timestamp: new Date().toISOString(),
      };
      messageHistory.push(newMessage);

      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'message', message: newMessage }));
        }
      });
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


