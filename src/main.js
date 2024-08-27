import kaplay from "kaplay";
import "kaplay/global";
import { MapHandler } from "./assets/MapHandler";
import { AssetHandler } from "./assets/AssetHandler";
import { ArrayUtils } from "./utils/ArrayUtils";

const k = kaplay()

async function doGetAndCompile() {
  const pow = await MapHandler.getMapDiff("princess_of_winter", "maps/insane.yml");
  k.loadMusic("pow", AssetHandler.buildURL("maps/princess_of_winter/audio.mp3"));

  const music = k.play("pow");
  const notes = [];
  const notePoses = [];

  pow.NoteMap.forEach((note) => {
    notes.push(note);
    notePoses.push(note.Time);
  });
  const whereIsZeroInPx = 100;
  const whereIsGeneInPx = k.height();
  const noteSpeed = 500;

  let noteNeighbours = [];
  let currentTime;

  k.onUpdate(() => {
    noteNeighbours = [];
    currentTime = music.time() * 1000;
    const NoteIdx = ArrayUtils.getClosestEnd(notePoses, currentTime);

    let i = NoteIdx;
    stopIterating = false;
    while (!stopIterating) {
      const currentNote = notes[i];
      if (currentNote == null || currentNote.Time > currentTime + noteSpeed) {
        stopIterating = true;
      } else {
        noteNeighbours.push(currentNote);
      }
      i++;
    }
  });

  k.onDraw(() => {
    noteNeighbours.forEach((note) => {
      const timePos = (note.Time - currentTime) / noteSpeed;
      const actualPos = (timePos * (k.height() - whereIsZeroInPx)) + whereIsZeroInPx;
      k.drawRect({
        pos: k.vec2((note.Lane * 100) + 100, actualPos),
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