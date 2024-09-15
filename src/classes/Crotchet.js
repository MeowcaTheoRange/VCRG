// TODO: what even is the point of this class
export class Crotchet {
  static spm = 60;
  static msps = 1000;

  static getCrotchet(bpm) {
    return ((spm / bpm) * msps);
  }

  static timeToBeat(time, bpm) {
    return time / this.getCrotchet(bpm);
  }
  static beatToTime(beat, bpm) {
    return beat * this.getCrotchet(bpm);
  }
}