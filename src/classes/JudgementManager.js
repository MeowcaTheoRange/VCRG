import { ArrayUtils } from "../utils/ArrayUtils";

export class JudgementManager {
  judgementList = [];
  judgementAverage = 0;
  errorAverage = 0;

  noteManager;

  judgementConfig = {};

  #tjcw;


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
    this.#tjcw = this.judgementConfig.judgements.at(-1).window;
  }

  testJudgementAtPos(time, lane) {
    const nni = ArrayUtils.getClosestEnd(this.noteManager.noteTimeLaneList[lane], time, o => o[0]);
    const pni = nni - 1; // turns out you usually DON'T have to do a second binary search
    let prevNote;
    let nextNote;

    // LINK - http://tom7.org/nand/
    if (pni < 0)
      prevNote = -Infinity; // "fuck it, we ball" (will never get picked)
    else
      prevNote = this.noteManager.noteTimeLaneList[lane][pni][0];

    if (nni < 0)
      nextNote = Infinity; // "fuck it, we ball" (will never get picked)
    else
      nextNote = this.noteManager.noteTimeLaneList[lane][nni][0];

    let closestNote = nextNote - time <= this.#tjcw ? nextNote :
      Math.abs(prevNote - time) <= this.#tjcw ? prevNote : null;
    if (closestNote == null) return;

    let newJudgement = {
      judgementIdx: -1,
      time,
      lane,
      note: closestNote
    };

    const ntji = ArrayUtils.getClosestEnd(this.judgementConfig.judgements, Math.abs(closestNote - time), (arr => arr.window));

    if (ntji < 0)
      return null;

    newJudgement.judgementIdx = ntji;

    return newJudgement;
  }

  createJudgementAtPos(time, lane) {
    const judgementTest = this.testJudgementAtPos(time, lane);

    let noteTimeJudgementIndex;
    if (judgementTest == null)
      return; // don't create judgement
    else
      noteTimeJudgementIndex = this.judgementConfig.judgements[judgementTest.judgementIdx];

    // search for last judgement
    const judgementTimdex = ArrayUtils.getClosestStart(this.judgementList, time, (arr => arr.time));

    let lastJudgement = this.judgementList[judgementTimdex];
    if (lastJudgement == null)
      // hallucinate a judgement
      lastJudgement = {
        time: 0,
        currentCombo: 0
      };

    if (noteTimeJudgementIndex.percent <= this.judgementConfig.comboBreakPercent)
      judgementTest.currentCombo = 0;
    else if (noteTimeJudgementIndex.percent >= this.judgementConfig.comboCountPercent)
      judgementTest.currentCombo = lastJudgement.currentCombo + 1;

    this.judgementList.splice(judgementTimdex + 1, 0, judgementTest);

    this.judgementAverage =
      (this.judgementAverage * (this.judgementList.length - 1) +
        this.judgementConfig.judgements[judgementTest.judgementIdx].percent) /
      this.judgementList.length;
    this.errorAverage =
      (this.errorAverage * (this.judgementList.length - 1) +
        judgementTest.time - judgementTest.note) /
      this.judgementList.length;
  }
}