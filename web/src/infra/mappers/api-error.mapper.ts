import axios from 'axios';
import { ApiError } from '../../types/api-error';

const messages: Record<string, string> = {
  'Start date must be before or equal to end date': 'A data inicial deve ser anterior ou igual à data final.',
  'Select a valid transaction type': 'Selecione um tipo de transação válido.',
  'Transaction not found': 'Transação não encontrada.',
  'Supplier not found': 'Fornecedor não encontrado.',
  'Amount must be greater than zero, with exactly two decimal places': 'O valor deve ser maior que zero e ter exatamente duas casas decimais.',
  'This transaction changed. Refresh it before saving.': 'Esta transação foi alterada. Atualize-a antes de salvar.',
  'This transaction changed. Refresh it before deleting.': 'Esta transação foi alterada. Atualize-a antes de excluí-la.',
  'This supplier changed. Refresh it before saving.': 'Este fornecedor foi alterado. Atualize-o antes de salvar.',
  'No authenticated session is configured': 'Nenhuma sessão autenticada foi configurada.',
  'The development profile is unavailable. Run the demo seed.': 'O perfil de desenvolvimento não está disponível. Execute a carga de dados de demonstração.',
  'Record not found': 'Registro não encontrado.',
  'Related record does not exist': 'O registro relacionado não existe.',
  'Internal server error': 'Erro interno do servidor.',
};

function translateMessage(value: string): string {
  if (messages[value]) return messages[value];
  if (value.startsWith('A record with this ') && value.endsWith(' already exists')) return `Já existe um registro com este ${value.slice(19, -15)}.`;
  return value;
}

export function toApiError(error: unknown): ApiError {
 if (axios.isAxiosError(error)) {
  const message: unknown = error.response?.data?.message;
  return new ApiError(Array.isArray(message) ? message.map(item => typeof item === 'string' ? translateMessage(item) : String(item)).join('. ') : typeof message === 'string' ? translateMessage(message) : 'Não foi possível conectar. Verifique sua conexão e tente novamente.', error.response?.status);
 }
 return error instanceof ApiError ? error : new ApiError('Algo deu errado. Tente novamente.');
}
