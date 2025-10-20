import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    prisma = app.get<PrismaService>(PrismaService);
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Check', () => {
    it('/ (GET) - should return health status', () => {
      return request(app.getHttpServer())
        .get('/api')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'ok');
          expect(res.body).toHaveProperty('timestamp');
          expect(res.body).toHaveProperty('service', 'mini-compete-api');
        });
    });

    it('/health (GET) - should return detailed health', () => {
      return request(app.getHttpServer())
        .get('/api/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'ok');
          expect(res.body).toHaveProperty('checks');
          expect(res.body.checks).toHaveProperty('database');
        });
    });
  });

  describe('Authentication', () => {
    const testUser = {
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
      password: 'password123',
      role: 'PARTICIPANT',
    };

    let authToken: string;

    it('/auth/signup (POST) - should create new user', () => {
      return request(app.getHttpServer())
        .post('/api/auth/signup')
        .send(testUser)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('token');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user.email).toBe(testUser.email);
          authToken = res.body.token;
        });
    });

    it('/auth/signup (POST) - should fail with duplicate email', () => {
      return request(app.getHttpServer())
        .post('/api/auth/signup')
        .send(testUser)
        .expect(409);
    });

    it('/auth/login (POST) - should login successfully', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('token');
          expect(res.body).toHaveProperty('user');
        });
    });

    it('/auth/login (POST) - should fail with wrong password', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        })
        .expect(401);
    });
  });

  describe('Competitions', () => {
    let organizerToken: string;
    let participantToken: string;
    let competitionId: string;

    beforeAll(async () => {
      // Create organizer
      const orgRes = await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send({
          name: 'Test Organizer',
          email: `organizer-${Date.now()}@example.com`,
          password: 'password123',
          role: 'ORGANIZER',
        });
      organizerToken = orgRes.body.token;

      // Create participant
      const partRes = await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send({
          name: 'Test Participant',
          email: `participant-${Date.now()}@example.com`,
          password: 'password123',
          role: 'PARTICIPANT',
        });
      participantToken = partRes.body.token;
    });

    it('/competitions (POST) - should create competition as organizer', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      return request(app.getHttpServer())
        .post('/api/competitions')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({
          title: 'E2E Test Competition',
          description: 'Test competition for e2e testing',
          tags: ['test', 'e2e'],
          capacity: 10,
          regDeadline: futureDate.toISOString(),
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.title).toBe('E2E Test Competition');
          competitionId = res.body.id;
        });
    });

    it('/competitions (POST) - should fail without auth', () => {
      return request(app.getHttpServer())
        .post('/api/competitions')
        .send({
          title: 'Should Fail',
          description: 'Test',
          capacity: 10,
          regDeadline: new Date().toISOString(),
        })
        .expect(401);
    });

    it('/competitions (GET) - should list competitions', () => {
      return request(app.getHttpServer())
        .get('/api/competitions')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('/competitions/:id (GET) - should get competition by id', () => {
      return request(app.getHttpServer())
        .get(`/api/competitions/${competitionId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(competitionId);
          expect(res.body.title).toBe('E2E Test Competition');
        });
    });

    it('/competitions/:id/register (POST) - should register participant', () => {
      return request(app.getHttpServer())
        .post(`/api/competitions/${competitionId}/register`)
        .set('Authorization', `Bearer ${participantToken}`)
        .set('Idempotency-Key', `test-${Date.now()}`)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.competitionId).toBe(competitionId);
        });
    });

    it('/competitions/:id/register (POST) - should be idempotent', async () => {
      const idempotencyKey = `test-idempotent-${Date.now()}`;
      
      // Create new participant for this test
      const newPartRes = await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send({
          name: 'Idempotency Test',
          email: `idempotent-${Date.now()}@example.com`,
          password: 'password123',
          role: 'PARTICIPANT',
        });
      const newToken = newPartRes.body.token;

      // First request
      const firstRes = await request(app.getHttpServer())
        .post(`/api/competitions/${competitionId}/register`)
        .set('Authorization', `Bearer ${newToken}`)
        .set('Idempotency-Key', idempotencyKey)
        .expect(201);

      // Second request with same key
      const secondRes = await request(app.getHttpServer())
        .post(`/api/competitions/${competitionId}/register`)
        .set('Authorization', `Bearer ${newToken}`)
        .set('Idempotency-Key', idempotencyKey)
        .expect(201);

      // Should return same registration
      expect(firstRes.body.id).toBe(secondRes.body.id);
    });

    it('/competitions/:id/register (POST) - should fail for duplicate registration', async () => {
      // Try to register again without idempotency key
      return request(app.getHttpServer())
        .post(`/api/competitions/${competitionId}/register`)
        .set('Authorization', `Bearer ${participantToken}`)
        .expect(409);
    });
  });
});