import React, { useState, useEffect, useRef } from 'react';
import anime from 'animejs/lib/anime.es.js';
import Cell from '../Cell';
import Piece from '../Piece';
import './GameBoard.css';

function GameBoard({ board, cellSize }) {
    const [grid, setGrid] = useState(board);
    const [dragging, setDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ col: null, row: null });
    const [dragEnd, setDragEnd] = useState({ col: null, row: null });
    const [animating, setAnimating] = useState(false);

    // Ref hook for the board
    const boardRef = useRef(null);

    // Ref hooks for the cells
    const pieceRef = useRef(() => Array(board.length).fill().map(() => Array(board[0].length).fill().map(() => null)));

    const onMouseDown = (event) => {
        const boardRect = boardRef.current.getBoundingClientRect();
        const mouseX = event.clientX;
        const mouseY = event.clientY;
        //console.log(`Mousedown event coordinates X:${mouseX} Y:${mouseY}`);

        if (
            mouseX >= boardRect.left &&
            mouseX <= boardRect.right &&
            mouseY >= boardRect.top &&
            mouseY <= boardRect.bottom
        ) {
            const mouseCol = Math.floor((event.clientX - boardRect.left) / cellSize);
            const mouseRow = Math.floor((event.clientY - boardRect.top) / cellSize);
            handleMouseDown(mouseCol, mouseRow);

        }
    };

    const onMouseMove = (event) => {
        if (dragging) {
            const boardRect = boardRef.current.getBoundingClientRect();
            const mouseX = event.clientX;
            const mouseY = event.clientY;

            if (
                mouseX >= boardRect.left &&
                mouseX <= boardRect.right &&
                mouseY >= boardRect.top &&
                mouseY <= boardRect.bottom
            ) {
                const mouseCol = Math.floor((event.clientX - boardRect.left) / cellSize);
                const mouseRow = Math.floor((event.clientY - boardRect.top) / cellSize);
                handleMouseMove(mouseCol, mouseRow);

            }
        }
    };

    const onMouseUp = (event) => {
        const boardRect = boardRef.current.getBoundingClientRect();
        const mouseX = event.clientX;
        const mouseY = event.clientY;
        //console.log(`Mouseup event coordinates X:${mouseX} Y:${mouseY}`);

        if (
            mouseX >= boardRect.left &&
            mouseX <= boardRect.right &&
            mouseY >= boardRect.top &&
            mouseY <= boardRect.bottom
        ) {
            const mouseCol = Math.floor((event.clientX - boardRect.left) / cellSize);
            const mouseRow = Math.floor((event.clientY - boardRect.top) / cellSize);
            setDragEnd(mouseCol, mouseRow);
        }
        handleMouseUp(dragEnd.col, dragEnd.row);
    };

    useEffect(() => {
        document.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);

        return () => {
            document.removeEventListener('mousedown', onMouseDown);
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
    }, [onMouseDown, onMouseMove, onMouseUp]);

    function handleMouseDown(col, row) {
        //console.log(`MouseDown event handler evoked with row=${row}, col=${col}`);
        if (!animating && !dragging) {
            setDragging(true);
            setDragStart({ col, row });
            setDragEnd({ col, row });
        }
    }

    function handleMouseMove(col, row) {
        if (dragging) {
            setDragEnd({ col, row });
        }
    }

    function handleMouseUp(col, row) {
        //console.log(`MouseUp event handler evoked with row=${row}, col=${col}`);
        if (dragging) {
            setDragging(false);
            if (dragStart.row === row && dragStart.col === col) {
                // The user clicked on a single piece, do nothing
            } else if (dragStart.row !== null && dragEnd.row !== null && dragStart.col !== null && dragEnd.col !== null) {
                // The user dragged a piece, cull the destination to the adjacent piece in the normalized direction of the swap
                let dRow = dragEnd.row - dragStart.row;
                console.log(`Pre-normalization dRow: ${dRow}`);
                if (dRow < 0) dRow = -1; if (dRow > 0) dRow = 1;
                console.log(`Normalized dRow: ${dRow}`);
                let dCol = dragEnd.col - dragStart.col;
                console.log(`Pre-normalization dCol: ${dCol}`);
                if (dCol < 0) dCol = -1; if (dCol > 0) dCol = 1;
                console.log(`Normalized dCol: ${dCol}`);

                if (dRow === 0 || dCol === 0) {

                    const endRow = dragStart.row + dRow;
                    const endCol = dragStart.col + dCol;
                    console.log(`Swap destination: col[${endCol}] row[${endRow}]`);

                    if (endRow < 0 || endRow >= grid.length || endCol < 0 || endCol >= grid[0].length) {
                        // destination out of bounds, do nothing
                        console.log(`Destination out of bounds`);
                    } else {
                        const [startX, startY] = getPosition(dragStart);
                        const [endX, endY] = getPosition({ col:endCol, row:endRow });
                        setAnimating(true);
                        animateSwap(dragStart.col, dragStart.row, startX, startY, endCol, endRow, endX, endY, (anim) => {
                            anim.set(pieceRef.current[dragStart.row][dragStart.col], { style: "" });
                            anim.set(pieceRef.current[endRow][endCol], { style: "" });
                            const newGrid = swapPieces(grid, dragStart, { col:endCol, row:endRow });
                            setGrid(newGrid);
                            setAnimating(false);
                        });
                    }
                } else {
                    // if both X and Y displacements are different than 0, it's an invalid diagonal movement, so do nothing
                }
            }
        }
        setDragStart({ col: null, row: null });
        setDragEnd({ col: null, row: null });
    }

    function getPosition({ col, row }) {
        const size = cellSize;
        const x = (col + 0.5) * size;
        const y = (row + 0.5) * size;
        return [x, y];
    }

    function animateSwap(startCol, startRow, startX, startY, endCol, endRow, endX, endY, onComplete) {
        // Use anime.js to animate the swap
        anime({
            targets: [pieceRef.current[startRow][startCol], pieceRef.current[endRow][endCol]],
            translateX: function (el, i) {
                return (i == 0 ? [0, endX - startX] : [0, startX - endX]);
            },
            translateY: function (el, i) {
                return (i == 0 ? [0, endY - startY] : [0, startY - endY]);
            },
            duration: 500,
            easing: 'easeInOutQuad',
            complete: onComplete,
        });
    }

    function swapPieces(grid, start, end) {
        // Swap the pieces at the start and end positions
        const newGrid = grid.slice();
        const temp = newGrid[start.row][start.col];
        newGrid[start.row][start.col] = newGrid[end.row][end.col];
        newGrid[end.row][end.col] = temp;
        return newGrid;
    }

    return (
        <div className="game-board-container">
            <div className="game-board" ref={boardRef} >
                {grid.map((row, rowIndex) => (
                    <div className="row" key={rowIndex} style={{ height: `${cellSize}px` }}>
                        {row.map((type, colIndex) => (
                            <Cell key={`${rowIndex}-${colIndex}`} cellSize={cellSize}>
                                <Piece
                                    coords={{ row: rowIndex, col: colIndex }}
                                    type={type}
                                    ref={(el) => {
                                        pieceRef.current = pieceRef.current || [];
                                        pieceRef.current[rowIndex] = pieceRef.current[rowIndex] || [];
                                        pieceRef.current[rowIndex][colIndex] = el;
                                    }}
                                />
                            </Cell>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}


export default GameBoard;