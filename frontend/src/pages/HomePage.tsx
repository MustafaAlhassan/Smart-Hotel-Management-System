import { useState, useEffect } from "react";

import logoSrc from "../assets/Logo.png";
import hotelSrc from "../assets/Hotel.jpg";
import roomSrc from "../assets/Room.jpg";
import img1 from "../assets/1.jpg";
import img2 from "../assets/2.jpg";
import img3 from "../assets/3.jpg";
import img4 from "../assets/4.jpg";
import img5 from "../assets/5.jpg";
import img6 from "../assets/6.jpg";
import img7 from "../assets/7.jpg";
import img8 from "../assets/8.jpg";
import img9 from "../assets/9.jpg";
import img10 from "../assets/10.jpg";

const C = {
  bg0: "#080F1C",
  bg1: "#0B1526",
  bg2: "#0E1C31",
  bg3: "#12243C",
  bg4: "#172D49",
  teal: "#0C7A87",
  tealL: "#14A3B4",
  tealXL: "#5DCFDB",
  tealD: "#085E69",
  gold: "#B8975A",
  goldL: "#D4B577",
  goldXL: "#EDD499",
  indigo: "#3D5A99",
  indigoL: "#6278BB",
  textHi: "#F0F5FA",
  textPri: "#C8D6E5",
  textMut: "rgba(200,214,229,0.55)",
  textDim: "rgba(200,214,229,0.32)",
  border: "rgba(20,163,180,0.16)",
  glass: "rgba(14,28,49,0.90)",
};

const styles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { background: ${C.bg1}; color: ${C.textPri}; font-family: var(--ff-sans); }

  :root {
    --ff-serif: 'Cormorant Garamond', Georgia, serif;
    --ff-sans:  'Jost', 'Inter', sans-serif;
  }
  .hp { overflow-x: hidden; }

  /* ════════════════ NAVBAR ════════════════ */
  .nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
    padding: 0 5%;
    display: flex; align-items: center; justify-content: space-between;
    height: 72px;
    transition: background .4s, box-shadow .4s;
  }
  .nav.scrolled {
    background: ${C.glass};
    backdrop-filter: blur(22px);
    -webkit-backdrop-filter: blur(22px);
    box-shadow: 0 1px 0 ${C.border};
  }
  .nav-logo { display: flex; align-items: center; gap: 11px; text-decoration: none; }
  .nav-logo-img { height: 40px; width: auto; object-fit: contain; }
  .nav-logo-fallback {
    width: 40px; height: 40px; border: 1.5px solid ${C.tealL};
    display: flex; align-items: center; justify-content: center;
    font-family: var(--ff-serif); font-size: 1.2rem; color: ${C.tealL};
  }
  .nav-name { font-family: var(--ff-serif); font-size: 1.28rem; color: ${C.textHi}; letter-spacing: .14em; font-weight: 300; }
  .nav-links { display: flex; gap: 30px; list-style: none; }
  .nav-links a { color: ${C.textMut}; text-decoration: none; font-size: .73rem; letter-spacing: .17em; text-transform: uppercase; font-weight: 500; transition: color .2s; }
  .nav-links a:hover { color: ${C.tealXL}; }
  .nav-mob { display: none; background: none; border: none; cursor: pointer; }

  /* ════════════════ HERO ════════════════ */
  .hero {
    position: relative; height: 100vh; min-height: 680px;
    display: flex; align-items: center; justify-content: center; overflow: hidden;
  }
  /* ✅ FIX: Hero photo is an <img> element — NOT css background-image.
     CSS background-image with a missing/wrong URL triggers repeated network
     requests causing infinite loading. <img> with onError stops cleanly. */
  .hero-photo {
    position: absolute; inset: 0; width: 100%; height: 100%;
    object-fit: cover; object-position: center;
    opacity: .25; pointer-events: none;
  }
  .hero-tint {
    position: absolute; inset: 0;
    background: linear-gradient(160deg, ${C.bg0} 0%, rgba(8,15,28,.30) 50%, ${C.bg0} 100%);
  }
  .hero-fade {
    position: absolute; bottom: 0; left: 0; right: 0; height: 200px;
    background: linear-gradient(to bottom, transparent, ${C.bg1});
    pointer-events: none;
  }
  .hero-dots {
    position: absolute; inset: 0; opacity: .04; pointer-events: none;
    background-image:
      linear-gradient(${C.tealL} 1px, transparent 1px),
      linear-gradient(90deg, ${C.tealL} 1px, transparent 1px);
    background-size: 70px 70px;
  }
  .orb-a {
    position: absolute; pointer-events: none; border-radius: 50%;
    width: 680px; height: 680px; top: -180px; right: -180px;
    background: radial-gradient(circle, rgba(12,122,135,.17) 0%, transparent 65%);
  }
  .orb-b {
    position: absolute; pointer-events: none; border-radius: 50%;
    width: 480px; height: 480px; bottom: 10px; left: -120px;
    background: radial-gradient(circle, rgba(61,90,153,.20) 0%, transparent 65%);
  }
  .hero-content {
    position: relative; text-align: center; padding: 0 24px;
    animation: heroIn 1.1s ease both;
  }
  @keyframes heroIn { from{opacity:0;transform:translateY(22px);} to{opacity:1;transform:translateY(0);} }

  .hero-eye {
    font-size: .68rem; letter-spacing: .32em; text-transform: uppercase;
    color: ${C.tealXL}; margin-bottom: 20px; font-weight: 500;
    display: flex; align-items: center; justify-content: center; gap: 16px;
  }
  .hero-eye::before,.hero-eye::after { content:''; width: 36px; height: 1px; background: ${C.tealXL}; opacity:.5; }
  .hero-h1 {
    font-family: var(--ff-serif);
    font-size: clamp(3rem, 8vw, 6.6rem);
    font-weight: 300; line-height: 1.06; margin-bottom: 10px; color: ${C.textHi};
  }
  .hero-h1 em { font-style: italic; color: ${C.tealXL}; }
  .hero-sub {
    font-family: var(--ff-serif); font-size: clamp(.9rem,2.2vw,1.4rem);
    font-weight: 300; color: ${C.textMut}; letter-spacing: .1em; margin-bottom: 44px;
  }
  .hero-btns { display: flex; gap: 13px; justify-content: center; flex-wrap: wrap; }

  .btn-pri {
    background: linear-gradient(135deg, ${C.teal} 0%, ${C.indigo} 100%);
    color: ${C.textHi}; border: none;
    padding: 14px 40px; font-family: var(--ff-sans);
    font-size: .74rem; letter-spacing: .18em; text-transform: uppercase; font-weight: 600;
    cursor: pointer; transition: opacity .25s, transform .2s, box-shadow .25s;
  }
  .btn-pri:hover { opacity:.9; transform: translateY(-2px); box-shadow: 0 10px 26px rgba(12,122,135,.35); }
  .btn-ghost {
    background: transparent; color: ${C.textHi};
    border: 1px solid rgba(93,207,219,.3);
    padding: 14px 40px; font-family: var(--ff-sans);
    font-size: .74rem; letter-spacing: .18em; text-transform: uppercase; font-weight: 400;
    cursor: pointer; transition: border-color .25s, color .25s, transform .2s;
  }
  .btn-ghost:hover { border-color: ${C.tealXL}; color: ${C.tealXL}; transform: translateY(-2px); }

  .hero-scroll {
    position: absolute; bottom: 32px; left: 50%; transform: translateX(-50%);
    display: flex; flex-direction: column; align-items: center; gap: 7px;
    font-size: .62rem; letter-spacing: .22em; text-transform: uppercase;
    color: ${C.textDim}; cursor: pointer; user-select: none;
  }
  .scroll-line {
    width: 1px; height: 44px;
    background: linear-gradient(to bottom, ${C.tealL}, transparent);
    animation: pulse 2s ease-in-out infinite;
  }
  @keyframes pulse { 0%,100%{opacity:.3;} 50%{opacity:1;} }

  /* ════════════════ STATS ════════════════ */
  .stats {
    background: ${C.bg2};
    border-top: 1px solid ${C.border}; border-bottom: 1px solid ${C.border};
    padding: 44px 5%; display: grid; grid-template-columns: repeat(4,1fr);
  }
  .stat { text-align: center; padding: 0 18px; border-right: 1px solid rgba(255,255,255,.05); }
  .stat:last-child { border-right: none; }
  .stat-n { font-family: var(--ff-serif); font-size: clamp(2.3rem,4vw,3.5rem); font-weight: 300; color: ${C.tealXL}; line-height: 1; margin-bottom: 6px; }
  .stat-l { font-size: .66rem; letter-spacing: .2em; text-transform: uppercase; color: ${C.textMut}; }

  /* ════════════════ SECTION BASE ════════════════ */
  .sec { padding: 104px 5%; }
  .sec-eye { font-size: .67rem; letter-spacing: .3em; text-transform: uppercase; color: ${C.tealXL}; margin-bottom: 13px; font-weight: 500; display: flex; align-items: center; gap: 12px; }
  .sec-eye::before { content:''; width: 24px; height: 1px; background: ${C.tealXL}; }
  .sec-h { font-family: var(--ff-serif); font-size: clamp(1.9rem,4vw,3.1rem); font-weight: 300; line-height: 1.15; margin-bottom: 15px; color: ${C.textHi}; }
  .sec-h em { font-style: italic; color: ${C.tealXL}; }
  .sec-p { color: ${C.textMut}; font-size: .88rem; line-height: 1.88; max-width: 530px; font-weight: 300; }
  .divider { width: 48px; height: 1px; background: ${C.goldL}; margin: 19px 0; opacity: .4; }

  /* ════════════════ ABOUT ════════════════ */
  .about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 76px; align-items: center; max-width: 1260px; margin: 0 auto; }
  .about-img-wrap { position: relative; }
  .about-img { width: 100%; aspect-ratio: 4/5; object-fit: cover; border: 1px solid ${C.border}; display: block; }
  .about-badge {
    position: absolute; bottom: -20px; right: -20px;
    background: linear-gradient(135deg, ${C.teal} 0%, ${C.indigo} 100%);
    color: ${C.textHi}; width: 120px; height: 120px; border-radius: 50%;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    font-family: var(--ff-serif); box-shadow: 0 8px 24px rgba(0,0,0,.45);
  }
  .about-badge-n { font-size: 2.1rem; font-weight: 400; line-height: 1; }
  .about-badge-t { font-size: .55rem; letter-spacing: .1em; text-transform: uppercase; font-family: var(--ff-sans); font-weight: 600; text-align: center; padding: 0 10px; margin-top: 4px; }
  .about-feats { margin-top: 30px; display: flex; flex-direction: column; gap: 11px; }
  .about-feat {
    display: flex; align-items: center; gap: 13px; padding: 13px 17px;
    border: 1px solid ${C.border}; background: rgba(14,28,49,.6);
    transition: border-color .2s, background .2s;
  }
  .about-feat:hover { border-color: rgba(20,163,180,.32); background: rgba(12,122,135,.09); }
  .about-feat-ico { width: 36px; height: 36px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: rgba(20,163,180,.12); color: ${C.tealXL}; font-size: .95rem; }
  .about-feat-title { font-size: .84rem; font-weight: 500; color: ${C.textHi}; margin-bottom: 1px; }
  .about-feat-sub   { font-size: .78rem; color: ${C.textMut}; font-weight: 300; }

  /* ════════════════ SERVICES ════════════════ */
  .srv-sec { background: ${C.bg2}; }
  .srv-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 2px; margin-top: 58px; max-width: 1260px; margin-left: auto; margin-right: auto; }
  .srv-card { background: ${C.bg3}; overflow: hidden; position: relative; cursor: default; transition: background .3s; }
  .srv-card::after { content:''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, ${C.teal}, ${C.indigoL}); transform: scaleX(0); transform-origin: left; transition: transform .4s ease; }
  .srv-card:hover { background: rgba(12,122,135,.07); }
  .srv-card:hover::after { transform: scaleX(1); }
  .srv-img { width: 100%; height: 185px; object-fit: cover; display: block; transition: transform .5s ease; }
  .srv-card:hover .srv-img { transform: scale(1.04); }
  .srv-body { padding: 26px 26px 30px; }
  .srv-num { font-family: var(--ff-serif); font-size: 2.8rem; font-weight: 300; color: rgba(93,207,219,.09); line-height: 1; margin-bottom: 12px; transition: color .3s; }
  .srv-card:hover .srv-num { color: rgba(93,207,219,.18); }
  .srv-ico   { font-size: 1.45rem; margin-bottom: 10px; }
  .srv-title { font-family: var(--ff-serif); font-size: 1.35rem; font-weight: 400; margin-bottom: 9px; color: ${C.textHi}; }
  .srv-desc  { font-size: .82rem; color: ${C.textMut}; line-height: 1.82; font-weight: 300; }

  /* ════════════════ ROOMS ════════════════ */
  .rooms-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; margin-top: 58px; max-width: 1260px; margin-left: auto; margin-right: auto; }
  .room-card { overflow: hidden; border: 1px solid ${C.border}; background: ${C.bg3}; transition: border-color .25s, transform .25s; }
  .room-card:hover { border-color: rgba(20,163,180,.32); transform: translateY(-3px); }
  .room-img { width: 100%; aspect-ratio: 3/2; object-fit: cover; display: block; transition: transform .5s ease; }
  .room-card:hover .room-img { transform: scale(1.04); }
  .room-info { padding: 22px 22px 26px; }
  .room-tag  { font-size: .62rem; letter-spacing: .2em; text-transform: uppercase; color: ${C.tealXL}; margin-bottom: 6px; font-weight: 500; }
  .room-name { font-family: var(--ff-serif); font-size: 1.45rem; font-weight: 400; margin-bottom: 6px; color: ${C.textHi}; }
  .room-desc { font-size: .79rem; color: ${C.textMut}; line-height: 1.72; margin-bottom: 14px; font-weight: 300; }
  .room-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 12px; }
  .room-price { font-family: var(--ff-serif); font-size: 1.65rem; font-weight: 300; color: ${C.goldL}; }
  .room-price span { font-size: .68rem; font-family: var(--ff-sans); color: ${C.textMut}; }
  .room-amenities { display: flex; gap: 7px; flex-wrap: wrap; }
  .room-amenity { font-size: .64rem; color: ${C.textMut}; }
  .btn-sm { background: transparent; border: 1px solid ${C.tealL}; color: ${C.tealL}; padding: 8px 18px; font-family: var(--ff-sans); font-size: .67rem; letter-spacing: .12em; text-transform: uppercase; cursor: pointer; transition: background .2s, color .2s; }
  .btn-sm:hover { background: ${C.teal}; color: ${C.textHi}; border-color: ${C.teal}; }

  /* ════════════════ GALLERY ════════════════ */
  .gallery { display: flex; overflow: hidden; height: 210px; gap: 3px; }
  .gallery img { flex: 1; min-width: 0; height: 100%; object-fit: cover; filter: brightness(.65) saturate(.85); transition: flex .5s ease, filter .4s ease; cursor: pointer; }
  .gallery img:hover { flex: 2.6; filter: brightness(.95) saturate(1.1); }

  /* ════════════════ FEATURES ════════════════ */
  .feat-sec { background: ${C.bg2}; }
  .feat-header { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: end; margin-bottom: 60px; max-width: 1260px; margin-left: auto; margin-right: auto; }
  .feat-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 1px; background: rgba(20,163,180,.06); max-width: 1260px; margin: 0 auto; }
  .feat-item { background: ${C.bg2}; padding: 32px 22px; transition: background .25s; }
  .feat-item:hover { background: rgba(12,122,135,.08); }
  .feat-ico { font-size: 1.35rem; margin-bottom: 14px; width: 46px; height: 46px; display: flex; align-items: center; justify-content: center; background: rgba(20,163,180,.1); color: ${C.tealXL}; }
  .feat-title { font-size: .9rem; font-weight: 500; margin-bottom: 6px; color: ${C.textHi}; }
  .feat-desc  { font-size: .78rem; color: ${C.textMut}; line-height: 1.76; font-weight: 300; }

  /* ════════════════ TESTIMONIALS ════════════════ */
  .testi-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 18px; margin-top: 58px; max-width: 1260px; margin-left: auto; margin-right: auto; }
  .testi-card { background: ${C.bg3}; padding: 34px 26px; border: 1px solid ${C.border}; transition: border-color .25s; }
  .testi-card:hover { border-color: rgba(20,163,180,.32); }
  .testi-quote { font-family: var(--ff-serif); font-size: 3.6rem; color: ${C.tealL}; line-height: .62; margin-bottom: 14px; opacity: .28; }
  .testi-stars { color: ${C.goldL}; font-size: .7rem; margin-bottom: 9px; letter-spacing: 2px; }
  .testi-text  { font-family: var(--ff-serif); font-size: 1.06rem; font-style: italic; line-height: 1.82; color: rgba(240,245,250,.76); margin-bottom: 22px; font-weight: 300; }
  .testi-author { display: flex; align-items: center; gap: 12px; }
  .testi-avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, ${C.teal} 0%, ${C.indigo} 100%); display: flex; align-items: center; justify-content: center; font-family: var(--ff-serif); font-size: .95rem; color: ${C.textHi}; font-weight: 600; }
  .testi-name { font-size: .82rem; font-weight: 600; margin-bottom: 1px; color: ${C.textHi}; }
  .testi-role { font-size: .7rem; color: ${C.textMut}; letter-spacing: .05em; }

  /* ════════════════ LOCATION ════════════════ */
  .loc-grid { display: grid; grid-template-columns: 1fr 1.4fr; gap: 52px; align-items: start; max-width: 1260px; margin: 56px auto 0; }
  .loc-info { display: flex; flex-direction: column; gap: 24px; }
  .loc-item { display: flex; gap: 14px; align-items: flex-start; }
  .loc-ico { width: 42px; height: 42px; flex-shrink: 0; background: rgba(20,163,180,.1); color: ${C.tealXL}; display: flex; align-items: center; justify-content: center; font-size: .95rem; }
  .loc-title { font-size: .68rem; letter-spacing: .16em; text-transform: uppercase; color: ${C.tealXL}; margin-bottom: 4px; font-weight: 500; }
  .loc-text  { font-size: .84rem; color: rgba(200,214,229,.68); line-height: 1.7; font-weight: 300; }
  .map-wrap  { border: 1px solid ${C.border}; overflow: hidden; position: relative; }
  .map-wrap iframe { width: 100%; height: 390px; border: none; filter: grayscale(25%) brightness(.78) hue-rotate(158deg); }
  .map-badge { position: absolute; bottom: 12px; left: 12px; background: ${C.glass}; backdrop-filter: blur(14px); border: 1px solid rgba(20,163,180,.28); padding: 9px 13px; }
  .map-badge-title { font-size: .6rem; letter-spacing: .14em; text-transform: uppercase; color: ${C.tealXL}; margin-bottom: 2px; }
  .map-badge-text  { font-size: .74rem; color: rgba(200,214,229,.68); }

  /* ════════════════ CONTACT ════════════════ */
  .contact-sec { background: ${C.bg2}; }
  .contact-grid { display: grid; grid-template-columns: 1fr 1.1fr; gap: 64px; max-width: 1260px; margin: 56px auto 0; align-items: start; }
  .cform { display: flex; flex-direction: column; gap: 15px; }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 11px; }
  .form-f   { display: flex; flex-direction: column; gap: 6px; }
  .form-lbl { font-size: .63rem; letter-spacing: .18em; text-transform: uppercase; color: ${C.textMut}; font-weight: 500; }
  .form-inp,.form-ta { background: rgba(20,163,180,.05); border: 1px solid rgba(20,163,180,.14); color: ${C.textHi}; padding: 12px 14px; font-family: var(--ff-sans); font-size: .87rem; outline: none; transition: border-color .2s, background .2s; width: 100%; }
  .form-inp:focus,.form-ta:focus { border-color: ${C.tealL}; background: rgba(20,163,180,.09); }
  .form-inp::placeholder,.form-ta::placeholder { color: rgba(200,214,229,.2); }
  .form-ta { resize: none; height: 128px; }
  .form-ok { background: rgba(20,163,180,.1); border: 1px solid ${C.tealL}; padding: 13px; color: ${C.tealXL}; font-size: .82rem; text-align: center; letter-spacing: .06em; }
  .cdet { display: flex; flex-direction: column; gap: 28px; }
  .det-item { display: flex; gap: 14px; align-items: flex-start; }
  .det-ico { width: 40px; height: 40px; flex-shrink: 0; background: rgba(20,163,180,.1); color: ${C.tealXL}; display: flex; align-items: center; justify-content: center; font-size: .9rem; }
  .det-title { font-size: .63rem; letter-spacing: .18em; text-transform: uppercase; color: ${C.tealXL}; margin-bottom: 4px; font-weight: 500; }
  .det-text  { font-size: .84rem; color: rgba(200,214,229,.68); line-height: 1.7; font-weight: 300; }
  .soc { display: flex; gap: 8px; margin-top: 4px; }
  .soc-a { width: 36px; height: 36px; border: 1px solid rgba(200,214,229,.11); display: flex; align-items: center; justify-content: center; color: ${C.textMut}; font-size: .78rem; text-decoration: none; transition: border-color .2s, color .2s, background .2s; }
  .soc-a:hover { border-color: ${C.tealL}; color: ${C.tealXL}; background: rgba(20,163,180,.1); }

  /* ════════════════ FOOTER ════════════════ */
  .footer { background: ${C.bg0}; padding: 54px 5% 24px; border-top: 1px solid ${C.border}; }
  .footer-top { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 50px; margin-bottom: 44px; }
  .footer-logo { height: 36px; width: auto; object-fit: contain; display: block; margin-bottom: 2px; }
  .footer-line { width: 44px; height: 1px; background: ${C.tealL}; margin: 11px 0 12px; opacity: .38; }
  .footer-txt  { font-size: .82rem; color: ${C.textMut}; line-height: 1.8; font-weight: 300; max-width: 265px; }
  .footer-col-h { font-size: .63rem; letter-spacing: .2em; text-transform: uppercase; color: ${C.tealXL}; margin-bottom: 18px; font-weight: 500; }
  .footer-links { list-style: none; display: flex; flex-direction: column; gap: 9px; }
  .footer-links a { color: ${C.textMut}; text-decoration: none; font-size: .82rem; font-weight: 300; transition: color .2s; }
  .footer-links a:hover { color: ${C.tealXL}; }
  .footer-bot { border-top: 1px solid rgba(255,255,255,.04); padding-top: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
  .footer-copy { font-size: .72rem; color: ${C.textDim}; font-weight: 300; }

  /* ════════════════ MOBILE MENU ════════════════ */
  .mob-menu { position: fixed; inset: 0; z-index: 999; background: rgba(8,15,28,.97); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 26px; }
  .mob-close { position: absolute; top: 18px; right: 18px; background: none; border: none; color: ${C.tealXL}; font-size: 1.45rem; cursor: pointer; }
  .mob-link { color: ${C.textHi}; text-decoration: none; font-family: var(--ff-serif); font-size: 1.9rem; font-weight: 300; letter-spacing: .1em; transition: color .2s; }
  .mob-link:hover { color: ${C.tealXL}; }

  /* ════════════════ RESPONSIVE ════════════════ */
  @media (max-width: 1024px) {
    .about-grid,.loc-grid,.contact-grid { grid-template-columns: 1fr; gap: 38px; }
    .srv-grid,.rooms-grid,.testi-grid { grid-template-columns: repeat(2,1fr); }
    .feat-grid { grid-template-columns: repeat(2,1fr); }
    .stats { grid-template-columns: repeat(2,1fr); }
    .stat { border-bottom: 1px solid rgba(255,255,255,.05); }
    .footer-top { grid-template-columns: 1fr 1fr; gap: 30px; }
    .feat-header { grid-template-columns: 1fr; gap: 14px; }
  }
  @media (max-width: 768px) {
    .sec { padding: 64px 5%; }
    .nav-links { display: none; }
    .nav-mob { display: flex; }
    .srv-grid,.rooms-grid,.testi-grid,.feat-grid { grid-template-columns: 1fr; }
    .about-badge { width: 92px; height: 92px; bottom: -10px; right: -10px; }
    .footer-top { grid-template-columns: 1fr; gap: 24px; }
    .hero-btns { flex-direction: column; align-items: center; }
    .form-row { grid-template-columns: 1fr; }
  }
`;

const services = [
  {
    num: "01",
    ico: "🏊",
    img: img1,
    title: "Rooftop Infinity Pool",
    desc: "Temperature-controlled pool with panoramic views of Sulaymaniyah's skyline, open year-round.",
  },
  {
    num: "02",
    ico: "🌿",
    img: img2,
    title: "Ayurvedic Spa & Wellness",
    desc: "Ancient healing rituals and modern treatments by certified therapists, curated for body and mind.",
  },
  {
    num: "03",
    ico: "🍽️",
    img: img3,
    title: "Fine Dining Restaurant",
    desc: "Mediterranean and Kurdish flavors crafted by our award-winning executive chef daily.",
  },
  {
    num: "04",
    ico: "🤝",
    img: img4,
    title: "Executive Boardrooms",
    desc: "State-of-the-art AV technology with private catering and dedicated concierge service.",
  },
  {
    num: "05",
    ico: "🏋️",
    img: img5,
    title: "Luxury Fitness Center",
    desc: "24-hour center with personal trainers, yoga studio, and premium Technogym equipment.",
  },
  {
    num: "06",
    ico: "🚗",
    img: img6,
    title: "Chauffeur & Concierge",
    desc: "Airport transfers, private city tours — every detail of your journey orchestrated perfectly.",
  },
];

const rooms = [
  {
    tag: "Premier Suite",
    name: "Royal Presidential",
    img: roomSrc,
    price: "850",
    desc: "280 sqm residence with private terrace, butler service, and bespoke curated amenities.",
    amenities: ["🛁 Jacuzzi", "🌆 City View", "🛎 Butler"],
  },
  {
    tag: "Deluxe Room",
    name: "Grand Deluxe King",
    img: img7,
    price: "320",
    desc: "65 sqm of refined elegance with handcrafted furnishings and floor-to-ceiling windows.",
    amenities: ["🌅 Panoramic", "🍷 Minibar", "📺 Smart TV"],
  },
  {
    tag: "Classic Room",
    name: "Superior Classic",
    img: img8,
    price: "180",
    desc: "45 sqm sanctuaries balancing comfort and sophistication with signature AMI touches.",
    amenities: ["☕ Nespresso", "🛁 Deep Bath", "🎵 Sound"],
  },
];

const features = [
  {
    ico: "🌐",
    title: "Multilingual Staff",
    desc: "Our team speaks 12 languages for seamless communication worldwide.",
  },
  {
    ico: "🔒",
    title: "24/7 Security",
    desc: "Round-the-clock surveillance and discreet professional security.",
  },
  {
    ico: "🍳",
    title: "In-Room Dining",
    desc: "Full restaurant menu delivered within 30 minutes, any hour.",
  },
  {
    ico: "✈️",
    title: "Airport Transfers",
    desc: "Complimentary luxury transfers for all suite-level bookings.",
  },
  {
    ico: "💎",
    title: "Loyalty Program",
    desc: "AMI Privileges: exclusive rates, upgrades, and curated experiences.",
  },
  {
    ico: "🌿",
    title: "Eco-Certified",
    desc: "LEED-certified, zero-waste kitchens, and carbon-offset programs.",
  },
  {
    ico: "👶",
    title: "Family Concierge",
    desc: "Babysitting, kids' menus, and age-appropriate activities.",
  },
  {
    ico: "🏥",
    title: "Medical On-Call",
    desc: "Licensed physician available 24/7 for any medical need.",
  },
];

const testimonials = [
  {
    text: "AMI Hotel redefined luxury for me. The attention to detail — from embroidered pillowcases to a customized pillow menu — was extraordinary.",
    name: "Sophia Laurent",
    role: "CEO, Paris",
    ini: "SL",
    stars: 5,
  },
  {
    text: "We hosted our annual board retreat here and it was flawless. AV, catering, seamless transitions — the team anticipated our every need.",
    name: "James Whitmore",
    role: "Director, London",
    ini: "JW",
    stars: 5,
  },
  {
    text: "The spa alone is worth the journey. Three hours of treatments felt like a complete reset — I left lighter, calmer, completely renewed.",
    name: "Nadia Al-Rashid",
    role: "Architect, Dubai",
    ini: "NA",
    stars: 5,
  },
];

const navLinks: [string, string][] = [
  ["About", "about"],
  ["Services", "services"],
  ["Rooms", "rooms"],
  ["Location", "location"],
  ["Contact", "contact"],
];

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobOpen, setMobOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobOpen(false);
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
    setForm({ name: "", email: "", phone: "", subject: "", message: "" });
  };

  return (
    <div className="hp">
      <style>{styles}</style>

      <nav className={`nav ${scrolled ? "scrolled" : ""}`}>
        <a className="nav-logo" href="#">
          <img
            className="nav-logo-img"
            src={logoSrc}
            alt="AMI Hotel"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
          <span className="nav-name">AMI HOTEL</span>
        </a>
        <ul className="nav-links">
          {navLinks.map(([label, id]) => (
            <li key={id}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo(id);
                }}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
        <button
          className="nav-mob"
          onClick={() => setMobOpen((v) => !v)}
          aria-label="Menu"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke={C.tealXL}
            strokeWidth="1.5"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </nav>

      {mobOpen && (
        <div className="mob-menu">
          <button className="mob-close" onClick={() => setMobOpen(false)}>
            ✕
          </button>
          {navLinks.map(([label, id]) => (
            <a
              key={id}
              href="#"
              className="mob-link"
              onClick={(e) => {
                e.preventDefault();
                scrollTo(id);
              }}
            >
              {label}
            </a>
          ))}
        </div>
      )}

      <section className="hero">
        <img className="hero-photo" src={hotelSrc} alt="" aria-hidden="true" />
        <div className="hero-tint" />
        <div className="hero-fade" />
        <div className="hero-dots" />
        <div className="orb-a" />
        <div className="orb-b" />
        <div className="hero-content">
          <h1 className="hero-h1">
            Where Luxury
            <br />
            Meets <em>Timeless</em>
            <br />
            Elegance
          </h1>
          <p className="hero-sub">
            Experience the pinnacle of hospitality at AMI Hotel
          </p>
          <div className="hero-btns">
            <button className="btn-pri" onClick={() => scrollTo("rooms")}>
              Explore Rooms
            </button>
            <button className="btn-ghost" onClick={() => scrollTo("contact")}>
              Contact Us
            </button>
          </div>
        </div>
        <div className="hero-scroll" onClick={() => scrollTo("about")}>
          <div className="scroll-line" />
          <span>Scroll</span>
        </div>
      </section>

      <div className="stats">
        {[
          ["150+", "Luxury Rooms"],
          ["12", "Years of Excellence"],
          ["4.9★", "Guest Rating"],
          ["32", "Awards Won"],
        ].map(([n, l]) => (
          <div key={l} className="stat">
            <div className="stat-n">{n}</div>
            <div className="stat-l">{l}</div>
          </div>
        ))}
      </div>

      <section className="sec" id="about" style={{ background: C.bg1 }}>
        <div className="about-grid">
          <div className="about-img-wrap">
            <img className="about-img" src={img9} alt="AMI Hotel Interior" />
            <div className="about-badge">
              <span className="about-badge-n">12</span>
              <span className="about-badge-t">Years of Excellence</span>
            </div>
          </div>
          <div>
            <div className="sec-eye">About Us</div>
            <h2 className="sec-h">
              A Legacy of
              <br />
              <em>Unrivaled Hospitality</em>
            </h2>
            <div className="divider" />
            <p className="sec-p">
              Nestled in the heart of Sulaymaniyah, AMI Hotel has been the
              definitive address for discerning travelers since 2026. We blend
              Kurdish hospitality with international luxury standards.
            </p>
            <p className="sec-p" style={{ marginTop: 12 }}>
              Our philosophy: every guest deserves to feel like the only guest.
              Every detail is choreographed to perfection from arrival to
              departure.
            </p>
            <div className="about-feats">
              {[
                {
                  ico: "🏆",
                  title: "Award-Winning Service",
                  sub: "Recognized by Forbes Travel Guide and Condé Nast Traveller",
                },
                {
                  ico: "🌍",
                  title: "World-Class Facilities",
                  sub: "150+ rooms, 3 restaurants, spa, pool, and conference center",
                },
                {
                  ico: "🤲",
                  title: "Local Heritage",
                  sub: "Celebrating Kurdish culture through art, cuisine, and design",
                },
              ].map((f) => (
                <div key={f.title} className="about-feat">
                  <div className="about-feat-ico">{f.ico}</div>
                  <div>
                    <div className="about-feat-title">{f.title}</div>
                    <div className="about-feat-sub">{f.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="sec srv-sec" id="services">
        <div style={{ maxWidth: 1260, margin: "0 auto" }}>
          <div className="sec-eye">Our Services</div>
          <h2 className="sec-h">
            Crafted for the
            <br />
            <em>Most Discerning</em> Guests
          </h2>
        </div>
        <div className="srv-grid" style={{ marginTop: 58 }}>
          {services.map((s) => (
            <div key={s.num} className="srv-card">
              <img className="srv-img" src={s.img} alt={s.title} />
              <div className="srv-body">
                <div className="srv-num">{s.num}</div>
                <div className="srv-ico">{s.ico}</div>
                <h3 className="srv-title">{s.title}</h3>
                <p className="srv-desc">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="sec" id="rooms" style={{ background: C.bg1 }}>
        <div style={{ maxWidth: 1260, margin: "0 auto" }}>
          <div className="sec-eye">Accommodations</div>
          <h2 className="sec-h">
            Your Private
            <br />
            <em>Sanctuary</em> Awaits
          </h2>
          <p className="sec-p" style={{ marginTop: 11 }}>
            Each room is an individual masterpiece — bespoke furnishings,
            curated art, and technology designed to elevate every moment.
          </p>
        </div>
        <div className="rooms-grid">
          {rooms.map((r) => (
            <div key={r.name} className="room-card">
              <img className="room-img" src={r.img} alt={r.name} />
              <div className="room-info">
                <div className="room-tag">{r.tag}</div>
                <h3 className="room-name">{r.name}</h3>
                <p className="room-desc">{r.desc}</p>
                <div className="room-amenities">
                  {r.amenities.map((a) => (
                    <span key={a} className="room-amenity">
                      {a}
                    </span>
                  ))}
                </div>
                <div className="room-footer">
                  <div className="room-price">
                    ${r.price}
                    <span>/night</span>
                  </div>
                  <button
                    className="btn-sm"
                    onClick={() => scrollTo("contact")}
                  >
                    Inquire
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="gallery">
        {[img1, img2, img3, img4, img5, img6, img7, img8, img9, img10].map(
          (src, i) => (
            <img key={i} src={src} alt={`AMI Hotel ${i + 1}`} />
          ),
        )}
      </div>

      <section className="sec feat-sec">
        <div className="feat-header">
          <div>
            <div className="sec-eye">Why Choose Us</div>
            <h2 className="sec-h">
              Every Detail
              <br />
              <em>Perfected</em>
            </h2>
          </div>
          <p className="sec-p" style={{ alignSelf: "end" }}>
            True luxury lies in the details others overlook. Our commitment
            shows in every policy, every amenity, and every interaction.
          </p>
        </div>
        <div className="feat-grid">
          {features.map((f) => (
            <div key={f.title} className="feat-item">
              <div className="feat-ico">{f.ico}</div>
              <div className="feat-title">{f.title}</div>
              <div className="feat-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="sec" style={{ background: C.bg1 }}>
        <div style={{ maxWidth: 1260, margin: "0 auto" }}>
          <div className="sec-eye">Guest Stories</div>
          <h2 className="sec-h">
            Words from Our
            <br />
            <em>Beloved Guests</em>
          </h2>
        </div>
        <div className="testi-grid">
          {testimonials.map((t) => (
            <div key={t.name} className="testi-card">
              <div className="testi-quote">"</div>
              <div className="testi-stars">{"★".repeat(t.stars)}</div>
              <p className="testi-text">{t.text}</p>
              <div className="testi-author">
                <div className="testi-avatar">{t.ini}</div>
                <div>
                  <div className="testi-name">{t.name}</div>
                  <div className="testi-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="sec" id="location" style={{ background: C.bg2 }}>
        <div style={{ maxWidth: 1260, margin: "0 auto" }}>
          <div className="sec-eye">Find Us</div>
          <h2 className="sec-h">
            At the Heart of
            <br />
            <em>Sulaymaniyah</em>
          </h2>
        </div>
        <div className="loc-grid">
          <div className="loc-info">
            {[
              {
                ico: "📍",
                title: "Address",
                text: "Salim Street, Sulaymaniyah\nKurdistan Region, Iraq",
              },
              {
                ico: "🕐",
                title: "Check-in/Out",
                text: "Check-in: 3:00 PM · Check-out: 12:00 PM\nLate check-out available on request",
              },
              {
                ico: "🚗",
                title: "Getting Here",
                text: "15 min from Sulaymaniyah Int'l Airport\nValet parking · Shuttle for suite guests",
              },
              {
                ico: "📞",
                title: "Reservations",
                text: "+964 770 000 0000\nreservations@amihotel.com",
              },
            ].map((item) => (
              <div key={item.title} className="loc-item">
                <div className="loc-ico">{item.ico}</div>
                <div>
                  <div className="loc-title">{item.title}</div>
                  <div className="loc-text" style={{ whiteSpace: "pre-line" }}>
                    {item.text}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="map-wrap">
            <iframe
              src="https://www.openstreetmap.org/export/embed.html?bbox=45.3500%2C35.5000%2C45.4500%2C35.5700&layer=mapnik&marker=35.5368%2C45.3803"
              title="AMI Hotel"
              loading="lazy"
              allowFullScreen
            />
            <div className="map-badge">
              <div className="map-badge-title">AMI Hotel</div>
              <div className="map-badge-text">Salim Street, Sulaymaniyah</div>
            </div>
          </div>
        </div>
      </section>

      <section className="sec contact-sec" id="contact">
        <div style={{ maxWidth: 1260, margin: "0 auto" }}>
          <div className="sec-eye">Get in Touch</div>
          <h2 className="sec-h">
            We'd Love to
            <br />
            <em>Hear from You</em>
          </h2>
        </div>
        <div className="contact-grid">
          <form className="cform" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-f">
                <label className="form-lbl">Full Name</label>
                <input
                  className="form-inp"
                  placeholder="Your name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-f">
                <label className="form-lbl">Email</label>
                <input
                  className="form-inp"
                  type="email"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-f">
                <label className="form-lbl">Phone</label>
                <input
                  className="form-inp"
                  placeholder="+964 xxx xxx xxxx"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div className="form-f">
                <label className="form-lbl">Subject</label>
                <input
                  className="form-inp"
                  placeholder="Reservation / Inquiry"
                  value={form.subject}
                  onChange={(e) =>
                    setForm({ ...form, subject: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="form-f">
              <label className="form-lbl">Message</label>
              <textarea
                className="form-ta"
                placeholder="Tell us how we can assist you..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
              />
            </div>
            {submitted ? (
              <div className="form-ok">
                ✓ Thank you — we'll be in touch within 24 hours.
              </div>
            ) : (
              <button
                type="submit"
                className="btn-pri"
                style={{
                  padding: "15px",
                  fontSize: ".74rem",
                  letterSpacing: ".18em",
                }}
              >
                Send Message
              </button>
            )}
          </form>
          <div className="cdet">
            {[
              {
                ico: "📞",
                title: "Phone",
                text: "+964 770 000 0000\n+964 750 000 0000",
              },
              {
                ico: "✉️",
                title: "Email",
                text: "reservations@amihotel.com\ninfo@amihotel.com",
              },
              {
                ico: "📍",
                title: "Address",
                text: "Salim Street, Sulaymaniyah\nKurdistan Region, Iraq",
              },
              {
                ico: "🕐",
                title: "Front Desk",
                text: "24 hours · 7 days · 365 days a year",
              },
            ].map((d) => (
              <div key={d.title} className="det-item">
                <div className="det-ico">{d.ico}</div>
                <div>
                  <div className="det-title">{d.title}</div>
                  <div className="det-text" style={{ whiteSpace: "pre-line" }}>
                    {d.text}
                  </div>
                </div>
              </div>
            ))}
            <div>
              <div className="det-title" style={{ marginBottom: 8 }}>
                Follow Us
              </div>
              <div className="soc">
                {[
                  ["f", "Facebook"],
                  ["in", "Instagram"],
                  ["t", "Twitter"],
                  ["yt", "YouTube"],
                ].map(([s, l]) => (
                  <a
                    key={s}
                    href="#"
                    className="soc-a"
                    title={l}
                    onClick={(e) => e.preventDefault()}
                  >
                    {s}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-top">
          <div>
            <img
              className="footer-logo"
              src={logoSrc}
              alt="AMI Hotel"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
            <div className="footer-line" />
            <p className="footer-txt">
              Where luxury meets authentic Kurdish hospitality. A landmark of
              elegance in the heart of Sulaymaniyah since 2026.
            </p>
            <div className="soc" style={{ marginTop: 13 }}>
              {[
                ["f", "Facebook"],
                ["in", "Instagram"],
                ["t", "Twitter"],
              ].map(([s, l]) => (
                <a
                  key={s}
                  href="#"
                  className="soc-a"
                  title={l}
                  onClick={(e) => e.preventDefault()}
                >
                  {s}
                </a>
              ))}
            </div>
          </div>
          <div>
            <div className="footer-col-h">Explore</div>
            <ul className="footer-links">
              {navLinks.map(([label, id]) => (
                <li key={label}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollTo(id);
                    }}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="footer-col-h">Services</div>
            <ul className="footer-links">
              {[
                "Infinity Pool",
                "Spa & Wellness",
                "Fine Dining",
                "Conference Rooms",
                "Fitness Center",
                "Chauffeur Service",
              ].map((s) => (
                <li key={s}>
                  <a href="#">{s}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="footer-col-h">Policies</div>
            <ul className="footer-links">
              {[
                "Privacy Policy",
                "Terms & Conditions",
                "Cookie Policy",
                "Cancellation Policy",
                "Accessibility",
              ].map((p) => (
                <li key={p}>
                  <a href="#">{p}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="footer-bot">
          <span className="footer-copy">
            © {new Date().getFullYear()} AMI Hotel. All rights reserved.
          </span>
          <span className="footer-copy">
            Sulaymaniyah, Kurdistan Region, Iraq
          </span>
        </div>
      </footer>
    </div>
  );
}
