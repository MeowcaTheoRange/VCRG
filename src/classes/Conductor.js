import { ArrayUtils } from "../utils/ArrayUtils.js";
import { Crotchet } from "./Crotchet.js";

// Handles BPM and stuff like that.
export class Conductor {
  bpmList = [];
  #bpmMap = new Map([]);

  constructor(bpmList) {
    bpmList.forEach(({ time, bpm }) => {
      this.bpmList.push([time, bpm]);
    });
    this.bpmList.sort((a, b) => a[0] - b[0]);
    this.#compileBPMMap();
  }

  #compileBPMMap() {
    this.#bpmMap.clear();
    let pco = 0;
    this.bpmList.forEach(([ms, bpm], i) => {
      const [prevMs, prevBpm] = this.bpmList[i - 1] ?? [0, 60];
      const prevCurBeat = Crotchet.timeToBeat(prevMs, prevBpm);
      const curOffset = Crotchet.beatToTime(prevCurBeat, bpm);
      const newOffset = (ms - curOffset) + pco;
      pco = newOffset;
      this.#bpmMap.set(ms, {
        bpm,
        offset: newOffset
      });
    })
  }

  getBPM(time) {
    const mapKeys = this.#bpmMap.keys();
    const result = ArrayUtils.getClosestStart(mapKeys, time);
    return result == -1 ? null : this.#bpmMap.get(result);
  }

  getBeat(time) {
    const { bpm, offset } = this.getBPM(time);
    return offset + Crotchet.timeToBeat(time, bpm);
  }
}