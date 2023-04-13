/**
 * Performs a binary search on a sorted array to find the element closest to the target value.
 *
 * @param {Array<number>} arr - The sorted array to search in.
 * @param {number} target - The target value to search for.
 * @param {number} [lo=0] - The lower bound index to start the search from (inclusive).
 * @param {number} [hi=arr.length - 1] - The upper bound index to end the search at (inclusive).
 * @returns {number} - The element in the array that is closest to the target value.
 */
export function binarySearch(arr, target, lo = 0, hi = arr.length - 1) {
  if (target < arr[lo]) {
    return arr[0];
  }
  if (target > arr[hi]) {
    return arr[hi];
  }
  while (hi - lo > 1) {
    const mid = Math.floor((hi + lo) / 2);
    if (arr[mid] === target) {
      return arr[mid];
    }
    if (arr[mid] < target) {
      lo = mid;
    } else {
      hi = mid;
    }
  }

  const closest_value = target - arr[lo] < arr[hi] - target ? arr[lo] : arr[hi];
  return closest_value;
}

/**
 * Calculates the CRC32 (Circular Redundancy Check) of the input string `str`.
 *
 * @param {string} str - The input string to calculate the checksum.
 *
 * @returns {number} The 32-bit unsigned CRC32 checksum of the input string, uniformly distributed -> `crc32(key) % 360` to determine position in the ring.
 */
export function crc32(str) {
  for (var a, o = [], c = 0; c < 256; c++) {
    a = c;
    for (var f = 0; f < 8; f++) a = 1 & a ? 3988292384 ^ (a >>> 1) : a >>> 1;
    o[c] = a;
  }
  for (var n = -1, t = 0; t < str.length; t++)
    n = (n >>> 8) ^ o[255 & (n ^ str.charCodeAt(t))];
  return (-1 ^ n) >>> 0;
}
