import styles from "./GameOverOverlay.module.css";

interface GameOverOverlayProps {
  score: number;
  onRestart: () => void;
}

export default function GameOverOverlay({
  score,
  onRestart,
}: GameOverOverlayProps) {
  return (
    <div className={styles.overlay}>
      <h2 className={styles.title}>GAME OVER</h2>
      <p className={styles.score}>Final Score: {score}</p>
      <button onClick={onRestart} className={styles.restartButton}>
        Restart Game
      </button>
    </div>
  );
}
