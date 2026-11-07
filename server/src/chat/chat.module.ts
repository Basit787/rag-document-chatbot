import { Module } from '@nestjs/common';
import { DocumentsModule } from '../documents/documents.module.js';
import { ChatController } from './chat.controller.js';
import { ChatService } from './chat.service.js';
import { ThreadsService } from './threads.service.js';

@Module({
  imports: [DocumentsModule],
  controllers: [ChatController],
  providers: [ThreadsService, ChatService],
})
export class ChatModule {}
