# Слоги Главы 1: что проверить (D-07)

Источник разметки: `04_data/silben_kapitel1.txt` (одно слово в строке, 611 слов: текст Vorgeschichte + Spur 1–6 и тексты игр).
Основа — алгоритм Leseraupe (`src/core/silben.ts` + словарь), затем ручная правка. После любой правки: `cd app && npm run data` — скрипт заново проверит, что текст совпадает с v6.

Как исправить: найти слово в `silben_kapitel1.txt`, поменять `|`, запустить `npm run data`.

## 1. Где я исправил алгоритм Leseraupe (17 слов)

| Leseraupe | Стало | Почему |
|---|---|---|
| Bleis\|tift | **Blei\|stift** | стык слов Blei + Stift |
| Füh\|lers\|pit\|zen | **Füh\|ler\|spit\|zen** | стык Fühler + Spitzen |
| ges\|tellt | **ge\|stellt** | приставка ge- |
| ges\|treif\|te / ges\|treif\|ten | **ge\|streif\|te / ge\|streif\|ten** | приставка ge- |
| bes\|timmt | **be\|stimmt** | приставка be- |
| auss\|puckt | **aus\|spuckt** | приставка aus- |
| vers\|teckt | **ver\|steckt** | приставка ver- |
| wie\|de\|rer\|ken\|ne | **wie\|der\|er\|ken\|ne** | wieder + er- + kennen |
| na\|chei\|nan\|der | **nach\|ein\|an\|der** | стыки nach-ein-ander |
| The\|a\|ters\|tück | **The\|a\|ter\|stück** | стык Theater + Stück |
| Lie\|blings\|blatt | **Lieb\|lings\|blatt** | корень lieb |
| wir\|klich | **wirk\|lich** | корень wirk |
| Ta\|blett | **Tab\|lett** | школьное деление |
| I\|deen | **I\|de\|en** | одиночная гласная — отдельный слог |
| Mo\|saik | **Mo\|sa\|ik** | то же |
| I\|i\|i\|i\|ih | **Iiiiih** | крик, одна «тянущаяся» гласная — один слог |

## 2. Спорные места — решить тебе (сейчас стоит первый вариант)

| Сейчас | Другой вариант | Комментарий |
|---|---|---|
| he\|raus, he\|rum, he\|run\|ter\|ge\|fal\|len | her\|aus, her\|um, her\|un\|ter… | оба допустимы по Duden; «he\|raus» — по произношению |
| da\|ran, Da\|rum, Wa\|rum | dar\|an, Dar\|um, War\|um | то же |
| hi\|nun\|ter\|schaut | hin\|un\|ter\|schaut | то же |
| E\|ben, E\|cke, o\|ben, a\|ber, ü\|ber | — | одиночная гласная отдельно (как `Ü|ber` в D-07) |
| ers\|ten | ers\|ten / er\|sten | школьное правило «st не разделяем» устарело, оставил ers\|ten |
| Pul\|li, Ka\|pu\|ze | — | ок по правилам, отмечаю на всякий случай |
| KNURPS | — | звукоподражание, один слог |

## 3. Слова с дефисом

По D-13 (`Le|se-|Rau|pe`) цвет после дефиса **продолжает чередоваться**: Le синий, se- красный, Rau синий, pe красный. Так же раскрашены `rot-wei|ße` (rot синий, wei красный …), `Zeit|lu|pen-Blick`, `Lese-Fall`. Если для других слов хочешь, чтобы после дефиса снова начинался синий, — это одна строка в `app/src/text.ts`.

## 4. Что смотреть выборочно

Достаточно включить в приложении «Silben farbig» и пролистать Spur 3 и Spur 5 — там больше всего длинных слов.
