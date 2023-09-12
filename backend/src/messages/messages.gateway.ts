import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { MessagesService } from './messages.service';
import { Server, Socket } from 'socket.io';
import { OnGatewayDisconnect, OnGatewayConnection } from '@nestjs/websockets';
import { MessageDto } from './dto/message.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  transports: ['websocket'],
})
export class MessagesGateway
  implements OnGatewayDisconnect, OnGatewayConnection
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly messagesService: MessagesService) {}
  handleConnection(client: Socket) {
    console.log('User connected', client.id);
  }
  handleDisconnect(client: Socket) {
    console.log('User disconnected', client.id);
    this.messagesService.disconnected(client.id);
  }

  @SubscribeMessage('send-message')
  sendMessage(@MessageBody() data: any, @ConnectedSocket() socket: Socket) {
    console.log('user sending message', data);
    const payload: MessageDto = {
      text: data.text,
      user: data.user,
      id: socket.id,
    };
    this.messagesService.sendMessage(payload);
    const messages = this.messagesService.getMessages();
    this.server.emit('all-message', messages);
    // this.server.emit('new-message', payload);
  }

  @SubscribeMessage('get-messages')
  getMessages() {
    console.log('Retrieve  all message');
    const messages = this.messagesService.getMessages();
    this.server.emit('all-message', messages);
  }

  @SubscribeMessage('join')
  joinRoom(
    @MessageBody('name') name: string,
    @ConnectedSocket() socket: Socket,
  ) {
    console.log(name, 'Joined with id', socket.id);
    this.messagesService.joinRoom(name, socket.id);
  }
}
