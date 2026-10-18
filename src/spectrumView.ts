const MIN_HZ = 20;
const MAX_HZ = 20_000;
const TOP_DB = -10;
const RANGE_DB = 100;

/** Log-frequency spectrum plot with red markers at flagged frequencies. */
export function drawSpectrum(canvas: HTMLCanvasElement, db: Float32Array, binHz: number, marksHz: number[]): void {
  const g = canvas.getContext('2d');
  if (!g) return;
  const { width: w, height: h } = canvas;
  const x = (f: number) => (Math.log(f / MIN_HZ) / Math.log(MAX_HZ / MIN_HZ)) * w;
  const y = (d: number) => ((TOP_DB - d) / RANGE_DB) * h;

  g.fillStyle = '#181818';
  g.fillRect(0, 0, w, h);

  g.strokeStyle = '#333';
  g.fillStyle = '#888';
  g.font = '20px system-ui';
  for (const f of [50, 100, 250, 500, 1000, 2500, 5000, 10000]) {
    g.beginPath();
    g.moveTo(x(f), 0);
    g.lineTo(x(f), h);
    g.stroke();
    g.fillText(f >= 1000 ? `${f / 1000}k` : `${f}`, x(f) + 4, h - 8);
  }

  g.strokeStyle = '#4fc3f7';
  g.lineWidth = 2;
  g.beginPath();
  for (let i = Math.ceil(MIN_HZ / binHz); i < db.length && i * binHz <= MAX_HZ; i++) {
    const px = x(i * binHz);
    const py = y(Math.max(db[i], TOP_DB - RANGE_DB));
    if (i === Math.ceil(MIN_HZ / binHz)) g.moveTo(px, py);
    else g.lineTo(px, py);
  }
  g.stroke();

  g.strokeStyle = '#ff5252';
  g.lineWidth = 3;
  for (const f of marksHz) {
    g.beginPath();
    g.moveTo(x(f), 0);
    g.lineTo(x(f), h);
    g.stroke();
  }
}
