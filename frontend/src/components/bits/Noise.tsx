import React, { useRef, useEffect } from 'react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { registerBits } from '../../debug/registry';

interface NoiseProps {
  patternSize?: number;
  patternScaleX?: number;
  patternScaleY?: number;
  patternRefreshInterval?: number;
  patternAlpha?: number;
}

const Noise: React.FC<NoiseProps> = ({
  patternSize = 250,
  patternScaleX = 1,
  patternScaleY = 1,
  patternRefreshInterval = 2,
  patternAlpha = 14,
}) => {
  const grainRef = useRef<HTMLCanvasElement | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    registerBits('Noise');
    const canvas = grainRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const canvasSize = 1024;

    const resize = () => {
      if (!canvas) return;
      canvas.width = canvasSize;
      canvas.height = canvasSize;
      canvas.style.width = '100vw';
      canvas.style.height = '100vh';
    };

    const drawGrain = () => {
      const imageData = ctx.createImageData(canvasSize, canvasSize);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const value = Math.random() * 255;
        data[i] = value;
        data[i + 1] = value;
        data[i + 2] = value;
        data[i + 3] = patternAlpha;
      }
      ctx.putImageData(imageData, 0, 0);
    };

    resize();
    drawGrain();

    window.addEventListener('resize', drawGrain);
    return () => {
      window.removeEventListener('resize', drawGrain);
    };
  }, [patternAlpha, prefersReducedMotion]);

  return (
    <canvas
      className="noise-canvas"
      ref={grainRef}
      aria-hidden="true"
      style={{
        imageRendering: 'pixelated',
        transform: `scaleX(${patternScaleX}) scaleY(${patternScaleY})`,
      }}
    />
  );
};

export default Noise;
