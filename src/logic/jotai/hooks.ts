import { CreateToDoLogic, SingleToDoLogic, ToDoListLogic, UsernameInputLogic } from '../types';
import { useAtom, useAtomValue } from 'jotai';
import { useUpdateAtom } from 'jotai/utils';
import {
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
} from './atoms';
import { useMemo } from 'react';

const useUsernameInput: UsernameInputLogic = () => {
  const currentUsername = useAtomValue(currentUsernameAtom);
  const setCurrentUsername = useUpdateAtom(changeCurrentUsernameAtom);
  const [isDisabled] = useAtom(areInputsDisabledAtom);
  return { setCurrentUsername, currentUsername, isDisabled };
};

const useToDoList: ToDoListLogic = () => {
  const toDoIds = useAtomValue(toDoIdsAtom);
  const retryFetching = useUpdateAtom(fetchToDosAtom);
  const isFetching = useAtomValue(isFetchingToDosAtom);
  const error = useAtomValue(toDosFetchingErrorAtom);
  return { toDoIds, retryFetching, isFetching, error };
};

const useSingleToDo: SingleToDoLogic = id => {
  const coreAtom = useMemo(() => getToDoAtom(id), [id]);
  const [isRemovingAtom, removalErrorAtom, removeAtom] = useMemo(() => getRemoveToDoMolecule(id), [id]);
  const [
    isChangingDoneAtom,
    doneChangeErrorAtom,
    changeDoneAtom,
  ] = useMemo(() => getChangeToDoDoneMolecule(coreAtom), [coreAtom]);
  const isProcessingAtom = useMemo(
    () => combineAtoms(isRemovingAtom, isChangingDoneAtom),
    [isRemovingAtom, isChangingDoneAtom],
  );
  const errorAtom = useMemo(
    () => combineAtoms(removalErrorAtom, doneChangeErrorAtom),
    [removalErrorAtom, doneChangeErrorAtom],
  );
  const remove = useUpdateAtom(removeAtom);
  const changeDone = useUpdateAtom(changeDoneAtom);
  const toDo = useAtomValue(coreAtom);
  const isProcessing = useAtomValue(isProcessingAtom);
  const error = useAtomValue(errorAtom);
  return { toDo, isProcessing, error, remove, changeDone };
};

const useCreateToDo: CreateToDoLogic = () => {
  const isDisabled = useAtomValue(areInputsDisabledAtom);
  const createToDo = useUpdateAtom(createToDoAtom);
  const error = useAtomValue(createToDoErrorAtom);
  return { createToDo, error, isDisabled };
};

export { useUsernameInput, useToDoList, useSingleToDo, useCreateToDo };