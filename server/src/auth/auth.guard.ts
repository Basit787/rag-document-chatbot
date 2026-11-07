import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import { type AuthRequest, IS_PUBLIC } from './auth.decorators.js';

interface TokenPayload {
  sub: string;
  sid: string;
}

// Registered globally: every route is protected unless marked @Public().
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
    private readonly prisma: PrismaClient,
  ) {}

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<AuthRequest>();
    const [scheme, token] = request.headers.authorization?.split(' ') ?? [];
    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Please sign in');
    }

    let payload: TokenPayload;
    try {
      payload = await this.jwt.verifyAsync<TokenPayload>(token);
    } catch {
      throw new UnauthorizedException('Session expired, please sign in again');
    }

    // A signed token only counts while its session row exists: logout or a deleted user revokes it.
    const session = await this.prisma.session.findUnique({
      where: { id: payload.sid },
      include: { user: { select: { id: true, email: true } } },
    });
    if (
      !session ||
      session.userId !== payload.sub ||
      session.expiresAt < new Date()
    ) {
      throw new UnauthorizedException('Session expired, please sign in again');
    }

    request.user = { ...session.user, sessionId: session.id };
    return true;
  }
}
