const canvas = document.querySelector('[data-three-background]');

if (canvas && !navigator.connection?.saveData) {
  const schedule = window.requestIdleCallback || ((callback) => setTimeout(callback, 180));

  schedule(async () => {
    try {
      const THREE = await import('./assets/vendor/three.module.js');
      const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const compact = matchMedia('(max-width: 760px)').matches;
      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: false,
        powerPreference: 'low-power'
      });

      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(devicePixelRatio, compact ? 1 : 1.35));

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 80);
      camera.position.set(0, 0, 12);

      const field = new THREE.Group();
      scene.add(field);

      const primaryMaterial = new THREE.MeshBasicMaterial({
        color: 0x6f9eea,
        wireframe: true,
        transparent: true,
        opacity: 0.16,
        depthWrite: false
      });
      const secondaryMaterial = new THREE.MeshBasicMaterial({
        color: 0x79b9dd,
        wireframe: true,
        transparent: true,
        opacity: 0.11,
        depthWrite: false
      });

      const polyhedron = new THREE.Mesh(new THREE.IcosahedronGeometry(2.25, 1), primaryMaterial);
      polyhedron.position.set(compact ? 2.6 : 4.3, 1.45, -1.8);
      polyhedron.rotation.set(0.25, 0.5, -0.18);
      field.add(polyhedron);

      const ring = new THREE.Mesh(new THREE.TorusKnotGeometry(1.7, 0.24, compact ? 56 : 84, 7, 2, 3), secondaryMaterial);
      ring.position.set(compact ? -2.3 : -4.6, -2.1, -2.8);
      ring.rotation.set(-0.5, 0.25, 0.45);
      field.add(ring);

      const particleCount = compact ? 54 : 110;
      const positions = new Float32Array(particleCount * 3);
      for (let index = 0; index < particleCount; index += 1) {
        const offset = index * 3;
        positions[offset] = (Math.random() - 0.5) * 20;
        positions[offset + 1] = (Math.random() - 0.5) * 12;
        positions[offset + 2] = -2 - Math.random() * 9;
      }
      const particleGeometry = new THREE.BufferGeometry();
      particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const particleMaterial = new THREE.PointsMaterial({
        color: 0x79b9dd,
        size: compact ? 0.035 : 0.045,
        transparent: true,
        opacity: 0.28,
        depthWrite: false
      });
      const particles = new THREE.Points(particleGeometry, particleMaterial);
      field.add(particles);

      const pointer = { x: 0, y: 0 };
      const current = { x: 0, y: 0 };
      const updatePointer = (event) => {
        pointer.x = (event.clientX / innerWidth - 0.5) * 0.5;
        pointer.y = (event.clientY / innerHeight - 0.5) * -0.35;
      };

      const applyTheme = () => {
        const light = document.documentElement.dataset.theme === 'light';
        primaryMaterial.color.setHex(light ? 0x233e63 : 0x6f9eea);
        secondaryMaterial.color.setHex(light ? 0x4d709e : 0x79b9dd);
        particleMaterial.color.setHex(light ? 0x365b87 : 0x79b9dd);
        primaryMaterial.opacity = light ? 0.13 : 0.16;
        secondaryMaterial.opacity = light ? 0.085 : 0.11;
        particleMaterial.opacity = light ? 0.2 : 0.28;
      };

      const resize = () => {
        const width = innerWidth;
        const height = innerHeight;
        renderer.setSize(width, height, false);
        camera.aspect = width / Math.max(height, 1);
        camera.updateProjectionMatrix();
        field.scale.setScalar(width < 560 ? 0.8 : 1);
      };

      const themeObserver = new MutationObserver(applyTheme);
      themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
      addEventListener('resize', resize, { passive: true });
      if (!reducedMotion) addEventListener('pointermove', updatePointer, { passive: true });
      resize();
      applyTheme();

      let frame = 0;
      let previous = 0;
      const render = (time = 0) => {
        if (!document.hidden && (reducedMotion || time - previous >= 32)) {
          previous = time;
          if (!reducedMotion) {
            const speed = time * 0.00008;
            polyhedron.rotation.y = 0.5 + speed;
            polyhedron.rotation.x = 0.25 + Math.sin(speed * 1.4) * 0.12;
            ring.rotation.z = 0.45 - speed * 0.75;
            particles.rotation.y = speed * 0.12;
            current.x += (pointer.x - current.x) * 0.035;
            current.y += (pointer.y - current.y) * 0.035;
            field.rotation.y = current.x;
            field.rotation.x = current.y;
          }
          renderer.render(scene, camera);
        }
        if (!reducedMotion) frame = requestAnimationFrame(render);
      };

      render();
      addEventListener('pagehide', () => {
        cancelAnimationFrame(frame);
        themeObserver.disconnect();
        renderer.dispose();
        particleGeometry.dispose();
        particleMaterial.dispose();
        primaryMaterial.dispose();
        secondaryMaterial.dispose();
      }, { once: true });
    } catch {
      canvas.hidden = true;
    }
  }, { timeout: 1200 });
}
