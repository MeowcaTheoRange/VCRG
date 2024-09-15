import kaplay from "kaplay";
import "kaplay/global";
import { MapHandler } from "./assets/MapHandler";
import { AssetHandler } from "./assets/AssetHandler";
import { ArrayUtils } from "./utils/ArrayUtils";
import { AudioTimer } from "./classes/AudioTimer";
import { NoteManager } from "./classes/NoteManager";
import { JudgementManager } from "./classes/JudgementManager";

const k = kaplay({
  logMax: 1,
  maxFPS: 240,
  background: "#000000"
})

String.prototype.replaceAt = function (index, replacement) {
  return this.substring(0, index) + replacement + this.substring(index + replacement.length);
}

async function doGetAndCompile() {
  const pow = await MapHandler.getMapDiff("apparently_very_complex", "maps/elegy.yml");
  k.loadMusic("pow", AssetHandler.buildURL("maps/apparently_very_complex/audio.mp3"));

  const music = k.play("pow");
  const timer = new AudioTimer(music, k);
  const notemanager = new NoteManager(pow.NoteMap, pow.VeloMap, {
    noteSpeed: 500,
    lanes: pow.Lanes
  });
  const judgementmanager = new JudgementManager(notemanager, {});

  timer.start();

  let whereIsZeroInPx = 100;
  let whereIsGeneInPx = k.height();

  k.onUpdate(() => {
    whereIsZeroInPx = 100;
    whereIsGeneInPx = k.height();

    // music.paused = !k.isKeyDown("space");
  })

  k.onDraw(() => {
    const currentTime = timer.currentTime;
    const timeOffset = notemanager.getPlayheadSVPosition(currentTime);
    // const timeOffset = currentTime;
    const currentVisible = notemanager.getVisibleNotes(timeOffset);
    // const currentVisible = notemanager.getVisibleNotesNSV(timeOffset);

    k.drawRect({
      pos: k.vec2(0, whereIsZeroInPx),
      width: 500,
      height: 2,
      color: k.RED
    });
    k.drawText({
      pos: k.vec2(500, whereIsZeroInPx),
      text: timeOffset.toFixed(2),
      size: 16
    });
    // console.log(currentVisible.length);
    // Don't render anything more than 500 objects
    currentVisible.splice(0, 500).forEach((note) => {
      const timePos = (note.svtm - timeOffset) / notemanager.noteSpeed;
      const actualPos = (timePos * (whereIsGeneInPx - whereIsZeroInPx)) + whereIsZeroInPx;

      k.drawRect({
        pos: k.vec2((note.lane * 100) + 100, actualPos),
        width: 50,
        height: 50,
        color: k.BLUE
      });
      k.drawText({
        pos: k.vec2((note.lane * 100) + 100, actualPos),
        text: (note.svtm - timeOffset).toFixed(2),
        size: 16
      });
    });

    for (let lane = 0; lane < notemanager.lanes; lane++) {
      const testedJudgement = judgementmanager.testJudgementAtPos(currentTime, lane);

      if (testedJudgement != null) {
        const theNote = notemanager.getNoteAtTimeInLane(testedJudgement.note, lane);
        // console.log(theNote);
        if (theNote == null) return;
        // console.log("SVTIME LN", lane, (theNote.svtm - timeOffset), theNote.svtm, testedJudgement.note, theNote.svtm == testedJudgement.note);
        const timePos = (theNote.svtm - timeOffset) / notemanager.noteSpeed;
        const actualPos = (timePos * (whereIsGeneInPx - whereIsZeroInPx)) + whereIsZeroInPx;
        const timePosJg = (testedJudgement.note - timeOffset) / notemanager.noteSpeed;
        const actualPosJg = (timePosJg * (whereIsGeneInPx - whereIsZeroInPx)) + whereIsZeroInPx;

        k.drawRect({
          height: Math.abs(actualPos - whereIsZeroInPx),
          pos: k.vec2((lane * 100) + 125, Math.min(whereIsZeroInPx, actualPos)),
          width: 12.5,
          color: k.MAGENTA,
          opacity: (testedJudgement.judgementIdx / (judgementmanager.judgementConfig.judgements.length - 1))
        });
        k.drawRect({
          height: Math.abs(actualPosJg - whereIsZeroInPx),
          pos: k.vec2((lane * 100) + 112.5, Math.min(whereIsZeroInPx, actualPosJg)),
          width: 12.5,
          color: k.YELLOW,
          opacity: (testedJudgement.judgementIdx / (judgementmanager.judgementConfig.judgements.length - 1))
        });
        k.drawText({
          pos: k.vec2((lane * 100) + 100, (actualPos - whereIsZeroInPx) / 2 + (whereIsZeroInPx - 8)),
          text: (testedJudgement.judgementIdx / (judgementmanager.judgementConfig.judgements.length - 1)).toFixed(2),
          size: 16
        });
      }

    }
  });
}

k.onKeyPress("y", () => {
  doGetAndCompile();
})