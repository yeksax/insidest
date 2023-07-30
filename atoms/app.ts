import { atom } from "jotai";
import { ColorData, ElementProps, Action } from "../interfaces";

export const colorsDataAtom = atom<ColorData[]>([]);
export const elementsAtom = atom<ElementProps[]>([]);
export const optionsAtom = atom({
	currentColor: "#4a20cb",
	maxRecursion: 5,
});

export const actionsAtom = atom<Action>([]);
export const undoneActionsAtom = atom<Action>([]);