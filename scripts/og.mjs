// Share images (Open Graph / X cards) for ciniapp.com.
// Run `npm run og` after changing a page's headline, then commit public/og/*.png.
// Each image is 1200x630 and uses the site's own fonts, colours and 3D mood icons.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

const root = new URL("../", import.meta.url);
const file = (p) => readFile(new URL(p, root));

// Pages without their own card use default.png (see Base.astro).
const cards = [
  { name: "default", lines: ["What to watch.", "Found."], sub: "Pick your mood. Get one great movie or show." },
  { name: "how-it-works", lines: ["Smarter than a", "genre filter."], sub: "How Cini matches every pick to your mood." },
  { name: "about", lines: ["Less scrolling.", "More watching."], sub: "A small, independent app with one job." },
  { name: "support", lines: ["How can we", "help?"], sub: "Quick answers, and a real person to talk to." },
];

const C = { bg: "#0c0c0e", text: "#f0f0f0", text2: "#a0a0a0", text3: "#6c6c72", primary: "#9c88ff" };

const fonts = [
  { name: "Comfortaa", weight: 500, data: await file("node_modules/@fontsource/comfortaa/files/comfortaa-latin-500-normal.woff") },
  { name: "Comfortaa", weight: 700, data: await file("node_modules/@fontsource/comfortaa/files/comfortaa-latin-700-normal.woff") },
];

const dataUri = async (p) => `data:image/png;base64,${(await file(p)).toString("base64")}`;
const logo = await dataUri("src/assets/logo.png");
const icons = await Promise.all(
  ["tea", "heart", "jester", "bomb", "skull", "complex"].map((n) => dataUri(`src/assets/3d/${n}.png`)),
);

const h = (type, style, children) => ({ type, props: { style: { display: "flex", ...style }, children } });
const img = (src, size, style = {}) => ({ type: "img", props: { src, width: size, height: size, style } });

// Icons sit in a loose, tilted cluster on the right.
const spots = [
  { x: 40, y: 20, s: 170, r: -10 },
  { x: 230, y: 70, s: 150, r: 8 },
  { x: 10, y: 210, s: 150, r: 6 },
  { x: 190, y: 240, s: 180, r: -6 },
  { x: 60, y: 400, s: 140, r: -4 },
  { x: 240, y: 430, s: 130, r: 10 },
];

function card({ lines, sub }) {
  return h(
    "div",
    {
      width: 1200,
      height: 630,
      backgroundColor: C.bg,
      backgroundImage:
        "radial-gradient(circle at 85% 20%, rgba(156,136,255,0.32), rgba(156,136,255,0) 55%), radial-gradient(circle at 10% 110%, rgba(247,121,142,0.14), rgba(247,121,142,0) 45%)",
      fontFamily: "Comfortaa",
      color: C.text,
      padding: "64px 72px",
      position: "relative",
    },
    [
      h("div", { flexDirection: "column", justifyContent: "space-between", width: 720, height: 502 }, [
        h("div", { alignItems: "center", gap: 14 }, [
          img(logo, 56),
          h("div", { fontSize: 46, fontWeight: 700, color: C.primary, marginTop: -6 }, "cini"),
        ]),
        h("div", { flexDirection: "column" }, [
          h("div", { fontSize: 84, fontWeight: 500, lineHeight: 1.08, letterSpacing: -2 }, lines[0]),
          h("div", { fontSize: 84, fontWeight: 500, lineHeight: 1.08, letterSpacing: -2, color: C.primary }, lines[1]),
          h("div", { fontSize: 30, fontWeight: 500, color: C.text2, marginTop: 28, lineHeight: 1.35 }, sub),
        ]),
        h("div", { fontSize: 24, fontWeight: 700, color: C.text3 }, "ciniapp.com"),
      ]),
      h(
        "div",
        { position: "absolute", left: 750, top: 0, width: 420, height: 630 },
        spots.map((p, i) =>
          img(icons[i], p.s, { position: "absolute", left: p.x, top: p.y, transform: `rotate(${p.r}deg)` }),
        ),
      ),
    ],
  );
}

await mkdir(new URL("public/og/", root), { recursive: true });
for (const c of cards) {
  const svg = await satori(card(c), { width: 1200, height: 630, fonts });
  const png = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng();
  await writeFile(new URL(`public/og/${c.name}.png`, root), png);
  console.log(`public/og/${c.name}.png ${(png.length / 1024).toFixed(0)} KB`);
}
