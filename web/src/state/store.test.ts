import { describe, it, expect } from 'vitest';
import { createPixiStore } from './store';

describe('createPixiStore', () => {
  it('starts with a 5x5 population', () => {
    const store = createPixiStore();
    expect(store.getState().members.length).toBe(25);
    expect(store.getState().popRow).toBe(5);
  });

  it('setPopSize resizes the population and clamps focusedId/lastSel', () => {
    const store = createPixiStore();
    store.getState().focus(24);
    store.setState({ lastSel: 24 });

    store.getState().setPopSize(2);

    expect(store.getState().members.length).toBe(4);
    expect(store.getState().focusedId).toBe(3);
    expect(store.getState().isFocused).toBe(false);
    expect(store.getState().lastSel).toBe(-1);
  });

  it('increasePop/decreasePop step popRow by one, floored at 1', () => {
    const store = createPixiStore();
    store.getState().setPopSize(1);
    store.getState().decreasePop();
    expect(store.getState().popRow).toBe(1);

    store.getState().increasePop();
    expect(store.getState().popRow).toBe(2);
    expect(store.getState().members.length).toBe(4);
  });

  it('setAA clamps to [1, 16]', () => {
    const store = createPixiStore();
    store.getState().setAA(-10);
    expect(store.getState().aa).toBe(1);

    store.getState().setAAValue(999);
    expect(store.getState().aa).toBe(16);
  });

  it('toggleSelect flips isSelected and drives isAnySelected/lastSel', () => {
    const store = createPixiStore();
    expect(store.getState().isAnySelected()).toBe(false);

    store.getState().toggleSelect(2);
    expect(store.getState().members[2].isSelected).toBe(true);
    expect(store.getState().isAnySelected()).toBe(true);
    expect(store.getState().lastSel).toBe(2);

    store.getState().toggleSelect(2);
    expect(store.getState().members[2].isSelected).toBe(false);
    expect(store.getState().isAnySelected()).toBe(false);
    expect(store.getState().lastSel).toBe(-1);
  });

  it('evolve is a no-op when nothing is selected', () => {
    const store = createPixiStore();
    const before = store.getState().members.map((m) => m.dna);

    store.getState().evolve();

    expect(store.getState().members.map((m) => m.dna)).toEqual(before);
  });

  it('evolve mutates the population when something is selected', () => {
    const store = createPixiStore();
    store.getState().toggleSelect(0);
    const selectedDna = store.getState().members[0].dna;

    store.getState().evolve();

    expect(store.getState().members[0].dna).not.toBe(selectedDna);
    expect(store.getState().pop.lastPool).toEqual([selectedDna]);
  });

  it('randomPop resets lastSel to -1', () => {
    const store = createPixiStore();
    store.getState().toggleSelect(0);
    store.getState().randomPop();
    expect(store.getState().lastSel).toBe(-1);
    expect(store.getState().isAnySelected()).toBe(false);
  });
});
