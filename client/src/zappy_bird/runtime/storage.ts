function getItem(key: string): string {
  return localStorage.getItem(key) ?? '';
}

function setItem(key: string, value: string): void {
  localStorage.setItem(key, value);
}

function getHighScore(currentScore: number): number {
  const saved = getItem('highscore');
  if (!saved) {
    setItem('highscore', String(currentScore));
    return currentScore;
  }
  let hs = parseInt(saved, 10) || 0;
  if (hs < currentScore) {
    hs = currentScore;
    setItem('highscore', String(hs));
  }
  return hs;
}

export const Storage = { getItem, setItem, getHighScore };
