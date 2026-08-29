import { useEffect } from 'react';
import { usePixiStore } from '../state/store';

// Ports Pixi.java's keyPressed() global shortcuts that apply in both views:
// space=random pop, x=evolve, c=toggle-select-focused, 1-6=set AA,
// esc/backspace=back to grid. ('s'=export is wired in App.tsx, next to the
// offscreen canvas it needs; a/z/arrows are SingleView-only, wired there.)
export function useGlobalShortcuts() {
  const randomPop = usePixiStore((s) => s.randomPop);
  const evolve = usePixiStore((s) => s.evolve);
  const toggleSelect = usePixiStore((s) => s.toggleSelect);
  const setAAValue = usePixiStore((s) => s.setAAValue);
  const setView = usePixiStore((s) => s.setView);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === ' ') {
        e.preventDefault();
        randomPop();
      }
      if (e.key === 'x') evolve();
      if (e.key === 'c') toggleSelect(usePixiStore.getState().focusedId);
      if (e.key >= '1' && e.key <= '6') setAAValue(Number(e.key));
      if (e.key === 'Backspace' || e.key === 'Escape') setView('GRID');
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [randomPop, evolve, toggleSelect, setAAValue, setView]);
}
