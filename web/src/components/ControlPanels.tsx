import { usePixiStore } from '../state/store';

export function TimeControls() {
  const { appTime, timeFreq, timeRun, setAppTime, setTimeFreq, playTime, pauseTime, stopTime } = usePixiStore();
  return (
    <div>
      <button onClick={playTime} disabled={timeRun}>▶</button>
      <button onClick={pauseTime} disabled={!timeRun}>❙❙</button>
      <button onClick={stopTime}>■</button>
      <label>
        freq
        <input
          type="range"
          min={0.5}
          max={60}
          step={0.5}
          value={timeFreq}
          onChange={(e) => setTimeFreq(Number(e.target.value))}
        />
      </label>
      <label>
        pos
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={appTime}
          onChange={(e) => setAppTime(Number(e.target.value))}
        />
      </label>
      <span>{Math.round(timeFreq * 10) / 10}s</span>
    </div>
  );
}

export function GenControls() {
  const { members, popRow, aa, expSize, increasePop, decreasePop, setAA, setExpSize } = usePixiStore();
  return (
    <div>
      <button onClick={decreasePop} disabled={popRow <= 1}>-</button>
      <button onClick={increasePop}>+</button>
      <button onClick={() => setAA(-1)} disabled={aa <= 1}>AA-</button>
      <button onClick={() => setAA(1)} disabled={aa >= 16}>AA+</button>
      <span>NUM: {members.length}</span>
      <span>AA: {aa}</span>
      <span>RES: {expSize}px</span>
      <input
        type="range"
        min={500}
        max={4000}
        step={10}
        value={expSize}
        onChange={(e) => setExpSize(Number(e.target.value))}
      />
    </div>
  );
}

export function MainControls() {
  const { isAnySelected, evolve, evolveAgain, randomPop, pop } = usePixiStore();
  return (
    <div>
      <button onClick={evolve} disabled={!isAnySelected()}>develop</button>
      <button onClick={evolveAgain} disabled={pop.lastPool.length === 0}>repeat</button>
      <button onClick={randomPop}>new</button>
    </div>
  );
}
