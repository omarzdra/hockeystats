declare module 'px' {
  export type PxEntry = Record<string, string> & { num: string };

  export default class Px {
    metadata: Record<string, Record<string, string | string[]>>;
    data: string[];
    constructor(source: string);
    title(): string;
    keyword(name: string): string | Record<string, string[]>;
    keywords(): string[];
    variables(): string[];
    values(variable: string | number): string[];
    valCounts(): number[];
    entries(): PxEntry[];
  }
}
