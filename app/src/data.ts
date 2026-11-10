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
  ...import.meta.glob('../../assets/illustrationen/{k1_s1,k1_s2_vorher,k1_s2_nachher,k1_s3,k1_s4_vorher,k1_s4_nachher,k1_s5,k1_s5_karten,k1_s6_vorher,k1_s6_nachher,k2_s7,k2_s8,k2_s9,k2_s10,k2_s11,k2_s11_spiel,k2_s12,k3_s13,k3_s14,k3_s15,k3_s16_vorher,k3_s16_nachher,k3_s17,k3_s18,kapitel_2,kapitel_3,kapitel_4,cover,mondtresor_zu,mondtresor_auf,vorgeschichte,kapitel_1,spiel_theater_leer,spiel_fensterbank_leer,spurenwand_board}.webp', { eager: true, query: '?url', import: 'default' }),
  ...import.meta.glob('../../assets/illustrationen/{raupe,mila,ben,oskar,k1_s5_karten}/*.webp', { eager: true, query: '?url', import: 'default' }),
  // Gegenstände: freigestellte Kopien (scripts/freistellen.py), Originale bleiben in assets/
  ...Object.fromEntries(Object.entries(import.meta.glob('./gen/garderobe/*.webp', { eager: true, query: '?url', import: 'default' })).map(([k, v]) => [k.replace('./gen/', '../../assets/illustrationen/'), v])),
  ...Object.fromEntries(Object.entries(import.meta.glob('./gen/frei/*.webp', { eager: true, query: '?url', import: 'default' })).map(([k, v]) => [k.replace('./gen/', '../../assets/illustrationen/'), v])),
  ...Object.fromEntries(Object.entries(import.meta.glob('./gen/objekte/*.webp', { eager: true, query: '?url', import: 'default' })).map(([k, v]) => [k.replace('./gen/', '../../assets/illustrationen/'), v])),
} as Record<string, string>;

/** Bild per Kurzname: "objekte/schere", "raupe/lob", "k1_s1" */
export function img(name: string): string {
  const u = IMGS[`../../assets/illustrationen/${name}.webp`];
  if (!u) console.warn('Bild fehlt:', name);
  return u ?? '';
}
