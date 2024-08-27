import kaplay from "kaplay";
import "kaplay/global";
import { MapHandler } from "./assets/MapHandler";
import { AssetHandler } from "./assets/AssetHandler";
import { ArrayUtils } from "./utils/ArrayUtils";
import { AudioTimer } from "./classes/AudioTimer";
import { NoteManager } from "./classes/NoteManager";

const k = kaplay({
  logMax: 1
})

async function doGetAndCompile() {
  const pow = await MapHandler.getMapDiff("test", "test.yml");
  console.log(pow);
  k.loadMusic("pow", AssetHandler.buildURL("maps/test/audio.mp3"));

  const music = k.play("pow");
  const timer = new AudioTimer(music, k);
  const notemanager = new NoteManager(pow.NoteMap, pow.VeloMap, {
    noteSpeed: 500
  });
  timer.start();
  let whereIsZeroInPx = 100;
  let whereIsGeneInPx = k.height();
  let noteSpeed = 500;

  k.onDraw(() => {
    const currentTime = timer.currentTime;
    const timeOffset = notemanager.getPlayheadSVPosition(currentTime);
    const currentVisible = notemanager.getVisibleNotes(timeOffset);

    k.drawRect({
      pos: k.vec2(0, whereIsZeroInPx),
      width: 500,
      height: 2,
      color: k.RED
    });
    currentVisible.forEach((note) => {
      const timePos = (note.svtm - timeOffset) / noteSpeed;
      const actualPos = (timePos * (whereIsGeneInPx - whereIsZeroInPx)) + whereIsZeroInPx;
      k.drawRect({
        pos: k.vec2((note.lane * 100) + 100, actualPos),
        width: 50,
        height: 50,
        color: k.WHITE
      });
    })
  })
}

k.onKeyPress("y", () => {
  doGetAndCompile();
})