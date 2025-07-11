import { WebSocketServer } from 'ws';
import { setupWSConnection } from './src/utils/utils.js'
import jwt from 'jsonwebtoken';
import UserModel from './src/models/user.model.js';
import RoomModel from './src/models/room.model.js';

let wss;

/* Verify User Token */
async function authenticateWSUser(request) {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);
    const token = url.searchParams.get('token').replace('/','');
    const roomId = url.pathname.slice(1);
    
    if (!token) {
      throw new Error('Token is required');
    }
    const decodedToken = jwt.verify(token, process.env.JWT_TOKEN_SECRET);
    
    /* Fetching User from Database */
    const user = await UserModel.findById(decodedToken?.id);
    if (!user) {
      throw new Error('User not Found');
    }

    /* Checking if either User is admin or a member of Room */
    const room = await RoomModel.findOne({
      roomId
    });
    if(!room){
      throw new Error('Room not Found');
    }

    const userIndex = room.users.indexOf(user._id);
    const isAdmin = room.admin.toString() === user._id.toString();

    if(userIndex === -1 && !isAdmin){
      throw new Error('Unauthorized Request');
    }

    return { userId: user._id.toString(), roomId };
  } catch (err) {
    throw new Error('Unauthorized: ' + err.message);
  }
}

function initializeSocket(server) {
  wss = new WebSocketServer({ noServer: true });

  wss.on('connection', setupWSConnection);

  /* Handle User Authentication */
  server.on('upgrade', async function upgrade(request, socket, head) {
    socket.on('error', (err) => {
      console.error('Socket error:', err);
    });

    try {
      const { userId, roomId } = await authenticateWSUser(request);
      
      console.log('User authenticated for WebSocket:', userId);
      
      wss.handleUpgrade(request, socket, head, function done(ws) {
        wss.emit('connection', ws, request, { userId, roomId });
      });
    } catch (err) {
      console.error('WebSocket authentication failed:', err.message);
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
    }
  });
}

export {
  initializeSocket
}