import axios, { CanceledError } from 'axios';
import { useSessionStore } from '../../context/session';

export abstract class BaseService {
  protected readonly client = axios.create({ baseURL: '/api/v1', timeout: 15000 });

  protected constructor() {
    this.client.interceptors.request.use(config => {
      const userId = useSessionStore.getState().userId;
      if (userId) config.headers.set('X-User-Id', userId);
      return config;
    }, undefined, { synchronous: true });
    this.client.interceptors.response.use(response => {
      const requestUserId = response.config.headers.get('X-User-Id') || null;
      if (requestUserId !== useSessionStore.getState().userId) throw new CanceledError('O usuário foi alterado.');
      return response;
    }, (error: unknown) => {
      if (axios.isAxiosError(error)) {
        const requestUserId = error.config?.headers.get('X-User-Id');
        if (error.response?.status === 401 && requestUserId && requestUserId === useSessionStore.getState().userId) {
          useSessionStore.getState().setUserId(null);
        }
      }
      return Promise.reject(error);
    });
  }
}
