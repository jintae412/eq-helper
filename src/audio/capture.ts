export interface Capture {
  ctx: AudioContext;
  source: MediaStreamAudioSourceNode;
  binHz: number;
  /** What the browser actually applied. If autoGainControl is true here, AGC is on. */
  settings: MediaTrackSettings;
  read(): Float32Array;
  stop(): void;
}

/** Must be called from a tap/click handler: iOS only starts audio on a user gesture. */
export async function startCapture(fftSize = 16384): Promise<Capture> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
  });
  const ctx = new AudioContext();
  await ctx.resume();
  const analyser = ctx.createAnalyser();
  analyser.fftSize = fftSize;
  analyser.smoothingTimeConstant = 0; // smoothing belongs in pure analysis code
  const source = ctx.createMediaStreamSource(stream);
  source.connect(analyser);

  const bins = new Float32Array(analyser.frequencyBinCount);
  return {
    ctx,
    source,
    binHz: ctx.sampleRate / fftSize,
    settings: stream.getAudioTracks()[0].getSettings(),
    read() {
      analyser.getFloatFrequencyData(bins); // dB per bin
      return bins;
    },
    stop() {
      stream.getTracks().forEach((t) => t.stop());
      void ctx.close();
    },
  };
}
