import { proxy, snapshot } from 'valtio';
import { AppState, initialAppState } from '../shared/appState';
import api from '../api';
import { subscribeKey } from 'valtio/utils';
import messages from '../shared/messages';

const store = proxy<AppState>(initialAppState);

function changeCurrentUsername(newUsername: string) {
  store.currentUsername = newUsername;
}

async function fetchToDos() {
  const { currentUsername } = snapshot(store);
  if (!currentUsername) {
    store.toDosFetchingError = messages.noUsername;
    return;
  }
  store.toDosFetchingError = null;
  store.isFetchingToDos = true;
  try {
    store.toDos = await api.fetchToDosForUsername(currentUsername);
  } catch (e) {
    store.toDosFetchingError = e as string;
  } finally {
    store.isFetchingToDos = false;
  }
}

subscribeKey(store, 'currentUsername', fetchToDos);

async function changeToDoDone(id: number, newDoneValue: boolean) {
  store.processingToDoIds.push(id);
  store.toDoErrors = store.toDoErrors.filter(err => err.id !== id);
  try {
    const updatedToDo = await api.changeToDoDone({ id, newDoneValue });
    store.toDos = store.toDos.map(toDo => toDo.id === id ? updatedToDo : toDo);
  } catch (e) {
    store.toDoErrors.push({ error: e as string, id });
  } finally {
    store.processingToDoIds = store.processingToDoIds.filter(procId => procId !== id);
  }
}

async function removeToDo(id: number) {
  store.processingToDoIds.push(id);
  store.toDoErrors = store.toDoErrors.filter(err => err.id !== id);
  try {
    await api.removeToDo(id);
    store.toDos = store.toDos.filter(toDo => toDo.id !== id);
  } catch (e) {
    store.toDoErrors.push({ error: e as string, id });
  } finally {
    store.processingToDoIds = store.processingToDoIds.filter(procId => procId !== id);
  }
}

async function createToDo(text: string) {
  if (!text) {
    store.createToDoError = messages.noText;
    return;
  }
  const { currentUsername } = snapshot(store);
  if (!currentUsername) {
    store.createToDoError = messages.noUsername;
    return;
  }
  store.createToDoError = null;
  store.isCreatingToDo = true;
  try {
    const newToDo = await api.createToDo(text, currentUsername);
    store.toDos.push(newToDo);
  } catch (e) {
    store.createToDoError = e as string;
  } finally {
    store.isCreatingToDo = false;
  }
}

export const actions = {
  changeCurrentUsername,
  fetchToDos,
  changeToDoDone,
  removeToDo,
  createToDo,
};

export default store;