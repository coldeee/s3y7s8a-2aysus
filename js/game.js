'use strict';
/* ================= БАЛАНС ================= */
const CFG={days:7,startCoins:60,startHappy:60,startPeople:100,decisions:2,baseTax:10,perTax:20,
  reqHappy:5,missHappy:-6,heartPoints:10,festCost:20,festBonus:10,festDays:3,stormCost:15,stormHappy:-10,stars:[120,160,195]};
const B={
  shop:  {name:'Магазины',cost:[20,30,45],eff:{income:8},color:'#ffe3b8',
          desc:'Магазины приносят доход в бюджет города каждый день.',no:'Доход не вырастет, за покупками придётся далеко ходить.'},
  homes: {name:'Жильё',cost:[25,35,50],eff:{people:40},color:'#ffd9c9',
          desc:'Новые дома — новые жители. Каждые 20 жителей платят 1 монетку налога в день.',no:'Новые семьи не смогут переехать.'},
  park:  {name:'Парк',cost:[15,25,40],eff:{happy:8},color:'#d3f2c8',
          desc:'Место для прогулок и игр. Жители становятся счастливее.',no:'Детям негде гулять после школы.'},
  school:{name:'Школа',cost:[25,35,50],eff:{happy:5,people:20},color:'#d6e8fb',
          desc:'Больше кабинетов — детям удобнее учиться, и в город переезжают семьи.',no:'В школе останется тесно.'},
  lights:{name:'Фонари',cost:[10,20,30],eff:{happy:5},color:'#fff3c2',
          desc:'Вечером на улицах светло и спокойно.',no:'Вечером на улицах темно и неуютно.'}
};
const IDS=['homes','school','shop','lights','park'];
const RESIDENTS=[
  {who:'Маша',thanks:'Теперь мы гуляем до самого ужина!',complain:'Опять сидим по домам. Скукота…',name:'Маша, 10 лет',g:'f',text:'После школы мы с друзьями сидим по домам — на улице совсем нечем заняться.',target:'park',hair:'#6b3b1f',skin:'#f5c9a4',long:true,
   hit:'Дети больше не скучают: в городе появилось, где гулять!',miss:'Дети снова сидят по домам: гулять негде'},
  {who:'Папа Игорь',thanks:'Дочка идёт с кружка по светлой улице — я спокоен.',complain:'Встречаю дочку с фонариком, как в походе.',name:'Папа Игорь, 35 лет',g:'m',text:'Вечером уже темно, и я волнуюсь, когда дочка возвращается с кружка.',target:'lights',hair:'#3a2a1d',skin:'#e9b48c',beard:true,
   hit:'На улицах светло: родители спокойны за детей',miss:'Вечером на улицах темно, родители волнуются'},
  {who:'Бабушка Нина',thanks:'Хлеб теперь всегда свежий и рядом!',complain:'Опять тащу сумки через полгорода.',name:'Бабушка Нина, 68 лет',g:'f',text:'За хлебом и молоком приходится ездить на автобусе в соседний район.',target:'shop',hair:'#d4d4d4',skin:'#f3cfb3',long:true,
   hit:'Бабушка Нина: «Теперь хлеб в двух шагах!»',miss:'Бабушка Нина опять едет за хлебом на автобусе'},
  {who:'Аня',thanks:'Учимся с утра, а после уроков свободны!',complain:'Вторая смена: домой прихожу в темноте.',name:'Аня, 12 лет',g:'f',text:'У нас в классе 35 человек, и мы учимся во вторую смену.',target:'school',hair:'#2b1b12',skin:'#c98f6a',long:true,
   hit:'Больше никакой второй смены: школа выросла!',miss:'Ученики всё ещё учатся во вторую смену'},
  {who:'Семья Ивановых',thanks:'Переехали и уже знаем всех соседей!',complain:'Каждый день по часу в дороге…',name:'Семья Ивановых',g:'p',text:'Мы работаем в вашем городе, а живём далеко — каждый день час в дороге.',target:'homes',hair:'#8a5a2b',skin:'#f1c6a0',
   hit:'Семья Ивановых переехала в город и уже полюбила его',miss:'Ивановы снова час едут на работу'},
  {who:'Дима',thanks:'В жару сидим у фонтана — красота!',complain:'Жарко, а спрятаться негде.',name:'Дима, 9 лет',g:'m',text:'Летом так жарко! Хочется посидеть в тени и побрызгаться водой.',target:'park',hair:'#d6a243',skin:'#f6cfae',
   hit:'В жару весь город отдыхает в тени деревьев',miss:'В жару горожанам негде спрятаться от солнца'},
  {who:'Продавщица Оля',thanks:'Очередей нет, покупатели довольны!',complain:'Очередь до самой улицы, кошмар.',name:'Продавщица Оля, 30 лет',g:'f',text:'В мою лавку столько покупателей, что очередь стоит до самой улицы!',target:'shop',hair:'#a2462e',skin:'#f3c6a5',long:true,
   hit:'Очередей больше нет: в городе новые магазины',miss:'Очередь в лавку Оли видно из космоса'}
];
const TOP_NEWS={shop:'В городе открылся торговый центр с вывеской до неба',homes:'В городе вырос новый жилой квартал',park:'Парк признан самым уютным в округе',school:'Школа выросла до четырёх этажей и получила стадион',lights:'Город так сияет ночью, что его видно из самолёта'};
const CITY_NAMES=['Солнечноград','Радужинск','Зеленодол','Облачный','Ягодинск','Звёздный','Пряниково','Мармеладово','Светлогорск','Ветерок'];
const LEARN={
  line:'После игры ты умеешь по рассказу жителя выбрать нужное здание и объяснить бюджет города: налоги и доход магазинов минус уход за зданиями.',
  aim:'по рассказу жителя выбрать нужное здание и объяснить бюджет: налоги и магазины минус уход',
  budget:'Бюджет дня — налоги и магазины минус уход за зданиями. Разница остаётся на завтра.'
};
/* свой луп в двух коленах: светлая улица, потом тихий минор. Не чужие темы. */
const TUNES={bpm:80,loop:64,
  bass:[
    {at:0,f:'D2',len:8},{at:8,f:'A2',len:8},{at:16,f:'G2',len:8},{at:24,f:'A2',len:8},
    {at:32,f:'B2',len:16},{at:48,f:'G2',len:8},{at:56,f:'A2',len:8}
  ],
  strings:[
    {at:0,len:8,notes:['D3','F#3','A3'],v:.024},{at:8,len:8,notes:['A3','C#4','E4'],v:.02},
    {at:16,len:8,notes:['G3','B3','D4'],v:.022},{at:24,len:8,notes:['A3','C#4','E4'],v:.02},
    {at:32,len:16,notes:['B2','D3','F#3'],v:.014},{at:48,len:8,notes:['G3','B3','D4'],v:.016},
    {at:56,len:8,notes:['A3','C#4','E4'],v:.018}
  ],
  walk:[
    {at:0,len:8,notes:['D3','A3','F#3','A3']},{at:8,len:8,notes:['A3','E4','C#4','E4']},
    {at:16,len:8,notes:['G3','D4','B3','D4']},{at:24,len:8,notes:['A3','E4','C#4','E4']}
  ],
  street:[
    {at:0,f:'D4',len:2},{at:2,f:'F#4',len:2},{at:4,f:'E4',len:2},{at:6,f:'D4',len:2},
    {at:8,f:'A3',len:2},{at:10,f:'B3',len:2},{at:12,f:'D4',len:4},
    {at:16,f:'E4',len:2},{at:18,f:'F#4',len:2},{at:20,f:'G4',len:2},{at:22,f:'F#4',len:2},
    {at:24,f:'E4',len:2},{at:26,f:'D4',len:2},{at:28,f:'C#4',len:2},{at:30,f:'D4',len:2}
  ],
  corner:[
    {at:32,f:'B3',len:4},{at:36,f:'D4',len:2},{at:38,f:'C#4',len:2},
    {at:40,f:'B3',len:4},{at:44,f:'A3',len:4},
    {at:48,f:'G3',len:2},{at:50,f:'A3',len:2},{at:52,f:'B3',len:4},
    {at:56,f:'D4',len:2},{at:58,f:'C#4',len:2},{at:60,f:'D4',len:4}
  ],
  piano:[
    {at:32,notes:['B2','D3','F#3']},{at:36,notes:['B2','D3','F#3']},
    {at:40,notes:['F#2','A2','C#3']},{at:44,notes:['F#2','B2','C#3']},
    {at:48,notes:['G2','B2','D3']},{at:52,notes:['G2','B2','D3']},
    {at:56,notes:['A2','C#3','E3']},{at:60,notes:['A2','C#3','E3']}
  ]};

/* ================= УТИЛИТЫ ================= */
const $=id=>document.getElementById(id);
function pl(n,f){n=Math.abs(n)%100;const n1=n%10;if(n>10&&n<20)return f[2];if(n1>1&&n1<5)return f[1];if(n1===1)return f[0];return f[2]}
const mon=n=>`${n} ${pl(n,['монетка','монетки','монеток'])}`;
const COIN='<i class="coin"></i>';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const verb=(g,f,m,p)=>g==='f'?f:g==='m'?m:p;
function shade(hex,f){const n=parseInt(hex.slice(1),16),c=[n>>16,n>>8&255,n&255].map(x=>Math.round(clamp(f<1?x*f:x+(255-x)*(f-1),0,255)));return '#'+c.map(x=>x.toString(16).padStart(2,'0')).join('')}

/* ================= ЗВУК ================= */
let sfxOn=true,musicOn=true,actx=null,sessionBest=0;
const music={timer:null,next:0,step:0,out:null,nodes:[]};
function hz(n){const pc={C:0,'C#':1,D:2,'D#':3,E:4,F:5,'F#':6,G:7,'G#':8,A:9,'A#':10,B:11};const m=/^([A-G]#?)(\d)$/.exec(n);return 440*Math.pow(2,(((+m[2]+1)*12+pc[m[1]])-69)/12)}
function ensureCtx(){actx=actx||new(window.AudioContext||window.webkitAudioContext)();if(actx.state==='suspended')actx.resume();return actx}
function beep(f,d,type){if(!sfxOn)return;try{const ctx=ensureCtx(),o=ctx.createOscillator(),g=ctx.createGain();o.type=type||'sine';o.frequency.value=f;g.gain.setValueAtTime(.07,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+d);o.connect(g);g.connect(ctx.destination);o.start();o.stop(ctx.currentTime+d)}catch(e){}}
const sfx={coin(){beep(880,.07);setTimeout(()=>beep(1320,.09),70)},pop(){beep(520,.1,'triangle')},bad(){beep(196,.2,'triangle')},win(){[523,659,784,1046].forEach((f,i)=>setTimeout(()=>beep(f,.12),i*110))}};
function musicOut(){
  if(music.out)return music.out;
  const ctx=ensureCtx(),g=ctx.createGain(),tone=ctx.createBiquadFilter(),dry=ctx.createGain(),wet=ctx.createGain();
  const d1=ctx.createDelay(1),d2=ctx.createDelay(1),fb=ctx.createGain(),damp=ctx.createBiquadFilter();
  g.gain.value=.0001;tone.type='lowpass';tone.frequency.value=1850;tone.Q.value=.45;
  dry.gain.value=.84;wet.gain.value=.34;d1.delayTime.value=.27;d2.delayTime.value=.41;fb.gain.value=.24;
  damp.type='lowpass';damp.frequency.value=1000;
  g.connect(tone);tone.connect(dry);dry.connect(ctx.destination);
  tone.connect(d1);d1.connect(damp);damp.connect(wet);wet.connect(ctx.destination);damp.connect(fb);fb.connect(d2);d2.connect(damp);
  music.out=g;return g}
function voice(freq,time,dur,vol,attack,detune,type){const o=actx.createOscillator(),g=actx.createGain(),a=Math.max(.02,Math.min(attack,dur*.45));o.type=type||'sine';o.frequency.value=freq;if(detune)o.detune.value=detune;g.gain.setValueAtTime(.0001,time);g.gain.exponentialRampToValueAtTime(vol,time+a);g.gain.exponentialRampToValueAtTime(.0001,time+dur);o.connect(g);g.connect(music.out);o.start(time);o.stop(time+dur+.04);music.nodes.push(o)}
function playBass(name,time,dur){const f=hz(name);voice(f,time,dur*.98,.055,dur*.18,0,'sine');voice(f*2,time,dur*.98,.024,dur*.22,0,'sine')}
function playStrings(notes,time,dur,vol){const v=vol||.02;notes.forEach(n=>{const f=hz(n);voice(f,time,dur*.97,v,dur*.32,-8,'triangle');voice(f,time,dur*.97,v*.85,dur*.36,8,'triangle')})}
function playPluck(name,time){voice(hz(name),time,.55,.018,.02,0,'triangle')}
function playPiano(notes,time){notes.forEach((n,k)=>{const f=hz(n);voice(f,time+k*.04,1.7,.032,.018,0,'triangle')})}
function playClarinet(name,time,dur,vol){
  const f=hz(name),o=actx.createOscillator(),g=actx.createGain(),lfo=actx.createOscillator(),lg=actx.createGain(),a=Math.min(.22,Math.max(.08,dur*.18));
  o.type='sine';o.frequency.value=f;lfo.type='sine';lfo.frequency.value=3.2;lg.gain.value=f*.0035;
  lfo.connect(lg);lg.connect(o.frequency);
  g.gain.setValueAtTime(.0001,time);g.gain.exponentialRampToValueAtTime(vol||.04,time+a);g.gain.exponentialRampToValueAtTime(.0001,time+dur);
  o.connect(g);g.connect(music.out);o.start(time);lfo.start(time);o.stop(time+dur+.05);lfo.stop(time+dur+.05);music.nodes.push(o,lfo);
  if(f*3<1400)voice(f*3,time,dur*.85,.006,a,0,'sine')}
function pumpMusic(){if(!actx||!music.timer)return;try{const beat=60/TUNES.bpm,now=actx.currentTime;if(music.next<now)music.next=now+.02;const horizon=now+.35;while(music.next<horizon){const i=music.step%TUNES.loop,t=music.next;TUNES.bass.forEach(n=>{if(n.at===i)playBass(n.f,t,beat*n.len)});TUNES.strings.forEach(n=>{if(n.at===i)playStrings(n.notes,t,beat*n.len,n.v)});TUNES.street.forEach(n=>{if(n.at===i)playClarinet(n.f,t,beat*n.len,.04)});TUNES.corner.forEach(n=>{if(n.at===i)playClarinet(n.f,t,beat*n.len,.03)});TUNES.piano.forEach(n=>{if(n.at===i)playPiano(n.notes,t)});const step=TUNES.walk.find(a=>i>=a.at&&i<a.at+a.len);if(step)playPluck(step.notes[(i-step.at)%step.notes.length],t);music.next+=beat;music.step++}}catch(e){}}
function startMusic(){if(!musicOn||music.timer)return;const ctx=ensureCtx(),out=musicOut(),t=ctx.currentTime;out.gain.cancelScheduledValues(t);out.gain.setValueAtTime(Math.max(out.gain.value,.0001),t);out.gain.linearRampToValueAtTime(.8,t+1.2);music.next=t+.08;music.step=0;music.timer=setInterval(pumpMusic,90);pumpMusic()}
function stopMusic(){if(music.timer){clearInterval(music.timer);music.timer=null}if(music.out&&actx){const t=actx.currentTime;music.out.gain.cancelScheduledValues(t);music.out.gain.setValueAtTime(Math.max(music.out.gain.value,.0001),t);music.out.gain.linearRampToValueAtTime(.0001,t+.35)}const old=music.nodes.splice(0);setTimeout(()=>old.forEach(o=>{try{o.stop()}catch(e){}}),380);music.step=0}
function primeAudio(manual){try{ensureCtx();if(!manual&&musicOn)startMusic()}catch(e){}}
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
  homes: {pin:[21.5,34.5],poly:'13.5,37 22,32.5 30.5,36 30.5,41.8 22,44.8 13.5,41.8',c:['#ffbf7a','#ff6a3d']},
  school:{pin:[58,39], poly:'49.5,41 58,36.2 67.5,40.5 67.5,48.2 58,51.8 49.5,48.2',c:['#8fd0ff','#3a6dff']},
  shop:  {pin:[85,55.5], poly:'76,58.5 86,54.2 97,57.5 97,64.8 86,67.8 76,63.8',c:['#ffa3d6','#e8457f']},
  park:  {pin:[37.5,64.5],poly:'28,66.5 38,62 50,65.3 48.5,70.8 36,73.2 28,70.2',c:['#a4f383','#1fae58']},
  lights:{pin:[53,58.5],poly:'44,61 52,57.4 62.5,58.4 62.5,61.6 52,64.6 44,63.6',c:['#dcbcff','#7b4cf0']}
};
function glyph(id){
  const st='stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"';
  if(id==='shop')return `<path d="M3 5h3l2.6 10.5h9.6l2.4-7.5H7.2" ${st}/><circle cx="10" cy="19.5" r="1.7" fill="#fff"/><circle cx="17" cy="19.5" r="1.7" fill="#fff"/>`;
  if(id==='homes')return `<path d="M3.5 11.5L12 4l8.5 7.5" ${st}/><path d="M6 10v10h12V10" ${st}/><rect x="10.3" y="14" width="3.4" height="6" rx="1" fill="#fff"/>`;
  if(id==='school')return `<polygon points="1.5,9 12,4 22.5,9 12,14" fill="#fff"/><path d="M6 11.5v4.5q6 4 12 0v-4.5M20.5 10v6" ${st}/>`;
  if(id==='park')return `<path d="M12 3l5 7h-3l4 6H6l4-6H7z" fill="#fff"/><path d="M12 16v5" ${st}/>`;
  return `<path d="M12 21V11" ${st}/><path d="M8 11h8l-1.5-5h-5z" fill="#fff"/><path d="M12 2.5v1.5M5.5 5l1 1M18.5 5l-1 1" ${st}/>`;
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
window.addEventListener('resize',fitMap);
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
    pins+=`<button class="pin${id===f?' on':''}${S.anim===id?' pop':''}" style="left:${sp.pin[0]}%;top:${sp.pin[1]}%;--c1:${sp.c[0]};--c2:${sp.c[1]};animation-delay:${k*.35}s" data-act="b" data-v="${id}" aria-label="${B[id].name}"><span class="ico3"><svg viewBox="0 0 24 24">${glyph(id)}</svg><span class="lv">${lv+1}</span></span></button>`;
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
     city:city||'Солнечноград',focus:null,log:[],news:[],spendBy:{shop:0,homes:0,park:0,school:0,lights:0},dec:CFG.decisions,reqDone:false,hearts:0,fest:0,anim:null,hist:[],
     st:{shopSpent:0,shopEarned:0,festSpent:0,festEarned:0,storm:null,missed:[],built:0,spent:0}};
  $('start').classList.add('hidden');$('result').classList.add('hidden');
  morning();
}
function income(){return {tax:CFG.baseTax+Math.floor(S.people/CFG.perTax),shop:S.lvl.shop*B.shop.eff.income,fest:S.fest>0?CFG.festBonus:0,upkeep:IDS.reduce((a,id)=>a+S.lvl[id],0)}}
function score(){return {happy:S.happy,people:Math.floor(S.people/10),hearts:S.hearts*CFG.heartPoints,coins:Math.floor(S.coins/2)}}
const total=sc=>sc.happy+sc.people+sc.hearts+sc.coins;

/* ================= ЭКРАН ГОРОДА ================= */
function render(){
  if(!S)return;
  renderMap();
  if(S.anim)setTimeout(()=>{if(S){S.anim=null}},900);
  $('day').textContent=S.day;$('coins').textContent=S.coins;$('happy').textContent=S.happy;$('smile').innerHTML=smile(S.happy);
  const r=today();
  $('req').className='req'+(S.reqDone?' done':'');
  $('req').innerHTML=S.reqDone
    ?`${face(r,50)}<div><b>${r.name}</b><p>Спасибо! Просьба выполнена ${HEART} +1</p></div>`
    :`${face(r,50)}<div><b>${r.name}</b><p>${r.text}</p></div><span class="chev">›</span>`;
  $('decs').innerHTML=`Улучшения сегодня ${Array.from({length:CFG.decisions},(_,k)=>`<i class="${k<S.dec?'':'off'}"></i>`).join('')} ${S.dec} из ${CFG.decisions}`;
  $('endBtn').textContent=S.day===CFG.days?'Закончить последний день':'Закончить день';
}
function effList(id){
  const e=B[id].eff;let h='';
  if(e.income)h+=`<span class="eff">+${e.income}${COIN} в день</span>`;
  if(e.people)h+=`<span class="eff">${PEOPLE} +${e.people} жителей</span>`;
  if(e.happy)h+=`<span class="eff">${smile(80)} +${e.happy} счастья</span>`;
  h+=`<span class="eff cost">Уход за зданием −1${COIN} в день</span>`;
  return h;
}
function openB(id){
  const b=B[id],lv=S.lvl[id],max=lv>=b.cost.length,cost=max?0:b.cost[lv],r=today();
  const can=!max&&S.dec>0&&S.coins>=cost;
  const why=max?'Уже максимальный уровень':S.dec<=0?'Улучшения на сегодня закончились':S.coins<cost?'Не хватает монеток':'';
  $('sheet').innerHTML=`<button class="x" data-act="closeSheet" aria-label="Закрыть">✕</button>
  <div class="shead"><span class="ico3 big3" style="--c1:${SPOTS[id].c[0]};--c2:${SPOTS[id].c[1]}"><svg viewBox="0 0 24 24">${glyph(id)}</svg></span><div><h2>${b.name}</h2><div class="lvl">${max?`Уровень ${lv+1} — максимум`:`Уровень ${lv+1} → ${lv+2}`}</div></div></div>
  <p>${b.desc}</p>
  ${max?'':`<div class="effs">${effList(id)}</div>`}
  ${max?'':`<div class="nobox"><b>А если не улучшать?</b>${b.no}</div>`}
  <div class="sacts"><button class="btn primary" data-act="support" data-v="${id}" ${can?'':'disabled'}>${max?'Максимальный уровень':`Улучшить за ${cost}${COIN}`}</button>${why&&!max?`<div class="lvl" style="text-align:center">${why}</div>`:''}<button class="btn secondary" data-act="closeSheet">Не сейчас</button><button class="btn ghost" data-act="askLeave">В меню</button></div>`;
  $('sheetShade').classList.add('show');sfx.pop();S.focus=id;renderMap();vibrate();
}
function closeSheet(){$('sheetShade').classList.remove('show');if(S&&S.focus){S.focus=null;renderMap()}}
function support(id){
  const b=B[id],lv=S.lvl[id];if(lv>=b.cost.length||S.dec<=0)return;const cost=b.cost[lv];if(S.coins<cost)return;
  S.coins-=cost;S.lvl[id]++;S.dec--;S.st.built++;S.st.spent+=cost;
  if(id==='shop')S.st.shopSpent+=cost;S.spendBy[id]+=cost;if(S.lvl[id]===3)S.news.push({w:3,t:TOP_NEWS[id]});
  if(b.eff.happy)S.happy+=b.eff.happy;if(b.eff.people)S.people+=b.eff.people;
  let msg=`${b.name}: уровень ${lv+2}!`;
  if(today().target===id&&!S.reqDone){S.reqDone=true;S.hearts++;S.news.push({w:2,t:today().hit});S.happy+=CFG.reqHappy;msg=`${today().who} ${verb(today().g,'рада','рад','рады')}! +1 сердечко`;sfx.win()}else sfx.coin();
  S.happy=clamp(S.happy,0,100);S.anim=id;closeSheet();render();toast(msg);vibrate();
}

/* ================= ДЕНЬ ================= */
function morning(){
  S.dec=CFG.decisions;S.reqDone=false;render();
  const r=today();
  const intro=S.day===1?`<ul class="howto"><li><b>Цель:</b> ${LEARN.aim}.</li><li>Жми на значки над домами и <b>улучшай здания</b> за монетки.</li><li>Каждый день кто-то из жителей рассказывает о проблеме. <b>Догадайся, что поможет</b>, — получишь сердечко.</li><li>Вечером город получает монетки. <b>Оставляй немного на завтра.</b></li></ul>`:'';
  let ev='',btns=`<button class="btn primary" data-act="startday">В город</button>`;
  if(S.day===3){ev=`<div class="event"><b>В город приехал фестиваль еды!</b><p>Помоги его устроить — и ${CFG.festDays} дня город будет получать больше монеток.</p></div>`;
    btns=`<button class="opt go" data-act="fest" data-v="yes" ${S.coins>=CFG.festCost?'':'disabled'}><b>Помочь фестивалю</b><small>Сейчас −${CFG.festCost}, потом +${CFG.festBonus} каждый день, ${CFG.festDays} дня</small></button><button class="opt" data-act="fest" data-v="no"><b>Не участвовать</b><small>Ничего не изменится</small></button>`}
  if(S.day===5){ev=`<div class="event"><b>Ночью дул сильный ветер</b><p>Сломались качели и скамейки. Починить стоит ${mon(CFG.stormCost)}.</p></div>`;
    btns=`<button class="opt go" data-act="storm" data-v="yes" ${S.coins>=CFG.stormCost?'':'disabled'}><b>Починить</b><small>−${mon(CFG.stormCost)}${S.coins<CFG.stormCost?' · не хватает монеток':''}</small></button><button class="opt" data-act="storm" data-v="no"><b>Не чинить</b><small>Жители расстроятся: счастье ${CFG.stormHappy}</small></button>`}
  show(`<div class="kicker">ГОРОД «${esc(S.city).toUpperCase()}» · ДЕНЬ ${S.day} ИЗ ${CFG.days}</div><h2>${S.day===1?'Ты — мэр города!':S.day===CFG.days?'Последний день':'Доброе утро, мэр!'}</h2>${intro}
  <div class="quote">${face(r,54)}<div><b>${r.name}</b><p>«${r.text}»</p></div></div><p class="lvl" style="margin:4px 0 0">Что поможет? Найди это здание в городе.</p>${ev}<div class="actions">${btns}</div>`);
}
function fest(yes){
  if(yes){S.coins-=CFG.festCost;S.fest=CFG.festDays;S.st.festSpent=CFG.festCost;S.news.push({w:2,t:'Фестиваль еды собрал весь город'});sfx.coin();
    show(`<h2>Фестиваль начинается!</h2><p>Ты потратил ${mon(CFG.festCost)}. Следующие ${CFG.festDays} вечера город получит по +${CFG.festBonus}. Посмотрим, вернутся ли деньги!</p><div class="actions"><button class="btn primary" data-act="startday">В город</button></div>`)}
  else{S.st.festSpent=0;show(`<h2>Фестиваль проедет мимо</h2><p>Монетки остались при тебе. Иногда потратить сейчас — значит получить больше потом.</p><div class="actions"><button class="btn primary" data-act="startday">В город</button></div>`)}
  render();
}
function storm(yes){
  if(yes){S.coins-=CFG.stormCost;S.st.storm='paid';S.news.push({w:1,t:'Качели после бури починили за одну ночь'});sfx.coin();
    show(`<h2>Всё починили!</h2><p>Хорошо, что были монетки в запасе. Запас нужен как раз на такие случаи.</p><div class="actions"><button class="btn primary" data-act="startday">В город</button></div>`)}
  else{S.happy=clamp(S.happy+CFG.stormHappy,0,100);S.st.storm='skip';S.news.push({w:1.5,t:'Сломанные качели всё ещё ждут ремонта'});sfx.bad();
    show(`<h2>Жители грустят</h2><p>Качели так и стоят сломанные: счастье ${CFG.stormHappy}. Совет: держи немного монеток в запасе.</p><div class="actions"><button class="btn primary" data-act="startday">В город</button></div>`)}
  render();
}
function evening(){
  closeSheet();
  const r=today(),inc=income(),profit=inc.tax+inc.shop+inc.fest-inc.upkeep;
  S.coins+=profit;S.st.shopEarned+=inc.shop;S.st.festEarned+=inc.fest;if(S.fest>0)S.fest--;
  S.log.push({r,hit:S.reqDone});if(!S.reqDone){S.happy=clamp(S.happy+CFG.missHappy,0,100);S.st.missed.push(r.target);S.news.push({w:2.5,t:r.miss})}
  S.hist.push({day:S.day,coins:S.coins,happy:S.happy});
  render();sfx.pop();
  const last=S.day===CFG.days,b=B[r.target];
  if(S.reqDone) markLearned();
  const resident=S.reqDone
    ?`<b>${r.who} ${verb(r.g,'довольна','доволен','довольны')}</b><p>${HEART} +1 сердечко. Ты выбрал «${b.name}»: ${b.desc}</p>`
    :`<b>${r.who} ${verb(r.g,'расстроилась','расстроился','расстроились')}</b><p>${r.miss}. Помогло бы: <b>${b.name}</b>. ${b.desc} Счастье ${CFG.missHappy}. ${last?'Теперь понятно, какое здание ждали.':'В следующий день послушай просьбу и улучши это здание.'}</p>`;
  show(`<div class="kicker">ВЕЧЕР · ДЕНЬ ${S.day}</div><h2>Итог дня</h2>
  <div class="ledger"><div><span>Жители заплатили налоги</span><b class="plus">+${inc.tax}</b></div>
  ${inc.shop?`<div><span>Магазины</span><b class="plus">+${inc.shop}</b></div>`:''}
  ${inc.fest?`<div><span>Фестиваль</span><b class="plus">+${inc.fest}</b></div>`:''}
  <div><span>Уход за зданиями</span><b class="minus">−${inc.upkeep}</b></div>
  <div class="total"><span>Прибыль</span><b class="${profit>=0?'plus':'minus'}">${profit>=0?'+':''}${profit}${COIN}</b></div></div>
  <p class="learnline">${LEARN.budget}</p>
  <div class="quote">${face(r,46)}<div>${resident}</div></div>
  <p>В бюджете: <b>${mon(S.coins)}</b></p>
  <div class="actions"><button class="btn primary" data-act="${last?'final':'next'}">${last?'Подвести итоги':'Наступает утро'}</button></div>`);
}
function nextDay(){S.day++;hide();morning()}

/* ================= ИТОГИ ================= */
function esc(t){return String(t).replace(/[<>&"']/g,'')}
function archetype(){
  const sp=S.spendBy,green=sp.park+sp.lights,biz=sp.shop,build=sp.homes+sp.school,all=green+biz+build;
  if(!all)return {t:'Мэр-хранитель',d:'Ты почти ничего не тратил. Деньги целы, но город не вырос.'};
  if(S.hearts>=6)return {t:'Народный мэр',d:'Ты слышишь каждого жителя — город тебя обожает.'};
  if(S.coins>=110)return {t:'Бережливый мэр',d:'Ты умеешь копить и тратишь с умом.'};
  const m=Math.max(green,biz,build);
  if(m===green)return {t:'Мэр-садовник',d:'Ты сделал город зелёным, светлым и уютным.'};
  if(m===biz)return {t:'Мэр-предприниматель',d:'Ты знаешь: магазины пополняют бюджет каждый день.'};
  return {t:'Мэр-строитель',d:'Город растёт, в нём появляются новые семьи.'};
}
function headlines(){const n=S.news.slice().sort((a,b)=>b.w-a.w).map(x=>x.t);if(!n.length)n.push('В городе спокойно: мэр копит силы');return n.slice(0,3)}
function moodOf(hit){return hit?(S.happy>=40?'happy':'ok'):(S.happy>=70?'ok':'sad')}
function paperPeople(){const hits=S.log.filter(x=>x.hit),miss=S.log.filter(x=>!x.hit);let p=[...hits.slice(-2),...miss.slice(-1)];if(p.length<3)p=[...p,...S.log.filter(x=>!p.includes(x))].slice(0,3);return p.slice(0,3)}
function forecast(){return S.happy>=70?['Солнечно','Жители улыбаются весь день']:S.happy>=40?['Переменная облачность','Кому-то весело, кому-то не очень']:['Пасмурно','Жители ворчат, мэру есть над чем подумать']}
function paperHTML(n){
  const people=paperPeople(),fc=forecast(),pins=IDS.map(id=>`<span class="tpin" style="left:${SPOTS[id].pin[0]}%;top:${SPOTS[id].pin[1]}%;--c1:${SPOTS[id].c[0]};--c2:${SPOTS[id].c[1]}">${S.lvl[id]+1}</span>`).join('');
  return `<div class="paper">
  <div class="ptop"><span>Выпуск №${CFG.days}</span><span>Цена: 1 монетка</span></div>
  <div class="mast">Вестник «${esc(S.city)}»</div>
  <div class="date">Главная газета города · 7 дней работы нового мэра</div>
  <h3>${n[0]}</h3>
  ${MAP_OK?`<figure class="pphoto"><div class="thumb"><div class="in"><img src="${MAP_IMG}" alt="">${pins}</div></div><figcaption>${esc(S.city)} сегодня. Фото редакции</figcaption></figure>`:''}
  <div class="pcols"><div><div class="psec">Новости</div>${n.slice(1).map(t=>`<div class="more">${t}</div>`).join('')||'<div class="more">В городе тихо и спокойно</div>'}</div>
  <div><div class="psec">Цифры недели</div><div class="pnum"><b>${S.people}</b>жителей</div><div class="pnum"><b>${S.happy}</b>счастье из 100</div><div class="pnum"><b>${S.coins}</b>монеток в казне</div><div class="pnum"><b>${S.hearts}/${CFG.days}</b>просьб выполнено</div></div></div>
  <div class="psec">Жители говорят</div>
  <div class="ppl">${people.map(x=>`<div class="pp">${face(x.r,52,moodOf(x.hit))}<div><b>${x.r.who}</b><i>«${x.hit?x.r.thanks:x.r.complain}»</i></div></div>`).join('')}</div>
  <div class="pfoot"><div><div class="psec">Мэр недели</div><b>${S.final.title}</b><br><small>${S.final.arch.d}</small></div><div class="wthr">${smile(S.happy)}<div><div class="psec">Прогноз</div><b>${fc[0]}</b><br><small>${fc[1]}</small></div></div></div>
  </div>`}
function wrap(x,text,maxW){const words=text.split(' '),lines=[];let cur='';words.forEach(w=>{const t=cur?cur+' '+w:w;if(x.measureText(t).width>maxW&&cur){lines.push(cur);cur=w}else cur=t});if(cur)lines.push(cur);return lines}
function finale(){
  hide();
  const sc=score(),pts=total(sc),stars=CFG.stars.filter(x=>pts>=x).length,inc=income();
  const arch=archetype(),title=arch.t,news=headlines();
  const ins=[];
  ins.push(`Ты выполнил <b>${S.hearts} из ${CFG.days}</b> просьб жителей — это ${HEART} +${S.hearts*CFG.heartPoints} очков.`);
  if(S.st.shopSpent)ins.push(`Магазины стоили <b>${mon(S.st.shopSpent)}</b>, а принесли <b>${mon(S.st.shopEarned)}</b>.${S.st.shopEarned>=S.st.shopSpent?' Вложение окупилось!':' Чем раньше строишь, тем быстрее окупается.'}`);
  else ins.push('Магазины приносят доход каждый день. Чем раньше их построить, тем больше заработаешь.');
  if(S.st.festSpent)ins.push(`Фестиваль: вложил <b>${S.st.festSpent}</b>, получил <b>${S.st.festEarned}</b>. ${S.st.festEarned>S.st.festSpent?'Хорошее вложение!':''}`);
  else ins.push(`Фестиваль мог принести ${CFG.festBonus*CFG.festDays} монеток за ${CFG.festCost}. Иногда вкладываться выгодно.`);
  ins.push(S.st.storm==='paid'?'После ветра хватило денег на ремонт — запас пригодился.':'На ремонт после ветра не хватило запаса. Оставляй монетки на неожиданности.');
  const prev=sessionBest,fresh=pts>prev;if(fresh)sessionBest=pts;
  const record=prev>0&&fresh?`Новый лучший результат: ${pts}`:prev>0&&pts<prev?`Сейчас ${pts} · лучший результат ${sessionBest}`:`Лучший результат: ${sessionBest}`;
  S.final={pts,stars,title,arch,news};const paper=paperHTML(news);
  $('result').innerHTML=`<div class="rhead"><div class="stars">${'★'.repeat(stars)}<span>${'★'.repeat(3-stars)}</span></div><h1>${stars>=2?'Отлично!':'Неплохо!'}</h1><div style="font-size:17px;font-weight:700">${esc(S.city)} · ${pts} очков</div><div class="record">${record}</div><p class="learnline">${LEARN.line}</p></div>
  <div class="rpanel np">${paper}
  <div class="actions"><button class="btn primary" data-act="card">Поделиться газетой</button></div></div>
  <div class="rpanel"><div class="score">${pts} очков</div>
    <div class="rrow"><span>${smile(S.happy)} Счастье</span><b>+${sc.happy}</b></div>
    <div class="rrow"><span>${PEOPLE} Жители: ${S.people}</span><b>+${sc.people}</b></div>
    <div class="rrow"><span>${HEART} Просьбы жителей: ${S.hearts} из ${CFG.days}</span><b>+${sc.hearts}</b></div>
    <div class="rrow"><span><i class="coin"></i> Бюджет: ${S.coins}</span><b>+${sc.coins}</b></div>
    <div class="rrow"><span>Доход города в день</span><b>${inc.tax+inc.shop-inc.upkeep}${COIN}</b></div>
  </div>
  <div class="rpanel"><b>Что получилось</b><ul class="ins">${ins.map(x=>`<li>${x}</li>`).join('')}</ul>
  <div class="actions"><button class="btn secondary" data-act="again">Построить город заново</button><button class="btn ghost" data-act="home">В меню</button></div></div>`;
  $('result').classList.remove('hidden');$('result').scrollTop=0;sfx.win();
  if(S.hearts>0)markLearned();
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
    x.fillStyle='#6b6252';x.font=`700 18px ${sys}`;x.textAlign='left';x.fillText('ВЫПУСК №'+CFG.days,L,66);x.textAlign='right';x.fillText('ЦЕНА: 1 МОНЕТКА',R,66);
    x.fillStyle='#2b2b2b';x.fillRect(L,78,R-L,2);
    x.textAlign='center';x.fillStyle='#1d1a14';x.font=`900 50px ${ser}`;x.fillText('Вестник «'+esc(S.city)+'»',W/2,138);
    x.fillRect(L,156,R-L,3);x.fillRect(L,163,R-L,1.5);
    x.font=`bold 40px ${ser}`;const hl=wrap(x,f.news[0],R-L).slice(0,3);hl.forEach((l,k)=>x.fillText(l,W/2,214+k*46));
    let y=214+hl.length*46-10;
    const ph=420;x.fillStyle='#d9cfb8';x.fillRect(L,y,R-L,ph);
    if(withCity&&city){const iw=city.naturalWidth,ih=city.naturalHeight,sh=iw*ph/(R-L);x.drawImage(city,0,ih*.3,iw,sh,L,y,R-L,ph)}
    x.strokeStyle='#2b2b2b';x.lineWidth=2;x.strokeRect(L,y,R-L,ph);
    y+=ph+30;x.fillStyle='#6b6252';x.font=`italic 20px ${ser}`;x.textAlign='left';x.fillText(esc(S.city)+' сегодня. Фото редакции',L,y);
    y+=22;x.fillStyle='#2b2b2b';x.fillRect(L,y,R-L,2);y+=34;
    x.fillStyle='#7b4cf0';x.font=`900 18px ${sys}`;x.fillText('ЖИТЕЛИ ГОВОРЯТ',L,y);y+=16;
    people.forEach((p,k)=>{const fi=faces[k];if(fi)x.drawImage(fi,L,y,92,92);
      x.fillStyle='#1d1a14';x.font=`800 22px ${sys}`;x.fillText(p.r.who,L+100,y+28);
      x.font=`italic 24px ${ser}`;wrap(x,'«'+(p.hit?p.r.thanks:p.r.complain)+'»',R-L-100).slice(0,2).forEach((l,j)=>x.fillText(l,L+100,y+58+j*28));
      y+=106});
    y=Math.max(y+4,H-150);x.fillStyle='#2b2b2b';x.fillRect(L,y,R-L,2);
    x.textAlign='left';x.fillStyle='#7b4cf0';x.font=`900 18px ${sys}`;x.fillText('МЭР НЕДЕЛИ',L,y+34);
    x.fillStyle='#1d1a14';x.font=`bold 28px ${ser}`;x.fillText(f.title,L,y+70);
    x.textAlign='right';x.fillStyle='#f2a91f';x.font=`bold 44px ${sys}`;x.fillText('★'.repeat(f.stars)+'☆'.repeat(3-f.stars),R,y+50);
    x.fillStyle='#1d1a14';x.font=`900 26px ${sys}`;x.fillText(f.pts+' очков',R,y+86);
    x.textAlign='center';x.fillStyle='#6b6252';x.font=`600 20px ${sys}`;x.fillText('Построишь город лучше?',W/2,H-44);
    try{return {cv,url:cv.toDataURL('image/jpeg',.85)}}catch(e){return null}
  };
  const res=draw(true)||draw(false)||{cv:null,url:''};
  S.cardCanvas=res.cv;S.cardUrl=res.url;
  show(`<h2>Газета для друзей</h2>${res.url?`<img class="cardimg" src="${res.url}" alt="Газета твоего города">`:''}<div class="actions"><button class="btn primary" data-act="share">Отправить друзьям</button><button class="btn secondary" data-act="close">Назад</button></div>`);
}
function share(){
  const text=`Мой город «${esc(S.city)}»: ${S.final.pts} очков. Я — ${S.final.title}! Построишь лучше?`;
  post('SHARING_EVENT',{text,image:S.cardUrl||undefined});vibrate();
}

/* ================= ОБЩЕЕ ================= */
function show(html){const playing=S&&$('result').classList.contains('hidden');$('toast').classList.remove('show');$('dialog').innerHTML=html+(playing?'<div class="actions"><button class="btn ghost" data-act="askLeave">В меню</button></div>':'');$('shade').classList.add('show');$('dialog').scrollTop=0}
function hide(){$('shade').classList.remove('show')}
let tt;function toast(m){const t=$('toast');t.innerHTML=m;t.classList.add('show');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('show'),1900)}
function randomName(){return CITY_NAMES[Math.floor(Math.random()*CITY_NAMES.length)]}
function nameDialog(){show(`<div class="kicker">НОВЫЙ ГОРОД</div><h2>Как назовём твой город?</h2><input id="cityName" class="namein" maxlength="16" value="${randomName()}" aria-label="Название города"><p class="lvl">Название попадёт в газету и на карточку для друзей</p><div class="actions"><button class="btn big2" style="width:100%;font-size:19px;padding:17px" data-act="go">Основать город <span class="arr">→</span></button><button class="btn secondary" data-act="rename">Другое название</button></div>`)}
function help(){show(`<h2>Как играть</h2><p class="learnline"><b>${LEARN.line}</b></p><ul class="howto"><li>Ты мэр города на <b>7 дней</b>.</li><li>Жми на значок над зданием и <b>улучшай</b> его. В день — 2 улучшения.</li><li>Улучшение стоит монетки, а потом <b>1 монетку в день</b> на уход.</li><li>Помоги жителю дня — получишь ${HEART} <b>сердечко</b>.</li><li>Вечером считаем: <b>налоги и магазины − уход = прибыль</b>.</li></ul>
<div class="actions"><button class="btn primary" data-act="close">Понятно</button></div>`)}
function toggleSfx(){sfxOn=!sfxOn;soundIcons();if(sfxOn){primeAudio(true);sfx.pop()}}
function toggleMusic(){primeAudio(true);if(musicOn&&!music.timer){startMusic();return}musicOn=!musicOn;soundIcons();if(musicOn)startMusic();else stopMusic()}
function post(type,extra){try{window.postMessage(Object.assign({type},extra||{}),'*')}catch(e){}}
function vibrate(){post('VIBRATION_EVENT')}
let completedSent=false;
function markLearned(){if(completedSent)return;completedSent=true;post('COMPLETED_EVENT')}
function exitGame(){post('CLOSE_EVENT')}
function askLeave(){if(!S){exitGame();return}$('confirmText').textContent=sessionBest?'Этот город начнётся сначала. Ничего страшного. Лучший законченный результат останется в меню, пока игра открыта.':'Этот город начнётся сначала. Ничего страшного — можно сразу играть снова.';$('confirm').classList.add('show')}
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
  <div class="sbar2"><button class="icon" data-act="exit" aria-label="Выйти">✕</button><div class="audio"><button class="icon" data-act="sfx" data-sfx aria-label="Звуковые эффекты"></button><button class="icon" data-act="music" data-music aria-label="Музыка"></button></div></div>
  <div class="logo2"><div class="bob">${logoSVG()}</div><div class="tag2">Стань мэром и управляй бюджетом</div></div>
  <div class="cta2">${sessionBest?`<div class="best">Лучший результат: ${sessionBest}</div>`:''}<button class="big2" data-act="start">Начать игру <span class="arr">→</span></button><button class="pill2" data-act="help"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#1c0f4a" stroke-width="2.4" stroke-linecap="round"><circle cx="12" cy="12" r="9.5"/><path d="M12 6.5V12l3.5 2.5"/></svg>5–10 минут · как играть</button></div>`;
  soundIcons();
}
function openStart(){
  const st=$('start');if(st.classList.contains('opening'))return;
  st.classList.add('opening');beep(330,.5,'sine');setTimeout(()=>beep(660,.4,'sine'),180);vibrate();
  setTimeout(nameDialog,1150);
}
document.addEventListener('click',e=>{
  const el=e.target.closest('[data-act]');if(!el||el.disabled)return;
  const a=el.getAttribute('data-act'),v=el.getAttribute('data-v');
  if(a!=='sfx'&&a!=='music'&&a!=='exit'&&a!=='help')primeAudio();
  switch(a){
    case 'start':openStart();break;
    case 'again':newGame(S.city);break;
    case 'rename':$('cityName').value=randomName();break;
    case 'go':newGame(esc($('cityName').value.trim()).slice(0,16)||'Солнечноград');break;
    case 'home':S=null;toStart();$('start').classList.remove('hidden');break;
    case 'help':help();break;
    case 'close':hide();break;
    case 'startday':hide();{const q=$('req');q.classList.remove('pop');void q.offsetWidth;q.classList.add('pop')}break;
    case 'b':openB(v);break;
    case 'req':if(S){const r=today();show(`<div class="quote">${face(r,54)}<div><b>${r.name}</b><p>«${r.text}»</p></div></div><p>${S.reqDone?'Просьба выполнена — спасибо, мэр!':'Подумай, какое здание поможет. Найди его в городе и поддержи.'}</p><div class="actions"><button class="btn primary" data-act="close">Понятно</button></div>`)}break;
    case 'support':support(v);break;
    case 'closeSheet':closeSheet();break;
    case 'evening':evening();break;
    case 'next':nextDay();break;
    case 'final':finale();break;
    case 'fest':fest(v==='yes');break;
    case 'storm':storm(v==='yes');break;
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
$('confirm').addEventListener('click',e=>{if(e.target===$('confirm'))hideConfirm()});
soundIcons();
toStart();
