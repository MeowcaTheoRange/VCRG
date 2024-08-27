import { ArrayUtils } from "../utils/ArrayUtils";

// Handles notes and SVs.
export class NoteManager {
  velList = [
    [0, 1]
  ];
  noteList = [];
  noteSpeed = 1000;
  velTimeList = [];
  velObjectList = [];
  noteTimeList = [];
  noteObjectList = [];

  constructor(noteList, velList, {
    noteSpeed = 1000
  }) {
    this.noteSpeed = noteSpeed;
    noteList.forEach(({ Time: time, Lane: lane, Tail: tail }) => {
      this.noteList.push([time, lane, tail]);
    });
    this.noteList.sort((a, b) => a[0] - b[0]);
    velList.forEach(({ Time: time, Scale: scale }) => {
      if (scale == null) console.log(scale = 0);
      this.velList.push([time, scale]);
    });
    this.velList.sort((a, b) => a[0] - b[0]);
    this.#compileVelOffsets();
    this.#compileNoteVels();
    console.log(this.velObjectList.map((x, i) => ({
      time: this.velTimeList[i],
      ...x
    })));
    console.log(this.noteObjectList.map((x, i) => ({
      time: this.noteTimeList[i],
      ...x
    })));
  }

  #compileNoteVels() {
    this.noteTimeList = [];
    this.noteObjectList = [];
    this.noteList.forEach(([time, lane, tail], i) => {
      const pSVIdx = ArrayUtils.getClosestStart(this.velTimeList, time);
      let svtime = this.velTimeList[pSVIdx], svobj = this.velObjectList[pSVIdx];
      const newPos = svobj.offset + (svtime + ((time - svtime) * svobj.scale));

      this.noteTimeList.push(time);
      this.noteObjectList.push({
        svtm: newPos, lane, tail
      });
    });
  }

  #compileVelOffsets() {
    this.velTimeList = [];
    this.velObjectList = [];
    let pvo = 0;
    this.velList.forEach(([time, scale], i) => {
      const [prevTime, prevScale] = this.velList[i - 1] ?? [0, 1];
      const newOffset = (pvo + (prevTime + ((time - prevTime) * prevScale))) - time;
      pvo = newOffset;
      this.velTimeList.push(time);
      this.velObjectList.push({
        scale: scale,
        offset: newOffset
      });
    });
  }

  getPlayheadSVPosition(time) {
    const pSVIdx = ArrayUtils.getClosestStart(this.velTimeList, time);
    let svtime = this.velTimeList[pSVIdx], svobj = this.velObjectList[pSVIdx];
    const newPos = svobj.offset + (svtime + ((time - svtime) * svobj.scale));
    return newPos;
  }

  getVisibleNotes(time) {
    const noteidx = ArrayUtils.getClosestEnd(this.noteTimeList, time);
    const result = [];

    let i = noteidx;
    while (true) {
      const currentNote = this.noteObjectList[i];
      if (currentNote == null || currentNote.svtm > time + this.noteSpeed) {
        break;
      } else {
        result.push(currentNote);
      }
      i++;
    }
    i = noteidx;
    while (true) {
      const currentNote = this.noteObjectList[i];
      if (currentNote == null || currentNote.svtm < time - this.noteSpeed) {
        break;
      } else {
        result.unshift(currentNote);
      }
      i--;
    }
    return result;
  }
}