
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
	children: ElementProps[];
}

export interface Vector2D {
	x: number;
	y: number;
}