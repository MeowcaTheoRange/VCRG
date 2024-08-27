// if only JS was precise
export class AudioTimer {
  audioPlay;
  #k;
  currentTime = 0;
  started = false;
  paused = true;
  #startTimestamp = -1;
  #offset = 0;

  constructor(audioPlay, k) {
    this.audioPlay = audioPlay;
    this.#k = k;
    let isPaused = false;
    let offsetStart = -1;
    this.#k.onUpdate(() => {
      this.paused = this.audioPlay.paused;

      if (!this.paused) {
        if (isPaused) this.#offset += performance.now() - offsetStart;
        isPaused = false;
        this.currentTime = (performance.now() - this.#startTimestamp) - this.#offset;
      } else {
        if (!isPaused) offsetStart = performance.now();
        isPaused = true;
      }

      let audioDiff = this.currentTime - this.audioPlay.time() * 1000;

      if (Math.abs(audioDiff) >= 60) {
        this.#offset += audioDiff
      }
    })
  }

  start() {
    this.started = true;
    this.paused = false;
    this.#startTimestamp = performance.now();
  }

  stop() {
    this.started = false;
    this.paused = true;
  }
}