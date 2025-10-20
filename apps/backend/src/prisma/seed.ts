import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.failedJob.deleteMany();
  await prisma.idempotencyLog.deleteMany();
  await prisma.mailBox.deleteMany();
  await prisma.registration.deleteMany();
  await prisma.competition.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create Organizers
  const organizer1 = await prisma.user.create({
    data: {
      email: 'organizer1@minicompete.com',
      name: 'Alice Organizer',
      password: hashedPassword,
      role: Role.ORGANIZER,
    },
  });

  const organizer2 = await prisma.user.create({
    data: {
      email: 'organizer2@minicompete.com',
      name: 'Bob Organizer',
      password: hashedPassword,
      role: Role.ORGANIZER,
    },
  });

  console.log('✅ Created 2 organizers');

  // Create Participants
  const participants = [];
  for (let i = 1; i <= 5; i++) {
    const participant = await prisma.user.create({
      data: {
        email: `participant${i}@minicompete.com`,
        name: `Participant ${i}`,
        password: hashedPassword,
        role: Role.PARTICIPANT,
      },
    });
    participants.push(participant);
  }

  console.log('✅ Created 5 participants');

  // Create Competitions
  const now = new Date();
  const competitions = [
    {
      title: 'Code Sprint 2025',
      description: 'A 24-hour coding competition focused on building innovative applications.',
      tags: ['coding', 'hackathon', 'technology'],
      capacity: 50,
      seatsLeft: 50,
      regDeadline: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      startDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      organizerId: organizer1.id,
    },
    {
      title: 'AI Innovation Challenge',
      description: 'Compete to build the most innovative AI-powered solution for real-world problems.',
      tags: ['ai', 'machine-learning', 'innovation'],
      capacity: 30,
      seatsLeft: 30,
      regDeadline: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      startDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
      organizerId: organizer1.id,
    },
    {
      title: 'Startup Pitch Competition',
      description: 'Present your startup idea to investors and win funding.',
      tags: ['startup', 'business', 'pitching'],
      capacity: 20,
      seatsLeft: 20,
      regDeadline: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      startDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      organizerId: organizer2.id,
    },
    {
      title: 'Design Sprint Workshop',
      description: 'Collaborative design thinking workshop to solve UX challenges.',
      tags: ['design', 'ux', 'workshop'],
      capacity: 15,
      seatsLeft: 15,
      regDeadline: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
      startDate: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000),
      organizerId: organizer2.id,
    },
    {
      title: 'Data Science Marathon',
      description: 'Analyze real datasets and build predictive models in this intensive competition.',
      tags: ['data-science', 'analytics', 'statistics'],
      capacity: 40,
      seatsLeft: 40,
      regDeadline: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000),
      startDate: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
      organizerId: organizer1.id,
    },
  ];

  for (const comp of competitions) {
    await prisma.competition.create({ data: comp });
  }

  console.log('✅ Created 5 competitions');

  console.log('🎉 Seeding completed successfully!');
  console.log('\n📝 Test Credentials:');
  console.log('Organizers:');
  console.log('  - organizer1@minicompete.com / password123');
  console.log('  - organizer2@minicompete.com / password123');
  console.log('Participants:');
  console.log('  - participant1@minicompete.com / password123');
  console.log('  - participant2@minicompete.com / password123');
  console.log('  - participant3@minicompete.com / password123');
  console.log('  - participant4@minicompete.com / password123');
  console.log('  - participant5@minicompete.com / password123\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });