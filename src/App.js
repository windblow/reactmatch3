import { useState, React } from 'react';
import GameBoard from './components/GameBoard';

function App() {
    const [board, setBoard] = useState(() => {
        // Generate a 2D array with random piece types for each cell
        const initialBoard = Array.from({ length: 5 }, () =>
            Array.from({ length: 8 }, () => {
                const types = ['red', 'blue', 'green'];
                return types[Math.floor(Math.random() * types.length)];
            })
        );
        return initialBoard;
    });

    return (
        <div className="app">
            <GameBoard board={board} cellSize="32" />
        </div>
    );
}

export default App;
