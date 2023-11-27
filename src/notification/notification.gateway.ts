import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { NotificationService } from './notification.service';
import { Server, Socket } from 'socket.io';
import {  OnModuleInit } from '@nestjs/common';
import { Notification } from './entities/notification.interface';

interface JwtPayload {
  _id: string;
  email?: string;
  username?: string;
  iat?: number;
  exp?: number;
}

export interface socketMetaPayload extends JwtPayload {
  socketId: string;
}

@WebSocketGateway({
  crossOriginIsolated: true,
})
export class NotificationGateway implements OnModuleInit {
  @WebSocketServer()
  server: Server;
  socketMap = new Map<string, socketMetaPayload>();

  constructor(
  
    private readonly notificationService: NotificationService,
  ) {}

  onModuleInit() {
    this.server.on('connection', async (socket) => {
    });
  }

  async emitNotification(userId: string, notification: Partial<Notification>) {
    const socketMeta = this.socketMap.get(userId);
    const notif = await this.notificationService.create(notification);
    if (socketMeta) {
      this.server.to(socketMeta?.socketId).emit('notification', notif);
    } else {
      console.log('user is not online at the moment!');
    }
  }

  @SubscribeMessage('currentUsers')
  async currentUsers(client: Socket) {
    client.emit('currentUsers', Array.from(this.socketMap.values()));
  }
}
