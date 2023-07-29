import { AnimatePresence, motion } from "framer-motion";
import { useAtom, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { ColorPicker, toColor, useColor } from "react-color-palette";
import "react-color-palette/lib/css/styles.css";
import { FiDroplet, FiMonitor, FiRotateCcw, FiShuffle } from "react-icons/fi";
import { colorsDataAtom, elementsAtom, optionsAtom } from "../../atoms/app";

function randomHEXColor() {
	return "#" + Math.floor(Math.random() * 16777215).toString(16);
}

export function Menubar() {
	const [options, setOptions] = useAtom(optionsAtom);
	const [color, setColor] = useColor("hex", `${options.currentColor}`);
	const setElements = useSetAtom(elementsAtom);
	const setColorData = useSetAtom(colorsDataAtom);

	useEffect(() => {
		setOptions((prev) => ({ ...prev, currentColor: color.hex }));
	}, [color]);

	return (
		<div className='w-1/8 fixed bg-zinc-800 px-8 py-3 rounded-lg box-content left-1/2 -translate-x-1/2 bottom-4 z-10 flex items-center gap-12 text-lg'>
			<MenuItem icon={<FiDroplet fill={color.hex} stroke={color.hex} />}>
				<div className='text-xs text-black bg-zinc-950 rounded-lg overflow-hidden'>
					<ColorPicker
						width={296}
						height={156}
						color={color}
						onChange={setColor}
						dark
					/>
				</div>
			</MenuItem>
			<MenuItem
				icon={<FiShuffle />}
				action={() => setColor(toColor("hex", randomHEXColor()))}
			></MenuItem>
			<MenuItem icon={<FiMonitor />}>
				<div className='px-6 py-4 w-max bg-popover rounded-lg flex flex-col relative'>
					<span className='text-sm text-zinc-200 absolute bg-popover px-2 left-8 top-2.5'>
						Limite de recursão
					</span>
					<input
						value={options.maxRecursion}
						min={1}
						onChange={(e) =>
							setOptions({
								...options,
								maxRecursion: parseInt(e.target.value),
							})
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
			<MenuItem
				icon={<FiRotateCcw />}
				action={() => {
					setColorData([]);
					setElements([]);
				}}
			/>
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
		document.addEventListener("mouseup", (e) => {
			if (["MAIN", "DIV"].includes((e.target as HTMLElement).tagName)) {
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
			<div
				className='cursor-pointer'
				onClick={() => {
					if (action) action();
					setDisplay(!display);
				}}
			>
				{icon}
			</div>
		</div>
	);
}
