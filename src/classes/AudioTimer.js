// if only JS was precise
export class AudioTimer {
  audioPlay;
  #k;
  #currentTime = -1;
  started = false;
  paused = true;
  #startTimestamp = -1;
  #offset = 0;
  #startOffset;
  #gameOffset;

  get currentTime() {
    return this.#currentTime + this.#gameOffset;
  }

  constructor(audioPlay, k, {
    startOffset = 0,
    gameOffset = 0
  }) {
    this.audioPlay = audioPlay;
    this.#k = k;
    this.#startOffset = startOffset;
    this.#gameOffset = gameOffset;
    let isPaused = false;
    let isPastOffset = false;
    let offsetStart = -1;
    this.#k.onUpdate(() => {
      if (this.#currentTime >= 0) {
        if (!isPastOffset) this.audioPlay.paused = false;
        isPastOffset = true;
        this.paused = this.audioPlay.paused;
      } else {
        isPastOffset = false;
        this.audioPlay.paused = true;
      }

      if (!this.paused) {
        if (isPaused) this.#offset += performance.now() - offsetStart;
        isPaused = false;
        this.#currentTime = ((performance.now() - this.#startTimestamp) - this.#offset) - this.#startOffset;
      } else {
        if (!isPaused) offsetStart = performance.now();
        isPaused = true;
      }

      if (isPastOffset) {
        let audioDiff = this.#currentTime - this.audioPlay.time() * 1000;

        if (Math.abs(audioDiff) >= 60) {
          this.#offset += audioDiff
        }
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