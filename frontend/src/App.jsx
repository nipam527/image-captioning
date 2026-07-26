import { useState, useRef, useCallback, useEffect } from "react";
import axios from "axios";

const css = `
@import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;600;700;800&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:        #08090a;
  --surface:   #0f1012;
  --panel:     #14161a;
  --lift:      #1c1f24;
  --line:      rgba(255,255,255,0.06);
  --line-hi:   rgba(255,255,255,0.12);
  --t1:        #eef0f3;
  --t2:        #7c8390;
  --t3:        #3d4147;
  --accent:    #c8fb6a;
  --accent-d:  rgba(200,251,106,0.08);
  --accent-m:  rgba(200,251,106,0.18);
  --accent-g:  rgba(200,251,106,0.28);
  --green:     #52d68a;
  --green-d:   rgba(82,214,138,0.1);
  --red:       #f06a6a;
  --red-d:     rgba(240,106,106,0.1);
  --r:         14px;
  --rs:        9px;
  --transition: 0.16s cubic-bezier(0.4, 0, 0.2, 1);
}

html, body {
  min-height: 100%;
  background: var(--bg);
  color: var(--t1);
  font-family: 'Instrument Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
  font-size: 14px;
}

::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--line-hi); border-radius: 4px; }

/* ── layout ── */
.page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 32px 16px;
  position: relative;
}

.noise {
  position: fixed; inset: 0; pointer-events: none; z-index: 0; opacity: 0.022;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
}

.glow {
  position: fixed; top: -180px; left: 50%; transform: translateX(-50%);
  width: 600px; height: 380px; pointer-events: none; z-index: 0;
  background: radial-gradient(ellipse at 50% 0%, rgba(200,251,106,0.04) 0%, transparent 70%);
}

.shell { position: relative; z-index: 1; width: 100%; max-width: 480px; display: flex; flex-direction: column; gap: 12px; }

/* ── card ── */
.card {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 20px;
  overflow: hidden;
  box-shadow:
    0 0 0 1px rgba(255,255,255,0.02),
    0 24px 60px rgba(0,0,0,0.7),
    inset 0 1px 0 rgba(255,255,255,0.035);
}

/* ── header ── */
.hdr {
  padding: 18px 22px;
  display: flex; align-items: center; justify-content: space-between;
  border-bottom: 1px solid var(--line);
  background: rgba(255,255,255,0.01);
}

.brand { display: flex; align-items: center; gap: 10px; }
.brand-mark {
  width: 30px; height: 30px; border-radius: 8px;
  background: var(--accent); display: grid; place-items: center;
  flex-shrink: 0;
}
.brand-mark svg { width: 17px; height: 17px; }
.brand-name {
  font-family: 'Cabinet Grotesk', sans-serif;
  font-size: 14px; font-weight: 700;
  letter-spacing: -0.2px; color: var(--t1);
}

.hdr-actions { display: flex; align-items: center; gap: 6px; }

.pill {
  font-size: 9px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase;
  padding: 3px 8px; border-radius: 20px;
  color: var(--accent); background: var(--accent-d);
  border: 1px solid rgba(200,251,106,0.15);
}

.icon-btn {
  width: 30px; height: 30px; border-radius: 7px;
  border: 1px solid var(--line); background: transparent;
  color: var(--t2); cursor: pointer;
  display: grid; place-items: center;
  transition: background var(--transition), border-color var(--transition), color var(--transition);
  position: relative;
}
.icon-btn:hover { background: var(--lift); border-color: var(--line-hi); color: var(--t1); }
.icon-btn svg { width: 13px; height: 13px; }

.badge {
  position: absolute; top: -4px; right: -4px;
  min-width: 14px; height: 14px; border-radius: 7px;
  background: var(--accent); color: #08090a;
  font-size: 7px; font-weight: 800;
  display: grid; place-items: center;
  border: 2px solid var(--surface);
  padding: 0 3px;
}

/* ── body ── */
.body { padding: 22px; display: flex; flex-direction: column; gap: 20px; }

/* ── hero ── */
.hero { }
.hero-title {
  font-family: 'Cabinet Grotesk', sans-serif;
  font-size: 26px; font-weight: 800;
  line-height: 1.15; letter-spacing: -0.7px;
  color: var(--t1);
}
.hero-title em { font-style: normal; color: var(--accent); }
.hero-sub {
  margin-top: 6px;
  font-size: 13px; color: var(--t2); line-height: 1.6;
  font-weight: 400;
}

/* ── progress steps ── */
.steps { display: flex; align-items: center; gap: 0; }
.step-item { display: flex; align-items: center; gap: 6px; flex: 1; }
.step-item:last-child { flex: none; }
.step-dot {
  width: 20px; height: 20px; border-radius: 50%;
  display: grid; place-items: center;
  font-size: 9px; font-weight: 700;
  flex-shrink: 0;
  transition: all 0.2s;
}
.step-item.idle .step-dot { background: var(--panel); color: var(--t3); border: 1px solid var(--line); }
.step-item.active .step-dot { background: var(--accent-d); color: var(--accent); border: 1px solid rgba(200,251,106,0.25); }
.step-item.done .step-dot { background: var(--green-d); color: var(--green); border: 1px solid rgba(82,214,138,0.25); }
.step-label { font-size: 11px; font-weight: 500; }
.step-item.idle .step-label { color: var(--t3); }
.step-item.active .step-label { color: var(--t1); }
.step-item.done .step-label { color: var(--green); }
.step-line { flex: 1; height: 1px; background: var(--line); margin: 0 10px; }

/* ── separator ── */
.sep { height: 1px; background: var(--line); margin: 0 -22px; }

/* ── tabs ── */
.tabs {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px;
  background: var(--panel); border-radius: var(--rs); padding: 3px;
}
.tab {
  padding: 9px 6px; border-radius: 7px; border: none;
  background: transparent; color: var(--t3);
  font-family: 'Instrument Sans', sans-serif;
  font-size: 12.5px; font-weight: 500;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 5px;
  transition: background var(--transition), color var(--transition), box-shadow var(--transition);
}
.tab:hover:not(.active) { color: var(--t2); background: rgba(255,255,255,0.03); }
.tab.active {
  background: var(--lift); color: var(--t1);
  box-shadow: 0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px var(--line);
}
.tab.active svg { color: var(--accent); }
.tab svg { width: 13px; height: 13px; }

/* ── drop zone ── */
.dz {
  border-radius: var(--r); cursor: pointer; position: relative; overflow: hidden;
  transition: border-color var(--transition), background var(--transition), box-shadow var(--transition);
}
.dz-empty {
  border: 1.5px dashed var(--line);
  background: var(--panel);
  padding: 40px 24px;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px;
}
.dz-empty:hover, .dz-drag {
  border-color: var(--accent);
  background: var(--accent-d);
  box-shadow: 0 0 0 3px var(--accent-m), inset 0 0 24px rgba(200,251,106,0.03);
}
.dz-filled {
  border: 1px solid var(--line);
  background: var(--panel);
}
.dz-filled:hover { border-color: var(--line-hi); }

.dz-icon-wrap {
  width: 48px; height: 48px; border-radius: 12px;
  background: var(--lift); display: grid; place-items: center;
  border: 1px solid var(--line);
}
.dz-icon-wrap svg { width: 20px; height: 20px; color: var(--t3); }
.dz-drag .dz-icon-wrap { border-color: var(--accent); background: var(--accent-d); }
.dz-drag .dz-icon-wrap svg { color: var(--accent); }

.dz-heading { font-family: 'Cabinet Grotesk', sans-serif; font-size: 13.5px; font-weight: 700; color: var(--t1); }
.dz-sub { font-size: 11.5px; color: var(--t3); }

/* ── preview ── */
.preview-wrap { position: relative; aspect-ratio: 16/9; }
.preview-img {
  width: 100%; height: 100%; object-fit: cover;
  border-radius: calc(var(--r) - 1px); display: block;
}
.preview-overlay {
  position: absolute; inset: 0; border-radius: calc(var(--r) - 1px);
  display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: opacity var(--transition);
  background: rgba(8,9,10,0.55);
  backdrop-filter: blur(2px);
}
.dz-filled:hover .preview-overlay { opacity: 1; }
.replace-btn {
  display: flex; align-items: center; gap: 7px;
  font-size: 12px; font-weight: 600; color: var(--t1);
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.15);
  padding: 8px 16px; border-radius: 8px;
  backdrop-filter: blur(12px);
}

/* ── camera ── */
.cam-wrap {
  border-radius: var(--r); overflow: hidden;
  background: #000; aspect-ratio: 16/9;
  border: 1px solid var(--line);
}
.cam-feed { width: 100%; height: 100%; object-fit: cover; display: block; }

.cam-controls {
  display: flex; gap: 8px; align-items: center; justify-content: center;
}
.cam-secondary {
  height: 40px; padding: 0 16px; border-radius: var(--rs);
  border: 1px solid var(--line); background: var(--panel);
  color: var(--t1); font-family: 'Instrument Sans', sans-serif;
  font-size: 12.5px; font-weight: 500; cursor: pointer;
  display: flex; align-items: center; gap: 5px;
  transition: background var(--transition), border-color var(--transition);
}
.cam-secondary:hover { background: var(--lift); border-color: var(--line-hi); }

.cam-shutter {
  width: 52px; height: 52px; border-radius: 50%;
  background: var(--accent); border: 3px solid rgba(200,251,106,0.3);
  cursor: pointer; display: grid; place-items: center;
  transition: transform var(--transition), box-shadow var(--transition);
  box-shadow: 0 0 0 0 var(--accent-g);
}
.cam-shutter:hover { transform: scale(1.05); box-shadow: 0 0 0 6px var(--accent-m); }
.cam-shutter:active { transform: scale(0.94); }
.cam-shutter svg { width: 20px; height: 20px; color: #08090a; }

.cam-error {
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  padding: 36px 24px; border-radius: var(--r);
  border: 1.5px dashed var(--line); background: var(--panel);
  color: var(--t2); font-size: 13px; text-align: center;
}
.cam-error svg { color: var(--t3); width: 24px; height: 24px; }

/* ── url panel ── */
.url-group { display: flex; flex-direction: column; gap: 8px; }
.url-row { display: flex; gap: 6px; }
.url-input {
  flex: 1; height: 42px;
  background: var(--panel); border: 1px solid var(--line); border-radius: var(--rs);
  color: var(--t1); font-family: 'Instrument Sans', sans-serif; font-size: 13.5px;
  padding: 0 14px; outline: none;
  transition: border-color var(--transition), box-shadow var(--transition);
}
.url-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-m); }
.url-input::placeholder { color: var(--t3); }
.url-load {
  height: 42px; padding: 0 16px; border-radius: var(--rs);
  border: 1px solid var(--line); background: var(--panel);
  color: var(--t1); font-family: 'Instrument Sans', sans-serif;
  font-size: 13px; font-weight: 500; cursor: pointer; white-space: nowrap;
  display: flex; align-items: center; gap: 5px;
  transition: background var(--transition), border-color var(--transition);
}
.url-load:hover:not(:disabled) { background: var(--lift); border-color: var(--line-hi); }
.url-load:disabled { opacity: 0.4; cursor: not-allowed; }
.url-load svg { width: 13px; height: 13px; }
.url-hint { font-size: 11.5px; color: var(--t3); }

/* ── spinner ── */
.spin {
  width: 14px; height: 14px; border-radius: 50%; flex-shrink: 0;
  border: 2px solid currentColor; border-top-color: transparent;
  animation: rotate 0.65s linear infinite;
}
@keyframes rotate { to { transform: rotate(360deg); } }

/* ── CTA ── */
.cta {
  width: 100%; height: 48px; border-radius: var(--rs); border: none;
  font-family: 'Cabinet Grotesk', sans-serif;
  font-size: 14px; font-weight: 700; letter-spacing: 0.1px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  cursor: pointer; transition: all var(--transition);
}
.cta:disabled { opacity: 0.3; cursor: not-allowed !important; transform: none !important; }
.cta-idle { background: var(--panel); color: var(--t3); border: 1px solid var(--line); }
.cta-ready {
  background: var(--accent); color: #08090a;
  box-shadow: 0 2px 16px rgba(200,251,106,0.2);
}
.cta-ready:hover:not(:disabled) {
  background: #d4fd80;
  box-shadow: 0 4px 24px rgba(200,251,106,0.35);
  transform: translateY(-1px);
}
.cta-ready:active:not(:disabled) { transform: translateY(0); box-shadow: none; }
.cta-busy { background: var(--panel); color: var(--t2); border: 1px solid var(--line); cursor: default; }
.cta svg { width: 15px; height: 15px; }

/* ── result ── */
.result {
  background: var(--panel); border: 1px solid var(--line);
  border-radius: var(--r); overflow: hidden;
  animation: emerge 0.25s cubic-bezier(0.34, 1.4, 0.64, 1);
}
@keyframes emerge {
  from { opacity: 0; transform: translateY(6px) scale(0.99); }
  to   { opacity: 1; transform: none; }
}

.result-header {
  padding: 12px 16px; border-bottom: 1px solid var(--line);
  display: flex; align-items: center; gap: 7px;
}
.result-dot {
  width: 6px; height: 6px; border-radius: 50%; background: var(--accent);
  animation: pulse 2.5s ease-in-out infinite;
}
@keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.3;} }
.result-label {
  font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;
  color: var(--accent);
}

.result-body { padding: 16px; }
.result-text {
  font-size: 15px; font-weight: 400; color: var(--t1);
  line-height: 1.75; font-style: italic;
  padding-left: 14px; border-left: 2px solid var(--accent);
}
.result-meta {
  margin-top: 8px;
  font-size: 11px; color: var(--t3); text-align: right;
}

.result-actions {
  padding: 12px 16px;
  border-top: 1px solid var(--line);
  display: flex; gap: 6px; flex-wrap: wrap;
}
.act-btn {
  display: flex; align-items: center; gap: 5px;
  font-size: 12px; font-weight: 500; color: var(--t2);
  background: transparent; border: 1px solid var(--line); border-radius: 7px;
  padding: 6px 12px; cursor: pointer;
  font-family: 'Instrument Sans', sans-serif;
  transition: background var(--transition), border-color var(--transition), color var(--transition);
}
.act-btn:hover { background: var(--lift); color: var(--t1); border-color: var(--line-hi); }
.act-btn svg { width: 12px; height: 12px; }
.act-btn.accent-btn { color: var(--accent); border-color: rgba(200,251,106,0.2); background: var(--accent-d); }
.act-btn.green-btn  { color: var(--green);  border-color: rgba(82,214,138,0.2);   background: var(--green-d); }

/* ── history ── */
.history-panel {
  background: var(--surface);
  border: 1px solid var(--line); border-radius: 18px; overflow: hidden;
  animation: emerge 0.2s ease;
}
.history-header {
  padding: 14px 18px; border-bottom: 1px solid var(--line);
  display: flex; align-items: center; justify-content: space-between;
}
.history-title {
  font-family: 'Cabinet Grotesk', sans-serif;
  font-size: 13px; font-weight: 700; color: var(--t1);
}
.history-clear {
  font-size: 11px; color: var(--t3); background: none; border: none;
  cursor: pointer; font-family: 'Instrument Sans', sans-serif;
  padding: 4px 8px; border-radius: 5px;
  transition: color var(--transition), background var(--transition);
}
.history-clear:hover { color: var(--red); background: var(--red-d); }

.history-list { max-height: 240px; overflow-y: auto; padding: 6px; }
.history-item {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 10px; border-radius: 9px; cursor: pointer;
  border: 1px solid transparent;
  transition: background var(--transition), border-color var(--transition);
}
.history-item:hover { background: var(--panel); border-color: var(--line); }
.history-thumb {
  width: 52px; height: 36px; border-radius: 6px;
  object-fit: cover; flex-shrink: 0; border: 1px solid var(--line);
}
.history-caption {
  font-size: 12px; color: var(--t1); font-style: italic;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  font-weight: 400;
}
.history-time { font-size: 10.5px; color: var(--t3); margin-top: 2px; }
.history-empty {
  padding: 28px; text-align: center; color: var(--t3); font-size: 13px;
}

/* ── toasts ── */
.toast-stack {
  position: fixed; bottom: 20px; right: 20px;
  display: flex; flex-direction: column; gap: 7px;
  z-index: 9999; pointer-events: none;
}
.toast {
  display: flex; align-items: center; gap: 9px;
  padding: 10px 14px; border-radius: 10px; min-width: 220px;
  font-size: 12.5px; font-weight: 500; pointer-events: all;
  border: 1px solid; backdrop-filter: blur(20px);
  animation: slide-in 0.22s cubic-bezier(0.34, 1.3, 0.64, 1);
}
.toast.out { animation: slide-out 0.18s ease forwards; }
@keyframes slide-in  { from { opacity:0; transform:translateX(14px); } to { opacity:1; transform:none; } }
@keyframes slide-out { from { opacity:1; } to { opacity:0; transform:translateX(12px); } }
.toast-ok  { background: rgba(6,16,10,0.96); border-color: rgba(82,214,138,0.2); color: var(--green); }
.toast-err { background: rgba(18,6,6,0.96);  border-color: rgba(240,106,106,0.2); color: var(--red); }
.toast-inf { background: rgba(8,9,10,0.96);  border-color: rgba(200,251,106,0.18); color: var(--accent); }
.toast-icon { width: 14px; height: 14px; flex-shrink: 0; }
.toast-msg  { color: var(--t1); font-size: 12px; }
`;

/* ── helpers ── */
let _tid = 0;
const ago = ts => {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
};

/* ── brand logo mark ── */
/* Aperture blades (the "vision" half) fused with a caption baseline
   (the four short ticks beneath, the "language" half). Stroke-based
   so it stays crisp at 16-17px inside the header chip. */
const LogoMark = () => (
  <svg viewBox="0 0 40 44" width="17" height="17" fill="none">
    <g stroke="#08090a" strokeWidth="2.6" strokeLinecap="round">
      <path d="M20 18 L20 4" />
      <path d="M20 18 L31.3 11" />
      <path d="M20 18 L31.3 25" />
      <path d="M20 18 L20 32" />
      <path d="M20 18 L8.7 25" />
      <path d="M20 18 L8.7 11" />
    </g>
    <circle cx="20" cy="18" r="11" fill="none" stroke="#08090a" strokeWidth="2.6" />
    <circle cx="20" cy="18" r="4" fill="#08090a" />
    <g stroke="#08090a" strokeWidth="2.6" strokeLinecap="round">
      <line x1="13" y1="40" x2="13" y2="40" />
      <line x1="17.5" y1="40" x2="17.5" y2="40" />
      <line x1="22.5" y1="40" x2="22.5" y2="40" />
      <line x1="27" y1="40" x2="27" y2="40" />
    </g>
  </svg>
);

/* ── icons ── */
const Ic = {
  upload: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  cam:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  link:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  copy:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  share:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
  retry:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/></svg>,
  hist:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  check:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  x:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  bolt:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  flip:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4v6h6"/><path d="M23 20v-6h-6"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>,
  ok2:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  info:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
  err:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  img:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>,
};

/* ── Toasts ── */
function Toasts({ list }) {
  return (
    <div className="toast-stack">
      {list.map(t => (
        <div key={t.id} className={`toast toast-${t.type}${t.out ? " out" : ""}`}>
          <span className="toast-icon">
            {t.type === "ok" ? Ic.ok2 : t.type === "err" ? Ic.err : Ic.info}
          </span>
          <span className="toast-msg">{t.msg}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Camera ── */
function Camera({ onCapture, onCancel }) {
  const vidRef = useRef(null);
  const cnvRef = useRef(null);
  const streamRef = useRef(null);
  const [err, setErr] = useState(null);
  const [facing, setFacing] = useState("environment");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
        const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facing } });
        if (!alive) { s.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = s;
        if (vidRef.current) vidRef.current.srcObject = s;
        setErr(null);
      } catch { setErr("Camera access denied or unavailable."); }
    })();
    return () => { alive = false; streamRef.current?.getTracks().forEach(t => t.stop()); };
  }, [facing]);

  const snap = () => {
    const v = vidRef.current, c = cnvRef.current;
    if (!v || !c) return;
    c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext("2d").drawImage(v, 0, 0);
    c.toBlob(blob => {
      onCapture(new File([blob], `snap-${Date.now()}.jpg`, { type: "image/jpeg" }));
      streamRef.current?.getTracks().forEach(t => t.stop());
    }, "image/jpeg", 0.93);
  };

  if (err) return (
    <div className="cam-error">
      {Ic.cam}
      <span>{err}</span>
      <button className="cam-secondary" onClick={onCancel}>{Ic.x} Dismiss</button>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div className="cam-wrap">
        <video ref={vidRef} autoPlay playsInline muted className="cam-feed" />
        <canvas ref={cnvRef} style={{ display: "none" }} />
      </div>
      <div className="cam-controls">
        <button className="cam-secondary" onClick={() => setFacing(f => f === "user" ? "environment" : "user")}>
          {Ic.flip} Flip
        </button>
        <button className="cam-shutter" onClick={snap} title="Capture">{Ic.cam}</button>
        <button className="cam-secondary" onClick={() => { streamRef.current?.getTracks().forEach(t => t.stop()); onCancel(); }}>
          {Ic.x} Cancel
        </button>
      </div>
    </div>
  );
}

/* ── App ── */
export default function App() {
  const [mode,     setMode]     = useState("upload");
  const [image,    setImage]    = useState(null);
  const [preview,  setPreview]  = useState(null);
  const [caption,  setCaption]  = useState("");
  const [loading,  setLoading]  = useState(false);
  const [dragging, setDragging] = useState(false);
  const [copied,   setCopied]   = useState(false);
  const [urlVal,   setUrlVal]   = useState("");
  const [urlBusy,  setUrlBusy]  = useState(false);
  const [history,  setHistory]  = useState([]);
  const [showHist, setShowHist] = useState(false);
  const [toasts,   setToasts]   = useState([]);
  const fileRef = useRef(null);

  const toast = useCallback((msg, type = "inf") => {
    const id = ++_tid;
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => {
      setToasts(p => p.map(t => t.id === id ? { ...t, out: true } : t));
      setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 200);
    }, 3000);
  }, []);

  const applyFile = useCallback((file) => {
    if (!file || !file.type.startsWith("image/")) { toast("Please select a valid image file.", "err"); return; }
    if (file.size > 20 * 1024 * 1024) { toast("File exceeds 20 MB limit.", "err"); return; }
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setCaption("");
    toast("Image ready — generate your caption!", "inf");
  }, [toast]);

  const onFileChange = e => applyFile(e.target.files[0]);
  const onDrop = useCallback(e => { e.preventDefault(); setDragging(false); applyFile(e.dataTransfer.files[0]); }, [applyFile]);
  const onDragOver  = e => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);
  const clearImg = e => {
    e?.stopPropagation();
    setImage(null); setPreview(null); setCaption("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const loadUrl = async () => {
    if (!urlVal.trim()) return;
    setUrlBusy(true);
    try {
      const res = await fetch(urlVal);
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      if (!blob.type.startsWith("image/")) throw new Error();
      applyFile(new File([blob], "url-image.jpg", { type: blob.type }));
      setMode("upload");
    } catch { toast("Could not load image from that URL.", "err"); }
    setUrlBusy(false);
  };

  const generate = async () => {
    if (!image || loading) return;
    const fd = new FormData(); fd.append("image", image);
    setLoading(true);
    try {
      const res = await axios.post("https://image-captioning-ad6s.onrender.com/caption", fd);
      const cap = res.data.caption;
      setCaption(cap);
      setHistory(h => [{ id: Date.now(), thumb: preview, caption: cap, ts: Date.now() }, ...h.slice(0, 19)]);
      toast("Caption generated!", "ok");
    } catch (err) {
  console.log(err.response?.data);
  alert(JSON.stringify(err.response?.data));
}
    setLoading(false);
  };

  const copy = () => {
    navigator.clipboard.writeText(caption);
    setCopied(true); toast("Copied to clipboard!", "ok");
    setTimeout(() => setCopied(false), 2000);
  };

  const share = async () => {
    if (navigator.share) { try { await navigator.share({ text: caption }); } catch {} }
    else copy();
  };

  const stepState = s => {
    const cur = !image ? 0 : !caption ? 1 : 2;
    if (s < cur) return "done";
    if (s === cur) return "active";
    return "idle";
  };

  const PreviewBlock = ({ src }) => (
    <div className="preview-wrap">
      <img src={src} alt="preview" className="preview-img" />
      {!loading && (
        <div className="preview-overlay" onClick={() => fileRef.current?.click()}>
          <div className="replace-btn">{Ic.upload} Replace image</div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <style>{css}</style>
      <div className="noise" />
      <div className="glow" />

      <div className="page">
        <div className="shell">

          {/* Card */}
          <div className="card">

            {/* Header */}
            <div className="hdr">
              <div className="brand">
                <div className="brand-mark">
                  <LogoMark />
                </div>
                <span className="brand-name">CaptionLens</span>
              </div>
              <div className="hdr-actions">
                <span className="pill">Beta</span>
                <button
                  className="icon-btn"
                  onClick={() => setShowHist(h => !h)}
                  title="Caption history"
                  style={showHist ? { background: "var(--lift)", borderColor: "var(--line-hi)", color: "var(--t1)" } : {}}
                >
                  {Ic.hist}
                  {history.length > 0 && (
                    <span className="badge">{history.length > 9 ? "9+" : history.length}</span>
                  )}
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="body">

              {/* Hero */}
              <div className="hero">
                <h1 className="hero-title">Describe any<br /><em>image instantly.</em></h1>
                <p className="hero-sub">Upload, snap, or paste a URL — get an AI caption in seconds.</p>
              </div>

              {/* Steps */}
              <div className="steps">
                {[["Input", 0], ["Generate", 1], ["Caption", 2]].map(([label, idx], i) => (
                  <>
                    <div key={label} className={`step-item ${stepState(idx)}`}>
                      <div className="step-dot">
                        {stepState(idx) === "done" ? Ic.check : idx + 1}
                      </div>
                      <span className="step-label">{label}</span>
                    </div>
                    {i < 2 && <div key={`ln${i}`} className="step-line" />}
                  </>
                ))}
              </div>

              <div className="sep" />

              {/* Tabs */}
              <div className="tabs">
                {[["upload", Ic.upload, "Upload"], ["camera", Ic.cam, "Camera"], ["url", Ic.link, "URL"]].map(([m, icon, label]) => (
                  <button
                    key={m}
                    className={`tab${mode === m ? " active" : ""}`}
                    onClick={() => setMode(m)}
                  >
                    {icon} {label}
                  </button>
                ))}
              </div>

              {/* Upload */}
              {mode === "upload" && (
                <div
                  className={`dz ${preview ? "dz-filled" : `dz-empty${dragging ? " dz-drag" : ""}`}`}
                  onClick={() => !preview && fileRef.current?.click()}
                  onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave}
                >
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onFileChange} />
                  {preview
                    ? <PreviewBlock src={preview} />
                    : <>
                        <div className="dz-icon-wrap">{Ic.upload}</div>
                        <span className="dz-heading">{dragging ? "Drop to upload" : "Drop image or click to browse"}</span>
                        <span className="dz-sub">PNG · JPG · WEBP · GIF &nbsp;·&nbsp; Max 20 MB</span>
                      </>
                  }
                </div>
              )}

              {/* Camera */}
              {mode === "camera" && !preview && (
                <Camera
                  onCapture={file => { applyFile(file); setMode("upload"); }}
                  onCancel={() => setMode("upload")}
                />
              )}
              {mode === "camera" && preview && (
                <div style={{ borderRadius: "var(--r)", overflow: "hidden", border: "1px solid var(--line)", aspectRatio: "16/9" }}>
                  <img src={preview} alt="snap" className="preview-img" style={{ height: "100%" }} />
                </div>
              )}

              {/* URL */}
              {mode === "url" && !preview && (
                <div className="url-group">
                  <div className="url-row">
                    <input
                      className="url-input"
                      placeholder="https://example.com/photo.jpg"
                      value={urlVal}
                      onChange={e => setUrlVal(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && loadUrl()}
                    />
                    <button className="url-load" onClick={loadUrl} disabled={urlBusy || !urlVal.trim()}>
                      {urlBusy ? <><div className="spin" /> Loading</> : <>{Ic.link} Load</>}
                    </button>
                  </div>
                  <p className="url-hint">Paste a direct image URL and press Load or hit Enter.</p>
                </div>
              )}
              {mode === "url" && preview && (
                <div style={{ borderRadius: "var(--r)", overflow: "hidden", border: "1px solid var(--line)", aspectRatio: "16/9" }}>
                  <img src={preview} alt="url" className="preview-img" style={{ height: "100%" }} />
                </div>
              )}

              {/* CTA */}
              <button
                className={`cta ${loading ? "cta-busy" : image ? "cta-ready" : "cta-idle"}`}
                onClick={generate}
                disabled={!image || loading}
              >
                {loading
                  ? <><div className="spin" /> Analyzing image…</>
                  : image
                    ? <>{Ic.bolt} Generate Caption</>
                    : "Select an image to get started"
                }
              </button>

              {/* Result */}
              {caption && (
                <div className="result">
                  <div className="result-header">
                    <div className="result-dot" />
                    <span className="result-label">Generated Caption</span>
                  </div>
                  <div className="result-body">
                    <p className="result-text">"{caption}"</p>
                    <p className="result-meta">
                      {caption.length} characters · {caption.trim().split(/\s+/).length} words
                    </p>
                  </div>
                  <div className="result-actions">
                    <button className={`act-btn ${copied ? "green-btn" : ""}`} onClick={copy}>
                      {copied ? <>{Ic.ok2} Copied!</> : <>{Ic.copy} Copy</>}
                    </button>
                    <button className="act-btn accent-btn" onClick={share}>{Ic.share} Share</button>
                    <button className="act-btn" onClick={() => { setCaption(""); setTimeout(generate, 50); }}>{Ic.retry} Retry</button>
                    <button className="act-btn" onClick={() => setCaption("")}>{Ic.x} Clear</button>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* History */}
          {showHist && (
            <div className="history-panel">
              <div className="history-header">
                <span className="history-title">Caption History</span>
                {history.length > 0 && (
                  <button className="history-clear" onClick={() => { setHistory([]); toast("History cleared", "inf"); }}>
                    Clear all
                  </button>
                )}
              </div>
              {history.length === 0
                ? <div className="history-empty">No captions yet — generate your first!</div>
                : (
                  <div className="history-list">
                    {history.map(item => (
                      <div
                        key={item.id}
                        className="history-item"
                        onClick={() => { setPreview(item.thumb); setCaption(item.caption); setShowHist(false); toast("Loaded from history", "inf"); }}
                      >
                        <img src={item.thumb} alt="" className="history-thumb" />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="history-caption">"{item.caption}"</div>
                          <div className="history-time">{ago(item.ts)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              }
            </div>
          )}

        </div>
      </div>

      <Toasts list={toasts} />
    </>
  );
}
