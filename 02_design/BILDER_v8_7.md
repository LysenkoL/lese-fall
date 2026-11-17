# Картинки под текст v8.7

Что перегенерировать, чтобы картинки совпадали с новым текстом. Промты на английском, перед каждым — общий стиль (блок «Стиль»). Имена файлов — как ждёт приложение: положить в `assets/illustrationen/`, формат webp (или png — сконвертирую).

## Стиль (вставлять перед каждым промтом)

```
Use the attached images as the exact reference for characters, places and style. Indoors always the same classroom as in the attached classroom image: the NATURAL WOOD puppet theater (light wood, two posts with round knobs, the top board is ONE smooth round arch – not wavy) on the big table with the red tablecloth, the window with the caterpillar's plant on the LEFT. Children's picture-book illustration in exactly the same style, landscape 3:2. No text, no letters, no numbers. No stars anywhere EXCEPT the silver foil stars described below. Mila has no backpack. The hand puppets are a fox, a bear and a king – never a mouse (the only mouse in the book is Oskar's small grey PAPER mouse). The moon is always a FULL ROUND flat cardboard disc (never a crescent): yellow on the front with three brown paper spots, and a small shiny SILVER FOIL STAR glued right above the thread hole at the top. Soft hand-painted picture-book look (watercolor and colored pencil) – NOT flat vector clip-art, no glossy 3D look.
```

---

## Обязательно

### 1. `nest_finale` — финал «Das königliche Glitzer-Nest»
Приложить: лист детей, k1_s1 (комната), baum (дерево за окном), elster (объект).

```
Happy final scene at the open classroom window in warm golden evening light. Frau Sommer (red hair in a bun, round glasses, green cardigan), Mila, Ben and Oskar have just stepped back one step from the window and watch, delighted. Outside, right below the window sill, in a tree fork of two branches forming a V, sits a round bird's nest made of twigs. All around the nest, woven firmly into the twigs, sparkle handmade decorations: several silver and golden FOIL STARS on the left and right, and in front a small shiny SILVER PAPER CROWN – like a tiny royal castle glittering in the sunset. A black-and-white magpie with a very long tail has just landed on the branch next to the nest, tilts its head proudly and admires its new home. Oskar holds his small grey paper mouse in his hand. In the background inside the room: the puppet theater with the yellow moon (three brown spots, silver foil star) next to the white cloud, and a paper sun pinned on the pinboard. On the windowsill the small green caterpillar smiles contentedly on her leaf.
```

### 2. `finale_bild` — картина внутри сейфа
Приложить: elster (объект), baum (дерево). Квадрат 1:1.

```
A small framed painting, square 1:1: a "master painting" in an ornate golden picture frame. Inside the frame: a royal glittering magpie nest in a tree fork – a round nest of twigs decorated with silver and golden foil stars and a little silver paper crown on top, glowing in golden evening light. A proud black-and-white magpie with a very long tail sits on the rim of the nest. Painted in a warm, slightly old-master style but still a children's picture book. No people, no text. Plain dark-blue background outside the frame.
```

### 3. `k4_s24_fenster` — Spur 24 «Ein stiller Nachmittag»
Приложить: лист детей, k1_s1, baum.

```
Late afternoon, the classroom is quiet, the other children have gone home. Frau Sommer (red hair in a bun, round glasses, green cardigan), Mila, Ben and Oskar tiptoe to the open window. Ben carries a basket full of handmade glitter decorations: silver and golden foil stars and a small silver paper crown. Outside, right below the window, the wind has pushed thick leafy branches in front of the tree fork, so the nest is hidden behind yellow-green leaves – only a tiny bit of twigs peeks through. Frau Sommer leans forward and looks searchingly into the leaves, a finger on her lips ("pssst"). On the windowsill the small green caterpillar, antennae glowing golden, holds her dewdrop magnifier ready.
```

### 4. `nest_nah` — гнездо крупным планом (ПРАВКА существующей картинки)
Приложить: саму текущую `nest_nah` и попросить именно отредактировать её. Важно: все предметы остаются **на тех же местах и того же размера**, на них завязана загадка.

```
Edit the attached picture. Keep the whole composition, the nest, the light and the POSITION AND SIZE of every object exactly the same. Change only these things:
1) The key on the white ribbon: now it hangs on a small sparkling SILVER GLITTER STAR keyring (a little silver star pendant attached to the key ring), clearly a key.
2) The golden bottle cap becomes a SILVER bottle cap (crown cork).
3) The blue glass marble becomes a small colorful piece of glass (a smooth sea-glass shard in blue and green) that sparkles in the sun.
4) The crumpled silver foil ball becomes a shiny crumpled CANDY WRAPPER (glittering colorful foil).
Everything else (red button, paper clip, golden bell, yellow paper triangle, ribbons, branches) stays exactly as it is.
```
После этой картинки я сам сделаю из неё вариант без ключа для Spur 24 и обновлю подписи в загадке.

---

## Желательно (сейчас не противоречат грубо, но расходятся с текстом)

### 5. `k4_s19_elster` — Spur 19 «Der Mond im Baum»
Сейчас: сорока сидит на ветке, луна просто висит. По тексту: сорока у своего гнезда в развилке под окном пытается запихнуть туда огромную луну.

```
Outside under the big tree in front of the open classroom window: right below the window sill, in a tree fork of two branches forming a big V, sits a small round bird's nest of twigs. A black-and-white magpie with a very long tail stands on the rim of the nest and tugs wildly at a white thread in its beak; on the thread dangles the big round yellow cardboard moon (three brown paper spots, small silver foil star at the top) – far too big for the little nest. Below on the grass Mila waves both arms and shouts, Ben and Oskar look up, surprised. On the windowsill above, the small green caterpillar watches, antennae glowing golden. Warm autumn afternoon light.
```

### 6. Луна с серебряной звёздочкой
С Spur 18 у луны над дырочкой для нитки приклеена звёздочка из серебряной фольги. На картинках после этого её нет: `k3_elster`, `k4_s19` (Ben вешает луну), `k4_s22` (спектакль), `k4_s23`, `nest_finale`. Для 1–3 и 5 она уже в промтах. Остальные — если будете перегенерировать, добавьте в промт фразу из блока «Стиль» про moon.

---

## Не нужно
- `baum_nest` (ключ на белой ленте в гнезде) — в новой версии нигде не показывается.
- `k4_s20_spiel`, `k4_s22`, `k4_s23` — по сюжету подходят.
