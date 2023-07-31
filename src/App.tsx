import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { MouseEvent, useEffect, useState, useRef } from "react";
import {
	actionsAtom,
	colorsDataAtom,
	currentColorTargetAtom,
	currentTargetAtom,
	debugModeAtom,
	elementsAtom,
	optionsAtom,
	rotationAtom,
	undoneActionsAtom,
} from "./atoms/app";
import { ElementProps, Rect, Vector2D } from "../interfaces";
import { Menubar } from "./components/menubar";

const FPS_INTERVAL = 10;

function Element({ element, level }: { element: ElementProps; level: number }) {
	const [colorsData, setColorsData] = useAtom(colorsDataAtom);
	const setCurrentColorTarget = useSetAtom(currentColorTargetAtom);
	const setCurrentRotation = useSetAtom(rotationAtom);
	const setCurrentTarget = useSetAtom(currentTargetAtom);
	const debugMode = useAtomValue(debugModeAtom);

	const options = useAtomValue(optionsAtom);

	const color = colorsData.find((el) => el.color === element.color);

	function rotateInit(e: MouseEvent) {
		const element = e.target as HTMLElement;
		const rect = element.getBoundingClientRect()

		const middleX = rect.left + rect.width / 2;
		const middleY = rect.top + rect.height / 2;

		const angle = Math.atan2(e.clientY - middleY, e.clientX - middleX);
		const rotation = angle * (180 / Math.PI);

		setCurrentRotation(rotation)
		setCurrentColorTarget(element.dataset.color);
		setCurrentTarget(element);
	}

	function initHandler(e: MouseEvent) {
		if (options.mode === "default") {
			// createInit(e);
		} else if (options.mode === "rotate") {
			rotateInit(e);
		} else {
			//
		}
	}

	function moveHandler(e: MouseEvent) {
		if (options.mode === "default") {
			// createHandler(e);
		} else if (options.mode === "rotate") {
			// rotateHandler(e);
		} else {
			//TODO
		}
	}

	function exitHandler(e: MouseEvent) {
		if (options.mode === "default") {
			// createExit();
		} else if (options.mode === "rotate") {
			// rotateExit();
		} else {
			//TODO
		}
	}

	if (!color) return <></>

	return (
		<span
			className={`border absolute select-none text-xs`}
			onMouseDown={initHandler}
			onMouseMove={moveHandler}
			onMouseUp={exitHandler}
			data-color={element.color}
			data-rotation={color?.rotation}
			style={{
				// background: level === 0 ? "rgb(24 24 27)" : undefined,
				rotate: `${color?.rotation}deg`,
				content: `${element.color}deg`,
				borderColor: element.color,
				left: element.x * 100 + "%",
				top: element.y * 100 + "%",
				width: element.width * 100 + "%",
				height: element.height * 100 + "%",
			}}
		>
			{debugMode && `${(color.rotation * level).toFixed(2)}deg`}

			{level < options.maxRecursion &&
				color.children.map((el) => (
					<Element element={el} key={el.id} level={level + 1} />
				))}
		</span>
	);
}

function Main() {
	const [isCreating, setIsCreating] = useState(false);
	const [parentPosition, setParentPosition] = useState<DOMRect | null>(null);
	const [creationData, setCreationData] = useState<Vector2D | null>(null);
	const [options, setOptions] = useAtom(optionsAtom);
	const [actions, setActions] = useAtom(actionsAtom);
	const setUndoneActions = useSetAtom(undoneActionsAtom);
	const [currentColorTarget, setCurrentColorTarget] = useAtom(currentColorTargetAtom);
	const [currentRotation, setCurrentRotation] = useAtom(rotationAtom);
	const [currentTarget, setCurrentTarget] = useAtom(currentTargetAtom);

	const [elements, setElements] = useAtom(elementsAtom);
	const [colorsData, setColorsData] = useAtom(colorsDataAtom);

	useEffect(() => {
		if (actions.length > 0) {
			setElements(actions[actions.length - 1].elements);
			setColorsData(actions[actions.length - 1].colors);
		} else {
			setElements([]);
			setColorsData([]);
		}
	}, [actions]);

	function positionCalculator(
		initialPos: Vector2D,
		currentPos: Vector2D,
		parentRect: DOMRect,
		keybinds: { ctrlKey: boolean; shiftKey: boolean }
	): Rect {
		const refWidth = parentRect.width;
		const refHeight = parentRect.height;
		const usesKeybind = keybinds.ctrlKey || keybinds.shiftKey;

		const xDiff = currentPos.x - initialPos.x;
		const yDiff = currentPos.y - initialPos.y;

		const parentXAspectRatio = refWidth / refHeight;
		const parentYAspectRatio = refHeight / refWidth;

		let x = Math.min(initialPos.x, currentPos.x) - parentRect.x;
		let y = Math.min(initialPos.y, currentPos.y) - parentRect.y;
		let width = Math.abs(xDiff) / refWidth;
		let height = Math.abs(yDiff) / refHeight;

		if (keybinds.ctrlKey) {
			if (xDiff > yDiff) width = height;
			else height = width;
		}

		if (keybinds.shiftKey) {
			if (xDiff > yDiff) width = height / parentXAspectRatio;
			else height = width / parentYAspectRatio;
		}

		if (usesKeybind) {
			if (xDiff < 0 && yDiff < 0) {
				x += (width - initialPos.x - currentPos.x) / refWidth;
				y += (height - initialPos.y - currentPos.y) / refHeight;
				// y += (width - initialPos);
			}
		}

		return {
			x: x / refWidth,
			y: y / refHeight,
			width,
			height,
		};
	}

	function createInit(e: MouseEvent) {
		const hexColor = options.currentColor;
		const isChildren = (e.target as HTMLElement).tagName === "SPAN";
		const parentRect = (e.target as HTMLElement).getBoundingClientRect();

		setIsCreating(true);
		setCreationData({ x: e.clientX, y: e.clientY });
		setParentPosition(parentRect);

		const { height, width, x, y } = positionCalculator(
			{ x: e.clientX, y: e.clientY },
			{ x: e.clientX, y: e.clientY },
			parentRect,
			{
				ctrlKey: e.ctrlKey,
				shiftKey: e.shiftKey,
			}
		);

		const newElement = {
			id: elements.length,
			x,
			y,
			width,
			height,
			color: hexColor,
			isChildren,
		};

		setElements([...elements, newElement]);

		if (isChildren) {
			const parentColor = (e.target as HTMLElement).dataset.color;
			setColorsData((prev) =>
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

		if (colorsData.find((el) => el.color === hexColor) === undefined)
			setColorsData((prev) => [
				...prev,
				{
					rotation: 0,
					warp: "",
					color: hexColor,
					children: [],
				},
			]);
	}

	function createExit() {
		setActions((prev) => [...prev, { elements, colors: colorsData }]);
		setUndoneActions([]);
		setIsCreating(false);
		setParentPosition(null);
		setCreationData(null);
	}

	function createHandler(e: MouseEvent) {
		if (isCreating) {
			const element = elements[elements.length - 1];

			const { height, width, x, y } = positionCalculator(
				creationData!,
				{ x: e.clientX, y: e.clientY },
				parentPosition!,
				{
					ctrlKey: e.ctrlKey,
					shiftKey: e.shiftKey,
				}
			);

			element.width = width;
			element.height = height;
			element.x = x;
			element.y = y;

			setElements((prev) => [
				...prev.slice(0, elements.length - 1),
				element,
			]);
		}
	}

	function rotateHandler(e: MouseEvent) {
		const rect = currentTarget?.getBoundingClientRect();

		if (!rect) return;

		const middleX = rect.left + rect.width / 2;
		const middleY = rect.top + rect.height / 2;

		const angle = Math.atan2(e.clientY - middleY, e.clientX - middleX);

		setCurrentRotation(angle * (180 / Math.PI));
		const rotation = (angle * (180 / Math.PI)) - currentRotation;

		setColorsData((prev) =>
			prev.map((color) => {
				if (color.color !== currentTarget!.dataset.color) return color;

				return {
					...color,
					rotation: color.rotation + rotation,
				};
			})
		);
	}

	function rotateExit() {
		setCurrentColorTarget(undefined);
		setCurrentTarget(undefined);
		setActions((prev) => [...prev, { elements, colors: colorsData }]);
		setUndoneActions([]);
	}

	function initHandler(e: MouseEvent) {
		if (options.mode === "default") {
			createInit(e);
		} else if (options.mode === "rotate") {
			// rotateInit(e);
		} else {
			//
		}
	}

	function moveHandler(e: MouseEvent) {
		if (options.mode === "default") {
			createHandler(e);
		} else if (options.mode === "rotate") {
			rotateHandler(e);
		} else {
			//TODO
		}
	}

	function exitHandler(e: MouseEvent) {
		if (options.mode === "default") {
			createExit();
		} else if (options.mode === "rotate") {
			rotateExit();
		} else {
			//TODO
		}
	}

	return (
		<main
			id='main'
			className='w-full h-full'
			onMouseDown={initHandler}
			onMouseMove={moveHandler}
			onMouseUp={exitHandler}
		>
			{elements
				.filter((element) => !element.isChildren)
				.map((element) => (
					<Element level={0} element={element} key={element.id} />
				))}
		</main>
	);
}

function FPSCounter() {
	const [fps, setFPS] = useState("0.00");
	const intervalId = useRef<NodeJS.Timer | null>(null);

	useEffect(() => {
		let be = Date.now(),
			fps = "0.00";

		requestAnimationFrame(function loop() {
			const now = Date.now();
			fps = (1000 / (now - be)).toFixed(2).padStart(7, " ");
			be = now;

			requestAnimationFrame(loop);
		});

		intervalId.current = setInterval(() => {
			setFPS(fps);
		}, FPS_INTERVAL);

		return () => {
			if (intervalId.current) clearInterval(intervalId.current);
			intervalId.current = setInterval(() => {
				setFPS(fps);
			}, FPS_INTERVAL);
		};
	}, []);

	return <pre className=''>{fps}fps</pre>;
}

function ElementCounter() {
	const [count, setCount] = useState(0);
	const timer = useRef<NodeJS.Timer | null>(null);

	useEffect(() => {
		if (timer.current) clearInterval(timer.current);
		timer.current = setInterval(() => {
			setCount(document.querySelectorAll("span[data-color]").length);
		}, 100);
	}, []);

	return <pre>{count} elementos</pre>;
}

function App() {
	const debugMode = useAtomValue(debugModeAtom);
	const options = useAtomValue(optionsAtom);

	return (
		<div
			className='w-full h-full'
			style={{
				cursor: options.mode === "rotate" ? "crosshair" : "default",
			}}
		>
			<div className='fixed top-4 left-8 flex flex-col items-end'>
				{debugMode && (
					<>
						<FPSCounter />
						<ElementCounter />
					</>
				)}
			</div>
			<Main />
			<Menubar />
		</div>
	);
}

export default App;
