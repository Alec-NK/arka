export interface User {
  id: string;
  email: string;
  name: string | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  email: string;
  name: string | null;
}

export interface UpdateUserInput {
  email?: string;
  name?: string | null;
}
