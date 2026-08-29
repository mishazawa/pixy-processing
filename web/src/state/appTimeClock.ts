// Single shared "clock" for time-loop animation, mirroring Pixi.java's one
// app.appTime field (Java updates it once per frame in runTime() and every
// Artwork reads the same value in animateArgs()). A plain mutable object,
// not zustand state, so every Artwork's useFrame can read it every frame
// without triggering a React re-render -- only AppTimeDriver (in Scene.tsx)
// writes the per-frame advance; store actions (setAppTime/stopTime) write
// it directly too, for scrub/stop.
export const appTimeClock = { value: 0 };
