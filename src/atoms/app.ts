import { atom } from "jotai";
import { ColorData, ElementProps, Action, Options } from "../../interfaces";

export const colorsDataAtom = atom<ColorData[]>([]);
export const elementsAtom = atom<ElementProps[]>([]);
export const optionsAtom = atom<Options>({
	currentColor: "#4a20cb",
	maxRecursion: 5,
	mode: "default",
});

export const actionsAtom = atom<Action>([]);
export const undoneActionsAtom = atom<Action>([]);
export const debugModeAtom = atom(
	localStorage.getItem("debugMode") === "true" || false
);

export const rotationAtom = atom(0);
export const currentTargetAtom = atom<HTMLElement | undefined>(undefined);
export const currentColorTargetAtom = atom<string|undefined>(undefined);