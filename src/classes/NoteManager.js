import { ArrayUtils } from "../utils/ArrayUtils";

// Handles notes and SVs.
export class NoteManager {
  velList = [
    [0, 1]
  ];
  noteList = [];
  noteSpeed = 1000;
  lanes = 4;

  velObjectList = [];
  noteSVTimeList = [];
  noteTimeLaneList = [];
  noteObjectList = [];
  lnPieceList = [];
  lnPieceListSortedStart = [];
  lnPieceListSortedEnd = [];

  constructor(noteList, velList, {
    noteSpeed = 1000,
    lanes = 4,
  }) {
    this.noteSpeed = noteSpeed;
    this.lanes = lanes;

    noteList.forEach(({ Time: time, Lane: lane, Tail: tail }) => {
      this.noteList.push([time, lane, tail]);
    });
    this.noteList.sort((a, b) => a[0] - b[0]);

    velList.forEach(({ Time: time, Scale: scale }) => {
      if (scale == null) scale = 0;
      this.velList.push([time, scale]);
    });
    this.velList.sort((a, b) => a[0] - b[0]);

    this.#compileVelOffsets();

    for (let i = 0; i < this.lanes; i++) {
      this.noteTimeLaneList.push([]);
    }

    this.#compileNoteVels();

    this.noteSVTimeList.sort((a, b) => a[0] - b[0]);

    this.#compileLNVels();

    this.lnPieceListSortedStart.sort((a, b) => a[0] - b[0]);
    this.lnPieceListSortedEnd.sort((a, b) => a[0] - b[0]);

    console.log(this.lnPieceList);

    // console.log(this.noteTimeLaneList);
    // console.log(this.velObjectList.map((x, i) => ({
    //   time: this.velTimeList[i],
    //   ...x
    // })));
    // console.log(this.noteObjectList.map((x, i) => ({
    //   time: this.noteTimeList[i],
    //   ...x
    // })));
  }

  #compileNoteVels() {
    this.noteObjectList = [];
    this.noteList.forEach(([time, lane, tail], i) => {
      const pSVIdx = ArrayUtils.getClosestStart(this.velObjectList, time, x => x.time);
      let svobj = this.velObjectList[pSVIdx];
      const newPos = svobj.offset + (svobj.time + ((time - svobj.time) * svobj.scale));

      this.noteSVTimeList.push([newPos, i]);
      this.noteTimeLaneList[lane].push([time, i]);
      this.noteObjectList.push({
        svtm: newPos, lane, tail, time, id: i
      });
    });
  }

  #compileLNVels() {
    this.lnPieceList = [];
    this.noteObjectList.forEach(({ svtm, time, lane, tail }, i) => {

      const lnSVs = ArrayUtils.getClosestRangeLazy(time, tail, this.velObjectList, x => x.time);

      let firstOffset;
      if (lnSVs == null) firstOffset = this.getCalculatedSVPosition(tail);
      else firstOffset = this.velObjectList[lnSVs[0]].time + this.velObjectList[lnSVs[0]].offset;

      console.log(lnSVs == null, this.velObjectList.slice(lnSVs[0], lnSVs[1] + 1));

      this.lnPieceList.push({
        noteid: i,
        id: i,
        pcid: i,
        pvid: null,
        startTime: svtm,
        lane,
        endTime: firstOffset
      });

      this.lnPieceListSortedStart.push([svtm, i]);
      this.lnPieceListSortedEnd.push([firstOffset, i]);

      if (lnSVs == null) return;

      // chop up each LN into pieces
      this.velObjectList.slice(lnSVs[0], lnSVs[1] + 1).forEach((svobj, sv) => {
        const lastPiece = this.lnPieceList.at(-1);
        const endTime = svobj.offset + (svobj.time + ((tail - svobj.time) * svobj.scale));
        console.log(svobj, tail);
        const idx = this.lnPieceList.length;

        this.lnPieceList.push({
          noteid: i,
          id: idx,
          pcid: sv + 1,
          pvid: sv,
          startTime: lastPiece?.endTime || svtm,
          lane,
          endTime
        });
        this.lnPieceListSortedStart.push([lastPiece?.endTime || svtm, idx]);
        this.lnPieceListSortedEnd.push([endTime, idx]);
      })
    })
  }

  #compileVelOffsets() {
    this.velObjectList = [];
    let pvo = 0;
    this.velList.forEach(([time, scale], i) => {
      const [prevTime, prevScale] = this.velList[i - 1] ?? [0, 1];
      const newOffset = (pvo + (prevTime + ((time - prevTime) * prevScale))) - time;
      pvo = newOffset;
      this.velObjectList.push({
        time,
        scale,
        offset: newOffset
      });
    });
  }

  getCalculatedSVPosition(time) {
    const pSVIdx = ArrayUtils.getClosestStart(this.velObjectList, time, x => x.time);
    let svobj = this.velObjectList[pSVIdx];
    if (svobj == null) svobj = { scale: 1, offset: 0 };
    const newPos = svobj.offset + (svobj.time + ((time - svobj.time) * svobj.scale));
    return newPos;
  }

  getNoteAtTime(time) {
    const noteidx = ArrayUtils.getClosestStart(this.noteObjectList, time, x => x.time);
    return this.noteObjectList[noteidx];
  }

  getNoteAtTimeInLane(time, lane) {
    const noteidx = ArrayUtils.getClosestStart(this.noteTimeLaneList[lane], time, o => o[0]);
    if (noteidx == -1) return null;
    return this.noteObjectList[this.noteTimeLaneList[lane][noteidx][1]];
  }

  // TODO: refactor this function
  getVisibleNotes(time) {
    const noteidxidx = ArrayUtils.getClosestEnd(this.noteSVTimeList, time, o => o[0]);
    const noteidx = this.noteSVTimeList[noteidxidx][1]; // idgaf if it crashes
    const result = [];

    let i = noteidx;
    while (true) {
      const currentNote = this.noteObjectList[i];
      if (currentNote == null || currentNote.svtm >= time + this.noteSpeed) {
        break;
      } else {
        result.push(currentNote);
      }
      i++;
    }
    i = noteidx;
    while (true) {
      const currentNote = this.noteObjectList[i];
      if (currentNote == null || currentNote.svtm <= time - this.noteSpeed) {
        break;
      } else {
        result.unshift(currentNote);
      }
      i--;
    }
    return result;
  }

  getVisibleLNs(time) {
    const startSort = ArrayUtils.getClosestRange(
      time + this.noteSpeed,
      time - this.noteSpeed,
      this.lnPieceListSortedStart,
      x => x[0]
    );
    const endSort = ArrayUtils.getClosestRange(
      time + this.noteSpeed,
      time - this.noteSpeed,
      this.lnPieceListSortedEnd,
      x => x[0]
    );

    if (startSort == null) return this.lnPieceListSortedEnd.slice(endSort);
    if (endSort == null) return this.lnPieceListSortedStart.slice(startSort);

    const startSortIndices = this.lnPieceListSortedStart.slice(startSort);
    const endSortIndices = this.lnPieceListSortedEnd.slice(endSort);

    // just return a hunk of junk of stuff that is more efficient to deal with in rendering
    return startSortIndices.concat(endSortIndices);
  }
}