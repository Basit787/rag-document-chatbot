import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { type AuthUser, CurrentUser, Public } from './auth.decorators.js';
import { AuthService } from './auth.service.js';
import { CredentialsDto } from './dto/credentials.dto.js';
import { parseCredentials } from './parser/credentials.parser.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  register(@Body() body: CredentialsDto) {
    return this.authService.register(parseCredentials(body));
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  login(@Body() body: CredentialsDto) {
    return this.authService.login(parseCredentials(body));
  }

  @ApiBearerAuth()
  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return { id: user.id, email: user.email };
  }

  @ApiBearerAuth()
  @Post('logout')
  @HttpCode(200)
  async logout(@CurrentUser() user: AuthUser) {
    await this.authService.logout(user);
    return { ok: true };
  }
}
