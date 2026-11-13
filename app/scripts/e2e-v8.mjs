/**
 * Durchlauf der Vorschau v8 (Kapitel 1 bis 4 und Finale mit Tresor und Urkunde, vom Titel bis zur Urkunde) mit Bildern in 03_screens/v8/<name>/.
 * Vorher: npm run build && npx vite preview --port 4173
 * Aufruf: node scripts/e2e-v8.mjs [breite höhe name]
 */
import { createRequire } from 'node:module';
import { mkdirSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const [W, H, NAME] = [+(process.argv[2] ?? 390), +(process.argv[3] ?? 844), process.argv[4] ?? 'telefon'];
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../../03_screens/v8', NAME);
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2, hasTouch: false });
p.setDefaultTimeout(10000);
const fehler = [];
p.on('pageerror', (e) => fehler.push('Seitenfehler: ' + String(e)));
p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') fehler.push('Konsole: ' + m.text()); });
let nr = 0;
const shot = async (name) => { await sleep(500); await p.screenshot({ path: `${OUT}/${String(++nr).padStart(2, '0')}_${name}.png` }); };
const klick = async (s) => { await p.click(s); await sleep(130); };
const ev = (f, a) => p.evaluate(f, a);
const messen = async (wo) => {
  await sleep(400);
  const m = await ev(() => {
    const A = document.getElementById('app').getBoundingClientRect();
    const breit = [...document.querySelectorAll('#app *')].filter((e) => {
      const r = e.getBoundingClientRect();
      return r.width > 0 && (r.right > A.right + 1 || r.left < A.left - 1) && !e.closest('.ausschn, .brush, .tv, .nt-bild') && !e.classList.contains('lampe');
    }).map((e) => e.className || e.tagName).slice(0, 3);
    const bl = document.querySelector('.blatt:not(.probe)'), br = document.querySelector('#buehne > .brett');
    return {
      breit, doc: document.documentElement.scrollWidth > innerWidth,
      rollt: bl ? bl.scrollHeight > bl.clientHeight + 2 : false,
      brettRollt: br ? br.scrollHeight > br.clientHeight + 2 : false,
      pipe: [...document.querySelectorAll('#app *')].filter((e) => !e.children.length && e.textContent.includes('|')).map((e) => e.textContent.slice(0, 30)).slice(0, 3),
      fussAb: (() => { const f = document.getElementById('fuss').getBoundingClientRect(); return f.bottom > innerHeight + 1; })(),
    };
  });
  if (m.breit.length) fehler.push(`${wo}: Elemente ragen seitlich hinaus: ${m.breit.join(', ')}`);
  if (m.pipe.length) fehler.push(`${wo}: sichtbares „|“ im Text: ${m.pipe.join(' / ')}`);
  if (m.doc) fehler.push(`${wo}: waagerechte Bildlaufleiste`);
  if (m.rollt) fehler.push(`${wo}: Leseblatt läuft über`);
  if (m.brettRollt) fehler.push(`${wo}: Brett läuft über`);
  if (m.fussAb) fehler.push(`${wo}: Fußzeile außerhalb`);
};
const S = async (name) => { await shot(name); await messen(name); };
const weiter = () => klick('#fuss [data-a="weiter"]');
const loese = async () => { await ev(() => window.__v8.loese()); await sleep(300); };

async function lesen(spur) {
  for (let k = 0; k < 14; k++) {
    await messen(`Spur ${spur} Blatt ${k + 1}`);
    if (k === 0 || spur === 1) await shot(`s${spur}_lesen_${k + 1}`);
    if (await p.$('#fuss [data-a="weiter"]')) break;
    await klick('#fuss [data-a="next"]');
  }
  await shot(`s${spur}_lesen_letztes`);
  await weiter();
}
const D = await (async () => { await p.goto('http://localhost:4173/v8.html'); await sleep(900); return ev(() => window.__v8.D); })();
const spurSchritt = (spur) => ev((n) => window.__v8.steps(n), spur);

async function raetsel(spur, z) {
  const n = `s${spur}_${z.art}`;
  await S(n + '_start');
  if (z.art === 'buchstaben') {
    const tipp = (c) => klick(`.bs-lose .bk:text-is("${c}")`);
    for (const [i, rd] of z.runden.entries()) {
      if (i === 0) { for (const c of rd.wort) { await tipp(c); if (c === 'O') await shot(`${n}_runde1_halb`); } }
      else if (i === 1) {
        for (const c of rd.buchstaben) await tipp(c);
        await sleep(300); await shot(`${n}_runde2_wackeln`); await sleep(600);
        await shot(`${n}_runde2_knopf`);
        await p.click('.bsk[data-a="gehtnicht"]', { force: true }); await sleep(250); // der Knopf pulsiert, deshalb ohne Warten auf Stillstand
      } else {
        if (i === 2) { // einmal echt ziehen
          const a = await (await p.$('.bs-lose .bk')).boundingBox(), t = await (await p.$('.feld[data-f="2"]')).boundingBox();
          const buchst = await (await p.$('.bs-lose .bk')).innerText();
          await p.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await p.mouse.down();
          await p.mouse.move(a.x + a.width / 2 + 10, a.y + a.height / 2 - 20, { steps: 3 });
          await p.mouse.move(t.x + t.width / 2, t.y + t.height / 2, { steps: 8 }); await shot(`${n}_ziehen`); await p.mouse.up(); await sleep(300);
          const drin = await p.$eval('.feld[data-f="2"]', (e) => e.textContent.trim());
          if (drin !== buchst) fehler.push(`Ziehen: Kärtchen ${buchst} liegt nicht im Feld (${drin})`);
        }
        await loese();
      }
      await sleep(900); await S(`${n}_runde${i + 1}`);
      if (i < z.runden.length - 1) await weiter();
    }
  } else if (z.art === 'unterschiede') {
    const r = await (await p.$('.ub-bild')).boundingBox();
    await p.mouse.click(r.x + r.width * 0.05, r.y + r.height * 0.9); await sleep(200); await shot(n + '_daneben');
    const d = z.dinge[1], bb = (await p.$$('.ub-bild'))[1];
    const r2 = await bb.boundingBox(), zz = d.zonen?.[0] ?? d;
    await p.mouse.click(r2.x + r2.width * zz.x / 100, r2.y + r2.height * zz.y / 100); await sleep(300); await S(n + '_ein_treffer');
    await loese(); await sleep(700);
    if (z.sortieren) { // Schritt 2: wer hat das gemacht?
      await S(n + '_sortieren');
      const x = z.sortieren.dinge[0], falsch = z.sortieren.ziele.find((q) => q.id !== x.ziel).id;
      await klick(`.so-pool [data-d="${x.id}"]`); await klick(`.so-ziel[data-z="${falsch}"]`); await sleep(300); await S(n + '_sortieren_falsch'); await sleep(500);
      await klick(`.so-pool [data-d="${x.id}"]`); await klick(`.so-ziel[data-z="${x.ziel}"]`); await sleep(300);
      await loese(); await sleep(500);
    }
  } else if (z.art === 'versteckt') {
    const box = await (await p.$('.vb')).boundingBox();
    await p.mouse.move(box.x + box.width * .2, box.y + box.height * .3); await p.mouse.down();
    for (let i = 1; i <= 12; i++) await p.mouse.move(box.x + box.width * (.2 + i * .05), box.y + box.height * (.3 + (i % 2) * .3));
    await p.mouse.up();
    await shot(n + '_spur');
    await klick(`.vb-o[data-o="${z.optionen.find((o) => o !== z.buchstabe)}"]`); await shot(n + '_falsch');
    await klick(`.vb-o[data-o="${z.buchstabe}"]`); await sleep(300);
  } else if (z.art === 'merkmale') {
    await loese(); await sleep(1300); await S(n + '_pruefen');
    for (const [i, m] of z.merkmale.entries()) {
      if (m.seite === 'hinten') {
        await klick('.mm-wahl [data-w="unklar"]'); await sleep(200); await S(n + '_unklar');
        await klick('[data-a="dreh"]'); await sleep(700); await shot(n + '_hinten');
      }
      await klick(`.mm-wahl [data-w="${m.wert}"]`); await sleep(700);
      if (i === 0) await shot(n + '_m1');
    }
    await S(n + '_stempel');
    await klick('#fuss [data-a="stempeln"]'); await sleep(500);
  } else if (z.art === 'reihe') {
    const soll = z.reihenfolge, gegeben = z.karten.map((k) => k.id);
    for (const [i, id] of gegeben.entries()) { await klick(`.rh-pool [data-k="${id}"]`); if (i === 0) await shot(n + '_gewaehlt'); await klick(`.rh-platz[data-p="${i}"]`); }
    await S(n + '_voll');
    await klick('#fuss [data-a="fertig"]'); await sleep(1200); await shot(n + '_zurueck');
    for (const [i, id] of soll.entries()) {
      if (i === 0) { // einmal echt ziehen
        const a = await (await p.$(`.rh-pool [data-k="${id}"]`)).boundingBox(), t = await (await p.$(`.rh-platz[data-p="0"]`)).boundingBox();
        await p.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await p.mouse.down();
        await p.mouse.move(a.x + a.width / 2 + 10, a.y + a.height / 2 - 20, { steps: 3 });
        await p.mouse.move(t.x + t.width / 2, t.y + t.height / 2, { steps: 8 }); await shot(n + '_ziehen'); await p.mouse.up(); await sleep(200);
      } else { await klick(`.rh-pool [data-k="${id}"]`); await klick(`.rh-platz[data-p="${i}"]`); }
    }
    await klick('#fuss [data-a="fertig"]'); await sleep(500);
  } else if (z.art === 'ausschluss') {
    for (const [i, h] of z.hinweise.entries()) {
      if (i === 0) { await klick(`.as-k[data-id="${z.loesung}"]`); await klick('#fuss [data-a="fertig"]'); await sleep(250); await S(n + '_falsch'); await sleep(700); }
      for (const id of h.raus) await klick(`.as-k[data-id="${id}"]`);
      if (i === 0) await shot(n + '_gewaehlt');
      await klick('#fuss [data-a="fertig"]'); await sleep(1500); await S(`${n}_hinweis${i + 2}`);
    }
    await sleep(500); await S(n + '_uebrig');
    await klick('#fuss [data-a="stempeln"]'); await sleep(900);
    if (z.schluss) {
      await S(n + '_schluss');
      await klick(`.as-so[data-o="${z.schluss.optionen.findIndex((o) => !o.sicher)}"]`); await sleep(400); await S(n + '_schluss_verdacht');
      await klick(`.as-so[data-o="${z.schluss.optionen.findIndex((o) => o.sicher)}"]`); await sleep(500);
    }
  } else if (z.art === 'sortieren') {
    const platz = (id) => `.so-ziel[data-z="${id}"]`;
    const mond = z.dinge.find((x) => x.id === 'mond'), falsch = z.ziele.find((q) => q.id !== mond.ziel).id;
    // 1. Mond fälschlich aufs Tablett: wackelt, Raupe sagt „nochmal“
    await klick(`.so-pool [data-d="mond"]`); await shot(n + '_gewaehlt'); await klick(platz(falsch)); await sleep(300); await S(n + '_falsch');
    if ((await p.$$('.so-pool .so-ding')).length !== z.dinge.length) fehler.push('Zwei Kisten: falsch gelegte Sache ist trotzdem verschwunden');
    // 2. Mond richtig (Tippen)
    await klick(`.so-pool [data-d="mond"]`); await klick(platz(mond.ziel)); await sleep(300);
    // 3. Fuchs mit der Maus in die Kiste ziehen
    const f = z.dinge.find((x) => x.id === 'fuchs');
    const a = await (await p.$('.so-pool [data-d="fuchs"]')).boundingBox(), t = await (await p.$(platz(f.ziel))).boundingBox();
    await p.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await p.mouse.down();
    await p.mouse.move(a.x + a.width / 2 + 10, a.y + a.height / 2 - 20, { steps: 3 });
    await p.mouse.move(t.x + t.width / 2, t.y + t.height / 2, { steps: 8 }); await shot(n + '_ziehen'); await p.mouse.up(); await sleep(300);
    if (!(await p.$(`${platz(f.ziel)} [data-d="fuchs"]`))) fehler.push('Zwei Kisten: Ziehen legt die Puppe nicht in die Kiste');
    // 4. Papierstapel zweimal falsch: die Raupe legt ihn
    const pa = z.dinge.find((x) => x.id === 'papier'), fz = z.ziele.find((q) => q.id !== pa.ziel).id;
    for (let k = 0; k < 2; k++) { await klick(`.so-pool [data-d="papier"]`); await klick(platz(fz)); await sleep(250); }
    await shot(n + '_hilfe'); await sleep(1900);
    if (!(await p.$(`${platz(pa.ziel)} [data-d="papier"]`))) fehler.push('Zwei Kisten: nach 2 Fehlern legt die Raupe den Papierstapel nicht');
    await shot(n + '_nach_hilfe');
    await loese(); await sleep(500);
  } else if (z.art === 'umdrehen') {
    await sleep(300);
    // 1. gelbe Seite oben legen: klebt fest, danach nochmal
    await klick('#fuss [data-a="legen"]'); await sleep(300); await S(n + '_klebt'); await sleep(1700);
    // 2. umdrehen, richtig legen
    await klick('[data-a="dreh"]'); await sleep(700); await S(n + '_umgedreht');
    await klick('#fuss [data-a="legen"]'); await sleep(500); await S(n + '_warum');
    // 3. falsche Stelle, dann der Kleber
    const tb = await (await p.$('.um-tablett')).boundingBox();
    await p.mouse.click(tb.x + 12, tb.y + tb.height - 8); await sleep(300); await shot(n + '_warum_falsch');
    const zb = await (await p.$('.um-zone')).boundingBox();
    await p.mouse.click(zb.x + zb.width / 2, zb.y + zb.height / 2); await sleep(500);
  } else if (z.art === 'klebstoff') {
    await klick('[data-a="dreh"]'); await sleep(700); await S(n + '_weiss');
    const mb = await (await p.$('.kl-mond')).boundingBox();
    await p.mouse.click(mb.x + mb.width * 0.5, mb.y + mb.height * 0.88); await sleep(300); await shot(n + '_daneben');
    const zb = await (await p.$('.kl-zone')).boundingBox();
    await p.mouse.click(zb.x + zb.width / 2, zb.y + zb.height / 2); await sleep(600); await S(n + '_kleber_gefunden');
    // 1. Versuch falsch (Karte und Grund), 2. richtig
    await klick('.kl-k[data-k="gelb"]'); await klick('.kl-g[data-g="stern"]'); await shot(n + '_gewaehlt');
    await klick('#fuss [data-a="pruefen"]'); await sleep(300); await S(n + '_falsch'); await sleep(900);
    await klick(`.kl-k[data-k="${z.richtigKarte}"]`); await klick(`.kl-g[data-g="${z.gruende.find((g) => g.richtig).id}"]`);
    await shot(n + '_richtig_gewaehlt');
    await klick('#fuss [data-a="pruefen"]'); await sleep(600);
  } else if (z.art === 'suchbild') {
    const b = await (await p.$('.sb-bild')).boundingBox();
    await p.mouse.click(b.x + b.width * 0.1, b.y + b.height * 0.85); await sleep(250); await shot(n + '_daneben');
    for (const [i, x] of z.dinge.entries()) {
      // am Rand der Fläche tippen: sie muss den ganzen Gegenstand decken
      const px = x.x + (i % 2 ? 1 : -1) * x.w * 0.42, py = x.y + (i < 2 ? -1 : 1) * x.h * 0.42;
      await p.mouse.click(b.x + b.width * px / 100, b.y + b.height * py / 100); await sleep(350);
      if (i === 1) await S(n + '_zwei');
    }
    await sleep(700);
  } else if (z.art === 'lupe') {
    const bx = await (await p.$('.lp-box')).boundingBox();
    const px = (fx, fy) => [bx.x + bx.width * fx, bx.y + bx.height * fy];
    await p.mouse.click(...px(0.2, 0.2)); await sleep(300); await S(n + '_daneben');
    await p.mouse.move(...px(0.25, 0.25)); await p.mouse.down();
    await p.mouse.move(...px(0.5, 0.7), { steps: 8 }); await p.mouse.move(...px(0.53, 0.78), { steps: 4 }); await shot(n + '_lupe_nah');
    if (z.fehlFunde) { const f = z.fehlFunde[0]; await p.mouse.move(...px(f.x / 100, f.y / 100), { steps: 10 }); await sleep(200); await shot(n + '_ablenker'); }
    await p.mouse.move(...px(z.ziel.x / 100, z.ziel.y / 100), { steps: 6 }); await p.mouse.up(); await sleep(300);
    if (await p.$('#fuss [data-a="weiter"]')) throw new Error('Lupe löst sich von selbst');
    await klick('#fuss [data-a="hier"]'); await sleep(z.schluss ? 1500 : 500);
    if (z.schluss) {
      await S(n + '_schluss');
      await klick(`.as-so[data-o="${z.schluss.optionen.findIndex((o) => !o.sicher)}"]`); await sleep(400); await S(n + '_schluss_verdacht');
      await klick(`.as-so[data-o="${z.schluss.optionen.findIndex((o) => o.sicher)}"]`); await sleep(500);
    }
  } else if (z.art === 'schatten') {
    await S(n + '_start');
    const falsch = await p.$eval(`.sc-k:not([data-i="${z.richtig}"])`, (e) => e.dataset.i);
    await klick(`.sc-k[data-i="${falsch}"]`); await sleep(300); await S(n + '_falsch'); await sleep(500);
    await klick(`.sc-k[data-i="${z.richtig}"]`); await sleep(1000);
  } else if (z.art === 'kreise') {
    await S(n + '_erinnern');
    const rich = z.erinnern.karten.filter((k) => k.richtig).map((k) => k.id), falsch0 = z.erinnern.karten.find((k) => !k.richtig).id;
    await klick(`.kr-mk[data-m="${falsch0}"]`); await klick(`.kr-mk[data-m="${rich[0]}"]`); await klick('#fuss [data-a="pruefen"]'); await sleep(300); await S(n + '_erinnern_falsch'); await sleep(1000);
    for (const id of rich.slice(1)) await klick(`.kr-mk[data-m="${id}"]`);
    await shot(n + '_erinnern_richtig'); await klick('#fuss [data-a="pruefen"]'); await sleep(2000);
    await S(n + '_vorne');
    await klick('.kr-k[data-id="k1"]'); await sleep(400); await S(n + '_k1_um');
    if ((await p.$$('.kr-um')).length !== 1) fehler.push('Kreise: es darf immer nur ein Kreis umgedreht sein');
    await klick(`.kr-k[data-id="${z.loesung}"]`); await sleep(400); await S(n + '_loesung_um');
    if ((await p.$$('.kr-um')).length !== 1) fehler.push('Kreise: nach dem zweiten Antippen ist mehr als ein Kreis umgedreht');
    // das Kind streicht selbst aus: erst zu viel (Lösung durchgestrichen), dann richtig; ein Kreis per langem Drücken
    await klick(`.kr-x[data-x="${z.loesung}"]`); await klick('#fuss [data-a="fertig"]'); await sleep(300); await S(n + '_zuviel'); await sleep(1000);
    const ids = z.kreise.map((c) => c.id).filter((i) => i !== z.loesung), lang = ids[ids.length - 1];
    const bx = await (await p.$(`.kr-k[data-id="${lang}"]`)).boundingBox();
    await p.mouse.move(bx.x + bx.width / 2, bx.y + bx.height / 2); await p.mouse.down(); await sleep(800); await p.mouse.up(); await sleep(300);
    for (const id of ids.filter((i) => i !== lang)) await klick(`.kr-x[data-x="${id}"]`);
    await shot(n + '_ausgestrichen');
    await klick('#fuss [data-a="fertig"]'); await sleep(900); await S(n + '_uebrig');
    await klick('#fuss [data-a="stempeln"]'); await sleep(900);
  } else if (z.art === 'agentencode') {
    await S(n + '_start');
    await klick('.ag-feld .ag-t[data-w="0"][data-i="0"]'); await klick('#fuss [data-a="pruefen"]'); await sleep(300); await S(n + '_falsch'); await sleep(500);
    await klick('.ag-feld .ag-t[data-w="0"][data-i="0"]'); // zurücknehmen
    for (const [wi, w] of z.woerter.entries()) for (let i = 1; i < w.code.length; i += 2) { await p.click(`.ag-feld .ag-t[data-w="${wi}"][data-i="${i}"]`); await sleep(40); }
    await shot(n + '_gestrichen');
    await klick('#fuss [data-a="pruefen"]'); await sleep(600);
  } else if (z.art === 'plakat') {
    const N = z.spalten * z.zeilen;
    await S(n + '_start');
    for (let i = 0; i < N; i++) { await klick(`.pk-pool .pk-st[data-s="${i}"]`); if (i === 0) await shot(n + '_gewaehlt'); await klick(`.pk-platz[data-p="${(i + 1) % N}"]`); }
    await S(n + '_voll_falsch');
    await klick('#fuss [data-a="fertig"]'); await sleep(1200); await shot(n + '_zurueck');
    for (let i = 0; i < N; i++) {
      if (i === 0) await ev(() => document.querySelector('.pk-brett').scrollIntoView({ block: 'start' }));
      const a0 = i === 0 ? await (await p.$(`.pk-pool .pk-st[data-s="0"]`)).boundingBox() : null, t0 = i === 0 ? await (await p.$(`.pk-platz[data-p="0"]`)).boundingBox() : null;
      if (i === 0 && a0.y + a0.height < H && t0.y + t0.height < H) { // einmal echt ziehen (nur wenn Vorrat und Brett zugleich zu sehen sind)
        const a = a0, t = t0;
        await p.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await p.mouse.down();
        await p.mouse.move(a.x + a.width / 2 + 10, a.y + a.height / 2 - 20, { steps: 3 });
        await p.mouse.move(t.x + t.width / 2, t.y + t.height / 2, { steps: 8 }); await shot(n + '_ziehen'); await p.mouse.up(); await sleep(200);
        if (!(await p.$('.pk-platz[data-p="0"] .pk-st[data-s="0"]'))) { fehler.push('Plakat: Ziehen ins Feld hat nicht geklappt (Brett/Vorrat zu hoch für den Schirm?), weiter mit Antippen'); await klick('.pk-pool .pk-st[data-s="0"]'); await klick('.pk-platz[data-p="0"]'); }
      } else { await klick(`.pk-pool .pk-st[data-s="${i}"]`); await klick(`.pk-platz[data-p="${i}"]`); }
    }
    await S(n + '_voll');
    await klick('#fuss [data-a="fertig"]'); await sleep(1500); await S(n + '_fertig');
    if (z.schluss) {
      await S(n + '_schluss');
      await klick(`.as-so[data-o="${z.schluss.optionen.findIndex((o) => !o.sicher)}"]`); await sleep(400); await S(n + '_schluss_verdacht');
      await klick(`.as-so[data-o="${z.schluss.optionen.findIndex((o) => o.sicher)}"]`); await sleep(500);
    }
  } else if (z.art === 'astgabel') {
    for (const [i, q] of z.runden.entries()) {
      if (i === 0) {
        await shot(n + '_runde1');
        await klick(`.vb-o[data-o="${q.optionen.find((o) => o !== q.buchstabe)}"]`); await shot(n + '_runde1_falsch');
      }
      await klick(`.vb-o[data-o="${q.buchstabe}"]`); await sleep(500); await shot(`${n}_runde${i + 1}_gefunden`); await sleep(1800);
    }
    await sleep(500); await S(n + '_wort');
    if ((await p.$$('.ab-wort i.da')).length !== z.wort.length) fehler.push('Astgabel: nicht alle Buchstaben des Wortes stehen da');
    await klick('#fuss [data-a="weiter"]'); await sleep(400); await S(n + '_erinnern');
    const falschK = z.erinnern.karten.findIndex((c) => !c.ok);
    await klick(`.ab-e[data-i="${falschK}"]`); await sleep(300);
    for (const [i, c] of z.erinnern.karten.entries()) if (c.ok) await klick(`.ab-e[data-i="${i}"]`);
    await sleep(2000); await S(n + '_gabeln');
    if (await p.$('.ab-g, .ab-bild b')) fehler.push('Astgabel: Kreise oder Nummern auf dem Bild');
    if (await p.$('.ab-hin')) fehler.push('Astgabel: Text-Hinweis schon vor dem ersten Fehler sichtbar');
    const bb = await (await p.$('.ab-bild')).boundingBox();
    const at = (g) => p.mouse.click(bb.x + bb.width * g.x / 100, bb.y + bb.height * g.y / 100);
    await p.mouse.click(bb.x + bb.width * 0.5, bb.y + bb.height * 0.95); await sleep(200);
    if (await p.$('#fuss [data-a="nachsehen"]')) fehler.push('Astgabel: Tipp daneben zählt als Fehler');
    const gf = z.gabeln.find((g) => g.id !== z.richtig), gr = z.gabeln.find((g) => g.id === z.richtig);
    await at(gf); await sleep(400); await S(n + '_gabel_falsch');
    await klick('#fuss [data-a="nachsehen"]'); await sleep(300); await S(n + '_nachgesehen');
    await at(gr); await sleep(1200); await S(n + '_gabel_richtig');
    await klick('#fuss [data-a="stempeln"]'); await sleep(900); await S(n + '_stempel');
    const sp = await ev(() => { const b = document.querySelector('.ab-bild').getBoundingClientRect(), s = document.querySelector('.ab-bild .stempel').getBoundingClientRect(); return [(s.left + s.width / 2 - b.left) / b.width * 100, (s.top + s.height / 2 - b.top) / b.height * 100, s.left >= b.left - 1 && s.right <= b.right + 1]; });
    if (Math.hypot(sp[0] - gr.x, sp[1] - gr.y) > 5 || !sp[2]) fehler.push(`Astgabel: Stempel liegt nicht auf der Gabel (${sp.map((x) => +x || x).join(', ')})`);
  } else if (z.art === 'faden') {
    await S(n + '_start');
    for (let t = 0; t < 80 && !(await p.$('.fd-maus.achtung')); t++) await sleep(100);
    await shot(n + '_vorfuehrung'); await sleep(1800); await shot(n + '_vorfuehrung_gezogen');
    for (let t = 0; t < 120 && !((await p.$('.fd-maus.achtung')) && !(await p.$('.fd-mond.hoch'))); t++) await sleep(100);
    await sleep(300);
    const g = await (await p.$('.fd-griff b')).boundingBox();
    await p.mouse.move(g.x + g.width / 2, g.y + g.height / 2); await p.mouse.down();
    await p.mouse.move(g.x + g.width / 2, g.y + g.height / 2 + 15, { steps: 3 }); await p.mouse.move(g.x + g.width / 2, g.y + g.height / 2 + 60, { steps: 6 }); await p.mouse.up(); await sleep(400);
    await shot(n + '_gezogen');
    const punkte = await ev(() => document.querySelectorAll('.fd-zaehl i.an').length);
    if (punkte < 1) fehler.push('Faden ziehen: Wischen am Griff zur rechten Zeit gibt keinen Punkt');
    await loese(); await sleep(800);
  } else if (z.art === 'nest') {
    await S(n + '_start');
    const bx = await (await p.$('.nt-bild')).boundingBox();
    await p.mouse.move(bx.x + 10, bx.y + 10); await p.mouse.down();
    for (let i = 0; i < 24; i++) await p.mouse.move(bx.x + 20 + (i % 2 ? bx.width - 40 : 0), bx.y + 20 + i * bx.height / 24, { steps: 4 });
    await shot(n + '_wischen');
    for (let i = 0; i < 24; i++) await p.mouse.move(bx.x + 20 + (i % 2 ? bx.width - 40 : 0), bx.y + 30 + i * bx.height / 24, { steps: 4 });
    await p.mouse.up(); await sleep(1100); await S(n + '_frei');
    for (const [i, t] of z.ziele.entries()) {
      if (i === 0) { await p.mouse.click(bx.x + 30, bx.y + 30); await sleep(300); await shot(n + '_daneben'); }
      await sleep(1100); const b2 = await (await p.$('.nt-zoom')).boundingBox(); // gezoomtes Bild; die Sprechblase scrollt die Seite
      await p.mouse.click(b2.x + b2.width * t.x / 100, b2.y + b2.height * t.y / 100); await sleep(1100);
    }
    await sleep(4300);
  } else if (z.art === 'spiegel') {
    await S(n + '_zettel');
    const falsch = z.lesungen.findIndex((_, i) => i !== z.richtig);
    await klick(`.sp-o[data-o="${falsch}"]`); await sleep(300); await shot(n + '_falsch');
    await klick(`.sp-o[data-o="${z.richtig}"]`); await sleep(1000);
  }
  await S(n + '_geloest');
  await weiter();
}

/** Finale: Szene, Tresor-Code selbst legen (erst falsch, dann richtig, einmal ziehen), Tresor öffnet sich, Urkunde */
async function finale() {
  const wort = D.kapitel[0].code.wort;
  await S('finale_szene'); await klick('#fuss [data-a="weiter"]');
  await S('finale_code_start');
  const karten = async () => ev(() => [...document.querySelectorAll('.fin-k:not(.weg)')].map((e) => ({ k: +e.dataset.k, c: e.textContent.trim() })));
  // 1. Versuch: Kärtchen in der angezeigten Reihenfolge antippen (ist nie die richtige)
  for (const k of await karten()) { await p.click(`.fin-k[data-k="${k.k}"]`); await sleep(80); }
  await sleep(300); await S('finale_code_falsch'); await sleep(1200);
  // danach: fehlende Felder von links nach rechts füllen, das erste Kärtchen mit der Maus ziehen
  let gezogen = false;
  for (let i = 0; i < wort.length; i++) {
    const voll = await ev((i) => document.querySelector(`.fin-f[data-f="${i}"]`).classList.contains('voll'), i);
    if (voll) continue;
    const k = (await karten()).find((q) => q.c === wort[i]);
    if (!gezogen) {
      gezogen = true;
      const a = await (await p.$(`.fin-k[data-k="${k.k}"]`)).boundingBox(), t = await (await p.$(`.fin-f[data-f="${i}"]`)).boundingBox();
      await p.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await p.mouse.down();
      await p.mouse.move(a.x + a.width / 2 + 10, a.y + a.height / 2 - 20, { steps: 3 });
      await p.mouse.move(t.x + t.width / 2, t.y + t.height / 2, { steps: 8 }); await shot('finale_ziehen'); await p.mouse.up(); await sleep(250);
    } else { await p.click(`.fin-k[data-k="${k.k}"]`); await sleep(150); }
  }
  await sleep(300); await shot('finale_code_richtig');
  await sleep(2400); await S('finale_tresor_auf_start'); await sleep(2800); await S('finale_tresor_offen');
  await klick('#fuss [data-a="weiter"]');
  await p.fill('#dname', 'Mia'); await sleep(200); await S('finale_urkunde');
  if (!(await p.$('.dipl .dt'))) fehler.push('Finale: Urkunde fehlt');
}

await S('titel');
await klick('[data-a="start"]');
for (let k = 1; await p.$('#fuss [data-a="w"]'); k++) { await S(`karte_${k}`); await klick('#fuss [data-a="w"]'); }
const KAPITEL = [...new Set(D.spuren.map((s) => s.kap))];
for (const kap of KAPITEL) {
  if (kap > 1) { // Ausblick → nächstes Kapitel → Kapitelkarte
    await klick('#fuss [data-a="naechstes"]');
    for (let k = 1; await p.$('#fuss [data-a="w"]'); k++) { await S(`kap${kap}_karte_${k}`); await klick('#fuss [data-a="w"]'); }
  }
  for (const sp of D.spuren.filter((s) => s.kap === kap)) {
    const spur = sp.nr;
    const st = await spurSchritt(spur);
    for (const [k, s] of st.entries()) {
      const ist = await ev(() => ({ spur: window.__v8.stand.spur, i: window.__v8.stand.i }));
      if (ist.spur !== spur || ist.i !== k) throw new Error(`Ablauf verrutscht: erwartet Spur ${spur} Schritt ${k}, ist ${JSON.stringify(ist)}`);
      if (s === 'lesen') await lesen(spur);
      else if (s === 'raetsel') await raetsel(spur, sp.raetsel);
      else if (s === 'brett') {
        await S(`s${spur}_brett_staub`);
        if (await p.$('canvas.staub')) { await p.mouse.move(W / 2, 300); await loese(); await sleep(900); }
        else if (await p.$('.fundov')) { await p.click('.fundk', { force: true }); await sleep(900); if (await p.$('.fundov')) fehler.push(`Spur ${spur}: Fundkarte hängt nicht am Brett`); } // Staub: eine Karte je Kapitel
        await S(`s${spur}_brett`);
        const ersteSpur = sp.nr === D.spuren.find((q) => q.kap === kap).nr;
        if (ersteSpur) { // Code: alle bisher verdienten Buchstaben stehen schon drin
          await klick('.brett .codez[data-a="code"]'); await S(`s${spur}_brett_tresor`);
          const buch = await ev(() => [...document.querySelectorAll('.tresorinfo .wort i')].map((i) => i.textContent.trim()).join(''));
          const soll = D.kapitel.filter((q) => q.nr < kap).sort((a, b) => a.code.pos - b.code.pos).map((q) => q.code.buchstabe).join('');
          if (buch.replace(/\s/g, '') !== soll) fehler.push(`Spur ${spur}: Code zeigt „${buch}“, erwartet „${soll}“`);
          await klick('.tresorinfo [data-a="zu"]');
        }
        // Brett nur mit Karten dieses Kapitels, höchstens 6 Karten und 4 offene Fragen
        const br = await ev(() => ({ karten: document.querySelectorAll('.brett .bkarte').length, voll: document.querySelectorAll('.brett .bkarte[data-k]').length, fragen: document.querySelectorAll('.brett .zettel').length, nrs: [...document.querySelectorAll('.brett .bkarte[data-k]')].map((e) => +e.dataset.k) }));
        if (br.karten > 6 || br.fragen > 4) fehler.push(`Spur ${spur}: Brett hat ${br.karten} Karten, ${br.fragen} Fragen`);
        const eigene = D.spuren.filter((q) => q.kap === kap).map((q) => q.nr);
        if (br.nrs.some((x) => !eigene.includes(x))) fehler.push(`Spur ${spur}: Brett zeigt Karten fremder Kapitel: ${br.nrs}`);
        if (await p.$('.zettel[data-ok]')) { await shot(`s${spur}_brett_frage`); const falsch = await p.$('.zettel.fr:not([data-ok])'); if (falsch) { await falsch.click({ force: true }); await sleep(300); if (await p.$('#fuss [data-a="weiter"]')) fehler.push(`Spur ${spur}: falsche Frage schaltet Weiter frei`); } for (const z of await p.$$('.zettel[data-ok]')) { await z.click({ force: true }); await sleep(300); } await shot(`s${spur}_brett_geklaert`); await sleep(1400); if (!(await p.$('#fuss [data-a="weiter"]'))) fehler.push(`Spur ${spur}: nach geklärter Frage fehlt Weiter`); }
        await weiter();
      } else if (s === 'tippFrage') {
        await S(`s${spur}_tippfrage`);
        await klick('.opt[data-o="a"]'); await shot(`s${spur}_tippfrage_gewaehlt`); await weiter();
      } else if (s === 'tippAufl') { await S(`s${spur}_tippaufl`); await weiter(); }
      else { await S(`s${spur}_haken`); await weiter(); }
    }
  }
  await S(`k${kap}_fallkarte`);
  await klick('#fuss [data-a="stempeln"]'); await sleep(1200); await S(`k${kap}_fallkarte_gestempelt`);
  await loese(); await sleep(900); await S(`k${kap}_fallkarte_code`);
  const code = await ev(() => [...document.querySelectorAll('.codez .wort i')].map((i) => i.textContent.trim()).join(''));
  const sollK = D.kapitel.filter((q) => q.nr <= kap).sort((a, b) => a.code.pos - b.code.pos).map((q) => q.code.buchstabe).join('');
  if (code.replace(/\s/g, '') !== sollK) fehler.push(`Fallkarte ${kap}: Code zeigt „${code}“, erwartet „${sollK}“`);
  await weiter();
  if (kap === KAPITEL[KAPITEL.length - 1]) await finale();
  else await S(`k${kap}_ausblick`);
}
// Kopfzeile, Brett, Schrift (nach Neustart bis Spur 2)
await ev(() => localStorage.setItem('lesefall.v8', JSON.stringify({ spur: 3, i: 0, fertig: [1, 2], weiter: 'spur', intro: true, geklaert: [] })));
await p.reload(); await sleep(900);
await klick('[data-a="start"]'); await sleep(600);
await klick('#bBrett'); await S('brett_ueberlagerung'); await klick('.schl [data-a="zu"]');
await klick('#bAa'); await S('schrift'); await klick('.schl [data-a="zu"]');
await b.close();
if (fehler.length) { console.error('✗', fehler.length, 'Befunde:\n' + [...new Set(fehler)].join('\n')); process.exit(1); }
console.log(`✓ v8 ${NAME} ${W}×${H}: Kapitel ${KAPITEL.join(' und ')} durchgespielt, ${nr} Bilder`);
