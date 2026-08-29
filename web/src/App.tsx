import { useEffect, useState } from 'react';
import { usePixiStore } from './state/store';
import { GridView } from './components/GridView';
import { SingleView } from './components/SingleView';
import { useGlobalShortcuts } from './hooks/useGlobalShortcuts';

function useWindowSize() {
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  useEffect(() => {
    function onResize() {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return size;
}

export default function App() {
  useGlobalShortcuts();
  const { width, height } = useWindowSize();
  const view = usePixiStore((s) => s.view);

  return (
    <div style={{ width, height }}>
      {view === 'GRID' ? <GridView width={width} height={height} /> : <SingleView width={width} height={height} />}
    </div>
  );
}
