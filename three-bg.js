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

      const sphereGeometry = new THREE.SphereGeometry(2.15, compact ? 12 : 18, compact ? 8 : 12);
      const sphere = new THREE.Mesh(sphereGeometry, primaryMaterial);
      sphere.position.set(compact ? 2.45 : 4.25, 1.35, -2.1);
      sphere.rotation.set(0.15, 0.45, -0.12);
      field.add(sphere);

      const cubeGeometry = new THREE.BoxGeometry(3.2, 2.35, 2.35, compact ? 2 : 3, 2, 2);
      const cube = new THREE.Mesh(cubeGeometry, secondaryMaterial);
      cube.position.set(compact ? -2.25 : -4.45, -2.05, -2.9);
      cube.rotation.set(-0.35, 0.55, 0.18);
      field.add(cube);

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
            sphere.rotation.y = 0.45 + speed;
            sphere.rotation.x = 0.15 + Math.sin(speed * 1.4) * 0.1;
            cube.rotation.y = 0.55 - speed * 0.72;
            cube.rotation.x = -0.35 + Math.sin(speed * 1.1) * 0.14;
            cube.rotation.z = 0.18 + speed * 0.28;
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
        sphereGeometry.dispose();
        cubeGeometry.dispose();
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
