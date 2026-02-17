import { UserRole, UserStatus, OrganizationType } from './enums';

export interface IUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  status: UserStatus;
  organizationId?: string;
  roles: UserRole[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IJwtPayload {
  sub: string;
  email: string;
  roles: UserRole[];
  organizationId?: string;
  iat?: number;
  exp?: number;
}

export interface ILoginResponse {
  accessToken: string;
  refreshToken: string;
  user: Omit<IUser, 'createdAt' | 'updatedAt'>;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  timestamp: string;
}

export interface ErrorResponse {
  success: false;
  error: {
    statusCode: number;
    message: string;
    details?: unknown;
  };
  timestamp: string;
}

export interface IOrganization {
  id: string;
  name: string;
  type: OrganizationType;
  sigle?: string;
  address?: string;
  phone?: string;
  email?: string;
  nif?: string;
  rccm?: string;
  createdAt: Date;
  updatedAt: Date;
}
