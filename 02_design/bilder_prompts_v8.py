"""Промты для НОВЫХ картинок версии v8 (главы 1–4).
Запуск: python3 02_design/bilder_prompts_v8.py
  -> 02_design/BILDER_PROMPTS_v8.html (страница с кнопками «Скопировать»)
  -> 02_design/bilder_prompts_v8.json
Имена файлов совпадают с тем, что ждёт приложение (app/src/v8, данные 04_data/kapitelN_v8_raetsel.json).
"""
import json, pathlib, html, sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from bilder_prompts import HEAD, HEAD_SHEET, GLOW, CALM  # общие правила стиля

ATT = {
    "IN": "2 листа гусенички + лист детей (kinder_figurenblatt) + k1_s1 (комната)",
    "OUT": "лист детей + k4_s19 (окно и ветка дерева снаружи)",
    "CH": "лист детей (kinder_figurenblatt)",
    "OBJ": "objekte_1_mond + objekte_3_basteln (стиль предметов)",
    "BIRD": "лист гусенички (только для стиля)",
    "EDIT": "сама картинка k1_s1 (редактировать её)",
    "RAUPE": "2 листа гусенички (внешность должна совпадать точь-в-точь)",
    "SAFE": "ничего (или старую mondtresor_zu как образец стиля)",
}
PAINT = " Soft hand-painted picture-book look (watercolor and colored pencil) like the attached images – NOT flat vector clip-art, no glossy 3D look."
SHEET = HEAD_SHEET + PAINT
SHEET_STARS_OK = SHEET.replace("no stars", "no stars except where the description asks for one")
BIRDS_HEAD = SHEET.replace("Plain warm white background", "Plain flat LIGHT-BLUE background (#CFE6F5), one even color, no gradient, no vignette")
BLUE = HEAD_SHEET.replace("Plain warm white background", "Plain deep twilight-blue background")

P = []


def add(ch, name, att, body, *, note="", head=SHEET, size="", glow=None, where=""):
    parts = [head]
    if glow is not None:
        parts.append(GLOW if glow else CALM)
    parts.append(" ".join(body.split()))
    P.append(dict(ch=ch, name=name, att=ATT[att], note=note, size=size, where=where, text="\n".join(x for x in parts if x)))


# ---------------------------------------------------------------- Глава 1
C1 = "Глава 1 · правка"
add(C1, "k1_s1", "EDIT", """
Edit the attached picture, keep everything else exactly as it is (same children, same room, same light, same style).
Only add ONE more child in the background, a bit behind and to the side of the others: a girl with a light-brown ponytail,
wearing a RED-AND-WHITE horizontally striped sweater WITHOUT a hood and WITH three round white buttons at the neck,
busy with paper at the table. Her stripes must look like Oskar's stripes, so that only the buttons and the missing hood tell them apart.""",
    head="", size="как оригинал (3:2)", where="Spur 1 — первая картинка книги",
    note="Это Ида. Нужна, чтобы в финале главы Оскара нельзя было угадать заранее: решают пуговицы и капюшон.")

# ---------------------------------------------------------------- Дети
CK = "Дети (для глав 2–4)"
KIDS = [
    ("lina", "a girl with straight BLACK hair in a short bob with a blue hairband (NOT braids), sweater with BLUE-and-white horizontal stripes and a hood"),
    ("tom", "a boy with short straight BLACK hair and freckles (NOT blond, NOT curly), plain RED sweater with a hood, no stripes"),
    ("ida", "a girl with a light-brown ponytail, RED-and-white horizontal stripes, NO hood, three white buttons at the neck"),
    ("emil", "a boy with straight light-brown hair in a bowl cut and round glasses (NOT curly), RED sweater with white polka dots and a hood"),
    ("nele", "a girl with a short red bob, RED-and-white VERTICAL stripes and a hood"),
]
for n, d in KIDS:
    add(CK, f"kinder/{n}", "CH", f"""
One child, full body, standing, friendly face, front view, about 8 years old, same drawing style and proportions as the attached children:
{d}. Dark trousers, sneakers. Nothing in the hands.""",
        size="портрет 2:3, светлый фон (вырежу сама)", where="ложные следы в главах 2–4, ряд подозреваемых",
        note="Цвет и узор свитера должны совпасть точно — по ним идёт загадка про рукав." if n != "tom" else "")

# ---------------------------------------------------------------- Глава 2
C2 = "Глава 2"
add(C2, "objekte/fuchs_puppe", "OBJ", "A finished hand puppet: an orange fox with a white chest, made of felt. Lying flat, seen from above.",
    size="1:1", where="Spur 7 — «два ящика»: готовое для театра")
add(C2, "objekte/koenig_puppe", "OBJ", "A finished hand puppet: a friendly king with a small golden cardboard crown and a red felt coat. Lying flat, seen from above.",
    size="1:1", where="Spur 7 — «два ящика»: готовое для театра")
add(C2, "objekte/pappbaum", "OBJ", "A finished theater prop: a flat cardboard tree, painted green and brown, with a small wooden stand at the bottom.",
    size="1:1", where="Spur 7 — «два ящика»: готовое для театра")
add(C2, "objekte/papierstapel", "OBJ", "A loose stack of colored craft paper sheets (red, blue, yellow, green), slightly fanned out, a few paper strips on top.",
    size="1:1", where="Spur 7 — «два ящика»: бумага для всех")
add(C2, "objekte/mond_hinten_feucht", "OBJ", """
The flat round cardboard moon (a THIN flat cardboard disc, NOT a ball, no 3D shine) lying WHITE SIDE UP, seen exactly from above. On the white side a small hand-painted BLUE star near the edge.
At the top edge the long white thread is clearly visible, neatly COILED into a flat spiral about a quarter of the disc wide, on the white side and held by a fresh, wet, shiny drop of white craft glue
(glossy highlight so it clearly looks wet). Only a short thread end sticks out over the edge.""",
    head=SHEET_STARS_OK, size="1:1", where="Spur 8 — как лежала Луна и почему",
    note="Нитка свёрнута колечком — так в главе 3 из-под «сыра» виден только кончик (замечание ревью).")
add(C2, "objekte/mond_hinten_faden", "OBJ", """
The same THIN flat cardboard disc (NOT a ball) lying WHITE SIDE UP, seen exactly from above, small hand-painted BLUE star near the edge.
At the top edge the long white thread is clearly visible, neatly COILED into a flat spiral about a quarter of the disc wide and glued down, the glue is DRY (no shine).
Only a short thread end sticks out over the edge.""",
    head=SHEET_STARS_OK, size="1:1", where="Spur 16 и доска: оборот Луны после ремонта Бена",
    note="Отличается от предыдущей только тем, что клей сухой (без блеска).")
for n, d in [
    ("raetsel_kaese", "a round flat wheel of yellow Swiss cheese, seen slightly from above, MATTE surface like real cheese (NOT glossy, NOT plastic, NOT jelly), a clean cylinder shape with a flat top, with 6-8 clearly visible round holes of different sizes on top and on the side"),
    ("raetsel_keks", "a big round chocolate-chip cookie, golden-yellow with dark chocolate dots"),
    ("raetsel_sonne", "a yellow paper sun with short rays, cut from cardboard"),
    ("raetsel_ball", "a classic football (soccer ball), drawn simply and cleanly like in a children's picture book: a perfectly round white ball with a REGULAR pattern of black pentagons, soft shading, no distorted or broken patches"),
    ("raetsel_zitrone", "a single bright yellow lemon"),
    ("raetsel_schwamm", "a yellow sponge, a rectangular block with rounded corners, soft and porous, with MANY clearly visible dark round HOLES of different sizes all over its surface (holes like in Swiss cheese, not tiny dots or bubbles)"),
]:
    add(C2, f"objekte/{n}", "OBJ", f"One object, centered, slightly from above: {d}.",
        size="1:1", where="Spur 12 — загадка Оскара «жёлтое, круглое, с дырками, для мыши»",
        note="Шесть картинок одного размера и ракурса, как карточки." if n == "raetsel_kaese" else "")

# ---------------------------------------------------------------- Глава 3
C3 = "Глава 3"
add(C3, "voegel", "BIRD", """
Five birds in a row, each sitting on a short twig, side view, the same size, with lots of space between them:
1) a magpie: black and white, white belly, white patch on the wing, very long black tail;
2) a white wagtail: small and slim, black-white-grey, long thin tail that it holds up;
3) a great spotted woodpecker: black and white with a red patch under the tail;
4) a blackbird: all black with a yellow-orange beak;
5) a great tit: yellow belly, black head with white cheeks.""",
    head=BIRDS_HEAD, size="5:1 или 3:1, белый фон (разрежу на 5)", where="Spur 14 «чья тень» и Spur 23 «какая птица?»",
    note="Три чёрно-белые птицы специально: ребёнок должен различать по длинному хвосту и белому пятну на крыле.")
add(C3, "gelbe_kreise_vorne", "OBJ", """
Five flat round yellow cardboard circles seen from the front on a plain light-brown wooden table, same size, in two rows:
THREE circles in the top row and TWO circles in the bottom row, the bottom two sitting centered between the top ones.
There must be a clear empty gap below every circle (about half a circle high) for a button. Landscape, aspect about 23:20.
They differ only a little: 1) lemon yellow, 2) golden yellow, 3) yellow with a slightly torn edge, 4) warm yellow, smooth edge, 5) pale yellow.
Each circle has exactly three round brown spots (one on top, two below). No faces, no drawings, no holes.""",
    size="23:20 (чуть выше, чем 1:1), светлый деревянный фон", where="Spur 16 — ключевой момент 2: какой круг Луна Милы (3 сверху, 2 снизу, под каждым круг свободное место)",
    note="Порядок и положение кругов в обоих листах одинаковые: 1–3 в верхнем ряду слева направо, 4–5 внизу. Приложение кладёт заднюю сторону на ту же позицию.")
add(C3, "gelbe_kreise_hinten", "OBJ", """
The BACKS of the same five flat round cardboard circles, same table, same positions and size as the front picture
(three in the top row, two in the bottom row, gaps below each). Every back is white with a thin golden edge:
1) a small blue star painted near the lower edge, nothing else (no hole, no thread);
2) a white thread lying loose and knotted over the top edge, hanging down outside the circle, no star, no hole;
3) a small round punched hole near the top edge (the table shows through it) AND a small red heart painted near the lower edge;
4) a small blue star near the lower edge AND a small punched hole near the top edge AND a white thread neatly coiled into a flat spiral and glued down next to the hole (dry glue, no shine);
5) only a small round punched hole near the top edge, nothing else.""",
    head=SHEET_STARS_OK, size="23:20, тот же формат, что и «vorne»", where="Spur 16 — оборотная сторона (одновременно виден только один круг)",
    note="Правильный круг — №4 (внизу слева): звезда + аккуратная спираль нитки + дырочка. Звезда есть на №1 и №4, нитка — на №2 (висит, узел) и №4 (свёрнута), дырочка — на №3, №4 и №5. У каждого круга есть хотя бы один верный признак.")
add(C3, "plakat", "IN", """
A colorful hand-painted poster for the children's new puppet play, PORTRAIT 3:4, pinned with four push pins:
in the middle the puppet stage, on it the little grey paper mouse jumps happily towards a round yellow 'cheese' (the cardboard moon with three brown dots);
around it a border of small painted leaves. Absolutely no letters or words.""",
    size="портрет 3:4", where="Spur 18 — собрать афишу из кусочков (режу программно)")

# ---------------------------------------------------------------- Глава 4
C4 = "Глава 4"
add(C4, "baum", "OUT", """
The thick tree right outside the classroom window, seen from the window, LANDSCAPE 3:2. No bird, no nest, no moon, no paper.
The tree has FIVE clearly different forks (places where a branch splits), well separated:
1) low, near the trunk, with a small wooden birdhouse;
2) left, with a swing rope tied around the branch;
3) right under the window sill, close to the glass, the branches here are thin and V-shaped;
4) high up near the top, with a few dry brown leaves;
5) far right, on a branch with a big round knot hole.
Leaves are green and fresh, a calm sunny day.""",
    head=HEAD, size="3:2", where="Spur 19 — ключевой момент 3: где висит Луна (по описанию из текста)",
    note="Правильная развилка — №3 (под окном, тонкие ветки буквой V). Остальные — ловушки. В приложении зоны касания невидимые, в процентах ширины картинки (04_data/kapitel4_v8_raetsel.json, Spur 19, gabeln: x, y, r; Spur 24: ziele/zone): Gabel 1 (30, 72), 2 (14.4, 45), 3 (73.9, 40.8), 4 (45, 14.2), 5 (90, 65.8), Radius 11. Ошибочная подсказка в поле nicht (что висит на ветке: домик, качели, сухие листья, дупло). Новая картинка подходит без правки кода, если развилки лежат примерно там; иначе поправить числа.")
add(C4, "objekte/kinder_hinten", "CH", """
Three children seen from BEHIND, standing in a row in front of a classroom wall, full body, friendly cartoon style, LANDSCAPE 3:2, a bit of space between them:
a girl with two brown braids, each braid tied with a tiny PINK ribbon, lilac cardigan (Mila);
a boy with dark curly hair and a BLUE sweater (Ben), sneakers with thin PINK shoelaces;
a boy with tousled BLOND hair in a RED-AND-WHITE striped hooded sweater (Oskar), and from his hood hangs a very thin, long PINK mouse tail.
The pink details are small, the tail must be easy to miss without a magnifier.""",
    head=HEAD, size="3:2", where="Spur 20 — лупа: найти розовый хвост мыши среди розовых отвлекающих деталей",
    note="Три розовых детали: бантики (Мила), шнурки (Бен) и хвост из капюшона Оскара — только хвост настоящий.")
add(C4, "objekte/raum_leer", "IN", """
The empty classroom group room, LANDSCAPE 3:2, seen straight on: a cream wall with a green blackboard on the left, a small window on the right,
a wooden rail on the wall on the left, a wooden floor with planks. No furniture, no people, no objects.""",
    head=HEAD, size="3:2", where="Spur 21 — фон для «найди, что изменилось» (предметы кладу поверх программно)")
add(C4, "baum_nest", "OUT", """
The same tree and the same view as the previous picture. Now in fork number 3 (right under the window sill, thin V-shaped branches)
sits a small nest woven from WHITE PAPER STRIPS. A white ribbon hangs from it and on the ribbon a small brass key glints in the sun.
The magpie is NOT there. Everything else unchanged.""",
    head=HEAD, size="3:2", where="Spur 24 — раздвинуть листья и найти гнездо (листья рисую программно сверху)")
add(C4, "nest_finale", "IN", """
Happy final scene at the open classroom window: Mila, Ben, Oskar and Frau Sommer lean out and look down into the nest of white paper strips in the fork of the tree.
Frau Sommer carefully takes out the white ribbon with her small brass key; next to the nest she lays a fresh white paper strip as a present for the bird.
On the windowsill the caterpillar smiles, holding her dewdrop magnifier. Warm afternoon light, everyone relieved and happy.""",
    head=HEAD, size="3:2", glow=False, where="последняя сцена: всё нашлось, все счастливы")

# ---------------------------------------------------------------- Сейф
CT = "Сейф (финал)"
add(CT, "tresor_zu", "SAFE", """
A small magical treasure safe for a children's game, square 1:1: a sturdy dark-blue safe with rounded corners and little golden rivets,
a golden wheel handle in the middle, and below it a row of exactly FOUR empty letter windows (empty, no letters). Cozy and magical, not technical.
No moon on it.""", head=BLUE, size="1:1", where="вступление, доска, финал",
    note="Сейчас в приложении нарисованный сейф. Если эта картинка понравится больше — заменю.")
add(CT, "tresor_auf", "SAFE", """
The same safe, now open: the door swings open, warm golden light streams out; inside an empty glowing niche (a picture will be placed there later). Square 1:1.""",
    head=BLUE, size="1:1", where="финал: сейф открывается кодом NEST")

# ---------------------------------------------------------------- Vier Kräfte der Lese-Raupe (Medaillons)
CK = "Силы гусенички (4 медальона)"
KRAFT_RAHMEN = ("A round medallion, centered, filling about 85% of the picture: a circular picture with a thin golden rim, inside a deep night-blue "
                "background with a few tiny soft sparkles. In the medallion, a close-up (head and upper body) of the SAME little green caterpillar "
                "as on the attached sheets – same face, same colours, same small blue cape. No text, no letters, no numbers. "
                "Outside the medallion only the plain background. All four medallions of this set must have the same size, rim and style. ")
for n, d, wo in [
    ("kraft_fuehler", "Her two antennae glow brightly: the little balls at the tips shine warm golden like tiny lanterns and cast a soft golden light, "
                      "a few golden sparks float around them. She looks up at them, amazed and proud.", "Leucht-Fühler"),
    ("kraft_lupe", "She holds up her magnifying glass made of nature: a big clear round DEWDROP sitting on a small green grass stalk as handle. "
                   "She looks through the dewdrop with one eye, and that eye appears much bigger through the drop. The drop glitters.", "Tautropfen-Lupe"),
    ("kraft_zeit", "She looks very slowly and carefully: both eyes wide open and focused, head slightly tilted, one little hand at her chin. "
                   "Next to her a tiny friendly snail on a leaf and one single leaf falling very slowly, hanging in the air – everything feels calm and slow.", "Zeitlupen-Blick"),
    ("kraft_lesen", "She reads an open little book that she holds in front of her, wearing small round golden reading glasses, smiling, "
                    "fully absorbed. A soft warm light shines from the pages onto her face.", "Lese-Blick"),
]:
    add(CK, f"objekte/{n}", "RAUPE", KRAFT_RAHMEN + d, size="1:1",
        where=f"Вступление, значок перед каждой загадкой и финал — сила «{wo}»",
        note="Все четыре лучше генерировать в одном чате подряд, чтобы рамка и стиль совпали." if n == "kraft_fuehler" else "")

# ---------------------------------------------------------------- Sechs Pullis (Spur 6)
CP = "Свитера для загадки «Чей рукав?» (6 штук)"
PULLI_RAHMEN = ("One single children's garment, laid flat, seen straight from the front, centered, BOTH sleeves spread out to the sides "
                "so that each sleeve is fully and clearly visible. Soft knitted fabric. No child, no hanger, no other objects, no text. "
                "All six garments of this set have exactly the same size, pose and viewing angle – only pattern and details differ. ")
for n, d in [
    ("pulli_oskar", "A hoodie with a hood. Body and sleeves have bold RED and WHITE HORIZONTAL stripes; on the sleeves the stripes run AROUND the arm like rings. No buttons anywhere."),
    ("pulli_lina", "A hoodie with a hood. Body and sleeves have bold dark BLUE and WHITE HORIZONTAL stripes; on the sleeves the stripes run around the arm like rings. No buttons. No red at all."),
    ("pulli_tom", "A hoodie with a hood, completely plain RED, one single colour. No stripes, no dots, no pattern, no buttons."),
    ("pulli_emil", "A hoodie with a hood, RED with many round WHITE polka DOTS on body and sleeves. No stripes, no buttons."),
    ("pulli_nele", "A hoodie with a hood. Bold RED and WHITE VERTICAL stripes: on the body they run from top to bottom, and on the sleeves they run ALONG the arm from shoulder to cuff (lengthwise, NOT as rings). No buttons."),
    ("pulli_ida", "A cardigan WITHOUT a hood, with a small round collar. Bold RED and WHITE HORIZONTAL stripes; on the sleeves the stripes run around the arm like rings. A row of big dark-blue BUTTONS down the front, and TWO big dark-blue buttons clearly visible on EACH sleeve cuff."),
]:
    add(CP, f"objekte/{n}", "OBJ", PULLI_RAHMEN + d, head=BIRDS_HEAD, size="1:1",
        where="Spur 6 — загадка «Wessen Ärmel war es?»",
        note="Фон ровный голубой, чтобы белые полоски не пропали при вырезании. Все шесть — в одном чате подряд. Важно: у Неле полоски вдоль рукава, у Иды пуговицы на манжетах." if n == "pulli_oskar" else "")

# ---------------------------------------------------------------- Stand der Bilder
# Fertig und im Repo (assets/illustrationen/...): erscheinen nicht mehr auf der Seite.
FERTIG = {"objekte/raetsel_ball", "objekte/raetsel_schwamm", "kinder/ida", "kinder/nele", "objekte/fuchs_puppe", "objekte/koenig_puppe", "objekte/pappbaum", "objekte/papierstapel",
          "objekte/raetsel_keks", "objekte/raetsel_sonne", "objekte/raetsel_zitrone",
          "plakat", "baum", "baum_nest", "nest_finale", "tresor_zu", "tresor_auf",
          "k1_s1", "kinder/lina", "kinder/tom", "kinder/emil", "objekte/mond_hinten_feucht", "objekte/mond_hinten_faden",
          "voegel", "gelbe_kreise_vorne", "gelbe_kreise_hinten", "objekte/kinder_hinten", "objekte/raum_leer"}
# Geliefert, aber nicht passend: Grund steht auf der Karte.
NOCHMAL = {
    "objekte/raetsel_kaese": "Сыр выглядит как глянцевое желе. Нужен матовый круглый сыр с ровным верхом и чёткими дырками.",
    "objekte/raetsel_ball": "Мяч нарисован криво: пятна разной формы, выглядит сломанным. Нужен простой аккуратный мяч с ровным узором.",
    "objekte/raetsel_schwamm": "На губке не видно дырок (только мелкие пузырьки), а подсказка в загадке — «с дырками». Нужны крупные тёмные круглые дырки.",
    "k1_s1": "Пришла новая сцена вместо правки: Луна уже с коричневыми пятнами (спойлер Главы 3), Оскар в классе, а не во дворе. Нужно РЕДАКТИРОВАТЬ старую k1_s1: приложить её и попросить только дорисовать Иду сзади, всё остальное не трогать.",
    "kinder/lina": "Свитер верный, но каштановые косички — как у Милы. Нужна другая причёска (уже в промте).",
    "kinder/tom": "Свитер верный, но золотые кудри — как у Оскара. Нужны короткие чёрные прямые волосы (уже в промте).",
    "kinder/emil": "Свитер верный, но тёмные кудри — как у Бена. Нужна прямая светло-русая стрижка (уже в промте).",
    "objekte/mond_hinten_feucht": "Получился глянцевый шар, а не плоский картон; нитка — точка, спирали и мокрого клея не видно.",
    "objekte/mond_hinten_faden": "Тот же шар; свёрнутой нитки не видно, а это главная примета.",
    "voegel": "Рисунок хороший, но фон белый с пятном: белое брюхо сороки не вырезается. Нужен ровный ГОЛУБОЙ фон и акварельный стиль.",
    "gelbe_kreise_vorne": "На кругах нет коричневых пятен (по сюжету это пять «сыров»), и формат другой: нужно 3 сверху и 2 снизу на деревянном столе.",
    "gelbe_kreise_hinten": "Сделано по старому описанию. Загадка изменилась: у каждого круга хотя бы одна верная примета (см. новый промт), расположение 3 + 2, как у лицевых.",
}
P = [p for p in P if p["name"] not in FERTIG]
for p in P:
    if p["name"] in NOCHMAL:
        p["redo"] = NOCHMAL[p["name"]]
P.sort(key=lambda p: 0 if p.get("redo") else 1)
for p in P:
    p["ch"] = ("Переделать · " if p.get("redo") else "Ещё нет · ") + p["ch"]

# ---------------------------------------------------------------- HTML
GRUPPEN = []
for p in P:
    if not GRUPPEN or GRUPPEN[-1][0] != p["ch"]:
        GRUPPEN.append((p["ch"], []))
    GRUPPEN[-1][1].append(p)


def karte(i, p):
    e = html.escape
    meta = []
    if p["where"]:
        meta.append(f"<dt>Где</dt><dd>{e(p['where'])}</dd>")
    meta.append(f"<dt>Приложить</dt><dd>{e(p['att'])}</dd>")
    if p["size"]:
        meta.append(f"<dt>Формат</dt><dd>{e(p['size'])}</dd>")
    note = f'<p class="note">{e(p["note"])}</p>' if p["note"] else ""
    if p.get("redo"):
        note = f'<p class="redo"><b>Почему переделать:</b> {e(p["redo"])}</p>' + note
    return f"""<article class="card" id="p{i}">
  <header><span class="nr">{i}</span><code class="fn">{e(p['name'])}.webp</code>
  <label class="done"><input type="checkbox" data-k="{e(p['name'])}"> готово</label></header>
  <dl>{''.join(meta)}</dl>{note}
  <pre>{e(p['text'])}</pre>
  <button class="copy" type="button">Скопировать промт</button>
</article>"""


def seite():
    n, body = 0, []
    nav = []
    for ch, ps in GRUPPEN:
        cards = []
        for p in ps:
            n += 1
            cards.append(karte(n, p))
        gid = f"g{len(nav)}"
        nav.append(f'<a href="#{gid}">{html.escape(ch)} <small>{len(ps)}</small></a>')
        body.append(f'<section><h2 id="{gid}">{html.escape(ch)}</h2>{"".join(cards)}</section>')
    return f"""<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Картинки v8</title>
<style>
:root {{ --bg:#F6F1E6; --card:#FFFDF8; --ink:#26221C; --muted:#6B6355; --line:#E3D9C4; --accent:#2B4DA8; --gold:#E9B533; --pre:#F3EDE0; }}
@media (prefers-color-scheme: dark) {{ :root:not([data-theme="light"]) {{ --bg:#141A2E; --card:#1D2540; --ink:#EEF1FA; --muted:#A9B2CC; --line:#2E3858; --accent:#8FB0FF; --gold:#F4C243; --pre:#151C33; }} }}
:root[data-theme="dark"] {{ --bg:#141A2E; --card:#1D2540; --ink:#EEF1FA; --muted:#A9B2CC; --line:#2E3858; --accent:#8FB0FF; --gold:#F4C243; --pre:#151C33; }}
* {{ box-sizing:border-box; }}
body {{ margin:0; background:var(--bg); color:var(--ink); font:16px/1.5 system-ui, -apple-system, "Segoe UI", sans-serif; }}
main {{ max-width:860px; margin:0 auto; padding:24px 16px 64px; }}
h1 {{ font-size:28px; margin:0 0 6px; }}
.lead {{ color:var(--muted); margin:0 0 16px; }}
.rules {{ background:var(--card); border:1px solid var(--line); border-radius:14px; padding:12px 16px; margin:0 0 16px; }}
.rules li {{ margin:4px 0; }}
nav {{ display:flex; flex-wrap:wrap; gap:8px; margin:0 0 8px; position:sticky; top:0; background:var(--bg); padding:8px 0; z-index:2; }}
nav a {{ text-decoration:none; color:var(--ink); border:1px solid var(--line); background:var(--card); padding:6px 12px; border-radius:999px; font-weight:600; font-size:14px; }}
nav small {{ color:var(--muted); }}
@media (max-width: 600px) {{ nav {{ position:static; }} }}
#stand {{ font-weight:700; color:var(--accent); align-self:center; margin-left:auto; font-size:14px; }}
h2 {{ font-size:20px; margin:28px 0 10px; scroll-margin-top:60px; }}
.card {{ background:var(--card); border:1px solid var(--line); border-radius:16px; padding:14px 16px; margin:0 0 14px; }}
.card.ok {{ opacity:.55; }}
.card header {{ display:flex; align-items:center; gap:10px; flex-wrap:wrap; }}
.nr {{ background:var(--gold); color:#26221C; font-weight:800; border-radius:8px; min-width:28px; text-align:center; padding:2px 6px; }}
.fn {{ font-size:16px; font-weight:700; color:var(--accent); word-break:break-all; }}
.done {{ margin-left:auto; font-size:14px; color:var(--muted); display:flex; gap:6px; align-items:center; cursor:pointer; }}
dl {{ display:grid; grid-template-columns:max-content 1fr; gap:2px 12px; margin:10px 0 6px; font-size:14px; }}
dt {{ color:var(--muted); }} dd {{ margin:0; }}
.note {{ margin:6px 0; font-size:14px; border-left:3px solid var(--gold); padding-left:10px; }}
pre {{ white-space:pre-wrap; word-break:break-word; background:var(--pre); border-radius:10px; padding:10px 12px; font:13px/1.5 ui-monospace, Menlo, Consolas, monospace; margin:8px 0; max-height:260px; overflow:auto; }}
.copy {{ font:inherit; font-weight:700; border:0; border-radius:10px; padding:10px 16px; background:var(--accent); color:#fff; cursor:pointer; min-height:44px; }}
.copy.ok {{ background:#2E8B57; }}
.redo {{ margin:8px 0; font-size:14px; background:#FDECEA; color:#7A2318; border-radius:10px; padding:8px 12px; }}
@media (prefers-color-scheme: dark) {{ :root:not([data-theme="light"]) .redo {{ background:#3A1F24; color:#FFC9C0; }} }}
:root[data-theme="dark"] .redo {{ background:#3A1F24; color:#FFC9C0; }}
</style></head><body><main>
<h1>Картинки v8: что ещё нужно</h1>
<p class="lead">Осталось {len(P)}: {sum(1 for p in P if p.get("redo"))} переделать и {sum(1 for p in P if not p.get("redo"))} ещё не было. Готовые {29 - len(P)} уже в приложении и отсюда убраны. Нажмите «Скопировать промт», вставьте в генератор, приложите указанные эталоны из <code>assets/reference/</code> и <code>assets/illustrationen/</code>. Сохраните под именем из заголовка карточки и пришлите — разложу и вставлю в приложение.</p>
<ul class="rules">
<li>Сначала карточки с красной плашкой «Почему переделать»: там сказано, что было не так.</li>
<li><b>Стиль:</b> как остальные картинки книги — мягкая акварель и карандаш. Не плоская векторная графика и не глянцевое 3D.</li>\n<li>На предметах и детях фон светлый и ровный — вырезаю сама. У птиц фон ровный голубой: у сороки белое брюхо, на белом фоне его не вырезать.</li>
<li>Нигде нет букв и цифр. Галочка «готово» запоминается только в этом браузере.</li>
</ul>
<nav>{''.join(nav)}<span id="stand"></span></nav>
{''.join(body)}
</main>
<script>
const KEY = 'lesefall.bilder.v8';
let st = {{}}; try {{ st = JSON.parse(localStorage.getItem(KEY) || '{{}}'); }} catch (e) {{}}
const save = () => {{ try {{ localStorage.setItem(KEY, JSON.stringify(st)); }} catch (e) {{}} }};
const upd = () => {{ const all = document.querySelectorAll('.done input'); let n = 0; all.forEach((c) => {{ c.checked = !!st[c.dataset.k]; c.closest('.card').classList.toggle('ok', c.checked); if (c.checked) n++; }}); document.getElementById('stand').textContent = n + ' / ' + all.length + ' готово'; }};
document.addEventListener('change', (e) => {{ const c = e.target.closest('.done input'); if (!c) return; st[c.dataset.k] = c.checked; save(); upd(); }});
document.addEventListener('click', async (e) => {{
  const b = e.target.closest('.copy'); if (!b) return;
  const t = b.parentElement.querySelector('pre').textContent;
  try {{ await navigator.clipboard.writeText(t); }} catch (err) {{ const a = document.createElement('textarea'); a.value = t; document.body.appendChild(a); a.select(); try {{ document.execCommand('copy'); }} catch (x) {{}} a.remove(); }}
  b.textContent = 'Скопировано ✓'; b.classList.add('ok'); setTimeout(() => {{ b.textContent = 'Скопировать промт'; b.classList.remove('ok'); }}, 1600);
}});
upd();
</script></body></html>"""


if __name__ == "__main__":
    root = pathlib.Path(__file__).parent
    (root / "BILDER_PROMPTS_v8.html").write_text(seite(), encoding="utf-8")
    (root / "bilder_prompts_v8.json").write_text(json.dumps(P, ensure_ascii=False, indent=1), encoding="utf-8")
    print(len(P), "Prompts ->", root / "BILDER_PROMPTS_v8.html")
