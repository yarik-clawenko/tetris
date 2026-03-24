import { useState, useCallback, useEffect } from 'react';
import type { Board, Tetromino, TetrominoType, GameState } from './types';
import { BOARD_WIDTH, BOARD_HEIGHT, TETROMINOES } from './types';

const createEmptyBoard = (): Board => {
  return Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(0));
};

const randomTetromino = (): TetrominoType => {
  const pieces: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
  return pieces[Math.floor(Math.random() * pieces.length)];
};

const createTetromino = (type: TetrominoType): Tetromino => {
  const { shape, color } = TETROMINOES[type];
  return {
    shape: shape.map(row => [...row]),
    color,
    position: { x: Math.floor(BOARD_WIDTH / 2) - Math.floor(shape[0].length / 2), y: 0 },
  };
};

const rotateMatrix = (matrix: number[][]): number[][] => {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const rotated: number[][] = [];
  
  for (let col = 0; col < cols; col++) {
    rotated[col] = [];
    for (let row = rows - 1; row >= 0; row--) {
      rotated[col].push(matrix[row][col]);
    }
  }
  
  return rotated;
};

const isValidMove = (board: Board, piece: Tetromino): boolean => {
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x]) {
        const newX = piece.position.x + x;
        const newY = piece.position.y + y;
        
        if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
          return false;
        }
        
        if (newY >= 0 && board[newY][newX]) {
          return false;
        }
      }
    }
  }
  return true;
};

const mergePieceToBoard = (board: Board, piece: Tetromino): Board => {
  const newBoard = board.map(row => [...row]);
  
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x]) {
        const boardY = piece.position.y + y;
        const boardX = piece.position.x + x;
        if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
          newBoard[boardY][boardX] = 1;
        }
      }
    }
  }
  
  return newBoard;
};

const clearLines = (board: Board): { newBoard: Board; linesCleared: number } => {
  let linesCleared = 0;
  const newBoard = board.filter(row => {
    const isFull = row.every(cell => cell !== 0);
    if (isFull) linesCleared++;
    return !isFull;
  });
  
  while (newBoard.length < BOARD_HEIGHT) {
    newBoard.unshift(Array(BOARD_WIDTH).fill(0));
  }
  
  return { newBoard, linesCleared };
};

export const useTetris = () => {
  const [gameState, setGameState] = useState<GameState>({
    board: createEmptyBoard(),
    currentPiece: null,
    nextPiece: randomTetromino(),
    score: 0,
    level: 1,
    lines: 0,
    isGameOver: false,
    isPaused: false,
  });

  const [displayBoard, setDisplayBoard] = useState<Board>(createEmptyBoard());

  // Calculate points
  const getPoints = (lines: number, level: number): number => {
    const points = [0, 100, 300, 500, 800];
    return points[lines] * level;
  };

  // Get speed based on level
  const getSpeed = (level: number): number => {
    return Math.max(100, 1000 - (level - 1) * 100);
  };

  // Start game
  const startGame = useCallback(() => {
    const firstPiece = randomTetromino();
    setGameState({
      board: createEmptyBoard(),
      currentPiece: createTetromino(firstPiece),
      nextPiece: randomTetromino(),
      score: 0,
      level: 1,
      lines: 0,
      isGameOver: false,
      isPaused: false,
    });
  }, []);

  // Move piece
  const movePiece = useCallback((dx: number, dy: number) => {
    setGameState(prev => {
      if (!prev.currentPiece || prev.isGameOver || prev.isPaused) return prev;
      
      const newPiece: Tetromino = {
        ...prev.currentPiece,
        position: {
          x: prev.currentPiece.position.x + dx,
          y: prev.currentPiece.position.y + dy,
        },
      };
      
      if (isValidMove(prev.board, newPiece)) {
        return { ...prev, currentPiece: newPiece };
      }
      
      // If moving down and invalid, lock piece
      if (dy > 0) {
        const merged = mergePieceToBoard(prev.board, prev.currentPiece);
        const { newBoard, linesCleared } = clearLines(merged);
        
        const newLines = prev.lines + linesCleared;
        const newLevel = Math.floor(newLines / 10) + 1;
        const newScore = prev.score + getPoints(linesCleared, prev.level);
        
        const nextPieceType = prev.nextPiece;
        const newCurrentPiece = createTetromino(nextPieceType);
        
        // Check game over
        if (!isValidMove(newBoard, newCurrentPiece)) {
          return {
            ...prev,
            board: newBoard,
            isGameOver: true,
            score: newScore,
            lines: newLines,
            level: newLevel,
          };
        }
        
        return {
          ...prev,
          board: newBoard,
          currentPiece: newCurrentPiece,
          nextPiece: randomTetromino(),
          score: newScore,
          lines: newLines,
          level: newLevel,
        };
      }
      
      return prev;
    });
  }, []);

  // Rotate piece
  const rotatePiece = useCallback(() => {
    setGameState(prev => {
      if (!prev.currentPiece || prev.isGameOver || prev.isPaused) return prev;
      
      const rotatedShape = rotateMatrix(prev.currentPiece.shape);
      const newPiece: Tetromino = {
        ...prev.currentPiece,
        shape: rotatedShape,
      };
      
      // Try rotation, if invalid try wall kicks
      const kicks = [0, 1, -1, 2, -2];
      for (const kick of kicks) {
        newPiece.position.x = prev.currentPiece.position.x + kick;
        if (isValidMove(prev.board, newPiece)) {
          return { ...prev, currentPiece: newPiece };
        }
      }
      
      return prev;
    });
  }, []);

  // Hard drop
  const hardDrop = useCallback(() => {
    setGameState(prev => {
      if (!prev.currentPiece || prev.isGameOver || prev.isPaused) return prev;
      
      let dropY = prev.currentPiece.position.y;
      while (isValidMove(prev.board, {
        ...prev.currentPiece,
        position: { ...prev.currentPiece.position, y: dropY + 1 },
      })) {
        dropY++;
      }
      
      // Move down until locked
      const droppedPiece: Tetromino = {
        ...prev.currentPiece,
        position: { ...prev.currentPiece.position, y: dropY },
      };
      
      const merged = mergePieceToBoard(prev.board, droppedPiece);
      const { newBoard, linesCleared } = clearLines(merged);
      
      const newLines = prev.lines + linesCleared;
      const newLevel = Math.floor(newLines / 10) + 1;
      const newScore = prev.score + getPoints(linesCleared, prev.level) + (dropY - prev.currentPiece.position.y) * 2;
      
      const nextPieceType = prev.nextPiece;
      const newCurrentPiece = createTetromino(nextPieceType);
      
      if (!isValidMove(newBoard, newCurrentPiece)) {
        return {
          ...prev,
          board: newBoard,
          isGameOver: true,
          score: newScore,
          lines: newLines,
          level: newLevel,
        };
      }
      
      return {
        ...prev,
        board: newBoard,
        currentPiece: newCurrentPiece,
        nextPiece: randomTetromino(),
        score: newScore,
        lines: newLines,
        level: newLevel,
      };
    });
  }, []);

  // Toggle pause
  const togglePause = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  // Update display board
  useEffect(() => {
    if (!gameState.currentPiece) {
      setDisplayBoard(gameState.board);
      return;
    }
    
    const merged = mergePieceToBoard(gameState.board, gameState.currentPiece);
    setDisplayBoard(merged);
  }, [gameState.board, gameState.currentPiece]);

  // Game loop
  useEffect(() => {
    if (gameState.isGameOver || gameState.isPaused || !gameState.currentPiece) {
      return;
    }
    
    const speed = getSpeed(gameState.level);
    const interval = setInterval(() => {
      movePiece(0, 1);
    }, speed);
    
    return () => clearInterval(interval);
  }, [gameState.isGameOver, gameState.isPaused, gameState.currentPiece, gameState.level, movePiece]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.isGameOver) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          movePiece(-1, 0);
          break;
        case 'ArrowRight':
          movePiece(1, 0);
          break;
        case 'ArrowDown':
          movePiece(0, 1);
          break;
        case 'ArrowUp':
          rotatePiece();
          break;
        case ' ':
          hardDrop();
          break;
        case 'p':
        case 'P':
          togglePause();
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.isGameOver, movePiece, rotatePiece, hardDrop, togglePause]);

  return {
    displayBoard,
    currentPiece: gameState.currentPiece,
    nextPiece: gameState.nextPiece,
    score: gameState.score,
    level: gameState.level,
    lines: gameState.lines,
    isGameOver: gameState.isGameOver,
    isPaused: gameState.isPaused,
    startGame,
    movePiece,
    rotatePiece,
    hardDrop,
    togglePause,
  };
};