import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class ChatInputDto {
  @ApiPropertyOptional({ description: 'Omit to start a new chat' })
  @IsOptional()
  @IsUUID()
  threadId?: string;

  @ApiProperty({ maxLength: 4000, example: 'Hello!' })
  @IsString()
  @IsNotEmpty({ message: 'message required' })
  @MaxLength(4000, { message: 'message is too long' })
  message: string;

  @ApiPropertyOptional({ example: 'llama3.2' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  model?: string;
}
