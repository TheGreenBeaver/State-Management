import { action, computed, flow, makeObservable, observable, reaction } from 'mobx';
import { ToDo } from '../types';
import api from '../shared/api';

export class ToDoStore {
  error: string | null = null;
  isProcessing: boolean = false;
  toDo: ToDo;
  onRemove: () => void;

  constructor(toDo: ToDo, onRemove: () => void) {
    makeObservable(this, {
      error: observable,
      isProcessing: observable,
      toDo: observable,
      onRemove: false,
      changeDone: flow.bound,
      remove: flow.bound,
    });
    this.toDo = toDo;
    this.onRemove = onRemove;
  }

  *changeDone(newDoneValue: boolean) {
    this.isProcessing = true;
    try {
      this.toDo = yield api.changeToDoDone({ id: this.toDo.id, newDoneValue });
    } catch (e) {
      this.error = e as string;
    } finally {
      this.isProcessing = false;
    }
  }

  *remove() {
    this.isProcessing = true;
    try {
      yield api.removeToDo(this.toDo.id);
      this.onRemove();
    } catch (e) {
      this.error = e as string;
    } finally {
      this.isProcessing = false;
    }
  }
}

class AppStore {
  currentUsername = '';
  isFetchingToDos = false;
  toDos: ToDoStore[] = [];
  toDosFetchingError: string | null = null;
  createToDoError: string | null = null;
  isCreatingToDo = false;

  constructor() {
    makeObservable(this, {
      currentUsername: observable,
      isFetchingToDos: observable,
      toDos: observable,
      toDosFetchingError: observable,
      createToDoError: observable,
      isCreatingToDo: observable,
      fetchToDos: flow.bound,
      changeCurrentUsername: action.bound,
      areInputsDisabled: computed,
      toDoIds: computed,
      createToDo: flow.bound,
    });
    reaction(
      () => this.currentUsername,
      (value, previousValue) => value && previousValue !== value && this.fetchToDos(),
    );
  }

  get areInputsDisabled() {
    return this.isFetchingToDos || this.isCreatingToDo;
  }

  get toDoIds() {
    return this.toDos.map(toDoStore => toDoStore.toDo.id);
  }

  private onRemoveToDo(id: number) {
    this.toDos = this.toDos.filter(toDoStore => toDoStore.toDo.id !== id);
  }

  *fetchToDos() {
    if (!this.currentUsername) {
      return;
    }
    this.isFetchingToDos = true;
    try {
      const toDos: ToDo[] = yield api.fetchToDosForUsername(this.currentUsername);
      this.toDos = toDos.map(toDo => new ToDoStore(toDo, () => this.onRemoveToDo(toDo.id)));
    } catch (e) {
      this.toDosFetchingError = e as string;
    } finally {
      this.isFetchingToDos = false;
    }
  }

  *createToDo(text: string) {
    if (!this.currentUsername || !text) {
      return;
    }
    this.isCreatingToDo = true;
    try {
      const newToDo: ToDo = yield api.createToDo(text, this.currentUsername);
      this.toDos.push(new ToDoStore(newToDo, () => this.onRemoveToDo(newToDo.id)));
    } catch (e) {
      this.createToDoError = e as string;
    } finally {
      this.isCreatingToDo = false;
    }
  }

  changeCurrentUsername(newUsername: string) {
    this.currentUsername = newUsername;
  }
}

const appStore = new AppStore();

export default appStore;