import { useMutation } from '@tanstack/react-query';
import { SessionService } from '../../infra/services';
import { toSession, toSessionPayload } from '../../infra/mappers/session.mapper';
import { toApiError } from '../../infra/mappers/api-error.mapper';
import type { Session } from '../../types/session';

export interface CreateSessionParams { email: string }
export type CreateSessionResult = Session;

export function useCreateSession() {
  return useMutation({
    mutationFn: async ({ email }: CreateSessionParams): Promise<CreateSessionResult> => {
      try { return toSession(await SessionService.getInstance().create(toSessionPayload(email))) }
      catch (error) { throw toApiError(error) }
    },
  });
}
