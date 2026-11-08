/*
 * Cini waitlist section (hidden by default).
 *
 * Copied from the Framer "waitlist" section (kini-teaser-copy, Home page).
 *
 * TO TURN IT ON:
 *   1. Set WAITLIST_ENABLED = true
 *   2. Set WAITLIST_ENDPOINT to a URL that accepts a POST (see below)
 *   3. git commit + push
 *
 * While WAITLIST_ENABLED is false this file does nothing: no markup is added to the
 * page and waitlist.css is never requested.
 *
 * The original form posted to Framer's hosted form backend, which does not exist
 * once the Framer plan ends, so this version posts to YOUR endpoint instead:
 *     POST <WAITLIST_ENDPOINT>
 *     Content-Type: application/json
 *     { "email": "name@example.com", "source": "ciniapp.com" }
 * Any 2xx response counts as success. Formspree, Basin, a Cloud Function, etc. all work
 * (for Formspree-style services, use their form URL; they accept JSON).
 * If WAITLIST_ENDPOINT is empty the button shows an error state instead of pretending to save.
 */
(function () {
  "use strict";

  var WAITLIST_ENABLED = false;
  var WAITLIST_ENDPOINT = "";

  if (!WAITLIST_ENABLED) return;

  var HTML =
    '<div class="cini-waitlist__card">' +
      '<div class="cini-waitlist__heading">' +
        '<h1 class="cini-waitlist__title">Join the waitlist</h1>' +
        '<p class="cini-waitlist__subtitle">be the first to know when we launch</p>' +
      "</div>" +
      '<form class="cini-waitlist__form" novalidate>' +
        '<label class="cini-waitlist__label">' +
          '<span class="cini-waitlist__sr">Email</span>' +
          '<input class="cini-waitlist__input" type="email" name="Email" placeholder="name@email.com" autocomplete="email" required>' +
        "</label>" +
        '<button class="cini-waitlist__button" type="submit">' +
          '<span class="cini-waitlist__text">Get Notified</span>' +
          '<span class="cini-waitlist__spinner" aria-hidden="true"></span>' +
          '<svg class="cini-waitlist__check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>' +
        "</button>" +
        '<span class="cini-waitlist__sr" role="status" aria-live="polite"></span>' +
      "</form>" +
    "</div>";

  var section = document.createElement("section");
  section.className = "cini-waitlist";
  section.id = "waitlist";
  section.innerHTML = HTML;

  var link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "/waitlist.css";
  document.head.appendChild(link);

  var form = section.querySelector("form");
  var input = section.querySelector("input");
  var button = section.querySelector("button");
  var label = section.querySelector(".cini-waitlist__text");
  var status = section.querySelector('[role="status"]');
  var busy = false;

  function setState(state, text) {
    button.classList.remove("is-loading", "is-success", "is-error");
    if (state) button.classList.add("is-" + state);
    label.textContent = text || "Get Notified";
    button.disabled = state === "loading" || state === "success";
    status.textContent = state === "success" ? "You're on the list." : state === "error" ? "Something went wrong. Please try again." : "";
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (busy) return;
    if (!input.value || !input.checkValidity()) { input.reportValidity(); return; }
    if (!WAITLIST_ENDPOINT) {
      console.warn("[waitlist] WAITLIST_ENDPOINT is not set in waitlist.js; nothing was saved.");
      setState("error", "Try again");
      return;
    }
    busy = true;
    setState("loading");
    fetch(WAITLIST_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email: input.value.trim(), source: "ciniapp.com" })
    }).then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      setState("success");
      input.value = "";
    }).catch(function (err) {
      console.warn("[waitlist] submit failed:", err);
      setState("error", "Try again");
    }).then(function () { busy = false; });
  });

  input.addEventListener("input", function () {
    if (button.classList.contains("is-error")) setState(null);
  });

  // Original order: phone mockup, waitlist, Features. Wait for Framer to finish
  // hydrating before touching its DOM, and re-place if the breakpoint swap detaches us.
  function place() {
    if (!section.isConnected) {
      var features = document.querySelector('[data-framer-name="Features"]');
      if (features && features.parentNode) features.parentNode.insertBefore(section, features);
      else document.body.appendChild(section);
    }
    // Framer orders page blocks with CSS `order` (some breakpoints), so a new block
    // would default to order 0 and jump to the top. Match the block it follows.
    var prev = section.previousElementSibling;
    section.style.order = prev ? getComputedStyle(prev).order : "";
  }
  function start() { setTimeout(place, 800); window.addEventListener("resize", function () { setTimeout(place, 300); }); }
  if (document.readyState === "complete") start();
  else window.addEventListener("load", start);
})();
