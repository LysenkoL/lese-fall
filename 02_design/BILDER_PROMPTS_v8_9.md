# Промты для картинок v8.9 (переписаны 26.11.2026)

Источник: `02_design/bilder_prompts_v8_9.py`. Рабочая страница: артефакт «Neue Bilder D-19».

## Что изменилось и почему

- **Образцы.** Почти на каждой картинке класса стоит кукольный театр, часто с луной. Старый промт говорил «бери вложения как точный образец мест» — и ChatGPT переносил театр и луну в каждую сцену. Теперь у каждого вложения в промте своя роль: «только внешность», «только как нарисованы листья». Картинку класса k1_s1 больше не прикладываем.
- **Лишние слова.** В общем блоке стиля в каждом промте было описание луны, а запрет «No moon anywhere» тоже называет луну — генератор рисует то, что прочитал. Теперь луна есть только там, где она должна быть (облачко Бена и скамейка в Spur 19). Вместо запрета — список «на столе только …».
- **Пространство.** Не было сказано, где стоит камера и что где находится, а про дерево было «ветка идёт от подоконника» — так генератор и рисовал. Теперь первый блок каждого промта — PLACE AND CAMERA: внутри или снаружи, откуда смотрим, что слева, в центре, справа. Для дерева: ствол стоит в нескольких метрах от стены, между ними воздух, все ветки растут из ствола, кончик ветки только лежит на подоконнике, как мостик.
- **Новый чат.** Каждую картинку — в новом чате. В старом чате ChatGPT помнит прошлые картинки и тянет из них театр.
- **Порядок вложений.** Прикладывай файлы в том порядке, как они пронумерованы: в промте написано «picture 1», «picture 2».

## k1_s6_nachher.webp — Spur 6 «Das leere Tablett» + итоговая карточка главы 1 (правки №10, №11)

На текущей картинке нет клея и газет, а в тексте они есть. Одна генерация закрывает оба места. Имя файла то же — замени старый.

**Приложить по порядку:**

1. `assets/illustrationen/k1_s6_nachher.webp` — k1_s6_nachher — ракурс и композиция
2. `assets/reference/kinder_figurenblatt.webp` — лист детей — только внешность
3. `assets/reference/raupe_figurenblatt.webp` — лист гусенички — только внешность
4. `assets/illustrationen/objekte/kleber.webp` — objekte/kleber — только бутылка клея
5. `assets/illustrationen/objekte/zeitungen.webp` — objekte/zeitungen — только газеты

```text
ATTACHED PICTURES (use each one ONLY for what is written here, copy nothing else from them):
1. the CURRENT version of this picture: keep its camera angle and composition.
2. ONLY how the people look (faces, hair, clothes).
3. ONLY how the caterpillar looks.
4. ONLY how the glue bottle looks.
5. ONLY how the newspapers look.

PLACE AND CAMERA:
Inside the classroom, a close-up. The camera sits on the inner windowsill, at the caterpillar's eye level, and looks INTO the room and down onto the big craft table that stands directly under the window.
The window itself is behind the camera, so we do not see it. Warm morning sunlight comes from behind the camera.
Behind the table we only see some wooden floor and part of a round green rug. Same camera and composition as picture 1.

ON THE TABLE (only these things, nothing else):
- The table has a red tablecloth.
- In the middle: a bright-blue plastic tray. It is EMPTY except for one narrow red paper strip, pushed a little to the side.
- On the blue plastic right next to the strip: one tiny shiny drop of wet glue.
- To the RIGHT of the tray, clearly visible: Ben's big white glue bottle with an orange cap (like picture 4), yellow scissors and a roll of sticky tape.
- At the front edge of the table: a small stack of old folded newspapers (like picture 5).

WHO AND WHAT:
- Mila and Ben stand behind the table and lean over the tray, shocked: eyes wide open, mouths open.
- Ben's dark-blue sleeves are wet at the cuffs (he has just washed his hands).
- The caterpillar sits ON the blue tray in the front, next to the drop of glue, and looks at it through her dewdrop magnifying glass (a big clear water drop in a ring of green grass).

CHARACTERS:
Mila: girl, long brown braids, a small yellow hair clip, lilac-pink cardigan, blue jeans, yellow sneakers, no backpack.
Ben: boy, dark curly hair, plain dark-blue sweater with NO stripes, beige trousers.
The caterpillar: TINY (as small as a child's finger next to the children), bright green, dark-blue cape with a golden edge, NO hat, the little balls on her antennae glow soft gold.

STYLE: children's picture-book illustration, soft hand-painted look (watercolor and colored pencil), warm light, the same painting style and the same characters as in the attached pictures – NOT flat vector clip-art, NOT glossy 3D. Wide landscape format 3:2. No text, no letters, no numbers anywhere in the picture.
```

## k2_s7.webp — Spur 7 «Schnipp, schnapp» (правка №12)

Mila должна волноваться (снаружи кто-то режет ножницами — вдруг её луну), а на текущей картинке она довольная. Имя файла то же — замени старый.

**Приложить по порядку:**

1. `assets/illustrationen/k2_s7.webp` — k2_s7 — ракурс и композиция
2. `assets/reference/kinder_figurenblatt.webp` — лист детей — только внешность
3. `assets/reference/raupe_figurenblatt.webp` — лист гусенички — только внешность

```text
ATTACHED PICTURES (use each one ONLY for what is written here, copy nothing else from them):
1. the CURRENT version of this picture: keep its camera angle and composition.
2. ONLY how the people look (faces, hair, clothes).
3. ONLY how the caterpillar looks.

PLACE AND CAMERA:
Inside the classroom, at the big craft table by the open window. Same camera and composition as picture 1:
- LEFT edge: the open window; on the windowsill the caterpillar's plant pot. Through the window we see the sunny school yard (daytime, blue sky).
- MIDDLE: the craft table with the red tablecloth, the children behind it.
- BACK: the classroom wall with a green blackboard and a low bookshelf.
The puppet stage is NOT in this picture: it stands on the other side of the room, behind the camera.

ON THE TABLE (only these things, nothing else):
- the blue plastic tray with one narrow red paper strip on it;
- next to it a green wooden box; in the box lie three finished hand puppets – a bear, a fox and a king.

WHO AND WHAT:
- Mila is WORRIED, not happy: she has just heard scissors snipping outside. Big anxious eyes, both hands clapped on top of her head, she looks towards the open window.
- Ben stands next to her: red ears and cheeks, embarrassed, he slaps his hand to his forehead.
- On the windowsill next to the plant pot the tiny caterpillar leans towards the open window and listens.

CHARACTERS:
Mila: girl, long brown braids, a small yellow hair clip, lilac-pink cardigan, blue jeans, yellow sneakers, no backpack.
Ben: boy, dark curly hair, plain dark-blue sweater with NO stripes, beige trousers.
The caterpillar: TINY (as small as a child's finger next to the children), bright green, dark-blue cape with a golden edge, NO hat, the little balls on her antennae glow soft gold.

STYLE: children's picture-book illustration, soft hand-painted look (watercolor and colored pencil), warm light, the same painting style and the same characters as in the attached pictures – NOT flat vector clip-art, NOT glossy 3D. Wide landscape format 3:2. No text, no letters, no numbers anywhere in the picture.
```

## k2_s8.webp — Spur 8 «Ein Mond, der sich tarnt» (правка №15)

Ben только что понял, что сам положил луну белой стороной вверх на поднос «для всех» — он не должен весело улыбаться. Имя файла то же — замени старый.

**Приложить по порядку:**

1. `assets/illustrationen/k2_s8.webp` — k2_s8 — ракурс и композиция
2. `assets/reference/kinder_figurenblatt.webp` — лист детей — только внешность
3. `assets/reference/raupe_figurenblatt.webp` — лист гусенички — только внешность
4. `assets/illustrationen/objekte/mond_auf_tablett.webp` — objekte/mond_auf_tablett — только для облачка

```text
ATTACHED PICTURES (use each one ONLY for what is written here, copy nothing else from them):
1. the CURRENT version of this picture: keep its camera angle and composition.
2. ONLY how the people look (faces, hair, clothes).
3. ONLY how the caterpillar looks.
4. ONLY for the small picture inside the thought bubble.

PLACE AND CAMERA:
Inside the classroom, at the big craft table by the open window. Same camera and composition as picture 1:
- LEFT edge: the open window; on the windowsill the caterpillar's plant pot. Through the window we see the sunny school yard (daytime, blue sky).
- MIDDLE: the craft table with the red tablecloth, the children behind it.
- BACK: the classroom wall with a green blackboard and a low bookshelf.
The puppet stage is NOT in this picture: it stands on the other side of the room, behind the camera.

ON THE TABLE (only these things, nothing else):
- the blue plastic tray with one narrow red paper strip on it;
- next to it the green wooden box with three hand puppets (a bear, a fox, a king).

THOUGHT BUBBLE: above Ben's head a soft white thought bubble (no text). Inside it, small: the blue tray with a round WHITE cardboard disc lying on it (like picture 4).
On the white disc a white thread is rolled up into a small flat spiral and stuck down with a blob of glue; near the lower edge one tiny blue star.
This white disc exists ONLY inside the bubble – nowhere else in the picture.

WHO AND WHAT:
- Ben has just understood his mistake: eyes wide open, one hand over his mouth, embarrassed and a little guilty – NOT smiling.
- Mila looks at him, puzzled.
- On the windowsill the tiny caterpillar holds her dewdrop magnifying glass in front of one eye and looks amazed.

CHARACTERS:
Mila: girl, long brown braids, a small yellow hair clip, lilac-pink cardigan, blue jeans, yellow sneakers, no backpack.
Ben: boy, dark curly hair, plain dark-blue sweater with NO stripes, beige trousers.
The caterpillar: TINY (as small as a child's finger next to the children), bright green, dark-blue cape with a golden edge, NO hat, the little balls on her antennae glow soft gold.

STYLE: children's picture-book illustration, soft hand-painted look (watercolor and colored pencil), warm light, the same painting style and the same characters as in the attached pictures – NOT flat vector clip-art, NOT glossy 3D. Wide landscape format 3:2. No text, no letters, no numbers anywhere in the picture.
```

## k2_s10_fenster.webp — Spur 10 «Ein weißer Kreis» (правка №24)

По тексту Oskar стоит СНАРУЖИ на скамейке и опирается на подоконник, а Mila и Ben внутри. Новое имя файла. Пока его нет, в книге стоит картинка из Spur 9.

**Приложить по порядку:**

1. `assets/reference/kinder_figurenblatt.webp` — лист детей — только внешность
2. `assets/reference/raupe_figurenblatt.webp` — лист гусенички — только внешность
3. `assets/reference/hof_referenz.webp` — hof_referenz — только окно, цветок и скамейка за окном

```text
ATTACHED PICTURES (use each one ONLY for what is written here, copy nothing else from them):
1. ONLY how the people look (faces, hair, clothes).
2. ONLY how the caterpillar looks.
3. ONLY how the window, the windowsill with the plant pot and the wooden bench outside look.

PLACE AND CAMERA:
Inside the classroom. The camera stands in the room, two steps away from the window, at a child's eye height, and looks straight at the window wall.
- MIDDLE: the big window, both wings wide open. Its lower edge is at about Mila's chest height. On the inner windowsill: the plant pot.
- Left and right of the window: a plain cream classroom wall.
- Inside, directly under the window: the end of the craft table with the red tablecloth. On it only the blue tray with one narrow red paper strip.
- OUTSIDE, directly under the window, stands the wooden bench of the school yard (like in picture 3). Behind it the sunny school yard with the big tree (daytime, blue sky).
The puppet stage is NOT in this picture: it stands on the other side of the room, behind the camera.

WHO AND WHAT:
- Oskar is OUTSIDE. He stands ON the bench, so we see him from the waist up in the window opening. He leans his striped arms on the OUTER windowsill and smiles cheerfully into the room. In one hand a small folded paper note (no writing visible).
- Mila and Ben are INSIDE in front of the window, seen half from behind, and look at Oskar. Mila looks worried, Ben surprised.
- On the inner windowsill next to the plant pot sits the tiny caterpillar and listens.

CHARACTERS:
Mila: girl, long brown braids, a small yellow hair clip, lilac-pink cardigan, blue jeans, yellow sneakers, no backpack.
Ben: boy, dark curly hair, plain dark-blue sweater with NO stripes, beige trousers.
Oskar: boy, blond curly hair, red-and-white striped hoodie (the stripes go round the arms, no buttons), beige trousers.
The caterpillar: TINY (as small as a child's finger next to the children), bright green, dark-blue cape with a golden edge, NO hat, the little balls on her antennae glow soft gold.

STYLE: children's picture-book illustration, soft hand-painted look (watercolor and colored pencil), warm light, the same painting style and the same characters as in the attached pictures – NOT flat vector clip-art, NOT glossy 3D. Wide landscape format 3:2. No text, no letters, no numbers anywhere in the picture.
```

## k2_s11_hof.webp — Spur 11 «Keine Rennmaus» (правка №27)

Mila и Ben бегут к Оскару, а Oskar сидит на скамейке и ждёт. Новое имя файла. Пока его нет, в книге стоит виньетка скамейки с мышкой.

**Приложить по порядку:**

1. `assets/reference/kinder_figurenblatt.webp` — лист детей — только внешность
2. `assets/reference/raupe_figurenblatt.webp` — лист гусенички — только внешность
3. `assets/illustrationen/kinder/ida.webp` — kinder/ida — только Ида
4. `assets/illustrationen/kinder/nele.webp` — kinder/nele — только Неле
5. `assets/illustrationen/kapitel_3.webp` — kapitel_3 — только скамейка, тарелка и мышка

```text
ATTACHED PICTURES (use each one ONLY for what is written here, copy nothing else from them):
1. ONLY how the people look (faces, hair, clothes).
2. ONLY how the caterpillar looks.
3. ONLY how Ida looks.
4. ONLY how Nele looks.
5. ONLY how the wooden bench, the covered paper plate and the paper mouse look.

PLACE AND CAMERA:
OUTSIDE in the school yard – this picture is NOT inside the classroom. The camera stands in the yard at a child's eye height and looks at the school building. Warm autumn light.
- BACK: the school building wall (light plaster), seen straight on. On the LEFT in the wall: the open school door. On the RIGHT in the wall: the open classroom window on the ground floor (its lower edge about as high as an adult's chest).
- Directly under this window stands the wooden bench (like picture 5). Next to it stands the big autumn tree.
- MIDDLE: the paved yard with colorful autumn leaves.
- FRONT: a patch of meadow.

WHO AND WHAT:
- Mila and Ben have just run out of the school door and run across the yard towards the bench.
- Oskar SITS on the bench under the window and waves to them. Next to him on the bench: a white paper plate covered with white tissue paper, and his paper mouse.
- In the front on the meadow: Ida and Nele (like pictures 3 and 4) sit in the grass with scissors and blue construction paper. Ida holds up a blue paper crown.
- On the OUTER windowsill above Oskar: the tiny caterpillar pushes her head over the front edge and looks down. She is small, but easy to find: her antenna tips glow gold.

CHARACTERS:
Mila: girl, long brown braids, a small yellow hair clip, lilac-pink cardigan, blue jeans, yellow sneakers, no backpack.
Ben: boy, dark curly hair, plain dark-blue sweater with NO stripes, beige trousers.
Oskar: boy, blond curly hair, red-and-white striped hoodie (the stripes go round the arms, no buttons), beige trousers.
Ida: girl, light-brown ponytail, red-and-white HORIZONTAL stripes, no hood, three white buttons at the neck.
Nele: girl, short red bob, red-and-white VERTICAL stripes, with a hood.
The caterpillar: TINY (as small as a child's finger next to the children), bright green, dark-blue cape with a golden edge, NO hat, the little balls on her antennae glow soft gold.
Oskar's paper mouse: small and flat, cut out of GREY paper, two big round ears, a red paper heart on its belly, a thin pink tail.

STYLE: children's picture-book illustration, soft hand-painted look (watercolor and colored pencil), warm light, the same painting style and the same characters as in the attached pictures – NOT flat vector clip-art, NOT glossy 3D. Wide landscape format 3:2. No text, no letters, no numbers anywhere in the picture.
```

## k3_s19.webp — Spur 19 «Ein Mond mit Kratern» (глава 3, конец)

Ты отметила «Готово», но файла k3_s19.webp в репозитории нет. Если на твоей картинке театр, лишняя луна или дерево не так — сгенерируй заново по этому промту и пришли файл. Сцена: дети перерисовывают плакат, луна лежит без присмотра, сорока смотрит на звезду, гусеничка пугается.

**Приложить по порядку:**

1. `assets/reference/kinder_figurenblatt.webp` — лист детей — только внешность
2. `assets/reference/raupe_figurenblatt.webp` — лист гусенички — только внешность
3. `assets/illustrationen/k3_s18.webp` — k3_s18 — только место (скамейка, стена, окно)
4. `assets/illustrationen/objekte/voegel.webp` — objekte/voegel — только первая птица (сорока)

```text
ATTACHED PICTURES (use each one ONLY for what is written here, copy nothing else from them):
1. ONLY how the people look (faces, hair, clothes).
2. ONLY how the caterpillar looks.
3. ONLY how the place looks: the bench, the school wall and the window. The things on the bench and in the children's hands are NOT in our picture.
4. ONLY the FIRST bird on the left (the magpie).

PLACE AND CAMERA:
OUTSIDE in the school yard, warm autumn afternoon, yellow leaves. The camera stands in the yard and looks at the school wall.
- LEFT half, back: the light school wall with the open classroom window on the ground floor.
- Directly under the window: the wooden bench.
- RIGHT side: the trunk of the big tree. Its branches reach over the right end of the bench.

WHO AND WHAT:
- A big poster sheet lies on the bench. Mila, Ben and Oskar kneel at the bench and paint on it, completely absorbed. On the poster (only painted, no letters): a dark-blue night sky with a big round yellow moon and a white cloud. Oskar paints a small grey mouse at the bottom, Mila dabs three brown dots onto the painted moon, Ben holds a bunch of felt pens.
- At the far RIGHT end of the bench, alone in the sun: Mila's real moon. It is a round flat yellow cardboard disc (a full circle, never a crescent) with three brown paper spots. A small shiny SILVER-FOIL star is glued at its top edge, right above a small hole. A long white thread hangs from the hole down over the edge of the bench.
- This is the only cardboard moon in the picture; the moon on the poster is just a painting.
- Up in the tree, half hidden in the leaves above the right end of the bench: the magpie (like the first bird in picture 4: black and white, very long tail, as big as a pigeon). It stares straight at the shining silver star.
- On the outer windowsill of the open window: the tiny caterpillar, frightened, both little arms raised as if she calls "watch out!". Nobody notices her.

CHARACTERS:
Mila: girl, long brown braids, a small yellow hair clip, lilac-pink cardigan, blue jeans, yellow sneakers, no backpack.
Ben: boy, dark curly hair, plain dark-blue sweater with NO stripes, beige trousers.
Oskar: boy, blond curly hair, red-and-white striped hoodie (the stripes go round the arms, no buttons), beige trousers.
The caterpillar: TINY (as small as a child's finger next to the children), bright green, dark-blue cape with a golden edge, NO hat, the little balls on her antennae glow soft gold.

STYLE: children's picture-book illustration, soft hand-painted look (watercolor and colored pencil), warm light, the same painting style and the same characters as in the attached pictures – NOT flat vector clip-art, NOT glossy 3D. Wide landscape format 3:2. No text, no letters, no numbers anywhere in the picture.
```

## k4_s21_raupe.webp — Spur 21 «Ein Schatz im Nest» (глава 4)

Ты отметила «Готово», но файла k4_s21_raupe.webp в репозитории нет. Если ветка на твоей картинке растёт из подоконника или в кадре класс с театром — сгенерируй заново по этому промту. Сцена: все у окна, гнездо не видно за листьями, гусеничка храбро ползёт по ветке вниз к гнезду. Гусеничку лучше держать в левой верхней половине: оттуда вырезается картинка для карточки.

**Приложить по порядку:**

1. `assets/reference/kinder_figurenblatt.webp` — лист детей — только внешность
2. `assets/reference/raupe_figurenblatt.webp` — лист гусенички — только внешность
3. `assets/illustrationen/baum.webp` — baum — только как нарисованы кора и листья

```text
ATTACHED PICTURES (use each one ONLY for what is written here, copy nothing else from them):
1. ONLY how the people look (faces, hair, clothes).
2. ONLY how the caterpillar looks.
3. ONLY how bark, leaves and light are painted. Its view (from inside through a window) is NOT our view.

PLACE AND CAMERA:
OUTSIDE, in the air in front of the school building, at the height of the classroom window – as if we were a bird sitting in the tree. We look straight at the school wall. Warm afternoon light.
- TOP LEFT: the open classroom window in the light school wall.
- Under the window: the OUTER windowsill, a wooden board that sticks out from the wall.
- RIGHT EDGE: the thick trunk of the big tree. It stands in the school yard, a few metres in front of the wall. Between the trunk and the wall there is open air.
- ALL branches grow out of the trunk. NOTHING grows out of the wall, the window or the windowsill.
- BELOW the window, a little to the right (lower middle of the picture): a fork where two branches of the tree form a big V. In the V sits a round nest woven from twigs and white paper strips, half hidden behind thick yellow-green leaves. A tiny silver glint peeks out of the nest.
- From this fork one long thin branch rises diagonally UP to the window. Its thin end with a few small leaves just LIES ON TOP of the windowsill. So the branch is like a bridge between the nest and the windowsill. It only rests on the sill; it is not attached to it.
- Thick clusters of leaves between the window and the nest: that is why the people cannot see the nest.

WHO AND WHAT:
- Frau Sommer leans far out of the window with her upper body. Behind her, inside, Mila, Ben and Oskar crowd together; we see their heads and shoulders. All four squint down into the leaves, puzzled: they cannot see the nest.
- The tiny caterpillar crawls bravely along the long branch, away from the window and DOWN towards the nest. She is still close to the window (in the upper left half of the picture). Antenna tips glowing gold, a determined but slightly nervous face, one tiny drop of sweat on her forehead. The people do not notice her.
- No bird in this picture.

CHARACTERS:
Frau Sommer (the teacher): red hair in a bun, round glasses, green cardigan.
Mila: girl, long brown braids, a small yellow hair clip, lilac-pink cardigan, blue jeans, yellow sneakers, no backpack.
Ben: boy, dark curly hair, plain dark-blue sweater with NO stripes, beige trousers.
Oskar: boy, blond curly hair, red-and-white striped hoodie (the stripes go round the arms, no buttons), beige trousers.
The caterpillar: TINY (as small as a child's finger next to the children), bright green, dark-blue cape with a golden edge, NO hat, the little balls on her antennae glow soft gold.

STYLE: children's picture-book illustration, soft hand-painted look (watercolor and colored pencil), warm light, the same painting style and the same characters as in the attached pictures – NOT flat vector clip-art, NOT glossy 3D. Wide landscape format 3:2. No text, no letters, no numbers anywhere in the picture.
```

## raupenweg.webp — Игра Raupenweg (Spur 21), фон (правки №46, №47)

Фон для игры. Гусеничку, стрелки и сороку НЕ рисовать: их рисует приложение поверх. Главное — эскиз v2: ветки должны лежать там же, где на эскизе, тогда стрелки игры попадут на них. Если выйдет чуть иначе — я подгоню числа под картинку. Класс k1_s1 больше НЕ прикладывать: из него приходил театр.

**Приложить по порядку:**

1. `02_design/skizzen/raupenweg_skizze_v2.png` — raupenweg_skizze_v2 — точная раскладка (ГЛАВНОЕ)
2. `assets/illustrationen/baum.webp` — baum — только как нарисованы кора и листья

```text
ATTACHED PICTURES (use each one ONLY for what is written here, copy nothing else from them):
1. the EXACT layout: every branch, the window, the windowsill, the big leaf, the birdhouse, the nest and the trunk must be at the same place and the same size as here. Repaint it in our soft picture-book style.
2. ONLY how bark, leaves and light are painted. Its view (from inside through a window) is NOT our view.

PLACE AND CAMERA:
OUTSIDE. We hover in the air in front of the school building, at the height of the classroom window, and look straight at it – like a bird. Calm daylight.
- LEFT QUARTER: the outside wall of the school (light plaster) with a big window (wooden frame, glass). Under the window: the OUTER windowsill, a wooden board that sticks out from the wall. To the right of the wall there is open air (sky and soft leaves far away).
- RIGHT EDGE: the thick trunk of the big tree. It stands in the school yard, a few metres in front of the wall. Between the trunk and the wall there is open air.
- ALL branches grow out of the trunk. NOTHING grows out of the wall, the window or the windowsill.

THE BRANCHES (from left to right, at the same places as in the sketch):
1. The long main branch grows out of the trunk on the right, a bit below the middle of the picture height, and runs to the LEFT across the open air, getting thinner. Its thin tip with two or three small leaves LIES ON TOP of the windowsill and reaches to the middle of the sill – like a bridge from the tree to the window. It only rests on the sill; it is not attached to it.
2. About one third from the left edge – clearly in the open air, a hand's width to the RIGHT of the windowsill, NOT at the sill – one short thin twig grows UP from the main branch (a few tiny leaves at its end), and one short thin BARE twig grows DOWN from it. Both end freely in the air.
3. ONE BIG green leaf lies on top of the main branch, a bit to the right of these twigs (middle-left of the picture).
4. To the right of the big leaf a thin twig hangs down from the main branch; at its end hangs a small wooden birdhouse with a red roof.
5. Further right (about two thirds from the left): a thin STRAIGHT twig grows up and to the left from the main branch. It does not split.
6. Near the trunk: a thin twig grows up and to the right from the main branch and splits into a clear V. In the V sits a round twig nest (we see its rim; a tiny silver star tip glints inside).
7. At the top: a thick branch comes out of the trunk and goes to the left, with leaves.

Calm, light leafy background so that the branches read clearly. Keep the space directly above the windowsill and above the main branch calm: a small figure will be placed there later.
No caterpillar, no bird, no people, no arrows.

STYLE: children's picture-book illustration, soft hand-painted look (watercolor and colored pencil), warm light, the same painting style and the same characters as in the attached pictures – NOT flat vector clip-art, NOT glossy 3D. Wide landscape format 3:2. No text, no letters, no numbers anywhere in the picture.
```

## tresor_auf.webp — Финал: открытый сейф

Промт не менялся. Картинка в приложении уже правильная (внутренняя сторона дверцы без штурвала и кнопок). Если захочешь более «рисованную» версию — можно перегенерировать. Фон однотонный — я вырежу.

**Приложить по порядку:**

1. `assets/illustrationen/tresor_zu.webp` — tresor_zu — закрытый сейф, образец
2. `assets/illustrationen/tresor_auf.webp` — tresor_auf — текущий открытый

```text
Exactly the same treasure safe as in the attached closed-safe picture (same dark-blue body, golden crown ornament with the blue crystal on top, golden feet, same soft painted style), square 1:1, plain flat light background (#F2F2F2) so it can be cut out.
The safe is now OPEN: the door has swung open to the LEFT on its hinges, and we see the INSIDE of the door: a smooth dark-blue inner panel with four small golden rivets in the corners. The wheel handle and the four code windows are on the OUTSIDE of the door, so they are NOT visible at all in this picture.
Inside the safe: warm golden light shining out, golden rays from the top, the inside is empty (nothing in it).
No text, no letters, no numbers, no stars.
```
