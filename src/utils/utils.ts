import Settings from "../Settings.json";


/**
 * Splits an array into segments of a specified length.
 * @param array The array to split.
 * @param segmentLength The length of each segment.
 * @returns An array of segments.
 */

import { CompositeScore, GameScore } from "../types.js";

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

  export function formatCompositeScore<T extends GameScore>(scores: T[], separator: ',' | '-' = ','): CompositeScore<T> {
    return scores.join(separator);
  }
  
  export function indexToLetter(index: number): string {
    const letters = ['A', 'B', 'C', 'D',];
    // Return the letter at the given index, or an empty string if out of bounds
    return index >= 0 && index < letters.length ? letters[index] : '';
  }

  export function ScoreToLetter(index: number): string {
    if (index == 0) return 'N'
    if (index == 0.5) return 'H'
    if (index == 1) return 'F'
    return ''
  }

  export function abbreviateNumber(value: number): string {
    if (value < 1000) {
      return value.toString();
    }
  
    const suffixes = ['k', 'M', 'B', 'T']; // Thousands, Millions, Billions, Trillions
    const tier = (Math.log10(value) / 3) | 0; // Determine the tier (0 for 'k', 1 for 'M', etc.)
  
    if (tier === 0) return value.toString(); // No abbreviation needed
  
    const suffix = suffixes[tier - 1];
    const scale = Math.pow(10, tier * 3);
    const scaledValue = value / scale;
  
    // Use toFixed(1) to keep one decimal place and ensure proper rounding
    return scaledValue.toFixed(1) + suffix;
  }
  

  export function calculateScore(sep: string[]) {
    const correctString = Settings.answers
    const correct = sep.filter((v, i) => v === correctString[i]).length
    return correct


  }