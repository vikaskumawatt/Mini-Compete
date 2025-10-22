export interface User {
  id: string;
  email: string;
  name: string;
  role: 'PARTICIPANT' | 'ORGANIZER';
}

export interface Competition {
  id: string;
  title: string;
  description: string;
  tags: string[];
  capacity: number;
  seatsLeft: number;
  regDeadline: string;
  startDate?: string;
  organizerId: string;
  organizer: {
    id: string;
    name: string;
    email: string;
  };
  _count?: {
    registrations: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Registration {
  id: string;
  userId: string;
  competitionId: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'FAILED';
  registeredAt: string;
  competition: Competition;
}

export interface MailBox {
  id: string;
  userId: string;
  to: string;
  subject: string;
  body: string;
  sentAt: string;
}
