import { expect, it } from 'vitest';
import { concat, encodeWav } from './wav';

it('encodes a valid mono 16-bit WAV with clipped samples', () => {
  const samples = concat([new Float32Array([0, 1]), new Float32Array([-1, 2])]);
  const v = new DataView(encodeWav(samples, 48_000));
  const ascii = (o: number) => String.fromCharCode(...[0, 1, 2, 3].map((i) => v.getUint8(o + i)));

  expect(ascii(0)).toBe('RIFF');
  expect(ascii(8)).toBe('WAVE');
  expect(v.getUint32(24, true)).toBe(48_000);
  expect(v.getUint32(40, true)).toBe(8); // 4 samples × 2 bytes
  expect([0, 1, 2, 3].map((i) => v.getInt16(44 + i * 2, true))).toEqual([0, 32767, -32768, 32767]);
});
