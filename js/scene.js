/* ============================================================
   Muzungu Capital — 3D-Hintergrundszene (Three.js)
   Partikel-Sphäre, die beim Scrollen zu einer Wellen-Ebene
   morpht, plus rotierendes Drahtgitter-Icosaeder.
   ============================================================ */
import * as THREE from "three";

const canvas = document.getElementById("bg3d");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let renderer;
try {
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
} catch (err) {
  // Kein WebGL verfügbar: Canvas ausblenden, Seite bleibt voll nutzbar.
  canvas.style.display = "none";
  console.warn("WebGL nicht verfügbar – 3D-Hintergrund deaktiviert.", err);
}

if (renderer) {
  const isMobile = window.matchMedia("(max-width: 820px)").matches;

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x060a12, 0.055);

  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, 0, 11);

  /* ---------- Partikel: Sphäre + Wellen-Ebene als Morph-Ziele ---------- */
  const COUNT = isMobile ? 1600 : 3200;
  const spherePos = new Float32Array(COUNT * 3);
  const wavePos = new Float32Array(COUNT * 3);
  const current = new Float32Array(COUNT * 3);

  for (let i = 0; i < COUNT; i++) {
    // Gleichmäßige Verteilung auf der Kugel (Fibonacci-Spirale)
    const t = i / COUNT;
    const phi = Math.acos(1 - 2 * t);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;
    const r = 4.6 + (Math.random() - 0.5) * 0.35;

    spherePos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    spherePos[i * 3 + 1] = r * Math.cos(phi);
    spherePos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

    // Ziel-Ebene: breites Raster unterhalb der Kamera
    const gx = (Math.random() - 0.5) * 26;
    const gz = (Math.random() - 0.5) * 18;
    wavePos[i * 3]     = gx;
    wavePos[i * 3 + 1] = -3.2;
    wavePos[i * 3 + 2] = gz - 4;

    current[i * 3]     = spherePos[i * 3];
    current[i * 3 + 1] = spherePos[i * 3 + 1];
    current[i * 3 + 2] = spherePos[i * 3 + 2];
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(current, 3));

  const mat = new THREE.PointsMaterial({
    color: 0xf0a94f,
    size: isMobile ? 0.045 : 0.035,
    transparent: true,
    opacity: 0.85,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geo, mat);
  scene.add(points);

  /* ---------- Drahtgitter-Icosaeder im Kern ---------- */
  const core = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(2.4, 1)),
    new THREE.LineBasicMaterial({
      color: 0x3b4a66,
      transparent: true,
      opacity: 0.5,
    })
  );
  scene.add(core);

  const coreInner = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.3, 0)),
    new THREE.LineBasicMaterial({
      color: 0xf0a94f,
      transparent: true,
      opacity: 0.35,
    })
  );
  scene.add(coreInner);

  /* ---------- Interaktion: Maus & Scroll ---------- */
  let mouseX = 0;
  let mouseY = 0;
  let scrollProgress = 0; // 0 = Hero, 1 = Seitenende

  window.addEventListener("pointermove", (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  const updateScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
  };
  window.addEventListener("scroll", updateScroll, { passive: true });
  updateScroll();

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  /* ---------- Render-Loop ---------- */
  const clock = new THREE.Clock();
  let smoothScroll = 0;

  function animate() {
    const t = clock.getElapsedTime();

    // Scroll weich nachziehen, damit der Morph nicht ruckelt
    smoothScroll += (scrollProgress - smoothScroll) * 0.06;

    // Morphfaktor: ab ~15 % Scroll beginnt die Auflösung zur Welle
    const morph = THREE.MathUtils.smoothstep(smoothScroll, 0.12, 0.85);

    const pos = geo.attributes.position.array;
    for (let i = 0; i < COUNT; i++) {
      const ix = i * 3;
      const sx = spherePos[ix], sy = spherePos[ix + 1], sz = spherePos[ix + 2];
      const wx = wavePos[ix],   wz = wavePos[ix + 2];
      // Wellenbewegung auf der Ziel-Ebene
      const wy = wavePos[ix + 1]
        + Math.sin(wx * 0.55 + t * 0.9) * 0.55
        + Math.cos(wz * 0.7 + t * 0.7) * 0.4;

      pos[ix]     = sx + (wx - sx) * morph;
      pos[ix + 1] = sy + (wy - sy) * morph;
      pos[ix + 2] = sz + (wz - sz) * morph;
    }
    geo.attributes.position.needsUpdate = true;

    // Rotation & Parallaxe
    const speed = reducedMotion ? 0.15 : 1;
    points.rotation.y = t * 0.05 * speed * (1 - morph);
    core.rotation.y = t * 0.12 * speed;
    core.rotation.x = t * 0.06 * speed;
    coreInner.rotation.y = -t * 0.2 * speed;
    coreInner.rotation.z = t * 0.1 * speed;

    // Kern beim Scrollen ausblenden
    core.material.opacity = 0.5 * (1 - morph);
    coreInner.material.opacity = 0.35 * (1 - morph);
    core.visible = coreInner.visible = morph < 0.98;

    // Kamera: leichte Mausparallaxe + Scroll-Fahrt
    const targetX = mouseX * 0.7;
    const targetY = -mouseY * 0.45 + morph * 1.6;
    camera.position.x += (targetX - camera.position.x) * 0.04;
    camera.position.y += (targetY - camera.position.y) * 0.04;
    camera.position.z = 11 - morph * 3.5;
    camera.lookAt(0, morph * -1.2, 0);

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();
}
