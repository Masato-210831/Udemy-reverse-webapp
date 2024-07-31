export const Disc = {
  Empty: 0,
  Dark: 1,
  Light: 2,
} as const; // as constにより、オブジェクトがreadonlyになる。

export type Disc = typeof Disc[keyof typeof Disc];

 export function toDisc(value: number): Disc {
  return value as Disc
 }
