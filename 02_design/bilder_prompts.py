"""Единый источник промтов для всех картинок книги.
Запуск: python3 02_design/bilder_prompts.py  -> пишет 02_design/BILDER_PROMPTS.md
(страницу с кнопками копирования собирает тот же список).
"""
import json, pathlib, html

HEAD = ("Use the attached images as the exact reference for characters, places and style. "
        "Children's picture-book illustration in exactly the same style, landscape 3:2. "
        "No text, no letters, no numbers, no stars anywhere. Mila has no backpack. "
        "The moon is always a FULL ROUND flat cardboard disc (never a crescent): yellow on the front, white on the back.")
HEAD_SHEET = ("Use the attached images as the exact reference for characters and style. "
              "Same children's picture-book style. Plain warm white background, no text, no letters, no numbers, no stars. "
              "Every item clearly separated from the others with empty space around it, so it can be cut out.")
GLOW = "The caterpillar's antenna tips glow softly gold."
CALM = "The caterpillar's antenna tips are plain yellow-green, NOT glowing."

# Вложения: что приложить к промту
ATT = {
 "IN":  "2 листа гусенички + лист детей + k1_s1 (комната)",
 "OUT": "2 листа гусенички + лист детей + k2_s9 (двор со скамейкой; для самой k2_s9 — вместо неё k1_s1)",
 "CH":  "2 листа гусенички + лист детей",
 "R":   "2 листа гусенички",
}

P = []
def add(ch, name, att, body, note="", head=HEAD, glow=None):
    parts = [head]
    if glow is not None:
        parts.append(GLOW if glow else CALM)
    parts.append(body.strip())
    P.append(dict(ch=ch, name=name, att=ATT[att], note=note, text="\n".join(parts)))

# ---------------- Kapitel 1 (k1_s1, k1_s2_vorher готовы) ----------------
C1 = "Глава 1"
add(C1, "k1_s2_nachher", "IN", """
Close-up of the windowsill: the caterpillar peeks out from under a big leaf of her plant, wiping her mouth, with a disgusted face.
Behind her the puppet theater: the red curtain and the white cloud are still there, but the spot to the LEFT of the cloud is empty – no moon anywhere in the picture.
Through a gap between the leaves, at the lower edge of the image, only a red-and-white striped sleeve is visible – no face, no body, nothing in the hand.""", glow=True)
add(C1, "k1_s3", "IN", """
Wide view of the same classroom. Mila, holding two hand puppets, peeks behind the red curtain of the puppet theater (the spot left of the white cloud is empty).
Ben stands at a sink in the corner with his back to everyone, water running, scrubbing his fingers.
A green pencil lies on the floor under the big table.
On the windowsill the tiny caterpillar (finger-sized compared to the children) peeks out between two leaves.
No moon anywhere. Oskar is not in the picture.""", glow=True)
add(C1, "k1_s4_vorher", "IN", """
At the big table, Mila pulls a big round flat yellow cardboard disc out from under a stack of newspapers. We see only its yellow front. There is NO thread on this disc. Mila looks hopeful.
On the windowsill the tiny caterpillar looks at the disc through her dewdrop magnifier. Ben is not in the picture.""", glow=True)
add(C1, "k1_s4_nachher", "IN", """
Mila holds the same round cardboard disc turned around: its back is plain white and completely empty – no star, no dot, no thread, no marks. She looks disappointed.
On the windowsill the tiny caterpillar wiggles her antennae thoughtfully.""", glow=True)
add(C1, "k1_s5", "IN", """
Ben (blue sweater) has just come back from the sink; a little shiny glue is still on his fingertips. Mila points at his hands, surprised and suspicious. Ben glances over at the puppet theater, where the spot left of the white cloud is empty.
On the windowsill the tiny caterpillar leans forward on her leaf, listening. No moon, no tray, no Oskar.""", glow=True)
add(C1, "k1_s5_karten", "CH", """
Four separate small square cards in a 2x2 grid, thin space between the cards.
The moon: round flat disc, yellow front, plain white back, a long white thread at the top edge.
Card 1: Ben lifts the round yellow moon off the puppet theater (next to the white cloud).
Card 2: Ben glues the white thread onto the WHITE back of the moon with a small glue bottle.
Card 3: Ben lays the moon WHITE side up on a flat blue plastic tray.
Card 4: Ben washes his hands at a sink.""", head=HEAD_SHEET, note="Для игры Beweis-Mosaik: я разрежу на 4 карточки.")
add(C1, "k1_s6_vorher", "IN", """
Mila and Ben hurry around the big table to its window side. From the windowsill the tiny caterpillar leans far over the edge of her flowerpot to look down.
The children's bodies hide what lies on the table directly below the window – we cannot see it yet.""", glow=True)
add(C1, "k1_s6_nachher", "IN", """
Top-down view from the windowsill, as the caterpillar sees it looking down: a flat blue plastic tray lies on the table directly below the window. On the tray there is only one narrow red paper strip. To the RIGHT of the tray lie a pair of scissors and a roll of tape. No moon anywhere.
The caterpillar's dewdrop magnifier in a grass ring is in the foreground.""", glow=True)

# ---------------- Kapitel 2 ----------------
C2 = "Глава 2"
add(C2, "k2_s7", "IN", """
At the big table by the window: side by side stand a flat blue plastic tray full of loose colored paper scraps and cardboard pieces, and a green wooden box with finished hand puppets and theater pieces in it.
Mila points at the blue tray, explaining. Ben stands next to her and blushes a little, embarrassed.
On the windowsill the tiny caterpillar nods wisely on her leaf. No moon anywhere.""", glow=True)
add(C2, "k2_s8", "IN", """
Mila and Ben at the table next to the empty blue tray. Ben explains with his flat hand held palm down, as if showing how something was lying; Mila listens, surprised.
Above Ben's head a soft thought bubble (no text) shows a round white disc lying on the blue tray – only its white side visible, a white thread on it.
On the windowsill the tiny caterpillar listens, impressed.""", glow=True)
add(C2, "k2_s9", "IN", """
View from the open classroom window over the caterpillar's shoulder: she has crawled to the open window. Outside on the schoolyard, under a big tree, stands a wooden bench seen from the side.
On the bench sits Oskar (red-and-white striped hoodie). Next to him sits his small grey paper mouse (big round ears, long pink tail, red paper heart); in front of the mouse lies green grass made of cut paper.
Oskar has just put a white paper plate next to the mouse and covers it with a sheet of white tissue paper – what is on the plate cannot be seen. In his other hand: a glue bottle.""",
    note="Это первый вид двора: дальше прикладывай эту картинку ко всем сценам на улице.", glow=True)
add(C2, "k2_s10", "IN", """
Classroom. The door to the schoolyard is open; Oskar (striped hoodie) has just come in, put a glue bottle on a shelf and washes his hands at the sink, cheerful.
Mila stands nearby with a sad face, Ben next to her. Oskar looks at Mila, puzzled and friendly.
On the windowsill the tiny caterpillar sits up straight, excited. No moon, no mouse in the picture.""", glow=True)
add(C2, "k2_s11", "IN", """
The three children hurry out through the open door to the schoolyard, Oskar leading. Mila and Ben whisper to each other as they go.
On the windowsill the caterpillar looks after them, a little offended, then starts crawling toward the outer edge of the wide windowsill. The window is open.""", glow=True)
add(C2, "k2_s11_spiel", "IN", """
Top-down view of a wide classroom windowsill, like a simple map: on the left the flowerpot with the caterpillar's plant and the tiny caterpillar on a leaf; the inner edge of the sill toward the classroom at the top; the outer edge over the open window at the bottom; below the outer edge, far down, we see the top of a wooden bench with a white paper plate covered by white tissue paper.
Clear, simple, uncluttered layout with lots of free sill surface.""",
    note="Фон для игры Raupenweg: ребёнок ведёт по нему гусеничку пальцем.", glow=True)
add(C2, "k2_s12", "OUT", """
Schoolyard, warm afternoon sun through the tree branches. Mila, Ben and Oskar stand at the bench. The paper plate is still covered with white tissue paper. Next to it lie scissors and many small yellow paper snippets.
Ben turns pale and whispers to Mila, pointing at the yellow snippets. Mila swallows, worried. Oskar grins from ear to ear, not noticing anything, and raises a finger as if asking a riddle.
High above, at the edge of the open window, the tiny caterpillar has just arrived and looks down. Nothing under the tissue paper is visible.""", glow=True)

# ---------------- Kapitel 3 ----------------
C3 = "Глава 3"
add(C3, "k3_s13", "OUT", """
Schoolyard bench. Oskar has just pulled the white tissue paper off the paper plate: on the plate lies a big round bright yellow "cheese" – a flat round disc with three chocolate-brown round paper dots on top, small yellow paper crumbs all around it.
At the edge of the disc a tiny end of white thread peeks out from underneath – small and NOT highlighted, easy to overlook.
Mila stares, Ben's mouth falls open, Oskar is proud. High above at the window edge, the tiny caterpillar looks down through her dewdrop magnifier.""",
    note="Эта же картинка — поле для игры Tautropfen-Lupe: ребёнок ищет кончик нитки сам.", glow=True)
add(C3, "k3_s14", "OUT", """
At the bench: Mila bends close over the yellow "cheese" on the plate. Ben points at its edge, where a small end of white thread peeks out. Oskar looks from one to the other, confused.
High above at the window edge the tiny caterpillar raises one little front foot, as if saying "careful". The back of the disc is NOT visible.""", glow=True)
add(C3, "k3_s15", "OUT", """
At the bench: Ben looks worried at the three brown dots and the yellow crumbs. Oskar laughs and shows a sheet of brown paper with three round holes cut out of it and a sheet of yellow paper with snippets cut out – this is where the dots and crumbs came from. Mila breathes out, relieved.
High above at the window edge the tiny caterpillar giggles.""", glow=True)
add(C3, "k3_s16_vorher", "OUT", """
At the bench: Mila carefully lifts the yellow "cheese" disc off the plate with both hands, about to turn it over. Ben and Oskar put their heads together. We see only the yellow front with the brown dots.
High above at the window edge, the tiny caterpillar stretches her neck so far that she almost loses her balance.""", glow=True)
add(C3, "k3_s16_nachher", "OUT", """
Close-up: Mila holds the disc turned over. Its back is white. Near the bottom edge there is a tiny hand-painted BLUE STAR (the only star in the whole book), and at the top edge a white thread is glued on firmly.
Mila beams with joy, Ben is relieved, Oskar's eyes are wide with surprise. The tiny caterpillar at the window looks through her dewdrop magnifier, happy.""",
    note="Здесь звезда нужна! Это единственная картинка книги, где она есть.", glow=True,
    head=HEAD.replace("no stars anywhere", "no stars except the one small blue star described below"))
add(C3, "k3_s17", "OUT", """
At the bench: Oskar apologizes, a little shocked. Mila puts her hand on his shoulder and smiles. Ben scratches the back of his head, embarrassed. Then all three burst out laughing together.
Mila holds the yellow disc with the three brown dots. The tiny caterpillar at the window leans back, content.""", glow=False)
add(C3, "k3_s18", "OUT", """
At the bench: Mila holds the yellow moon with the three brown dots and looks a bit sad. Ben shakes his head carefully, touching one brown dot. Oskar looks from his little grey paper mouse up to the spotted moon – and his whole face lights up with an idea.
The tiny caterpillar at the window watches, curious.""", glow=False)

# ---------------- Kapitel 4 ----------------
C4 = "Глава 4"
add(C4, "k4_s19", "IN", """
Back in the classroom. Oskar puts leftover paper scraps on the blue tray. Mila puts the hand puppets into the green wooden box. Ben stands on a small stool at the puppet theater and lays the moon's thread over the top bar of the theater – NOT tied.
The round yellow moon with the three brown dots hangs again to the LEFT of the white cloud above the red curtain.
The tiny caterpillar is back on her favorite leaf in the flowerpot, looking pleased.""", glow=False)
add(C4, "k4_s20_vorher", "IN", """
Everyone searches: Oskar (seen from the FRONT, so his hood is not visible) looks on the table and into the green box, Mila looks under the table, Ben looks behind the puppet theater. Oskar looks upset.
On the windowsill the tiny caterpillar sits completely still and watches calmly. No mouse visible anywhere.""", glow=True)
add(C4, "k4_s20_spiel", "IN", """
The same search scene, but Oskar is now seen from BEHIND: from his red-and-white striped hood a thin pink mouse tail hangs out – small, not highlighted, easy to overlook.
Mila looks under the table, Ben behind the theater. The tiny caterpillar on the windowsill.""",
    note="Поле для игры: ребёнок ищет хвост лупой. Хвост мелкий, без подсветки.", glow=True)
add(C4, "k4_s20_nachher", "IN", """
Oskar pulls his small grey paper mouse out of his hood. All three children laugh. The round yellow moon with three brown dots hangs left of the white cloud.
The tiny caterpillar giggles on her leaf.""", glow=False)
add(C4, "k4_s21", "IN", """
The classroom door is open. Frau Sommer (reddish hair in a bun, green cardigan) looks in, smiling, and picks up a plain yellow round cardboard circle from the table – it has NO thread and NO dots.
Children of the group come in chatting and sit down in a semicircle on the carpet in front of the table with the puppet theater.
At the very back by the window, the tiny caterpillar hides a little under her top leaf, but she can see the stage over the children's heads.""", glow=False)
add(C4, "k4_s22", "IN", """
The puppet show. Seen from behind the audience (backs of children's heads in the foreground, some start giggling).
On the stage: the little grey paper mouse with the red heart jumps as high as it can toward the round yellow moon with three brown dots; the moon dances on its thread with small motion lines. Mila holds the red curtain open at the side.
At the window the tiny caterpillar giggles silently.""", glow=False)
add(C4, "k4_s23", "IN", """
Big applause: the children on the carpet and Frau Sommer clap enthusiastically. Mila, Ben and Oskar have come out from behind the theater and take a bow; Mila hugs her two friends.
The curtain is closed, the spotted moon hangs left of the cloud. At the window the tiny caterpillar claps quietly with her many little feet.""", glow=False)
add(C4, "k4_s24", "IN", """
Late afternoon, the classroom is empty and quiet, warm golden sunlight through the window.
Above the little stage still hangs the round yellow moon with three brown dots. On the edge of the stage sits the small grey paper mouse with the red heart, looking up at it.
On her big green leaf the caterpillar curls up cozily and yawns. Outside the window a colorful butterfly flies past.""", glow=False)
add(C4, "k4_s24_karten", "CH", """
Five separate small square cards in one row (or 3 + 2), thin space between them. The moon is a round flat disc, yellow front, white back with a tiny blue star near the bottom edge and a white thread at the top.
Card 1: Ben takes the moon off the puppet theater and glues the thread.
Card 2: Ben lays the moon WHITE side up on the blue tray.
Card 3: Oskar on the bench glues three brown paper dots onto the yellow disc – it becomes a "cheese" on a paper plate.
Card 4: Mila turns the cheese over and finds the blue star and the thread.
Card 5: The children play the puppet show: the paper mouse jumps toward the spotted moon.""",
    head=HEAD_SHEET.replace("no stars", "no stars except the tiny blue star on the moon's back"),
    note="Для финальной игры Beweis-Mosaik: я разрежу на 5 карточек.")

# ---------------- Предметы и эмоции ----------------
CO = "Предметы и эмоции (для игр)"
add(CO, "objekte_1_mond", "CH", """
Object sheet, each object shown alone:
1) the round yellow cardboard moon, front, with a long white thread at the top;
2) the same moon from the back: white, tiny blue star near the bottom edge, white thread glued at the top;
3) the moon lying WHITE side up on a flat blue plastic tray;
4) a plain yellow round cardboard circle without thread (front);
5) the same plain circle from the back: completely white and empty;
6) the "cheese": the yellow moon with three brown paper dots, on a white paper plate with yellow paper crumbs, a tiny thread end peeking out;
7) the moon with three brown dots hanging on its thread;
8) a white paper plate covered with white tissue paper.""",
    head=HEAD_SHEET.replace("no stars", "no stars except the tiny blue star on the moon's back"))
add(CO, "objekte_2_raum", "CH", """
Object sheet, each object shown alone: a pair of scissors; a roll of tape; a glue bottle; a green pencil; an empty flat blue plastic tray; a narrow red paper strip; a green wooden box with hand puppets; a pencil cup; a stack of newspapers; the white paper cloud; a small wooden stool; a sink faucet; the empty puppet theater with red curtain and white cloud (front view).""", head=HEAD_SHEET)
add(CO, "objekte_3_basteln", "CH", """
Object sheet, each object shown alone: the small grey paper mouse (front view and side view; big round ears, long pink tail, red paper heart); a tuft of green grass cut from paper; a single green leaf cut from paper; three small brown paper circles; a pile of small yellow paper snippets; a sheet of brown paper with three round holes cut out; a sheet of white tissue paper; a white paper plate; colorful paper scraps.""", head=HEAD_SHEET)
add(CO, "emotionen_raupe", "R", """
Expression sheet of the caterpillar, head and upper body with cape, 8 expressions in a 4x2 grid: proud and praising; thinking (paw at chin); giving a hint, pointing with her dewdrop magnifier; surprised; laughing; a little sad / disappointed; sleepy and yawning; clapping with many little feet. Antenna tips glow gold only in "thinking" and "giving a hint".""", head=HEAD_SHEET)
for kid, desc in [("mila", "Mila"), ("ben", "Ben"), ("oskar", "Oskar")]:
    add(CO, f"emotionen_{kid}", "CH", f"""
Expression sheet of {desc}, head and shoulders only, 6 expressions in a 3x2 grid: happy; sad; surprised; worried; laughing; thinking.""", head=HEAD_SHEET,
        note="Для игр Wunsch-Waage и Spurenfaden: портреты, которые улыбаются или грустят.")

# ---------------- Оформление ----------------
CM = "Обложка, главы, награды"
add(CM, "cover", "IN", """
Book cover illustration, PORTRAIT 2:3. Dusk: the classroom window with a deep twilight-blue sky outside. In the foreground, on a leaf of her plant, the caterpillar looks through her dewdrop magnifier with a curious, determined face.
Behind her, on the table, the puppet theater with the red curtain and the white cloud – and an empty spot to the left of the cloud where only a short thread end hangs.
Leave calm empty sky at the top third for the title (the title is added later, do not draw any text).""", glow=True)
add(CM, "vorgeschichte", "R", """
A bright classroom window with a big green potted plant. On one of its leaves lives the tiny caterpillar. She sits on her favorite leaf; under the leaf her treasure: the dewdrop magnifier in a ring of grass. She dreams with half-closed eyes – a small soft dream cloud above her shows a colorful butterfly.""", glow=False)
add(CM, "kapitel_1", "IN", """
Small chapter vignette, square 1:1, soft vignette edges: the top of the puppet theater with the red curtain, the white cloud and an empty spot to its left with only a short thread end hanging – a mystery mood.""", head=HEAD.replace("landscape 3:2", "square 1:1"))
add(CM, "kapitel_2", "IN", """
Small chapter vignette, square 1:1, soft vignette edges: a flat blue plastic tray with paper scraps next to a green wooden box with puppets on the big table.""", head=HEAD.replace("landscape 3:2", "square 1:1"))
add(CM, "kapitel_3", "OUT", """
Small chapter vignette, square 1:1, soft vignette edges: a wooden bench under a tree; on it a white paper plate covered with white tissue paper and the little grey paper mouse sitting next to it – a surprise mood.""", head=HEAD.replace("landscape 3:2", "square 1:1"))
add(CM, "kapitel_4", "IN", """
Small chapter vignette, square 1:1, soft vignette edges: the little grey paper mouse on the puppet stage looking up at the round yellow moon with three brown dots – a happy theater mood.""", head=HEAD.replace("landscape 3:2", "square 1:1"))
add(CM, "mondtresor_zu", "R", """
A small magical safe for a children's game, square 1:1: a round door that looks like a full moon (pale golden, soft craters), set into a dark twilight-blue wall, with a row of six empty letter slots below the door (empty, no letters), a little round dial. Cozy and magical, not technical. Plain dark-blue background.""", head=HEAD_SHEET.replace("Plain warm white background", "Plain deep twilight-blue background"))
add(CM, "mondtresor_auf", "R", """
The same moon-door safe, now open: the round door swings open, warm golden light comes from inside; the inside is an empty soft-lit niche (a picture will be placed there later). Square 1:1, plain deep twilight-blue background.""", head=HEAD_SHEET.replace("Plain warm white background", "Plain deep twilight-blue background"))
add(CM, "finale_bild", "IN", """
The final reward picture of the book: Mila, Ben and Oskar stand happily in front of the puppet theater, Oskar holds the little paper mouse, the round yellow moon with three brown dots hangs left of the cloud. Frau Sommer smiles in the background. On the windowsill the caterpillar waves with her magnifier. Warm, joyful, everyone together.""",
    note="Эту картинку сейфы открывают по четверти после каждой главы.", glow=False)
add(CM, "spurenwand", "R", """
Background for a detective clue wall, PORTRAIT 9:16: a warm cork board with a wooden frame, a few empty push pins and two loose red threads at the edges, lots of free space in the middle for cards. Cozy, not cluttered. No paper, no pictures on it.""", head=HEAD_SHEET.replace("Plain warm white background", "Full-bleed image"))
add(CM, "diplom", "R", """
Background for a children's certificate "Meister-Detektiv", PORTRAIT 3:4: warm paper with a decorative frame of leaves and tiny moons; at the bottom a round seal showing the caterpillar's head with glowing antennae and the dewdrop magnifier. Large empty space in the middle for text (added later).""", head=HEAD_SHEET.replace("Plain warm white background", "Full-bleed image"))
add(CM, "auszeichnung", "R", """
The caterpillar proudly wearing her reward: a small golden magnifier badge pinned to her dark-blue cape, sparkling softly. Full body, front view, happy. Plus the badge alone, larger, next to her.""", head=HEAD_SHEET)
add(CM, "play_banner", "IN", """
Wide banner, 2:1 landscape (will be cropped to 1024x500): on the left third the caterpillar on a leaf looking through her dewdrop magnifier; on the right the puppet theater with red curtain and white cloud and an empty spot left of the cloud; deep twilight-blue to warm evening light. Leave a calm empty area in the middle for the app name (no text).""", glow=True)

if __name__ == "__main__":
    root = pathlib.Path(__file__).parent
    md = ["# Промты для картинок (все)\n",
          "Создано из `02_design/bilder_prompts.py`. Правила — `ILLUSTRATIONEN.md`. Готовые картинки — `assets/illustrationen/`.\n",
          "Готово: `k1_s1`, `k1_s2_vorher`, `k1_s2_nachher`.\n"]
    cur = None
    for i, p in enumerate(P, 1):
        if p["ch"] != cur:
            cur = p["ch"]; md.append(f"\n## {cur}\n")
        md.append(f"### {i}. `{p['name']}`\nПриложить: {p['att']}." + (f" {p['note']}" if p['note'] else "") + f"\n\n```text\n{p['text']}\n```\n")
    (root / "BILDER_PROMPTS.md").write_text("\n".join(md), encoding="utf-8")
    (root.parent / "02_design" / "bilder_prompts.json").write_text(json.dumps(P, ensure_ascii=False, indent=1), encoding="utf-8")
    print(len(P), "prompts")
