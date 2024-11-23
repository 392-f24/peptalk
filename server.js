import express from 'express';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import WebSocket from 'ws';
import dotenv from 'dotenv';

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is not defined in environment variables');
  process.exit(1);
}

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const connections = new Map();

const createOpenAIWebSocket = (clientWs) => {
  console.log('Creating OpenAI WebSocket connection...');
  
  const ws = new WebSocket("wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01", {
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "OpenAI-Beta": "realtime=v1",
    },
  });

  let sessionInitialized = false;
  let audioBuffer = [];

  ws.on('open', () => {
    console.log('Connected to OpenAI');
    // Updated session config with server_vad
    ws.send(JSON.stringify({
      type: "session.update",
      session: {
        modalities: ["text", "audio"],
        turn_detection: {
          type: "server_vad"  // Changed to server_vad as required
        },
        voice: "alloy",
        instructions: "You are a supportive journaling companion. Help users reflect on their thoughts and feelings with empathy and insight."
      }
    }));
  });

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log('Received from OpenAI:', message.type);

      if (message.type === 'error') {
        console.error('OpenAI Error:', JSON.stringify(message, null, 2));
        return;
      }

      if (message.type === 'session.created') {
        sessionInitialized = true;
        console.log('Session initialized');
      }

      // Forward message to client
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(data);
      }
    } catch (error) {
      console.error('Error processing OpenAI message:', error);
    }
  });

  const handleClientMessage = async (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Handling client message:', data.type);

      switch (data.type) {
        case 'start_recording':
          console.log('Starting new recording session');
          audioBuffer = [];
          break;

        case 'input_audio_buffer.append':
          audioBuffer.push(data.audio);
          ws.send(message);
          break;

        case 'response.pause':
          console.log('Pausing response');
          ws.send(JSON.stringify({ type: 'response.pause' }));
          break;

        case 'response.resume':
          console.log('Resuming response');
          ws.send(JSON.stringify({ type: 'response.resume' }));
          break;

        case 'stop_recording':
          console.log('Stopping recording');
          if (audioBuffer.length > 0) {
            console.log('Committing final audio buffer');
            ws.send(JSON.stringify({
              type: 'input_audio_buffer.commit'
            }));
            audioBuffer = [];
          }
          break;

        default:
          ws.send(message);
      }
    } catch (error) {
      console.error('Error handling client message:', error);
    }
  };

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(JSON.stringify({
        type: 'error',
        message: 'WebSocket error occurred'
      }));
    }
  });

  return { ws, handleClientMessage };
};

wss.on('connection', (clientWs) => {
  console.log('Client connected');

  const { ws: openAIWs, handleClientMessage } = createOpenAIWebSocket(clientWs);
  connections.set(clientWs, openAIWs);

  clientWs.on('message', async (message) => {
    console.log('Received client message');
    await handleClientMessage(message);
  });

  clientWs.on('close', () => {
    console.log('Client disconnected');
    const openAIWs = connections.get(clientWs);
    if (openAIWs) {
      openAIWs.close();
      connections.delete(clientWs);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});