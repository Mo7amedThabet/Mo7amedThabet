/** Procedural engine + horn via Web Audio (no external files) */
export class CarAudioController {
  private ctx: AudioContext | null = null;
  private engineOsc: OscillatorNode | null = null;
  private engineOsc2: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private started = false;

  private ensureContext() {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      this.ctx = new Ctx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.35;
      this.masterGain.connect(this.ctx.destination);
    }
    return this.ctx;
  }

  /** Call once after user interacts (keydown / click) */
  start() {
    const ctx = this.ensureContext();
    if (!ctx || this.started) return;
    if (ctx.state === "suspended") void ctx.resume();

    this.engineGain = ctx.createGain();
    this.engineGain.gain.value = 0;
    this.engineGain.connect(this.masterGain!);

    this.engineOsc = ctx.createOscillator();
    this.engineOsc.type = "sawtooth";
    this.engineOsc.frequency.value = 55;
    this.engineOsc.connect(this.engineGain);

    this.engineOsc2 = ctx.createOscillator();
    this.engineOsc2.type = "triangle";
    this.engineOsc2.frequency.value = 110;
    this.engineOsc2.connect(this.engineGain);

    this.engineOsc.start();
    this.engineOsc2.start();
    this.started = true;
  }

  /** speedRatio 0..1 */
  updateEngine(speedRatio: number) {
    if (!this.started || !this.engineOsc || !this.engineGain) return;
    const r = Math.min(1, Math.abs(speedRatio));
    const base = 48 + r * 90;
    this.engineOsc.frequency.setTargetAtTime(base, this.ctx!.currentTime, 0.08);
    this.engineOsc2!.frequency.setTargetAtTime(
      base * 2.1,
      this.ctx!.currentTime,
      0.08,
    );
    this.engineGain.gain.setTargetAtTime(
      0.04 + r * 0.14,
      this.ctx!.currentTime,
      0.1,
    );
  }

  honk() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    if (ctx.state === "suspended") void ctx.resume();

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(280, now + 0.15);
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
    osc.connect(gain);
    gain.connect(this.masterGain ?? ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);

    const osc2 = ctx.createOscillator();
    const g2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.value = 520;
    g2.gain.setValueAtTime(0.12, now + 0.05);
    g2.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    osc2.connect(g2);
    g2.connect(this.masterGain ?? ctx.destination);
    osc2.start(now + 0.05);
    osc2.stop(now + 0.3);
  }

  stop() {
    try {
      this.engineOsc?.stop();
      this.engineOsc2?.stop();
    } catch {
      /* already stopped */
    }
    this.started = false;
  }
}
