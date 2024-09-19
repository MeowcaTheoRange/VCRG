import { ArrayUtils } from "../utils/ArrayUtils";

export class StateManager {
  timer;
  judgementmanager;
  notemanager;

  judgementList = [];
  noteJudgements = [];
  judgementLaneList = [];
  judgementAverage = 0;
  errorAverage = 0;

  constructor({ timer, judgementmanager, notemanager }) {
    this.timer = timer;
    this.judgementmanager = judgementmanager;
    this.notemanager = notemanager;

    for (let i = 0; i < this.notemanager.lanes; i++) {
      this.judgementLaneList.push([]);
    }
  }

  stateUpdate() {
    this.checkUntappingThreshold(this.timer.currentTime);
  }

  getNoteJudgement(note) {
    const judgementIndex = this.noteJudgements[note];

    if (judgementIndex == null)
      return null;

    const lastJudgement = this.judgementList[judgementIndex];

    return lastJudgement;
  }

  checkUntappingThreshold(time) {
    const pni = ArrayUtils.getClosestStart(this.notemanager.noteObjectList, time - this.judgementmanager.tjcw, o => o.time, -1);

    if (this.getNoteJudgement(pni)) return;

    let prevNote;
    if (pni < 0)
      return;
    else prevNote = this.notemanager.noteObjectList[pni];

    let newJudgement = {
      judgementIdx: -1,
      time,
      note: pni,
      error: -this.judgementmanager.tjcw
    };

    const judgementIndex = ArrayUtils.getClosestEnd(this.judgementmanager.judgementConfig.judgements, Math.abs(prevNote.time - time), arr => arr.window);

    let noteTimeJudgementIndex;
    if (judgementIndex != this.judgementmanager.judgementConfig.judgements.length - 1)
      return;
    else
      noteTimeJudgementIndex = this.judgementmanager.judgementConfig.judgements[judgementIndex];

    newJudgement.judgementIdx = judgementIndex;

    // search for last judgement
    const judgementTimdex = ArrayUtils.getClosestStart(this.judgementList, time, (arr => arr.time));

    let lastJudgement = this.judgementList[judgementTimdex];
    if (lastJudgement == null)
      // hallucinate a judgement
      lastJudgement = {
        time: 0,
        currentCombo: 0
      };

    if (noteTimeJudgementIndex.percent <= this.judgementmanager.judgementConfig.comboBreakPercent)
      newJudgement.currentCombo = 0;
    else if (noteTimeJudgementIndex.percent >= this.judgementmanager.judgementConfig.comboCountPercent)
      newJudgement.currentCombo = lastJudgement.currentCombo + 1;

    this.judgementList.splice(judgementTimdex + 1, 0, newJudgement);
    this.noteJudgements[newJudgement.note] = judgementTimdex + 1;

    this.judgementAverage =
      (this.judgementAverage * (this.judgementList.length - 1) +
        this.judgementmanager.judgementConfig.judgements[newJudgement.judgementIdx].percent) /
      this.judgementList.length;
  }

  createJudgementAtPos(time, lane, force) {
    const judgementTest = this.judgementmanager.testJudgementAtPos(time, lane, force);

    let prevNote;
    if (judgementTest == null)
      return;
    else prevNote = this.notemanager.noteObjectList[judgementTest.note];

    // if (this.getNoteJudgement(judgementTest.note)) return this.createJudgementAtPos(this.notemanager.noteObjectList[judgementTest.note + 1].time, lane, force);
    if (this.getNoteJudgement(judgementTest.note)) return;

    let noteTimeJudgementIndex = this.judgementmanager.judgementConfig.judgements[judgementTest.judgementIdx];

    // search for last judgement
    const judgementTimdex = ArrayUtils.getClosestStart(this.judgementList, time, (arr => arr.time));

    let lastJudgement = this.judgementList[judgementTimdex];
    if (lastJudgement == null)
      // hallucinate a judgement
      lastJudgement = {
        time: 0,
        currentCombo: 0
      };

    if (noteTimeJudgementIndex.percent <= this.judgementmanager.judgementConfig.comboBreakPercent)
      judgementTest.currentCombo = 0;
    else if (noteTimeJudgementIndex.percent >= this.judgementmanager.judgementConfig.comboCountPercent)
      judgementTest.currentCombo = lastJudgement.currentCombo + 1;

    this.judgementList.splice(judgementTimdex + 1, 0, judgementTest);
    this.noteJudgements[judgementTest.note] = judgementTimdex + 1;

    this.judgementAverage =
      (this.judgementAverage * (this.judgementList.length - 1) +
        this.judgementmanager.judgementConfig.judgements[judgementTest.judgementIdx].percent) /
      this.judgementList.length;
    this.errorAverage =
      (this.errorAverage * (this.judgementList.length - 1) +
        judgementTest.error) /
      this.judgementList.length;
  }
}