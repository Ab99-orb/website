const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

function initNavigation() {
  const toggle = $(".menu-toggle");
  const nav = $("#primary-nav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    nav.classList.toggle("is-open", open);
  });
  $$("a", nav).forEach(link => link.addEventListener("click", () => {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation");
  }));
}

function initReveal() {
  const items = $$(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach(item => item.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });
  items.forEach(item => observer.observe(item));
}

const signalContent = {
  halo: ["Halo signature", "The presentation discusses halo patterns as potential surface geochemical expressions around a subsurface system. Interpretation depends on local geology, data quality and independent verification."],
  methane: ["Thermogenic methane", "The supplied material references methane migration and possible surface expression mechanisms. Satellite interpretation requires suitable supporting observations and geological context."],
  droplets: ["Micro-hydrocarbon droplets", "The presentation describes potential micro-hydrocarbon droplets associated with migration along geological structures. These are indicators for assessment, not proof of a commercial accumulation."],
  film: ["Hydrocarbon film", "Hydrocarbon film is listed among the indicators in the supplied presentation. Any interpretation should be tested against alternative surface processes and independent evidence."]
};

function initSignalTabs() {
  const tabs = $$(".signal-tab");
  const title = $("#signal-title");
  const description = $("#signal-description");
  const index = $(".panel-index");
  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => {
      tabs.forEach(item => {
        item.classList.remove("active");
        item.setAttribute("aria-selected", "false");
      });
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");
      const content = signalContent[tab.dataset.signal];
      title.textContent = content[0];
      description.textContent = content[1];
      index.textContent = `${String(i + 1).padStart(2, "0")} / 04`;
    });
    tab.addEventListener("keydown", event => {
      if (!["ArrowRight", "ArrowLeft"].includes(event.key)) return;
      event.preventDefault();
      const direction = event.key === "ArrowRight" ? 1 : -1;
      tabs[(i + direction + tabs.length) % tabs.length].focus();
    });
  });
}

function initContactForm() {
  const form = $("#contact-form");
  const status = $("#form-status");
  if (!form) return;
  form.addEventListener("submit", event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const subject = `Technical enquiry from ${data.get("name")}`;
    const lines = [
      `Name: ${data.get("name")}`,
      `Company: ${data.get("company") || "Not provided"}`,
      `Email: ${data.get("email")}`,
      `Country: ${data.get("country") || "Not provided"}`,
      `Area of interest: ${data.get("interest") || "Not specified"}`,
      "",
      "Enquiry:",
      data.get("message") || "No additional details provided."
    ];
    const mailto = `mailto:orbitalhydrocarbon@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
    status.textContent = "Opening your email application. Please review the enquiry before sending.";
    window.location.href = mailto;
  });
}

function initYear() {
  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();
}

async function initHero3D() {
  const canvas = $("#hero-canvas");
  if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  try {
    const THREE = await import("three");
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
    renderer.setClearColor(0x000000, 0);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 5.3, 12.5);
    const group = new THREE.Group();
    scene.add(group);

    const ambient = new THREE.AmbientLight(0x8eb6c9, 1.5);
    scene.add(ambient);
    const key = new THREE.PointLight(0xf5a13a, 65, 25);
    key.position.set(2, 5, 3);
    scene.add(key);
    const tealLight = new THREE.PointLight(0x36c3c1, 35, 20);
    tealLight.position.set(-5, 1, -2);
    scene.add(tealLight);

    const terrainGeo = new THREE.PlaneGeometry(9.5, 7.5, 75, 60);
    const pos = terrainGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i);
      const ridge = Math.sin(x * 1.15) * .22 + Math.cos(y * 1.1) * .18 + Math.sin((x + y) * .7) * .12;
      const basin = Math.exp(-((x - .7) ** 2 + (y + .2) ** 2) / 3) * .48;
      pos.setZ(i, ridge + basin);
    }
    terrainGeo.computeVertexNormals();
    const terrain = new THREE.Mesh(terrainGeo, new THREE.MeshStandardMaterial({ color: 0x123a52, roughness: .83, metalness: .12, side: THREE.DoubleSide }));
    terrain.rotation.x = -Math.PI / 2.35;
    terrain.position.y = -1.2;
    group.add(terrain);

    const wire = new THREE.LineSegments(new THREE.WireframeGeometry(terrainGeo), new THREE.LineBasicMaterial({ color: 0x347287, transparent: true, opacity: .2 }));
    wire.rotation.copy(terrain.rotation);
    wire.position.copy(terrain.position);
    group.add(wire);

    for (let i = 0; i < 7; i++) {
      const curve = new THREE.EllipseCurve(0, 0, 1.2 + i * .34, .52 + i * .16, 0, Math.PI * 2, false, 0);
      const points = curve.getPoints(90).map(p => new THREE.Vector3(p.x, -1.08 + i * .015, p.y));
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color: i < 3 ? 0xf5a13a : 0x36c3c1, transparent: true, opacity: .45 - i * .035 }));
      group.add(line);
    }

    const target = new THREE.Mesh(new THREE.SphereGeometry(.12, 20, 20), new THREE.MeshBasicMaterial({ color: 0xffb34d }));
    target.position.set(.45, -.65, .1);
    group.add(target);
    const ring = new THREE.Mesh(new THREE.RingGeometry(.2, .24, 48), new THREE.MeshBasicMaterial({ color: 0xf5a13a, side: THREE.DoubleSide, transparent: true, opacity: .9 }));
    ring.rotation.x = -Math.PI / 2.35;
    ring.position.set(.45, -.61, .1);
    group.add(ring);

    const beamGeo = new THREE.ConeGeometry(.62, 3.8, 32, 1, true);
    const beam = new THREE.Mesh(beamGeo, new THREE.MeshBasicMaterial({ color: 0xf5a13a, transparent: true, opacity: .12, side: THREE.DoubleSide, depthWrite: false }));
    beam.position.set(.3, 1.5, .1);
    beam.rotation.x = Math.PI;
    group.add(beam);

    const satellite = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(.38, .24, .28), new THREE.MeshStandardMaterial({ color: 0x9eb7c5, metalness: .7, roughness: .3 }));
    satellite.add(body);
    const panelMat = new THREE.MeshStandardMaterial({ color: 0x1d6480, metalness: .55, roughness: .35, emissive: 0x092b43 });
    [-1, 1].forEach(side => {
      const panel = new THREE.Mesh(new THREE.BoxGeometry(.85, .045, .38), panelMat);
      panel.position.x = side * .68;
      satellite.add(panel);
      const grid = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(.85, .05, .39)), new THREE.LineBasicMaterial({ color: 0x6cb6c5 }));
      grid.position.copy(panel.position);
      satellite.add(grid);
    });
    satellite.position.set(-2.4, 3.3, 1.1);
    satellite.rotation.z = -.28;
    group.add(satellite);

    const starsGeo = new THREE.BufferGeometry();
    const starPositions = [];
    for (let i = 0; i < 170; i++) starPositions.push((Math.random() - .5) * 16, (Math.random() - .5) * 9, -2 - Math.random() * 5);
    starsGeo.setAttribute("position", new THREE.Float32BufferAttribute(starPositions, 3));
    scene.add(new THREE.Points(starsGeo, new THREE.PointsMaterial({ color: 0x91b8c8, size: .018, transparent: true, opacity: .55 })));

    const resize = () => {
      const width = canvas.clientWidth || 600;
      const height = canvas.clientHeight || 450;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      const t = performance.now() * .00025;
      group.rotation.y = Math.sin(t) * .12;
      group.rotation.x = Math.sin(t * .7) * .025;
      satellite.position.x = -2.4 + Math.sin(t * 1.4) * .25;
      satellite.position.y = 3.3 + Math.cos(t * 1.4) * .12;
      ring.scale.setScalar(1 + (Math.sin(t * 4) + 1) * .13);
      renderer.render(scene, camera);
    };
    animate();
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) cancelAnimationFrame(frame);
      else animate();
    });
    window.addEventListener("pagehide", () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      renderer.dispose();
      terrainGeo.dispose();
    }, { once: true });
  } catch (error) {
    canvas.classList.add("canvas-fallback");
    console.warn("3D scene unavailable; showing CSS fallback.", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initReveal();
  initSignalTabs();
  initContactForm();
  initYear();
  initHero3D();
});
