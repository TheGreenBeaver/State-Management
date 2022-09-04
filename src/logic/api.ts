import axios from 'axios';
import { ToDo } from './types';

const instance = axios.create({ baseURL: 'http://localhost:8000/todos' });
instance.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response) {
      return Promise.reject(error.response.data?.message || error.response.statusText || `${error.response.status}`);
    }
    return Promise.reject(error.message ?? 'No response from server');
  }
);

const api = {
  async fetchToDosForUsername(username: string): Promise<ToDo[]> {
    return await instance.get(`/?username=${username}`);
  },
  async changeToDoDone({ id, newDoneValue }: { id: number, newDoneValue: boolean }): Promise<ToDo> {
    return await instance.patch(`/${id}`, { done: newDoneValue });
  },
  async removeToDo(id: number): Promise<unknown> {
    return await instance.delete(`/${id}`);
  },
  async createToDo(text: string, username: string): Promise<ToDo> {
    return await instance.post('', { text, username, done: false });
  },
};

export default api;