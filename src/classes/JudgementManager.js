import { ArrayUtils } from "../utils/ArrayUtils";

export class JudgementManager {
  judgementList = [];
  judgementAverage = 0;

  noteManager;

  judgementConfig = {};

  #tjcw;


  constructor(noteManager, {
    judgements = [
      {
        percent: 100,
        window: 18
      },
      {
        percent: 98.25,
        window: 43
      },
      {
        percent: 65,
        window: 76
      },
      {
        percent: 25,
        window: 106
      },
      {
        percent: -100,
        window: 127
      },
      {
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

    // search for last judgement
    const judgementTimdex = ArrayUtils.getClosestStart(this.judgementList, time, (arr => arr.time));
    let lastJudgement;

    if (judgementTimdex < 0)
      // hallucinate a judgement
      lastJudgement = {
        time: 0,
        currentCombo: 0
      };
    else
      lastJudgement = this.judgementList[judgementTimdex];

    if (judgementTest == null)
      return; // don't create judgement
    else
      noteTimeJudgementIndex = this.judgementConfig.judgements[judgementTest.judgementIdx];

    if (noteTimeJudgementIndex.percent <= this.judgementConfig.comboBreakPercent)
      judgementTest.currentCombo = 0;
    else if (noteTimeJudgementIndex.percent >= this.judgementConfig.comboCountPercent)
      judgementTest.currentCombo = lastJudgement.currentCombo + 1;

    this.judgementList.splice(judgementTimdex + 1, 0, newJudgement);
  }
}