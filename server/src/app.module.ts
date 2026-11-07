import { Global, Module, type OnApplicationShutdown } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { AuthModule } from './auth/auth.module.js';
import { ChatModule } from './chat/chat.module.js';
import { DocumentsModule } from './documents/documents.module.js';
import { config } from './util/config.js';

// One shared PrismaClient for every module; inject it by its class.
@Global()
@Module({
  imports: [AuthModule, ChatModule, DocumentsModule],
  providers: [
    {
      provide: PrismaClient,
      useFactory: () =>
        new PrismaClient({
          adapter: new PrismaPg({ connectionString: config.databaseUrl }),
        }),
    },
  ],
  exports: [PrismaClient],
})
export class AppModule implements OnApplicationShutdown {
  constructor(private readonly prisma: PrismaClient) {}

  async onApplicationShutdown() {
    await this.prisma.$disconnect();
  }
}
