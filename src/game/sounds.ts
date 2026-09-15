// ============================================================
// BlockMind — Web Audio API Sound Engine
// ============================================================
// All sounds are generated synthetically — no external audio files needed.

let audioCtx: AudioContext | null = null;
let muted = false;

function getCtx(): AudioContext | null {
  if (muted) return null;
  if (!audioCtx) {
    try {
      audioCtx = new AudioContext();
    } catch {
      return null;
    }
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function isMuted() {
  return muted;
}

export function setMuted(value: boolean) {
  muted = value;
}

function playTone(
  freq: number,
  duration: number,
  type: OscillatorType = "sine",
  gain = 0.15,
  detune = 0,
  delay = 0,
) {
  const ctx = getCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  osc.detune.value = detune;
  g.gain.setValueAtTime(gain, ctx.currentTime + delay);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start(ctx.currentTime + delay);
  osc.stop(ctx.currentTime + delay + duration);
}

function playNoise(duration: number, gain = 0.06) {
  const ctx = getCtx();
  if (!ctx) return;
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const g = ctx.createGain();
  g.gain.setValueAtTime(gain, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  const filter = ctx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 2000;
  source.connect(filter);
  filter.connect(g);
  g.connect(ctx.destination);
  source.start();
  source.stop(ctx.currentTime + duration);
}

// --- Sound Effects ---

/** Soft click for piece pickup / selection */
export function playSelect() {
  playTone(800, 0.06, "sine", 0.1);
  playTone(1200, 0.04, "sine", 0.06, 0, 0.02);
}

/** Snappy drop sound for piece placement */
export function playPlace() {
  playTone(300, 0.08, "square", 0.08);
  playTone(180, 0.1, "square", 0.06, 0, 0.02);
  playNoise(0.05, 0.04);
}

/** Pleasant chime for single line / row clear */
export function playLineClear() {
  playTone(523, 0.15, "sine", 0.12);
  playTone(659, 0.15, "sine", 0.1, 0, 0.06);
  playTone(784, 0.2, "sine", 0.1, 0, 0.12);
}

/** Escalating chime / fanfare for multi-line combo clear */
export function playComboClear(lines: number) {
  const baseFreq = 440;
  const notes = [1, 1.25, 1.5, 1.875, 2.0];
  const count = Math.min(lines, notes.length);
  for (let i = 0; i < count; i++) {
    playTone(
      baseFreq * notes[i],
      0.15,
      "sine",
      0.1,
      0,
      i * 0.07,
    );
  }
  // Add a shimmering overtone
  playTone(baseFreq * 3, 0.3, "sine", 0.04, 5, count * 0.07);
}

/** Low-pitched descending game-over tone */
export function playGameOver() {
  playTone(400, 0.3, "sawtooth", 0.08);
  playTone(300, 0.3, "sawtooth", 0.06, 0, 0.15);
  playTone(200, 0.5, "sawtooth", 0.05, 0, 0.3);
}

/** Light tick for undo action */
export function playUndo() {
  playTone(600, 0.05, "sine", 0.08);
  playTone(450, 0.06, "sine", 0.06, 0, 0.03);
}

/** Reset sound — quick descending notes */
export function playReset() {
  playTone(600, 0.08, "sine", 0.08);
  playTone(500, 0.08, "sine", 0.07, 0, 0.05);
  playTone(400, 0.1, "sine", 0.06, 0, 0.1);
}
