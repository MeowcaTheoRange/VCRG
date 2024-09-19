import kaplay from "kaplay";
import "kaplay/global";
import { MapHandler } from "./assets/MapHandler";
import { AssetHandler } from "./assets/AssetHandler";
import { AudioTimer } from "./classes/AudioTimer";
import { NoteManager } from "./classes/NoteManager";
import { JudgementManager } from "./classes/JudgementManager";
import { DebugRenderer } from "./classes/render/DebugRenderer";
import { StateManager } from "./classes/StateManager";

const k = kaplay({
  logMax: 1,
  maxFPS: 240,
  background: "#000000"
})

String.prototype.replaceAt = function (index, replacement) {
  return this.substring(0, index) + replacement + this.substring(index + replacement.length);
}

async function doGetAndCompile() {
  const pow = await MapHandler.getMapDiff("weeble", "maps/4k.yml");
  k.loadMusic("pow", AssetHandler.buildURL("maps/weeble/audio.mp3"));

  const music = k.play("pow");
  const timer = new AudioTimer(music, k, {
    startOffset: 1000,
    gameOffset: 0
  });
  const notemanager = new NoteManager(pow.NoteMap, pow.VeloMap, {
    noteSpeed: 500,
    lanes: pow.Lanes
  });
  const judgementmanager = new JudgementManager(notemanager, {});
  const statemanager = new StateManager({
    timer, judgementmanager, notemanager
  });

  ["s", "d", "l", ";"].forEach((key, i) => k.onKeyPress(key, () => {
    statemanager.createJudgementAtPos(timer.currentTime, i);
  }));

  // TODO: implement untapping (miss when not hitting note)

  timer.start();

  const renderer = new DebugRenderer({
    k, timer, notemanager, judgementmanager, statemanager
  }, {
    width: 300,
    height: 500,
    genHeight: 500,
    hitHeight: 50
  }, [
    k.pos(50, 50)
  ]
  );

  k.onUpdate(() => {
    statemanager.stateUpdate();
  });

  k.add(renderer.gameObj);
}

k.onKeyPress("y", () => {
  doGetAndCompile();
})