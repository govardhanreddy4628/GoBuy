import { distance } from "fastest-levenshtein";

export function getClosestMatch(query: string, words: string[]) {
    if (!query || !words.length) return null;

  let bestMatch: string | null = null;
  let minDistance = Infinity;

  for (const word of words) {

    const dist = distance(query.toLowerCase(), word.toLowerCase());

    if (dist < minDistance) {
      minDistance = dist;
      bestMatch = word;
    }

    if (dist === 0) break;
  }

  return minDistance <= 2 ? bestMatch : null;
}