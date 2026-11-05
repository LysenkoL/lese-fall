import K1 from '../../04_data/kapitel1.json';

export const DATA: any = K1;
export type Block = { id: string; typ: 'p' | 'th'; s: string[] };
export type Teil = { key: string; spur: number; titel: string; blocks: Block[]; spiel?: any };

/** 0 = Vorgeschichte, 1–6 = Spuren */
export function teil(n: number): Teil {
  if (n === 0) return { key: 'v', spur: 0, titel: DATA.vorgeschichte.titel, blocks: DATA.vorgeschichte.blocks };
  const s = DATA.spuren[n - 1];
  return { key: `s${n}`, spur: n, titel: s.titel, blocks: s.blocks, spiel: s.spiel };
}

const IMGS = {
  ...import.meta.glob('../../assets/illustrationen/{k1_s1,k1_s2_vorher,k1_s2_nachher,k1_s3,k1_s4_vorher,k1_s4_nachher,k1_s5,k1_s5_karten,k1_s6_vorher,k1_s6_nachher,k2_s7,cover,mondtresor_zu}.webp', { eager: true, query: '?url', import: 'default' }),
  ...import.meta.glob('../../assets/illustrationen/{objekte,raupe,mila,ben,oskar,k1_s5_karten}/*.webp', { eager: true, query: '?url', import: 'default' }),
} as Record<string, string>;

/** Bild per Kurzname: "objekte/schere", "raupe/lob", "k1_s1" */
export function img(name: string): string {
  const u = IMGS[`../../assets/illustrationen/${name}.webp`];
  if (!u) console.warn('Bild fehlt:', name);
  return u ?? '';
}
