/* eslint-disable @typescript-eslint/no-unused-vars */
import { AnimatePresence, motion } from "framer-motion";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useState } from "react";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { ColorPicker, toColor, useColor } from "react-color-palette";
import "react-color-palette/lib/css/styles.css";
import { FiDroplet, FiMonitor, FiRotateCcw, FiShuffle } from "react-icons/fi";
import {
	actionsAtom,
	colorsDataAtom,
	elementsAtom,
	optionsAtom,
	undoneActionsAtom,
} from "../../atoms/app";

function randomHEXColor() {
	return "#" + Math.floor(Math.random() * 16777215).toString(16);
}

export function Menubar() {
	const [options, setOptions] = useAtom(optionsAtom);
	const [color, setColor] = useColor("hex", `${options.currentColor}`);
	const [elements, setElements] = useAtom(elementsAtom);
	const [colorsData, setColorsData] = useAtom(colorsDataAtom);

	const [actions, setActions] = useAtom(actionsAtom);
	const [undoneActions, setUndoneActions] = useAtom(undoneActionsAtom);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	function resetEverything() {
		setElements([]);
		setColorsData([]);
	}

	// eslint-disable-next-line react-hooks/exhaustive-deps
	function randomizeColor() {
		setColor(toColor("hex", randomHEXColor()));
	}

	function setCurrentRecursion(value: number) {
		setOptions((prev) => ({ ...prev, maxRecursion: value }));
	}

	function undo() {
		setActions((actions) => {
			const lastAction = actions[actions.length - 1];
			if (lastAction) setUndoneActions((prev) => [...prev, lastAction]);
			return actions.slice(0, -1);
		});
	}

	function redo() {
		const lastAction = undoneActions.pop();
		if (lastAction) setActions((prev) => [...prev, lastAction]);
	}

	function shortcutHandler({
		key: _key,
		target,
		shiftKey,
		ctrlKey,
		altKey,
	}: KeyboardEvent) {
		const key = _key.toLowerCase();

		if (key === "r") {
			if (shiftKey || ctrlKey || altKey) {
				resetEverything();
			} else {
				randomizeColor();
			}
		} else if (key === "z") {
			if (ctrlKey && !shiftKey && !altKey) {
				undo();
			} else if (ctrlKey && shiftKey && !altKey) {
				redo();
			}
		}
	}

	useEffect(() => {
		setOptions((prev) => ({ ...prev, currentColor: color.hex }));
	}, [color]);

	useEffect(() => {
		document.addEventListener("keydown", shortcutHandler);

		return () => {
			document.removeEventListener("keydown", shortcutHandler);
		};
	}, [elements, colorsData, undoneActions, actions]);

	return (
		<div className='w-1/8 fixed bg-zinc-925 px-8 py-3 rounded-md box-content left-1/2 -translate-x-1/2 bottom-4 z-10 flex items-center gap-12 text-lg'>
			<MenuItem icon={<FiDroplet fill={color.hex} stroke={color.hex} />}>
				<div className='text-xs flex-col flex pb-4 gap-1 text-black bg-popover rounded-lg overflow-hidden'>
					<ColorPicker
						width={296}
						height={156}
						color={color}
						onChange={setColor}
						hideHSV
						hideRGB
						dark
					/>
					<div className='px-6 flex flex-col w-full gap-4'>
						<RecentColors setColor={setColor} />
						<div
							className='cursor-pointer self-end'
							onClick={randomizeColor}
						>
							<FiShuffle className='text-sm text-white cursor-pointer pointer-events-none' />
						</div>
					</div>
				</div>
			</MenuItem>
			<MenuItem icon={<FiMonitor />}>
				<div className='px-6 py-4 w-max bg-popover rounded-lg flex flex-col relative'>
					<span className='text-sm text-zinc-200 absolute bg-popover px-2 left-8 top-2.5'>
						Limite de recursão
					</span>
					<input
						value={options.maxRecursion}
						min={1}
						onChange={(e) =>
							setCurrentRecursion(e.target.valueAsNumber)
						}
						className='mt-2 bg-transparent outline-none focus:border-zinc-400 transition-all border-zinc-600 border-2 rounded-md px-4 py-1 w-full'
						type='number'
					/>
					{options.maxRecursion > 6 && (
						<span className='text-red-400 text-xs mt-2'>
							Cuidado com valores altos
						</span>
					)}
				</div>
			</MenuItem>
			<MenuItem icon={<FiRotateCcw />} action={resetEverything} />
		</div>
	);
}

function RecentColors({ setColor }: { setColor: (string: string) => void }) {
	const colorsData = useAtomValue(colorsDataAtom);
	const options = useSetAtom(optionsAtom);

	function randomizeColor() {
		setColor(toColor("hex", randomHEXColor()));
	}

	return (
		<div className='w-full flex gap-x-5 gap-y-3 flex-wrap'>
			{colorsData.map((color) => (
				<div
					onClick={randomizeColor}
					key={color.color}
					className='rounded-full w-6 aspect-square'
					style={{
						cursor: `url('/cursor.cur'), auto`,
						backgroundColor: color.color,
					}}
				></div>
			))}
		</div>
	);
}

function MenuItem({
	children,
	icon,
	action,
}: {
	children?: React.ReactNode;
	action?: () => void;
	icon: React.ReactNode;
}) {
	const [display, setDisplay] = useState(false);

	useEffect(() => {
		document.addEventListener("mousedown", (e) => {
			if (["MAIN", "SPAN"].includes((e.target as HTMLElement).tagName)) {
				setDisplay(false);
			}
		});

		document.addEventListener("keydown", (e) => {
			if (e.key === "Escape") {
				setDisplay(false);
			}
		});
	}, []);

	return (
		<div className='relative'>
			<AnimatePresence>
				{display && (
					<motion.div
						initial={{ opacity: 0, scale: 0.5, x: "-50%" }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.5 }}
						className='absolute left-1/2 bottom-full mb-6'
					>
						{children}
					</motion.div>
				)}
			</AnimatePresence>
			<span
				className='cursor-pointer'
				onClick={() => {
					if (action) action();
					setDisplay(!display);
				}}
			>
				{icon}
			</span>
		</div>
	);
}
