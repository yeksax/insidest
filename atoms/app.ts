import { atom } from "jotai";
import { ColorData, ElementProps } from "../interfaces";

export const colorsDataAtom = atom<ColorData[]>([]);
export const elementsAtom = atom<ElementProps[]>([]);
export const optionsAtom = atom({
	currentColor: "#4a20cb",
  maxRecursion: 7,
});
