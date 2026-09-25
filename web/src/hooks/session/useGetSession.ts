import { useQuery } from '@tanstack/react-query';
import { SessionService } from '../../infra/services';
import { toSession } from '../../infra/mappers/session.mapper';
import { toApiError } from '../../infra/mappers/api-error.mapper';
import { QUERY_KEYS } from '../query-keys';
import { useSessionStore } from '../../context/session';
import type { Session } from '../../types/session';

export type GetSessionResult = Session;

export function useGetSession() {
  const userId = useSessionStore(state => state.userId);
  return useQuery({
    queryKey: [QUERY_KEYS.session, userId], enabled: !!userId, retry: false, staleTime: 60000,
    queryFn: async ({ signal }): Promise<GetSessionResult> => {
      try { return toSession(await SessionService.getInstance().get(signal)) }
      catch (error) { throw toApiError(error) }
    },
  });
}
