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
  const catsEl = document.getElementById("miniCats"), gal = document.getElementById("miniGal");
  if (!catsEl || !gal) return;
  const REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const has3D = !!(window.THREE && THREE.GLTFLoader);

  catsEl.innerHTML = CATS.map(c => `<button type="button" class="mcat${c.soon ? " soon" : ""}" data-cat="${c.id}" ${c.soon ? "disabled" : ""}>
    <span class="mcat-top"><span>${c.soon ? "Próximamente" : c.minis.length + " modelos"}</span><span>${c.scale}</span></span>
    <b>${c.name}</b><small>${c.desc}</small></button>`).join("");

  let viewers = [];
  function stopAll() { viewers.forEach(v => v.dispose()); viewers = []; }

  function viewer(canvas, url) {
    const r = new THREE.WebGLRenderer({canvas, antialias: true, alpha: true});
    r.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    if (r.outputEncoding !== undefined) r.outputEncoding = THREE.sRGBEncoding;
    const s = new THREE.Scene(), cam = new THREE.PerspectiveCamera(30, 1, 1, 1000);
    s.add(new THREE.HemisphereLight(0xffffff, 0x55524e, .55));
    const k = new THREE.DirectionalLight(0xffffff, .85); k.position.set(40, 80, 60); s.add(k);
    const f = new THREE.DirectionalLight(0xffffff, .35); f.position.set(-60, 20, 30); s.add(f);
    const rim = new THREE.DirectionalLight(0xffffff, .4); rim.position.set(0, 40, -80); s.add(rim);
    const holder = new THREE.Group(); s.add(holder);
    let alive = true, visible = true, drag = null, rot = 0, vel = 0;
    const fit = () => { const b = canvas.getBoundingClientRect(); if (!b.width) return; r.setSize(b.width, b.height, false); cam.aspect = b.width / b.height; cam.updateProjectionMatrix(); };
    fit(); addEventListener("resize", fit);
    (function(){const L=new THREE.GLTFLoader(); if (window.MeshoptDecoder) L.setMeshoptDecoder(MeshoptDecoder); return L;})().load(url, g => {
      const mat = new THREE.MeshStandardMaterial({color: 0x6f7378, roughness: .5, metalness: .08});
      g.scene.traverse(o => { if (o.isMesh) { o.material = mat; if (!o.geometry.attributes.normal) o.geometry.computeVertexNormals(); } });
      const box = new THREE.Box3().setFromObject(g.scene), size = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
      g.scene.updateMatrixWorld(true); let bx0=Infinity,bx1=-Infinity,bz0=Infinity,bz1=-Infinity; const P=new THREE.Vector3(); g.scene.traverse(o=>{ if(!o.isMesh) return; const pa=o.geometry.attributes.position; for(let i=0;i<pa.count;i+=3){ P.fromBufferAttribute(pa,i).applyMatrix4(o.matrixWorld); if(P.y<box.min.y+size.y*0.03){ bx0=Math.min(bx0,P.x); bx1=Math.max(bx1,P.x); bz0=Math.min(bz0,P.z); bz1=Math.max(bz1,P.z);} } }); const cx=isFinite(bx0)?(bx0+bx1)/2:c.x, cz=isFinite(bz0)?(bz0+bz1)/2:c.z; g.scene.position.set(-cx, -box.min.y, -cz);
      holder.add(g.scene);
      const diag = Math.hypot(size.x, size.z) + 2 * Math.hypot(c.x - cx, c.z - cz), vf = cam.fov * Math.PI / 360, hf = Math.atan(Math.tan(vf) * cam.aspect);
      // cámara fija igual para todas: misma escala (todas tienen peana de 25 mm)
      const VIEW = 58, d = Math.max(VIEW / 2 / Math.tan(vf), 46 / 2 / Math.tan(hf));
      cam.position.set(0, 25 + d * .16, d); cam.lookAt(0, 23, 0);
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
    return {dispose() { alive = false; io.disconnect(); removeEventListener("resize", fit); r.dispose(); }};
  }

  function open(id, scroll) {
    const c = CATS.find(x => x.id === id && !x.soon); if (!c) return;
    catsEl.querySelectorAll(".mcat").forEach(b => b.setAttribute("aria-pressed", b.dataset.cat === id));
    stopAll();
    const p = (typeof PRODUCTS !== "undefined" ? PRODUCTS : {})[c.pack];
    gal.hidden = false;
    gal.innerHTML = `<div class="mgal-head"><div><span class="label">Categoría</span><h2>${c.name}</h2>
      <p class="soft">Gira cada mini arrastrando. Resina gris sin pintar, base de 25 mm con la marca Hokane.</p></div>
      ${p ? `<div class="mgal-buy"><span class="price num">${p.price} €</span>${(typeof CONFIG !== "undefined" && !CONFIG.salesOpen) ? `<button class="btn" type="button" disabled title="La tienda abre muy pronto">Próximamente</button>` : `<button class="btn" type="button" data-add="${c.pack}">Añadir el pack <span class="arrow">→</span></button>`}</div>` : ""}</div>
      <div class="mgrid">${c.minis.map(([file, name, txt]) => `<figure class="mini3d"><div class="mstage">${has3D ? `<canvas aria-label="Modelo 3D de ${name}"></canvas>` : ""}<span class="mload">Cargando 3D…</span></div>
      <figcaption><b>${name}</b><small>${txt}</small></figcaption></figure>`).join("")}</div>`;
    if (has3D) gal.querySelectorAll("canvas").forEach((cv, i) => viewers.push(viewer(cv, c.dir + c.minis[i][0] + ".glb?v=" + (c.v || 1))));
    if (location.hash !== "#" + id) history.replaceState(null, "", "#" + id);
    if (scroll) gal.scrollIntoView({behavior: REDUCE ? "auto" : "smooth", block: "start"});
  }

  catsEl.addEventListener("click", e => { const b = e.target.closest(".mcat"); if (b && !b.disabled) open(b.dataset.cat, true); });
  open((location.hash || "").slice(1) || "goblins", !!location.hash);
})();
