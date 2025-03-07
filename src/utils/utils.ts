/**
 * Splits an array into segments of a specified length.
 * @param array The array to split.
 * @param segmentLength The length of each segment.
 * @returns An array of segments.
 */

export function splitArray<T>(array: T[], segmentLength: number): T[][] {
    if (segmentLength <= 0) {
      throw new Error('Segment length must be greater than 0.');
    }
  
    const result: T[][] = [];
    for (let i = 0; i < array.length; i += segmentLength) {
      result.push(array.slice(i, i + segmentLength));
    }
  
    return result;
  }