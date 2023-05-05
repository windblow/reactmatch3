import React from 'react';
import './Cell.css';

function Cell(props) {

    const size = {
        width: `${props.cellSize}px`,
        height: `${props.cellSize}px`,
    };

    return (
        <div
            className="cell"
            onMouseDown={props.onMouseDown}
            onMouseMove={props.onMouseMove}
            onMouseUp={props.onMouseUp}
            style={size}
        >
            {props.children}
        </div>
    );
}

export default Cell;
