# Промпты: домик Lese-Raupe (3 картинки)

Для экрана «Das Haus der Lese-Raupe» и финала. **Готово 17.11.2026:** все три картинки лежат на местах и подключены. Если захочется заменить — положи новый файл по тому же пути и запусти шаги ниже.

| # | Что | Файл | Обязательно? |
|---|---|---|---|
| 1 | Домик (фон сцены) | `assets/illustrationen/raupenhaus.webp` | желательно |
| 2 | Гусеничка с золотой лупой | `assets/illustrationen/raupe/goldlupe.webp` | не используется (17.11): в приложении стоит готовая `objekte/goldene_lupe` + поза «lob» |
| 3 | Гусеничка ест листик | `assets/illustrationen/raupe/isst.webp` | желательно |

После картинок 2 и 3 один раз запустить: `python3 app/scripts/freistellen.py` (вырезает фон), потом `cd app && npm run build`.

**Приложить к каждому запросу в ChatGPT:**
- `assets/reference/raupe_figurenblatt.webp` — лист персонажа (как выглядит гусеничка);
- `assets/reference/raupe_szene_test.webp` — пример сцены в нашем стиле;
- для картинок 2 и 3 ещё `assets/illustrationen/raupe/lob.webp` — образец позы и формата (фигурка без фона).

Как выглядит гусеничка (D-09), если в чате не прикрепить лист: маленькая зелёная гусеница, круглая голова, большие добрые глаза, румяные щёчки; тёмно-синий плащ с золотой каймой и золотой застёжкой-пуговкой у шеи; **без шапки**; два усика, кончики светятся мягким золотом; её обычная лупа — капля росы в кольце из травинки.

---

## 1. Домик — `raupenhaus.webp`

Это фон верхней части экрана: слева стоит гусеничка, справа над ней — облачко с её словами. Поэтому **левая нижняя треть** должна быть свободной «сценой» (пол, коврик), а **правая верхняя половина** — спокойной, без мелких деталей (там будет белое облачко с текстом).

```text
Use the attached images as the exact reference for style and for the caterpillar's world. Children's picture-book illustration in exactly the same soft painted style, landscape 3:2, warm evening light. No characters at all in this picture – the room is empty, the caterpillar will be placed in front of it later. No text, no letters, no numbers, no stars anywhere (stars are clues in this book – do not draw any star shapes, not even as decoration).

The cosy home of a tiny detective caterpillar, inside a hollow in an old tree, seen from the front like a small stage. Everything is caterpillar-sized and made of things from nature and from a primary-school classroom:
- Floor: smooth light wood with a round woven grass rug in the LOWER LEFT third – this spot stays empty and calm (a figure will stand there).
- Back wall: curved warm-brown bark, softly lit. On the LEFT wall a tiny cork pinboard with three small blank paper notes and a red thread between two pins (her detective board).
- A small shelf made from a twig with: a thimble used as a cup, a button used as a plate, a tiny rolled-up leaf scroll.
- A hammock made of one big green leaf, hanging between two twigs at the RIGHT side, low.
- A round window in the bark at the TOP LEFT, through it a calm dusk-blue sky and the edge of a green leaf. A flat yellow round moon disc can be seen far away (simple flat disc, no face, no craters).
- A small wardrobe made from a half walnut shell standing on the floor at the RIGHT, its little door open, a few tiny hooks inside (empty).
- A lamp: a glowing yellow dewdrop hanging from a thread, giving warm golden light.
- The UPPER RIGHT half of the picture is calm: plain bark wall with soft light, no objects – a speech bubble will be placed there.

Colours: warm browns, leaf greens, mustard yellow (#F4C243) accents, dark night blue (#1D2E57) in the shadows and the window. Soft, friendly, uncluttered, nothing scary, no dark corners.
```

**Проверить перед сохранением:** нет звёзд; левая нижняя треть пустая; справа сверху спокойно; никаких персонажей; формат 3:2.

---

## 2. Гусеничка с золотой лупой — `raupe/goldlupe.webp`

Награда за всю книгу (D-08: «золотая лупа-росинка не продаётся»). Видна в финале («Ein Geschenk für dich»), в домике и на странице «Fall gelöst». Фигурка без фона — как другие позы в `assets/illustrationen/raupe/`.

```text
Use the attached character sheet as the exact reference for the caterpillar: same face, same body, same colours, same dark-blue cape with the golden trim and golden button, NO hat, antenna tips glowing softly gold. Same soft painted children's-book style as the attached pose image, same framing and size: the whole caterpillar, upright, front view, centred, plain flat light background (#F2F2F2) with nothing else on it, so it can be cut out. Portrait 3:4. No text, no letters, no numbers, no stars.

The caterpillar proudly holds up a GOLDEN magnifying glass with both little hands, a bit to the right of her face, like a trophy. The magnifying glass is her usual dewdrop magnifier, but golden: the lens is a big clear dewdrop, the ring is a twisted blade of grass that is now shiny gold, the short handle also gold. Warm golden light comes from the lens and falls on her cheeks. She smiles happily with closed, curved eyes (proud and joyful, not silly). A few tiny soft golden sparkles (small round dots, NOT stars) around the lens.
```

**Проверить:** шапки нет; лупа золотая и в форме капли в кольце из травинки; руки держат лупу; фон ровный и светлый (иначе вырезка будет грязной); нет звёзд.

---

## 3. Гусеничка ест — `raupe/isst.webp`

Показывается на секунду, когда ребёнок её кормит (листик, яблоко, клубника, мороженое) — поэтому поза общая, «жую с удовольствием».

```text
Use the attached character sheet as the exact reference for the caterpillar: same face, same body, same colours, same dark-blue cape with the golden trim and golden button, NO hat, antenna tips glowing softly gold. Same soft painted children's-book style as the attached pose image, same framing and size: the whole caterpillar, upright, front view, centred, plain flat light background (#F2F2F2) with nothing else on it, so it can be cut out. Portrait 3:4. No text, no letters, no numbers, no stars.

The caterpillar is happily munching: she holds a small round bitten green leaf with both hands in front of her mouth, cheeks puffed and round like a hamster, eyes closed in delight, a tiny crumb of leaf on her chin. Her body is slightly squashed as if chewing. Cute, funny and cosy – a child should laugh when she sees it.
```

**Проверить:** шапки нет; лист маленький и не закрывает лицо; щёки надуты; фон ровный и светлый.

---

## Что ещё можно позже (не обязательно)

- `raupe/schlaeft.webp` — гусеничка спит, свернувшись калачиком, для эпилога «Ein stiller Abend» (сейчас там поза «müde»).
- Отдельные картинки еды (яблоко, клубника, мороженое) не нужны: они нарисованы в коде и выглядят аккуратно.

---

## 4. Еда для домика (по желанию) — `essen/<имя>.webp`

Сейчас печенье и сыр — готовые картинки из книги (`objekte/raetsel_keks`, `objekte/raetsel_kaese`), а листик, яблоко, клубника и мороженое нарисованы в коде. Если хочешь, чтобы вся еда была в одном рисованном стиле, сгенерируй её. Каждый предмет — отдельной картинкой, по этому шаблону, меняя только последнюю строку. Файлы: `assets/illustrationen/essen/blatt.webp`, `apfel.webp`, `erdbeere.webp`, `eis.webp` (и по желанию `keks.webp`, `kaese.webp`). Положил файл — приложение берёт его вместо рисунка, код менять не нужно.

**Приложить:** `assets/illustrationen/objekte/raetsel_keks.webp` и `assets/illustrationen/garderobe/garderobe_blatt.webp` (образец стиля предметов).

```text
Use the attached object images as the exact style reference: the same soft painted children's-book style, the same light from the upper left, the same gentle soft shadow under the object. One single object, centred, filling about 80% of the picture, plain white background, nothing else. Square 1:1. No text, no letters, no numbers, no stars, no faces on the food.
<ONE OF:>
A fresh, juicy green leaf (like a lime-tree leaf) with fine veins, a tiny dewdrop on it and a short stem.
A shiny red apple with a short brown stem and one green leaf, a soft white highlight on the left.
A ripe red strawberry with small yellow seeds and a fresh green leafy cap.
An ice-cream cone with one vanilla scoop and one pink strawberry scoop and a cherry on top, crisp waffle pattern on the cone.
```
