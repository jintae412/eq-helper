import { concat, encodeWav } from './wav';

const loaded = new WeakSet<AudioContext>();

export interface Recording {
  /** Synchronous so the caller can share the file inside the same tap gesture (iOS requires it). */
  stop(): Blob;
}

// ponytail: buffers in memory (~11 MB/min at 48 kHz); stream to IndexedDB if long recordings are needed
export async function startRecording(ctx: AudioContext, source: AudioNode): Promise<Recording> {
  if (!loaded.has(ctx)) {
    await ctx.audioWorklet.addModule(`${import.meta.env.BASE_URL}recorder-worklet.js`);
    loaded.add(ctx);
  }
  const node = new AudioWorkletNode(ctx, 'recorder');
  const chunks: Float32Array[] = [];
  node.port.onmessage = (e: MessageEvent<Float32Array>) => chunks.push(e.data);
  source.connect(node);
  node.connect(ctx.destination); // some browsers only run nodes that reach the destination

  return {
    stop() {
      source.disconnect(node);
      node.disconnect();
      node.port.onmessage = null;
      return new Blob([encodeWav(concat(chunks), ctx.sampleRate)], { type: 'audio/wav' });
    },
  };
}

/** Share sheet on iPhone (AirDrop / Save to Files); plain download elsewhere. */
export async function saveRecording(blob: Blob, label: string): Promise<void> {
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  const safe = label.trim().replace(/[^\w-]+/g, '_') || 'recording';
  const file = new File([blob], `${stamp}_${safe}.wav`, { type: 'audio/wav' });

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
    } catch (e) {
      if ((e as Error).name !== 'AbortError') throw e; // user closed the share sheet
    }
    return;
  }
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
