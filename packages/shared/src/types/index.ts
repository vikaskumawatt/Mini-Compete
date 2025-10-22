// Shared types between frontend and backend

export enum Role {
  PARTICIPANT = 'PARTICIPANT',
  ORGANIZER = 'ORGANIZER',
}

export enum RegistrationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
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
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface Registration {
  id: string;
  userId: string;
  competitionId: string;
  status: RegistrationStatus;
  idempotencyKey?: string;
  registeredAt: string;
  updatedAt: string;
}

export interface MailBox {
  id: string;
  userId: string;
  to: string;
  subject: string;
  body: string;
  sentAt: string;
}

export interface AuthResponse {
  token: string;
  user: Omit<User, 'password'>;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
