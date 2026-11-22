/* Hokane · figuras 3D de prueba (se sustituirán por los .glb de Tripo) */
(function () {
  if (!window.THREE) return;
  const REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const INFO = {
    grieta: "Se rompió por dentro y aprendió a brillar por las grietas.",
    musgo: "Lleva tanto tiempo quieto que le ha crecido un jardín encima.",
    brasa: "Nunca se apaga del todo, ni en los días grises.",
    niebla: "Aparece cuando nadie mira y se va sin hacer ruido.",
    eco: "Repite lo último que oyó, aunque no lo entienda.",
    lunes: "Siempre tiene sueño. Siempre."
  };
  function noisify(g, a, s) {
    const p = g.attributes.position, v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const n = Math.sin(v.x * 7.1 + s) * Math.cos(v.y * 6.3 + s * 1.7) * Math.sin(v.z * 5.7 + s * .6); v.multiplyScalar(1 + n * a); p.setXYZ(i, v.x, v.y, v.z); }
    g.computeVertexNormals(); return g;
  }
  function make(key) {
    const g = new THREE.Group();
    const stone = new THREE.MeshStandardMaterial({color: 0x9a9ea4, roughness: .95, flatShading: true});
    const col = {grieta: 0xd6402a, musgo: 0x6f8f4e, brasa: 0xe2862f, niebla: 0x8aa0b3, eco: 0x9a82c4, lunes: 0x9b968e}[key] || 0xd6402a;
    const accent = new THREE.MeshStandardMaterial({color: col, emissive: col, emissiveIntensity: .35, roughness: .5});
    const prof = [new THREE.Vector2(0, 0)];
    for (let i = 0; i <= 12; i++) { const t = i / 12; prof.push(new THREE.Vector2(0.46 + Math.sin(t * Math.PI * .9) * 0.2 - t * t * 0.35, t * 1.2)); }
    prof.push(new THREE.Vector2(0, 1.25));
    g.add(new THREE.Mesh(noisify(new THREE.LatheGeometry(prof, 30), .04, 1.3), stone));
    const head = new THREE.Mesh(noisify(new THREE.IcosahedronGeometry(.62, 3), .05, 2.1), stone); head.scale.set(1, .9, 1); head.position.y = 1.55; g.add(head);
    const eyeY = key === "lunes" ? 1.57 : 1.59;
    [-.22, .22].forEach(x => { const e = new THREE.Mesh(new THREE.SphereGeometry(.07, 16, 16), accent); e.position.set(x, eyeY, .55); if (key === "lunes") e.scale.y = .35; g.add(e); });
    [-1, 1].forEach(s => { const a = new THREE.Mesh(noisify(new THREE.SphereGeometry(.17, 14, 14), .05, s), stone); a.scale.set(.85, 1.6, .85); a.position.set(s * .62, .64, .05); a.rotation.z = s * .35; g.add(a); });
    const rune = new THREE.Group(); const bar = (w, h, x, y, r) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, .05), accent); m.position.set(x, y, 0); m.rotation.z = r || 0; rune.add(m); };
    bar(.05, .42, -.07, 0); bar(.05, .2, 0, .12, -1); bar(.05, .26, 0, -.08, .75); rune.position.set(0, .77, .6); rune.rotation.x = -.12; g.add(rune);
    if (key === "grieta") { const c = pts => { const cu = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p))); g.add(new THREE.Mesh(new THREE.TubeGeometry(cu, 20, .02, 6, false), accent)); };
      c([[.15, 2.08, .38], [.05, 1.92, .5], [.18, 1.82, .55], [.1, 1.72, .6]]); c([[-.45, 1.78, .35], [-.52, 1.63, .33], [-.42, 1.49, .42]]); }
    if (key === "musgo") { const m = new THREE.MeshStandardMaterial({color: 0x6f8f4e, roughness: 1, flatShading: true});
      for (let i = 0; i < 14; i++) { const b = new THREE.Mesh(noisify(new THREE.IcosahedronGeometry(.13 + ((i * 37) % 10) / 100, 1), .15, i), m); const th = i * 2.4, ph = (i % 5) / 5 * .9; b.position.set(Math.sin(ph) * Math.cos(th) * .55, 1.55 + Math.cos(ph) * .5, Math.sin(ph) * Math.sin(th) * .55); b.scale.y = .55; g.add(b); } }
    if (key === "brasa") { const a = new THREE.Mesh(new THREE.ConeGeometry(.2, .55, 18), accent); a.position.y = 2.25; g.add(a); const b = new THREE.Mesh(new THREE.ConeGeometry(.11, .34, 14), accent); b.position.set(.17, 2.12, .05); b.rotation.z = -.4; g.add(b); g.userData.flames = [a, b]; }
    if (key === "niebla") { const m = new THREE.MeshStandardMaterial({color: 0xd9e2ea, transparent: true, opacity: .55, roughness: 1});
      for (let i = 0; i < 5; i++) { const s = new THREE.Mesh(new THREE.SphereGeometry(.22 + i * .03, 16, 16), m); s.position.set(Math.cos(i * 1.3) * .75, .3 + i * .18, Math.sin(i * 1.3) * .5); s.scale.y = .5; g.add(s); } g.userData.mist = true; }
    if (key === "eco") { [0, 1].forEach(i => { const r = new THREE.Mesh(new THREE.TorusGeometry(.28 + i * .16, .022, 8, 40, Math.PI * .8), accent); r.position.set(.72 + i * .05, 1.6, 0); r.rotation.y = Math.PI / 2; r.rotation.z = -Math.PI * .4; g.add(r); }); }
    if (key === "lunes") { const cap = new THREE.Mesh(new THREE.ConeGeometry(.42, .6, 24), new THREE.MeshStandardMaterial({color: 0x6f6a8f, roughness: .9})); cap.position.set(.08, 2.18, 0); cap.rotation.z = -.35; g.add(cap); const pom = new THREE.Mesh(new THREE.SphereGeometry(.09, 12, 12), new THREE.MeshStandardMaterial({color: 0xf3f1ec})); pom.position.set(.33, 2.42, 0); g.add(pom); }
    g.position.y = -1.05; return g;
  }
  function scene(canvas) {
    const r = new THREE.WebGLRenderer({canvas, antialias: true, alpha: true}); r.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    const s = new THREE.Scene(); const cam = new THREE.PerspectiveCamera(32, 1, .1, 100); cam.position.set(0, .4, 6.4); cam.lookAt(0, 0, 0);
    s.add(new THREE.HemisphereLight(0xffffff, 0x8a8580, .7)); const k = new THREE.DirectionalLight(0xffffff, .75); k.position.set(3, 5, 4); s.add(k); const f = new THREE.DirectionalLight(0xffffff, .3); f.position.set(-4, 1, 2); s.add(f);
    const sh = new THREE.Mesh(new THREE.CircleGeometry(.95, 40), new THREE.MeshBasicMaterial({color: 0, transparent: true, opacity: .08})); sh.rotation.x = -Math.PI / 2; sh.position.y = -1.06; s.add(sh);
    const fit = () => { const b = canvas.getBoundingClientRect(); if (!b.width) return; r.setSize(b.width, b.height, false); cam.aspect = b.width / b.height; cam.updateProjectionMatrix(); };
    fit(); addEventListener("resize", fit); return {r, s, cam};
  }
  const clock = new THREE.Clock();

  const heroC = document.getElementById("hero3d");
  if (heroC) {
    const H = scene(heroC); const fig = make(heroC.dataset.figure || "grieta"); H.s.add(fig);
    let tx = 0, ty = 0;
    heroC.parentElement.addEventListener("pointermove", e => { const b = e.currentTarget.getBoundingClientRect(); tx = (e.clientX - b.left) / b.width - .5; ty = (e.clientY - b.top) / b.height - .5; });
    (function loop() { const t = clock.getElapsedTime(); fig.rotation.y += ((REDUCE ? 0 : t * .3) + tx * 1.1 - fig.rotation.y) * .05; fig.rotation.x += (ty * .25 - fig.rotation.x) * .05; H.r.render(H.s, H.cam); requestAnimationFrame(loop); })();
  }

  const vC = document.getElementById("viewer3d");
  if (vC) {
    const V = scene(vC); V.cam.position.set(0, .6, 5.6);
    const oc = new THREE.OrbitControls(V.cam, V.r.domElement);
    Object.assign(oc, {enableDamping: true, autoRotate: !REDUCE, autoRotateSpeed: 1.4, minDistance: 2.6, maxDistance: 9, enablePan: false});
    let cur = make("grieta"); V.s.add(cur);
    window.HK3D = {
      show(key, name) {
        if (!INFO[key]) return;
        V.s.remove(cur); cur = make(key); cur.scale.setScalar(.6); V.s.add(cur);
        const t = document.getElementById("vtext"); if (t) t.innerHTML = `<b>${name || key}</b><span>${INFO[key]}</span>`;
      }
    };
    const sp = document.getElementById("spinBtn");
    if (sp) { sp.setAttribute("aria-pressed", oc.autoRotate); sp.onclick = () => { oc.autoRotate = !oc.autoRotate; sp.setAttribute("aria-pressed", oc.autoRotate); }; }
    (function loop() { const t = clock.getElapsedTime(); cur.scale.setScalar(cur.scale.x + (1 - cur.scale.x) * .12);
      if (cur.userData.flames) cur.userData.flames.forEach((f, i) => f.scale.y = 1 + Math.sin(t * 7 + i) * .1);
      oc.update(); V.r.render(V.s, V.cam); requestAnimationFrame(loop); })();
    /* Modelos reales: new THREE.GLTFLoader().load("modelos/grieta.glb", g => { V.s.remove(cur); cur = g.scene; V.s.add(cur); }); */
  }
})();
