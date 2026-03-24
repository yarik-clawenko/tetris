import React from 'react';
import { Board, BOARD_WIDTH, BOARD_HEIGHT, TETROMINOES, TetrominoType } from './types';

interface GameBoardProps {
  board: Board;
  currentPieceColor?: string;
}

const Cell: React.FC<{ value: number; color?: string }> = ({ value, color }) => {
  const cellColor = value ? color || '#00f5ff' : 'transparent';
  
  return (
    <div
      style={{
        width: '28px',
        height: '28px',
        backgroundColor: cellColor,
        border: value ? '1px solid rgba(255,255,255,0.3)' : '1px solid #333',
        borderRadius: '2px',
        boxSizing: 'border-box',
      }}
    />
  );
};

export const GameBoard: React.FC<GameBoardProps> = ({ board, currentPieceColor }) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${BOARD_WIDTH}, 28px)`,
        gridTemplateRows: `repeat(${BOARD_HEIGHT}, 28px)`,
        gap: '1px',
        backgroundColor: '#1a1a2e',
        padding: '10px',
        borderRadius: '8px',
        border: '2px solid #4a4a6a',
      }}
    >
      {board.map((row, y) =>
        row.map((cell, x) => (
          <Cell key={`${y}-${x}`} value={cell} color={cell ? currentPieceColor : undefined} />
        ))
      )}
    </div>
  );
};

interface NextPieceProps {
  type: TetrominoType;
}

export const NextPiece: React.FC<NextPieceProps> = ({ type }) => {
  const { shape, color } = TETROMINOES[type];
  
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${shape[0].length}, 22px)`,
        gridTemplateRows: `repeat(${shape.length}, 22px)`,
        gap: '1px',
        backgroundColor: '#1a1a2e',
        padding: '8px',
        borderRadius: '6px',
        border: '1px solid #4a4a6a',
      }}
    >
      {shape.map((row, y) =>
        row.map((cell, x) => (
          <div
            key={`${y}-${x}`}
            style={{
              width: '22px',
              height: '22px',
              backgroundColor: cell ? color : 'transparent',
              border: cell ? '1px solid rgba(255,255,255,0.3)' : '1px solid #333',
              borderRadius: '2px',
              boxSizing: 'border-box',
            }}
          />
        ))
      )}
    </div>
  );
};