export interface TransactionType {
  id: string;
  code: string;
  name: string;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
