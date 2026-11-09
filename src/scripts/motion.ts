// Site-wide motion: smooth scroll, reveals, scroll scenes, cursor, tilt.
// Everything here is progressive: without JS (or with reduced motion) the page
// is fully readable and nothing is hidden.
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);
(window as unknown as { __motionReady: boolean }).__motionReady = true;

const root = document.documentElement;
const motionOK = root.classList.contains("motion");
const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
const $ = <T extends Element = HTMLElement>(s: string, el: ParentNode = document) => el.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string, el: ParentNode = document) => [...el.querySelectorAll<T>(s)];

// ---------------------------------------------------------------- smooth scroll
let lenis: Lenis | null = null;
if (motionOK) {
  lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 1 });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis!.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  // In-page anchors go through Lenis so they glide too.
  document.addEventListener("click", (e) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href*="#"]');
    if (!a) return;
    const url = new URL(a.href);
    if (url.pathname !== location.pathname || !url.hash) return;
    const target = document.getElementById(url.hash.slice(1));
    if (!target) return;
    e.preventDefault();
    lenis!.scrollTo(target, { offset: -40, duration: 1.4 });
    history.pushState(null, "", url.hash);
  });
}

// ---------------------------------------------------------------- split headings
// Wrap each word so it can rise out of a mask. Keeps <br> and nested spans.
function splitWords(el: HTMLElement) {
  const walk = (node: Node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const parts = (child.textContent || "").split(/(\s+)/);
        const frag = document.createDocumentFragment();
        parts.forEach((p) => {
          if (!p) return;
          if (/^\s+$/.test(p)) return frag.append(" ");
          const w = document.createElement("span");
          w.className = "w";
          const inner = document.createElement("span");
          inner.textContent = p;
          w.append(inner);
          frag.append(w);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE && (child as Element).tagName !== "BR") {
        walk(child);
      }
    });
  };
  walk(el);
}

if (motionOK) {
  $$("[data-split]").forEach((el) => {
    splitWords(el);
    // CSS starts each word at translateY(110%) under .motion; rise to 0.
    // y: 0 matters: GSAP would otherwise read the CSS translateY(110%) as a pixel y.
    gsap.fromTo($$(".w > span", el), { yPercent: 110, y: 0 }, {
      yPercent: 0,
      y: 0,
      duration: 1.1,
      ease: "expo.out",
      stagger: 0.07,
      scrollTrigger: { trigger: el, start: "top 88%" },
    });
  });

  // ---------------------------------------------------------------- reveals
  // Anything already on screen animates in now; the rest waits for scroll.
  const inView = $$("[data-reveal]").filter((el) => el.getBoundingClientRect().top < innerHeight * 0.95);
  gsap.fromTo(
    inView,
    { opacity: 0, y: 40 },
    { opacity: 1, y: 0, duration: 1, ease: "expo.out", stagger: 0.09, delay: 0.25 }
  );
  $$("[data-reveal]")
    .filter((el) => !inView.includes(el))
    .forEach((el) => el.setAttribute("data-reveal-pending", ""));

  ScrollTrigger.batch("[data-reveal-pending]", {
    start: "top 90%",
    once: true,
    onEnter: (els) =>
      gsap.fromTo(
        els,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1, ease: "expo.out", stagger: 0.09, overwrite: true }
      ),
  });

  // ---------------------------------------------------------------- scrubbed statement
  $$("[data-scrub]").forEach((el) => {
    splitWords(el);
    const words = $$(".w > span", el);
    gsap.set(words, { yPercent: 0 });
    gsap.fromTo(
      words,
      { opacity: 0.12 },
      {
        opacity: 1,
        ease: "none",
        stagger: 0.05,
        scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: true },
      }
    );
  });

  // ---------------------------------------------------------------- hero
  const hero = $("[data-hero]");
  if (hero) {
    const phone = $("[data-tilt-phone]", hero); // only on the homepage
    const icons = $$("[data-depth]", hero);

    if (phone) gsap.from(phone, { y: 120, rotateX: 18, opacity: 0, duration: 1.6, ease: "expo.out", delay: 0.2 });
    if (icons.length) gsap.from(icons, {
      scale: 0,
      opacity: 0,
      duration: 1.2,
      ease: "back.out(2)",
      stagger: 0.08,
      delay: 0.6,
    });

    // Mouse parallax: phone tilts, icons drift by depth.
    if (finePointer) {
      const qx = icons.map((ic) => gsap.quickTo(ic, "x", { duration: 0.9, ease: "power3" }));
      const qy = icons.map((ic) => gsap.quickTo(ic, "y", { duration: 0.9, ease: "power3" }));
      const rx = phone && gsap.quickTo(phone, "rotateX", { duration: 1, ease: "power3" });
      const ry = phone && gsap.quickTo(phone, "rotateY", { duration: 1, ease: "power3" });
      hero.addEventListener("pointermove", (e) => {
        const nx = e.clientX / innerWidth - 0.5;
        const ny = e.clientY / innerHeight - 0.5;
        ry?.(nx * 18);
        rx?.(-ny * 12);
        icons.forEach((ic, i) => {
          const d = parseFloat(ic.dataset.depth || "1");
          qx[i](nx * 70 * d);
          qy[i](ny * 50 * d);
        });
      });
    }

    // Scroll away: phone sinks and turns, icons scatter outward.
    const out = gsap.timeline({
      scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true },
    });
    if (phone) out.to(phone, { yPercent: 18, rotateZ: -6, scale: 0.92, ease: "none" }, 0);
    icons.forEach((ic) => {
      const left = parseFloat(ic.style.left) < 50;
      out.to(ic, { xPercent: left ? -140 : 140, yPercent: -60, rotate: left ? -40 : 40, ease: "none" }, 0);
    });
  }

  // ---------------------------------------------------------------- tour
  const tour = $("[data-tour]");
  if (tour) {
    const chapters = $$("[data-chapter]", tour);
    const imgs = $$("[data-screen]", $(".tour__phone", tour)!);
    const dots = $$(".tour__dots li", tour);
    const phone = $(".tour__phone", tour)!;

    const activate = (i: number) => {
      chapters.forEach((c, j) => c.classList.toggle("is-active", i === j));
      imgs.forEach((im, j) => im.classList.toggle("is-active", i === j));
      dots.forEach((d, j) => d.classList.toggle("is-active", i === j));
      gsap.to(phone, {
        rotateY: i % 2 ? 10 : -10,
        rotateZ: i % 2 ? 2 : -2,
        duration: 1.2,
        ease: "expo.out",
      });
      // A quick squash so each swap feels physical.
      gsap.fromTo(phone, { scale: 0.96 }, { scale: 1, duration: 0.9, ease: "elastic.out(1, 0.6)" });
    };

    chapters.forEach((c, i) =>
      ScrollTrigger.create({
        trigger: c,
        start: "top 55%",
        end: "bottom 55%",
        onToggle: (self) => self.isActive && activate(i),
      })
    );
    activate(0);
  }

  // ---------------------------------------------------------------- spinning reel
  $$("[data-spin]").forEach((el) =>
    gsap.fromTo(
      el,
      { rotate: -40 },
      { rotate: 320, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 1 } }
    )
  );

}

// ---------------------------------------------------------------- tilt cards
if (motionOK && finePointer) {
  $$("[data-tilt]").forEach((card) => {
    const rx = gsap.quickTo(card, "rotateX", { duration: 0.6, ease: "power3" });
    const ry = gsap.quickTo(card, "rotateY", { duration: 0.6, ease: "power3" });
    gsap.set(card, { transformPerspective: 900 });
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      ry((x - 0.5) * 10);
      rx(-(y - 0.5) * 10);
      card.style.setProperty("--mx", `${x * 100}%`);
      card.style.setProperty("--my", `${y * 100}%`);
    });
    card.addEventListener("pointerleave", () => {
      rx(0);
      ry(0);
    });
  });

  // Magnetic buttons
  $$("[data-magnetic]").forEach((el) => {
    const qx = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3" });
    const qy = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3" });
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      qx((e.clientX - r.left - r.width / 2) * 0.3);
      qy((e.clientY - r.top - r.height / 2) * 0.4);
    });
    el.addEventListener("pointerleave", () => {
      qx(0);
      qy(0);
    });
  });
}

// ---------------------------------------------------------------- cursor
if (motionOK && finePointer) {
  const cursor = $(".cursor")!;
  const dot = $(".cursor__dot", cursor)!;
  const ring = $(".cursor__ring", cursor)!;
  const label = $(".cursor__label", cursor)!;
  const img = $<HTMLImageElement>(".cursor__img", cursor)!;
  root.classList.add("has-cursor");
  cursor.classList.add("is-hidden");

  const dx = gsap.quickTo(dot, "x", { duration: 0.08, ease: "power3" });
  const dy = gsap.quickTo(dot, "y", { duration: 0.08, ease: "power3" });
  const rx = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3" });
  const ry = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3" });

  addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    cursor.classList.remove("is-hidden");
    dx(e.clientX);
    dy(e.clientY);
    rx(e.clientX);
    ry(e.clientY);
  });
  document.addEventListener("pointerleave", () => cursor.classList.add("is-hidden"));

  const setState = (t: EventTarget | null) => {
    const el = (t as HTMLElement)?.closest?.<HTMLElement>("[data-cursor], a, button, input, textarea, label");
    if (!el) return (cursor.dataset.state = "");
    if (el.matches("input, textarea")) return (cursor.dataset.state = "text");
    const kind = el.dataset.cursor || "link";
    if (kind === "label") {
      label.textContent = el.dataset.cursorLabel || "view";
      cursor.dataset.state = "label";
    } else if (kind === "image" && el.dataset.cursorImg) {
      if (img.getAttribute("src") !== el.dataset.cursorImg) img.src = el.dataset.cursorImg;
      cursor.dataset.state = "image";
    } else cursor.dataset.state = "link";
  };
  document.addEventListener("pointerover", (e) => setState(e.target));

  // Click sparks, tinted by whatever mood or accent is under the pointer.
  const colors = ["#9C88FF", "#C8BCFF", "#F7798E", "#FFD25A", "#7CE0C3"];
  addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse") return;
    gsap.fromTo(ring, { scale: 0.8 }, { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.5)" });
    for (let i = 0; i < 8; i++) {
      const s = document.createElement("span");
      const a = (Math.PI * 2 * i) / 8 + Math.random() * 0.4;
      const dist = 26 + Math.random() * 22;
      s.className = "spark";
      s.style.left = `${e.clientX}px`;
      s.style.top = `${e.clientY}px`;
      s.style.setProperty("--dx", `${Math.cos(a) * dist}px`);
      s.style.setProperty("--dy", `${Math.sin(a) * dist}px`);
      s.style.setProperty("--c", colors[i % colors.length]);
      document.body.append(s);
      s.addEventListener("animationend", () => s.remove());
    }
  });
}

// Evaluate triggers now (don't wait for every image to load, or above-the-fold
// reveals stay hidden), then again once images and fonts have settled.
requestAnimationFrame(() => ScrollTrigger.refresh());
addEventListener("load", () => ScrollTrigger.refresh());
document.fonts?.ready.then(() => ScrollTrigger.refresh());
