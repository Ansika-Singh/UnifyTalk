import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import T from "../components/T";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --bg:     #08041a;
    --bg2:    #0e0828;
    --bg3:    #150d38;
    --border: #2a1560;
    --border2:#3d2280;
    --p:      #a855f7;
    --p2:     #c084fc;
    --p3:     #e9d5ff;
    --cyan:   #06b6d4;
    --cyan2:  #67e8f9;
    --text:   #ede8ff;
    --muted:  #8b7bb1;
    --white:  #ffffff;
    --green:  #34d399;
    --amber:  #f59e0b;
    --red:    #fb7185;
  }

  /* ACCESSIBILITY */
  .skip-link {
    position: absolute;
    top: -100px;
    left: 0;
    background: var(--p);
    color: white;
    padding: 8px 16px;
    z-index: 1000;
    transition: top 0.3s;
    text-decoration: none;
    font-weight: 700;
    border-radius: 0 0 8px 0;
  }
  .skip-link:focus { top: 0; }

  /* Ensure focus visibility for keyboard users */
  :focus-visible {
    outline: 2px solid var(--p2);
    outline-offset: 4px;
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    *, ::before, ::after {
      animation-delay: -1ms !important;
      animation-duration: 1ms !important;
      animation-iteration-count: 1 !important;
      background-attachment: initial !important;
      scroll-behavior: auto !important;
      transition-duration: 0s !important;
      transition-delay: 0s !important;
    }
    .demo-marquee { animation: none !important; transform: none !important; flex-wrap: wrap; }
    .orb { display: none; }
  }

  /* Screen reader only class */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

  /* COSMOS */
  .cosmos {
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    overflow: hidden;
    background-color: #81480f;
    background-image: url('/keller.webp');
    background-size: 100% 100%;
    background-position: center;
    background-repeat: no-repeat;
    background-attachment: fixed;
    width: 100vw;
    height: 100vh;
    -webkit-background-size: 100% 100%;
    -moz-background-size: 100% 100%;
    -o-background-size: 100% 100%;
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
    -ms-interpolation-mode: nearest-neighbor;
  }
  .cosmos::after {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(8, 4, 26, 0.1);
    z-index: 1;
    pointer-events: none;
  }
    background: rgba(8, 4, 26, 0.15);
    z-index: 1;
    pointer-events: none;
  }
  .orb { position: absolute; border-radius: 50%; filter: blur(90px); animation: orbFloat 18s ease-in-out infinite alternate; }
  .orb1 { width: 700px; height: 700px; background: #4c1d95; opacity: 0.18; top: -250px; left: -250px; animation-delay: 0s; }
  .orb2 { width: 500px; height: 500px; background: #0e7490; opacity: 0.14; bottom: -200px; right: -200px; animation-delay: -7s; }
  .orb3 { width: 350px; height: 350px; background: #7c3aed; opacity: 0.12; top: 40%; right: 5%; animation-delay: -13s; }
  .orb4 { width: 250px; height: 250px; background: #0891b2; opacity: 0.1; bottom: 20%; left: 10%; animation-delay: -5s; }
  @keyframes orbFloat { 0% { transform: translate(0,0) scale(1); } 100% { transform: translate(30px,20px) scale(1.06); } }

  .stars { position: absolute; inset: 0; }
  .star { position: absolute; border-radius: 50%; background: white; animation: twinkle 3s ease-in-out infinite alternate; }
  @keyframes twinkle { 0% { opacity: 0.1; } 100% { opacity: 0.7; } }

  .grid-lines {
    position: absolute; inset: 0;
    background-image: linear-gradient(rgba(168,85,247,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.04) 1px, transparent 1px);
    background-size: 60px 60px;
  }

  /* NAV */
  .nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    height: 64px; padding: 0 48px;
    display: flex; align-items: center; justify-content: space-between;
    background: rgba(8,4,26,0.85); backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
    transition: box-shadow 0.3s;
  }
  .nav.scrolled { box-shadow: 0 4px 40px rgba(168,85,247,0.12); }
  .nav-logo { display: flex; align-items: center; gap: 10px; cursor: pointer; text-decoration: none; }
  .nav-icon { width: 34px; height: 34px; border-radius: 9px; background: linear-gradient(135deg, var(--p), var(--cyan)); display: flex; align-items: center; justify-content: center; font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 900; color: white; box-shadow: 0 0 20px rgba(168,85,247,0.4); }
  .nav-name { font-family: 'Playfair Display', serif; font-size: 19px; font-weight: 700; background: linear-gradient(90deg, var(--p2), var(--cyan)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .nav-links { display: flex; gap: 4px; align-items: center; list-style: none; }
  .nav-link { padding: 7px 16px; border-radius: 8px; background: none; border: none; color: var(--muted); font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; text-decoration: none; display: inline-block; }
  .nav-link:hover, .nav-link:focus { color: var(--text); background: rgba(168,85,247,0.08); text-decoration: underline; }
  .nav-cta { padding: 9px 22px; border-radius: 10px; border: none; cursor: pointer; background: linear-gradient(135deg, var(--p), var(--cyan)); color: white; font-size: 13px; font-weight: 700; font-family: 'DM Sans', sans-serif; box-shadow: 0 0 20px rgba(168,85,247,0.3); transition: all 0.2s; }
  .nav-cta:hover { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(168,85,247,0.45); }

  /* HERO */
  .hero { position: relative; z-index: 2; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 120px 24px 160px; }
  .hero-badge { display: inline-flex; align-items: center; gap: 8px; padding: 7px 20px; border-radius: 100px; margin-bottom: 32px; background: rgba(168,85,247,0.1); border: 1px solid rgba(168,85,247,0.3); font-size: 12px; color: var(--p2); font-weight: 600; letter-spacing: 2px; text-transform: uppercase; animation: fadeDown 0.8s ease both; }
  .hero-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--p2); box-shadow: 0 0 8px var(--p2); animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1);} 50%{opacity:0.4;transform:scale(0.7);} }
  @keyframes fadeDown { from{opacity:0;transform:translateY(-20px);} to{opacity:1;transform:translateY(0);} }
  @keyframes fadeUp   { from{opacity:0;transform:translateY(24px);}  to{opacity:1;transform:translateY(0);} }

  .hero-h1 { font-family: 'Playfair Display', serif; font-size: clamp(48px, 7.5vw, 96px); font-weight: 900; line-height: 1.0; letter-spacing: -2px; margin-bottom: 28px; animation: fadeUp 0.8s 0.15s ease both; }
  .hero-h1 .line1 { display: block; color: var(--text); }
  .hero-h1 .line2 { display: block; background: linear-gradient(90deg, var(--p), var(--cyan)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .hero-h1 .line3 { display: block; background: linear-gradient(90deg, var(--cyan), var(--p2)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .hero-sub { font-size: clamp(15px, 2vw, 19px); color: var(--muted); max-width: 580px; line-height: 1.75; margin-bottom: 44px; animation: fadeUp 0.8s 0.25s ease both; }
  .hero-actions { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; margin-bottom: 56px; animation: fadeUp 0.8s 0.35s ease both; }

  .btn-primary { padding: 16px 36px; border-radius: 14px; border: none; cursor: pointer; background: linear-gradient(135deg, var(--p), var(--cyan)); color: white; font-size: 15px; font-weight: 700; font-family: 'DM Sans', sans-serif; box-shadow: 0 0 32px rgba(168,85,247,0.35); transition: all 0.25s; display: flex; align-items: center; gap: 10px; }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(168,85,247,0.5); }
  .btn-ghost { padding: 16px 32px; border-radius: 14px; cursor: pointer; background: rgba(168,85,247,0.06); border: 1px solid var(--border2); color: var(--text); font-size: 15px; font-weight: 600; font-family: 'DM Sans', sans-serif; transition: all 0.2s; display: flex; align-items: center; gap: 10px; }
  .btn-ghost:hover { background: rgba(168,85,247,0.12); border-color: var(--p); }

  .hero-chips { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; animation: fadeUp 0.8s 0.45s ease both; }
  .chip { padding: 8px 18px; border-radius: 100px; background: rgba(168,85,247,0.07); border: 1px solid var(--border); font-size: 13px; color: var(--muted); display: flex; align-items: center; gap: 7px; transition: all 0.2s; cursor: default; }
  .chip:hover { border-color: var(--p); color: var(--p2); background: rgba(168,85,247,0.12); }

  .scroll-hint { position: absolute; bottom: 32px; left: 50%; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; gap: 8px; color: var(--muted); font-size: 11px; letter-spacing: 2px; text-transform: uppercase; animation: fadeUp 1s 0.8s ease both; }
  .scroll-line { width: 1px; height: 44px; background: linear-gradient(to bottom, var(--p), transparent); animation: scrollAnim 1.8s ease-in-out infinite; }
  @keyframes scrollAnim { 0%{transform:scaleY(0);transform-origin:top;opacity:1;} 50%{transform:scaleY(1);transform-origin:top;} 100%{transform:scaleY(1);transform-origin:bottom;opacity:0;} }

  /* LIVE DEMO STRIP */
  .demo-strip { position: relative; z-index: 2; background: rgba(14,8,40,0.8); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 20px 48px; display: flex; align-items: center; gap: 32px; overflow: hidden; }
  .demo-strip-label { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 2px; white-space: nowrap; }
  .demo-marquee { display: flex; gap: 32px; animation: marquee 20s linear infinite; }
  .demo-item { display: flex; align-items: center; gap: 8px; white-space: nowrap; font-size: 13px; color: var(--muted); padding: 6px 16px; border-radius: 100px; border: 1px solid var(--border); background: rgba(168,85,247,0.05); }
  .demo-item span { color: var(--p2); font-weight: 600; }
  @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
  .demo-marquee.paused { animation-play-state: paused; }
  .demo-pause-btn { background: none; border: 1px solid var(--border); color: var(--muted); padding: 4px 10px; border-radius: 6px; font-size: 11px; cursor: pointer; transition: all 0.2s; }
  .demo-pause-btn:hover { border-color: var(--p); color: var(--p2); }

  /* STATS */
  .stats-strip { position: relative; z-index: 2; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); background: rgba(14,8,40,0.7); display: grid; grid-template-columns: repeat(4, 1fr); padding: 48px; }
  .stat { text-align: center; padding: 16px; border-right: 1px solid var(--border); }
  .stat:last-child { border-right: none; }
  .stat-num { font-family: 'Playfair Display', serif; font-size: 44px; font-weight: 900; background: linear-gradient(90deg, var(--p), var(--cyan)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; line-height: 1; margin-bottom: 8px; }
  .stat-label { font-size: 13px; color: var(--muted); line-height: 1.5; }

  /* SECTIONS */
  .section { position: relative; z-index: 2; max-width: 1200px; margin: 0 auto; padding: 100px 48px; }
  .section-eyebrow { display: inline-flex; align-items: center; gap: 8px; padding: 5px 16px; border-radius: 100px; margin-bottom: 18px; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; }
  .section-title { font-family: 'Playfair Display', serif; font-size: clamp(30px, 4vw, 52px); font-weight: 900; line-height: 1.1; letter-spacing: -1px; margin-bottom: 16px; }
  .section-sub { font-size: 16px; color: var(--muted); line-height: 1.75; max-width: 520px; margin-bottom: 64px; }

  /* FEATURES */
  .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
  .feat-card { padding: 30px 28px; border-radius: 22px; background: var(--bg2); border: 1px solid var(--border); transition: all 0.3s; cursor: default; position: relative; overflow: hidden; }
  .feat-card::before { content: ''; position: absolute; inset: 0; border-radius: 22px; opacity: 0; transition: opacity 0.3s; }
  .feat-card.fp::before { background: linear-gradient(135deg, rgba(168,85,247,0.08), transparent 70%); }
  .feat-card.fc::before { background: linear-gradient(135deg, rgba(6,182,212,0.08), transparent 70%); }
  .feat-card:hover { transform: translateY(-5px); border-color: var(--border2); box-shadow: 0 20px 48px rgba(0,0,0,0.4); }
  .feat-card:hover::before { opacity: 1; }
  .feat-icon-wrap { width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 20px; position: relative; z-index: 1; }
  .feat-title { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; margin-bottom: 10px; position: relative; z-index: 1; color: var(--text); }
  .feat-desc { font-size: 14px; color: var(--muted); line-height: 1.7; position: relative; z-index: 1; }

  /* HOW IT WORKS — STEPS */
  .steps-wrap { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; position: relative; }
  .steps-wrap::before { content: ''; position: absolute; top: 28px; left: 10%; right: 10%; height: 2px; background: linear-gradient(90deg, var(--p), var(--cyan)); z-index: 0; }
  .step-item { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 0 16px; position: relative; z-index: 1; }
  .step-circle { width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 22px; margin-bottom: 20px; border: 2px solid var(--border2); background: var(--bg2); box-shadow: 0 0 24px rgba(168,85,247,0.2); }
  .step-title { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 700; margin-bottom: 8px; color: var(--text); }
  .step-desc { font-size: 13px; color: var(--muted); line-height: 1.6; }

  /* TESTIMONIALS */
  .testimonials-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
  .testi-card { padding: 28px; border-radius: 22px; background: var(--bg2); border: 1px solid var(--border); transition: all 0.3s; }
  .testi-card:hover { border-color: var(--border2); transform: translateY(-3px); box-shadow: 0 16px 40px rgba(0,0,0,0.3); }
  .testi-stars { display: flex; gap: 4px; margin-bottom: 16px; }
  .testi-star { color: var(--amber); font-size: 14px; }
  .testi-text { font-size: 14px; color: var(--text); line-height: 1.75; margin-bottom: 20px; font-style: italic; }
  .testi-author { display: flex; align-items: center; gap: 12px; }
  .testi-avatar { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 700; flex-shrink: 0; }
  .testi-name { font-size: 14px; font-weight: 700; color: var(--text); }
  .testi-role { font-size: 12px; color: var(--muted); }
  .testi-badge { display: inline-block; padding: 2px 10px; border-radius: 100px; font-size: 11px; font-weight: 600; margin-top: 4px; }

  /* PHASES */
  .phases-list { display: flex; flex-direction: column; gap: 14px; }
  .phase-row { display: flex; align-items: center; gap: 20px; padding: 20px 26px; border-radius: 18px; background: var(--bg2); border: 1px solid var(--border); transition: all 0.25s; cursor: default; }
  .phase-row:hover { border-color: var(--p); transform: translateX(8px); box-shadow: 0 8px 32px rgba(0,0,0,0.3); }
  .phase-num { width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 900; }
  .phase-info { flex: 1; }
  .phase-name { font-size: 15px; font-weight: 700; color: var(--text); margin-bottom: 3px; }
  .phase-desc { font-size: 13px; color: var(--muted); }
  .phase-done { padding: 5px 14px; border-radius: 100px; font-size: 11px; font-weight: 700; flex-shrink: 0; }

  /* WHO */
  .who-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
  .who-card { padding: 36px 28px; border-radius: 24px; text-align: center; border: 2px solid; transition: all 0.3s; display: flex; flex-direction: column; align-items: center; gap: 16px; }
  .who-card:hover { transform: translateY(-5px); box-shadow: 0 20px 48px rgba(0,0,0,0.3); }
  .who-emoji { font-size: 52px; }
  .who-title { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 900; }
  .who-desc { font-size: 14px; color: var(--muted); line-height: 1.75; }
  .who-features { display: flex; flex-direction: column; gap: 8px; width: 100%; }
  .who-feature { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--muted); padding: 8px 12px; border-radius: 10px; background: rgba(255,255,255,0.03); border: 1px solid var(--border); }
  .who-feature-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }

  /* TEAM */
  .team-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; max-width: 700px; margin: 0 auto; }
  .team-card { padding: 32px 24px; border-radius: 24px; background: var(--bg2); border: 1px solid var(--border); text-align: center; transition: all 0.3s; }
  .team-card:hover { border-color: var(--border2); transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.3); }
  .team-avatar { width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; font-size: 30px; font-weight: 900; font-family: 'Playfair Display', serif; border: 3px solid var(--border2); }
  .team-name { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; margin-bottom: 4px; }
  .team-role { font-size: 13px; color: var(--muted); margin-bottom: 8px; }
  .team-college { font-size: 11px; padding: 4px 12px; border-radius: 100px; display: inline-block; }
  .team-skills { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; margin-top: 16px; }
  .team-skill { font-size: 11px; padding: 3px 10px; border-radius: 100px; background: rgba(168,85,247,0.08); border: 1px solid var(--border); color: var(--muted); }

  /* TECH STACK */
  .tech-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
  .tech-card { padding: 20px; border-radius: 16px; background: var(--bg2); border: 1px solid var(--border); text-align: center; transition: all 0.2s; }
  .tech-card:hover { border-color: var(--border2); transform: translateY(-2px); }
  .tech-icon { font-size: 28px; margin-bottom: 10px; }
  .tech-name { font-size: 13px; font-weight: 700; color: var(--text); margin-bottom: 4px; }
  .tech-desc { font-size: 11px; color: var(--muted); }

  /* CTA */
  .cta-wrap { position: relative; z-index: 2; padding: 100px 48px; text-align: center; border-top: 1px solid var(--border); }
  .cta-inner { max-width: 720px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; gap: 24px; }
  .cta-glow { font-size: 60px; animation: ctaSpin 8s linear infinite; }
  @keyframes ctaSpin { from{filter:hue-rotate(0deg);} to{filter:hue-rotate(360deg);} }
  .cta-h2 { font-family: 'Playfair Display', serif; font-size: clamp(34px, 5vw, 64px); font-weight: 900; line-height: 1.1; letter-spacing: -1.5px; }
  .cta-h2 span { background: linear-gradient(90deg, var(--p2), var(--cyan), var(--p)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .cta-sub { font-size: 17px; color: var(--muted); line-height: 1.7; }
  .cta-credit { font-size: 13px; color: var(--muted); }
  .cta-credit strong { color: var(--p2); }

  /* FOOTER */
  .footer { position: relative; z-index: 2; padding: 32px 48px; border-top: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
  .footer-left { font-size: 13px; color: var(--muted); line-height: 1.7; }
  .footer-left strong { background: linear-gradient(90deg, var(--p2), var(--cyan)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 800; font-size: 15px; }
  .footer-links { display: flex; gap: 24px; }
  .footer-link { font-size: 13px; color: var(--muted); cursor: pointer; transition: color 0.2s; background: none; border: none; padding: 0; font-family: inherit; }
  .footer-link:hover { color: var(--p2); text-decoration: underline; }

  /* TOAST */
  .toast { position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%); padding: 12px 28px; border-radius: 100px; font-size: 13px; font-weight: 600; z-index: 9999; white-space: nowrap; background: rgba(168,85,247,0.15); border: 1px solid rgba(168,85,247,0.35); color: var(--p2); box-shadow: 0 8px 32px rgba(0,0,0,0.4); animation: fadeUp 0.3s ease; display: flex; align-items: center; gap: 8px; }

  /* LIVE INDICATOR */
  .live-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--green); box-shadow: 0 0 8px var(--green); animation: pulse 1.5s infinite; display: inline-block; margin-right: 6px; }

  @media(max-width: 900px) {
    .features-grid { grid-template-columns: repeat(2, 1fr); }
    .who-grid { grid-template-columns: 1fr; }
    .stats-strip { grid-template-columns: repeat(2, 1fr); padding: 32px 24px; }
    .stat { border-right: none; border-bottom: 1px solid var(--border); }
    .team-grid { grid-template-columns: 1fr 1fr; }
    .tech-grid { grid-template-columns: repeat(2, 1fr); }
    .steps-wrap { grid-template-columns: repeat(2, 1fr); gap: 24px; }
    .steps-wrap::before { display: none; }
    .testimonials-grid { grid-template-columns: 1fr 1fr; }
  }

  @media(max-width: 600px) {
    .nav { padding: 0 20px; }
    .section { padding: 64px 20px; }
    .features-grid { grid-template-columns: 1fr; }
    .hero-h1 { letter-spacing: -1px; }
    .footer { padding: 24px 20px; flex-direction: column; }
    .cta-wrap { padding: 64px 20px; }
    .team-grid { grid-template-columns: 1fr; }
    .tech-grid { grid-template-columns: repeat(2, 1fr); }
    .testimonials-grid { grid-template-columns: 1fr; }
    .demo-strip { padding: 16px 20px; }
  }
`;

const FEATURES = [
  { cls: "fp", bg: "rgba(168,85,247,0.12)", icon: "💬", title: "Speech to Text", desc: "Real-time voice transcription for deaf users. Every spoken word becomes readable text instantly at 95%+ accuracy." },
  { cls: "fc", bg: "rgba(6,182,212,0.12)", icon: "🔊", title: "Text to Speech", desc: "Mute users type their thoughts and have them spoken aloud in a natural, clear voice with adjustable speed and pitch." },
  { cls: "fp", bg: "rgba(168,85,247,0.12)", icon: "🖼️", title: "Pictogram Board", desc: "76 symbols across 9 categories. Build full sentences by tapping icons — no typing needed. Perfect for motor impairments too." },
  { cls: "fc", bg: "rgba(6,182,212,0.12)", icon: "🤟", title: "Sign Language AI", desc: "MediaPipe detects 21 hand landmarks in real time — converts your hand signs to text and speech at 30+ FPS." },
  { cls: "fp", bg: "rgba(168,85,247,0.12)", icon: "📖", title: "Screen Reader", desc: "Full keyboard navigation, voice commands, ARIA labels and Braille output. Designed from the ground up for blind users." },
  { cls: "fc", bg: "rgba(6,182,212,0.12)", icon: "🌍", title: "Community Platform", desc: "Share experiences, find communication buddies, track your progress and get support from a global accessibility community." },
];

const PHASES = [
  { n: "1", name: "Chat Interface", desc: "Speech↔Text, TTS, 3 disability modes, quick phrases", pc: "#a855f7", bg: "rgba(168,85,247,0.12)" },
  { n: "2", name: "Pictogram Board", desc: "76 symbols, 9 categories, sentence builder, emotions", pc: "#06b6d4", bg: "rgba(6,182,212,0.12)" },
  { n: "3", name: "Phrases & Emotions", desc: "Custom phrases, SOS alerts, emotion intensity slider", pc: "#a855f7", bg: "rgba(168,85,247,0.12)" },
  { n: "4", name: "Sign Language AI", desc: "MediaPipe hands + Face Mesh, 15 gestures, 12 emotions", pc: "#06b6d4", bg: "rgba(6,182,212,0.12)" },
  { n: "5", name: "Screen Reader", desc: "Voice nav, ARIA, keyboard shortcuts, Braille output", pc: "#a855f7", bg: "rgba(168,85,247,0.12)" },
  { n: "6", name: "Community Platform", desc: "Profiles, forum, dashboard, settings, buddy system", pc: "#06b6d4", bg: "rgba(6,182,212,0.12)" },
];

const WHO = [
  {
    emoji: "👂", title: "Deaf Users", tc: "#c084fc",
    border: "rgba(168,85,247,0.35)", bg: "rgba(168,85,247,0.06)",
    desc: "Convert speech to text instantly. Never miss a word in conversations, meetings, or medical appointments.",
    features: ["🎙️ Live speech transcription", "📱 Real-time captions", "🔔 Visual alerts & vibration", "🤟 Sign language input"],
    color: "var(--p)"
  },
  {
    emoji: "🗣️", title: "Mute Users", tc: "#67e8f9",
    border: "rgba(6,182,212,0.35)", bg: "rgba(6,182,212,0.06)",
    desc: "Type your thoughts and have them spoken aloud naturally. Build sentences with pictograms for lightning-fast communication.",
    features: ["🔊 Text-to-speech output", "🖼️ Pictogram sentences", "⚡ Quick phrase library", "😊 Emotion expressions"],
    color: "var(--cyan)"
  },
  {
    emoji: "👁️", title: "Blind Users", tc: "#c084fc",
    border: "rgba(168,85,247,0.35)", bg: "rgba(168,85,247,0.06)",
    desc: "Navigate entirely by voice. Every button, page, and feature is fully accessible without ever seeing the screen.",
    features: ["🎤 Voice command navigation", "⌨️ Full keyboard control", "♿ ARIA screen reader", "📖 Braille output support"],
    color: "var(--p)"
  },
];

const TESTIMONIALS = [
  {
    text: "I used the pictogram board to order food at a restaurant for the first time completely on my own. The staff understood me instantly. This is what inclusion feels like!",
    name: "Riya M.", role: "Deaf User", avatar: "RM",
    color: "linear-gradient(135deg,#34d399,#38bdf8)", badge: "Deaf", badgeColor: "rgba(52,211,153,0.15)", badgeText: "#34d399"
  },
  {
    text: "The Text-to-Speech in Mute Mode is incredible. I typed a full message to my doctor and it read it clearly. For the first time, I felt truly heard in a medical setting.",
    name: "Arjun K.", role: "Mute User", avatar: "AK",
    color: "linear-gradient(135deg,#818cf8,#fb7185)", badge: "Mute", badgeColor: "rgba(129,140,248,0.15)", badgeText: "#818cf8"
  },
  {
    text: "Voice navigation works SO well. I navigated the entire app using just my voice and keyboard. This is what accessible design actually looks like — built from the ground up.",
    name: "Divya S.", role: "Blind User", avatar: "DS",
    color: "linear-gradient(135deg,#f59e0b,#fb7185)", badge: "Blind", badgeColor: "rgba(245,158,11,0.15)", badgeText: "#f59e0b"
  },
];

const TEAM = [
  {
    initials: "AN", name: "Ansika singh",
    role: "Lead Developer & Visionary",
    college: "Cambridge Institute of Technology",
    color: "linear-gradient(135deg,#818cf8,#38bdf8)",
    collegeColor: "rgba(129,140,248,0.12)", collegeBorder: "rgba(129,140,248,0.3)", collegeText: "#818cf8",
    skills: ["React", "UI/UX", "CSS", "Accessibility"]
  },
  {
    initials: "BS", name: "Bishnu Kumar Sardar",
    role: "Backend & Systems Developer",
    college: "Cambridge Institute of Technology",
    color: "linear-gradient(135deg,#06b6d4,#a855f7)",
    collegeColor: "rgba(6,182,212,0.12)", collegeBorder: "rgba(6,182,212,0.3)", collegeText: "#06b6d4",
    skills: ["Node.js", "MongoDB", "Socket.io", "Express", "Research", "WCAG", "ISL", "Testing"]
  },
];

const TECH = [
  { icon: "⚛️", name: "React 18", desc: "Frontend framework" },
  { icon: "🟢", name: "Node.js", desc: "Backend runtime" },
  { icon: "🍃", name: "MongoDB", desc: "Database" },
  { icon: "⚡", name: "Socket.io", desc: "Real-time chat" },
  { icon: "🧠", name: "MediaPipe", desc: "Sign detection" },
  { icon: "👁️", name: "Google Vision", desc: "Image AI" },
  { icon: "🔐", name: "JWT Auth", desc: "Security" },
  { icon: "☁️", name: "Cloudinary", desc: "Media storage" },
];

const STEPS = [
  { icon: "📝", title: "Create Account", desc: "Sign up and choose your disability type — deaf, mute, blind, or none." },
  { icon: "🎯", title: "Pick Your Mode", desc: "The app automatically adapts its interface for your specific communication needs." },
  { icon: "💬", title: "Start Talking", desc: "Use voice, signs, pictograms or text — all converted to the right format for the other person." },
  { icon: "🌍", title: "Connect & Grow", desc: "Join the community, share your story, and help make the world more accessible." },
];

const STAR_DATA = Array.from({ length: 60 }, () => ({
  left: Math.random() * 100, top: Math.random() * 100,
  size: Math.random() * 2 + 0.5,
  delay: Math.random() * 4,
  duration: 2 + Math.random() * 3,
}));

const MARQUEE_ITEMS = [
  "🤟 Sign detected: I Love You (96%)",
  "💬 Message sent via pictogram board",
  "🔊 Text-to-speech: 'Good morning!'",
  "📖 Screen reader: Voice navigation active",
  "🎙️ Speech transcribed: 'How are you today?'",
  "😊 Emotion detected: Happy (92%)",
  "🆘 SOS alert sent to caregiver",
  "🌍 New community post from Riya M.",
];

export default function UnifyTalkCosmic() {
  const [scrolled, setScrolled] = useState(false);
  const [toast, setToast] = useState(null);
  const [counters, setCounters] = useState({ users: 0, countries: 0, accuracy: 0, uptime: 0 });

  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    document.title = "UnifyTalk | Universal Accessibility Platform for Deaf, Mute, and Blind";
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Animated counters
  useEffect(() => {
    const targets = { users: 4200, countries: 12, accuracy: 95, uptime: 99 };
    const duration = 2000;
    const steps = 60;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      const progress = step / steps;
      const ease = 1 - Math.pow(1 - progress, 3);
      setCounters({
        users: Math.floor(targets.users * ease),
        countries: Math.floor(targets.countries * ease),
        accuracy: Math.floor(targets.accuracy * ease),
        uptime: Math.floor(targets.uptime * ease),
      });
      if (step >= steps) clearInterval(interval);
    }, duration / steps);
    return () => clearInterval(interval);
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2400); };

  return (
    <>
      <style>{styles}</style>
      <div className="land">
        <a href="#main-content" className="skip-link">Skip to main content</a>

        {/* COSMOS */}
        <div className="cosmos" aria-hidden="true">
          <div className="orb orb1" /><div className="orb orb2" />
          <div className="orb orb3" /><div className="orb orb4" />
          <div className="grid-lines" />
          <div className="stars">
            {STAR_DATA.map((s, i) => (
              <div key={i} className="star" style={{ left: `${s.left}%`, top: `${s.top}%`, width: `${s.size}px`, height: `${s.size}px`, animationDelay: `${s.delay}s`, animationDuration: `${s.duration}s` }} />
            ))}
          </div>
        </div>

        {/* NAV */}
        <header>
          <nav className={`nav${scrolled ? " scrolled" : ""}`} aria-label="Main navigation">
            <a href="/" className="nav-logo" aria-label="UnifyTalk Home">
              <div className="nav-icon" aria-hidden="true">U</div>
              <span className="nav-name">UnifyTalk</span>
            </a>
            <ul className="nav-links">
              <li><a href="#features" className="nav-link"><T text="Features" tag="none" /></a></li>
              <li><a href="#how" className="nav-link"><T text="How It Works" tag="none" /></a></li>
              <li><a href="#who" className="nav-link"><T text="Who It Helps" tag="none" /></a></li>
              <li><a href="#team" className="nav-link"><T text="Team" tag="none" /></a></li>
            </ul>
            <Link to="/auth" className="nav-cta" style={{textDecoration: 'none'}} aria-label="Launch UnifyTalk App">
              <T text="Launch App" tag="none" /> <span aria-hidden="true">→</span>
            </Link>
          </nav>
        </header>

        <main id="main-content">
          {/* HERO */}
          <section className="hero" aria-labelledby="hero-title">
            <div className="hero-badge" role="status">
              <div className="hero-badge-dot" aria-hidden="true" />
              <span className="live-dot" aria-hidden="true" />
              <T text="Live Platform · All 6 Phases Complete" tag="none" />
            </div>

            <h1 className="hero-h1" id="hero-title">
              <span className="line1"><T text="Talk to Anyone." tag="none" /></span>
              <span className="line2"><T text="Understood" tag="none" /></span>
              <span className="line3"><T text="by All." tag="none" /></span>
            </h1>

            <p className="hero-sub">
              <T text="UnifyTalk is a full accessibility platform built by BTech students from Bengaluru — helping deaf, mute, and blind people communicate with the world using AI, sign language detection, and voice navigation." tag="none" />
            </p>

            <div className="hero-actions">
              <Link to="/auth" className="btn-primary" style={{textDecoration: 'none'}} aria-label="Launch UnifyTalk platform">
                🤝 <T text="Launch UnifyTalk" tag="none" />
              </Link>
              <a href="#features" className="btn-ghost" style={{textDecoration: 'none'}} aria-label="Explore Features">
                <T text="Explore Features" tag="none" /> <span aria-hidden="true">↓</span>
              </a>
            </div>

            <div className="hero-chips" role="list" aria-label="Platform capabilities">
              {["🤟 Sign Language AI", "💬 Text to Speech", "🖼️ Pictograms", "📖 Screen Reader", "🆘 SOS Alerts", "🌍 Community", "😊 Emotion Detection", "🎙️ Speech to Text"].map((c, i) => (
                <div key={i} className="chip" role="listitem">{c}</div>
              ))}
            </div>

            <div className="scroll-hint" aria-hidden="true">
              <span>Scroll</span>
              <div className="scroll-line" />
            </div>
          </section>

          {/* LIVE DEMO MARQUEE */}
          <section className="demo-strip" aria-label="Live activity feed">
            <div className="demo-strip-label" aria-hidden="true">🔴 Live Activity</div>
            <div style={{ overflow: "hidden", flex: 1 }}>
              <div className={`demo-marquee${isPaused ? " paused" : ""}`} role="marquee" aria-live="off">
                {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
                  <div key={i} className="demo-item">{item}</div>
                ))}
              </div>
            </div>
            <button
              className="demo-pause-btn"
              onClick={() => setIsPaused(!isPaused)}
              aria-label={isPaused ? "Resume Live Activity" : "Pause Live Activity"}
            >
              {isPaused ? "▶" : "⏸"}
            </button>
          </section>

          {/* STATS */}
          <section className="stats-strip" aria-label="Platform statistics" role="list">
            {[
              { num: `${counters.users.toLocaleString()}+`, label: "People helped worldwide" },
              { num: `${counters.countries}`, label: "Countries reached" },
              { num: `${counters.accuracy}%+`, label: "Sign detection accuracy" },
              { num: `${counters.uptime}%`, label: "Platform uptime" },
            ].map((s, i) => (
              <div key={i} className="stat" role="listitem">
                <div className="stat-num" aria-label={`${s.num} ${s.label}`}>{s.num}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </section>

          {/* FEATURES */}
          <section className="section" id="features" aria-labelledby="features-title">
            <div className="section-eyebrow" style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.25)", color: "#c084fc" }} aria-hidden="true">
              ✦ <T text="Core Features" tag="none" />
            </div>
            <h2 className="section-title" id="features-title">
              <T text="Built for" tag="none" /> <span style={{ background: "linear-gradient(90deg,#a855f7,#06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}><T text="Every Ability" tag="none" /></span>
            </h2>
            <p className="section-sub"><T text="Six powerful tools, each designed for a specific communication need — all in one unified platform." tag="none" /></p>
            <div className="features-grid" role="list">
              {FEATURES.map((f, i) => (
                <div key={i} className={`feat-card ${f.cls}`} role="listitem">
                  <div className="feat-icon-wrap" style={{ background: f.bg }} aria-hidden="true">{f.icon}</div>
                  <h3 className="feat-title"><T text={f.title} tag="none" /></h3>
                  <p className="feat-desc"><T text={f.desc} tag="none" /></p>
                </div>
              ))}
            </div>
          </section>

          {/* HOW IT WORKS */}
          <section className="section" id="how" aria-labelledby="how-it-works-title" style={{ paddingTop: 0 }}>
            <div className="section-eyebrow" style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.25)", color: "#67e8f9" }} aria-hidden="true">
              ✦ <T text="How It Works" tag="none" />
            </div>
            <h2 className="section-title" id="how-it-works-title">
              <T text="4 Simple" tag="none" /> <span style={{ background: "linear-gradient(90deg,#06b6d4,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}><T text="Steps" tag="none" /></span>
            </h2>
            <p className="section-sub"><T text="Getting started with UnifyTalk takes less than 2 minutes." tag="none" /></p>
            <div className="steps-wrap" role="list">
              {STEPS.map((s, i) => (
                <div key={i} className="step-item" role="listitem">
                  <div className="step-circle" style={{ background: i % 2 === 0 ? "rgba(168,85,247,0.12)" : "rgba(6,182,212,0.12)" }} aria-hidden="true">
                    {s.icon}
                  </div>
                  <h3 className="step-title"><T text={s.title} tag="none" /></h3>
                  <p className="step-desc"><T text={s.desc} tag="none" /></p>
                </div>
              ))}
            </div>
          </section>

          <section className="section" id="who" aria-labelledby="who-it-helps-title" style={{ paddingTop: 0 }}>
            <div className="section-eyebrow" style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.25)", color: "#c084fc" }} aria-hidden="true">
              ✦ <T text="Who It Helps" tag="none" />
            </div>
            <h2 className="section-title" id="who-it-helps-title">
              <T text="Built" tag="none" /> <span style={{ background: "linear-gradient(90deg,#c084fc,#67e8f9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}><T text="For Them" tag="none" /></span>
            </h2>
            <p className="section-sub"><T text="Three groups who have been underserved by technology for too long." tag="none" /></p>
            <div className="who-grid" role="list">
              {WHO.map((w, i) => (
                <div key={i} className="who-card" style={{ borderColor: w.border, background: w.bg }} role="listitem">
                  <div className="who-emoji" aria-hidden="true">{w.emoji}</div>
                  <h3 className="who-title" style={{ color: w.tc }}><T text={w.title} tag="none" /></h3>
                  <p className="who-desc"><T text={w.desc} tag="none" /></p>
                  <div className="who-features" role="list">
                    {w.features.map((f, j) => (
                      <div key={j} className="who-feature" role="listitem">
                        <div className="who-feature-dot" style={{ background: w.tc }} aria-hidden="true" />
                        <T text={f} tag="none" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* TESTIMONIALS */}
          <section className="section" aria-labelledby="testimonials-title" style={{ paddingTop: 0 }}>
            <div className="section-eyebrow" style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.25)", color: "#67e8f9" }} aria-hidden="true">
              ✦ <T text="Real Stories" tag="none" />
            </div>
            <h2 className="section-title" id="testimonials-title">
              <T text="What" tag="none" /> <span style={{ background: "linear-gradient(90deg,#67e8f9,#c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}><T text="Users Say" tag="none" /></span>
            </h2>
            <p className="section-sub"><T text="Real experiences from people whose lives are being changed by UnifyTalk." tag="none" /></p>
            <div className="testimonials-grid" role="list">
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className="testi-card" role="listitem">
                  <div className="testi-stars" aria-label="5 stars rating">
                    {[1, 2, 3, 4, 5].map(s => <span key={s} className="testi-star" aria-hidden="true">★</span>)}
                  </div>
                  <blockquote className="testi-text">"<T text={t.text} tag="none" />"</blockquote>
                  <div className="testi-author">
                    <div className="testi-avatar" style={{ background: t.color }} aria-hidden="true">{t.avatar}</div>
                    <div>
                      <div className="testi-name">{t.name}</div>
                      <div className="testi-role">{t.role}</div>
                      <div className="testi-badge" style={{ background: t.badgeColor, color: t.badgeText, border: `1px solid ${t.badgeColor}` }}>
                        {t.badge} User
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* PHASES */}
          <section className="section" aria-labelledby="phases-title" style={{ paddingTop: 0 }}>
            <div className="section-eyebrow" style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.25)", color: "#c084fc" }} aria-hidden="true">
              ✦ <T text="Build Phases" tag="none" />
            </div>
            <h2 className="section-title" id="phases-title">
              <T text="6 Phases." tag="none" /> <span style={{ background: "linear-gradient(90deg,#06b6d4,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}><T text="One Platform." tag="none" /></span>
            </h2>
            <p className="section-sub"><T text="Built phase by phase — each fully functional and demo-ready on its own." tag="none" /></p>
            <div className="phases-list" role="list">
              {PHASES.map((p, i) => (
                <div key={i} className="phase-row" role="listitem">
                  <div className="phase-num" style={{ background: p.bg, color: p.pc }} aria-hidden="true">{p.n}</div>
                  <div className="phase-info">
                    <h3 className="phase-name"><T text={p.name} tag="none" /></h3>
                    <p className="phase-desc"><T text={p.desc} tag="none" /></p>
                  </div>
                  <div className="phase-done" style={{ background: p.bg, color: p.pc, border: `1px solid ${p.pc}44` }}>
                    <span className="sr-only">Status:</span> ✅ <T text="Live" tag="none" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* TECH STACK */}
          <section className="section" aria-labelledby="tech-stack-title" style={{ paddingTop: 0 }}>
            <div className="section-eyebrow" style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.25)", color: "#67e8f9" }} aria-hidden="true">
              ✦ <T text="Tech Stack" tag="none" />
            </div>
            <h2 className="section-title" id="tech-stack-title">
              <T text="Powered by" tag="none" /> <span style={{ background: "linear-gradient(90deg,#67e8f9,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}><T text="Modern Tech" tag="none" /></span>
            </h2>
            <p className="section-sub"><T text="Built with industry-standard tools used by top tech companies worldwide." tag="none" /></p>
            <div className="tech-grid" role="list">
              {TECH.map((t, i) => (
                <div key={i} className="tech-card" role="listitem">
                  <div className="tech-icon" aria-hidden="true">{t.icon}</div>
                  <h3 className="tech-name">{t.name}</h3>
                  <p className="tech-desc"><T text={t.desc} tag="none" /></p>
                </div>
              ))}
            </div>
          </section>

          {/* TEAM */}
          <section className="section" id="team" aria-labelledby="team-title" style={{ paddingTop: 0 }}>
            <div className="section-eyebrow" style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.25)", color: "#c084fc" }} aria-hidden="true">
              ✦ The Team
            </div>
            <h2 className="section-title" id="team-title">
              Built with <span style={{ background: "linear-gradient(90deg,#c084fc,#67e8f9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Heart</span>
            </h2>
            <p className="section-sub">Two BTech students from Bengaluru on a mission to make communication universal.</p>
            <div className="team-grid" role="list">
              {TEAM.map((m, i) => (
                <div key={i} className="team-card" role="listitem">
                  <div className="team-avatar" style={{ background: m.color }} aria-hidden="true">{m.initials}</div>
                  <h3 className="team-name">{m.name}</h3>
                  <p className="team-role">{m.role}</p>
                  <div className="team-college" style={{ background: m.collegeColor, border: `1px solid ${m.collegeBorder}`, color: m.collegeText }}>
                    {m.college}
                  </div>
                  <div className="team-skills" role="list" aria-label="Skills">
                    {m.skills.map((s, j) => <span key={j} className="team-skill" role="listitem">{s}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="cta-wrap" aria-labelledby="cta-title">
            <div className="cta-inner">
              <div className="cta-glow" aria-hidden="true">🔮</div>
              <h2 className="cta-h2" id="cta-title">
                <T text="Ready to" tag="none" /> <span><T text="Break the Silence?" tag="none" /></span>
              </h2>
              <p className="cta-sub">
                <T text="UnifyTalk is free, open, and built with heart. Every voice deserves to be heard — and now it can be." tag="none" />
              </p>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
                <Link to="/auth" className="btn-primary" style={{textDecoration: 'none'}} aria-label="Launch UnifyTalk platform">
                  🚀 <T text="Start Communicating" tag="none" />
                </Link>
                <a href="https://github.com/Ansika-Singh/UnifyTalk" target="_blank" rel="noreferrer" className="btn-ghost" style={{textDecoration: 'none'}} aria-label="Support the project">
                  ⭐ <T text="Support the Project" tag="none" />
                </a>
              </div>
              <p className="cta-credit">
                Built by <strong>Ansika singh</strong> & <strong>Bishnu Kumar Sardar</strong><br />
                Cambridge Institute of Technology · Bengaluru · 2025
              </p>
            </div>
          </section>
        </main>

        {/* FOOTER */}
        <footer className="footer" aria-label="Site footer">
          <div className="footer-left">
            <strong>UnifyTalk</strong> · <T text="Every voice deserves to be heard." tag="none" /><br />
            Made with 💜 by Ansika & Bishnu · Bengaluru, India · 2025
          </div>
          <div className="footer-links" role="list">
            {["Features", "How It Works", "Community", "GitHub"].map(l => (
              <button key={l} className="footer-link" role="listitem" onClick={() => showToast(`📄 Opening ${l}…`)}><T text={l} tag="none" /></button>
            ))}
          </div>
        </footer>

        {toast && <div className="toast" role="status" aria-live="polite">{toast}</div>}
      </div>
    </>
  );
}
