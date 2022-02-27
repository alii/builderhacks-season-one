import {useEffect, useRef} from 'react';

export function DotDisplay() {
	const container = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		if (!container.current) {
			return;
		}

		let drawing = true;
		const {current} = container;

		const canvas = current.getContext('2d')!;

		let {width, height} = current.getBoundingClientRect();
		current.width = width;
		current.height = height;

		const DOT_SPACING = 50;
		const DOT_SIZE = 7;

		function draw() {
			canvas.clearRect(0, 0, width, height);

			for (let x = 0; x < width; x += DOT_SPACING) {
				for (let y = 0; y < height; y += DOT_SPACING) {
					canvas.beginPath();

					const opacity = 1 - y / height;

					canvas.fillStyle = `rgba(255, 255, 255, ${opacity})`;

					canvas.arc(x, y, DOT_SIZE / 2, 0, Math.PI * 2);
					canvas.fill();
				}
			}

			if (drawing) {
				requestAnimationFrame(draw);
			}
		}

		draw();

		function handleResize() {
			width = current.getBoundingClientRect().width;
			height = current.getBoundingClientRect().height;

			current.width = width;
			current.height = height;
		}

		window.addEventListener('resize', handleResize);
		return () => {
			drawing = false;

			if (current) {
				window.removeEventListener('resize', handleResize);
			}
		};
	}, [container]);

	return (
		<div>
			<canvas
				ref={container}
				style={{
					width: '100%',
					opacity: '0.05',
					height: '100%',
					overflow: 'hidden',
				}}
			/>
		</div>
	);
}
