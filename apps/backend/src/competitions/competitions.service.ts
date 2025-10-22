import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompetitionDto } from './dto/create-competition.dto';

@Injectable()
export class CompetitionsService {
  constructor(private prisma: PrismaService) {}

  async create(organizerId: string, dto: CreateCompetitionDto) {
    const regDeadline = new Date(dto.regDeadline);
    const startDate = dto.startDate ? new Date(dto.startDate) : null;

    // Validate dates
    if (regDeadline <= new Date()) {
      throw new BadRequestException('Registration deadline must be in the future');
    }

    if (startDate && startDate <= regDeadline) {
      throw new BadRequestException('Start date must be after registration deadline');
    }

    const competition = await this.prisma.competition.create({
      data: {
        title: dto.title,
        description: dto.description,
        tags: dto.tags || [],
        capacity: dto.capacity,
        seatsLeft: dto.capacity,
        regDeadline,
        startDate,
        organizerId,
      },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return competition;
  }

  async findAll(filters?: { search?: string; tags?: string[] }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      regDeadline: {
        gte: new Date(),
      },
    };

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.tags && filters.tags.length > 0) {
      where.tags = {
        hasSome: filters.tags,
      };
    }

    const competitions = await this.prisma.competition.findMany({
      where,
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            registrations: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return competitions;
  }

  async findOne(id: string) {
    const competition = await this.prisma.competition.findUnique({
      where: { id },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            registrations: true,
          },
        },
      },
    });

    if (!competition) {
      throw new NotFoundException('Competition not found');
    }

    return competition;
  }

  async findByOrganizer(organizerId: string) {
    return this.prisma.competition.findMany({
      where: { organizerId },
      include: {
        _count: {
          select: {
            registrations: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
