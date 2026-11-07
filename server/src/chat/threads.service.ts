import { Injectable, NotFoundException } from '@nestjs/common';
import type { Thread } from '@prisma/client';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class ThreadsService {
  constructor(private readonly prisma: PrismaClient) {}

  list(userId: string): Promise<Thread[]> {
    return this.prisma.thread.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 100,
    });
  }

  // Someone else's thread answers 404, same as a missing one, so ids can't be probed.
  async findOwned(userId: string, id: string): Promise<Thread> {
    const thread = await this.prisma.thread.findFirst({
      where: { id, userId },
    });
    if (!thread) throw new NotFoundException('Chat not found');
    return thread;
  }

  create(
    id: string,
    userId: string,
    title: string,
    model: string,
  ): Promise<Thread> {
    return this.prisma.thread.create({ data: { id, userId, title, model } });
  }

  updateModel(id: string, model: string): Promise<Thread> {
    return this.prisma.thread.update({ where: { id }, data: { model } });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.thread.delete({ where: { id } });
  }
}
