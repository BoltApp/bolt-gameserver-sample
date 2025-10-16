import styles from "./GameOverOverlay.module.css";

interface GameOverOverlayProps {
  score: number;
  onPlayAgain: () => void;
}

export default function GameOverOverlay({
  score,
  onPlayAgain,
}: GameOverOverlayProps) {
  return (
    <div className={styles.overlay}>
      <h2 className={styles.title}>GAME OVER</h2>
      <p className={styles.score}>Final Score: {score}</p>
      <button onClick={onPlayAgain} className={styles.restartButton}>
        Play again (watch ad)
      </button>
    </div>
  );
}
