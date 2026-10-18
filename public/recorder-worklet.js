// Runs on the audio thread. Copies raw mic samples (channel 0) to the main thread.
// Outputs silence, so connecting it to the destination never plays the mic back.
class RecorderProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const channel = inputs[0][0];
    if (channel) this.port.postMessage(channel.slice());
    return true;
  }
}

registerProcessor('recorder', RecorderProcessor);
