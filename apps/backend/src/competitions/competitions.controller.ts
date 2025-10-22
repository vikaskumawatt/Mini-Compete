import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CompetitionsService } from './competitions.service';
import { CreateCompetitionDto } from './dto/create-competition.dto';
import { JwtAuthGuard } from '../auth/guards/guard';
import { RolesGuard } from '../auth/guards/guard';
import { CurrentUser } from '../auth/decorators/decorator';
import { Roles } from '../auth/decorators/decorator';

@ApiTags('Competitions')
@Controller('competitions')
export class CompetitionsController {
  constructor(private readonly competitionsService: CompetitionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ORGANIZER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new competition (Organizer only)' })
  @ApiResponse({ status: 201, description: 'Competition created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Organizer role required' })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async create(@CurrentUser() user: any, @Body() dto: CreateCompetitionDto) {
    return this.competitionsService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all competitions' })
  @ApiResponse({ status: 200, description: 'List of competitions' })
  async findAll(@Query('search') search?: string, @Query('tags') tags?: string) {
    const tagsArray = tags ? tags.split(',') : undefined;
    return this.competitionsService.findAll({ search, tags: tagsArray });
  }

  @Get('my-competitions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ORGANIZER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get competitions created by current organizer' })
  @ApiResponse({ status: 200, description: 'List of organizer competitions' })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getMyCompetitions(@CurrentUser() user: any) {
    return this.competitionsService.findByOrganizer(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get competition by ID' })
  @ApiResponse({ status: 200, description: 'Competition details' })
  @ApiResponse({ status: 404, description: 'Competition not found' })
  async findOne(@Param('id') id: string) {
    return this.competitionsService.findOne(id);
  }
}
