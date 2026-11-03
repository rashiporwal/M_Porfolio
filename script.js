(() => {
  const root = document.documentElement;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.classList.add('motion-ready');

  const themeButtons = document.querySelectorAll('[data-theme-toggle]');
  const storedTheme = localStorage.getItem('portfolio-theme');
  const preferredTheme = matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';

  const applyTheme = (theme) => {
    root.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#091524' : '#f4efe4');
    themeButtons.forEach((button) => {
      const nextTheme = theme === 'dark' ? 'light' : 'dark';
      button.setAttribute('aria-label', `Switch to ${nextTheme} mode`);
      button.setAttribute('title', `${nextTheme[0].toUpperCase()}${nextTheme.slice(1)} mode`);
      button.setAttribute('aria-pressed', String(theme === 'light'));
    });
  };

  applyTheme(storedTheme || preferredTheme);
  themeButtons.forEach((button) => button.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('portfolio-theme', next);
  }));

  const header = document.querySelector('[data-header]');
  const progress = document.querySelector('[data-scroll-progress]');
  let scrollTicking = false;

  const updateScrollUI = () => {
    const scrollable = document.documentElement.scrollHeight - innerHeight;
    const ratio = scrollable > 0 ? Math.min(scrollY / scrollable, 1) : 0;
    header?.classList.toggle('is-scrolled', scrollY > 28);
    if (progress) progress.style.transform = `scaleX(${ratio})`;
    scrollTicking = false;
  };

  addEventListener('scroll', () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(updateScrollUI);
  }, { passive: true });
  updateScrollUI();

  const menuButton = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-nav]');
  const setMenu = (open) => {
    menuButton?.setAttribute('aria-expanded', String(open));
    nav?.classList.toggle('open', open);
  };
  menuButton?.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
  nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', (event) => { if (event.key === 'Escape') setMenu(false); });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      entry.target.classList.remove('will-reveal');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });

  document.querySelectorAll('[data-reveal]').forEach((element) => {
    if (element.getBoundingClientRect().top < innerHeight * .92) element.classList.add('is-visible');
    else {
      element.classList.add('will-reveal');
      revealObserver.observe(element);
    }
  });

  const staggerObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('stagger-visible');
      staggerObserver.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -5% 0px' });
  document.querySelectorAll('[data-stagger]').forEach((element) => staggerObserver.observe(element));

  const metricSection = document.querySelector('[data-metrics]');
  const counters = [...document.querySelectorAll('[data-counter]')];
  const setCounterValue = (counter, value) => {
    const prefix = counter.dataset.prefix || '';
    const suffix = counter.dataset.suffix || '';
    counter.textContent = `${prefix}${Math.round(value).toLocaleString('en-IN')}${suffix}`;
  };

  if (metricSection && counters.length) {
    if (reducedMotion) {
      counters.forEach((counter) => setCounterValue(counter, Number(counter.dataset.counter)));
    } else {
      const metricObserver = new IntersectionObserver((entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        metricSection.classList.add('is-counting');
        counters.forEach((counter, index) => {
          const target = Number(counter.dataset.counter);
          const duration = 1250 + index * 110;
          const start = performance.now();
          setCounterValue(counter, 0);

          const count = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4);
            setCounterValue(counter, target * eased);
            if (progress < 1) requestAnimationFrame(count);
          };
          requestAnimationFrame(count);
        });
        metricObserver.unobserve(metricSection);
      }, { threshold: .35 });
      metricObserver.observe(metricSection);
    }
  }

  const sections = [...document.querySelectorAll('main section[id]:not(#home)')];
  const navLinks = [...document.querySelectorAll('.primary-nav a')];
  if (sections.length && navLinks.length) {
    const sectionObserver = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${visible.target.id}`));
    }, { rootMargin: '-28% 0px -58%', threshold: [0, .2, .55] });
    sections.forEach((section) => sectionObserver.observe(section));
  }

  if (!reducedMotion) {
    document.querySelectorAll('.capability-grid article, .project-card').forEach((card) => {
      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
        card.style.setProperty('--my', `${event.clientY - rect.top}px`);
      });
    });

    document.querySelectorAll('.button').forEach((button) => {
      button.addEventListener('pointermove', (event) => {
        const rect = button.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) * .07;
        const y = (event.clientY - rect.top - rect.height / 2) * .1;
        button.style.transform = `translate(${x}px, ${y}px)`;
      });
      button.addEventListener('pointerleave', () => { button.style.transform = ''; });
    });

    if (matchMedia('(pointer: fine)').matches) {
      document.querySelectorAll('[data-tilt]').forEach((element) => {
        let frame;
        element.addEventListener('pointermove', (event) => {
          if (frame) cancelAnimationFrame(frame);
          frame = requestAnimationFrame(() => {
            const rect = element.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width - .5;
            const y = (event.clientY - rect.top) / rect.height - .5;
            const range = element.classList.contains('portrait-frame') ? 4 : 2.2;
            element.style.setProperty('--tilt-x', `${-y * range}deg`);
            element.style.setProperty('--tilt-y', `${x * range}deg`);
          });
        });
        element.addEventListener('pointerleave', () => {
          if (frame) cancelAnimationFrame(frame);
          element.style.setProperty('--tilt-x', '0deg');
          element.style.setProperty('--tilt-y', '0deg');
        });
      });
    }
  }

  const cursorOrbit = document.querySelector('[data-cursor-orbit]');
  if (cursorOrbit && !reducedMotion && matchMedia('(pointer: fine)').matches) {
    document.body.classList.add('cursor-motion-ready');
    const target = { x: innerWidth / 2, y: innerHeight / 2 };
    const current = { ...target };
    let cursorFrame;

    const moveCursor = (event) => {
      target.x = event.clientX;
      target.y = event.clientY;
      cursorOrbit.classList.add('is-visible');
    };
    const setInteractive = (event) => {
      const interactive = event.target.closest?.('a, button, [data-tilt], .project-card, .pipeline-stage');
      cursorOrbit.classList.toggle('is-interactive', Boolean(interactive));
    };
    const animateCursor = () => {
      current.x += (target.x - current.x) * .16;
      current.y += (target.y - current.y) * .16;
      cursorOrbit.style.setProperty('--cursor-x', `${current.x}px`);
      cursorOrbit.style.setProperty('--cursor-y', `${current.y}px`);
      cursorFrame = requestAnimationFrame(animateCursor);
    };

    addEventListener('pointermove', moveCursor, { passive: true });
    document.addEventListener('pointerover', setInteractive, { passive: true });
    addEventListener('pointerdown', () => cursorOrbit.classList.add('is-down'), { passive: true });
    addEventListener('pointerup', () => cursorOrbit.classList.remove('is-down'), { passive: true });
    document.documentElement.addEventListener('mouseleave', () => cursorOrbit.classList.remove('is-visible'));
    addEventListener('pagehide', () => cancelAnimationFrame(cursorFrame), { once: true });
    animateCursor();
  }

  document.querySelectorAll('[data-year]').forEach((element) => { element.textContent = new Date().getFullYear(); });
})();
