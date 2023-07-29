import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { MouseEvent, useState } from "react";
import { colorsDataAtom, elementsAtom, optionsAtom } from "../atoms/app";
import { ElementProps, Vector2D } from "../interfaces";
import { Menubar } from "./components/menubar";

function Element({ element, level }: { element: ElementProps; level: number }) {
	const colorsData = useAtomValue(colorsDataAtom);
	const options = useAtomValue(optionsAtom);

	const color = colorsData.find((el) => el.color === element.color);
	if (element.isChildren) {
		// console.log(colorsData, color, element.color);
	}

	return (
		<div
			className='border absolute'
			data-color={element.color}
			style={{
				background: level === 0 ? "rgb(24 24 27)" : undefined,
				borderColor: element.color,
				left: element.x * 100 + "%",
				top: element.y * 100 + "%",
				width: element.width * 100 + "%",
				height: element.height * 100 + "%",
			}}
		>
			{level < options.maxRecursion &&
				color?.children.map((el) => (
					<Element element={el} key={el.id} level={level + 1} />
				))}
		</div>
	);
}

function Main() {
	const [isCreating, setIsCreating] = useState(false);
	const [isCreatingChildren, setIsCreatingChildren] = useState(false);
	const [parentPosition, setParentPosition] = useState<DOMRect | null>(null);
	const [creationData, setCreationData] = useState<Vector2D | null>(null);
	const options = useAtomValue(optionsAtom);

	const [elements, setElements] = useAtom(elementsAtom);
	const setColorData = useSetAtom(colorsDataAtom);

	function createInit(e: MouseEvent) {
		setIsCreating(true);

		const isChildren = (e.target as HTMLElement).tagName === "DIV";
		const parentRect = (e.target as HTMLElement).getBoundingClientRect();

		const creationData = { x: e.clientX, y: e.clientY };

		setParentPosition(parentRect);
		setIsCreatingChildren(isChildren);
		setCreationData(creationData);
		const hexColor = options.currentColor;

		let x = Math.min(creationData!.x, e.clientX) / innerWidth;
		let y = Math.min(creationData!.y, e.clientY) / innerHeight;
		let width = (e.clientX - creationData!.x) / innerWidth;
		let height = (e.clientY - creationData!.y) / innerHeight;

		if (isCreatingChildren) {
			x =
				Math.min(
					creationData!.x - parentRect!.x,
					e.clientX - parentRect!.x
				) / parentRect!.width;
			y =
				Math.min(
					creationData!.y - parentRect!.y,
					e.clientY - parentRect!.y
				) / parentRect!.height;
			width = (e.clientX - creationData!.x) / parentRect!.width;
			height = (e.clientY - creationData!.y) / parentRect!.height;
		}

		const newElement = {
			id: elements.length,
			x,
			y,
			width: Math.abs(width),
			height: Math.abs(height),
			color: hexColor,
			isChildren,
		};

		setElements([...elements, newElement]);

		if (isChildren) {
			const parentColor = (e.target as HTMLElement).dataset.color;

			setColorData((prev) =>
				prev.map((color) =>
					color.color === parentColor
						? {
								...color,
								children: [...color.children, newElement],
						}
						: color
				)
			);
		}

		setColorData((prev) => [
			...prev,
			{
				color: hexColor,
				children: [],
			},
		]);
	}

	function createExit() {
		setIsCreating(false);
		setIsCreatingChildren(false);
		setParentPosition(null);
		setCreationData(null);
	}

	function createHandler(e: MouseEvent) {
		if (isCreating) {
			const element = elements[elements.length - 1];
			let width = (e.clientX - creationData!.x) / innerWidth;
			let height = (e.clientY - creationData!.y) / innerHeight;
			let x = Math.min(creationData!.x, e.clientX) / innerWidth;
			let y = Math.min(creationData!.y, e.clientY) / innerHeight;

			if (isCreatingChildren) {
				x =
					Math.min(
						creationData!.x - parentPosition!.x,
						e.clientX - parentPosition!.x
					) / parentPosition!.width;
				y =
					Math.min(
						creationData!.y - parentPosition!.y,
						e.clientY - parentPosition!.y
					) / parentPosition!.height;

				width = (e.clientX - creationData!.x) / parentPosition!.width;
				height = (e.clientY - creationData!.y) / parentPosition!.height;
			}

			element.width = Math.abs(width);
			element.height = Math.abs(height);
			element.x = x;
			element.y = y;

			setElements((prev) => [
				...prev.slice(0, elements.length - 1),
				elements[elements.length - 1],
			]);
		}
	}

	return (
		<main
			className='w-full h-full'
			onMouseDown={createInit}
			onMouseUp={createExit}
			onMouseMove={createHandler}
		>
			{elements
				.filter((element) => !element.isChildren)
				.map((element) => (
					<Element level={0} element={element} key={element.id} />
				))}
		</main>
	);
}

function App() {
	return (
		<>
			<Main />
			<Menubar />
		</>
	);
}

export default App;