const STEPS_PER_OCTAVE = 24;
const HALF_STEP = 2 ** (1 / (2 * STEPS_PER_OCTAVE));
const SILENT_DB = -160;

/**
 * Follows the loudest point inside a frequency range while someone boost-and-sweeps an EQ band.
 * Smooths over ~1 s so the readout doesn't jump with every note.
 */
export class PeakFollower {
  private readonly centers: number[] = [];
  private power: number[] = [];

  constructor(loHz: number, hiHz: number, private readonly alpha = 0.3) {
    for (let f = loHz; f <= hiHz * 1.0001; f *= 2 ** (1 / STEPS_PER_OCTAVE)) this.centers.push(f);
  }

  /** Feed one spectrum (dB per bin); returns the current loudest center frequency. */
  update(db: Float32Array, binHz: number): number {
    const now = this.centers.map((fc) => {
      const lo = Math.max(1, Math.ceil(fc / HALF_STEP / binHz));
      const hi = Math.min(db.length - 1, Math.floor((fc * HALF_STEP) / binHz));
      let sum = 0;
      for (let i = lo; i <= hi; i++) sum += 10 ** (Math.max(db[i], SILENT_DB) / 10);
      return sum;
    });
    this.power = this.power.length ? this.power.map((p, i) => p + this.alpha * (now[i] - p)) : now;
    let best = 0;
    for (let i = 1; i < this.power.length; i++) if (this.power[i] > this.power[best]) best = i;
    return this.centers[best];
  }
}
