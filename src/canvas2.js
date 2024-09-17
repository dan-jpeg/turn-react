import React, { useRef, useLayoutEffect } from 'react';
import paper from 'paper';

const DrawingCanvas = () => {
    const canvasRef = useRef(null);

    useLayoutEffect(() => {
        const canvas = canvasRef.current;
        const container = canvas.parentElement;

        // Function to resize the canvas
        const resizeCanvas = () => {
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;

            // Adjust for device pixel ratio
            const ratio = window.devicePixelRatio || 1;

            // Set canvas size to match its container
            canvas.width = containerWidth * ratio;
            canvas.height = containerHeight * ratio;

            // Set canvas CSS size
            canvas.style.width = `${containerWidth}px`;
            canvas.style.height = `${containerHeight}px`;

            // Ensure Paper.js view size matches canvas size
            if (paper.view) {
                paper.view.viewSize = new paper.Size(canvas.width, canvas.height);
            }
        };

        // Initial resize
        resizeCanvas();

        // Setup Paper.js
        paper.setup(canvas);

        // Drawing variables
        let path;
        const textItem = new paper.PointText({
            content: 'Click and drag to draw a line.',
            point: new paper.Point(20, 30),
            fillColor: 'black',
        });

        // Tool for handling mouse events
        const tool = new paper.Tool();

        tool.onMouseDown = (event) => {
            if (path) {
                path.selected = false;
            }

            path = new paper.Path({
                segments: [event.point],
                strokeColor: 'black',
                fullySelected: true,
            });
        };

        tool.onMouseDrag = (event) => {
            path.add(event.point);
            textItem.content = 'Segment count: ' + path.segments.length;
        };

        tool.onMouseUp = (event) => {
            const segmentCount = path.segments.length;
            path.simplify(10);
            path.fullySelected = true;

            const newSegmentCount = path.segments.length;
            const difference = segmentCount - newSegmentCount;
            const percentage =
                100 - Math.round((newSegmentCount / segmentCount) * 100);
            textItem.content =
                difference +
                ' of the ' +
                segmentCount +
                ' segments were removed. Saving ' +
                percentage +
                '%';
        };

        // Add event listener for window resize
        window.addEventListener('resize', resizeCanvas);

        // Cleanup function
        return () => {
            window.removeEventListener('resize', resizeCanvas);
            paper.project.clear();
            tool.remove();
        };
    }, []);

    return (
        <div style={{ width: '100%', height: '400px' }}>
            <canvas
                ref={canvasRef}
                style={{ width: '100%', height: '100%', border: '1px solid black' }}
            />
        </div>
    );
};

export default DrawingCanvas;