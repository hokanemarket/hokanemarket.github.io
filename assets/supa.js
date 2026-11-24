/* Hokane · conexión con Supabase: cuentas, productos y ajustes de la tienda */

(function () {
  // ⬇⬇ Pega aquí los dos datos de tu proyecto (Supabase → Project Settings → API Keys)
  const SUPA_URL = "https://wwpoksahzjmdslyruoiy.supabase.co";   // Project URL, p. ej. "https://abcd1234.supabase.co"
  const SUPA_KEY = "sb_publishable_EQ2kGrGm9T9e0n7z8ccPmg_xrc5yPMa";   // Clave "publishable" (o "anon public"). NUNCA la "secret".
  // ⬆⬆

  const HK = window.HK = window.HK || {};
  if (HK._supa) return;   // ya cargado
  HK._supa = true;
  const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[c]));
  HK.esc = esc;
  HK.ok = /^https:\/\/.+/.test(SUPA_URL) && SUPA_KEY.length > 20;

  let clientP = null;
  HK.client = () => clientP || (clientP = new Promise((resolve, reject) => {
    if (!HK.ok) return reject(new Error("La base de datos todavía no está configurada."));
    const make = () => resolve(window.supabase.createClient(SUPA_URL, SUPA_KEY));
    if (window.supabase && window.supabase.createClient) return make();
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
    s.onload = make;
    s.onerror = () => reject(new Error("No se pudo cargar la conexión con la base de datos."));
    document.head.appendChild(s);
  }));

  /* Productos y ajustes frescos de la base → copia local → repintar */
  HK.refresh = async () => {
    const db = await HK.client();
    const [p, s] = await Promise.all([
      db.from("products").select("*").order("sort").order("name"),
      db.from("settings").select("key,value")
    ]);
    if (p.error) throw p.error;
    if (s.error) throw s.error;
    const mi = await db.from("minis").select("id,category,name,description,model_url,sort,active").eq("active", true).order("sort").order("created_at");
    const d = {products: p.data, settings: Object.fromEntries(s.data.map(r => [r.key, r.value])), minis: mi.error ? [] : mi.data, t: Date.now()};
    try { localStorage.setItem("hk-db", JSON.stringify(d)); } catch (e) {}
    HK.data = d;
    HK.apply(d);
    document.dispatchEvent(new CustomEvent("hk:data"));
    return d;
  };

  /* Productos nuevos creados desde el panel: se dibujan en <div id="dbProducts" data-section="rol|colecciones"> */
  HK.renderGrid = () => {
    const el = document.getElementById("dbProducts");
    if (!el) return;
    const list = Object.entries(PRODUCTS)
      .filter(([, p]) => !p.builtin && p.section === el.dataset.section && p.name)
      .sort((a, b) => (a[1].sort || 0) - (b[1].sort || 0));
    const sec = el.closest("section");
    if (sec) sec.hidden = !list.length;
    el.innerHTML = list.map(([id, p]) => `<article class="pack dbp">
      ${p.img ? `<div class="dbp-img"><img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy"></div>` : ""}
      <h3>${esc(p.name)}</h3>
      ${p.desc ? `<p class="soft" style="font-size:.95rem">${esc(p.desc)}</p>` : ""}
      ${p.model ? `<button class="btn line small" type="button" data-view3d="${esc(p.model)}" data-name="${esc(p.name)}">Ver en 3D</button>` : ""}
      <div class="price num">${euro(p.price)}</div>
      <button class="btn small" type="button" data-add="${esc(id)}">Añadir al carrito</button>
    </article>`).join("");
    HK.paintSales && HK.paintSales();
  };

  /* Visor 3D para los productos nuevos (se carga solo si alguien lo abre) */
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-view3d]");
    if (!b) return;
    if (!customElements.get("model-viewer")) {
      const s = document.createElement("script");
      s.type = "module";
      s.src = "https://cdn.jsdelivr.net/npm/@google/model-viewer@4/dist/model-viewer.min.js";
      document.head.appendChild(s);
    }
    let d = document.getElementById("dlg3d");
    if (!d) {
      d = document.createElement("dialog");
      d.id = "dlg3d";
      d.className = "dlg3d";
      d.innerHTML = `<div class="dlg3d-top"><b id="dlg3dName"></b><button class="btn line small" type="button" id="dlg3dClose">Cerrar</button></div>
        <model-viewer id="dlg3dView" camera-controls auto-rotate shadow-intensity="1" exposure="1.05" style="width:100%;height:min(70vh,560px);background:var(--paper,#f4f1ea);border-radius:14px"></model-viewer>
        <p class="soft" style="font-size:.85rem;margin-top:8px">Arrastra para girar · rueda o pellizco para acercar</p>`;
      document.body.appendChild(d);
      d.querySelector("#dlg3dClose").onclick = () => d.close();
      d.addEventListener("click", ev => { if (ev.target === d) d.close(); });
    }
    d.querySelector("#dlg3dName").textContent = b.dataset.name || "";
    d.querySelector("#dlg3dView").setAttribute("src", b.dataset.view3d);
    d.showModal ? d.showModal() : d.setAttribute("open", "");
  });

  document.addEventListener("hk:data", HK.renderGrid);
  HK.renderGrid();

  /* Icono de cuenta: marcado si hay sesión */
  if (HK.ok) {
    HK.client().then(db => db.auth.getSession()).then(({data}) => {
      const a = document.getElementById("accountBtn");
      if (a && data && data.session) { a.classList.add("on"); a.setAttribute("aria-label", "Mi cuenta (sesión iniciada)"); }
    }).catch(() => {});
    HK.refresh().catch(err => console.warn("Hokane: se usan los datos guardados.", err && err.message));
  }
  document.dispatchEvent(new CustomEvent("hk:supa"));
})();
