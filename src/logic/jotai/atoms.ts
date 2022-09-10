import { Atom, atom, Getter, PrimitiveAtom, WritableAtom } from 'jotai';
import { ToDo } from '../types';
import api from '../shared/api';
import messages from '../shared/messages';
import { selectAtom } from 'jotai/utils';
import isEqual from 'lodash.isequal';

type Molecule<Arg = undefined> = [
  isFetchingAtom: PrimitiveAtom<boolean>,
  errorAtom: PrimitiveAtom<string | null>,
  fetchAtom: WritableAtom<null, Arg>
];

function molecule<Data, Arg = undefined>(
  dataAtom: PrimitiveAtom<Data>, fetchData: (arg: Arg, get: Getter) => Promise<Data | ((curr: Data) => Data)>
): Molecule<Arg> {
  const isFetchingAtom = atom<boolean>(false);
  const errorAtom = atom<string | null>(null);

  const fetchAtom = atom(
    null,
    async (get, set, update: Arg) => {
      set(isFetchingAtom, true);
      set(errorAtom, null);
      try {
        const result = await fetchData(update, get);
        set(dataAtom, result);
      } catch (e) {
        set(errorAtom, e as string);
      } finally {
        set(isFetchingAtom, false);
      }
    }
  );

  return [isFetchingAtom, errorAtom, fetchAtom];
}

const currentUsernameAtom = atom<string>('');

const toDosAtom = atom<ToDo[]>([]);

const [
  isFetchingToDosAtom,
  toDosFetchingErrorAtom,
  fetchToDosAtom,
] = molecule<ToDo[]>(toDosAtom, (_, get) => {
  const currentUsername = get(currentUsernameAtom);
  return currentUsername
    ? api.fetchToDosForUsername(currentUsername)
    : Promise.reject(messages.noUsername);
});

const changeCurrentUsernameAtom = atom(
  null,
  async (get, set, newUsername: string) => {
    if (get(currentUsernameAtom) === newUsername) {
      return;
    }
    set(currentUsernameAtom, newUsername);
    await set(fetchToDosAtom);
  }
);

const [
  isCreatingToDoAtom,
  createToDoErrorAtom,
  createToDoAtom,
] = molecule<ToDo[], string>(toDosAtom, async (text, get) => {
  if (!text) {
    return Promise.reject(messages.noText);
  }
  const currentUsername = get(currentUsernameAtom);
  if (!currentUsername) {
    return Promise.reject(messages.noUsername);
  }
  const newToDo = await api.createToDo(text, get(currentUsernameAtom));
  return curr => [...curr, newToDo];
});

const toDoIdsAtom = selectAtom(toDosAtom, toDos => toDos.map(toDo => toDo.id), isEqual);

function isFunc(v: unknown): v is CallableFunction {
  return typeof v === 'function';
}

function applyUpdate<T>(update: T | ((prev: T) => T), v: T): T {
  return isFunc(update) ? update(v) : update;
}

function getToDoAtom(id: number): PrimitiveAtom<ToDo> {
  let prevValue: ToDo;
  return atom(get => {
    const toDo = get(toDosAtom).find(someToDo => someToDo.id === id) as ToDo;
    if (!isEqual(prevValue, toDo)) {
      prevValue = toDo;
    }
    return prevValue;
  }, (_, set, update) => {
    set(toDosAtom, curr => curr.map(toDo => toDo.id === id ? applyUpdate(update, toDo) : toDo));
  });
}

function getRemoveToDoMolecule(id: number): Molecule {
  return molecule<ToDo[]>(toDosAtom, async () => {
    await api.removeToDo(id);
    return curr => curr.filter(toDoAtom => toDoAtom.id !== id);
  });
}

function getChangeToDoDoneMolecule(coreAtom: PrimitiveAtom<ToDo>): Molecule<boolean> {
  return molecule<ToDo, boolean>(
    coreAtom,
    (newDoneValue, get) => api.changeToDoDone({ id: get(coreAtom).id, newDoneValue })
  );
}

function combineAtoms<T>(atomA: PrimitiveAtom<T>, atomB: PrimitiveAtom<T>): Atom<T> {
  return atom<T>(get => get(atomA) || get(atomB));
}

const areInputsDisabledAtom = combineAtoms(isCreatingToDoAtom, isFetchingToDosAtom);

export {
  currentUsernameAtom,
  changeCurrentUsernameAtom,
  areInputsDisabledAtom,
  toDoIdsAtom,
  fetchToDosAtom,
  isFetchingToDosAtom,
  toDosFetchingErrorAtom,
  getToDoAtom,
  getRemoveToDoMolecule,
  getChangeToDoDoneMolecule,
  combineAtoms,
  createToDoAtom,
  createToDoErrorAtom,
};