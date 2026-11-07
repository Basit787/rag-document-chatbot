import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import { config } from '../util/config.js';
import type { AuthUser } from './auth.decorators.js';
import type { Credentials } from './parser/credentials.parser.js';

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number,
) => Promise<Buffer>;

const KEY_LENGTH = 64;
// Compared against when the email is unknown, so both paths take the same time.
const DUMMY_HASH = `${'0'.repeat(32)}:${'0'.repeat(KEY_LENGTH * 2)}`;

interface PublicUser {
  id: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: PublicUser;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly jwt: JwtService,
  ) {}

  async register({ email, password }: Credentials): Promise<AuthResponse> {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException('Email is already registered');

    const user = await this.prisma.user.create({
      data: { email, passwordHash: await hashPassword(password) },
      select: { id: true, email: true },
    });
    return this.issueToken(user);
  }

  async login({ email, password }: Credentials): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    const valid = await verifyPassword(
      password,
      user?.passwordHash ?? DUMMY_HASH,
    );
    if (!user || !valid) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.issueToken({ id: user.id, email: user.email });
  }

  async logout(user: AuthUser): Promise<void> {
    await this.prisma.session.deleteMany({
      where: {
        userId: user.id,
        OR: [{ id: user.sessionId }, { expiresAt: { lt: new Date() } }],
      },
    });
  }

  private async issueToken(user: PublicUser): Promise<AuthResponse> {
    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
        expiresAt: new Date(Date.now() + config.sessionTtlSeconds * 1000),
      },
    });
    const token = await this.jwt.signAsync({ sub: user.id, sid: session.id });
    return { token, user };
  }
}

async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const hash = await scryptAsync(password, salt, KEY_LENGTH);
  return `${salt.toString('hex')}:${hash.toString('hex')}`;
}

async function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(':');
  const expected = Buffer.from(hash, 'hex');
  const actual = await scryptAsync(
    password,
    Buffer.from(salt, 'hex'),
    KEY_LENGTH,
  );
  return timingSafeEqual(actual, expected);
}
