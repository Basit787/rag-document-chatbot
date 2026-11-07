import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length, MaxLength } from 'class-validator';

export class CredentialsDto {
  @ApiProperty({ example: 'you@example.com' })
  @IsEmail({}, { message: 'Enter a valid email' })
  @MaxLength(254, { message: 'Enter a valid email' })
  email: string;

  @ApiProperty({ minLength: 8, maxLength: 128, example: 'password123' })
  @IsString()
  @Length(8, 128, { message: 'Password must be 8 to 128 characters' })
  password: string;
}
