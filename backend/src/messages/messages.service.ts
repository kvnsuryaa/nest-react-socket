import { Injectable } from '@nestjs/common';
import { MessageDto } from './dto/message.dto';

@Injectable()
export class MessagesService {
  messages: MessageDto[] = [];
  users = {};

  sendMessage(data: any) {
    this.messages.push(data);
    return data;
  }

  getMessages() {
    return this.messages;
  }

  joinRoom(name: string, id: string) {
    this.users[id] = name;
    console.log('All User', Object.values(this.users));
    return Object.values(this.users);
  }

  disconnected(socket_id: string) {
    delete this.users[socket_id];
  }
}
