import { useEffect, useRef, useState } from "preact/hooks";
import CharacterImage from "../assets/Character_l_Sample01.png";

interface GameState {
  score: number;
  isGameOver: boolean;
  isPlaying: boolean;
}

export default function Game() {
  const gameCanvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<GameState>({
    score: 0,
    isGameOver: false,
    isPlaying: false,
  });
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    isGameOver: false,
    isPlaying: false,
  });

  useEffect(() => {
    if (!gameCanvasRef.current) return;

    const canvas = gameCanvasRef.current;
    const ctx = canvas.getContext("2d")!;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 200;

    initGame(canvas, ctx);
  }, []);

  const initGame = (
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
  ) => {
    // Game constants
    const GRAVITY = 0.5;
    const JUMP_FORCE = -12;
    const GROUND_Y = 150;
    const DINO_X = 80;
    const GAME_SPEED = 4;

    // Game objects
    let gameSpeed = GAME_SPEED;
    let dinoY = GROUND_Y;
    let dinoVelocityY = 0;
    let isJumping = false;
    let obstacles: { x: number; y: number; width: number; height: number }[] =
      [];
    let score = 0;
    let animationId: number;

    // Load character image
    const characterImg = new Image();
    characterImg.src = CharacterImage;

    function drawDino(x: number, y: number) {
      // Draw the character image instead of rectangles
      if (characterImg.complete) {
        // Scale the image to fit the game (adjust size as needed)
        const width = 40;
        const height = 50;
        ctx.drawImage(characterImg, x - 10, y - 20, width, height);
      } else {
        // Fallback to rectangle if image isn't loaded yet
        ctx.fillStyle = "#525252";
        ctx.fillRect(x, y, 20, 30);
      }
    }

    function drawObstacle(obstacle: {
      x: number;
      y: number;
      width: number;
      height: number;
    }) {
      ctx.fillStyle = "#0d7f00";
      // Main cactus body
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      // Spikes
      ctx.fillRect(obstacle.x - 3, obstacle.y + 10, 6, 3);
      ctx.fillRect(obstacle.x + 12, obstacle.y + 15, 6, 3);
    }

    function drawGround() {
      ctx.fillStyle = "#525252";
      ctx.fillRect(0, GROUND_Y + 20, canvas.width, 2);
    }

    function drawScore() {
      ctx.fillStyle = "#525252";
      ctx.font = "20px Arial";
      ctx.fillText(`Score: ${score}`, canvas.width - 150, 30);
    }

    function drawStartText() {
      ctx.fillStyle = "#525252";
      ctx.font = "20px Arial";
      ctx.textAlign = "center";
      ctx.fillText("Click to start", canvas.width / 2, 100);
      ctx.textAlign = "left";
    }

    function drawGameOverText() {
      ctx.fillStyle = "#525252";
      ctx.font = "24px Arial";
      ctx.textAlign = "center";
      ctx.fillText("GAME OVER", canvas.width / 2, 80);
      ctx.fillText("Click to restart", canvas.width / 2, 110);
      ctx.textAlign = "left";
    }

    function createObstacle(x: number) {
      return {
        x: x,
        y: GROUND_Y - 40,
        width: 15,
        height: 40,
      };
    }

    function jump() {
      if (!isJumping && gameStateRef.current.isPlaying) {
        isJumping = true;
        dinoVelocityY = JUMP_FORCE;
      }
    }

    function startGame() {
      gameStateRef.current = { score: 0, isGameOver: false, isPlaying: true };
      setGameState({ ...gameStateRef.current });
      score = 0;
      gameSpeed = GAME_SPEED;
      dinoY = GROUND_Y;
      dinoVelocityY = 0;
      isJumping = false;
      obstacles = [];
    }

    function gameOver() {
      gameStateRef.current = {
        ...gameStateRef.current,
        isGameOver: true,
        isPlaying: false,
      };
      setGameState({ ...gameStateRef.current });
      cancelAnimationFrame(animationId);
    }

    function checkCollision(
      dinoX: number,
      dinoY: number,
      obstacle: { x: number; y: number; width: number; height: number }
    ): boolean {
      // Character image bounds (adjusted for the new character image)
      const dinoBox = {
        x: dinoX - 10, // Match the x offset from drawDino
        y: dinoY - 20, // Match the y offset from drawDino
        width: 40, // Match the width from drawDino
        height: 50, // Match the height from drawDino
      };

      return (
        dinoBox.x < obstacle.x + obstacle.width &&
        dinoBox.x + dinoBox.width > obstacle.x &&
        dinoBox.y < obstacle.y + obstacle.height &&
        dinoBox.y + dinoBox.height > obstacle.y
      );
    }

    // Mouse controls
    const handleClick = (event: MouseEvent) => {
      event.preventDefault();
      if (!gameStateRef.current.isPlaying && !gameStateRef.current.isGameOver) {
        startGame();
        gameLoop();
      } else if (gameStateRef.current.isGameOver) {
        startGame();
        gameLoop();
      } else {
        jump();
      }
    };

    // Add click listener
    canvas.addEventListener("click", handleClick);

    // Game loop
    function gameLoop() {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw ground
      drawGround();

      if (!gameStateRef.current.isPlaying) {
        if (gameStateRef.current.isGameOver) {
          drawGameOverText();
        } else {
          drawStartText();
        }
        drawDino(DINO_X, GROUND_Y);
        return;
      }

      // Update dino physics
      if (isJumping) {
        dinoVelocityY += GRAVITY;
        dinoY += dinoVelocityY;

        if (dinoY >= GROUND_Y) {
          dinoY = GROUND_Y;
          dinoVelocityY = 0;
          isJumping = false;
        }
      }

      // Spawn obstacles
      if (obstacles.length === 0 || Math.random() < 0.003) {
        if (
          obstacles.length === 0 ||
          canvas.width - obstacles[obstacles.length - 1].x >
            200 + Math.random() * 300
        ) {
          obstacles.push(createObstacle(canvas.width));
        }
      }

      // Update obstacles
      obstacles.forEach((obstacle, index) => {
        obstacle.x -= gameSpeed;

        // Check collision
        if (checkCollision(DINO_X, dinoY, obstacle)) {
          gameOver();
          return;
        }

        // Remove off-screen obstacles and add score
        if (obstacle.x < -obstacle.width) {
          obstacles.splice(index, 1);
          score += 10;
          gameStateRef.current.score = score;
          setGameState({ ...gameStateRef.current });

          // Increase speed every 100 points
          if (score % 100 === 0) {
            gameSpeed += 0.2;
          }
        }
      });

      // Draw everything
      drawDino(DINO_X, dinoY);
      obstacles.forEach(drawObstacle);
      drawScore();

      // Continue game loop
      if (gameStateRef.current.isPlaying) {
        animationId = requestAnimationFrame(gameLoop);
      }
    }

    // Initial draw
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGround();
    drawDino(DINO_X, GROUND_Y);
    drawStartText();

    // Cleanup function
    return () => {
      canvas.removeEventListener("click", handleClick);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  };

  return (
    <div
      className="game-container"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px",
        minHeight: "100vh",
        backgroundColor: "#f0f0f0",
      }}>
      <h1
        style={{
          marginBottom: "20px",
          color: "#333",
          fontFamily: "Arial, sans-serif",
        }}>
        Chrome Dino Game
      </h1>

      <div
        style={{
          border: "2px solid #ccc",
          borderRadius: "8px",
          overflow: "hidden",
          backgroundColor: "#f7f7f7",
        }}>
        <canvas
          ref={gameCanvasRef}
          style={{
            display: "block",
            cursor: "pointer",
          }}
        />
      </div>

      <div
        style={{
          marginTop: "20px",
          textAlign: "center",
          color: "#666",
          fontFamily: "Arial, sans-serif",
        }}>
        <p>
          <strong>Controls:</strong> Click to jump/start
        </p>
        <p>
          <strong>Score:</strong> {gameState.score}
        </p>
        {gameState.isGameOver && <p style={{ color: "#d9534f" }}>Game Over!</p>}
      </div>
    </div>
  );
}
