import kaplay from "kaplay";
import "kaplay/global";
import { MapHandler } from "./assets/MapHandler";
import { AssetHandler } from "./assets/AssetHandler";
import { ArrayUtils } from "./utils/ArrayUtils";
import { AudioTimer } from "./classes/AudioTimer";
import { NoteManager } from "./classes/NoteManager";
import { JudgementManager } from "./classes/JudgementManager";
import { DebugRenderer } from "./classes/render/DebugRenderer";

const k = kaplay({
  logMax: 1,
  maxFPS: 240,
  background: "#000000"
})

String.prototype.replaceAt = function (index, replacement) {
  return this.substring(0, index) + replacement + this.substring(index + replacement.length);
}

async function doGetAndCompile() {
  const pow = await MapHandler.getMapDiff("princess_of_winter", "maps/insane.yml");
  k.loadMusic("pow", AssetHandler.buildURL("maps/princess_of_winter/audio.mp3"));

  const music = k.play("pow");
  const timer = new AudioTimer(music, k);
  const notemanager = new NoteManager(pow.NoteMap, pow.VeloMap, {
    noteSpeed: 500,
    lanes: pow.Lanes
  });
  const judgementmanager = new JudgementManager(notemanager, {});

  timer.start();

  const renderer = new DebugRenderer({
    k, timer, notemanager, judgementmanager
  }, {
    width: 300,
    height: 500,
    hitHeight: 50
  }, [
    k.pos(50, 50)
  ]
  );

  k.add(renderer.gameObj);
}

k.onKeyPress("y", () => {
  doGetAndCompile();
})