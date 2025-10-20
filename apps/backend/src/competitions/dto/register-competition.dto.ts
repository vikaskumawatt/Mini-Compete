import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterCompetitionDto {
  @ApiProperty({ 
    required: false,
    description: 'Idempotency key for preventing duplicate registrations',
    example: 'user-123-comp-456-1704067200'
  })
  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}