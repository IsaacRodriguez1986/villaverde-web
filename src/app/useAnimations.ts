"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useAnimations() {
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    // Respect reduced motion
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    // --- 1. HERO TIMELINE ---
    const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });

    heroTl
      .from(".hero-badge", {
        y: -30,
        opacity: 0,
        duration: 0.6,
      })
      .from(
        ".hero h1",
        {
          y: 40,
          opacity: 0,
          duration: 0.8,
        },
        "-=0.3"
      )
      .from(
        ".hero-sub",
        {
          y: 30,
          opacity: 0,
          duration: 0.6,
        },
        "-=0.4"
      )
      .from(
        ".hero-pill",
        {
          y: 20,
          opacity: 0,
          duration: 0.5,
          stagger: 0.12,
        },
        "-=0.3"
      )
      .from(
        ".hero-btns a",
        {
          y: 20,
          opacity: 0,
          duration: 0.5,
          stagger: 0.15,
        },
        "-=0.2"
      )
      .from(
        ".hero-scroll",
        {
          opacity: 0,
          duration: 0.6,
        },
        "-=0.1"
      );

    // --- 2. SCROLL REVEALS (replace CSS .reveal) ---
    // immediateRender: false prevents hiding content before scroll — critical for SEO/crawlers
    const revealEls = gsap.utils.toArray<HTMLElement>(".reveal");
    revealEls.forEach((el) => {
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          once: true,
        },
        y: 40,
        opacity: 0,
        duration: 0.7,
        ease: "power2.out",
        immediateRender: false,
      });
    });

    // --- 3. PROOF BAR COUNTUP ---
    const proofNums = gsap.utils.toArray<HTMLElement>(".proof-num");
    proofNums.forEach((el) => {
      const text = el.textContent || "";
      const suffix = text.replace(/[\d.]/g, ""); // "+", "★", etc.
      const target = parseFloat(text);
      if (isNaN(target)) return;

      const obj = { val: 0 };
      el.textContent = "0" + suffix;

      gsap.to(obj, {
        val: target,
        duration: 2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          once: true,
        },
        onUpdate() {
          // Show decimal for 4.8, integers for the rest
          el.textContent =
            (target % 1 !== 0
              ? obj.val.toFixed(1)
              : Math.round(obj.val).toString()) + suffix;
        },
      });
    });

    // --- 4. STAGGERED SECTIONS ---

    // Package cards stagger
    ScrollTrigger.batch(".pkg", {
      start: "top 85%",
      once: true,
      onEnter: (batch) =>
        gsap.from(batch, {
          y: 60,
          opacity: 0,
          duration: 0.7,
          stagger: 0.15,
          ease: "power2.out",
        }),
    });

    // Event cards stagger
    ScrollTrigger.batch(".event-card", {
      start: "top 85%",
      once: true,
      onEnter: (batch) =>
        gsap.from(batch, {
          y: 50,
          opacity: 0,
          duration: 0.6,
          stagger: 0.12,
          ease: "power2.out",
        }),
    });

    // Why cards stagger
    ScrollTrigger.batch(".why-card", {
      start: "top 85%",
      once: true,
      onEnter: (batch) =>
        gsap.from(batch, {
          y: 40,
          opacity: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
        }),
    });

    // Gallery items stagger
    ScrollTrigger.batch(".gallery-item", {
      start: "top 90%",
      once: true,
      onEnter: (batch) =>
        gsap.from(batch, {
          scale: 0.9,
          opacity: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: "back.out(1.4)",
        }),
    });

    // Extra cards stagger
    ScrollTrigger.batch(".extra-card", {
      start: "top 90%",
      once: true,
      onEnter: (batch) =>
        gsap.from(batch, {
          y: 30,
          opacity: 0,
          duration: 0.5,
          stagger: 0.06,
          ease: "power2.out",
        }),
    });

    // Cortesias grid items
    ScrollTrigger.batch(".cort-item", {
      start: "top 90%",
      once: true,
      onEnter: (batch) =>
        gsap.from(batch, {
          y: 20,
          opacity: 0,
          duration: 0.4,
          stagger: 0.05,
          ease: "power2.out",
        }),
    });

    // CTA final section
    gsap.from(".cta-final .inner > *", {
      scrollTrigger: {
        trigger: ".cta-final",
        start: "top 75%",
        once: true,
      },
      y: 40,
      opacity: 0,
      duration: 0.7,
      stagger: 0.12,
      ease: "power2.out",
      immediateRender: false,
    });

    // FAQ items
    ScrollTrigger.batch(".faq-item", {
      start: "top 90%",
      once: true,
      onEnter: (batch) =>
        gsap.from(batch, {
          x: -30,
          opacity: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: "power2.out",
        }),
    });

    // --- 5. PARALLAX on hero background ---
    gsap.to(".hero-bg", {
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
      y: 120,
      ease: "none",
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);
}
