import { ArrayUtils } from "../utils/ArrayUtils";

export class JudgementManager {
  noteManager;
  judgementConfig = {};
  tjcw;

  constructor(noteManager, {
    judgements = [
      {
        id: "MARV",
        percent: 100,
        window: 18
      },
      {
        id: "PERF",
        percent: 98.25,
        window: 43
      },
      {
        id: "GREAT",
        percent: 65,
        window: 76
      },
      {
        id: "GOOD",
        percent: 25,
        window: 106
      },
      {
        id: "OKAY",
        percent: 12.5,
        window: 127
      },
      {
        id: "MISS",
        percent: -50,
        window: 164
      }
    ],
    comboBreakPercent = 0,
    comboCountPercent = 0
  }) {
    this.noteManager = noteManager;
    this.judgementConfig.judgements = judgements;
    this.judgementConfig.comboBreakPercent = comboBreakPercent;
    this.judgementConfig.comboCountPercent = comboCountPercent;
    this.tjcw = this.judgementConfig.judgements.at(-1).window;
  }

  testJudgementAtPos(time, lane, force) {
    const nni = ArrayUtils.getClosestEnd(this.noteManager.noteTimeLaneList[lane], time, o => o[0], -1);
    const pni = nni - 1; // turns out you usually DON'T have to do a second binary search
    let prevNote;
    let nextNote;

    // LINK - http://tom7.org/nand/
    if (pni < 0)
      prevNote = [-Infinity, 0]; // "fuck it, we ball" (will never get picked)
    else
      prevNote = this.noteManager.noteTimeLaneList[lane][pni];

    if (nni < 0)
      nextNote = [Infinity, 0]; // "fuck it, we ball" (will never get picked)
    else
      nextNote = this.noteManager.noteTimeLaneList[lane][nni];

    let closestNote;
    let closestNoteIdx;
    if (nextNote[0] - time <= this.tjcw) closestNote = nextNote[0], closestNoteIdx = nextNote[1];
    else if (Math.abs(prevNote[0] - time) <= this.tjcw) closestNote = prevNote[0], closestNoteIdx = prevNote[1];
    else if (force) closestNote = prevNote[0], closestNoteIdx = prevNote[1];
    else return;

    let newJudgement = {
      judgementIdx: -1,
      time,
      note: closestNoteIdx,
      error: closestNote - time
    };

    const ntji = ArrayUtils.getClosestEnd(this.judgementConfig.judgements, Math.abs(newJudgement.error), (arr => arr.window));

    if (ntji < 0)
      return null;

    newJudgement.judgementIdx = ntji;

    return newJudgement;
  }
}