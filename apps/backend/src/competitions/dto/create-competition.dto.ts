import { IsString, IsNotEmpty, IsInt, Min, IsDateString, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateCompetitionDto {
  @ApiProperty({ example: 'Code Sprint 2025' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'A 24-hour coding competition' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: ['coding', 'hackathon'], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiProperty({ example: 50, minimum: 1 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  capacity: number;

  @ApiProperty({ example: '2025-12-31T23:59:59Z' })
  @IsDateString()
  regDeadline: string;

  @ApiProperty({ example: '2026-01-15T09:00:00Z', required: false })
  @IsDateString()
  @IsOptional()
  startDate?: string;
}