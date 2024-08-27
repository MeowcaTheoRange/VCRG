export class ArrayUtils {
  static getClosestStart(arr, target) {
    let floor = 0;
    let ceil = arr.length - 1;
    let closest = -1;

    while (floor <= ceil) {
      const searchPoint = Math.floor((floor + ceil) / 2);
      const num = arr[searchPoint];

      if (num <= target) {
        closest = searchPoint;
        floor = searchPoint + 1;
      } else {
        ceil = searchPoint - 1;
      }
    }

    return closest;
  }
  static getClosestEnd(arr, target) {
    let floor = 0;
    let ceil = arr.length - 1;
    let closest = -1;

    while (floor <= ceil) {
      const searchPoint = Math.ceil((floor + ceil) / 2);
      const num = arr[searchPoint];

      if (num <= target) {
        closest = searchPoint;
        floor = searchPoint + 1;
      } else {
        ceil = searchPoint - 1;
      }
    }

    return closest;
  }
}