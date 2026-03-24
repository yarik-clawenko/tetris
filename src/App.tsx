import React from 'react';
import { GameBoard, NextPiece } from './GameBoard';
import { useTetris } from './useTetris';
import './App.css';

const App: React.FC = () => {
  const {
    displayBoard,
    currentPiece,
    nextPiece,
    score,
    level,
    lines,
    isGameOver,
    isPaused,
    startGame,
    movePiece,
    rotatePiece,
    hardDrop,
    togglePause,
  } = useTetris();

  return (
    <div className="tetris-container">
      <div className="game-header">
        <h1>🎮 ТЕТРИС</h1>
      </div>
      
      <div className="game-wrapper">
        <div className="game-main">
          <GameBoard board={displayBoard} currentPieceColor={currentPiece?.color} />
        </div>
        
        <div className="game-sidebar">
          <div className="stats-panel">
            <div className="stat">
              <span className="stat-label">Очки</span>
              <span className="stat-value">{score.toLocaleString()}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Уровень</span>
              <span className="stat-value">{level}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Линии</span>
              <span className="stat-value">{lines}</span>
            </div>
          </div>
          
          <div className="next-panel">
            <span className="panel-label">Следующая</span>
            <NextPiece type={nextPiece} />
          </div>
          
          <div className="controls-panel">
            <span className="panel-label">Управление</span>
            <div className="controls-grid">
              <button onClick={() => movePiece(-1, 0)}>←</button>
              <button onClick={() => rotatePiece()}>↻</button>
              <button onClick={() => movePiece(1, 0)}>→</button>
              <button onClick={() => movePiece(0, 1)}>↓</button>
              <button onClick={hardDrop} className="drop-btn">⬇</button>
            </div>
            <div className="controls-row">
              <button onClick={togglePause}>{isPaused ? '▶ Продолжить' : '⏸ Пауза'}</button>
            </div>
          </div>
          
          <div className="keyboard-hints">
            <p><kbd>←</kbd> <kbd>→</kbd> движение</p>
            <p><kbd>↑</kbd> поворот</p>
            <p><kbd>↓</kbd> вниз</p>
            <p><kbd>Space</kbd> сброс</p>
            <p><kbd>P</kbd> пауза</p>
          </div>
        </div>
      </div>
      
      {(isGameOver || !currentPiece) && (
        <div className="overlay">
          <div className="overlay-content">
            {isGameOver ? (
              <>
                <h2>Game Over!</h2>
                <p className="final-score">Очки: {score.toLocaleString()}</p>
                <p className="final-stats">Уровень: {level} | Линии: {lines}</p>
              </>
            ) : (
              <h2>Нажми "Новая игра"</h2>
            )}
            <button className="start-btn" onClick={startGame}>
              🎮 Новая игра
            </button>
          </div>
        </div>
      )}
      
      {isPaused && !isGameOver && currentPiece && (
        <div className="overlay">
          <div className="overlay-content">
            <h2>Пауза</h2>
            <button className="start-btn" onClick={togglePause}>
              ▶ Продолжить
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;