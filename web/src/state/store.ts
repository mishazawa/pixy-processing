import { create } from 'zustand';
import { Pop, type PopMember } from '../engine/pop';

export type ViewMode = 'GRID' | 'SINGLE';

const INITIAL_POP_ROW = 5;

export interface PixiState {
  pop: Pop;
  members: PopMember[];
  popRow: number;
  view: ViewMode;
  focusedId: number;
  isFocused: boolean;
  lastSel: number;
  aa: number;
  expSize: number;
  appTime: number;
  timeFreq: number;
  timeRun: boolean;
  mutationRate: number;

  setPopSize: (row: number) => void;
  randomPop: () => void;
  toggleSelect: (index: number) => void;
  isAnySelected: () => boolean;
  evolve: () => void;
  evolveAgain: () => void;
  increasePop: () => void;
  decreasePop: () => void;
  setAA: (delta: number) => void;
  setAAValue: (value: number) => void;
  setView: (view: ViewMode) => void;
  focus: (index: number) => void;
  blurFocus: () => void;
  setAppTime: (t: number) => void;
  setTimeFreq: (f: number) => void;
  playTime: () => void;
  pauseTime: () => void;
  stopTime: () => void;
  setExpSize: (size: number) => void;
}

function syncMembers(pop: Pop): PopMember[] {
  return [...pop.members];
}

export function createPixiStore() {
  return create<PixiState>((set, get) => {
    const pop = new Pop();
    pop.setPopSize(INITIAL_POP_ROW);

    return {
      pop,
      members: syncMembers(pop),
      popRow: INITIAL_POP_ROW,
      view: 'GRID',
      focusedId: 0,
      isFocused: false,
      lastSel: -1,
      aa: 1,
      expSize: 1000,
      appTime: 0,
      timeFreq: 5,
      timeRun: true,
      mutationRate: 100,

      setPopSize: (row) => {
        pop.setPopSize(row);
        const popSize = row * row;
        set((state) => ({
          popRow: row,
          members: syncMembers(pop),
          focusedId: state.focusedId >= popSize ? popSize - 1 : state.focusedId,
          isFocused: state.focusedId >= popSize ? false : state.isFocused,
          lastSel: state.lastSel >= popSize ? -1 : state.lastSel,
        }));
      },

      randomPop: () => {
        pop.randomPop();
        set({ members: syncMembers(pop), lastSel: -1 });
      },

      toggleSelect: (index) => {
        const { view, focusedId } = get();
        const member = pop.members[index];
        member.isSelected = !member.isSelected;
        set({
          members: syncMembers(pop),
          lastSel: view === 'SINGLE' ? focusedId : member.isSelected ? index : -1,
        });
      },

      isAnySelected: () => pop.members.some((m) => m.isSelected),

      evolve: () => {
        if (!pop.members.some((m) => m.isSelected)) return;
        pop.evolve(get().mutationRate);
        set({ members: syncMembers(pop), lastSel: -1 });
      },

      evolveAgain: () => {
        pop.evolveAgain(get().mutationRate);
        set({ members: syncMembers(pop) });
      },

      increasePop: () => {
        get().setPopSize(get().popRow + 1);
      },

      decreasePop: () => {
        const { popRow, setPopSize } = get();
        if (popRow > 1) setPopSize(popRow - 1);
      },

      setAA: (delta) => {
        set((state) => ({ aa: Math.max(1, Math.min(16, state.aa + delta)) }));
      },

      setAAValue: (value) => {
        set({ aa: Math.max(1, Math.min(16, value)) });
      },

      setView: (view) => set({ view }),
      focus: (index) => set({ isFocused: true, focusedId: index }),
      blurFocus: () => set({ isFocused: false }),

      setAppTime: (t) => set({ appTime: t }),
      setTimeFreq: (f) => set({ timeFreq: f }),
      playTime: () => set({ timeRun: true }),
      pauseTime: () => set({ timeRun: false }),
      stopTime: () => set({ timeRun: false, appTime: 0 }),

      setExpSize: (size) => set({ expSize: size }),
    };
  });
}

export const usePixiStore = createPixiStore();
