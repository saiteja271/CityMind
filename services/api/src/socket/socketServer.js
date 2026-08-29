import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import City from '../models/City.js';

const JWT_SECRET = process.env.JWT_SECRET || 'citymind-super-secret-jwt-key-change-in-production-2026';

/**
 * Connected user socket registry map
 */
const connectedSocketsMap = new Map();
const activeCityRoomsMap = new Map();

/**
 * Initializes and attaches Socket.IO Real-time Server to HTTP instance
 * @param {import('http').Server} httpServer 
 */
export const initializeSocketServer = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingInterval: 25000,
    pingTimeout: 60000,
    transports: ['websocket', 'polling']
  });

  // Socket Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        // Allow guest / anonymous socket connection if explicit guest flag set
        if (socket.handshake.query?.guest === 'true') {
          socket.user = {
            id: `guest_${socket.id.substring(0, 8)}`,
            username: `Guest_${Math.floor(1000 + Math.random() * 9000)}`,
            role: 'guest'
          };
          return next();
        }
        return next(new Error('Authentication error: Missing token'));
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id).select('_id username email role');

      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.user = {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role
      };

      next();
    } catch (err) {
      console.warn(`[Socket Auth Warning]: ${err.message}`);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  // Socket Connection Handlers
  io.on('connection', (socket) => {
    console.log(`[Socket Connected]: ${socket.id} (User: ${socket.user.username}, ID: ${socket.user.id})`);
    connectedSocketsMap.set(socket.id, socket.user);

    // Send connection welcome payload
    socket.emit('connected', {
      socketId: socket.id,
      user: socket.user,
      serverTime: new Date().toISOString()
    });

    /**
     * EVENT: Join City Simulation Room
     */
    socket.on('city:join', async (payload, ackCallback) => {
      try {
        const { cityId } = payload;
        if (!cityId) {
          if (ackCallback) ackCallback({ success: false, error: 'cityId is required.' });
          return;
        }

        const roomName = `city:${cityId}`;
        socket.join(roomName);
        socket.currentCityId = cityId;

        // Register room presence
        if (!activeCityRoomsMap.has(cityId)) {
          activeCityRoomsMap.set(cityId, new Set());
        }
        activeCityRoomsMap.get(cityId).add(socket.user.username);

        const occupantCount = activeCityRoomsMap.get(cityId).size;

        console.log(`[Socket Room]: User ${socket.user.username} joined room ${roomName} (${occupantCount} occupants)`);

        // Notify room occupants of user join
        socket.to(roomName).emit('city:user_joined', {
          username: socket.user.username,
          userId: socket.user.id,
          occupants: Array.from(activeCityRoomsMap.get(cityId))
        });

        if (ackCallback) {
          ackCallback({
            success: true,
            roomName,
            occupants: Array.from(activeCityRoomsMap.get(cityId))
          });
        }
      } catch (err) {
        console.error('[Socket city:join Error]:', err.message);
        if (ackCallback) ackCallback({ success: false, error: err.message });
      }
    });

    /**
     * EVENT: Leave City Simulation Room
     */
    socket.on('city:leave', (payload) => {
      const cityId = payload?.cityId || socket.currentCityId;
      if (cityId) {
        const roomName = `city:${cityId}`;
        socket.leave(roomName);

        if (activeCityRoomsMap.has(cityId)) {
          activeCityRoomsMap.get(cityId).delete(socket.user.username);
          if (activeCityRoomsMap.get(cityId).size === 0) {
            activeCityRoomsMap.delete(cityId);
          }
        }

        socket.to(roomName).emit('city:user_left', {
          username: socket.user.username,
          userId: socket.user.id
        });

        socket.currentCityId = null;
      }
    });

    /**
     * EVENT: Co-op Multiplayer Building Placement Action
     */
    socket.on('simulation:build_action', (payload, ackCallback) => {
      const { cityId, buildingTypeId, x, y, category } = payload;
      const roomName = `city:${cityId}`;

      console.log(`[Co-op Action]: User ${socket.user.username} placed ${buildingTypeId} at (${x}, ${y}) in city ${cityId}`);

      // Broadcast build event to all room participants except sender
      socket.to(roomName).emit('simulation:build_placed', {
        user: socket.user.username,
        buildingTypeId,
        x,
        y,
        category,
        timestamp: new Date().toISOString()
      });

      if (ackCallback) ackCallback({ success: true, timestamp: Date.now() });
    });

    /**
     * EVENT: Co-op Tile Demolition Action
     */
    socket.on('simulation:demolish_action', (payload, ackCallback) => {
      const { cityId, x, y } = payload;
      const roomName = `city:${cityId}`;

      socket.to(roomName).emit('simulation:tile_demolished', {
        user: socket.user.username,
        x,
        y,
        timestamp: new Date().toISOString()
      });

      if (ackCallback) ackCallback({ success: true });
    });

    /**
     * EVENT: Live Simulation Tick Broadcast Sync
     */
    socket.on('simulation:tick_sync', (payload) => {
      const { cityId, tick, timeState, stats } = payload;
      const roomName = `city:${cityId}`;

      socket.to(roomName).emit('simulation:tick_update', {
        tick,
        timeState,
        stats,
        broadcastBy: socket.user.username
      });
    });

    /**
     * EVENT: Chat Message Broadcast
     */
    socket.on('chat:send_message', (payload) => {
      const { cityId, message } = payload;
      if (!message || message.trim().length === 0) return;

      const roomName = `city:${cityId || 'global'}`;
      const chatPayload = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        sender: socket.user.username,
        senderRole: socket.user.role,
        text: message.trim().substring(0, 500),
        timestamp: new Date().toISOString()
      };

      io.in(roomName).emit('chat:message_received', chatPayload);
    });

    /**
     * EVENT: Cross-City Market Trade Proposal
     */
    socket.on('market:trade_proposal', (payload) => {
      const { targetCityId, resourceType, quantity, price } = payload;
      const targetRoom = `city:${targetCityId}`;

      io.in(targetRoom).emit('market:trade_offered', {
        offerId: `trade_${Date.now()}`,
        fromCity: socket.currentCityId,
        fromUser: socket.user.username,
        resourceType,
        quantity,
        price,
        proposedAt: new Date().toISOString()
      });
    });

    /**
     * EVENT: Disconnect Handler
     */
    socket.on('disconnect', (reason) => {
      console.log(`[Socket Disconnected]: ${socket.id} (User: ${socket.user.username}, Reason: ${reason})`);
      connectedSocketsMap.delete(socket.id);

      if (socket.currentCityId && activeCityRoomsMap.has(socket.currentCityId)) {
        activeCityRoomsMap.get(socket.currentCityId).delete(socket.user.username);
        socket.to(`city:${socket.currentCityId}`).emit('city:user_left', {
          username: socket.user.username,
          userId: socket.user.id
        });
      }
    });
  });

  return io;
};

/**
 * Returns active connected sockets stats
 */
export const getSocketStats = () => {
  return {
    totalConnections: connectedSocketsMap.size,
    activeCityRoomsCount: activeCityRoomsMap.size,
    activeRooms: Array.from(activeCityRoomsMap.entries()).map(([cityId, users]) => ({
      cityId,
      occupantCount: users.size,
      users: Array.from(users)
    }))
  };
};

export default {
  initializeSocketServer,
  getSocketStats
};
