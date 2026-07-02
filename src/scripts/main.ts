import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ==================================================================
   Smooth scrolling — Lenis driven by GSAP's ticker
   ================================================================== */

let lenis: Lenis | null = null;

if (!reducedMotion) {
  lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis!.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (event) => {
    const href = anchor.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;
    event.preventDefault();
    if (lenis) {
      lenis.scrollTo(target as HTMLElement, { offset: href === '#top' ? 0 : -70 });
    } else {
      (target as HTMLElement).scrollIntoView({ behavior: 'smooth' });
    }
  });
});

/* ==================================================================
   Scroll progress bar
   ================================================================== */

const progress = document.getElementById('scroll-progress');
if (progress) {
  gsap.to(progress, {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: { start: 0, end: 'max', scrub: 0.3 },
  });
}

/* ==================================================================
   Sticky nav — solidifies once past the hero. A plain scroll listener
   is more reliable than a triggerless ScrollTrigger under Lenis + pins.
   ================================================================== */

const siteNav = document.getElementById('site-nav');
const onNavScroll = () => {
  siteNav?.classList.toggle('is-scrolled', window.scrollY > 50);
};
onNavScroll();
window.addEventListener('scroll', onNavScroll, { passive: true });

/* ==================================================================
   Hero entrance — masked word reveal + staggered supporting elements
   ================================================================== */

const heroWords = gsap.utils.toArray<HTMLElement>('[data-hero="word"]');
const heroEyebrow = document.querySelector<HTMLElement>('[data-hero="eyebrow"]');
const heroTagline = document.querySelector<HTMLElement>('[data-hero="tagline"]');
const heroActions = document.querySelector<HTMLElement>('[data-hero="actions"]');
const heroFrame = document.querySelector<HTMLElement>('[data-hero="frame"]');
const heroCaption = document.querySelector<HTMLElement>('[data-hero="caption"]');
const heroCue = document.querySelector<HTMLElement>('[data-hero="cue"]');

if (!reducedMotion) {
  gsap.set(heroWords, { yPercent: 115 });
  gsap.set([heroEyebrow, heroTagline, heroActions, heroCaption], { opacity: 0, y: 20 });
  gsap.set(heroFrame, { opacity: 0, clipPath: 'inset(12% 12% 12% 12%)', scale: 1.05 });
  gsap.set(heroCue, { opacity: 0 });

  const introTl = gsap.timeline({ delay: 0.15, defaults: { ease: 'expo.out' } });
  introTl
    .to(heroEyebrow, { opacity: 1, y: 0, duration: 0.9 })
    .to(heroWords, { yPercent: 0, duration: 1.25, stagger: 0.1 }, '-=0.6')
    .to(heroFrame, { opacity: 1, clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 1.4 }, '-=1.05')
    .to(heroTagline, { opacity: 1, y: 0, duration: 1 }, '-=1')
    .to(heroActions, { opacity: 1, y: 0, duration: 0.9 }, '-=0.8')
    .to(heroCaption, { opacity: 1, y: 0, duration: 0.8 }, '-=0.7')
    .to(heroCue, { opacity: 1, duration: 0.8 }, '-=0.5');

  // Fire the hero wordmark sheen after the words settle
  introTl.call(() => {
    document.querySelectorAll('[data-hero="word"].metallic-text').forEach((el) => el.classList.add('sheen-run'));
  }, [], '-=0.6');
}

/* ==================================================================
   Generic reveals — fade + rise, staggered by proximity
   ================================================================== */

const reveals = gsap.utils.toArray<HTMLElement>('[data-reveal]');

if (reducedMotion) {
  gsap.set(reveals, { clearProps: 'all' });
} else {
  reveals.forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 1.1,
      ease: 'expo.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 86%',
        once: true,
        onEnter: () => el.setAttribute('data-revealed', ''),
      },
    });
  });
}

/* ==================================================================
   Line reveals — masked children (headings that rise into view)
   ================================================================== */

const lineGroups = gsap.utils.toArray<HTMLElement>('[data-reveal-line]');

if (reducedMotion) {
  lineGroups.forEach((g) => gsap.set(g.children, { clearProps: 'all' }));
} else {
  lineGroups.forEach((group) => {
    const kids = Array.from(group.children) as HTMLElement[];
    gsap.set(kids, { yPercent: 110, opacity: 1 });
    // Clip the rise at the parent; pad slightly so descenders aren't cut
    kids.forEach((k) => {
      k.style.display = 'inline-block';
      const parent = k.parentElement!;
      parent.style.overflow = 'hidden';
      parent.style.display = 'block';
      parent.style.paddingBottom = '0.12em';
    });
    gsap.to(kids, {
      yPercent: 0,
      duration: 1.2,
      ease: 'expo.out',
      stagger: 0.08,
      scrollTrigger: { trigger: group, start: 'top 88%', once: true },
    });
  });
}

/* ==================================================================
   Image clip reveals — figures unmask upward on scroll-in
   ================================================================== */

if (!reducedMotion) {
  gsap.utils.toArray<HTMLElement>('figure[data-media]').forEach((fig) => {
    // Skip the hero frame (handled by intro timeline)
    if (fig.closest('#hero')) return;
    gsap.fromTo(
      fig,
      { clipPath: 'inset(0% 0% 100% 0%)' },
      {
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 1.3,
        ease: 'expo.out',
        scrollTrigger: { trigger: fig, start: 'top 90%', once: true },
      },
    );
  });
}

/* ==================================================================
   Parallax layers
   ================================================================== */

if (!reducedMotion) {
  gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
    const speed = parseFloat(el.dataset.parallaxSpeed || '0.1');
    gsap.to(el, {
      yPercent: -speed * 100,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  });
}

/* ==================================================================
   Metallic sheen — once per element on scroll-into-view
   ================================================================== */

document.querySelectorAll<HTMLElement>('[data-sheen]').forEach((el) => {
  if (reducedMotion) return;
  ScrollTrigger.create({
    trigger: el,
    start: 'top 85%',
    once: true,
    onEnter: () => el.classList.add('sheen-run'),
  });
});

/* ==================================================================
   Count-up stats
   ================================================================== */

document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
  const target = parseFloat(el.dataset.count || '0');
  const suffix = el.dataset.suffix || '';
  if (reducedMotion) {
    el.textContent = `${target}${suffix}`;
    return;
  }
  const obj = { val: 0 };
  ScrollTrigger.create({
    trigger: el,
    start: 'top 90%',
    once: true,
    onEnter: () => {
      gsap.to(obj, {
        val: target,
        duration: 1.8,
        ease: 'power2.out',
        onUpdate: () => {
          el.textContent = `${Math.round(obj.val)}${suffix}`;
        },
      });
    },
  });
});

/* ==================================================================
   Signature piece — pinned scroll-scrubbed reveal/zoom (the moment)
   ================================================================== */

const sigSection = document.querySelector<HTMLElement>('[data-signature-section]');
const sigFrame = document.querySelector<HTMLElement>('[data-signature-frame]');
const sigCaption = document.querySelector<HTMLElement>('[data-signature-caption]');

if (sigSection && sigFrame && sigCaption) {
  if (reducedMotion) {
    gsap.set(sigCaption, { opacity: 1, y: 0 });
  } else {
    gsap.set(sigFrame, { scale: 0.78, clipPath: 'inset(8% 8% 8% 8% round 4px)' });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sigSection,
        start: 'top top',
        end: '+=130%',
        scrub: 1,
        pin: true,
        anticipatePin: 1,
      },
    });

    tl.to(sigFrame, { scale: 1.05, clipPath: 'inset(0% 0% 0% 0% round 4px)', ease: 'none' })
      .to(sigCaption, { opacity: 1, y: 0, ease: 'none' }, '-=0.3');
  }
}

/* ==================================================================
   Magnetic buttons — cursor attraction (pointer devices only)
   ================================================================== */

if (!reducedMotion && window.matchMedia('(pointer: fine)').matches) {
  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    const strength = parseFloat(el.dataset.magneticStrength || '0.3');
    let rect = el.getBoundingClientRect();

    const onEnter = () => {
      rect = el.getBoundingClientRect();
    };
    const onMove = (e: MouseEvent) => {
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);
      gsap.to(el, { x: x * strength, y: y * strength, duration: 0.5, ease: 'power3.out' });
    };
    const onLeave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    };

    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
  });
}

/* Keep ScrollTrigger measurements correct after images/fonts settle */
window.addEventListener('load', () => ScrollTrigger.refresh());
