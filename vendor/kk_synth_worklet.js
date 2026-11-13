/* KaraokeKo — lokal na SpessaSynth worklet (core 4.3.6, walang CDN, walang lib).
   Gumagamit ng SpessaSynthProcessor.process() para mag-render ng SF2/SF3 sa audio thread. */
import { SpessaSynthProcessor, SoundBankLoader } from './spessasynth_core.js';

class KKSynthProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.synth = new SpessaSynthProcessor(sampleRate, { initialTime: currentTime });
    this.ready = false;
    this.port.onmessage = e => this.onMsg(e.data);
  }
  async onMsg(m) {
    const s = this.synth;
    try {
      switch (m.t) {
        case 'bank': {
          await s.processorInitialized;                       // kailangan para sa SF3 (compressed)
          const sb = SoundBankLoader.fromArrayBuffer(m.buf);
          s.soundBankManager.addSoundBank(sb, m.id || 'main');
          s.reset();
          this.ready = true;
          this.port.postMessage({ t: 'bank-ok', n: m.n });
          break;
        }
        case 'unbank': try { s.soundBankManager.deleteSoundBank(m.id || 'main'); } catch (e) {} this.ready = false; break;
        case 'on':    s.noteOn(m.ch, m.k, m.v); break;
        case 'off':   s.noteOff(m.ch, m.k); break;
        case 'cc':    s.controllerChange(m.ch, m.c, m.v); break;
        case 'pc':    s.programChange(m.ch, m.p); break;
        case 'pw':    s.pitchWheel(m.ch, m.v); break;
        case 'stop':  s.stopAllChannels(!!m.force); break;
        case 'reset': s.reset(); break;
      }
    } catch (err) {
      if (m.t === 'bank') this.port.postMessage({ t: 'bank-err', n: m.n, msg: String(err && err.message || err) });
      else console.warn('[kk-synth]', m.t, err);
    }
  }
  process(inputs, outputs) {
    const out = outputs[0];
    if (!out || !out[0] || !this.ready) return true;
    const L = out[0], R = out[1] || out[0];
    try { this.synth.process(L, R, 0, L.length); } catch (e) {}
    return true;
  }
}
registerProcessor('kk-synth', KKSynthProcessor);
