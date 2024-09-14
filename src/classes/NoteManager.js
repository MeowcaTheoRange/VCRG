import { ArrayUtils } from "../utils/ArrayUtils";

// Handles notes and SVs.
export class NoteManager {
  velList = [
    [0, 1]
  ];
  noteList = [];
  noteSpeed = 1000;
  lanes = 4;
  velTimeList = [];
  velObjectList = [];
  noteTimeList = [];
  noteSVTimeList = [];
  noteObjectList = [];
  noteTimeLaneList = [];

  constructor(noteList, velList, {
    noteSpeed = 1000,
    lanes = 4
  }) {
    this.noteSpeed = noteSpeed;
    this.lanes = lanes;
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
    for (let i = 0; i < this.lanes; i++) {
      this.noteTimeLaneList.push([]);
    }
    this.#compileNoteVels();
    this.noteSVTimeList.sort((a, b) => a[0] - b[0]);
    console.log(this.noteTimeLaneList);
    // this.#compileNoteNSVVels();
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
      this.noteSVTimeList.push([newPos, i]);
      this.noteTimeLaneList[lane].push([time, i]);
      this.noteObjectList.push({
        svtm: newPos, lane, tail
      });
    });
  }

  // noteTimeListNSV = [];
  // noteObjectListNSV = [];
  // #compileNoteNSVVels() {
  //   this.noteTimeListNSV = [];
  //   this.noteObjectListNSV = [];
  //   this.noteList.forEach(([time, lane, tail], i) => {
  //     this.noteTimeListNSV.push(time);
  //     this.noteObjectListNSV.push({
  //       svtm, lane, tail
  //     });
  //   });
  // }

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
    if (svobj == null) svobj = { scale: 1, offset: 0 };
    const newPos = svobj.offset + (svtime + ((time - svtime) * svobj.scale));
    return newPos;
  }

  getNoteAtTime(time) {
    const noteidx = ArrayUtils.getClosestStart(this.noteTimeList, time);
    return this.noteObjectList[noteidx];
  }

  getNoteAtTimeInLane(time, lane) {
    const noteidx = ArrayUtils.getClosestStart(this.noteTimeLaneList[lane], time, o => o[0]);
    if (noteidx == -1) return null;
    return this.noteObjectList[this.noteTimeLaneList[lane][noteidx][1]];
  }

  // something is VERY fucky here.
  // TODO: Refactor NoteManager rendering functions
  getVisibleNotes(time) {
    const noteidxidx = ArrayUtils.getClosestEnd(this.noteSVTimeList, time, o => o[0]);
    const noteidx = this.noteSVTimeList[noteidxidx][1]; // idgaf if it crashes
    const result = [];

    // console.log(noteidx);
    let lowerbound, upperbound, lbt = time, ubt = time;

    let i = noteidx;
    while (true) {
      const currentNote = this.noteObjectList[i];
      if (currentNote == null || currentNote.svtm >= time + this.noteSpeed) {
        break;
      } else {
        result.push(currentNote);
        ubt = currentNote.svtm;
      }
      i++;
    }
    upperbound = i;
    i = noteidx;
    while (true) {
      const currentNote = this.noteObjectList[i];
      if (currentNote == null || currentNote.svtm <= time - this.noteSpeed) {
        break;
      } else {
        result.unshift(currentNote);
        lbt = currentNote.svtm;
      }
      i--;
    }
    lowerbound = i;
    debug.log(
      "\nLBIDX " + lowerbound +
      "\nMBIDX " + noteidx +
      "\nUBIDX " + upperbound +
      "\nLBT " + lbt +
      "\nMBT " + time +
      "\nUBT " + ubt +
      "\nCR " + result.length
    );
    return result;
  }

  // getVisibleNotesNSV(time) {
  //   const noteidx = ArrayUtils.getClosestEnd(this.noteTimeListNSV, time);
  //   const result = [];

  //   let i = noteidx;
  //   while (true) {
  //     const currentNote = this.noteObjectListNSV[i];
  //     if (currentNote == null || currentNote.svtm > time + this.noteSpeed) {
  //       break;
  //     } else {
  //       result.push(currentNote);
  //     }
  //     i++;
  //   }
  //   i = noteidx;
  //   while (true) {
  //     const currentNote = this.noteObjectListNSV[i];
  //     if (currentNote == null || currentNote.svtm < time - this.noteSpeed) {
  //       break;
  //     } else {
  //       result.unshift(currentNote);
  //     }
  //     i--;
  //   }
  //   return result;
  // }
}