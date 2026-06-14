// Klado AI — subtle motion, cursor glow, particles, and waitlist validation

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const cursorGlow = document.getElementById("cursorGlow");
const panels = document.querySelectorAll(".liquid-panel");
const button = document.querySelector(".liquid-button");

if (!prefersReducedMotion && cursorGlow) {
  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;
  let tx = x;
  let ty = y;

  window.addEventListener("pointermove", (event) => {
    tx = event.clientX;
    ty = event.clientY;

    for (const panel of panels) {
      const rect = panel.getBoundingClientRect();
      panel.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      panel.style.setProperty("--my", `${event.clientY - rect.top}px`);
    }

    if (button) {
      const rect = button.getBoundingClientRect();
      button.style.setProperty("--bx", `${event.clientX - rect.left}px`);
      button.style.setProperty("--by", `${event.clientY - rect.top}px`);
    }
  }, { passive: true });

  const animateGlow = () => {
    x += (tx - x) * 0.12;
    y += (ty - y) * 0.12;
    cursorGlow.style.transform = `translate3d(${x - 260}px, ${y - 260}px, 0)`;
    requestAnimationFrame(animateGlow);
  };

  animateGlow();
}

// Waitlist form: local validation and success state.
// Hook this to a real backend later: Formspree, Supabase, Firebase, Buttondown, etc.
const form = document.getElementById("waitlistForm");
const email = document.getElementById("emailInput");
const error = document.getElementById("emailError");
const success = document.getElementById("waitlistSuccess");

if (form && email && error && success) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const value = email.value.trim();
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    form.classList.toggle("is-invalid", !isValid);
    error.hidden = isValid;

    if (!isValid) {
      email.focus();
      return;
    }

    form.hidden = true;
    success.hidden = false;

    // Store early signups locally until you add a backend.
    const existing = JSON.parse(localStorage.getItem("klado_waitlist") || "[]");
    existing.push({ email: value, createdAt: new Date().toISOString() });
    localStorage.setItem("klado_waitlist", JSON.stringify(existing));
  });

  email.addEventListener("input", () => {
    form.classList.remove("is-invalid");
    error.hidden = true;
  });
}

// Lightweight shimmer particles.
const canvas = document.getElementById("particles");

if (!prefersReducedMotion && canvas) {
  const ctx = canvas.getContext("2d");
  let particles = [];
  let width = 0;
  let height = 0;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  const resize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.min(56, Math.floor(width * height / 26000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.4 + 0.35,
      a: Math.random() * 0.32 + 0.08,
      vx: (Math.random() - 0.5) * 0.16,
      vy: (Math.random() - 0.5) * 0.16,
      phase: Math.random() * Math.PI * 2
    }));
  };

  const draw = (time) => {
    ctx.clearRect(0, 0, width, height);

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -20) p.x = width + 20;
      if (p.x > width + 20) p.x = -20;
      if (p.y < -20) p.y = height + 20;
      if (p.y > height + 20) p.y = -20;

      const twinkle = (Math.sin(time * 0.0016 + p.phase) + 1) / 2;
      const alpha = p.a * (0.45 + twinkle * 0.65);

      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 8);
      gradient.addColorStop(0, `rgba(118, 164, 255, ${alpha})`);
      gradient.addColorStop(0.45, `rgba(218, 203, 255, ${alpha * 0.45})`);
      gradient.addColorStop(1, "rgba(255,255,255,0)");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 8, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(draw);
  };

  window.addEventListener("resize", resize, { passive: true });
  resize();
  requestAnimationFrame(draw);
}
