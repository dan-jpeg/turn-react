import React, { useRef, useEffect, useState } from 'react';
import paper from 'paper';

const Canvas = () => {
    // Input canvas references
    const inputCanvasRef = useRef(null);
    const inputScope = useRef(new paper.PaperScope());

    // Output canvas references
    const outputCanvasRef = useRef(null);
    const outputScope = useRef(new paper.PaperScope());

    // Drawing mode state
    const [drawingMode, setDrawingMode] = useState('freeDraw');
    const pathRef = useRef(null); // Holds the current path

    // indicator reference
    const pointIndicators = useRef([])

    const [showSpiral, setShowSpiral] = useState(false);
    const spiralGroup = useRef(null);

    const rowAmount = 5
    const colummAmount = 5

    const drawGoldenRatioSpiral = (scope) => {
        if (spiralGroup.current) {
            spiralGroup.current.remove();
        }

        const group = new scope.Group();
        const center = scope.view.center;
        const size = Math.min(scope.view.size.width, scope.view.size.height) * 0.8;
        const goldenRatio = 1.618033988749895;

        let currentSize = size;
        let currentAngle = 0;

        for (let i = 0; i < 8; i++) {
            const rectangle = new scope.Rectangle({
                point: center,
                size: [currentSize, currentSize]
            });
            const path = new scope.Path.Arc({
                from: [rectangle.topRight.x, rectangle.topRight.y],
                through: [rectangle.bottomRight.x, rectangle.bottomRight.y],
                to: [rectangle.bottomLeft.x, rectangle.bottomLeft.y]
            });
            path.strokeColor = 'rgba(255, 215, 0, 0.5)';  // Golden color with transparency
            path.strokeWidth = 2;
            group.addChild(path);

            currentSize /= goldenRatio;
            currentAngle += 90;
            group.rotate(90, center);
        }

        spiralGroup.current = group;
    };



    // **First useEffect**: Set up the input canvas and drawing tool
    useEffect(() => {
        const canvas = inputCanvasRef.current;
        const scope = inputScope.current;
        scope.setup(canvas);

        // Set canvas size
        canvas.width = 400;
        canvas.height = 400;

        const tool = new scope.Tool();

        tool.onMouseDown = (event) => {
            if (drawingMode === 'freeDraw') {
                // Start a new path for free drawing
                const path = new scope.Path({
                    segments: [event.point],
                    fullySelected: true,
                });
                path.strokeColor = 'black';
                path.strokeWidth = 2;
                pathRef.current = path;
            } else if (drawingMode === 'pathDraw') {
                // Add points to the existing path or start a new one
                if (!pathRef.current) {
                    const path = new scope.Path();
                    path.strokeColor = 'black';
                    path.strokeWidth = 2;
                    pathRef.current = path;
                }
                pathRef.current.add(event.point);

                const indicator = new scope.Path.Circle({
                    center: event.point,
                    radius: 2,
                    fillColor: 'gray',
                });
                indicator.isIndicator = true; // Mark as indicator

                // Store the indicator
                pointIndicators.current.push(indicator);
            }
        };

        tool.onMouseDrag = (event) => {
            if (drawingMode === 'freeDraw') {
                pathRef.current.add(event.point);
            }
        };

        tool.onMouseUp = (event) => {
            if (pathRef.current) {
                const segmentCount = pathRef.current.segments.length;
                pathRef.current.simplify(15);
                pathRef.current.fullySelected = true;
            }
        };


        // Cleanup
        return () => {
            tool.remove();
        };
    }, [drawingMode, showSpiral]);

    // **Second useEffect**: Handle keydown events
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'p' || event.key === 'P') {
                setDrawingMode('pathDraw');
            } else if (event.key === 'f' || event.key === 'F') {
                setDrawingMode('freeDraw');
            } else if (event.key === 'Enter' && drawingMode === 'pathDraw') {
                // Finalize the path in path drawing mode
                if (pathRef.current) {
                    pathRef.current.simplify(); // Optional
                    pathRef.current = null;
                    pointIndicators.current.forEach((indicator) => indicator.remove());
                    pointIndicators.current = [];
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        // Cleanup
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [drawingMode]);
    const toggleSpiral = () => {
        setShowSpiral(!showSpiral);
    };

    // **Third useEffect**: Set up the output canvas
    useEffect(() => {
        const canvas = outputCanvasRef.current;
        const scope = outputScope.current;
        scope.setup(canvas);

        // Set canvas size (square)
        canvas.width = 400;
        canvas.height = 400;

        // Style the canvas if necessary
        canvas.style.width = '400px';
        canvas.style.height = '400px';

        // Cleanup if needed
        return () => {
            // Any cleanup code
        };
    }, []);

    // Pattern generation function
    const generatePattern = () => {
        const inputProject = inputScope.current.project;
        const outputProject = outputScope.current.project;
        const outputView = outputScope.current.view;

        // Clear the output project
        outputProject.clear();

        // Get the drawn items from the input canvas
        const drawnItems = inputProject.getItems({
            class: paper.Path,
        });

        if (drawnItems.length === 0) {
            alert('Please draw something on the input canvas first.');
            return;
        }

        // Group the drawn items
        const group = new outputScope.current.Group(
            drawnItems.map(item => item.clone({ insert: false, deep: true }))
        );

        // Calculate the bounds and scaling
        const bounds = group.bounds;
        const rows = rowAmount;
        const cols = colummAmount;
        const cellSize = outputView.size.width / cols;

        const scaleFactor = (cellSize * 1) / Math.max(bounds.width, bounds.height);
        group.scale(scaleFactor);



        // Center the group at the origin before cloning
        group.position = new outputScope.current.Point(0, 0);

        // Place the cloned group into the grid
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const clone = group.clone();
                clone.position = new outputScope.current.Point(
                    cellSize * col + cellSize / 2,
                    cellSize * row + cellSize / 2
                );
                outputProject.activeLayer.addChild(clone);
            }
        }

        // Remove the original group
        group.remove();

        // Update the output view
        outputView.update();
    };

    return (
        <div className={'flex flex-col items-center justify-center'}>
            <p className={`  text-5xl pb-10`}>
                {drawingMode === 'freeDraw' ? 'FREE' : 'PATH'}
            </p>
            <div className={'flex flex-col items-start justify-center pb-6'}>
                <p> f _ "free" draw</p>
                <p> p _ "path" draw </p>
                <p>return _ add curve" </p>

            </div>

            <div className={'flex flex-row m-4'}>

                <canvas
                    ref={inputCanvasRef}
                    style={{width: '400px', height: '400px', border: '1px solid black'}}
                />
                <h2 className={`text-3xl`}>in</h2>
            </div>


            <button onClick={generatePattern}>Generate Pattern</button>

            <h2 className={`pb-2 transform translate-x-1/2 text-5xl`}>out</h2>
            <canvas
                ref={outputCanvasRef}
                style={{width: '400px', height: '400px', border: '1px solid black'}}
            />
        </div>
    );
};

export default Canvas;