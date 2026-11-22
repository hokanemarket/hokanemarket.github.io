/* Hokane · lógica común a todas las páginas */
document.documentElement.classList.add("js");

const CONFIG = {
  // Cambia a true para abrir la tienda y permitir compras.
  salesOpen: false,
  email: "hokanemarket@gmail.com",
  // Pega aquí el Client ID de tu cuenta PayPal Business para activar el pago online.
  paypalClientId: "BAATOfskCvDsNSaRFFsLZoj1SdUR9JoZqyToYAZx18fjr0bY0c_AVJBbbAiKYw_nZdjsnQ4s8z81-Be_Cs",
  currency: "EUR",
  shipping: [
    {id: "recogida", label: "Recogida en mano en Madrid", price: 0},
    {id: "envio", label: "Envío a España peninsular", price: 4.95}
  ]
};

/* ---------- Catálogo ---------- */
const COLLECTIONS = [
  {
    id: "c01", num: "01", name: "Los Guardianes", status: "soon",
    blurb: "Pequeños seres de piedra con una runa encendida dentro. Cada uno guarda una emoción.",
    size: "7–9 cm", boxPrice: 13, setPrice: 70, secretOdds: 12, edition: "Limitada",
    figs: [
      {key: "grieta", name: "Grieta", desc: "Brilla por donde se rompió.", c: "#d6402a"},
      {key: "musgo", name: "Musgo", desc: "Le ha crecido un jardín encima.", c: "#6f8f4e"},
      {key: "brasa", name: "Brasa", desc: "Nunca se apaga del todo.", c: "#e2862f"},
      {key: "niebla", name: "Niebla", desc: "Aparece cuando nadie mira.", c: "#8aa0b3"},
      {key: "eco", name: "Eco", desc: "Repite lo último que oyó.", c: "#9a82c4"},
      {key: "lunes", name: "Lunes", desc: "Siempre tiene sueño.", c: "#9b968e"},
      {key: "secreta", name: "???", reveal: "Runa Dorada", desc: "La figura secreta.", c: "#d6402a", secret: true}
    ]
  },
  {id: "c02", num: "02", name: "Por anunciar", status: "future", blurb: "La segunda caja ya está en el taller."},
  {id: "c03", num: "03", name: "Por anunciar", status: "future", blurb: "Una colección nueva cada 2–3 meses."}
];

const PRODUCTS = {
  "c01-box": {name: "Caja sorpresa · Colección 01", price: 13, thumb: "01"},
  "c01-set": {name: "Colección 01 completa (6 figuras)", price: 70, thumb: "01"},
  "rol-grupo": {name: "Grupo de aventureros (5 minis)", price: 15, thumb: "R"},
  "rol-goblin": {name: "Horda goblin (10 minis)", price: 25, thumb: "R"},
  "rol-nomuerta": {name: "Guardia no muerta (5 minis)", price: 15, thumb: "R"},
  "rol-suelta": {name: "Mini suelta", price: 5, thumb: "R"}
};

function figArt(f, on = true) {
  const eye = on ? f.c : "#bdb7ad";
  const extra =
    (f.key === "musgo" ? '<path d="M24 22c4-8 28-8 32 0-6-3-26-3-32 0z" fill="#6f8f4e"/>' : "") +
    (f.key === "brasa" ? '<path d="M40 2c5 6 6 10 0 14-6-4-5-8 0-14z" fill="#e2862f"/>' : "") +
    (f.key === "grieta" ? '<path d="M44 14l-3 6 4 3-3 5" stroke="#d6402a" stroke-width="1.8" fill="none"/>' : "") +
    (f.key === "niebla" ? '<path d="M20 20h14M46 18h12M24 14h10" stroke="#8aa0b3" stroke-width="2" stroke-linecap="round"/>' : "") +
    (f.key === "eco" ? '<path d="M60 26c3 3 3 9 0 12M65 22c5 5 5 15 0 20" stroke="#9a82c4" stroke-width="1.8" fill="none" stroke-linecap="round"/>' : "") +
    (f.key === "lunes" ? '<text x="52" y="14" font-size="9" font-weight="700" fill="#9b968e" font-family="sans-serif">z z</text>' : "") +
    (f.secret && !on ? '<text x="40" y="36" text-anchor="middle" font-size="18" font-weight="800" fill="#fff" font-family="sans-serif">?</text>' : "") +
    (f.secret && on ? '<path d="M28 10l5 5 7-8 7 8 5-5-2 9H30z" fill="#d4a73a"/>' : "");
  return `<svg viewBox="0 0 80 80" aria-hidden="true"><ellipse cx="40" cy="72" rx="22" ry="4" fill="#000" opacity=".08"/><path d="M24 70c-3-14 1-26 16-26s19 12 16 26z" fill="#8b8f95"/><ellipse cx="18" cy="56" rx="5" ry="8" fill="#80848a"/><ellipse cx="62" cy="56" rx="5" ry="8" fill="#80848a"/><circle cx="40" cy="30" r="18" fill="#9a9ea4"/><circle cx="33" cy="31" r="2.8" fill="${eye}"/><circle cx="47" cy="31" r="2.8" fill="${eye}"/><path d="M37 50v12M37 51l7 4-7 3 7 4" stroke="${eye}" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>${extra}</svg>`;
}

function cubeHTML(num, opts = {}) {
  const cls = ["cube", opts.big ? "big" : "", opts.ghost ? "ghost" : ""].join(" ");
  return `<div class="${cls}" ${opts.id ? `id="${opts.id}"` : ""}><div class="s f">hokane</div><div class="s b"></div><div class="s r">${opts.ghost ? "" : "?"}</div><div class="s l">${num}</div><div class="s u"></div><div class="s d"></div></div>`;
}

const euro = n => n.toLocaleString("es-ES", {style: "currency", currency: "EUR"});

/* ---------- Cabecera y pie compartidos ---------- */
const PAGES = [
  ["index.html", "Inicio", "inicio"],
  ["colecciones.html", "Colecciones", "colecciones"],
  ["rol.html", "Rol", "rol"],
  ["encargos.html", "Encargos", "encargos"],
  ["ayuda.html", "Ayuda", "ayuda"]
];
(function chrome() {
  const page = document.body.dataset.page;
  const h = document.getElementById("site-header");
  if (h) {
    h.className = "site";
    h.innerHTML = `<div class="wrap">
      <a class="logo" href="index.html" aria-label="Hokane, inicio">hokane<i></i></a>
      <nav class="main" id="mainNav" aria-label="Páginas">${PAGES.slice(1).map(([href, label, key]) => `<a href="${href}"${key === page ? ' aria-current="page"' : ""}>${label}</a>`).join("")}</nav>
      <div class="tools">
        <button class="icon-btn" id="themeBtn" type="button" aria-label="Cambiar entre modo día y modo noche">
          <svg class="i-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>
          <svg class="i-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
        </button>
        <a class="icon-btn" href="carrito.html" aria-label="Carrito"${page === "carrito" ? ' aria-current="page"' : ""}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8h14l-1.5 12h-11z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>
          <span class="cart-count" id="cartCount"></span>
        </a>
        <button class="icon-btn menu-btn" id="menuBtn" type="button" aria-label="Abrir menú" aria-expanded="false">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
        </button>
      </div></div>`;
  }
  const f = document.getElementById("site-footer");
  if (f) {
    f.className = "site";
    f.innerHTML = `<div class="wrap"><span class="logo">hokane<i></i></span>
      <div class="meta"><span>Estudio de figuras de resina · Madrid</span>
      <span><a href="ayuda.html#comprar">Cómo comprar</a> · <a href="ayuda.html#faq">Preguntas</a> · <a href="mailto:${CONFIG.email}">${CONFIG.email}</a></span></div></div>`;
  }
  document.getElementById("menuBtn")?.addEventListener("click", e => {
    const nav = document.getElementById("mainNav"); const open = nav.classList.toggle("open");
    e.currentTarget.setAttribute("aria-expanded", open);
  });
})();

/* ---------- Tema ---------- */
(function theme() {
  const r = document.documentElement;
  let s = null; try { s = localStorage.getItem("hk-theme"); } catch (e) {}
  if (s) r.dataset.theme = s;
  document.getElementById("themeBtn")?.addEventListener("click", () => {
    const dark = r.dataset.theme ? r.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    r.dataset.theme = dark ? "light" : "dark";
    try { localStorage.setItem("hk-theme", r.dataset.theme); } catch (e) {}
  });
})();

/* ---------- Carrito (se guarda en el navegador) ---------- */
const Cart = (function () {
  let mem = [];
  const read = () => { try { return JSON.parse(localStorage.getItem("hk-cart") || "[]"); } catch (e) { return mem; } };
  const write = items => { mem = items; try { localStorage.setItem("hk-cart", JSON.stringify(items)); } catch (e) {} paintCount(); };
  function paintCount() { const n = read().reduce((a, i) => a + i.qty, 0); const el = document.getElementById("cartCount"); if (el) el.textContent = n ? n : ""; }
  return {
    items: read,
    add(id, qty = 1) { const it = read(); const f = it.find(i => i.id === id); f ? f.qty += qty : it.push({id, qty}); write(it); toast(`${PRODUCTS[id].name} añadido`, true); },
    set(id, qty) { let it = read(); it = qty > 0 ? it.map(i => i.id === id ? {...i, qty} : i) : it.filter(i => i.id !== id); write(it); },
    clear() { write([]); },
    subtotal() { return read().reduce((a, i) => a + (PRODUCTS[i.id]?.price || 0) * i.qty, 0); },
    paintCount
  };
})();
Cart.paintCount();
document.addEventListener("click", e => {
  const b = e.target.closest("[data-add]"); if (!b) return;
  if (!CONFIG.salesOpen) { toast("La tienda abre muy pronto"); return; }
  const q = b.dataset.qtyFrom ? Math.max(1, parseInt(document.querySelector(b.dataset.qtyFrom).value || "1", 10)) : 1;
  Cart.add(b.dataset.add, q);
});

function toast(msg, withLink) {
  let t = document.querySelector(".toast");
  if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
  t.innerHTML = msg + (withLink ? ' · <a href="carrito.html">Ver carrito</a>' : "");
  t.classList.add("show"); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), 2600);
}

/* ---------- Pedidos por correo (presupuestos y respaldo) ---------- */
(function orderDialog() {
  const d = document.createElement("dialog"); d.id = "dlg"; d.setAttribute("aria-labelledby", "dTitle");
  d.innerHTML = `<h3 id="dTitle" style="font-size:1.4rem">Tu mensaje</h3>
    <p class="soft" style="margin-top:6px">Cópialo y envíalo por correo. Te respondemos con el precio, el pago y la fecha.</p>
    <pre id="dText"></pre><p class="soft" style="font-size:.9rem">Correo: <b style="color:var(--ink)">${CONFIG.email}</b></p>
    <div class="dacts" style="margin-top:14px"><button class="btn" type="button" id="dCopy">Copiar mensaje</button>
    <a class="btn line" id="dMail" href="#">Abrir correo</a><button class="btn line" type="button" id="dClose">Cerrar</button></div>
    <div class="note" id="dNote" role="status"></div>`;
  document.body.appendChild(d);
  window.openOrder = text => {
    document.getElementById("dText").textContent = text;
    document.getElementById("dMail").href = "mailto:" + CONFIG.email + "?subject=" + encodeURIComponent("Pedido Hokane") + "&body=" + encodeURIComponent(text);
    document.getElementById("dNote").textContent = "";
    d.showModal ? d.showModal() : d.setAttribute("open", "");
  };
  document.getElementById("dClose").onclick = () => d.close();
  document.getElementById("dCopy").onclick = async () => {
    try { await navigator.clipboard.writeText(document.getElementById("dText").textContent); document.getElementById("dNote").textContent = "Copiado. Pégalo en tu correo."; }
    catch (e) { document.getElementById("dNote").textContent = "No se pudo copiar: selecciona el texto y cópialo."; }
  };
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-order]");
    if (b) openOrder("Hola, me interesa: " + b.dataset.order + ".\n\nMi nombre:\nRecogida en Madrid o envío (ciudad):");
  });
})();

/* ---------- Aparición al hacer scroll ---------- */
window.addEventListener("DOMContentLoaded", () => {
  if (!CONFIG.salesOpen) document.querySelectorAll("[data-add]").forEach(b => { b.disabled = true; b.textContent = "Próximamente"; b.title = "La tienda abre muy pronto"; });
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), {threshold: .1});
    document.querySelectorAll(".rise").forEach((el, i) => { el.style.transitionDelay = (i % 4) * 70 + "ms"; io.observe(el); });
  } else document.querySelectorAll(".rise").forEach(el => el.classList.add("in"));
});
