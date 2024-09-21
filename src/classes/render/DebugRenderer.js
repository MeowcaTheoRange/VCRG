import { ArrayUtils } from "../../utils/ArrayUtils";

export class DebugRenderer {
  #k;
  #timer;
  #notemanager;
  #judgementmanager;
  #statemanager;

  gameObj;
  width; height; genheight; hitHeight; noteSize;

  constructor({
    k,
    timer,
    notemanager,
    judgementmanager,
    statemanager
  }, { width, height, genHeight = height, hitHeight = 50, noteSize = 50 }, comps) {
    this.#k = k;
    this.#timer = timer;
    this.#notemanager = notemanager;
    this.#judgementmanager = judgementmanager;
    this.#statemanager = statemanager;

    this.gameObj = this.#k.make([
      this.#k.rect(width, height),
      this.#k.outline(2, this.#k.WHITE),
      this.#k.color(this.#k.BLACK),
      ...comps
    ]);
    this.width = width;
    this.height = height;
    this.genHeight = genHeight;
    this.hitHeight = hitHeight;
    this.noteSize = noteSize;

    this.gameObj.onDraw(() => {
      const currentTime = this.#timer.currentTime;
      const timeOffset = this.#notemanager.getCalculatedSVPosition(currentTime);
      const currentVisible = this.#notemanager.getVisibleNotes(timeOffset);
      const currentLNsVisible = this.#notemanager.getVisibleLNs(timeOffset);

      this.#k.drawRect({
        pos: this.#k.vec2(0, this.hitHeight),
        width: this.width,
        height: 2,
        color: this.#k.RED
      });

      currentVisible.forEach((note) => {
        const timePos = (note.svtm - timeOffset) / this.#notemanager.noteSpeed;
        const actualPos = (timePos * (this.genHeight - this.hitHeight)) + this.hitHeight;

        const laneWidth = this.width / this.#notemanager.lanes;
        const curX = (laneWidth * note.lane) + ((laneWidth - this.noteSize) / 2);
        this.#k.drawRect({
          pos: this.#k.vec2(curX, actualPos),
          width: this.noteSize,
          height: this.noteSize,
          color: this.#k.BLUE,
          z: 2
        });
        this.#k.drawText({
          pos: this.#k.vec2(curX, actualPos),
          text: note.id + "\n" + timePos.toFixed(2),
          width: this.noteSize,
          align: "center",
          size: 16,
          z: 2
        });
      });

      console.log(currentLNsVisible.length);

      // dogshit optimization variable (see NoteManager -> getVisibleLNs)
      let lnIDXNeverReleasedCompilation = {};
      currentLNsVisible.forEach(([_, idx]) => {
        // this is its only purpose
        if (lnIDXNeverReleasedCompilation[idx] != null) return;
        else lnIDXNeverReleasedCompilation[idx] = true;

        const ln = this.#notemanager.lnPieceList[idx];

        const startTimePos = (ln.startTime - timeOffset) / this.#notemanager.noteSpeed;
        const startActualPos = (startTimePos * (this.genHeight - this.hitHeight)) + this.hitHeight;
        const endTimePos = (ln.endTime - timeOffset) / this.#notemanager.noteSpeed;
        const endActualPos = (endTimePos * (this.genHeight - this.hitHeight)) + this.hitHeight;

        const laneWidth = this.width / this.#notemanager.lanes;
        const curX = (laneWidth * ln.lane) + ((laneWidth - this.noteSize) / 2);

        this.#k.drawRect({
          pos: this.#k.vec2(curX, Math.min(startActualPos, endActualPos)),
          width: this.noteSize,
          height: Math.abs(endActualPos - startActualPos),
          color: this.#k.WHITE,
          z: ln.pcid < 1 ? 1 : 3
        });
        this.#k.drawText({
          pos: this.#k.vec2(curX, Math.min(startActualPos, endActualPos)),
          text: ln.id + "\n" + Math.min(startActualPos, endActualPos).toFixed(2),
          width: this.noteSize,
          align: "center",
          size: 16,
          color: this.#k.BLACK,
          z: ln.pcid < 1 ? 1 : 3
        });
      });

      for (let lane = 0; lane < this.#notemanager.lanes; lane++) {
        const testedJudgement = this.#judgementmanager.testJudgementAtPos(currentTime, lane);

        const laneWidth = this.width / this.#notemanager.lanes;
        const curX = (laneWidth * lane) + ((laneWidth - this.noteSize) / 2);

        if (testedJudgement != null) {
          const judgement = this.#statemanager.getNoteJudgement(testedJudgement.note);
          if (judgement != null) continue;

          const jgtime = (testedJudgement.time + testedJudgement.error);
          const theNote = this.#notemanager.getNoteAtTimeInLane(jgtime, lane);
          if (theNote == null) continue;
          const timePos = (theNote.svtm - timeOffset) / this.#notemanager.noteSpeed;
          const actualPos = (timePos * (this.genHeight - this.hitHeight)) + this.hitHeight;
          const timePosJg = ((testedJudgement.time + testedJudgement.error) - timeOffset) / this.#notemanager.noteSpeed;
          const actualPosJg = (timePosJg * (this.genHeight - this.hitHeight)) + this.hitHeight;

          this.#k.drawRect({
            height: Math.abs(actualPos - this.hitHeight),
            pos: this.#k.vec2(curX + this.noteSize / 2, Math.min(this.hitHeight, actualPos)),
            width: this.noteSize / 4,
            color: this.#k.MAGENTA,
            opacity: (testedJudgement.judgementIdx / (this.#judgementmanager.judgementConfig.judgements.length - 1))
          });
          this.#k.drawRect({
            height: Math.abs(actualPosJg - this.hitHeight),
            pos: this.#k.vec2(curX + this.noteSize / 4, Math.min(this.hitHeight, actualPosJg)),
            width: this.noteSize / 4,
            color: this.#k.YELLOW,
            opacity: (testedJudgement.judgementIdx / (this.#judgementmanager.judgementConfig.judgements.length - 1))
          });
          this.#k.drawText({
            pos: this.#k.vec2(laneWidth * lane, (actualPos - this.hitHeight) / 2 + (this.hitHeight - 8)),
            text: (testedJudgement.judgementIdx / (this.#judgementmanager.judgementConfig.judgements.length - 1)).toFixed(2),
            width: laneWidth,
            align: "center",
            size: 16
          });
        }
      }

      // this.#statemanager.judgementList.forEach((jdg) => {
      //   const jdg_timeOffset = this.#notemanager.getCalculatedSVPosition(jdg.time);

      //   const timePos = (jdg_timeOffset - timeOffset) / this.#notemanager.noteSpeed;
      //   if (timePos < -1) return;

      //   const actualPos = (timePos * (this.genHeight - this.hitHeight)) + this.hitHeight;

      //   const laneWidth = this.width / this.#notemanager.lanes;
      //   const curX = (laneWidth * jdg.lane);

      //   this.#k.drawRect({
      //     height: 2,
      //     pos: this.#k.vec2(curX, actualPos),
      //     width: laneWidth,
      //     color: this.#k.RED,
      //   });
      //   this.#k.drawText({
      //     pos: this.#k.vec2(curX, actualPos - 8),
      //     text: (jdg.judgementIdx / (this.#judgementmanager.judgementConfig.judgements.length - 1)).toFixed(2),
      //     width: laneWidth,
      //     align: "center",
      //     size: 16
      //   });
      // });

      const lastJudgement = this.#statemanager.judgementList.at(-1);

      this.#k.drawText({
        pos: this.#k.vec2(0, this.height / 2 - 24),
        text: (lastJudgement?.currentCombo ?? 0),
        width: this.width,
        align: "center",
        size: 16
      });

      this.#k.drawText({
        pos: this.#k.vec2(0, this.height / 2 - 8),
        text: (this.#judgementmanager.judgementConfig.judgements[
          lastJudgement?.judgementIdx ?? 0
        ].id ?? "NULL") + " " + ((lastJudgement?.error ?? 0)).toFixed(2) + "ms",
        width: this.width,
        align: "center",
        size: 16
      });

      this.#k.drawText({
        pos: this.#k.vec2(0, this.height / 2 + 8),
        text: this.#statemanager.judgementAverage.toFixed(2) + "% " +
          this.#statemanager.errorAverage.toFixed(2) + "ms",
        width: this.width,
        align: "center",
        size: 16
      });
    });
  }
}