"""Промты для картинок v8.9 (страница «Neue Bilder D-19»), переписаны 26.11.2026.

Запуск: python3 02_design/bilder_prompts_v8_9.py
  -> 02_design/BILDER_PROMPTS_v8_9.html  (страница-артефакт с кнопками «Копировать» и отметками)
  -> 02_design/BILDER_PROMPTS_v8_9.md    (то же текстом, для истории)

Почему переписаны (жалоба владелицы: «везде театр, сзади луна, дерево растёт из подоконника»):
1. Образцы. Почти на каждой картинке класса стоит кукольный театр, часто с луной. Старый промт начинался с
   «Use the attached images as the exact reference for characters, places and style» — и генератор копировал
   театр и луну в каждую сцену. Теперь у каждого вложения своя роль («ONLY how … look»), k1_s1 больше не прикладываем.
2. Лишние слова. Общий блок стиля описывал луну в каждом промте, а «No moon anywhere» тоже называет луну.
   Теперь луна есть только там, где она на картинке; вместо запрета — список «на столе только …».
3. Пространство. Не было сказано, где камера и что где стоит; у дерева «ветка идёт от подоконника».
   Теперь у каждого промта первый блок PLACE AND CAMERA, у дерева: ствол в нескольких метрах от стены,
   между ними воздух, все ветки из ствола, кончик ветки только лежит на подоконнике.
"""
import html
import json
import pathlib

# ---------------------------------------------------------------- общие куски (без театра и без луны)
STYLE = ("STYLE: children's picture-book illustration, soft hand-painted look (watercolor and colored pencil), warm light, "
         "the same painting style and the same characters as in the attached pictures – NOT flat vector clip-art, NOT glossy 3D. "
         "Wide landscape format 3:2. No text, no letters, no numbers anywhere in the picture.")

FIG = {
    "mila": "Mila: girl, long brown braids, a small yellow hair clip, lilac-pink cardigan, blue jeans, yellow sneakers, no backpack.",
    "ben": "Ben: boy, dark curly hair, plain dark-blue sweater with NO stripes, beige trousers.",
    "oskar": "Oskar: boy, blond curly hair, red-and-white striped hoodie (the stripes go round the arms, no buttons), beige trousers.",
    "sommer": "Frau Sommer (the teacher): red hair in a bun, round glasses, green cardigan.",
    "ida": "Ida: girl, light-brown ponytail, red-and-white HORIZONTAL stripes, no hood, three white buttons at the neck.",
    "nele": "Nele: girl, short red bob, red-and-white VERTICAL stripes, with a hood.",
    "raupe": "The caterpillar: TINY (as small as a child's finger next to the children), bright green, dark-blue cape with a golden edge, NO hat, the little balls on her antennae glow soft gold.",
    "maus": "Oskar's paper mouse: small and flat, cut out of GREY paper, two big round ears, a red paper heart on its belly, a thin pink tail.",
}

# Вложения: (файл, роль по-английски для промта, пояснение по-русски для страницы)
REF_KINDER = ("assets/reference/kinder_figurenblatt.webp", "ONLY how the people look (faces, hair, clothes)", "лист детей — только внешность")
REF_RAUPE = ("assets/reference/raupe_figurenblatt.webp", "ONLY how the caterpillar looks", "лист гусенички — только внешность")
REF_BAUM = ("assets/illustrationen/baum.webp", "ONLY how bark, leaves and light are painted. Its view (from inside through a window) is NOT our view",
            "baum — только как нарисованы кора и листья")


def anhang_en(refs):
    zeilen = [f"{i}. {r[1]}." for i, r in enumerate(refs, 1)]
    return "ATTACHED PICTURES (use each one ONLY for what is written here, copy nothing else from them):\n" + "\n".join(zeilen)


def prompt(refs, ort, inhalt, figuren):
    teile = [anhang_en(refs), "PLACE AND CAMERA:\n" + ort.strip(), inhalt.strip()]
    if figuren:
        teile.append("CHARACTERS:\n" + "\n".join(FIG[f] for f in figuren))
    teile.append(STYLE)
    return "\n\n".join(teile)


BILDER = []
# Файлы, которые лежат прямо на странице (скачать): путь в репозитории -> имя на странице
LINKS = {"02_design/skizzen/raupenweg_skizze_v2.png": "raupenweg_skizze_v2.png"}


def bild(id, spur, zweck, refs, ort, inhalt, figuren, prio="muss"):
    BILDER.append(dict(id=id, datei=f"{id}.webp", prio=prio, spur=spur, zweck=zweck,
                       anhang=[dict(datei=r[0], ru=r[2], **({"link": LINKS[r[0]]} if r[0] in LINKS else {})) for r in refs],
                       text=prompt(refs, ort, inhalt, figuren)))


# ---------------------------------------------------------------- Глава 1–2: класс (камера смотрит мимо театра)
bild("k1_s6_nachher", "Spur 6 «Das leere Tablett» + итоговая карточка главы 1 (правки №10, №11)",
     "На текущей картинке нет клея и газет, а в тексте они есть. Одна генерация закрывает оба места. Имя файла то же — замени старый.",
     [("assets/illustrationen/k1_s6_nachher.webp", "the CURRENT version of this picture: keep its camera angle and composition", "k1_s6_nachher — ракурс и композиция"),
      REF_KINDER, REF_RAUPE,
      ("assets/illustrationen/objekte/kleber.webp", "ONLY how the glue bottle looks", "objekte/kleber — только бутылка клея"),
      ("assets/illustrationen/objekte/zeitungen.webp", "ONLY how the newspapers look", "objekte/zeitungen — только газеты")],
     """
Inside the classroom, a close-up. The camera sits on the inner windowsill, at the caterpillar's eye level, and looks INTO the room and down onto the big craft table that stands directly under the window.
The window itself is behind the camera, so we do not see it. Warm morning sunlight comes from behind the camera.
Behind the table we only see some wooden floor and part of a round green rug. Same camera and composition as picture 1.""",
     """
ON THE TABLE (only these things, nothing else):
- The table has a red tablecloth.
- In the middle: a bright-blue plastic tray. It is EMPTY except for one narrow red paper strip, pushed a little to the side.
- On the blue plastic right next to the strip: one tiny shiny drop of wet glue.
- To the RIGHT of the tray, clearly visible: Ben's big white glue bottle with an orange cap (like picture 4), yellow scissors and a roll of sticky tape.
- At the front edge of the table: a small stack of old folded newspapers (like picture 5).

WHO AND WHAT:
- Mila and Ben stand behind the table and lean over the tray, shocked: eyes wide open, mouths open.
- Ben's dark-blue sleeves are wet at the cuffs (he has just washed his hands).
- The caterpillar sits ON the blue tray in the front, next to the drop of glue, and looks at it through her dewdrop magnifying glass (a big clear water drop in a ring of green grass).""",
     ["mila", "ben", "raupe"])

KLASSE_FENSTER_LINKS = """
Inside the classroom, at the big craft table by the open window. Same camera and composition as picture 1:
- LEFT edge: the open window; on the windowsill the caterpillar's plant pot. Through the window we see the sunny school yard (daytime, blue sky).
- MIDDLE: the craft table with the red tablecloth, the children behind it.
- BACK: the classroom wall with a green blackboard and a low bookshelf.
The puppet stage is NOT in this picture: it stands on the other side of the room, behind the camera."""

bild("k2_s7", "Spur 7 «Schnipp, schnapp» (правка №12)",
     "Mila должна волноваться (снаружи кто-то режет ножницами — вдруг её луну), а на текущей картинке она довольная. Имя файла то же — замени старый.",
     [("assets/illustrationen/k2_s7.webp", "the CURRENT version of this picture: keep its camera angle and composition", "k2_s7 — ракурс и композиция"),
      REF_KINDER, REF_RAUPE],
     KLASSE_FENSTER_LINKS,
     """
ON THE TABLE (only these things, nothing else):
- the blue plastic tray with one narrow red paper strip on it;
- next to it a green wooden box; in the box lie three finished hand puppets – a bear, a fox and a king.

WHO AND WHAT:
- Mila is WORRIED, not happy: she has just heard scissors snipping outside. Big anxious eyes, both hands clapped on top of her head, she looks towards the open window.
- Ben stands next to her: red ears and cheeks, embarrassed, he slaps his hand to his forehead.
- On the windowsill next to the plant pot the tiny caterpillar leans towards the open window and listens.""",
     ["mila", "ben", "raupe"])

bild("k2_s8", "Spur 8 «Ein Mond, der sich tarnt» (правка №15)",
     "Ben только что понял, что сам положил луну белой стороной вверх на поднос «для всех» — он не должен весело улыбаться. Имя файла то же — замени старый.",
     [("assets/illustrationen/k2_s8.webp", "the CURRENT version of this picture: keep its camera angle and composition", "k2_s8 — ракурс и композиция"),
      REF_KINDER, REF_RAUPE,
      ("assets/illustrationen/objekte/mond_auf_tablett.webp", "ONLY for the small picture inside the thought bubble", "objekte/mond_auf_tablett — только для облачка")],
     KLASSE_FENSTER_LINKS,
     """
ON THE TABLE (only these things, nothing else):
- the blue plastic tray with one narrow red paper strip on it;
- next to it the green wooden box with three hand puppets (a bear, a fox, a king).

THOUGHT BUBBLE: above Ben's head a soft white thought bubble (no text). Inside it, small: the blue tray with a round WHITE cardboard disc lying on it (like picture 4).
On the white disc a white thread is rolled up into a small flat spiral and stuck down with a blob of glue; near the lower edge one tiny blue star.
This white disc exists ONLY inside the bubble – nowhere else in the picture.

WHO AND WHAT:
- Ben has just understood his mistake: eyes wide open, one hand over his mouth, embarrassed and a little guilty – NOT smiling.
- Mila looks at him, puzzled.
- On the windowsill the tiny caterpillar holds her dewdrop magnifying glass in front of one eye and looks amazed.""",
     ["mila", "ben", "raupe"])

bild("k2_s10_fenster", "Spur 10 «Ein weißer Kreis» (правка №24)",
     "По тексту Oskar стоит СНАРУЖИ на скамейке и опирается на подоконник, а Mila и Ben внутри. Новое имя файла. Пока его нет, в книге стоит картинка из Spur 9.",
     [REF_KINDER, REF_RAUPE,
      ("assets/reference/hof_referenz.webp", "ONLY how the window, the windowsill with the plant pot and the wooden bench outside look", "hof_referenz — только окно, цветок и скамейка за окном")],
     """
Inside the classroom. The camera stands in the room, two steps away from the window, at a child's eye height, and looks straight at the window wall.
- MIDDLE: the big window, both wings wide open. Its lower edge is at about Mila's chest height. On the inner windowsill: the plant pot.
- Left and right of the window: a plain cream classroom wall.
- Inside, directly under the window: the end of the craft table with the red tablecloth. On it only the blue tray with one narrow red paper strip.
- OUTSIDE, directly under the window, stands the wooden bench of the school yard (like in picture 3). Behind it the sunny school yard with the big tree (daytime, blue sky).
The puppet stage is NOT in this picture: it stands on the other side of the room, behind the camera.""",
     """
WHO AND WHAT:
- Oskar is OUTSIDE. He stands ON the bench, so we see him from the waist up in the window opening. He leans his striped arms on the OUTER windowsill and smiles cheerfully into the room. In one hand a small folded paper note (no writing visible).
- Mila and Ben are INSIDE in front of the window, seen half from behind, and look at Oskar. Mila looks worried, Ben surprised.
- On the inner windowsill next to the plant pot sits the tiny caterpillar and listens.""",
     ["mila", "ben", "oskar", "raupe"])

bild("k2_s11_hof", "Spur 11 «Keine Rennmaus» (правка №27)",
     "Mila и Ben бегут к Оскару, а Oskar сидит на скамейке и ждёт. Новое имя файла. Пока его нет, в книге стоит виньетка скамейки с мышкой.",
     [REF_KINDER, REF_RAUPE,
      ("assets/illustrationen/kinder/ida.webp", "ONLY how Ida looks", "kinder/ida — только Ида"),
      ("assets/illustrationen/kinder/nele.webp", "ONLY how Nele looks", "kinder/nele — только Неле"),
      ("assets/illustrationen/kapitel_3.webp", "ONLY how the wooden bench, the covered paper plate and the paper mouse look", "kapitel_3 — только скамейка, тарелка и мышка")],
     """
OUTSIDE in the school yard – this picture is NOT inside the classroom. The camera stands in the yard at a child's eye height and looks at the school building. Warm autumn light.
- BACK: the school building wall (light plaster), seen straight on. On the LEFT in the wall: the open school door. On the RIGHT in the wall: the open classroom window on the ground floor (its lower edge about as high as an adult's chest).
- Directly under this window stands the wooden bench (like picture 5). Next to it stands the big autumn tree.
- MIDDLE: the paved yard with colorful autumn leaves.
- FRONT: a patch of meadow.""",
     """
WHO AND WHAT:
- Mila and Ben have just run out of the school door and run across the yard towards the bench.
- Oskar SITS on the bench under the window and waves to them. Next to him on the bench: a white paper plate covered with white tissue paper, and his paper mouse.
- In the front on the meadow: Ida and Nele (like pictures 3 and 4) sit in the grass with scissors and blue construction paper. Ida holds up a blue paper crown.
- On the OUTER windowsill above Oskar: the tiny caterpillar pushes her head over the front edge and looks down. She is small, but easy to find: her antenna tips glow gold.""",
     ["mila", "ben", "oskar", "ida", "nele", "raupe", "maus"])

# ---------------------------------------------------------------- Глава 3–4: двор и дерево
bild("k3_s19", "Spur 19 «Ein Mond mit Kratern» (глава 3, конец)",
     "Ты отметила «Готово», но файла k3_s19.webp в репозитории нет. Если на твоей картинке театр, лишняя луна или дерево не так — сгенерируй заново по этому промту и пришли файл. Сцена: дети перерисовывают плакат, луна лежит без присмотра, сорока смотрит на звезду, гусеничка пугается.",
     [REF_KINDER, REF_RAUPE,
      ("assets/illustrationen/k3_s18.webp", "ONLY how the place looks: the bench, the school wall and the window. The things on the bench and in the children's hands are NOT in our picture", "k3_s18 — только место (скамейка, стена, окно)"),
      ("assets/illustrationen/objekte/voegel.webp", "ONLY the FIRST bird on the left (the magpie)", "objekte/voegel — только первая птица (сорока)")],
     """
OUTSIDE in the school yard, warm autumn afternoon, yellow leaves. The camera stands in the yard and looks at the school wall.
- LEFT half, back: the light school wall with the open classroom window on the ground floor.
- Directly under the window: the wooden bench.
- RIGHT side: the trunk of the big tree. Its branches reach over the right end of the bench.""",
     """
WHO AND WHAT:
- A big poster sheet lies on the bench. Mila, Ben and Oskar kneel at the bench and paint on it, completely absorbed. On the poster (only painted, no letters): a dark-blue night sky with a big round yellow moon and a white cloud. Oskar paints a small grey mouse at the bottom, Mila dabs three brown dots onto the painted moon, Ben holds a bunch of felt pens.
- At the far RIGHT end of the bench, alone in the sun: Mila's real moon. It is a round flat yellow cardboard disc (a full circle, never a crescent) with three brown paper spots. A small shiny SILVER-FOIL star is glued at its top edge, right above a small hole. A long white thread hangs from the hole down over the edge of the bench.
- This is the only cardboard moon in the picture; the moon on the poster is just a painting.
- Up in the tree, half hidden in the leaves above the right end of the bench: the magpie (like the first bird in picture 4: black and white, very long tail, as big as a pigeon). It stares straight at the shining silver star.
- On the outer windowsill of the open window: the tiny caterpillar, frightened, both little arms raised as if she calls "watch out!". Nobody notices her.""",
     ["mila", "ben", "oskar", "raupe"])

BAUM_RAUM = """
- RIGHT EDGE: the thick trunk of the big tree. It stands in the school yard, a few metres in front of the wall. Between the trunk and the wall there is open air.
- ALL branches grow out of the trunk. NOTHING grows out of the wall, the window or the windowsill."""

bild("k4_s21_raupe", "Spur 21 «Ein Schatz im Nest» (глава 4)",
     "Ты отметила «Готово», но файла k4_s21_raupe.webp в репозитории нет. Если ветка на твоей картинке растёт из подоконника или в кадре класс с театром — сгенерируй заново по этому промту. Сцена: все у окна, гнездо не видно за листьями, гусеничка храбро ползёт по ветке вниз к гнезду. Гусеничку лучше держать в левой верхней половине: оттуда вырезается картинка для карточки.",
     [REF_KINDER, REF_RAUPE, REF_BAUM],
     """
OUTSIDE, in the air in front of the school building, at the height of the classroom window – as if we were a bird sitting in the tree. We look straight at the school wall. Warm afternoon light.
- TOP LEFT: the open classroom window in the light school wall.
- Under the window: the OUTER windowsill, a wooden board that sticks out from the wall.""" + BAUM_RAUM + """
- BELOW the window, a little to the right (lower middle of the picture): a fork where two branches of the tree form a big V. In the V sits a round nest woven from twigs and white paper strips, half hidden behind thick yellow-green leaves. A tiny silver glint peeks out of the nest.
- From this fork one long thin branch rises diagonally UP to the window. Its thin end with a few small leaves just LIES ON TOP of the windowsill. So the branch is like a bridge between the nest and the windowsill. It only rests on the sill; it is not attached to it.
- Thick clusters of leaves between the window and the nest: that is why the people cannot see the nest.""",
     """
WHO AND WHAT:
- Frau Sommer leans far out of the window with her upper body. Behind her, inside, Mila, Ben and Oskar crowd together; we see their heads and shoulders. All four squint down into the leaves, puzzled: they cannot see the nest.
- The tiny caterpillar crawls bravely along the long branch, away from the window and DOWN towards the nest. She is still close to the window (in the upper left half of the picture). Antenna tips glowing gold, a determined but slightly nervous face, one tiny drop of sweat on her forehead. The people do not notice her.
- No bird in this picture.""",
     ["sommer", "mila", "ben", "oskar", "raupe"])

bild("raupenweg", "Игра Raupenweg (Spur 21), фон (правки №46, №47)",
     "Фон для игры. Гусеничку, стрелки и сороку НЕ рисовать: их рисует приложение поверх. Главное — эскиз v2: ветки должны лежать там же, где на эскизе, тогда стрелки игры попадут на них. Если выйдет чуть иначе — я подгоню числа под картинку. Класс k1_s1 больше НЕ прикладывать: из него приходил театр.",
     [("02_design/skizzen/raupenweg_skizze_v2.png", "the EXACT layout: every branch, the window, the windowsill, the big leaf, the birdhouse, the nest and the trunk must be at the same place and the same size as here. Repaint it in our soft picture-book style", "raupenweg_skizze_v2 — точная раскладка (ГЛАВНОЕ)"),
      REF_BAUM],
     """
OUTSIDE. We hover in the air in front of the school building, at the height of the classroom window, and look straight at it – like a bird. Calm daylight.
- LEFT QUARTER: the outside wall of the school (light plaster) with a big window (wooden frame, glass). Under the window: the OUTER windowsill, a wooden board that sticks out from the wall. To the right of the wall there is open air (sky and soft leaves far away).""" + BAUM_RAUM,
     """
THE BRANCHES (from left to right, at the same places as in the sketch):
1. The long main branch grows out of the trunk on the right, a bit below the middle of the picture height, and runs to the LEFT across the open air, getting thinner. Its thin tip with two or three small leaves LIES ON TOP of the windowsill and reaches to the middle of the sill – like a bridge from the tree to the window. It only rests on the sill; it is not attached to it.
2. About one third from the left edge – clearly in the open air, a hand's width to the RIGHT of the windowsill, NOT at the sill – one short thin twig grows UP from the main branch (a few tiny leaves at its end), and one short thin BARE twig grows DOWN from it. Both end freely in the air.
3. ONE BIG green leaf lies on top of the main branch, a bit to the right of these twigs (middle-left of the picture).
4. To the right of the big leaf a thin twig hangs down from the main branch; at its end hangs a small wooden birdhouse with a red roof.
5. Further right (about two thirds from the left): a thin STRAIGHT twig grows up and to the left from the main branch. It does not split.
6. Near the trunk: a thin twig grows up and to the right from the main branch and splits into a clear V. In the V sits a round twig nest (we see its rim; a tiny silver star tip glints inside).
7. At the top: a thick branch comes out of the trunk and goes to the left, with leaves.

Calm, light leafy background so that the branches read clearly. Keep the space directly above the windowsill and above the main branch calm: a small figure will be placed there later.
No caterpillar, no bird, no people, no arrows.""",
     [])

# ---------------------------------------------------------------- Сейф (без изменений, там не было театра и луны)
BILDER.append(dict(
    id="tresor_auf", datei="tresor_auf.webp", prio="kann", spur="Финал: открытый сейф",
    zweck="Промт не менялся. Картинка в приложении уже правильная (внутренняя сторона дверцы без штурвала и кнопок). Если захочешь более «рисованную» версию — можно перегенерировать. Фон однотонный — я вырежу.",
    anhang=[dict(datei="assets/illustrationen/tresor_zu.webp", ru="tresor_zu — закрытый сейф, образец"),
            dict(datei="assets/illustrationen/tresor_auf.webp", ru="tresor_auf — текущий открытый")],
    text=("Exactly the same treasure safe as in the attached closed-safe picture (same dark-blue body, golden crown ornament with the blue crystal on top, golden feet, same soft painted style), square 1:1, plain flat light background (#F2F2F2) so it can be cut out.\n"
          "The safe is now OPEN: the door has swung open to the LEFT on its hinges, and we see the INSIDE of the door: a smooth dark-blue inner panel with four small golden rivets in the corners. The wheel handle and the four code windows are on the OUTSIDE of the door, so they are NOT visible at all in this picture.\n"
          "Inside the safe: warm golden light shining out, golden rays from the top, the inside is empty (nothing in it).\n"
          "No text, no letters, no numbers, no stars.")))

WARUM = [
    ("Образцы", "Почти на каждой картинке класса стоит кукольный театр, часто с луной. Старый промт говорил «бери вложения как точный образец мест» — и ChatGPT переносил театр и луну в каждую сцену. Теперь у каждого вложения в промте своя роль: «только внешность», «только как нарисованы листья». Картинку класса k1_s1 больше не прикладываем."),
    ("Лишние слова", "В общем блоке стиля в каждом промте было описание луны, а запрет «No moon anywhere» тоже называет луну — генератор рисует то, что прочитал. Теперь луна есть только там, где она должна быть (облачко Бена и скамейка в Spur 19). Вместо запрета — список «на столе только …»."),
    ("Пространство", "Не было сказано, где стоит камера и что где находится, а про дерево было «ветка идёт от подоконника» — так генератор и рисовал. Теперь первый блок каждого промта — PLACE AND CAMERA: внутри или снаружи, откуда смотрим, что слева, в центре, справа. Для дерева: ствол стоит в нескольких метрах от стены, между ними воздух, все ветки растут из ствола, кончик ветки только лежит на подоконнике, как мостик."),
    ("Новый чат", "Каждую картинку — в новом чате. В старом чате ChatGPT помнит прошлые картинки и тянет из них театр."),
    ("Порядок вложений", "Прикладывай файлы в том порядке, как они пронумерованы: в промте написано «picture 1», «picture 2»."),
]

# ---------------------------------------------------------------- страница
SEITE = r"""<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Neue Bilder D-19</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400&display=swap">
<style>
/* Layout: Arbeitsliste für die Besitzerin. Oben Anleitung und „что изменилось“, dann je Bild eine Karte: wofür, nummerierte Anhänge, Prompt zum Kopieren, Status. */
:root {
  --nacht: #1D2E57; --nacht-tief: #131B3C; --senf: #F4C243; --senf-tinte: #2A2210; --senf-hell: #FFF3CC;
  --grund: #EEF1F7; --karte: #FFFFFF; --papier: #FFFDF8; --tinte: #1E2438; --grau: #5D6680; --linie: #D9DEEA;
  --gruen: #3E8A2E; --gruen-hell: #E3F2DC; --blau: #1D3F9E; --code: #F4F6FB;
  --schatten: 0 1px 0 rgba(29,46,87,.06), 0 6px 18px rgba(29,46,87,.08);
  --f-titel: "Bricolage Grotesque", "Inter", system-ui, sans-serif; --f-text: "Inter", system-ui, sans-serif; --f-mono: "JetBrains Mono", ui-monospace, Menlo, monospace;
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --grund: #0F1528; --karte: #161E33; --papier: #1A2238; --tinte: #E8ECF6; --grau: #A3ACC4; --linie: #2C3756; --gruen: #8FD07A; --gruen-hell: #1D2F1C; --senf-hell: #3A3216; --blau: #9DB4FF; --code: #10182C; --schatten: 0 1px 0 rgba(0,0,0,.3), 0 6px 18px rgba(0,0,0,.35); color-scheme: dark } }
:root[data-theme="dark"] { --grund: #0F1528; --karte: #161E33; --papier: #1A2238; --tinte: #E8ECF6; --grau: #A3ACC4; --linie: #2C3756; --gruen: #8FD07A; --gruen-hell: #1D2F1C; --senf-hell: #3A3216; --blau: #9DB4FF; --code: #10182C; --schatten: 0 1px 0 rgba(0,0,0,.3), 0 6px 18px rgba(0,0,0,.35); color-scheme: dark }
* { box-sizing: border-box; }
body { margin: 0; background: var(--grund); color: var(--tinte); font: 15px/1.55 var(--f-text); }
.wrap { max-width: 60rem; margin: 0 auto; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
h1, h2 { font-family: var(--f-titel); margin: 0; line-height: 1.15; text-wrap: balance; }
.kopf { background: linear-gradient(160deg, var(--nacht-tief), var(--nacht)); color: #fff; margin-top: calc(-1 * env(safe-area-inset-top, 0px)); padding-top: calc(env(safe-area-inset-top, 0px) + 1.6rem); padding-bottom: 1.3rem; }
.kopf .wrap { display: grid; gap: .7rem; }
.eyebrow { font-size: .75rem; letter-spacing: .12em; text-transform: uppercase; color: var(--senf); font-weight: 700; }
.kopf h1 { font-size: clamp(1.6rem, 4vw, 2.2rem); font-weight: 800; }
.kopf p { margin: 0; color: #D6DCEC; max-width: 44rem; }
.kopf ol { margin: 0; padding-left: 1.2rem; color: #D6DCEC; display: grid; gap: .2rem; max-width: 46rem; }
.kopf code { font-family: var(--f-mono); font-size: .85em; color: var(--senf); }
.stand { display: flex; gap: .4rem; flex-wrap: wrap; }
.pill { border-radius: 999px; padding: .2rem .65rem; font-size: .8125rem; font-weight: 600; background: rgba(255,255,255,.12); color: #fff; }
main { padding-block: 1.25rem 3rem; display: grid; gap: 1rem; }
.hinweis { background: var(--karte); border: 1px dashed var(--linie); border-radius: .8rem; padding: .7rem .9rem; color: var(--grau); font-size: .875rem; margin: 0; }
.neu { background: var(--senf-hell); border: 1px solid var(--senf); border-radius: 1rem; padding: .9rem 1rem; display: grid; gap: .5rem; }
.neu h2 { font-size: 1.1rem; font-weight: 800; }
.neu dl { margin: 0; display: grid; gap: .45rem; }
.neu dt { font-weight: 700; }
.neu dd { margin: 0; font-size: .9rem; }
.karte { background: var(--karte); border-radius: 1rem; box-shadow: var(--schatten); padding: 1rem; display: grid; gap: .7rem; border-left: .35rem solid var(--linie); }
.karte[data-s="arbeit"] { border-left-color: var(--senf); }
.karte[data-s="fertig"] { border-left-color: var(--gruen); }
.karte header { display: flex; flex-wrap: wrap; gap: .35rem .7rem; align-items: baseline; }
.karte h2 { font-size: 1.15rem; font-weight: 800; }
.datei { font-family: var(--f-mono); font-size: .8125rem; background: var(--code); border: 1px solid var(--linie); border-radius: .4rem; padding: .1rem .4rem; overflow-wrap: anywhere; }
.prio { font-size: .6875rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; border-radius: 999px; padding: .1rem .5rem; }
.prio.muss { background: var(--senf); color: var(--senf-tinte); }
.prio.kann { background: var(--grund); color: var(--grau); border: 1px solid var(--linie); }
.zweck { margin: 0; color: var(--grau); font-size: .9rem; }
.anhang { margin: 0; font-size: .875rem; display: grid; gap: .25rem; }
.anhang b { font-weight: 700; }
.anhang ol { margin: 0; padding-left: 1.4rem; display: grid; gap: .15rem; }
.anhang code { font-family: var(--f-mono); font-size: .8125rem; overflow-wrap: anywhere; }
.anhang .rolle { color: var(--grau); }
.anhang a { color: var(--blau); font-weight: 600; }
.prompt { position: relative; }
.prompt pre { margin: 0; white-space: pre-wrap; word-break: break-word; font: 13px/1.5 var(--f-mono); background: var(--code); border: 1px solid var(--linie); border-radius: .6rem; padding: .7rem .8rem 2.9rem; max-height: 22rem; overflow: auto; }
.kopieren { position: absolute; right: .5rem; bottom: .5rem; font: 600 .875rem var(--f-text); min-height: 2.5rem; padding: .35rem .9rem; border-radius: 999px; border: 0; background: var(--nacht); color: #fff; cursor: pointer; }
.kopieren:focus-visible, .status button:focus-visible, textarea:focus-visible { outline: 3px solid var(--senf); outline-offset: 2px; }
.status { display: flex; flex-wrap: wrap; gap: .35rem; }
.status button { font: 600 .875rem var(--f-text); min-height: 2.75rem; padding: .4rem .9rem; border-radius: 999px; border: 1.5px solid var(--linie); background: var(--karte); color: var(--tinte); cursor: pointer; }
.status button[aria-pressed="true"][data-s="arbeit"] { background: var(--senf); border-color: var(--senf); color: var(--senf-tinte); }
.status button[aria-pressed="true"][data-s="fertig"] { background: var(--gruen); border-color: var(--gruen); color: var(--karte); }
.status button[aria-pressed="true"][data-s="offen"] { background: var(--grund); border-color: var(--grau); }
textarea { width: 100%; min-height: 2.75rem; resize: vertical; font: 14px/1.45 var(--f-text); color: var(--tinte); background: var(--papier); border: 1px solid var(--linie); border-radius: .6rem; padding: .5rem .7rem; }
.info { font-size: .75rem; color: var(--grau); min-height: 1rem; }
footer { color: var(--grau); font-size: .8125rem; padding-bottom: 2rem; }
</style></head><body>

<div class="kopf"><div class="wrap">
  <span class="eyebrow">Der verschwundene Mond · картинки v8.9 · промты переписаны 26.11.2026</span>
  <h1>Картинки для глав 1–4</h1>
  <p>Пока картинки нет, приложение показывает похожую готовую картинку, поэтому книга работает и без них. Порядок работы:</p>
  <ol>
    <li>Открой <b>новый</b> чат в ChatGPT — для каждой картинки отдельный.</li>
    <li>Приложи файлы из списка «Приложить» <b>в том же порядке</b> (1, 2, 3 …).</li>
    <li>Нажми «Копировать» и вставь промт.</li>
    <li>Сохрани результат как <code>assets/illustrationen/ИМЯ.webp</code> (или png, я сконвертирую) и пришли мне.</li>
    <li>Отметь здесь «Готово». Я вижу отметки и подключу картинки.</li>
  </ol>
  <div class="stand" id="stand" aria-live="polite"></div>
</div></div>

<main class="wrap" id="liste">
  <section class="neu" aria-labelledby="neu-t">
    <h2 id="neu-t">Что изменилось в промтах и почему</h2>
    <dl>__WARUM__</dl>
  </section>
  <p class="hinweis" id="ohneDb" hidden>Отметки сейчас сохраняются только в этом браузере (страница открыта без входа или хранилище недоступно).</p>
</main>
<div class="wrap"><footer>Источник промтов в репозитории: <code>02_design/bilder_prompts_v8_9.py</code> (оттуда же собирается эта страница и <code>BILDER_PROMPTS_v8_9.md</code>).</footer></div>

<script>
(() => {
  const BILDER = __BILDER__;

  const el = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };
  const STATUS = [['offen', 'Не начато'], ['arbeit', 'В работе'], ['fertig', 'Готово']];
  const zustand = {}, refs = {};
  let db = null;

  function zeichne() {
    const box = document.getElementById('liste');
    for (const b of BILDER) {
      const k = el('article', 'karte'); k.id = 'b-' + b.id;
      const h = el('header'); h.append(el('h2', null, b.spur), el('span', 'datei', b.datei), el('span', 'prio ' + b.prio, b.prio === 'muss' ? 'нужно' : 'по желанию'));
      const z = el('p', 'zweck', b.zweck);
      const a = el('div', 'anhang'); a.append(el('b', null, 'Приложить (по порядку):'));
      const ol = el('ol');
      for (const x of b.anhang) { const li = el('li'); li.append(el('code', null, x.datei), document.createTextNode(' '), el('span', 'rolle', '— ' + x.ru.replace(/^[^—]*— /, ''))); if (x.link) { const l = el('a', null, 'скачать'); l.href = x.link; l.download = x.link; li.append(document.createTextNode(' · '), l); } ol.append(li); }
      a.append(ol);
      const pr = el('div', 'prompt'); const pre = el('pre', null, b.text); pre.lang = 'en'; pre.id = 'p-' + b.id;
      const kb = el('button', 'kopieren', 'Копировать'); kb.type = 'button';
      kb.addEventListener('click', () => {
        const fertig = () => { kb.textContent = 'Скопировано'; setTimeout(() => { kb.textContent = 'Копировать'; }, 1600); };
        const markiere = () => { const r = document.createRange(); r.selectNodeContents(pre); const s = getSelection(); s.removeAllRanges(); s.addRange(r); kb.textContent = 'Выделено — нажми Ctrl+C'; };
        try { navigator.clipboard.writeText(pre.textContent).then(fertig, markiere); } catch { markiere(); }
      });
      pr.append(pre, kb);
      const st = el('div', 'status'); st.setAttribute('role', 'group'); st.setAttribute('aria-label', 'Статус картинки');
      const knoepfe = STATUS.map(([w, t]) => { const x = el('button', null, t); x.type = 'button'; x.dataset.s = w; x.setAttribute('aria-pressed', 'false'); x.addEventListener('click', () => speichere(b.id, { s: w })); st.append(x); return x; });
      const ta = el('textarea'); ta.id = 'n-' + b.id; ta.placeholder = 'Заметка (например: что не вышло)'; ta.setAttribute('aria-label', 'Заметка');
      let t = 0; ta.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => speichere(b.id, { notiz: ta.value }), 900); });
      const info = el('div', 'info'); info.setAttribute('aria-live', 'polite');
      k.append(h, z, a, pr, st, ta, info); box.append(k);
      refs[b.id] = { k, knoepfe, ta, info };
    }
  }
  function zeige(id) {
    const r = refs[id], s = zustand[id] ?? {};
    r.knoepfe.forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.s === (s.s || 'offen'))));
    r.k.dataset.s = s.s || 'offen';
    if (document.activeElement !== r.ta && (s.notiz ?? '') !== r.ta.value) r.ta.value = s.notiz ?? '';
  }
  function zaehle() {
    const f = BILDER.filter((b) => zustand[b.id]?.s === 'fertig').length;
    const box = document.getElementById('stand'); box.textContent = '';
    box.append(el('span', 'pill', `Готово: ${f} из ${BILDER.length}`));
  }
  async function speichere(id, teil) {
    zustand[id] = { ...(zustand[id] ?? {}), ...teil }; zeige(id); zaehle();
    const info = refs[id].info;
    if (!db) { try { localStorage.setItem('bilder.' + id, JSON.stringify(zustand[id])); } catch {} info.textContent = 'Сохранено только в этом браузере'; return; }
    try { info.textContent = 'Сохраняю…'; await db.collection('bilder').doc(id).set({ s: zustand[id].s ?? 'offen', notiz: zustand[id].notiz ?? '', zeit: new Date().toISOString() }); info.textContent = 'Сохранено'; }
    catch (e) { info.textContent = 'Не сохранилось: ' + (e?.message || e?.code || 'ошибка') + '. Попробуй ещё раз.'; }
  }
  zeichne(); BILDER.forEach((b) => zeige(b.id)); zaehle();
  (async () => {
    try { db = window.claude?.use ? await window.claude.use('db') : null; } catch { db = null; }
    const h = document.getElementById('ohneDb');
    if (!db) { h.hidden = false; for (const b of BILDER) { try { const v = localStorage.getItem('bilder.' + b.id); if (v) { zustand[b.id] = JSON.parse(v); zeige(b.id); } } catch {} } zaehle(); return; }
    const timer = setTimeout(() => { h.hidden = false; }, 10000);
    db.collection('bilder').onSnapshot((snap) => {
      clearTimeout(timer); h.hidden = true;
      for (const d of snap.docs) { if (!refs[d.id]) continue; const v = d.data(); zustand[d.id] = { s: v?.s || 'offen', notiz: v?.notiz || '' }; zeige(d.id); }
      zaehle();
    }, () => { clearTimeout(timer); h.hidden = false; });
  })();
})();
</script>
</body></html>"""


def markdown():
    z = ["# Промты для картинок v8.9 (переписаны 26.11.2026)", "",
         "Источник: `02_design/bilder_prompts_v8_9.py`. Рабочая страница: артефакт «Neue Bilder D-19».", "",
         "## Что изменилось и почему", ""]
    z += [f"- **{t}.** {x}" for t, x in WARUM]
    for b in BILDER:
        z += ["", f"## {b['datei']} — {b['spur']}", "", b["zweck"], "", "**Приложить по порядку:**", ""]
        z += [f"{i}. `{a['datei']}` — {a['ru']}" for i, a in enumerate(b["anhang"], 1)]
        z += ["", "```text", b["text"], "```"]
    return "\n".join(z) + "\n"


if __name__ == "__main__":
    root = pathlib.Path(__file__).parent
    warum = "".join(f"<div><dt>{html.escape(t)}</dt><dd>{html.escape(x)}</dd></div>" for t, x in WARUM)
    daten = json.dumps(BILDER, ensure_ascii=False, indent=1).replace("</", "<\\/")
    (root / "BILDER_PROMPTS_v8_9.html").write_text(SEITE.replace("__WARUM__", warum).replace("__BILDER__", daten), encoding="utf-8")
    (root / "BILDER_PROMPTS_v8_9.md").write_text(markdown(), encoding="utf-8")
    print(len(BILDER), "Prompts ->", root / "BILDER_PROMPTS_v8_9.html")
