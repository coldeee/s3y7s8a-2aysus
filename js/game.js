'use strict';
/* Тексты, цены и жители — в data/content.json. Ключи зданий не переименовывать. */
const BUILD_IDS=['homes','school','shop','lights','park'];
let CFG,B,IDS,RESIDENTS,TOP_NEWS,CITY_NAMES,LEARN,COPY,UI,EVENTS;
/* ================= УТИЛИТЫ ================= */
const $=id=>document.getElementById(id);
function pl(n,f){n=Math.abs(n)%100;const n1=n%10;if(n>10&&n<20)return f[2];if(n1>1&&n1<5)return f[1];if(n1===1)return f[0];return f[2]}
const mon=n=>`${n} ${pl(n,UI.coinForms)}`;
function fill(s,vars){return String(s==null?'':s).replace(/\{(\w+)\}/g,(m,k)=>vars&&vars[k]!=null?vars[k]:m)}
function gword(key,g){const a=UI[key];return g==='f'?a[0]:g==='m'?a[1]:a[2]}
const COIN='<i class="coin"></i>';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const verb=(g,f,m,p)=>g==='f'?f:g==='m'?m:p;
function shade(hex,f){const n=parseInt(hex.slice(1),16),c=[n>>16,n>>8&255,n&255].map(x=>Math.round(clamp(f<1?x*f:x+(255-x)*(f-1),0,255)));return '#'+c.map(x=>x.toString(16).padStart(2,'0')).join('')}

/* ================= ЗВУК ================= */
let sfxOn=true,musicOn=true,actx=null,sessionBest=0;
const MUSIC_SRC='audio/cidade-brilhante.mp3',MUSIC_VOL=.42;
let musicEl=null,musicFade=0;
function track(){if(musicEl)return musicEl;const a=new Audio(MUSIC_SRC);a.loop=true;a.preload='none';a.volume=0;a.addEventListener('ended',()=>{if(!musicOn)return;a.currentTime=0;const p=a.play();if(p&&p.catch)p.catch(()=>{})});musicEl=a;return a}
function fadeMusic(to,ms){const a=musicEl;if(!a)return;cancelAnimationFrame(musicFade);if(Math.abs(a.volume-to)<.02){a.volume=to;if(to===0)a.pause();return}const from=a.volume,t0=performance.now();const step=now=>{const k=ms<=0?1:Math.min(1,(now-t0)/ms);a.volume=from+(to-from)*k;if(k<1)musicFade=requestAnimationFrame(step);else if(to===0){a.pause();a.volume=0}};musicFade=requestAnimationFrame(step)}
function startMusic(){if(!musicOn)return;const a=track();const p=a.play();if(p&&p.catch)p.catch(()=>{});fadeMusic(MUSIC_VOL,a.volume>.2?220:800)}
function stopMusic(){if(!musicEl)return;if(musicEl.paused){musicEl.volume=0;return}fadeMusic(0,320)}
function musicLive(){return !!(musicEl&&!musicEl.paused)}
function primeAudio(manual){try{ensureCtx();if(!manual&&musicOn)startMusic()}catch(e){}}
function ensureCtx(){actx=actx||new(window.AudioContext||window.webkitAudioContext)();if(actx.state==='suspended')actx.resume();return actx}
function beep(f,d,type){if(!sfxOn)return;try{const ctx=ensureCtx(),o=ctx.createOscillator(),g=ctx.createGain();o.type=type||'sine';o.frequency.value=f;g.gain.setValueAtTime(.07,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+d);o.connect(g);g.connect(ctx.destination);o.start();o.stop(ctx.currentTime+d)}catch(e){}}
const sfx={coin(){beep(880,.07);setTimeout(()=>beep(1320,.09),70)},pop(){beep(520,.1,'triangle')},bad(){beep(196,.2,'triangle')},win(){[523,659,784,1046].forEach((f,i)=>setTimeout(()=>beep(f,.12),i*110))}};

const SND_ON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>';
const SND_OFF='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M17 9l5 6M22 9l-5 6"/></svg>';
const NOTE_ON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3" fill="currentColor" stroke="none"/><circle cx="17" cy="16" r="3" fill="currentColor" stroke="none"/></svg>';
const NOTE_OFF='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/><path d="M4 4l16 16"/></svg>';
function soundIcons(){
  document.querySelectorAll('[data-sfx]').forEach(b=>{b.innerHTML=sfxOn?SND_ON:SND_OFF;b.setAttribute('aria-pressed',sfxOn?'true':'false')});
  document.querySelectorAll('[data-music]').forEach(b=>{b.innerHTML=musicOn?NOTE_ON:NOTE_OFF;b.setAttribute('aria-pressed',musicOn?'true':'false')});
}

/* ================= МАЛЕНЬКИЕ ИКОНКИ ================= */
function smile(h){
  const m=h>=70?0:h>=40?1:2,g=[['#fff6b0','#ffd23f','#f29a12'],['#efe4ff','#c4a2ff','#8a5cf0'],['#d9ecff','#8fc0ff','#4f7dff']][m];
  const eyes=m===0?'<path d="M7.6 10.6q1.6-1.8 3.2 0M13.2 10.6q1.6-1.8 3.2 0" stroke="#4a1d00" stroke-width="1.6" fill="none" stroke-linecap="round"/>'
    :`<ellipse cx="9.2" cy="10.4" rx="1.4" ry="${m===2?1.5:1.8}" fill="#2a1060"/><ellipse cx="14.8" cy="10.4" rx="1.4" ry="${m===2?1.5:1.8}" fill="#2a1060"/><circle cx="9.7" cy="9.8" r=".5" fill="#fff"/><circle cx="15.3" cy="9.8" r=".5" fill="#fff"/>`;
  const mouth=m===0?'<path d="M8 13.6q4 4.6 8 0z" fill="#8a1f2b"/><path d="M9.6 15.4q2.4 1.4 4.8 0" stroke="#ff7d8f" stroke-width="1.2" fill="none" stroke-linecap="round"/>'
    :m===1?'<path d="M9.4 15.2q2.6 1 5.2-.4" stroke="#2a1060" stroke-width="1.5" fill="none" stroke-linecap="round"/>'
    :'<path d="M9 16.2q3-2.4 6 0" stroke="#2a1060" stroke-width="1.5" fill="none" stroke-linecap="round"/><path d="M16.6 11.8q.9 1.6 0 2.4q-.9-.8 0-2.4z" fill="#bfe4ff"/>';
  return `<svg class="ico" viewBox="0 0 24 24"><defs><radialGradient id="sm${m}" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="${g[0]}"/><stop offset=".55" stop-color="${g[1]}"/><stop offset="1" stop-color="${g[2]}"/></radialGradient></defs><circle cx="12" cy="12.6" r="10.6" fill="${g[2]}" opacity=".5"/><circle cx="12" cy="12" r="10.6" fill="url(#sm${m})"/><ellipse cx="8.2" cy="6.4" rx="3.4" ry="1.8" fill="#fff" opacity=".7" transform="rotate(-25 8.2 6.4)"/>${m<2?'<ellipse cx="6.6" cy="13.6" rx="1.7" ry="1.1" fill="#ff7d9a" opacity=".55"/><ellipse cx="17.4" cy="13.6" rx="1.7" ry="1.1" fill="#ff7d9a" opacity=".55"/>':''}${eyes}${mouth}</svg>`}
const PEOPLE='<svg class="ico" viewBox="0 0 24 24" fill="#3c8f6a"><circle cx="8" cy="8" r="3.5"/><circle cx="16.5" cy="9" r="3"/><path d="M2 20c0-4 3-6.5 6-6.5s6 2.5 6 6.5z"/><path d="M13 20c.3-3 2-5 3.5-5s4.5 1.6 4.5 5z"/></svg>';
const HEART='<svg class="ico" viewBox="0 0 24 24"><path d="M12 21s-8-5.2-8-11a4.6 4.6 0 0 1 8-3 4.6 4.6 0 0 1 8 3c0 5.8-8 11-8 11z" fill="#e8574a"/></svg>';
function face(r,size,mood){
  const s=size||54,m=mood||'ok';
  const brows=m==='happy'?'<path d="M21 26.5q4-3 7 0M32 26.5q4-3 7 0" stroke="#5a3a2a" stroke-width="1.6" fill="none" stroke-linecap="round"/>'
    :m==='sad'?'<path d="M21 26q4-1 7 1.6M32 27.6q3-2.6 7-1.6" stroke="#5a3a2a" stroke-width="1.8" fill="none" stroke-linecap="round"/>':'';
  const eyes=m==='happy'?'<path d="M22.5 32q2.5-3 5 0M32.5 32q2.5-3 5 0" stroke="#2a2a2a" stroke-width="1.8" fill="none" stroke-linecap="round"/>'
    :'<circle cx="25" cy="32" r="2" fill="#2a2a2a"/><circle cx="35" cy="32" r="2" fill="#2a2a2a"/><circle cx="25.6" cy="31.4" r=".6" fill="#fff"/><circle cx="35.6" cy="31.4" r=".6" fill="#fff"/>';
  const mouth=m==='happy'?'<path d="M24 37q6 7 12 0z" fill="#8a2f2f"/><path d="M26.5 39.6q3.5 1.8 7 0" stroke="#ff8f8f" stroke-width="1.2" fill="none"/>'
    :m==='sad'?'<path d="M25.5 41q4.5-4 9 0" stroke="#7a3a2e" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M39 31q1.3 2.4 0 3.4q-1.3-1 0-3.4z" fill="#9fd4ff"/>'
    :'<path d="M25 38 Q30 42 35 38" stroke="#b5574a" stroke-width="2" fill="none" stroke-linecap="round"/>';
  const bg=m==='happy'?'#fff0b8':m==='sad'?'#dfe6f2':'#ffe7c7';
  return `<svg class="face" viewBox="0 0 60 60" width="${s}" height="${s}" xmlns="http://www.w3.org/2000/svg"><circle cx="30" cy="30" r="29" fill="${bg}"/>
  ${r.long?`<path d="M12 34 Q10 12 30 11 Q50 12 48 34 L48 46 L12 46Z" fill="${r.hair}"/>`:''}
  <circle cx="30" cy="32" r="15" fill="${r.skin}"/>
  <path d="M15 30 Q16 15 30 15 Q44 15 45 30 Q38 22 30 23 Q21 22 15 30Z" fill="${r.hair}"/>
  ${r.beard?`<path d="M17 34 Q18 48 30 48 Q42 48 43 34 Q38 42 30 41 Q22 42 17 34Z" fill="${r.hair}"/>`:''}
  ${brows}${eyes}${mouth}${m!=='sad'?'<circle cx="21" cy="37" r="2.5" fill="#ff8f8f" opacity=".45"/><circle cx="39" cy="37" r="2.5" fill="#ff8f8f" opacity=".45"/>':''}</svg>`}
function bIcon(id){
  const st='stroke="#2c5446" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"';
  if(id==='shop')return `<path d="M-10 -7h3.5l2.5 10h11l2.5-7.5H-5.5" ${st}/><circle cx="-2" cy="7" r="2" fill="#2c5446"/><circle cx="6" cy="7" r="2" fill="#2c5446"/>`;
  if(id==='homes')return `<path d="M-10 0 L0 -9 L10 0" ${st}/><path d="M-7 -2 V8 H7 V-2" ${st}/><rect x="-2" y="2" width="4" height="6" fill="#2c5446"/>`;
  if(id==='school')return `<polygon points="-11,-3 0,-9 11,-3 0,3" fill="#2c5446"/><path d="M-6 0 V5 Q0 9 6 5 V0" ${st}/><path d="M9 -2 V5" ${st}/>`;
  if(id==='park')return `<circle cx="0" cy="-3" r="7.5" fill="#3fae67"/><circle cx="-3" cy="-6" r="3.5" fill="#7ad08a"/><path d="M0 3 V10" stroke="#7a5a3c" stroke-width="3" stroke-linecap="round"/>`;
  return `<path d="M0 10 V-1" stroke="#2c5446" stroke-width="2.4" stroke-linecap="round"/><circle cx="0" cy="-5" r="5" fill="#ffd34d" stroke="#2c5446" stroke-width="2"/>`;
}
const iconSVG=(id,bg)=>`<svg viewBox="-16 -16 32 32">${bg?`<rect x="-16" y="-16" width="32" height="32" rx="8" fill="${bg}"/>`:''}${bIcon(id)}</svg>`;

/* ================= ИЗОМЕТРИЯ ================= */
const TW=50,TH=25,OX=200,OY=262;
const P=(i,j)=>[OX+(i-j)*TW/2,OY+(i+j)*TH/2];
const up=(p,h)=>[p[0],p[1]-h];
const lerp=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
const pts=a=>a.map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ');
const poly=(a,fill,extra)=>`<polygon points="${pts(a)}" fill="${fill}" ${extra||''}/>`;
const ST='stroke="#5b6b67" stroke-width="1.1" stroke-linejoin="round"';
const tile=(i,j,w,d,fill,extra)=>poly([P(i,j),P(i+w,j),P(i+w,j+d),P(i,j+d)],fill,extra);
function box(i,j,w,d,h,c){
  const A=P(i,j),Bp=P(i+w,j),C=P(i+w,j+d),D=P(i,j+d);
  return poly([D,C,up(C,h),up(D,h)],c.left,ST)+poly([C,Bp,up(Bp,h),up(C,h)],c.right,ST)+poly([up(A,h),up(Bp,h),up(C,h),up(D,h)],c.top,ST);
}
function roof(i,j,w,d,h,rh,col){
  const A=up(P(i,j),h),Bp=up(P(i+w,j),h),C=up(P(i+w,j+d),h),D=up(P(i,j+d),h),T=up(P(i+w/2,j+d/2),h+rh);
  return poly([A,Bp,T],shade(col,1.1),ST)+poly([A,D,T],shade(col,1.1),ST)+poly([D,C,T],col,ST)+poly([C,Bp,T],shade(col,.78),ST);
}
function fq(a,b,u0,u1,h0,h1,fill){const p0=lerp(a,b,u0),p1=lerp(a,b,u1);return poly([up(p0,h0),up(p1,h0),up(p1,h1),up(p0,h1)],fill)}
function windows(i,j,w,d,h,floors,fill,skipDoor){
  const Bp=P(i+w,j),C=P(i+w,j+d),D=P(i,j+d),fh=h/floors;let s='';
  for(let f=0;f<floors;f++){const h0=f*fh+fh*.32,h1=f*fh+fh*.72;
    const nL=Math.max(1,Math.round(w*2.2)),nR=Math.max(1,Math.round(d*2.2));
    for(let k=0;k<nL;k++){if(skipDoor&&f===0&&Math.abs((k+.5)/nL-.5)<.2)continue;s+=fq(D,C,(k+.25)/nL,(k+.75)/nL,h0,h1,fill)}
    for(let k=0;k<nR;k++)s+=fq(C,Bp,(k+.25)/nR,(k+.75)/nR,h0,h1,shade(fill,.9))}
  return s;
}
const walls=c=>({left:c,right:shade(c,.8),top:shade(c,1.15)});
function tree(i,j,s,dark){const [x,y]=P(i,j);s=s||1;
  return `<ellipse cx="${x}" cy="${y}" rx="${10*s}" ry="${4.5*s}" fill="#24563c" opacity=".22"/><rect x="${x-2.2*s}" y="${y-13*s}" width="${4.4*s}" height="${13*s}" rx="2" fill="#7a5a3c"/><circle cx="${x}" cy="${y-21*s}" r="${11.5*s}" fill="${dark?'#2f9a5c':'#3fae67'}"/><circle cx="${x-4*s}" cy="${y-25*s}" r="${6*s}" fill="#74cf80"/>`}
function lamp(i,j,L){const [x,y]=P(i,j),lit=L>0,r=6+L*4.5,op=(.22+.11*L).toFixed(2),head=L>=3?'#fff3a6':L?'#ffe066':'#9aa7a5';
  let s=lit?`<ellipse cx="${x}" cy="${y+2}" rx="${8+L*6}" ry="${4+L*3}" fill="#fff1a0" opacity="${op}"/><circle cx="${x}" cy="${y-31}" r="${r}" fill="#fff3a0" opacity="${op}"/><circle cx="${x}" cy="${y-31}" r="${r*.55}" fill="#fff8cf" opacity="${op}"/>`:'';
  s+=`<rect x="${x-1.5}" y="${y-30}" width="3" height="31" fill="#4d5a5a"/>`;
  if(L>=2)s+=`<path d="M${x} ${y-26} h-8 M${x} ${y-26} h8" stroke="#4d5a5a" stroke-width="2"/><rect x="${x-12}" y="${y-30}" width="7" height="6" rx="2" fill="${head}"/><rect x="${x+5}" y="${y-30}" width="7" height="6" rx="2" fill="${head}"/>`;
  return s+`<rect x="${x-5}" y="${y-36}" width="10" height="7" rx="2" fill="${head}" stroke="#4d5a5a" stroke-width="1"/>`}

/* ---- здания по уровням ---- */
function house(i,j,w,d,h,wc,rc){let s=box(i,j,w,d,h,walls(wc));s+=windows(i,j,w,d,h,1,'#fff3b8',true);s+=fq(P(i,j+d),P(i+w,j+d),.4,.6,0,h*.6,'#9a6447');return s+roof(i,j,w,d,h,17,rc)}
function homesParts(L){
  const H=[[1.12,1.12,.78,.78,22,'#ffe1b0','#e8735a'],[2.1,1.12,.78,.78,24,'#d9ecf9','#c75b4e'],[1.12,2.1,.78,.78,24,'#f9d0c0','#e0894b']];
  const out=[];
  for(let k=0;k<Math.min(L+1,3);k++){const h=H[k];out.push({d:h[0]+h[1]+.8,s:house(...h)})}
  if(L>=3){let s=box(2.05,2.05,.85,.85,60,walls('#f3e6d3'));s+=windows(2.05,2.05,.85,.85,60,4,'#fff3b8');s+=box(2.12,2.12,.71,.71,0.1,walls('#c9b8a2'));out.push({d:4.9,s})}
  return out;
}
function shopFront(i,j,w,d,h,wc,aw,tall){
  let s=box(i,j,w,d,h,walls(wc));const D=P(i,j+d),C=P(i+w,j+d),Bp=P(i+w,j);
  s+=fq(D,C,.1,.9,2,13,'#9fd6e6');s+=fq(D,C,.44,.56,0,13,'#6c4b3a');
  const n=7;for(let k=0;k<n;k++)s+=fq(D,C,k/n,(k+1)/n,14,21,k%2?'#fff':aw);
  s+=fq(C,Bp,.15,.85,14,21,shade(aw,.85));s+=fq(C,Bp,.25,.75,3,12,'#8cc6d6');
  if(tall)for(let k=0;k<4;k++)s+=fq(D,C,(k+.25)/4,(k+.75)/4,26,h-6,'#fff3b8');
  return s;
}
function shopParts(L){
  const out=[];
  out.push({d:1.1+6.1+1.2,s:shopFront(1.1,6.1,1.8,.8,L>=2?40:24,'#f9e2b8','#ef5b4f',L>=2)});
  if(L>=1)out.push({d:1.1+7.15+1.2,s:shopFront(1.1,7.15,1.8,.75,24,'#e7f2d9','#3d8fd1',false)});
  if(L>=3){const h=40,D=P(1.1,6.9),C=P(2.9,6.9);let s=`<line x1="${lerp(D,C,.3)[0]}" y1="${lerp(D,C,.3)[1]-h}" x2="${lerp(D,C,.3)[0]}" y2="${lerp(D,C,.3)[1]-h-10}" stroke="#555" stroke-width="2"/><line x1="${lerp(D,C,.7)[0]}" y1="${lerp(D,C,.7)[1]-h}" x2="${lerp(D,C,.7)[0]}" y2="${lerp(D,C,.7)[1]-h-10}" stroke="#555" stroke-width="2"/>`;
    s+=fq(D,C,.15,.85,h+9,h+24,'#ffd34d');const m=up(lerp(D,C,.5),h+16.5);s+=`<circle cx="${m[0]}" cy="${m[1]}" r="5" fill="#f6c33a" stroke="#a8740c" stroke-width="1.5"/>`;
    out.push({d:8.6,s})}
  return out;
}
function schoolGround(L){let s=tile(6,1,2,2,'#cfe6bd');if(L>=1){s+=tile(6.1,2.3,1.8,.6,'#6fc46a')+`<polygon points="${pts([P(6.2,2.38),P(7.8,2.38),P(7.8,2.82),P(6.2,2.82)])}" fill="none" stroke="#fff" stroke-width="1.5"/>`}return s}
function schoolParts(L){
  const i=6.1,j=1.15,w=1.8,d=.95,h=30+13*L;
  let s=box(i,j,w,d,h,{left:'#d6e8f8',right:'#b6cee6',top:'#eef6ff'});
  s+=windows(i,j,w,d,h,2+L,'#fff6c8',true);s+=fq(P(i,j+d),P(i+w,j+d),.43,.57,0,15,'#5f86b0');
  s+=box(i+.05,j+.05,w-.1,d-.1,0,{left:'#9fbfe0',right:'#8aaed2',top:'#9fbfe0'}).replace(/points="/g,'points="');
  if(L>=2){const t=up(P(i+.15,j+.2),h);s+=`<line x1="${t[0]}" y1="${t[1]}" x2="${t[0]}" y2="${t[1]-30}" stroke="#666" stroke-width="2"/><polygon points="${t[0]},${t[1]-30} ${t[0]+15},${t[1]-25} ${t[0]},${t[1]-20}" fill="#e8574a"/>`}
  return [{d:i+w/2+j+d/2,s}];
}
function parkGround(L){
  let s=tile(6,6,2,2,L>=3?'#86d474':'#8fd57d')+tile(6.12,6.12,1.76,1.76,L>=3?'#9fe486':'#a6e392')+tile(6.9,6,.2,2,'#efe3c4')+tile(6,6.9,2,.2,'#efe3c4');
  if(L>=1){const [x,y]=P(7,7);s+=`<ellipse cx="${x}" cy="${y}" rx="30" ry="15" fill="#efe3c4"/>`}
  if(L>=3){[[6.35,6.95,'#ff8fb3'],[7.05,6.35,'#ffd34d'],[7.65,7.05,'#c79bff'],[6.95,7.65,'#ff9a5a']].forEach(([i,j,c])=>{const [x,y]=P(i,j);s+=`<ellipse cx="${x}" cy="${y}" rx="11" ry="5.5" fill="#5fae55"/><circle cx="${x-5}" cy="${y-1}" r="2.4" fill="${c}"/><circle cx="${x+3}" cy="${y-2}" r="2.4" fill="${c}"/><circle cx="${x}" cy="${y+2}" r="2.4" fill="${c}"/><circle cx="${x+6}" cy="${y+1}" r="2.4" fill="${c}"/>`})}
  return s;
}
const PARK_TREES=[[[6.45,6.45,.85],[7.6,7.6,.85,1]],[[6.75,6.22,.7,1]],[[6.28,7.55,.8],[6.62,7.85,.65,1]],[[7.85,7.3,.72,1],[7.3,7.85,.68],[7.85,6.75,.66]]];
function parkParts(L){
  const out=[];
  for(let k=0;k<=L;k++)PARK_TREES[k].forEach(([i,j,sz,dk])=>out.push({d:i+j,s:tree(i,j,sz,dk)}));
  if(L>=1){const [x,y]=P(7,7),big=L>=3;out.push({d:14,s:`<ellipse cx="${x}" cy="${y}" rx="${big?24:20}" ry="${big?12:10}" fill="#e9e3d2" stroke="#b9b09a"/><ellipse cx="${x}" cy="${y-1.5}" rx="${big?18:15}" ry="${big?9:7.5}" fill="#6fc9e6"/><rect x="${x-2.5}" y="${y-18}" width="5" height="16" fill="#d7d2c2"/><path d="M${x} ${y-18} q-9 -11 -14 3 M${x} ${y-18} q9 -11 14 3 M${x} ${y-18} v-9${big?` M${x} ${y-18} q-5 -16 -20 1 M${x} ${y-18} q5 -16 20 1`:''}" stroke="#c7eefa" stroke-width="2.6" fill="none" stroke-linecap="round"/>`})}
  if(L>=2){let s=box(7.35,6.25,.32,.32,16,walls('#ef6a5b'))+roof(7.35,6.25,.32,.32,16,9,'#ffd34d');const a=up(P(7.67,6.57),14),b=P(8,6.95);s+=`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="#3d8fd1" stroke-width="5" stroke-linecap="round"/>`;out.push({d:13.6,s})}
  if(L>=3){[[6.55,7.25],[7.25,6.55]].forEach(([i,j])=>{const [x,y]=P(i,j);out.push({d:i+j,s:`<rect x="${x-9}" y="${y-6}" width="18" height="4" rx="1.5" fill="#a0704a"/><rect x="${x-9}" y="${y-11}" width="18" height="3" rx="1.5" fill="#b8835a"/><path d="M${x-7} ${y-2} v4 M${x+7} ${y-2} v4" stroke="#5b4636" stroke-width="2"/>`})})}
  return out;
}
const LAMP_POS=[[3.85,7.0],[3.85,5.75],[2.3,5.15],[3.85,3.25],[2.3,3.85],[5.15,3.25],[6.7,3.85],[3.85,8.4]];
function lightsParts(L){const n=[1,3,5,8][L],out=[];for(let k=0;k<n;k++){const [i,j]=LAMP_POS[k];out.push({d:i+j,s:lamp(i,j,L)})}
  if(L>=3){const a=P(3.85,5.75),b=P(3.85,7.0);let g=`<path d="M${a[0]} ${a[1]-28} Q${(a[0]+b[0])/2} ${(a[1]+b[1])/2-16} ${b[0]} ${b[1]-28}" stroke="#4d5a5a" stroke-width="1" fill="none"/>`;
    for(let t=1;t<6;t++){const q=t/6,x=a[0]+(b[0]-a[0])*q,y=a[1]-28+(b[1]-a[1])*q+Math.sin(q*Math.PI)*6;g+=`<circle cx="${x}" cy="${y}" r="2.6" fill="${['#ff8fb3','#ffd34d','#7fd3ff'][t%3]}"/>`}
    out.push({d:10.9,s:g})}
  return out}

/* ---- сцена ---- */
function hash(i,j,k){const x=Math.sin(i*12.9898+j*78.233+k*37.719)*43758.5453;return x-Math.floor(x)}
function inLot(i,j){const L=[[.4,3.6,.4,3.6],[5.4,8.6,.4,3.6],[.4,3.6,5.4,8.6],[5.4,8.6,5.4,8.6]];return L.some(([a,b,c,d])=>i>a&&i<b&&j>c&&j<d)}
let TREES=null;
function decoTrees(){if(TREES)return TREES;TREES=[];
  for(let i=-12;i<=22;i++)for(let j=-12;j<=22;j++){
    const ii=i+hash(i,j,1)*.6,jj=j+hash(i,j,2)*.6;
    if(hash(i,j,3)>.3)continue;
    if(Math.abs(ii-4.5)<1.05||Math.abs(jj-4.5)<1.05||inLot(ii,jj))continue;
    const [x,y]=P(ii,jj);if(x<-25||x>425||y<40||y>800||(y>535&&y<705))continue;
    if(LAMP_POS.some(([a,b])=>Math.abs(a-ii)<.5&&Math.abs(b-jj)<.5))continue;
    TREES.push({d:ii+jj,s:tree(ii,jj,.75+hash(i,j,4)*.45,hash(i,j,5)>.5)});
  }
  return TREES;
}
function road(axis){
  const a=axis==='i'?[P(3.85,-9),P(5.15,-9),P(5.15,18),P(3.85,18)]:[P(-9,3.85),P(18,3.85),P(18,5.15),P(-9,5.15)];
  const b=axis==='i'?[P(4,-9),P(5,-9),P(5,18),P(4,18)]:[P(-9,4),P(18,4),P(18,5),P(-9,5)];
  const m=axis==='i'?[P(4.5,-9),P(4.5,18)]:[P(-9,4.5),P(18,4.5)];
  return poly(a,'#eadfc4')+poly(b,'#a9b2ad')+`<line x1="${m[0][0]}" y1="${m[0][1]}" x2="${m[1][0]}" y2="${m[1][1]}" stroke="#f6edd2" stroke-width="2" stroke-dasharray="10 12"/>`;
}
const ANCHOR={homes:()=>[P(2,2),S.lvl.homes>=3?92:62],school:()=>[P(7,1.6),48+13*S.lvl.school+(S.lvl.school>=2?14:0)],shop:()=>[P(2,7),S.lvl.shop>=3?86:S.lvl.shop>=2?66:50],lights:()=>[P(3.85,7.0),54],park:()=>[P(7,7),68]};
function citySVG(o){
  const L=S.lvl,anim=S.anim;
  let s=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${o.vb}" preserveAspectRatio="xMidYMid ${o.slice?'slice':'meet'}">`;
  s+='<defs><linearGradient id="gr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b6e6a0"/><stop offset="1" stroke-color="#8fd08a" stop-color="#8acb84"/></linearGradient></defs>';
  s+='<rect x="-60" y="-120" width="520" height="1000" fill="url(#gr)"/>';
  for(let i=-3;i<=11;i++)for(let j=-3;j<=11;j++)if((i+j)%2===0)s+=tile(i,j,1,1,'#ffffff',' opacity=".07"');
  s+=road('i')+road('j')+tile(3.85,3.85,1.3,1.3,'#d9d0bb');
  s+='<path d="M-20 585 Q90 545 200 583 T420 573 L420 680 Q300 660 200 690 T-20 680Z" fill="#58bfe4"/><path d="M-20 585 Q90 545 200 583 T420 573" stroke="#eadfc4" stroke-width="7" fill="none"/><path d="M40 615 q20 -6 40 0 M240 625 q20 -6 40 0 M150 650 q20 -6 40 0" stroke="#bfe9f6" stroke-width="3" fill="none" stroke-linecap="round"/>';
  s+='<g transform="translate(300 632)"><path d="M-22 0 L22 0 L16 9 L-16 9Z" fill="#fff"/><rect x="-8" y="-9" width="14" height="9" fill="#ef6a5b"/></g>';
  const G={homes:tile(1,1,2,2,'#cfe6bd'),school:schoolGround(L.school),shop:tile(1,6,2,2,'#e9dcc3'),park:parkGround(L.park),lights:''};
  const g=(id,inner)=>o.markers?`<g data-act="b" data-v="${id}"${anim===id?' class="grow"':''}>${inner}</g>`:inner;
  IDS.forEach(id=>{if(G[id])s+=g(id,G[id])});
  const objs=decoTrees().slice();
  const parts={homes:homesParts(L.homes),school:schoolParts(L.school),shop:shopParts(L.shop),park:parkParts(L.park),lights:lightsParts(L.lights)};
  IDS.forEach(id=>parts[id].forEach(p=>objs.push({d:p.d,s:g(id,p.s)})));
  objs.sort((a,b)=>a.d-b.d).forEach(p=>s+=p.s);
  if(o.markers){
    const target=today().target;
    IDS.forEach(id=>{const [p,h]=ANCHOR[id](),x=p[0],y=p[1]-h,req=false;
      s+=`<g class="mk" data-act="b" data-v="${id}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})">
      ${req?'<circle r="21" fill="none" stroke="#ffcf3a" stroke-width="4" class="pulse"/>':''}
      <path d="M-6 15 L0 23 L6 15Z" fill="${req?'#ffcf3a':'#fff'}"/>
      <circle r="18" fill="#fff" stroke="${req?'#ffcf3a':'#fff'}" stroke-width="3.5"/>${bIcon(id)}
      <g transform="translate(13 -13)"><circle r="8.5" fill="${req?'#f2a91f':'#7b4cf0'}" stroke="#fff" stroke-width="2"/><text y="4" text-anchor="middle" font-size="11" font-weight="900" fill="#fff" font-family="Nunito, system-ui, sans-serif">${S.lvl[id]+1}</text></g></g>`});
  }
  return s+'</svg>';
}

/* ================= КАРТА НА КАРТИНКЕ ================= */
const MAP_IMG='img/start.webp';let MAP_OK=true,MAP_RATIO=471/836,mapBuilt=false;
/* координаты в процентах картинки: место иконки и контур здания для подсветки */
const SPOTS={
  homes: {pin:[21.5,34.5],poly:'13.5,37 22,32.5 30.5,36 30.5,41.8 22,44.8 13.5,41.8',c:['#ffb23d','#ff5a14']},
  school:{pin:[58,39], poly:'49.5,41 58,36.2 67.5,40.5 67.5,48.2 58,51.8 49.5,48.2',c:['#4fc3ff','#1c58ff']},
  shop:  {pin:[85,55.5], poly:'76,58.5 86,54.2 97,57.5 97,64.8 86,67.8 76,63.8',c:['#ff72bd','#e0145f']},
  park:  {pin:[37.5,64.5],poly:'28,66.5 38,62 50,65.3 48.5,70.8 36,73.2 28,70.2',c:['#6fe640','#0fa63e']},
  lights:{pin:[53,58.5],poly:'44,61 52,57.4 62.5,58.4 62.5,61.6 52,64.6 44,63.6',c:['#c08cff','#6a2ae6']}
};
/* значки зданий: двухцветные, цвета берутся из --c1 (светлый) и --c2 (тёмный) пузыря */
function glyph(id){
  if(id==='shop')return `<path class="a" d="M4.4 11.6h15.2v7.7a1.4 1.4 0 0 1-1.4 1.4H5.8a1.4 1.4 0 0 1-1.4-1.4z"/><path class="b" d="M5.2 3.4h13.6a1 1 0 0 1 .96.72l1.9 6.2c.1.3.14.6.14.9a2.9 2.9 0 0 1-5.2 1.6 2.9 2.9 0 0 1-4.6 0 2.9 2.9 0 0 1-4.6 0A2.9 2.9 0 0 1 2.2 11.2c0-.3.04-.6.14-.9l1.9-6.2a1 1 0 0 1 .96-.7z"/><rect class="b" x="9.6" y="14.6" width="4.8" height="6.1" rx="1.1"/>`;
  if(id==='homes')return `<path class="a" d="M5.2 11.2 12 5.4l6.8 5.8v8.2a1.4 1.4 0 0 1-1.4 1.4H6.6a1.4 1.4 0 0 1-1.4-1.4z"/><path class="b" d="M11.1 2.9a1.4 1.4 0 0 1 1.8 0l8.6 7.4a1.1 1.1 0 0 1-1.4 1.7L12 4.8 3.9 12a1.1 1.1 0 0 1-1.4-1.7z"/><rect class="b" x="9.9" y="14.2" width="4.2" height="6.6" rx="1.3"/>`;
  if(id==='school')return `<path class="a" d="M5.8 12.1v4.6c0 1.7 2.8 3.4 6.2 3.4s6.2-1.7 6.2-3.4v-4.6L12 15.2z"/><path class="b" d="M11.2 3.6a1.7 1.7 0 0 1 1.6 0l9.4 4.9a.7.7 0 0 1 0 1.3l-9.4 4.9a1.7 1.7 0 0 1-1.6 0L1.8 9.8a.7.7 0 0 1 0-1.3z"/><rect class="b" x="20" y="10.4" width="1.7" height="5.6" rx=".85"/><path class="b" d="M18.9 20l1.95-4.6L22.8 20z"/>`;
  if(id==='park')return `<path class="a" d="M20.4 3.2C10.6 3 4 8 4 14.6A6.3 6.3 0 0 0 10.3 21C17 21 21 14.4 20.4 3.2z"/><path class="s" d="M3.6 21.2c1.8-5.6 5.4-9.6 10.2-12.4"/><path class="s" d="M9.6 15.4l4.4.4M12.2 12l4-.2"/>`;
  return `<rect class="b" x="11" y="9.6" width="2" height="10.4" rx="1"/><rect class="b" x="7.8" y="19" width="8.4" height="2.6" rx="1.3"/><path class="a" d="M7.9 4.6h8.2l1.9 5.8H6z"/><path class="b" d="M7.2 1.8h9.6a1.2 1.2 0 0 1 .5 2.3l-.3.1H7l-.3-.1a1.2 1.2 0 0 1 .5-2.3z"/><circle class="w" cx="12" cy="7.8" r="1.5"/>`;
}
function balloonHTML(){return `<div class="balloon"><div class="bb"><svg viewBox="0 0 40 58" width="40" height="58" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="bl1" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffb3f6"/><stop offset=".5" stop-color="#b67bff"/><stop offset="1" stop-color="#6e4cf0"/></linearGradient></defs>
  <path d="M20 2C9 2 2 10 2 19c0 9 9 15 14 22h8c5-7 14-13 14-22C38 10 31 2 20 2z" fill="url(#bl1)"/>
  <path d="M20 2c-5 0-8 9-8 18 0 8 3 14 5 21h6c2-7 5-13 5-21 0-9-3-18-8-18z" fill="#ffe36b"/><path d="M20 2c-2 0-3 9-3 18 0 8 1 14 2 21h2c1-7 2-13 2-21 0-9-1-18-3-18z" fill="#fff6c8"/>
  <ellipse cx="11" cy="12" rx="3" ry="6" fill="#fff" opacity=".55" transform="rotate(20 11 12)"/>
  <path d="M16 41l1.5 7M24 41l-1.5 7" stroke="#6b4a2a" stroke-width="1"/><rect x="15.5" y="47.5" width="9" height="7" rx="1.5" fill="#b9793e"/><rect x="15.5" y="47.5" width="9" height="2" fill="#8a5428"/></svg></div></div>`}
function buildMap(){
  $('map').innerHTML=`<div id="mwrap"><img id="mimg" src="${MAP_IMG}" alt="" decoding="async"><svg id="fx" viewBox="0 0 100 100" preserveAspectRatio="none"></svg><div id="fly">${balloonHTML()}</div><div id="pins"></div></div>`;
  const im=$('mimg');
  im.onload=()=>{if(im.naturalWidth)MAP_RATIO=im.naturalWidth/im.naturalHeight;fitMap()};
  im.onerror=()=>{MAP_OK=false;mapBuilt=false;render()};
  mapBuilt=true;fitMap();
}
function fitMap(){
  const w=$('mwrap');if(!w)return;const W=$('map').clientWidth,H=$('map').clientHeight;
  let mw=W,mh=W/MAP_RATIO;if(mh<H){mh=H;mw=H*MAP_RATIO}
  Object.assign(w.style,{width:mw+'px',height:mh+'px',left:(W-mw)/2+'px',top:(H-mh)/2+'px'});
}
function onResize(){fitMap();fitScreens()}
window.addEventListener('resize',onResize);
if(window.visualViewport)visualViewport.addEventListener('resize',onResize);
function renderMap(){
  if(!MAP_OK){$('map').innerHTML=citySVG({vb:'0 -70 400 866',slice:true,markers:true});return}
  if(!mapBuilt||!$('mwrap'))buildMap();
  const f=S.focus;let fx=`<defs><linearGradient id="sheen" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".75"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>${IDS.map(id=>`<clipPath id="cp-${id}"><polygon points="${SPOTS[id].poly}"/></clipPath>`).join('')}</defs>`;
  IDS.forEach(id=>{const sp=SPOTS[id];
    if(id===f)fx+=`<polygon points="${sp.poly}" fill="${sp.c[0]}" class="hl" vector-effect="non-scaling-stroke" stroke="#fff" stroke-width="2.5"/><g clip-path="url(#cp-${id})"><rect class="sweep" x="-30" y="0" width="22" height="100" fill="url(#sheen)"/></g>`;
    fx+=`<polygon points="${sp.poly}" fill="#000" fill-opacity="0" data-act="b" data-v="${id}"/>`});
  $('fx').innerHTML=fx;
  let pins='';
  IDS.forEach((id,k)=>{const sp=SPOTS[id],lv=S.lvl[id];
    pins+=`<button class="pin${id===f?' on':''}${S.anim===id?' pop':''}" style="left:${sp.pin[0]}%;top:${sp.pin[1]}%;--c1:${sp.c[0]};--c2:${sp.c[1]};animation-delay:${k*.35}s" data-act="b" data-v="${id}" aria-label="${B[id].name}"><span class="ico3"><svg viewBox="0 0 24 24">${glyph(id)}</svg><span class="lv">${fill(UI.lvShort||'Ур. {n}',{n:lv+1})}</span></span></button>`;
    for(let k2=0;k2<lv;k2++){const a=k2*2.1+.6,cx=(sp.pin[0]+Math.cos(a)*5.5).toFixed(1),cy=(sp.pin[1]+7+Math.sin(a)*3).toFixed(1);pins+=`<i class="twk" style="left:${cx}%;top:${cy}%;animation-delay:${(k2*.5).toFixed(1)}s"></i>`}
    if(S.anim===id){const cy=sp.pin[1]+8;pins+=`<div class="burst" style="left:${sp.pin[0]}%;top:${cy}%">${Array.from({length:10},(_,j)=>{const a=j/10*Math.PI*2;return `<i style="--dx:${(Math.cos(a)*60).toFixed(0)}px;--dy:${(Math.sin(a)*46).toFixed(0)}px"></i>`}).join('')}</div>`}
  });
  $('pins').innerHTML=pins;
}
/* ================= СОСТОЯНИЕ ================= */
let S=null;
const today=()=>RESIDENTS[S.day-1];
function newGame(city){
  S={day:1,coins:CFG.startCoins,happy:CFG.startHappy,people:CFG.startPeople,lvl:{shop:0,homes:0,park:0,school:0,lights:0},
     city:city||CITY_NAMES[0],focus:null,log:[],news:[],spendBy:{shop:0,homes:0,park:0,school:0,lights:0},dec:CFG.decisions,reqDone:false,hearts:0,fest:0,anim:null,hist:[],
     st:{shopSpent:0,shopEarned:0,festSpent:0,festEarned:0,storm:null,missed:[],built:0,spent:0,deposit:0,debt:0,creditFee:0,events:{}}};
  $('start').classList.add('hidden');$('result').classList.add('hidden');
  morning();
}
function festBonus(){const ev=(EVENTS||[]).find(e=>e.id==='fest');return ev&&ev.bonus!=null?ev.bonus:(CFG.festBonus||0)}
function income(){return {tax:CFG.baseTax+Math.floor(S.people/CFG.perTax),shop:S.lvl.shop*B.shop.eff.income,fest:S.fest>0?festBonus():0,upkeep:IDS.reduce((a,id)=>a+S.lvl[id],0)}}
function dayMoney(){const inc=income();return {inc,inn:inc.tax+inc.shop+inc.fest,upkeep:inc.upkeep}}
function hideFlow(){const b=$('flowbox');if(b)b.classList.remove('show')}
function toggleFlow(){
  const box=$('flowbox');if(!S||!box)return;
  if(box.classList.contains('show')){hideFlow();return}
  const f=dayMoney(),rows=[[UI.flowTax,f.inc.tax],[UI.flowShop,f.inc.shop]];
  if(f.inc.fest)rows.push([UI.flowFest,f.inc.fest]);
  box.innerHTML=`<div class="ft">${UI.flowGet}</div>${rows.map(x=>`<div><span>${x[0]}</span><b class="in">+${x[1]}</b></div>`).join('')}<div class="ft">${UI.flowSpend}</div><div><span>${UI.flowKeep}</span><b class="out">−${f.upkeep}</b></div>`;
  box.classList.add('show');
}
function weight(key,fallback){const r=CFG.rating||{};return r[key]==null?fallback:r[key]}
function rating(){
  const happy=S.happy*weight('happy',1);
  const people=Math.floor(S.people/weight('peopleDiv',10))*weight('people',1);
  const hearts=S.hearts*weight('hearts',CFG.heartPoints);
  const coins=S.coins*weight('coins',1);
  const invest=S.st.shopEarned*weight('invest',1);
  const deposit=S.st.deposit*weight('deposit',1);
  const fee=S.st.creditFee*weight('creditFee',0);
  return {happy,people,hearts,coins,invest,deposit,fee,pts:Math.max(0,happy+people+hearts+coins+invest+deposit-fee)};
}

/* ================= ЭКРАН ГОРОДА ================= */
const SUN_ON='<svg class="sun on" viewBox="0 0 24 24" aria-hidden="true"><g stroke="#ff9d00" stroke-width="2.4" stroke-linecap="round"><path d="M12 1.6v2.8M12 19.6v2.8M1.6 12h2.8M19.6 12h2.8M4.6 4.6l2 2M17.4 17.4l2 2M19.4 4.6l-2 2M6.6 17.4l-2 2"/></g><circle cx="12" cy="12" r="5.8" fill="#ffd428" stroke="#f08a00" stroke-width="1.4"/><ellipse cx="10.2" cy="9.8" rx="2.2" ry="1.4" fill="#fff" opacity=".7" transform="rotate(-30 10.2 9.8)"/></svg>';
const SUN_OFF='<svg class="sun" viewBox="0 0 24 24" aria-hidden="true"><g stroke="#d5cfe6" stroke-width="2.4" stroke-linecap="round"><path d="M12 1.6v2.8M12 19.6v2.8M1.6 12h2.8M19.6 12h2.8M4.6 4.6l2 2M17.4 17.4l2 2M19.4 4.6l-2 2M6.6 17.4l-2 2"/></g><circle cx="12" cy="12" r="5.8" fill="#e6e1f2" stroke="#d5cfe6" stroke-width="1.4"/></svg>';
function sunsHTML(day){let h='';for(let i=1;i<=CFG.days;i++)h+=i<=day?SUN_ON:SUN_OFF;return h}
function render(){
  if(!S)return;
  renderMap();
  if(S.anim)setTimeout(()=>{if(S){S.anim=null}},900);
  $('dayPill').innerHTML=fill(UI.dayPill,{day:S.day,days:CFG.days});$('daySuns').innerHTML=sunsHTML(S.day);
  $('coins').textContent=S.coins;$('happy').textContent=S.happy+'%';$('smile').innerHTML=smile(S.happy);
  $('people').textContent=S.people;$('peopleIco').innerHTML=PEOPLE;
  $('flowBtn').setAttribute('aria-label',UI.flowLabel);
  const r=today();
  $('req').className='req'+(S.reqDone?' done':'');
  $('req').innerHTML=S.reqDone
    ?`${face(r,50)}<div><b>${r.name}</b><p>${fill(UI.thanksDone,{heart:HEART})}</p></div>`
    :`${face(r,50)}<div><b>${r.name}</b><p>${r.text}</p></div><span class="chev">›</span>`;
  const dots=Array.from({length:CFG.decisions},(_,k)=>`<i class="${k<S.dec?'':'off'}"></i>`).join('');
  $('decs').innerHTML=fill(UI.upgrades,{dots,have:S.dec,max:CFG.decisions});
  $('endBtn').textContent=S.day===CFG.days?UI.endLast:UI.endDay;
  fitSoon();
}
function effList(id){
  const e=B[id].eff;let h='';
  if(e.income)h+=`<span class="eff">+${e.income}${COIN} ${UI.perDay}</span>`;
  if(e.people)h+=`<span class="eff">${PEOPLE} +${e.people} ${UI.peoplePlus}</span>`;
  if(e.happy)h+=`<span class="eff">${smile(80)} +${e.happy} ${UI.happyPlus}</span>`;
  h+=`<span class="eff cost">${fill(UI.upkeep,{coin:COIN})}</span>`;
  return h;
}
function openB(id){
  hideFlow();
  const b=B[id],lv=S.lvl[id],max=lv>=b.cost.length,cost=max?0:b.cost[lv];
  const can=!max&&S.dec>0&&S.coins>=cost;
  const why=max?UI.alreadyMax:S.dec<=0?UI.noDecisions:S.coins<cost?UI.noCoins:'';
  const lvl=max?fill(UI.levelMax,{level:lv+1}):fill(UI.levelStep,{from:lv+1,to:lv+2});
  $('sheet').innerHTML=`<button class="x" data-act="closeSheet" aria-label="${UI.close}">✕</button><div class="stage">
  <div class="shead"><span class="ico3 big3" style="--c1:${SPOTS[id].c[0]};--c2:${SPOTS[id].c[1]}"><svg viewBox="0 0 24 24">${glyph(id)}</svg></span><div><h2>${b.name}</h2><div class="lvl">${lvl}</div></div></div>
  <p>${b.desc}</p>
  ${max?'':`<div class="effs">${effList(id)}</div>`}
  ${max?'':`<div class="nobox"><b>${UI.ifSkip}</b>${b.no}</div>`}
  <div class="sacts"><button class="btn primary" data-act="support" data-v="${id}" ${can?'':'disabled'}>${max?UI.btnMax:fill(UI.btnUpgrade,{cost,coin:COIN})}</button>${why&&!max?`<div class="lvl" style="text-align:center">${why}</div>`:''}<button class="btn secondary" data-act="closeSheet">${UI.notNow}</button><button class="btn ghost" data-act="askLeave">${UI.toMenu}</button></div></div>`;
  $('sheetShade').classList.add('show');sfx.pop();S.focus=id;renderMap();vibrate();fitSoon();
}
function closeSheet(){$('sheetShade').classList.remove('show');if(S&&S.focus){S.focus=null;renderMap()}}
function support(id){
  const b=B[id],lv=S.lvl[id];if(lv>=b.cost.length||S.dec<=0)return;const cost=b.cost[lv];if(S.coins<cost)return;
  S.coins-=cost;S.lvl[id]++;S.dec--;S.st.built++;S.st.spent+=cost;
  if(id==='shop')S.st.shopSpent+=cost;S.spendBy[id]+=cost;if(S.lvl[id]===3)S.news.push({w:3,t:TOP_NEWS[id]});
  if(b.eff.happy)S.happy+=b.eff.happy;if(b.eff.people)S.people+=b.eff.people;
  let msg=fill(UI.built,{name:b.name,level:lv+2});
  if(today().target===id&&!S.reqDone){S.reqDone=true;S.hearts++;S.news.push({w:2,t:today().hit});S.happy+=CFG.reqHappy;msg=fill(UI.gladHeart,{who:today().who,glad:gword('glad',today().g)});sfx.win()}else sfx.coin();
  S.happy=clamp(S.happy,0,100);S.anim=id;closeSheet();render();toast(msg);vibrate();
}

/* ================= ДЕНЬ ================= */
function morning(){
  S.dec=CFG.decisions;S.reqDone=false;render();
  const r=today();
  const intro=S.day===1?`<ul class="howto">${UI.tips.map(s=>`<li>${fill(s,{aim:LEARN.aim})}</li>`).join('')}</ul>`:'';
  const hello=S.day===1?UI.helloMayor:S.day===CFG.days?UI.lastDay:UI.goodMorning;
  const portrait=S.day===1?'':face(r,54);
  show(`<div class="kicker">${fill(UI.dayKicker,{city:esc(S.city).toUpperCase(),day:S.day,days:CFG.days})}</div><h2>${hello}</h2>${intro}
  <div class="quote">${portrait}<div><b>${r.name}</b><p>«${r.text}»</p></div></div><p class="lvl" style="margin:4px 0 0">${UI.findBuilding}</p><div class="actions"><button class="btn primary" data-act="startday">${UI.toCity}</button></div>`);
}
function evNum(ev,v){
  if(v==='-cost')return -(ev.cost||0);
  if(v==='cost')return ev.cost||0;
  if(v==='bonus')return ev.bonus||0;
  if(v==='span')return ev.span||0;
  if(v==='extra')return ev.extra||0;
  if(v==='back')return (ev.cost||0)+(ev.extra||0);
  if(v==='happyHit')return ev.happy||0;
  return v;
}
function eventVars(ev){return {cost:ev.cost||0,bonus:ev.bonus||0,span:ev.span||0,extra:ev.extra||0,back:(ev.cost||0)+(ev.extra||0),happy:ev.happy||0,coin:COIN}}
function todayEvent(){return (EVENTS||[]).find(e=>e.day===S.day&&!S.st.events[e.id])}
function openEvent(){
  const ev=todayEvent();if(!ev)return;
  const vars=eventVars(ev);
  const choices=(ev.choices||[]).map(c=>{
    const need=c.needCoins==null?0:typeof c.needCoins==='string'?evNum(ev,c.needCoins):c.needCoins;
    const off=need&&S.coins<need;
    return `<button class="opt${c.go?' go':''}" data-act="event" data-v="${ev.id}:${c.id}" ${off?'disabled':''}><b>${fill(c.label,vars)}</b><small>${fill(c.note||'',vars)}${off&&c.short?fill(c.short,vars):''}</small></button>`;
  }).join('');
  show(`<div class="kicker">${UI.eventKicker}</div><h2>${fill(ev.title,vars)}</h2><p>${fill(ev.text,vars)}</p>${choices}`);
}
function applyEvent(key){
  const p=String(key).split(':'),ev=(EVENTS||[]).find(e=>e.id===p[0]),c=ev&&(ev.choices||[]).find(x=>x.id===p[1]);
  if(!ev||!c||S.st.events[ev.id])return;
  const need=c.needCoins==null?0:typeof c.needCoins==='string'?evNum(ev,c.needCoins):c.needCoins;
  if(need&&S.coins<need)return;
  const fx=c.effect||{},num=v=>typeof v==='string'?evNum(ev,v):v;
  if(fx.coins)S.coins+=num(fx.coins);
  if(fx.happy)S.happy=clamp(S.happy+num(fx.happy),0,100);
  if(fx.fest)S.fest=num(fx.fest);
  if(fx.festSpent!=null)S.st.festSpent=num(fx.festSpent);
  if(fx.debt)S.st.debt+=num(fx.debt);
  if(fx.creditFee)S.st.creditFee+=num(fx.creditFee);
  if(fx.storm)S.st.storm=fx.storm;
  if(fx.news)S.news.push({w:fx.newsW||1,t:fx.news});
  S.st.events[ev.id]=c.id;
  if(fx.sfx==='bad')sfx.bad();else if(fx.sfx!=='none')sfx.coin();
  render();
  const vars=eventVars(ev);
  if(c.after)show(`<h2>${fill(c.after.title,vars)}</h2><p>${fill(c.after.text,vars)}</p><div class="actions"><button class="btn primary" data-act="close">${UI.toCity}</button></div>`);
  else hide();
}
function upgradeAffordable(){
  return IDS.some(id=>{const b=B[id],lv=S.lvl[id];return lv<b.cost.length&&S.coins>=b.cost[lv]});
}
function askEvening(){
  if(!S)return;
  const end=S.day===CFG.days?UI.endLast:UI.endDay;
  const back=`<div class="actions"><button class="btn primary" data-act="close">${UI.warnBack}</button><button class="btn secondary" data-act="eveningGo">${end}</button></div>`;
  if(S.dec>=CFG.decisions){
    show(`<h2>${UI.warnBothTitle}</h2><p>${fill(UI.warnBoth,{n:CFG.decisions})}</p>${back}`);
    return;
  }
  if(S.dec>0&&upgradeAffordable()){
    show(`<h2>${UI.warnOneTitle}</h2><p>${UI.warnOne}</p>${back}`);
    return;
  }
  evening();
}
function evening(){
  closeSheet();
  const r=today(),inc=income(),profit=inc.tax+inc.shop+inc.fest-inc.upkeep;
  const deposit=Math.floor(S.coins*CFG.depositPercent/100);
  S.coins+=deposit;S.st.deposit+=deposit;
  S.coins+=profit;S.st.shopEarned+=inc.shop;S.st.festEarned+=inc.fest;if(S.fest>0)S.fest--;
  let repaid=0;if(S.st.debt>0){repaid=Math.min(S.coins,S.st.debt);S.coins-=repaid;S.st.debt-=repaid}
  S.log.push({r,hit:S.reqDone});if(!S.reqDone){S.happy=clamp(S.happy+CFG.missHappy,0,100);S.st.missed.push(r.target);S.news.push({w:2.5,t:r.miss})}
  S.hist.push({day:S.day,coins:S.coins,happy:S.happy});
  render();sfx.pop();
  const last=S.day===CFG.days,b=B[r.target];
  if(S.st.built>0&&S.st.storm) markLearned();
  const resident=S.reqDone
    ?`<b>${r.who} ${gword('pleased',r.g)}</b><p>${fill(UI.hitLine,{heart:HEART,name:b.name,desc:b.desc})}</p>`
    :`<b>${r.who} ${gword('upset',r.g)}</b><p>${fill(UI.missLine,{miss:r.miss,name:b.name,desc:b.desc,happy:CFG.missHappy,hint:last?'':UI.missNext})}</p>`;
  show(`<div class="kicker">${fill(UI.eveningKicker,{day:S.day})}</div><h2>${UI.eveningTitle}</h2>
  <div class="ledger"><div><span>${UI.taxLine}</span><b class="plus">+${inc.tax}</b></div>
  ${inc.shop?`<div><span>${UI.shopLine}</span><b class="plus">+${inc.shop}</b></div>`:''}
  ${inc.fest?`<div><span>${UI.festLine}</span><b class="plus">+${inc.fest}</b></div>`:''}
  <div><span>${UI.upkeepLine}</span><b class="minus">−${inc.upkeep}</b></div>
  ${deposit?`<div><span>${UI.depositLine}</span><b class="plus">+${deposit}</b></div>`:''}
  ${repaid?`<div><span>${UI.creditLine}</span><b class="minus">−${repaid}</b></div>`:''}
  <div class="total"><span>${UI.profit}</span><b class="${profit>=0?'plus':'minus'}">${profit>=0?'+':''}${profit}${COIN}</b></div></div>
  <div class="quote">${face(r,46)}<div>${resident}</div></div>
  <p>${fill(UI.budgetNow,{coins:mon(S.coins)})}</p>
  ${S.st.debt?`<p class="lvl">${fill(UI.debtLeft,{debt:S.st.debt,coin:COIN})}</p>`:''}
  <div class="actions"><button class="btn primary" data-act="${last?'final':'next'}">${last?UI.toFinal:UI.toMorning}</button></div>`);
}
function nextDay(){S.day++;hide();morning()}

/* ================= ИТОГИ ================= */
function esc(t){return String(t).replace(/[<>&"']/g,'')}
function archetype(){
  const sp=S.spendBy,green=sp.park+sp.lights,biz=sp.shop,build=sp.homes+sp.school,all=green+biz+build;
  const role=pair=> ({t:pair[0],d:pair[1]});
  if(!all)return role(UI.roles.empty);
  if(S.hearts>=CFG.mayorHearts)return role(UI.roles.hearts);
  if(S.coins>=CFG.mayorCoins)return role(UI.roles.coins);
  const m=Math.max(green,biz,build);
  if(m===green)return role(UI.roles.green);
  if(m===biz)return role(UI.roles.biz);
  return role(UI.roles.build);
}
function headlines(){const n=S.news.slice().sort((a,b)=>b.w-a.w).map(x=>x.t);if(!n.length)n.push(UI.quietNews);return n.slice(0,3)}
function moodOf(hit){return hit?(S.happy>=40?'happy':'ok'):(S.happy>=70?'ok':'sad')}
function paperPeople(){const hits=S.log.filter(x=>x.hit),miss=S.log.filter(x=>!x.hit);let p=[...hits.slice(-2),...miss.slice(-1)];if(p.length<3)p=[...p,...S.log.filter(x=>!p.includes(x))].slice(0,3);return p.slice(0,3)}
function forecast(){return S.happy>=CFG.sunAt?UI.forecastSun:S.happy>=CFG.cloudAt?UI.forecastCloud:UI.forecastRain}
function paperHTML(n){
  const people=paperPeople(),fc=forecast(),pins=IDS.map(id=>`<span class="tpin" style="left:${SPOTS[id].pin[0]}%;top:${SPOTS[id].pin[1]}%;--c1:${SPOTS[id].c[0]};--c2:${SPOTS[id].c[1]}">${S.lvl[id]+1}</span>`).join('');
  return `<div class="paper">
  <div class="ptop"><span>${fill(UI.issue,{days:CFG.days})}</span><span>${UI.price}</span></div>
  <div class="mast">${fill(UI.mast,{city:esc(S.city)})}</div>
  <div class="date">${fill(UI.paperDate,{days:CFG.days})}</div>
  <h3>${n[0]}</h3>
  ${MAP_OK?`<figure class="pphoto"><div class="thumb"><div class="in"><img src="${MAP_IMG}" alt="">${pins}</div></div><figcaption>${fill(UI.photoCap,{city:esc(S.city)})}</figcaption></figure>`:''}
  <div class="pcols"><div><div class="psec">${UI.secNews}</div>${n.slice(1).map(t=>`<div class="more">${t}</div>`).join('')||`<div class="more">${UI.paperQuiet}</div>`}</div>
  <div><div class="psec">${UI.secNumbers}</div><div class="pnum"><b>${S.final?S.final.pts:'—'}</b>${UI.numRating}</div><div class="pnum"><b>${S.people}</b>${UI.numPeople}</div><div class="pnum"><b>${S.happy}</b>${UI.numHappy}</div><div class="pnum"><b>${S.coins}</b>${UI.numCoins}</div><div class="pnum"><b>${S.hearts}/${CFG.days}</b>${UI.numHearts}</div></div></div>
  <div class="psec">${UI.secVoices}</div>
  <div class="ppl">${people.map(x=>`<div class="pp">${face(x.r,52,moodOf(x.hit))}<div><b>${x.r.who}</b><i>«${x.hit?x.r.thanks:x.r.complain}»</i></div></div>`).join('')}</div>
  <div class="pfoot"><div><div class="psec">${UI.secMayor}</div><b>${S.final.title}</b><br><small>${S.final.arch.d}</small></div><div class="wthr">${smile(S.happy)}<div><div class="psec">${UI.secForecast}</div><b>${fc[0]}</b><br><small>${fc[1]}</small></div></div></div>
  </div>`}
function wrap(x,text,maxW){const words=text.split(' '),lines=[];let cur='';words.forEach(w=>{const t=cur?cur+' '+w:w;if(x.measureText(t).width>maxW&&cur){lines.push(cur);cur=w}else cur=t});if(cur)lines.push(cur);return lines}
function finale(){
  hide();
  const sc=rating(),pts=sc.pts,stars=CFG.stars.filter(x=>pts>=x).length,inc=income();
  const arch=archetype(),title=arch.t,news=headlines();
  const bench=CFG.ratingBench,gap=Math.max(0,bench-pts);
  const benchLine=pts>=bench?fill(UI.benchOver,{bench}):fill(UI.benchUnder,{bench,gap});
  const ins=[];
  ins.push(fill(UI.insHearts,{hearts:S.hearts,days:CFG.days,heart:HEART,points:S.hearts*weight('hearts',CFG.heartPoints)}));
  if(S.st.shopSpent)ins.push(fill(UI.insShop,{spent:mon(S.st.shopSpent),earned:mon(S.st.shopEarned),tail:S.st.shopEarned>=S.st.shopSpent?UI.insShopPay:UI.insShopWait}));
  else ins.push(UI.insShopNone);
  if(S.st.festSpent)ins.push(fill(UI.insFest,{spent:S.st.festSpent,earned:S.st.festEarned,tail:S.st.festEarned>S.st.festSpent?UI.insFestGood:''}));
  else ins.push(fill(UI.insFestNone,{gain:CFG.festBonus*CFG.festDays,cost:CFG.festCost}));
  ins.push(S.st.storm==='credit'?fill(UI.insStormCredit,{extra:CFG.creditExtra,back:CFG.stormCost+CFG.creditExtra,coin:COIN}):S.st.storm==='paid'?UI.insStormYes:UI.insStormNo);
  const prev=sessionBest,fresh=pts>prev;if(fresh)sessionBest=pts;
  const record=prev>0&&fresh?fill(UI.recordNew,{pts}):prev>0&&pts<prev?fill(UI.recordLow,{pts,best:sessionBest}):fill(UI.record,{pts:sessionBest});
  S.final={pts,stars,title,arch,news};const paper=paperHTML(news);
  $('result').innerHTML=`<div class="stage"><div class="rhead"><div class="stars">${'★'.repeat(stars)}<span>${'★'.repeat(3-stars)}</span></div><h1>${stars>=2?UI.great:UI.okay}</h1><div style="font-size:clamp(14px,2.2dvh,17px);font-weight:700">${fill(UI.cityPts,{city:esc(S.city),pts})}</div><div class="record">${record}</div><p class="bench">${benchLine}</p></div>
  <div class="rbody"><div class="rpanel np">${paper}
  <div class="actions"><button class="btn primary" data-act="card">${UI.sharePaper}</button></div></div>
  <div class="rside"><div class="rpanel"><div class="score">${fill(UI.scorePts,{pts})}</div>
    <div class="rrow"><span>${smile(S.happy)} ${UI.rowHappy}</span><b>+${sc.happy}</b></div>
    <div class="rrow"><span>${PEOPLE} ${fill(UI.rowPeople,{people:S.people})}</span><b>+${sc.people}</b></div>
    <div class="rrow"><span>${HEART} ${fill(UI.rowHearts,{hearts:S.hearts,days:CFG.days})}</span><b>+${sc.hearts}</b></div>
    <div class="rrow"><span><i class="coin"></i> ${fill(UI.rowBudget,{coins:S.coins})}</span><b>+${sc.coins}</b></div>
    <div class="rrow"><span>${UI.rowInvest}</span><b>+${sc.invest}</b></div>
    <div class="rrow"><span>${UI.rowDeposit}</span><b>+${sc.deposit}</b></div>
    ${sc.fee?`<div class="rrow"><span>${UI.rowCredit}</span><b>−${sc.fee}</b></div>`:''}
    <div class="rrow"><span>${UI.rowIncome}</span><b>${inc.tax+inc.shop-inc.upkeep}${COIN}</b></div>
  </div>
  <div class="rpanel"><b>${UI.gotTitle}</b><ul class="ins">${ins.map(x=>`<li>${x}</li>`).join('')}</ul>
  <div class="actions"><button class="btn secondary" data-act="again">${UI.again}</button><button class="btn ghost" data-act="home">${UI.toMenu}</button></div></div></div></div></div>`;
  $('result').classList.remove('hidden');sfx.win();fitSoon();
  if(S.st.built>0&&S.st.storm)markLearned();
  post('FINISH_EVENT');
}
function roundRect(x,X,Y,w,h,r,fill){x.beginPath();x.moveTo(X+r,Y);x.arcTo(X+w,Y,X+w,Y+h,r);x.arcTo(X+w,Y+h,X,Y+h,r);x.arcTo(X,Y+h,X,Y,r);x.arcTo(X,Y,X+w,Y,r);x.closePath();x.fillStyle=fill;x.fill()}
function loadImg(src){return new Promise(res=>{const i=new Image();i.onload=()=>res(i);i.onerror=()=>res(null);i.src=src})}
async function makeCard(){
  await document.fonts.ready;
  const f=S.final,people=paperPeople(),W=720,H=1280;
  const [city,...faces]=await Promise.all([MAP_OK?loadImg(MAP_IMG):Promise.resolve(null),...people.map(p=>loadImg('data:image/svg+xml;charset=utf-8,'+encodeURIComponent(face(p.r,120,moodOf(p.hit)))))]);
  const draw=withCity=>{
    const cv=document.createElement('canvas');cv.width=W;cv.height=H;const x=cv.getContext('2d');
    const g=x.createLinearGradient(0,0,W,H);g.addColorStop(0,'#b67bff');g.addColorStop(1,'#4a2aa8');x.fillStyle=g;x.fillRect(0,0,W,H);
    roundRect(x,22,22,W-44,H-44,22,'#fbf7ec');
    const L=54,R=W-54,ser='Literata, Georgia, serif',sys='Nunito, system-ui, sans-serif';
    x.fillStyle='#6b6252';x.font=`700 18px ${sys}`;x.textAlign='left';x.fillText(fill(UI.cardIssue,{days:CFG.days}),L,66);x.textAlign='right';x.fillText(UI.cardPrice,R,66);
    x.fillStyle='#2b2b2b';x.fillRect(L,78,R-L,2);
    x.textAlign='center';x.fillStyle='#1d1a14';x.font=`900 50px ${ser}`;x.fillText(fill(UI.cardMast,{city:esc(S.city)}),W/2,138);
    x.fillRect(L,156,R-L,3);x.fillRect(L,163,R-L,1.5);
    x.font=`bold 40px ${ser}`;const hl=wrap(x,f.news[0],R-L).slice(0,3);hl.forEach((l,k)=>x.fillText(l,W/2,214+k*46));
    let y=214+hl.length*46-10;
    const ph=420;x.fillStyle='#d9cfb8';x.fillRect(L,y,R-L,ph);
    if(withCity&&city){const iw=city.naturalWidth,ih=city.naturalHeight,sh=iw*ph/(R-L);x.drawImage(city,0,ih*.3,iw,sh,L,y,R-L,ph)}
    x.strokeStyle='#2b2b2b';x.lineWidth=2;x.strokeRect(L,y,R-L,ph);
    y+=ph+30;x.fillStyle='#6b6252';x.font=`italic 20px ${ser}`;x.textAlign='left';x.fillText(fill(UI.cardPhoto,{city:esc(S.city)}),L,y);
    y+=22;x.fillStyle='#2b2b2b';x.fillRect(L,y,R-L,2);y+=34;
    x.fillStyle='#7b4cf0';x.font=`900 18px ${sys}`;x.fillText(UI.cardVoices,L,y);y+=16;
    people.forEach((p,k)=>{const fi=faces[k];if(fi)x.drawImage(fi,L,y,92,92);
      x.fillStyle='#1d1a14';x.font=`800 22px ${sys}`;x.fillText(p.r.who,L+100,y+28);
      x.font=`italic 24px ${ser}`;wrap(x,'«'+(p.hit?p.r.thanks:p.r.complain)+'»',R-L-100).slice(0,2).forEach((l,j)=>x.fillText(l,L+100,y+58+j*28));
      y+=106});
    y=Math.max(y+4,H-150);x.fillStyle='#2b2b2b';x.fillRect(L,y,R-L,2);
    x.textAlign='left';x.fillStyle='#7b4cf0';x.font=`900 18px ${sys}`;x.fillText(UI.cardMayor,L,y+34);
    x.fillStyle='#1d1a14';x.font=`bold 28px ${ser}`;x.fillText(f.title,L,y+70);
    x.textAlign='right';x.fillStyle='#f2a91f';x.font=`bold 44px ${sys}`;x.fillText('★'.repeat(f.stars)+'☆'.repeat(3-f.stars),R,y+50);
    x.fillStyle='#1d1a14';x.font=`900 26px ${sys}`;x.fillText(fill(UI.cardPts,{pts:f.pts}),R,y+86);
    x.textAlign='center';x.fillStyle='#6b6252';x.font=`600 20px ${sys}`;x.fillText(UI.cardCta,W/2,H-44);
    try{return {cv,url:cv.toDataURL('image/jpeg',.85)}}catch(e){return null}
  };
  const res=draw(true)||draw(false)||{cv:null,url:''};
  S.cardCanvas=res.cv;S.cardUrl=res.url;
  show(`<h2>${UI.cardTitle}</h2>${res.url?`<img class="cardimg" src="${res.url}" alt="${UI.cardAlt}">`:''}<div class="actions"><button class="btn primary" data-act="share">${UI.cardSend}</button><button class="btn secondary" data-act="close">${UI.back}</button></div>`);
}
function share(){
  const text=fill(UI.shareText,{city:esc(S.city),pts:S.final.pts,title:S.final.title,bench:CFG.ratingBench});
  post('SHARING_EVENT',{text,image:S.cardUrl||undefined});vibrate();
}

/* ================= ОБЩЕЕ ================= */
function outerH(el){if(!el||getComputedStyle(el).display==='none')return 0;const cs=getComputedStyle(el);return el.offsetHeight+parseFloat(cs.marginTop)+parseFloat(cs.marginBottom)}
function fitStage(stage,availW,availH){
  if(!stage||availW<2||availH<2)return;
  stage.style.maxWidth='none';
  let s=1;
  for(let i=0;i<5;i++){
    stage.style.zoom='1';
    stage.style.width=s>0.985?'100%':(100/s)+'%';
    const h=stage.scrollHeight,w=stage.scrollWidth;
    const next=Math.min(1,availH/Math.max(h,1),availW/Math.max(w,1));
    if(next>0.985){s=1;break}
    if(Math.abs(next-s)<0.012){s=next;break}
    s=next;
  }
  s=Math.max(0.05,Math.min(1,s));
  stage.style.zoom='1';
  stage.style.width=s>0.985?'100%':(100/s)+'%';
  const h=stage.scrollHeight,w=stage.scrollWidth;
  const finalS=Math.max(0.05,Math.min(1,availH/Math.max(h,1),availW/Math.max(w,1)));
  if(finalS>0.985){stage.style.zoom='1';stage.style.width='100%';return}
  stage.style.zoom=String(finalS);
}
function bindFitImages(stage){
  stage.querySelectorAll('img').forEach(img=>{
    if(img.dataset.fitbound)return;
    img.dataset.fitbound='1';
    img.addEventListener('load',fitSoon);
  });
}
function fitOverlay(shade){
  if(!shade||getComputedStyle(shade).display==='none')return;
  const box=shade.querySelector(':scope > .dialog, :scope > .sheet');
  if(!box)return;
  const stage=box.querySelector(':scope > .stage');
  if(!stage)return;
  const scs=getComputedStyle(shade);
  const availH=shade.clientHeight-parseFloat(scs.paddingTop)-parseFloat(scs.paddingBottom);
  const availW=shade.clientWidth-parseFloat(scs.paddingLeft)-parseFloat(scs.paddingRight);
  box.style.maxHeight=Math.max(0,availH)+'px';
  box.style.maxWidth='100%';
  const bcs=getComputedStyle(box);
  const innerH=Math.max(1,availH-parseFloat(bcs.paddingTop)-parseFloat(bcs.paddingBottom));
  const innerW=Math.max(1,availW-parseFloat(bcs.paddingLeft)-parseFloat(bcs.paddingRight));
  fitStage(stage,innerW,innerH);
  bindFitImages(stage);
}
function fitPanel(box){
  if(!box||box.classList.contains('hidden')||getComputedStyle(box).display==='none')return;
  const stage=box.querySelector(':scope > .stage');
  if(!stage)return;
  const bcs=getComputedStyle(box);
  const innerH=Math.max(1,box.clientHeight-parseFloat(bcs.paddingTop)-parseFloat(bcs.paddingBottom));
  const innerW=Math.max(1,box.clientWidth-parseFloat(bcs.paddingLeft)-parseFloat(bcs.paddingRight));
  fitStage(stage,innerW,innerH);
  bindFitImages(stage);
}
function fitHud(){
  const hud=document.querySelector('.hud'),req=$('req'),bottom=document.querySelector('.bottom'),app=$('app');
  if(!hud||!bottom||!app)return;
  hud.style.zoom='1';if(req)req.style.zoom='1';bottom.style.zoom='1';
  const needH=outerH(hud)+outerH(req)+outerH(bottom);
  const sH=needH>app.clientHeight&&app.clientHeight>0?app.clientHeight/needH:1;
  const needW=hud.scrollWidth,haveW=hud.clientWidth;
  const sW=needW>haveW+1&&haveW>0?haveW/needW:1;
  const hudS=Math.min(sH,sW);
  hud.style.zoom=hudS<0.999?String(Math.max(0.05,hudS)):'1';
  const z=sH<0.999?String(Math.max(0.05,sH)):'1';
  if(req&&getComputedStyle(req).display!=='none')req.style.zoom=z;
  bottom.style.zoom=z;
}
function fitScreens(){fitHud();fitOverlay($('shade'));fitOverlay($('sheetShade'));fitOverlay($('confirm'));fitPanel($('result'))}
function fitSoon(){fitScreens();requestAnimationFrame(fitScreens)}
function show(html,opt){const playing=S&&$('result').classList.contains('hidden');$('toast').classList.remove('show');const menu=playing?`<div class="actions"><button class="btn ghost" data-act="askLeave">${UI.toMenu}</button></div>`:'';$('dialog').innerHTML=`<div class="stage">${html}${menu}</div>`;$('shade').classList.toggle('dismiss',!!(opt&&opt.dismiss));$('shade').classList.add('show');fitSoon()}
function hide(){$('shade').classList.remove('show','dismiss')}
let tt;function toast(m){const t=$('toast');t.innerHTML=m;t.classList.add('show');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('show'),1900)}
function randomName(){return CITY_NAMES[Math.floor(Math.random()*CITY_NAMES.length)]}
function nameDialog(){show(`<div class="kicker">${UI.nameKicker}</div><h2>${UI.nameTitle}</h2><input id="cityName" class="namein" maxlength="16" value="${randomName()}" aria-label="${UI.nameLabel}"><p class="lvl">${UI.nameHint}</p><div class="actions"><button class="btn big2" style="width:100%;font-size:19px;padding:17px" data-act="go">${UI.nameGo} <span class="arr">→</span></button><button class="btn secondary" data-act="rename">${UI.nameOther}</button></div>`)}
function help(){show(`<h2>${UI.helpTitle}</h2><ul class="howto">${UI.help.map(s=>`<li>${fill(s,{days:CFG.days,decisions:CFG.decisions,heart:HEART})}</li>`).join('')}</ul>
<div class="actions"><button class="btn primary" data-act="close">${UI.ok}</button></div>`)}
function toggleSfx(){sfxOn=!sfxOn;soundIcons();if(sfxOn){primeAudio(true);sfx.pop()}}
function toggleMusic(){primeAudio(true);if(musicOn&&!musicLive()){startMusic();return}musicOn=!musicOn;soundIcons();if(musicOn)startMusic();else stopMusic()}
function post(type,extra){try{window.postMessage(Object.assign({type},extra||{}),'*')}catch(e){}}
function vibrate(){post('VIBRATION_EVENT')}
let completedSent=false;
function markLearned(){if(completedSent)return;completedSent=true;post('COMPLETED_EVENT')}
function exitGame(){post('CLOSE_EVENT')}
function askLeave(){if(!S){exitGame();return}$('confirmText').textContent=sessionBest?UI.leaveBest:UI.leavePlain;$('confirm').classList.add('show');fitSoon()}
function hideConfirm(){$('confirm').classList.remove('show')}
function leaveToMenu(){hideConfirm();hide();closeSheet();S=null;toStart()}
/* ===== СТАРТ: фон, облака, логотип ===== */
const CLOUD=[[62,150,58],[140,112,76],[232,98,70],[312,132,58],[372,164,46],[200,168,62],[100,186,52],[288,186,52],[30,196,40]];
function cloudSVG(flip,lilac){
  const g=()=>CLOUD.map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}"/>`).join(''),id=lilac?'cl':'cw';
  const st=lilac?['#fbf7ff','#eadfff','#d2c0fb','#b8a3f0']:['#ffffff','#f6f9ff','#e4ecf8','#c9d8ee'];
  return `<svg viewBox="-20 20 440 230" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="${id}" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="${st[0]}"/><stop offset=".65" stop-color="${st[1]}"/><stop offset="1" stop-color="${st[2]}"/></radialGradient></defs>
  <g${flip?' transform="translate(400 0) scale(-1 1)"':''}><g fill="${st[3]}" transform="translate(0 12)">${g()}</g><g fill="url(#${id})">${g()}</g>
  <g fill="#fff" opacity=".85"><circle cx="120" cy="92" r="24"/><circle cx="220" cy="80" r="20"/><circle cx="52" cy="132" r="16"/></g></g></svg>`;
}
/* буквы нарисованы контурами: жирный узкий гротеск, без внешних шрифтов */
const GL={
  'М':[78,'M0 0H24L39 40L54 0H78V100H56V50L45 80H33L22 50V100H0Z'],
  'О':[64,'M22 0H42A22 22 0 0 1 64 22V78A22 22 0 0 1 42 100H22A22 22 0 0 1 0 78V22A22 22 0 0 1 22 0ZM28 25H36A6 6 0 0 1 42 31V69A6 6 0 0 1 36 75H28A6 6 0 0 1 22 69V31A6 6 0 0 1 28 25Z'],
  'Й':[66,'M0 0H22V50L44 0H66V100H44V50L22 100H0ZM12 -24H26Q33 -14 40 -24H54Q48 -6 33 -6Q18 -6 12 -24Z'],
  'Г':[54,'M0 0H54V24H24V100H0Z'],
  'Р':[64,'M0 0H40A24 24 0 0 1 64 24V42A24 24 0 0 1 40 66H24V100H0ZM24 22H36A6 6 0 0 1 42 28V38A6 6 0 0 1 36 44H24Z'],
  'Д':[78,'M14 76L20 0H66V76H78V118H58V100H20V118H0V76ZM38 22H46V76H34Z']
};
function word(txt,gap){let x=0,d='';[...txt].forEach(ch=>{const [w,p]=GL[ch];d+=`<path fill-rule="evenodd" transform="translate(${x} 0)" d="${p}"/>`;x+=w+gap});return {d,w:x-gap}}
function logoSVG(){
  const top=word('МОЙ',6),big=word('ГОРОД',6);
  const ext=(id,n,col,dx,dy)=>Array.from({length:n},(_,i)=>`<use href="#${id}" fill="${col}" transform="translate(${(n-i)*dx} ${(n-i)*dy})"/>`).join('');
  const star=(n,R,r)=>Array.from({length:n*2},(_,i)=>{const a=Math.PI*i/n-Math.PI/2,rr=i%2?r:R;return `${(Math.cos(a)*rr).toFixed(1)},${(Math.sin(a)*rr).toFixed(1)}`}).join(' ');
  const spark=(x,y,r,c)=>`<path d="M${x} ${y-r}Q${x+r*.15} ${y-r*.15} ${x+r} ${y}Q${x+r*.15} ${y+r*.15} ${x} ${y+r}Q${x-r*.15} ${y+r*.15} ${x-r} ${y}Q${x-r*.15} ${y-r*.15} ${x} ${y-r}Z" fill="${c}"/>`;
  return `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><defs>
  <g id="wT">${top.d}</g><g id="wB">${big.d}</g>
  <linearGradient id="fB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#f1ebff"/><stop offset="1" stop-color="#c9b6ff"/></linearGradient>
  <linearGradient id="fT" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffd9fb"/><stop offset=".3" stop-color="#e09cff"/><stop offset=".6" stop-color="#9d6bff"/><stop offset="1" stop-color="#8fb4ff"/></linearGradient>
  <linearGradient id="fS" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f2ff9c"/><stop offset=".5" stop-color="#c8f53a"/><stop offset="1" stop-color="#8fd21a"/></linearGradient>
  <radialGradient id="fP" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#e6d6ff"/><stop offset=".5" stop-color="#9b6cff"/><stop offset="1" stop-color="#5a2fd6"/></radialGradient></defs>
  <g transform="translate(26 110) skewX(-9) scale(1.02)">
    ${ext('wB',9,'#24105e',1.3,1.5)}<use href="#wB" fill="#3b1c96" transform="translate(1.4 1.6)"/>
    <use href="#wB" fill="url(#fB)"/>
    <use href="#wB" fill="none" stroke="#fff" stroke-width="1.5" opacity=".7"/>
  </g>
  <g transform="translate(34 38) skewX(-9) scale(.62) rotate(-3)">
    ${ext('wT',8,'#24105e',1.6,1.8)}<use href="#wT" fill="url(#fT)"/><use href="#wT" fill="none" stroke="#fff" stroke-width="2" opacity=".55"/>
  </g>
  <g transform="translate(330 74) rotate(14)">
    <polygon points="${star(10,54,40)}" fill="#24105e" transform="translate(4 5)"/>
    <polygon points="${star(10,54,40)}" fill="url(#fS)" stroke="#24105e" stroke-width="3" stroke-linejoin="round"/>
    <text text-anchor="middle" y="0" font-family="Nunito, system-ui, sans-serif" font-weight="900" font-size="32" fill="#24105e" stroke="#24105e" stroke-width="2" stroke-linejoin="round">7</text>
    <text text-anchor="middle" y="22" font-family="Nunito, system-ui, sans-serif" font-weight="900" font-size="16" letter-spacing="1.5" fill="#24105e" stroke="#24105e" stroke-width="1.1" stroke-linejoin="round">ДНЕЙ</text>
  </g>
  <g class="coins"><g transform="translate(30 240) rotate(-12)"><path d="${'M0 -22 Q4 -4 22 0 Q4 4 0 22 Q-4 4 -22 0 Q-4 -4 0 -22Z'}" fill="url(#fP)"/><path d="M-6 -10 Q-2 -6 -10 -2" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/></g>
  ${spark(186,26,12,'#fff')}${spark(388,170,9,'#fff')}${spark(250,40,7,'#e4ff6a')}</g>
  </svg>`;
}
function toStart(){
  hide();closeSheet();$('result').classList.add('hidden');
  const st=$('start');st.className='start';
  st.innerHTML=`<img class="sbg" src="img/start.webp" alt="" decoding="async" onerror="this.remove()">
  <div class="cl cl1">${cloudSVG(0,0)}</div><div class="cl cl2">${cloudSVG(1,1)}</div><div class="cl cl3">${cloudSVG(0,1)}</div><div class="cl cl4">${cloudSVG(1,0)}</div><div class="cl cl5">${cloudSVG(0,0)}</div><div class="cl cl6">${cloudSVG(1,1)}</div>
  <div class="stage">
  <div class="sbar2"><button class="icon" data-act="exit" aria-label="${UI.exit}">✕</button><div class="audio"><button class="icon" data-act="sfx" data-sfx aria-label="${UI.sfx}"></button><button class="icon" data-act="music" data-music aria-label="${UI.music}"></button></div></div>
  <div class="logoWrap"><div class="logo2"><div class="bob">${logoSVG()}</div></div><div class="tag2">${esc(COPY.tag)}</div></div>
  <div class="cta2">${sessionBest?`<div class="best">${fill(UI.menuBest,{pts:sessionBest})}</div>`:''}<button class="big2" data-act="start">${UI.play} <span class="arr">→</span></button><button class="pill2" data-act="help"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#1c0f4a" stroke-width="2.4" stroke-linecap="round"><circle cx="12" cy="12" r="9.5"/><path d="M12 6.5V12l3.5 2.5"/></svg>${esc(COPY.time)}</button></div>
  </div>`;
  soundIcons();fitSoon();
}
function openStart(){
  const st=$('start');if(st.classList.contains('opening'))return;
  st.classList.add('opening');beep(330,.5,'sine');setTimeout(()=>beep(660,.4,'sine'),180);vibrate();
  setTimeout(nameDialog,1150);
}
document.addEventListener('click',e=>{
  const box=$('flowbox');
  if(box&&box.classList.contains('show')&&!e.target.closest('#flowbox')&&!e.target.closest('#flowBtn'))hideFlow();
  const el=e.target.closest('[data-act]');if(!el||el.disabled)return;
  const a=el.getAttribute('data-act'),v=el.getAttribute('data-v');
  if(a!=='sfx'&&a!=='music'&&a!=='exit'&&a!=='help')primeAudio();
  switch(a){
    case 'start':openStart();break;
    case 'again':newGame(S.city);break;
    case 'rename':$('cityName').value=randomName();break;
    case 'go':newGame(esc($('cityName').value.trim()).slice(0,16)||CITY_NAMES[0]);break;
    case 'home':S=null;toStart();$('start').classList.remove('hidden');break;
    case 'help':help();break;
    case 'close':hide();break;
    case 'startday':hide();{const q=$('req');q.classList.remove('pop');void q.offsetWidth;q.classList.add('pop')}openEvent();break;
    case 'b':openB(v);break;
    case 'flow':toggleFlow();break;
    case 'req':if(S){const r=today();show(`<div class="quote">${face(r,54)}<div><b>${r.name}</b><p>«${r.text}»</p></div></div><p>${S.reqDone?UI.reqDone:UI.reqOpen}</p><div class="actions"><button class="btn primary" data-act="close">${UI.ok}</button></div>`,{dismiss:true})}break;
    case 'support':support(v);break;
    case 'closeSheet':closeSheet();break;
    case 'evening':askEvening();break;
    case 'eveningGo':evening();break;
    case 'next':nextDay();break;
    case 'final':finale();break;
    case 'event':applyEvent(v);break;
    case 'card':makeCard();break;
    case 'share':share();break;
    case 'sfx':toggleSfx();break;
    case 'music':toggleMusic();break;
    case 'askLeave':askLeave();break;
    case 'stay':hideConfirm();break;
    case 'leave':leaveToMenu();break;
    case 'exit':exitGame();break;
  }
});
$('sheetShade').addEventListener('click',e=>{if(e.target===$('sheetShade'))closeSheet()});
$('shade').addEventListener('click',e=>{if(e.target===$('shade')&&$('shade').classList.contains('dismiss'))hide()});
$('confirm').addEventListener('click',e=>{if(e.target===$('confirm'))hideConfirm()});
function contentOk(d){
  if(!d||typeof d!=='object'||!d.cfg||!Array.isArray(d.cfg.stars)||!d.cfg.stars.length||!(d.cfg.days>=1))return false;
  if(!d.buildings||!BUILD_IDS.every(id=>{const b=d.buildings[id];return b&&b.name&&Array.isArray(b.cost)&&b.cost.length&&b.desc&&b.eff}))return false;
  if(!Array.isArray(d.residents)||d.residents.length<d.cfg.days)return false;
  if(!d.residents.every(r=>r&&r.who&&r.name&&r.text&&r.hit&&r.miss&&BUILD_IDS.includes(r.target)&&r.hair&&r.skin))return false;
  if(!d.news||!BUILD_IDS.every(id=>typeof d.news[id]==='string'))return false;
  if(!Array.isArray(d.cities)||!d.cities.length||!d.cities.every(n=>typeof n==='string'&&n.trim()))return false;
  if(d.events!=null&&(!Array.isArray(d.events)||!d.events.every(e=>e&&e.id&&e.day&&e.title&&e.text&&Array.isArray(e.choices)&&e.choices.every(c=>c&&c.id&&c.label))))return false;
  if(!(d.learn&&d.learn.line&&d.learn.aim&&d.learn.budget&&d.copy&&d.copy.tag&&d.copy.time&&d.ui))return false;
  const need=['dayPill','toCity','toMenu','play','helpTitle','leaveTitle','leavePlain','leaveBest','gameTitle','exit','eventKicker','peopleTitle'];
  if(!need.every(k=>typeof d.ui[k]==='string'&&d.ui[k]))return false;
  if(!Array.isArray(d.ui.help)||!d.ui.help.length||!Array.isArray(d.ui.tips)||!d.ui.tips.length)return false;
  if(!d.ui.roles||!d.ui.roles.empty||!Array.isArray(d.ui.coinForms)||d.ui.coinForms.length!==3)return false;
  return Array.isArray(d.ui.forecastSun)&&Array.isArray(d.ui.forecastCloud)&&Array.isArray(d.ui.forecastRain);
}
function applyContent(d){
  CFG=d.cfg;if(!CFG.festDay)CFG.festDay=3;if(!CFG.stormDay)CFG.stormDay=5;
  if(!CFG.mayorHearts)CFG.mayorHearts=6;if(!CFG.mayorCoins)CFG.mayorCoins=110;if(!CFG.sunAt)CFG.sunAt=70;if(!CFG.cloudAt)CFG.cloudAt=40;
  if(CFG.depositPercent==null)CFG.depositPercent=5;if(CFG.creditExtra==null)CFG.creditExtra=8;if(!CFG.ratingBench)CFG.ratingBench=240;if(!CFG.rating)CFG.rating={};
  B=d.buildings;IDS=BUILD_IDS.slice();RESIDENTS=d.residents;TOP_NEWS=d.news;CITY_NAMES=d.cities;LEARN=d.learn;COPY=d.copy;UI=d.ui;EVENTS=d.events||[];
  document.title=UI.gameTitle;
  $('confirmTitle').textContent=UI.leaveTitle;$('confirmText').textContent=UI.leavePlain;
  document.querySelector('#confirm [data-act=stay]').textContent=UI.stay;
  document.querySelector('#confirm [data-act=leave]').textContent=UI.toMenu;
  document.querySelector('[data-act=askLeave]').setAttribute('aria-label',UI.toMenu);
  document.querySelector('[data-sfx]').setAttribute('aria-label',UI.sfx);
  document.querySelector('[data-music]').setAttribute('aria-label',UI.music);
  $('happyPill').title=UI.happyTitle;$('peoplePill').title=UI.peopleTitle;
  $('endBtn').textContent=UI.endDay;
  $('dayPill').innerHTML=fill(UI.dayPill,{day:1,days:CFG.days});$('daySuns').innerHTML=sunsHTML(1);
}
function showContentError(){
  $('start').className='start';
  $('start').innerHTML='<div class="broken"><h2>Не получилось открыть игру</h2><p>Файл с текстами пустой или сломан. Нужен целый data/content.json рядом с игрой.</p></div>';
}
function bootFrom(data){
  if(!contentOk(data)){showContentError();return}
  applyContent(data);soundIcons();toStart();
}
function boot(){
  const embedded=window.GAME_CONTENT;
  if(location.protocol==='file:'){if(embedded)bootFrom(embedded);else showContentError();return}
  fetch('data/content.json').then(r=>{if(!r.ok)throw new Error('load');return r.json()}).then(bootFrom).catch(()=>{
    if(embedded)bootFrom(embedded);else showContentError();
  });
}
boot();
document.fonts.ready.then(fitSoon);
