// The six Cini moods, as the app shows them.
// "complex" is the UI name of the backend mood "mindbending"; they are the same mood.
// Retired names (twisted, cerebral) must never appear on the site.
import tea from "./assets/3d/tea.png";
import heart from "./assets/3d/heart.png";
import jester from "./assets/3d/jester.png";
import bomb from "./assets/3d/bomb.png";
import skull from "./assets/3d/skull.png";
import complex from "./assets/3d/complex.png";

export const moods = [
  {
    id: "cozy",
    label: "cozy",
    img: tea,
    color: "#F4B860",
    line: "Blanket on. Stakes low. Snacks within reach.",
    desc: "Warm, gentle and comforting. Nothing too stressful.",
  },
  {
    id: "heartfelt",
    label: "heartfelt",
    img: heart,
    color: "#F7798E",
    line: "Bring tissues. Leave a little lighter.",
    desc: "Stories that move you, about love, family and people.",
  },
  {
    id: "funny",
    label: "funny",
    img: jester,
    color: "#FFD25A",
    line: "Laughs first, plot second.",
    desc: "Made to make you laugh, from silly to sharp.",
  },
  {
    id: "thrilling",
    label: "thrilling",
    img: bomb,
    color: "#FF8A4C",
    line: "Edge of your seat, heart in your throat.",
    desc: "Tense and fast. Chases, heists, close calls.",
  },
  {
    id: "dark",
    label: "dark",
    img: skull,
    color: "#C95D6B",
    line: "Dark corners and morally grey people.",
    desc: "Grim, eerie or unsettling. Not always scary, never light.",
  },
  {
    id: "complex",
    label: "complex",
    img: complex,
    color: "#4FC3F7",
    line: "The kind you think about in the shower tomorrow.",
    desc: "Twisty, layered and thought-provoking. Pay attention.",
  },
];

export const moodOrder = moods.map((m) => m.id);

// Keys follow moodOrder.
export const moodPairs: Record<string, string> = {
  "cozy+heartfelt": "A warm hug of a story.",
  "cozy+funny": "Comfort food with punchlines.",
  "cozy+thrilling": "A mystery you can solve in pajamas.",
  "cozy+dark": "Cottagecore, with a body in the garden.",
  "cozy+complex": "Slow, gentle and quietly brilliant.",
  "heartfelt+funny": "Laugh till you cry. Then actually cry.",
  "heartfelt+thrilling": "High stakes, real feelings.",
  "heartfelt+dark": "Beautiful and a little bit broken.",
  "heartfelt+complex": "Big ideas with a beating heart.",
  "funny+thrilling": "Chaos, chases and one-liners.",
  "funny+dark": "Laughing at things you probably shouldn't.",
  "funny+complex": "Smart, sharp and very quotable.",
  "thrilling+dark": "Lights on. Doors locked.",
  "thrilling+complex": "A puzzle with a ticking clock.",
  "dark+complex": "It'll mess with your head, in a good way.",
};

export const moodById = Object.fromEntries(moods.map((m) => [m.id, m]));
