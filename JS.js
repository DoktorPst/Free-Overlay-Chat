/* ══════════════════════════════════════════════════════
   🩸 BLOOD CHAT — Diablo Edition | JS FINAL
   Nouvelles features :
   ✦ Couleur sang par type de badge
   ✦ Traînée /me
   ✦ Flash mention @pseudo configurable
   ✦ Flamèches latérales
   ✦ Hiérarchie sub/mod/vip/broadcaster
   ✦ Police plus grande sub/mod
   ✦ Flash premier message
   ✦ Animations de sortie variées
   ✦ Shake quand le chat s'emballe
   ✦ Transition idle→actif améliorée
   ══════════════════════════════════════════════════════ */
'use strict';

// ── État ────────────────────────────────────────────────
let fieldData    = {};
let msgCount     = 0;
let realMsgCount = 0;
let isVisible    = false;
let idleInterval = null;
let hideTimer    = null;
let idlePulseEl  = null;
let idleTextIdx  = 0;
let recentMsgs   = [];   // timestamps pour détecter le chat qui s'emballe
let shaking      = false;

const BOTS = new Set(['streamelements','nightbot','moobot','fossabot','streamlabs','wizebot','commanderroot','botrixoficial']);
const list   = document.getElementById('chat-list');
const widget = document.getElementById('widget-outer');

// ── Helpers ─────────────────────────────────────────────
const rand    = (a,b) => Math.random()*(b-a)+a;
const randInt = (a,b) => Math.floor(rand(a,b+1));
const fd      = k => fieldData[k];
const now     = () => { const d=new Date(); return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; };
function hexToRgb(hex) { if(!hex||hex.length<7) return '8,0,10'; return `${parseInt(hex.slice(1,3),16)},${parseInt(hex.slice(3,5),16)},${parseInt(hex.slice(5,7),16)}`; }

// ── Thème ────────────────────────────────────────────────
function applyTheme() {
  const R=document.documentElement, set=(k,v)=>R.style.setProperty(k,v);
  const bgOp  = (parseInt(fd('bgOpacity'))||92)/100;
  const wBgOp = (parseInt(fd('bgWidgetOpacity'))||0)/100;
  set('--msg-bg',        `rgba(${hexToRgb(fd('bgColor')||'#08000a')},${bgOp})`);
  set('--widget-bg',     wBgOp>0?`rgba(${hexToRgb(fd('bgWidgetColor')||'#000000')},${wBgOp})`:'transparent');
  set('--text-color',    fd('textColor')         ||'#ddd0c0');
  set('--chat-width',   (fd('chatWidth')         ||440)+'px');
  set('--font-size',    (fd('fontSize')          ||14) +'px');
  set('--username-size',(fd('usernameFontSize')  ||12) +'px');
  set('--font-weight',   fd('fontWeight')        ||'400');
  set('--msg-spacing',  (fd('msgSpacing')        ||7)  +'px');
  set('--anim-in',      (fd('animInDuration')    ||360)+'ms');
  set('--border-radius',(fd('msgBorderRadius')   ||2)  +'px');
  set('--sub-font-boost', fd('subFontBoost')     ||'1.0');
  set('--mod-font-boost', fd('modFontBoost')     ||'1.0');

  const fontName = fd('fontName')||'Exo 2';
  set('--font-family',`'${fontName}',sans-serif`);
  let link=document.getElementById('se-gfont');
  if(!link){link=document.createElement('link');link.id='se-gfont';link.rel='stylesheet';document.head.appendChild(link);}
  link.href=`https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g,'+')}:wght@300;400;600;700&display=swap`;

  const titleEl=document.getElementById('title-text');
  if(titleEl) titleEl.textContent=fd('widgetTitle')||'Chat des Damnés';

  // Bannière
  const banner=document.getElementById('stream-banner'), bannerT=document.getElementById('banner-text');
  const mode=fd('bannerMode')||'streamOnly';
  if(banner&&bannerT) {
    if(mode==='none') { banner.classList.add('hidden'); }
    else {
      banner.classList.remove('hidden');
      const s=fd('streamName')||'Paglorieux', str=fd('streamerName')||'DoktorP3st';
      bannerT.textContent = mode==='fullName' ? `${str} : ${s}` : s;
    }
  }

  const footer=document.getElementById('frame-footer');
  const embers=document.getElementById('embers');
  if(footer) footer.style.display = fd('showHellfire')===false?'none':'';
  if(embers) embers.style.display = fd('showEmbers')===false?'none':'';
}

// ══════════════════════════════════════════════════════
// ── BADGE UTILITIES ───────────────────────────────────
// ══════════════════════════════════════════════════════

function getBadgeType(badges) {
  if(!badges?.length) return 'viewer';
  const t = badges.map(b=>(b.type||b.t||'').toLowerCase());
  if(t.includes('broadcaster')) return 'broadcaster';
  if(t.includes('moderator'))   return 'moderator';
  if(t.includes('vip'))         return 'vip';
  if(t.includes('subscriber'))  return 'subscriber';
  return 'viewer';
}

// Couleur du sang selon le badge (le vrai différenciateur visuel)
function getBloodColors(badgeType) {
  switch(badgeType) {
    case 'broadcaster': return { dk:'#8b0000', lt:'#ff2200' };          // rouge vif
    case 'moderator':   return { dk:'#003060', lt:'#0077cc' };          // bleu
    case 'vip':         return { dk:'#4a0040', lt:'#cc00aa' };          // violet
    case 'subscriber':  return { dk:'#5a3800', lt:'#c8922a' };          // doré
    default:            return { dk:fd('bloodColor')||'#7a0000', lt:fd('bloodColorLight')||'#cc2020' };
  }
}

// ══════════════════════════════════════════════════════
// ── VISIBILITÉ ────────────────────────────────────────
// ══════════════════════════════════════════════════════

function setVisible(show, speed) {
  if(!widget) return;
  widget.style.transition=`opacity ${speed||0.8}s ease`;
  widget.style.opacity=show?'1':'0';
  isVisible=show;
}

function onRealMessageIn() {
  const wasIdle=!isVisible;
  realMsgCount++;
  clearTimeout(hideTimer);
  stopIdleCycle();
  killIdlePulse();
  if(wasIdle) triggerActivationFlare();
  setVisible(true, wasIdle?0.5:0.35);
}

function onRealMessageOut() {
  realMsgCount=Math.max(0,realMsgCount-1);
  if(realMsgCount>0) return;
  const delaySec=parseInt(fd('hideDelay'))??30;
  clearTimeout(hideTimer);
  if(delaySec===0) { setVisible(false,0.8); startIdleCycle(); }
  else {
    hideTimer=setTimeout(()=>{
      if(realMsgCount>0) return;
      setVisible(false,1.0);
      setTimeout(startIdleCycle, 900);
    }, delaySec*1000);
  }
}

function triggerActivationFlare() {
  // Drips plus forts depuis les coins
  ['cdrip-tl','cdrip-tr'].forEach((id,i)=>{
    const el=document.getElementById(id); if(!el) return;
    el.style.opacity='1';
    el.animate([{height:'0px'},{height:'65px'},{height:'45px'}],{duration:1200,delay:i*150,fill:'forwards',easing:'ease-out'});
  });
  widget?.classList.add('activation-flare');
  setTimeout(()=>widget?.classList.remove('activation-flare'), 1100);
}

// ══════════════════════════════════════════════════════
// ── IDLE PULSE ────────────────────────────────────────
// ══════════════════════════════════════════════════════

const IDLE_TEXTS=['En attente de messages...','Le chat sommeille...','Venez parler dans le chat !','Silence dans les enfers...','Chat disponible...'];

function startIdleCycle() {
  if(fd('showIdlePulse')===false) return;
  const sec=Math.max(2,parseInt(fd('idlePulseInterval'))||5);
  clearInterval(idleInterval);
  setTimeout(()=>{
    if(realMsgCount>0) return;
    showIdlePulse();
    idleInterval=setInterval(()=>{ if(realMsgCount>0){stopIdleCycle();return;} showIdlePulse(); }, sec*1000);
  }, 1200);
}

function stopIdleCycle() { clearInterval(idleInterval); idleInterval=null; }

function killIdlePulse() {
  if(idlePulseEl?.parentNode) {
    const el=idlePulseEl; el.classList.add('leaving');
    setTimeout(()=>{try{el.remove();}catch(e){}}, 550);
    idlePulseEl=null;
  }
}

function showIdlePulse() {
  if(realMsgCount>0) return;
  killIdlePulse();
  setVisible(true, 0.5);
  const li=document.createElement('li');
  li.className='chat-msg idle-msg';
  const name=fd('streamName')||'Paglorieux';
  const txt=IDLE_TEXTS[idleTextIdx++%IDLE_TEXTS.length];
  li.innerHTML=`<div class="msg-inner"><div class="blood-layer"></div><div class="msg-header"><span class="msg-username" style="color:#8b2020;">ᚠ ${name}</span></div><div class="msg-divider"></div><div class="msg-body">${txt}</div></div>`;
  list.appendChild(li);
  idlePulseEl=li;
  requestAnimationFrame(()=>requestAnimationFrame(()=>li.classList.add('visible')));
  const dur=Math.max(1500,parseInt(fd('idlePulseShowDuration'))||2500);
  setTimeout(()=>{
    if(idlePulseEl!==li) return;
    li.classList.add('leaving'); idlePulseEl=null;
    setTimeout(()=>{ try{li.remove();}catch(e){} if(realMsgCount===0) setVisible(false,0.8); }, 550);
  }, dur);
}

// ══════════════════════════════════════════════════════
// ── EFFETS SPÉCIAUX ───────────────────────────────────
// ══════════════════════════════════════════════════════

// Flash sur mention @pseudo
function checkAndFlashMention(text) {
  if(!text) return;
  const raw=fd('mentionAliases')||'DoktorP3st,Paglorieux';
  const aliases=raw.split(',').map(s=>s.trim().toLowerCase()).filter(Boolean);
  const lower=text.toLowerCase();
  if(aliases.some(a=>lower.includes('@'+a)||lower.includes(a))) {
    triggerMentionFlash();
  }
}
function triggerMentionFlash() {
  if(!widget) return;
  widget.classList.remove('mention-flash');
  void widget.offsetWidth; // reflow
  widget.classList.add('mention-flash');
  setTimeout(()=>widget.classList.remove('mention-flash'), 1700);
}

// Flash premier message
function triggerFirstMsgFlash() {
  if(!widget) return;
  widget.classList.remove('firstmsg-flash');
  void widget.offsetWidth;
  widget.classList.add('firstmsg-flash');
  setTimeout(()=>widget.classList.remove('firstmsg-flash'), 2100);
}

// Détection chat qui s'emballe
function trackChatBusy() {
  const t=Date.now();
  recentMsgs.push(t);
  const win=5000;
  recentMsgs=recentMsgs.filter(ts=>t-ts<=win);
  const threshold=parseInt(fd('shakeThreshold'))||5;
  if(fd('shakeEnabled')!==false && recentMsgs.length>=threshold && !shaking) {
    shaking=true;
    widget?.classList.add('shaking');
    setTimeout(()=>{ widget?.classList.remove('shaking'); shaking=false; }, 800);
  }
}

// ══════════════════════════════════════════════════════
// ── SVG SANG ─────────────────────────────────────────
// ══════════════════════════════════════════════════════

function makeSVG(sz, dk, lt) {
  const t=randInt(1,5), ns='http://www.w3.org/2000/svg';
  const s=document.createElementNS(ns,'svg');
  s.setAttribute('viewBox','0 0 100 100'); s.style.cssText=`width:${sz}px;height:${sz}px;display:block;`;
  const sh=[
    `<path d="M50 8C30 8 10 30 10 54C10 78 28 92 50 92C72 92 90 78 90 54C90 30 70 8 50 8Z" fill="${dk}" opacity=".96"/><ellipse cx="36" cy="33" rx="14" ry="8" fill="${lt}" opacity=".4" transform="rotate(-22 36 33)"/>`,
    `<path d="M50 4L55 35L84 16L65 44L96 48L66 55L83 82L52 63L50 96L48 63L17 82L34 55L4 48L35 44L16 16L45 35Z" fill="${dk}" opacity=".92"/><circle cx="50" cy="50" r="9" fill="${lt}" opacity=".3"/>`,
    `<path d="M50 6C67 4 84 17 88 36C94 52 90 70 78 79C64 92 38 94 24 82C10 70 6 50 14 36C22 20 36 8 50 6Z" fill="${dk}" opacity=".93"/><ellipse cx="38" cy="32" rx="15" ry="9" fill="${lt}" opacity=".36" transform="rotate(-18 38 32)"/>`,
    `<path d="M50 50C42 26 16 20 10 6C26 20 38 14 50 26C54 6 72 2 86 10C70 22 63 35 55 44C76 38 92 46 94 62C78 52 60 53 55 62C70 76 74 92 60 96C55 78 50 60 50 58C36 76 20 90 8 86C22 70 40 58 50 50Z" fill="${dk}" opacity=".91"/>`,
    `<ellipse cx="50" cy="50" rx="44" ry="20" fill="${dk}" opacity=".9"/><ellipse cx="40" cy="44" rx="11" ry="6" fill="${lt}" opacity=".38" transform="rotate(-28 40 44)"/><circle cx="20" cy="52" r="7" fill="${dk}" opacity=".5"/>`,
  ];
  s.innerHTML=sh[t-1]; return s;
}

function spawnBlood(el, colors, intensityMult) {
  const cnt=Math.round((parseInt(fd('bloodIntensity'))||12)*(intensityMult||1));
  if(!cnt) return;
  const layer=el.querySelector('.blood-layer'), inner=el.querySelector('.msg-inner');
  const w=inner.offsetWidth||390, h=inner.offsetHeight||62;
  const mxSz=parseInt(fd('bloodMaxSize'))||110;
  const dk=colors?.dk||fd('bloodColor')||'#7a0000';
  const lt=colors?.lt||fd('bloodColorLight')||'#cc2020';
  const hold=parseInt(fd('bloodHold'))||420, fade=parseInt(fd('bloodFadeOut'))||880;
  const drips=fd('bloodDripsEnabled')!==false;
  const all=[];

  const veil=document.createElement('div'); veil.className='blood-veil'; layer.appendChild(veil); all.push(veil);
  const flood=document.createElement('div'); flood.className='blood-flood'; layer.appendChild(flood); all.push(flood);

  for(let i=0;i<5;i++) {
    const s=document.createElement('div');
    s.className=`blood-streak ${Math.random()>.5?'from-left':'from-right'}`;
    s.style.setProperty('--sy',rand(6,h-6)+'px');
    s.style.setProperty('--sw',rand(w*.22,w*.55)+'px');
    s.style.setProperty('--sd',rand(25,110)+'ms');
    layer.appendChild(s); all.push(s);
  }

  for(let i=0;i<cnt;i++) {
    const sz=rand(mxSz*.28,mxSz), x=rand(-sz*.28,w-sz*.35), y=rand(-sz*.28,h-sz*.22), rot=rand(0,360), dl=rand(0,110);
    const wrap=document.createElement('div');
    wrap.className='blood-splat';
    wrap.style.cssText=`position:absolute;left:${x}px;top:${y}px;--rot:${rot}deg;animation-delay:${dl}ms;`;
    wrap.appendChild(makeSVG(sz,dk,lt)); layer.appendChild(wrap); all.push(wrap);
    if(drips&&Math.random()>.38) {
      const drip=document.createElement('div'), dh=rand(10,38);
      drip.className='blood-drip';
      drip.style.cssText=`position:absolute;left:${x+sz*.38}px;top:${y+sz*.72}px;width:${rand(2,4.5)}px;--dh:${dh}px;--bd:${dk};--bl:${lt};animation-duration:${rand(270,680)}ms;animation-delay:${dl+55}ms;`;
      layer.appendChild(drip); all.push(drip);
    }
  }
  setTimeout(()=>{ all.forEach(e=>e.classList.add('fading')); setTimeout(()=>{ if(layer) layer.innerHTML=''; },fade+120); }, hold);
}

// ══════════════════════════════════════════════════════
// ── CONSTRUCTION MESSAGE ──────────────────────────────
// ══════════════════════════════════════════════════════

const MBC=`<svg width="28" height="22" viewBox="0 0 28 22" xmlns="http://www.w3.org/2000/svg"><path d="M0,0 C5,0 12,3 10,9 C8,15 16,13 14,20 C11,15 5,17 2,13 C-1,9 2,4 0,0Z" fill="#5a0000" opacity=".65"/><path d="M0,0 C2,3 7,6 5,11 C3,13 7,17 5,21" stroke="#8b0000" stroke-width="1" fill="none" opacity=".45"/></svg>`;
const COLORS=['#ff6b6b','#ff9f43','#ffd32a','#0be881','#67e8f9','#a29bfe','#fd79a8','#e17055','#74b9ff','#55efc4'];
const colorCache={};
function getUserColor(name,raw) {
  if(raw&&raw!=='') return raw;
  if(!colorCache[name]) colorCache[name]=COLORS[[...name].reduce((a,c)=>a+c.charCodeAt(0),0)%COLORS.length];
  return colorCache[name];
}

function safeText(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/@(\w+)/g,'<span class="mention">@$1</span>');
}

// Détection premier message
function isFirstMessage(data) {
  return data.isFirstMessage===true
    || data.firstMessage===true
    || (data.tags&&(data.tags['first-msg']==='1'||data.tags['first-msg']===1));
}

function addMessage(data) {
  if(fd('hideCommands')&&(data.text||'').startsWith('!')) return;
  if(fd('hideBots')&&BOTS.has((data.displayName||'').toLowerCase())) return;
  if((data.text||'').length<(parseInt(fd('minMessageLength'))||1)) return;

  const badgeType  = getBadgeType(data.badges);
  const bloodColor = getBloodColors(badgeType);
  const firstMsg   = isFirstMessage(data);
  const isAction   = !!data.isAction;

  const li=document.createElement('li');
  li.className='chat-msg';
  li.dataset.id=`msg-${++msgCount}`;
  li.dataset.msgid=data.msgId||'';
  li.dataset.user=(data.displayName||'').toLowerCase();

  // Classes hiérarchie
  if(badgeType==='moderator')   li.classList.add('is-mod');
  if(badgeType==='subscriber')  li.classList.add('is-sub');
  if(badgeType==='vip')         li.classList.add('is-vip');
  if(badgeType==='broadcaster') li.classList.add('is-broadcaster');
  if(firstMsg)                  li.classList.add('is-firstmsg');
  if(isAction)                  li.classList.add('is-action');

  const anim=fd('animInType')||'slideUp';
  if(anim!=='slideUp') li.classList.add(`anim-${anim}`);

  li.innerHTML=`
    <div class="msg-inner">
      <div class="mbc tl">${MBC}</div>
      <div class="mbc tr">${MBC}</div>
      <div class="blood-layer"></div>
      <div class="msg-header">
        <span class="msg-badges"></span>
        <span class="msg-username"></span>
        <span class="msg-timestamp"></span>
      </div>
      <div class="msg-divider"></div>
      <div class="msg-body"></div>
    </div>`;

  // Pseudo
  const un=li.querySelector('.msg-username');
  un.textContent=data.displayName||'Anonyme';
  un.style.color=getUserColor(data.displayName||'user',data.displayColor||'');

  // Badges
  const bdg=li.querySelector('.msg-badges');
  if(fd('showBadges')!==false&&Array.isArray(data.badges)) {
    data.badges.forEach(b=>{ if(b.url){const img=document.createElement('img');img.src=b.url;img.alt=b.type||'';bdg.appendChild(img);} });
  }

  // Timestamp
  const ts=li.querySelector('.msg-timestamp');
  ts.textContent=fd('showTimestamp')?now():'';
  ts.style.display=fd('showTimestamp')?'':'none';

  // Corps + traînée /me
  const body=li.querySelector('.msg-body');
  body.innerHTML=data.renderedText||safeText(data.text||'');
  if(isAction) {
    const trail=document.createElement('div'); trail.className='me-trail'; body.appendChild(trail);
    const drip=document.createElement('div');  drip.className='me-drip';   body.appendChild(drip);
  }

  list.appendChild(li);

  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    li.classList.add('visible');
    // Intensité doublée pour les premiers messages
    spawnBlood(li, bloodColor, firstMsg?2:1);
  }));

  onRealMessageIn();
  trackChatBusy();

  // Vérif mention
  checkAndFlashMention(data.text||'');

  // Flash premier message
  if(firstMsg) triggerFirstMsgFlash();

  // Purge max
  const max=parseInt(fd('msgMaxCount'))||7;
  const items=list.querySelectorAll('.chat-msg:not(.idle-msg)');
  if(items.length>max) removeMessage(items[0]);

  // Auto-expire
  const life=parseInt(fd('msgLifetime'))||0;
  if(life>0) setTimeout(()=>removeMessage(li), life*1000);
}

function removeMessage(el) {
  if(!el||el.classList.contains('leaving')) return;
  const exitType=fd('animOutType')||'fade';
  el.classList.add('leaving');
  if(exitType!=='fade') el.classList.add(`exit-${exitType}`);
  const dur=exitType==='dissolve'?850:(parseInt(fd('fadeOutDuration'))||550);
  setTimeout(()=>{
    try{el.remove();}catch(e){}
    if(!el.classList.contains('idle-msg')) onRealMessageOut();
  }, dur);
}

// ══════════════════════════════════════════════════════
// ── AMBIANCE ─────────────────────────────────────────
// ══════════════════════════════════════════════════════

function spawnHeaderDrips() {
  if(fd('showHeaderDrips')===false) return;
  const hdr=document.getElementById('frame-header'); if(!hdr) return;
  [18,32,52,70,84].forEach((pct,i)=>{
    if(Math.random()>.4) {
      const d=document.createElement('div'), h=randInt(10,36);
      d.style.cssText=`position:absolute;bottom:0;left:${pct}%;width:${rand(2,3.5)}px;border-radius:0 0 4px 4px;background:linear-gradient(to bottom,#8b0000,#cc1010,transparent);opacity:.85;`;
      d.animate([{height:'0px',opacity:'.9'},{height:h+'px',opacity:'.2'}],{duration:rand(1800,3500),delay:rand(100,1800)+i*250,fill:'forwards',easing:'ease-out'});
      hdr.appendChild(d);
    }
  });
}

function animateCornerDrips() {
  ['cdrip-tl','cdrip-tr'].forEach((id,i)=>{
    const el=document.getElementById(id); if(!el) return;
    el.style.opacity='.88';
    el.animate([{height:'0px'},{height:randInt(18,45)+'px'}],{duration:rand(2000,4000),delay:rand(500,2000)+i*600,fill:'forwards',easing:'ease-out'});
  });
}

function spawnEmber() {
  if(fd('showEmbers')===false) return;
  const c=document.getElementById('embers'); if(!c) return;
  const e=document.createElement('div'); e.className='ember';
  const sz=rand(2,5.5),dur=rand(2,5.5);
  e.style.cssText=`left:${rand(4,96)}%;bottom:${rand(0,22)}px;width:${sz}px;height:${sz}px;animation-duration:${dur}s;animation-delay:${rand(0,1)}s;`;
  c.appendChild(e); e.addEventListener('animationend',()=>{try{e.remove();}catch(x){}});
}

// Flamèches latérales montantes
function spawnSideFlame() {
  if(fd('showSideFlames')===false) return;
  const sides=[document.getElementById('side-flames-l'),document.getElementById('side-flames-r')];
  sides.forEach(c=>{
    if(!c||Math.random()>.45) return;
    const el=document.createElement('div'); el.className='side-flame-p';
    const h=rand(14,38), dur=rand(0.6,1.5), bot=rand(0,65);
    const r=randInt(50,110), g=randInt(0,80);
    el.style.cssText=`height:${h}px;bottom:${bot}%;background:linear-gradient(to top,rgba(255,${g},0,.85),rgba(255,${r+80},0,.4),transparent);animation-duration:${dur}s;`;
    c.appendChild(el); el.addEventListener('animationend',()=>{try{el.remove();}catch(x){}});
  });
}

// ══════════════════════════════════════════════════════
// ── SE LISTENERS ──────────────────────────────────────
// ══════════════════════════════════════════════════════

window.addEventListener('onWidgetLoad', function(obj) {
  fieldData=(obj&&obj.detail&&obj.detail.fieldData)?obj.detail.fieldData:{};
  applyTheme();

  setInterval(spawnEmber, 170);
  setInterval(spawnSideFlame, 260);
  spawnEmber(); spawnEmber();
  spawnHeaderDrips(); animateCornerDrips();
  setInterval(()=>{ spawnHeaderDrips(); animateCornerDrips(); }, 14000);

  startIdleCycle();
});

window.addEventListener('onEventReceived', function(obj) {
  if(!obj||!obj.detail) return;
  const listener=obj.detail.listener, event=obj.detail.event;
  if(!event) return;

  if(listener==='message') {
    if(event.data) addMessage(event.data);
    return;
  }
  if(listener==='delete-message') {
    const t=list.querySelector(`[data-msgid="${event.msgId}"]`);
    if(t) removeMessage(t);
    return;
  }
  if(listener==='delete-messages') {
    const user=((event.userId||event.username||'')).toLowerCase();
    list.querySelectorAll('.chat-msg:not(.idle-msg)').forEach(el=>{
      if(el.dataset.user===user) removeMessage(el);
    });
  }
});
