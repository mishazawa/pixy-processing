import type { ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrthographicCamera } from '@react-three/drei';

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
        near={-1}
        far={1}
        position={[0, 0, 1]}
      />
      {children}
    </Canvas>
  );
}
