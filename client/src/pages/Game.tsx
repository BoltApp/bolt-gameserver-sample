import { useEffect, useRef, useState } from "preact/hooks";
import CharacterImage from "../assets/Character_l_Sample01.png";
import GameOverOverlay from "../components/GameOverOverlay";
import "./Game.css";
import { BoltSDK, type PreloadedAd } from "@boltpay/bolt-js";
import { env } from "../configs/env";

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
  const [preloadedAd, setPreloadedAd] = useState<PreloadedAd | null>(null);

  useEffect(() => {
    if (!gameCanvasRef.current) return;

    const canvas = gameCanvasRef.current;
    const ctx = canvas.getContext("2d")!;

    // Set canvas size
    canvas.width = gameCanvasRef.current.parentElement?.clientWidth || 800;
    canvas.height = 300;
    console.log("Setting canvas size", canvas.width, canvas.height);

    return initGame(canvas, ctx);
  }, []);

  const preloadAd = () => {
    const ad = BoltSDK.gaming.preloadAd(env.AD_LINK, {
      type: "untimed",
      onClaim: () => {
        handleRestartClick();
      },
    });
    setPreloadedAd(ad ?? null);
  };

  const initGame = (
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
  ) => {
    preloadAd();

    // Game constants
    const GRAVITY = 0.5;
    const JUMP_FORCE = -12;
    const GROUND_Y = 250;
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
        // Game loop is already running, no need to call it again
      } else if (!gameStateRef.current.isGameOver) {
        jump();
      }
      // Remove the game over restart logic since we handle it with the overlay button
    };

    // Add click listener
    canvas.addEventListener("mousedown", handleClick);

    // Game loop
    function gameLoop() {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw ground
      drawGround();

      if (!gameStateRef.current.isPlaying) {
        if (!gameStateRef.current.isGameOver) {
          drawStartText();
        }
        drawDino(DINO_X, GROUND_Y);

        // Continue the animation loop even when not playing to update the character image
        animationId = requestAnimationFrame(gameLoop);
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

    // Initial draw and start animation loop
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGround();
    drawDino(DINO_X, GROUND_Y);
    drawStartText();

    // Start the animation loop immediately
    gameLoop();

    // Cleanup function
    return () => {
      canvas.removeEventListener("mousedown", handleClick);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  };

  const handleRestartClick = () => {
    if (gameStateRef.current.isGameOver) {
      const canvas = gameCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d")!;

        // Reset game state
        gameStateRef.current = {
          score: 0,
          isGameOver: false,
          isPlaying: false,
        };
        setGameState({ ...gameStateRef.current });

        // Reinitialize the game
        initGame(canvas, ctx);
      }
    }
  };

  const handleShowAdBeforeRestart = () => {
    if (preloadedAd) {
      preloadedAd.show();
    }
  };

  return (
    <div className="game-container">
      <h1 className="game-title">Jump Game</h1>

      <div className="game-canvas-container">
        <canvas ref={gameCanvasRef} className="game-canvas" />

        {gameState.isGameOver && (
          <GameOverOverlay
            score={gameState.score}
            onPlayAgain={handleShowAdBeforeRestart}
          />
        )}
      </div>

      <div className="game-controls-info">
        <p>
          <strong>Controls:</strong> Click to jump/start
        </p>
        <p>
          <strong>Score:</strong> {gameState.score}
        </p>
      </div>
    </div>
  );
}
