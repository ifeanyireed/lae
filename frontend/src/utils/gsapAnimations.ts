import gsap from 'gsap';

export const animateButtonPress = (target: HTMLElement | null) => {
  if (!target) return;
  gsap.timeline()
    .to(target, { scale: 0.92, duration: 0.08, ease: 'power2.inOut' })
    .to(target, { scale: 1.05, duration: 0.15, ease: 'back.out(2)' })
    .to(target, { scale: 1, duration: 0.1, ease: 'power1.out' });
};

export const animateButtonHover = (target: HTMLElement | null) => {
  if (!target) return;
  gsap.to(target, { scale: 1.08, y: -3, duration: 0.2, ease: 'power2.out' });
};

export const animateButtonLeave = (target: HTMLElement | null) => {
  if (!target) return;
  gsap.to(target, { scale: 1, y: 0, duration: 0.2, ease: 'power2.out' });
};

export const animateBlockSnap = (target: HTMLElement | null) => {
  if (!target) return;
  gsap.fromTo(
    target,
    { scale: 0.8, y: -15, opacity: 0 },
    { scale: 1, y: 0, opacity: 1, duration: 0.35, ease: 'elastic.out(1.2, 0.5)' }
  );
};

export const animateCharacterHop = (target: HTMLElement | null) => {
  if (!target) return;
  gsap.timeline()
    .to(target, { y: -20, scaleY: 1.15, duration: 0.15, ease: 'power2.out' })
    .to(target, { y: 0, scaleY: 1, duration: 0.2, ease: 'bounce.out' });
};
