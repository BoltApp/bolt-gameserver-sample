import { useEffect, useRef } from 'preact/hooks';
import { zappyAssetUrl } from '../zappy_bird/asset';
import { startZappyBird } from '../zappy_bird';
import { BoltSDK } from '@boltpay/bolt-js';
import './ZappyBird.css';

export default function ZappyBird() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    window.BOLT_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3111';
    window.GAME_CONFIG ??= { spaceshipEnabled: false, voltageBoost: false };
    // The bundled game still expects these globals for optional ad flows.
    window.BoltSDK ??= BoltSDK;
    window.dispatchEvent(new CustomEvent('boltSDKReady'));

    let cleanup: undefined | (() => void);
    (async () => {
      cleanup = await startZappyBird(canvasRef.current!);
    })();

    return () => {
      cleanup?.();
    };
  }, []);

  return (
    <div className="zappy-container">
      <video id="intro-video" className="zappy-intro-video" autoplay muted playsInline>
        <source src={zappyAssetUrl('voltage_intro.mov')} type="video/quicktime" />
        <source src={zappyAssetUrl('voltage_intro.mov')} type="video/mp4" />
      </video>
      <div id="click-to-begin" className="hidden zappy-overlay">
        <div id="click-to-begin-text">Click to Begin</div>
      </div>
      <canvas ref={canvasRef} className="zappy-canvas" />
    </div>
  );
}
