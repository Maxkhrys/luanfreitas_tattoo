import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------------------------
   Smooth scrolling (Lenis driven by GSAP's ticker)
   ------------------------------------------------------------------ */

let lenis: Lenis | null = null;

if (!reducedMotion) {
  lenis = new Lenis({ lerp: 0.09 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis!.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (event) => {
    const href = anchor.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector(href);
    if (!target || !lenis) return;
    event.preventDefault();
    lenis.scrollTo(target as HTMLElement, { offset: href === '#top' ? 0 : -64 });
  });
});

/* ------------------------------------------------------------------
   Section reveals — staggered fade/rise, once per element
   ------------------------------------------------------------------ */

const reveals = gsap.utils.toArray<HTMLElement>('[data-reveal]');

if (reducedMotion) {
  gsap.set(reveals, { clearProps: 'all' });
} else {
  reveals.forEach((el, i) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'power3.out',
      delay: (i % 3) * 0.08,
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        once: true,
      },
    });
  });
}

/* ------------------------------------------------------------------
   Metallic sheen sweep — once per element, on load for the hero
   wordmark, on first scroll-into-view for everything else
   ------------------------------------------------------------------ */

document.querySelectorAll<HTMLElement>('[data-sheen]').forEach((el) => {
  if (el.hasAttribute('data-sheen-immediate')) {
    requestAnimationFrame(() => el.classList.add('sheen-run'));
    return;
  }
  if (reducedMotion) return;
  ScrollTrigger.create({
    trigger: el,
    start: 'top 85%',
    once: true,
    onEnter: () => el.classList.add('sheen-run'),
  });
});

/* ------------------------------------------------------------------
   Signature piece — scroll-scrubbed reveal/zoom (the gallery moment)
   ------------------------------------------------------------------ */

const signatureSection = document.querySelector<HTMLElement>('[data-signature-section]');
const signatureFrame = document.querySelector<HTMLElement>('[data-signature-frame]');
const signatureCaption = document.querySelector<HTMLElement>('[data-signature-caption]');

if (signatureSection && signatureFrame && signatureCaption) {
  if (reducedMotion) {
    gsap.set(signatureCaption, { opacity: 1, y: 0 });
  } else {
    gsap.set(signatureFrame, { scale: 0.82, clipPath: 'inset(6% 6% 6% 6% round 6px)' });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: signatureSection,
        start: 'top top',
        end: '+=120%',
        scrub: 1,
        pin: true,
        anticipatePin: 1,
      },
    });

    tl.to(signatureFrame, {
      scale: 1.08,
      clipPath: 'inset(0% 0% 0% 0% round 6px)',
      ease: 'none',
    }).to(
      signatureCaption,
      { opacity: 1, y: 0, ease: 'none' },
      '-=0.25',
    );
  }
}
