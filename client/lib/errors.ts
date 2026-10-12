import { ApiError } from './api';

const ERROR_MESSAGES: Record<string, string> = {
  'started_at cannot be in the future': 'A data de início não pode estar no futuro.',
  'started_at cannot be more than 10 days ago': 'A data de início não pode ser anterior a 10 dias.',
  'duration cannot exceed 24 hours': 'A duração máxima é de 24 horas.',
  'tag does not belong to project': 'A tag não pertence ao projeto selecionado.',
  'project is archived': 'O projeto está arquivado.',
  'client is inactive': 'O cliente está inativo.',
  'time entry not found': 'Apontamento não encontrado.',
  'projectId should not be empty': 'Selecione um projeto antes de parar o timer.',
  'projectId must be a uuid': 'Selecione um projeto válido.',
};

function normalizeMessage(message: string): string {
  const lower = message.toLowerCase();
  for (const [key, translated] of Object.entries(ERROR_MESSAGES)) {
    if (lower.includes(key)) {
      return translated;
    }
  }
  return message;
}

export function getErrorMessage(error: unknown, fallback = 'Ocorreu um erro inesperado.'): string {
  if (error instanceof ApiError) {
    return normalizeMessage(error.message);
  }
  if (error instanceof Error && error.message) {
    return normalizeMessage(error.message);
  }
  return fallback;
}
