import { forwardRef } from 'react';

const Piece = forwardRef(({ type, coords }, ref) => {

    return (
        <svg ref={ref} className={`piece-${coords.row}-${coords.col}`} width="90%" height="90%" viewBox="5 5 95 95">
            {type === 'red' && <path fill="#FF4136" d="M 50 10 L 90 90 L 10 90 Z" />}
            {/*type === 'blue' && <path fill="#0074D9" d="M50,20 a30,30 0 1,0 0,60 a30,30 0 1,0 0,-60" />*/}
            {type === 'blue' && <circle fill="#0074D9" cx="50" cy="50" r="45" />}
            {type === 'green' && <path fill="#2ECC40" d="M 10 10 L 90 10 L 90 90 L 10 90 L 10 10" />}
        </svg>
    );
});

export default Piece;