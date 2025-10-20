import { Controller, Post, Get, Param, UseGuards, Headers, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { RegistrationsService } from './registrations.service';
import { JwtAuthGuard, RolesGuard } from '../auth/guards/guards';
import { CurrentUser } from '../auth/decorators/decorators';
import { Roles } from '../auth/decorators/decorators';

@ApiTags('Registrations')
@Controller('competitions')
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  @Post(':id/register')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PARTICIPANT)
  @ApiBearerAuth()
  @ApiHeader({ name: 'Idempotency-Key', required: false, description: 'Unique key for idempotent requests' })
  @ApiOperation({ summary: 'Register for a competition (Participant only)' })
  @ApiResponse({ status: 201, description: 'Registration successful' })
  @ApiResponse({ status: 400, description: 'Registration deadline passed or competition full' })
  @ApiResponse({ status: 409, description: 'Already registered' })
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Param('id') competitionId: string,
    @CurrentUser() user: any,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    return this.registrationsService.register(user.id, competitionId, idempotencyKey);
  }

  @Get('registrations/my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PARTICIPANT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user registrations' })
  @ApiResponse({ status: 200, description: 'List of user registrations' })
  async getMyRegistrations(@CurrentUser() user: any) {
    return this.registrationsService.getUserRegistrations(user.id);
  }

  @Get(':id/registrations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all registrations for a competition' })
  @ApiResponse({ status: 200, description: 'List of registrations' })
  async getCompetitionRegistrations(@Param('id') competitionId: string) {
    return this.registrationsService.getCompetitionRegistrations(competitionId);
  }
}