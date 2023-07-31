export interface ElementProps {
	id: number;
	x: number;
	y: number;
	width: number;
	height: number;
	color: string;
	isChildren: boolean;
}

export interface ColorData {
	color: string;
	warp: string;
	rotation: number;
	children: ElementProps[];
}

export interface Vector2D {
	x: number;
	y: number;
}

export interface Rect {
	x: number;
	y: number;
	width: number;
	height: number;
}

export type Action = {
	elements: ElementProps[];
	colors: ColorData[];
}[];

export interface Options {
	currentColor: string;
	maxRecursion: number;
	mode: "default" | "move" | "rotate";
}
