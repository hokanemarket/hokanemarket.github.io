/* Hokane · catálogo de minis con visor 3D giratorio */
(function () {
  const CATS = [
    {id: "goblins", name: "Horda goblin", desc: "Una banda de goblins con jefe, chamán y tropa.", scale: "28 mm", pack: "rol-goblin", dir: "modelos/goblins/", v: 3,
     minis: [
      ["jefe", "Jefe goblin", "Lidera la horda con estandarte y mala leche."],
      ["chaman", "Chamán", "Bastón de hueso, plumas y conjuros dudosos."],
      ["bombardero", "Bombardero", "Lleva la bomba encendida y ningún plan B."],
      ["lancero", "Lancero", "Primera fila: lanza larga y escudo."],
      ["arquero", "Arquero", "Dispara desde atrás, cuando nadie mira."],
      ["ballestero_a", "Ballestero I", "Ballesta cargada y apuntando."],
      ["ballestero_b", "Ballestero II", "Recargando para la siguiente ronda."]
     ]},
    {id: "aventureros", name: "Grupo de aventureros", desc: "Catorce héroes para tu partida: guerreros, magos, pícaros, clérigos, exploradores, arqueros y cartógrafos.", scale: "32 mm", pack: "rol-grupo", dir: "modelos/aventureros/", v: 1,
     minis: [
      ["guerrero", "Guerrero", "Espada y escudo, siempre en primera línea."],
      ["guerrera", "Guerrera", "Armadura ligera y escudo redondo."],
      ["mago_elfo", "Mago elfo", "Bastón de cristal y grimorio abierto."],
      ["maga_elfa", "Maga elfa", "Túnica bordada y bastón arcano."],
      ["picaro", "Pícaro", "Encapuchado, con una daga en cada mano."],
      ["picara", "Pícara", "Agazapada y lista para el golpe."],
      ["clerigo_enano", "Clérigo enano", "Maza, escudo solar y barba trenzada."],
      ["enana_clerigo", "Clériga enana", "Maza en alto y escudo sagrado."],
      ["explorador", "Explorador", "Capa de viaje y espada corta."],
      ["exploradora", "Exploradora", "Carcaj a la espalda y hoja en mano."],
      ["arquero", "Arquero", "Flecha cargada y apuntando."],
      ["arquera_elfa", "Arquera elfa", "Tensando el arco, capa al viento."],
      ["cartografo", "Cartógrafo", "Gafas, mochila y mapa desplegado."],
      ["cartografa", "Cartógrafa", "Libro de rutas y brújula."]
     ]},
    {id: "nomuertos", name: "Guardia no muerta", desc: "Un necromante y su guardia de esqueletos.", scale: "28 mm", pack: "rol-nomuerta", dir: "modelos/nomuertos/", v: 2,
     minis: [
      ["necromante", "Necromante", "Bastón de hueso, grimorio y muy pocos amigos vivos."],
      ["espadachin", "Esqueleto espadachín", "Espada en alto y escudo con calavera."],
      ["lancero", "Esqueleto lancero", "Casco con cuernos, lanza larga y escudo torre."],
      ["arquero", "Esqueleto arquero", "Arco corto y carcaj a mano. Paciencia eterna."],
      ["ballestero", "Esqueleto ballestero", "Apunta desde la segunda fila. Nunca parpadea."]
     ]}
  ];
  CATS.push({id: "monstruos", name: "Monstruos y jefes", desc: "Dragones, trolls y jefes finales para tus partidas.", scale: "32 mm", minis: []});
  // Minis añadidas desde el panel de administración (se guardan en la base de datos)
  const base = CATS.map(c => ({...c, minis: c.minis.slice()}));
  function mergeDb() {
    let extra = []; try { extra = (JSON.parse(localStorage.getItem("hk-db") || "null") || {}).minis || []; } catch (e) {}
    CATS.length = 0;
    base.forEach(c => {
      const add = extra.filter(m => m.category === c.id).map(m => [m.model_url, m.name, m.description || "", true]);
      const minis = c.minis.concat(add);
      CATS.push({...c, minis, soon: minis.length ? false : true});
    });
  }
  mergeDb();
  const catsEl = document.getElementById("miniCats"), gal = document.getElementById("miniGal");
  if (!catsEl || !gal) return;
  const REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const has3D = !!(window.THREE && THREE.GLTFLoader);

  const paintCats = () => catsEl.innerHTML = CATS.map(c => `<button type="button" class="mcat${c.soon ? " soon" : ""}" data-cat="${c.id}" ${c.soon ? "disabled" : ""}>
    <span class="mcat-top"><span>${c.soon ? "Próximamente" : c.minis.length + (c.minis.length === 1 ? " modelo" : " modelos")}</span><span>${c.scale}</span></span>
    <b>${c.name}</b><small>${c.desc}</small></button>`).join("");
  paintCats();

  let viewers = [];
  function stopAll() { viewers.forEach(v => v.dispose()); viewers = []; }

  function viewer(canvas, url, fitH, zoomable) {
    const r = new THREE.WebGLRenderer({canvas, antialias: true, alpha: true});
    r.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    if (r.outputEncoding !== undefined) r.outputEncoding = THREE.sRGBEncoding;
    const s = new THREE.Scene(), cam = new THREE.PerspectiveCamera(30, 1, 1, 1000);
    s.add(new THREE.HemisphereLight(0xffffff, 0x55524e, .55));
    const k = new THREE.DirectionalLight(0xffffff, .85); k.position.set(40, 80, 60); s.add(k);
    const f = new THREE.DirectionalLight(0xffffff, .35); f.position.set(-60, 20, 30); s.add(f);
    const rim = new THREE.DirectionalLight(0xffffff, .4); rim.position.set(0, 40, -80); s.add(rim);
    const holder = new THREE.Group(); s.add(holder);
    let alive = true, visible = true, drag = null, rot = 0, vel = 0, p0 = null, zf = 1;
    const tgt = new THREE.Vector3(0, 23, 0);
    const setZ = z => { zf = Math.min(1, Math.max(.4, z)); if (p0) { cam.position.copy(tgt).addScaledVector(p0.clone().sub(tgt), zf); cam.lookAt(tgt); } };
    if (zoomable) canvas.addEventListener("wheel", e => { e.preventDefault(); setZ(zf * (e.deltaY > 0 ? 1.1 : .9)); }, {passive: false});
    const fit = () => { const b = canvas.getBoundingClientRect(); if (!b.width) return; r.setSize(b.width, b.height, false); cam.aspect = b.width / b.height; cam.updateProjectionMatrix(); };
    fit(); addEventListener("resize", fit);
    (function(){const L=new THREE.GLTFLoader(); if (window.MeshoptDecoder) L.setMeshoptDecoder(MeshoptDecoder); return L;})().load(url, g => {
      const mat = new THREE.MeshStandardMaterial({color: 0x6f7378, roughness: .5, metalness: .08});
      g.scene.traverse(o => { if (o.isMesh) { o.material = mat; if (!o.geometry.attributes.normal) o.geometry.computeVertexNormals(); } });
      if (fitH) { g.scene.updateMatrixWorld(true); const h0 = new THREE.Box3().setFromObject(g.scene).getSize(new THREE.Vector3()).y || 1; g.scene.scale.multiplyScalar(fitH / h0); g.scene.updateMatrixWorld(true); }
      const box = new THREE.Box3().setFromObject(g.scene), size = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
      g.scene.updateMatrixWorld(true); let bx0=Infinity,bx1=-Infinity,bz0=Infinity,bz1=-Infinity; const P=new THREE.Vector3(); g.scene.traverse(o=>{ if(!o.isMesh) return; const pa=o.geometry.attributes.position; for(let i=0;i<pa.count;i+=3){ P.fromBufferAttribute(pa,i).applyMatrix4(o.matrixWorld); if(P.y<box.min.y+size.y*0.03){ bx0=Math.min(bx0,P.x); bx1=Math.max(bx1,P.x); bz0=Math.min(bz0,P.z); bz1=Math.max(bz1,P.z);} } }); const cx=isFinite(bx0)?(bx0+bx1)/2:c.x, cz=isFinite(bz0)?(bz0+bz1)/2:c.z; g.scene.position.set(-cx, -box.min.y, -cz);
      holder.add(g.scene);
      const diag = Math.hypot(size.x, size.z) + 2 * Math.hypot(c.x - cx, c.z - cz), vf = cam.fov * Math.PI / 360, hf = Math.atan(Math.tan(vf) * cam.aspect);
      // cámara fija igual para todas: misma escala (todas tienen peana de 25 mm)
      const VIEW = 58, d = Math.max(VIEW / 2 / Math.tan(vf), 46 / 2 / Math.tan(hf));
      cam.position.set(0, 25 + d * .16, d); cam.lookAt(0, 23, 0); p0 = cam.position.clone();
      canvas.parentElement.classList.add("ready");
    }, undefined, () => canvas.parentElement.classList.add("err"));
    canvas.addEventListener("pointerdown", e => { drag = e.clientX; vel = 0; canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener("pointermove", e => { if (drag === null) return; const d = (e.clientX - drag) * .012; rot += d; vel = d; drag = e.clientX; });
    const up = () => { drag = null; }; canvas.addEventListener("pointerup", up); canvas.addEventListener("pointercancel", up);
    const io = new IntersectionObserver(es => { visible = es[0].isIntersecting; }); io.observe(canvas);
    (function loop() {
      if (!alive) return;
      if (visible) {
        if (drag === null) { vel *= .94; rot += vel + (REDUCE ? 0 : .008); }
        holder.rotation.y = rot; r.render(s, cam);
      }
      requestAnimationFrame(loop);
    })();
    return {zoom(d) { setZ(zf * (d > 0 ? .8 : 1.25)); }, dispose() { alive = false; io.disconnect(); removeEventListener("resize", fit); r.dispose(); }};
  }

  function open(id, scroll) {
    const c = CATS.find(x => x.id === id && !x.soon); if (!c) return;
    catsEl.querySelectorAll(".mcat").forEach(b => b.setAttribute("aria-pressed", b.dataset.cat === id));
    stopAll();
    const p = (typeof PRODUCTS !== "undefined" ? PRODUCTS : {})[c.pack], pk = PICK[c.id];
    gal.hidden = false;
    gal.innerHTML = `<div class="mgal-head"><div><span class="label">Categoría</span><h2>${c.name}</h2>
      <p class="soft">Gira cada mini arrastrando. Resina gris sin pintar, base de 25 mm con la marca Hokane.</p></div>
      ${p ? `<div class="mgal-buy"><span class="price num">${p.price} €</span>${(typeof CONFIG !== "undefined" && !CONFIG.salesOpen) ? `<button class="btn" type="button" disabled title="La tienda abre muy pronto">Próximamente</button>` : `<button class="btn" type="button" data-add="${c.pack}">Añadir el pack <span class="arrow">→</span></button>`}</div>` : ""}</div>
      <div class="mgrid">${c.minis.map(([file, name, txt], i) => `<figure class="mini3d" data-i="${i}"><div class="mstage">${has3D ? `<canvas aria-label="Modelo 3D de ${(window.HK && HK.esc) ? HK.esc(name) : name}"></canvas>` : ""}<span class="mload">Cargando 3D…</span></div>
      <figcaption><b>${(window.HK && HK.esc) ? HK.esc(name) : name}</b><small>${(window.HK && HK.esc) ? HK.esc(txt) : txt}</small></figcaption>
      <div class="mini-acts">${has3D ? `<button type="button" class="btn line small" data-big="${i}">Ver en grande</button>` : ""}${pk ? `<button type="button" class="btn line small mpick" data-pick="${i}" aria-pressed="false">Elegir</button>` : ""}</div></figure>`).join("")}</div>
      ${pk ? `<div class="mpickbar" id="pickBar"><span id="pickTxt" class="soft">${esc(pk.hint)}</span><span class="mpb-acts"><button type="button" class="btn line small" id="pickClear" hidden>Quitar selección</button><button type="button" class="btn small" id="pickAdd" disabled>Añadir al carrito</button></span></div>` : ""}`;
    sel = []; cur = c; paintPick();
    if (has3D) gal.querySelectorAll("canvas").forEach((cv, i) => { const m = c.minis[i];
      viewers.push(m[3] ? viewer(cv, m[0], c.id === "monstruos" ? 52 : 40) : viewer(cv, c.dir + m[0] + ".glb?v=" + (c.v || 1))); });
    if (location.hash !== "#" + id) history.replaceState(null, "", "#" + id);
    if (scroll) gal.scrollIntoView({behavior: REDUCE ? "auto" : "smooth", block: "start"});
  }

  /* ---------- Elegir minis para los packs ---------- */
  const esc = v => (window.HK && HK.esc) ? HK.esc(v) : String(v);
  const PICK = {
    aventureros: {pack: "rol-grupo", size: 5, single: "rol-suelta", hint: "Marca 5 héroes para el pack, o los que quieras sueltos."},
    goblins: {single: "rol-tropa", three: "rol-tropa3", hint: "¿Te faltan tropas? Marca las que quieras sueltas."},
    nomuertos: {single: "rol-tropa", three: "rol-tropa3", hint: "¿Te faltan tropas? Marca las que quieras sueltas."}
  };
  let sel = [], cur = null;
  const P = () => (typeof PRODUCTS !== "undefined" ? PRODUCTS : {});
  const eur = n => (typeof euro === "function") ? euro(n) : n.toFixed(2) + " €";
  function lines() {
    const pk = cur && PICK[cur.id]; if (!pk || !sel.length) return [];
    const names = sel.map(i => cur.minis[i][1]), out = [], tag = n => (cur.name + ": " + n.join(", ")).slice(0, 300);
    let rest = names;
    if (pk.pack && P()[pk.pack]) { while (rest.length >= pk.size) { out.push({id: pk.pack, qty: 1, opt: tag(rest.slice(0, pk.size))}); rest = rest.slice(pk.size); } }
    if (pk.three && P()[pk.three] && rest.length >= 3) { const k = Math.floor(rest.length / 3); out.push({id: pk.three, qty: k, opt: tag(rest.slice(0, 3 * k))}); rest = rest.slice(3 * k); }
    if (rest.length && P()[pk.single]) out.push({id: pk.single, qty: rest.length, opt: tag(rest)});
    return out;
  }
  function paintPick() {
    const bar = document.getElementById("pickBar"); if (!bar) return;
    gal.querySelectorAll(".mini3d").forEach(f => { const on = sel.includes(+f.dataset.i); f.classList.toggle("picked", on); const b = f.querySelector(".mpick"); if (b) { b.setAttribute("aria-pressed", on); b.textContent = on ? "Elegida ✓" : "Elegir"; } });
    const L = lines(), tot = L.reduce((a, l) => a + P()[l.id].price * l.qty, 0), pk = PICK[cur.id];
    const desc = L.map(l => l.id === pk.pack ? "pack de " + pk.size : l.id === pk.three ? l.qty + "× pack de 3" : l.qty + (l.qty === 1 ? " suelta" : " sueltas")).join(" + ");
    document.getElementById("pickTxt").innerHTML = sel.length ? `<b>${sel.length} elegida${sel.length === 1 ? "" : "s"}</b> · ${desc} · <b class="num">${eur(tot)}</b>` : esc(pk.hint);
    const add = document.getElementById("pickAdd"), closed = typeof CONFIG !== "undefined" && !CONFIG.salesOpen;
    add.disabled = !L.length || closed; add.textContent = closed ? "Próximamente" : "Añadir al carrito";
    document.getElementById("pickClear").hidden = !sel.length;
    bar.classList.toggle("on", !!sel.length);
  }
  gal.addEventListener("click", e => {
    const pb = e.target.closest("[data-pick]");
    if (pb) { const i = +pb.dataset.pick; sel = sel.includes(i) ? sel.filter(x => x !== i) : sel.concat(i); paintPick(); return; }
    const bb = e.target.closest("[data-big]");
    if (bb) { big(+bb.dataset.big); return; }
    if (e.target.closest("#pickClear")) { sel = []; paintPick(); return; }
    if (e.target.closest("#pickAdd")) {
      if (typeof CONFIG !== "undefined" && !CONFIG.salesOpen) return;
      lines().forEach(l => Cart.add(l.id, l.qty, l.opt));
      sel = []; paintPick();
    }
  });
  gal.addEventListener("dblclick", e => { const f = e.target.closest(".mini3d"); if (f && has3D) big(+f.dataset.i); });
  // Desde un botón de pack que necesita elegir (p. ej. el de la lista de packs)
  if (window.HK) HK.pickFor = id => {
    const cat = (HK.PICK_CAT || {})[id] || "aventureros";
    if (!cur || !PICK[cur.id] || (cur.id !== cat && !(cat === "goblins" && cur.id === "nomuertos"))) open(cat, true); else gal.scrollIntoView({behavior: REDUCE ? "auto" : "smooth", block: "start"});
    if (typeof toast === "function") toast(id === "rol-grupo" ? "Marca 5 héroes en el catálogo y pulsa «Añadir al carrito»" : id === "rol-suelta" ? "Marca los héroes que quieras en el catálogo" : "Marca las tropas que quieras (goblins o esqueletos)");
  };

  /* ---------- Ver una mini en grande ---------- */
  let bigV = null;
  function big(i) {
    if (!cur || !has3D) return; const m = cur.minis[i]; if (!m) return;
    let d = document.getElementById("miniBig");
    if (!d) {
      d = document.createElement("dialog"); d.id = "miniBig"; d.className = "dlg3d";
      d.innerHTML = `<div class="dlg3d-top"><b id="mbName"></b><span class="mbz"><button class="btn line small" type="button" data-z="-1" aria-label="Alejar">−</button><button class="btn line small" type="button" data-z="1" aria-label="Acercar">+</button><button class="btn line small" type="button" id="mbClose">Cerrar</button></span></div>
        <div id="mbStage"></div><p class="soft" id="mbTxt" style="margin:10px 0 0"></p>`;
      document.body.appendChild(d);
      d.querySelector("#mbClose").onclick = () => d.close();
      d.addEventListener("click", e => { const z = e.target.closest("[data-z]"); if (z && bigV) bigV.zoom(+z.dataset.z); if (e.target === d) d.close(); });
      d.addEventListener("close", () => { if (bigV) bigV.dispose(); bigV = null; d.querySelector("#mbStage").innerHTML = ""; });
    }
    d.querySelector("#mbName").textContent = m[1];
    d.querySelector("#mbTxt").textContent = (m[2] || "") + " Arrastra para girar; rueda o +/− para acercar.";
    d.querySelector("#mbStage").innerHTML = `<div class="mstage mbig"><canvas aria-label="Modelo 3D de ${esc(m[1])} en grande"></canvas><span class="mload">Cargando 3D…</span></div>`;
    d.showModal();
    const cv = d.querySelector("#mbStage canvas");
    bigV = m[3] ? viewer(cv, m[0], cur.id === "monstruos" ? 52 : 40, true) : viewer(cv, cur.dir + m[0] + ".glb?v=" + (cur.v || 1), undefined, true);
  }

  catsEl.addEventListener("click", e => { const b = e.target.closest(".mcat"); if (b && !b.disabled) open(b.dataset.cat, true); });
  open((location.hash || "").slice(1) || "goblins", !!location.hash);
  addEventListener("hashchange", () => { const h = (location.hash || "").slice(1); if (h && (!cur || cur.id !== h) && CATS.some(c => c.id === h && !c.soon)) open(h, true); });
  // si llegan minis nuevas de la base, repintar
  document.addEventListener("hk:data", () => {
    const before = JSON.stringify(CATS.map(c => c.minis.length)); mergeDb();
    if (JSON.stringify(CATS.map(c => c.minis.length)) === before) return;
    paintCats(); const cur = (location.hash || "").slice(1) || "goblins"; open(CATS.some(c => c.id === cur && !c.soon) ? cur : "goblins", false);
  });
})();
