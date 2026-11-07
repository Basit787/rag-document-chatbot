import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { type AuthUser, CurrentUser } from '../auth/auth.decorators.js';
import { type ChatEvent, ChatService } from './chat.service.js';
import { ChatInputDto } from './dto/chat-input.dto.js';

@ApiTags('chat')
@ApiBearerAuth()
@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('models')
  async models() {
    return {
      models: await this.chatService.listModels(),
      default: this.chatService.defaultModel,
    };
  }

  @Get('threads')
  threads(@CurrentUser() user: AuthUser) {
    return this.chatService.listThreads(user.id);
  }

  @Get('threads/:id/messages')
  messages(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.chatService.getMessages(user.id, id);
  }

  @Delete('threads/:id')
  async remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    await this.chatService.deleteThread(user.id, id);
    return { ok: true };
  }

  @Post('chat')
  async chat(
    @CurrentUser() user: AuthUser,
    @Body() body: ChatInputDto,
    @Res() res: Response,
  ) {
    if (!body.message.trim()) throw new BadRequestException('message required');
    // Checked before the stream starts so a foreign thread gets a real 404.
    if (body.threadId)
      await this.chatService.assertOwner(user.id, body.threadId);

    res.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    res.flushHeaders();

    const abort = new AbortController();
    res.on('close', () => abort.abort());
    const send = (event: ChatEvent) =>
      res.write(`data: ${JSON.stringify(event)}\n\n`);

    try {
      for await (const event of this.chatService.chat(
        user.id,
        body,
        abort.signal,
      )) {
        send(event);
      }
    } catch (err) {
      if (!abort.signal.aborted) {
        send({
          type: 'error',
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }
    res.end();
  }
}
