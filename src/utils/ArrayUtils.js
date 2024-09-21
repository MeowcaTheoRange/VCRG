export class ArrayUtils {
  static getClosestStart(arr, target, func = _ => _, error = 0) {
    let floor = 0;
    let ceil = arr.length - 1;
    let closest = error;

    while (floor <= ceil) {
      const searchPoint = Math.floor((floor + ceil) / 2);
      const num = func(arr[searchPoint]);

      if (num <= target) {
        closest = searchPoint;
        floor = searchPoint + 1;
      } else {
        ceil = searchPoint - 1;
      }
    }

    return closest;
  }
  static getClosestEnd(arr, target, func = _ => _, error = 0) {
    let floor = 0;
    let ceil = arr.length - 1;
    let closest = error;

    while (floor <= ceil) {
      const searchPoint = Math.floor((floor + ceil) / 2);
      const num = func(arr[searchPoint]);

      if (num <= target) {
        floor = searchPoint + 1;
      } else {
        closest = searchPoint;
        ceil = searchPoint - 1;
      }
    }

    return closest;
  }

  static getClosestRange(top, bottom, array, func = _ => _) {
    const searchtop = ArrayUtils.getClosestStart(array, top, func, -1);
    const searchbottom = ArrayUtils.getClosestEnd(array, bottom, func, -1);

    if (searchtop < 0 && searchbottom < 0) return null;

    return [searchtop, searchbottom];
  }

  static getClosestRangeLazy(top, bottom, array, func = _ => _) {
    const searchtop = ArrayUtils.getClosestEnd(array, top, func, -1);
    const searchbottom = ArrayUtils.getClosestStart(array, bottom, func, -1);

    if (searchtop < 0 && searchbottom < 0) return null;

    return [searchtop, searchbottom];
  }

  static calcAverage(arr = []) {
    return arr.reduce((pv, cv) => pv + cv) / arr.length;
  }
}