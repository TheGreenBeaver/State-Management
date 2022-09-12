import create from 'zustand';
import { AppState, initialAppState } from '../shared/appState';
import api from '../shared/api';
import { ToDo } from '../types';

type ZustandState = AppState & {
  fetchToDos: () => Promise<void>,
  changeCurrentUsername: (newUsername: string) => void,
  changeToDoDone: (data: { id: number, newDoneValue: boolean }) => Promise<void>,
  removeToDo: (id: number) => Promise<void>,
  createToDo: (text: string) => Promise<void>,
};

const useToDosStore = create<ZustandState>()((set, get) => ({
  ...initialAppState,
  async fetchToDos() {
    const currentUsername = get().currentUsername;
    if (!currentUsername) {
      return;
    }
    set({ isFetchingToDos: true, toDosFetchingError: null });
    try {
      set({ toDos: await api.fetchToDosForUsername(currentUsername) });
    } catch (e) {
      set({ toDosFetchingError: e as string });
    } finally {
      set({ isFetchingToDos: false });
    }
  },
  async changeCurrentUsername(newUsername) {
    const currentUsername = get().currentUsername;
    if (currentUsername === newUsername) {
      return;
    }
    set({ currentUsername: newUsername });
    await get().fetchToDos();
  },
  async changeToDoDone(data) {
    set(state => ({
      ...state,
      toDoErrors: state.toDoErrors.filter(err => err.id !== data.id),
      processingToDoIds: [...state.processingToDoIds, data.id],
    }));
    try {
      const updatedToDo: ToDo = await api.changeToDoDone(data);
      set(state => ({ ...state, toDos: state.toDos.map(toDo => toDo.id === data.id ? updatedToDo : toDo) }));
    } catch (e) {
      set(state => ({ ...state, toDoErrors: [...state.toDoErrors, { id: data.id, error: e as string }] }));
    } finally {
      set(state => ({ ...state, processingToDoIds: state.processingToDoIds.filter(id => id !== data.id) }));
    }
  },
  async removeToDo(id) {
    set(state => ({
      ...state,
      toDoErrors: state.toDoErrors.filter(err => err.id !== id),
      processingToDoIds: [...state.processingToDoIds, id],
    }));
    try {
      await api.removeToDo(id);
      set(state => ({ ...state, toDos: state.toDos.filter(toDo => toDo.id !== id) }));
    } catch (e) {
      set(state => ({ ...state, toDoErrors: [...state.toDoErrors, { id, error: e as string }] }));
    } finally {
      set(state => ({ ...state, processingToDoIds: state.processingToDoIds.filter(otherId => otherId !== id) }));
    }
  },
  async createToDo(text) {
    const currentUsername = get().currentUsername;
    if (!currentUsername || !text) {
      return;
    }
    set({ createToDoError: null, isCreatingToDo: true });
    try {
      const newToDo: ToDo = await api.createToDo(text, currentUsername);
      set(state => ({ ...state, toDos: [...state.toDos, newToDo] }));
    } catch (e) {
      set({ createToDoError: e as string });
    } finally {
      set({ isCreatingToDo: false });
    }
  },
}));

export default useToDosStore;