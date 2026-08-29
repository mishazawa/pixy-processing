import { useRef, type ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrthographicCamera } from '@react-three/drei';
import { usePixiStore } from '../state/store';
import { appTimeClock } from '../state/appTimeClock';

const SYNC_EVERY_N_FRAMES = 6;

// Advances the single shared appTimeClock once per frame (mirroring
// Pixi.java's one app.appTime field, updated once per frame in runTime()),
// throttling the sync back to the store to ~10Hz so the slider's displayed
// value stays live without forcing 60 re-renders/sec. Every Artwork reads
// appTimeClock.value directly each frame, independent of this sync.
function AppTimeDriver() {
  const timeRun = usePixiStore((s) => s.timeRun);
  const timeFreq = usePixiStore((s) => s.timeFreq);
  const setAppTime = usePixiStore((s) => s.setAppTime);
  const frameCount = useRef(0);

  useFrame(() => {
    if (!timeRun) return;
    appTimeClock.value += 1 / timeFreq / 60;
    if (appTimeClock.value >= 1) appTimeClock.value = 0;

    frameCount.current++;
    if (frameCount.current >= SYNC_EVERY_N_FRAMES) {
      frameCount.current = 0;
      setAppTime(appTimeClock.value);
    }
  });

  return null;
}

export interface SceneProps {
  width: number;
  height: number;
  children: ReactNode;
}

// World units == CSS pixels, origin top-left, Y growing downward (matching
// screen-space conventions the rest of the app's layout math uses). Tiles
// place themselves in this space directly with their CSS-pixel rects.
export function Scene({ width, height, children }: SceneProps) {
  return (
    <Canvas orthographic style={{ width, height }} gl={{ antialias: false }}>
      <OrthographicCamera
        makeDefault
        left={0}
        right={width}
        top={0}
        bottom={-height}
        near={-1000}
        far={1000}
        position={[0, 0, 1]}
      />
      <AppTimeDriver />
      {children}
    </Canvas>
  );
}
