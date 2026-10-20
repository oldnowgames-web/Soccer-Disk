const cv=document.getElementById('c'),g=cv.getContext('2d'),$=id=>document.getElementById(id);
const FONT="'Lilita One','Trebuchet MS','Arial Black',sans-serif";
const W=1000,H=620,L=60,R=940,T=44,B=576,GM=310,GY1=235,GY2=385,GD=50,PR=6;
const cfg={diff:1,goals:5,dsk:0,bsk:0,snd:true,vol:1,shake:true,fmt:1};
const DSK=[{n:'Azul',c:['#7fb2ff','#2f7bff','#123f99'],p:''},{n:'Verde Listrado',c:['#8af0a0','#22b455','#0d6a2b'],p:'s'},{n:'Amarelo',c:['#fff08a','#f5c518','#a07a00'],p:''},{n:'Roxo Pontilhado',c:['#d3a5ff','#8a3ffc','#4a1a99'],p:'d'},{n:'Laranja Faixa',c:['#ffc58a','#ff8a1f','#a14a00'],p:'h'},{n:'Preto Listrado',c:['#8a8f98','#2a2e35','#0b0d10'],p:'s'}];
const BSK=[{n:'Clássica',w:'#fff',k:'#1b1b1b'},{n:'Dourada',w:'#ffe27a',k:'#8a5a00'},{n:'Neon',w:'#d6ff4a',k:'#2a3b00'},{n:'Rosa',w:'#ffd0ea',k:'#c2187a'}];
let bodies=[],ball,turn=0,phase='idle',score=[0,0],drag=null,aiTimer=0,playing=false,paused=false,goalT=0,goalInfo=null,conf=[],t0=0,setBack='menu';
function mk(x,y,r,m,team,n){return{x,y,vx:0,vy:0,r,m,team,n,a:0}}
function setup(starter){
  bodies=[];
  [[115,310],[250,190],[250,430],[390,240],[390,380]].forEach((p,i)=>{bodies.push(mk(p[0],p[1],26,3,0,i+1));bodies.push(mk(W-p[0],p[1],26,3,1,i+1))});
  ball=mk(500,310,14,1,-1,0);bodies.push(ball);
  turn=starter;phase='idle';drag=null;aiTimer=50;setMsg();
}
function setMsg(){$('msg').textContent=mode=='local'?(turn==0?'Vez do Jogador 1':'Vez do Jogador 2'):turn==0?'Sua vez!':'Vez da CPU…'}
function upd(){$('sb').textContent=score[0];$('sr').textContent=score[1]}
function show(n){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('on'));if(n)$('s-'+n).classList.add('on')}
function seg(id,opts,key){const el=$(id);el.innerHTML='';opts.forEach(o=>{const b=document.createElement('button');b.textContent=o[0];if(cfg[key]===o[1])b.className='sel';b.onclick=()=>{cfg[key]=o[1];seg(id,opts,key)};el.appendChild(b)})}
function buildSet(){seg('g-diff',[['Fácil',0],['Normal',1],['Difícil',2]],'diff');seg('g-goals',[['3',3],['5',5],['7',7]],'goals');seg('g-snd',[['Ligado',true],['Desligado',false]],'snd');seg('g-vol',[['Baixo',0],['Médio',1],['Alto',2]],'vol');seg('g-shake',[['Ligado',true],['Desligado',false]],'shake');seg('g-fmt',[['1v1',1],['2v2',2],['3v3',3]],'fmt');seg('g-goals2',[['3',3],['5',5],['7',7]],'goals');$('b-tut').textContent='Rever tutorial'}
function buildSkins(){
  const mkRow=(id,list,key,bg)=>{const el=$(id);el.innerHTML='';list.forEach((s,i)=>{const b=document.createElement('button');b.className='sk'+(cfg[key]==i?' sel':'');b.innerHTML='<i style="background:'+bg(s)+'"></i>'+s.n;b.onclick=()=>{cfg[key]=i;buildSkins();tint()};el.appendChild(b)})};
  mkRow('g-dsk',DSK,'dsk',s=>'radial-gradient(circle at 35% 30%,'+s.c[0]+','+s.c[1]+' 55%,'+s.c[2]+')');
  mkRow('g-bsk',BSK,'bsk',s=>'radial-gradient(circle at 35% 30%,#fff,'+s.w+' 45%,'+s.k+' 160%)');
}
function tint(){const e=document.querySelector('.blue'),c=DSK[cfg.dsk].c;e.style.color=c[0];e.style.webkitTextStroke='1.5px '+c[2];e.style.paintOrder='stroke fill'}
$('b-skins').onclick=()=>{buildSkins();show('skins')};$('b-sback').onclick=()=>show('menu');
function start(){score=[0,0];upd();conf=[];playing=true;paused=false;setup(0);show(null);$('pz').style.visibility='visible';$('pz').textContent='⏸ Pausa';$('kb').classList.remove('on');$('ln').textContent=nm()[0];$('rn').textContent=nm()[1];snd('whistle');tutSet(tutDone||mode!='cpu'?-1:0)}
function toMenu(){if(mode=='online'){netLeave();mode='cpu'}$('kb').classList.remove('on');tutSet(-1);conf=[];playing=false;paused=false;$('pz').style.visibility='hidden';$('msg').textContent='';show('menu')}
function pause(){if(!playing||paused||mode=='online'||phase=='over')return;paused=true;drag=null;show('pause')}
function resume(){paused=false;show(null)}
const toPrep=()=>{buildSet();$('row-diff').style.display=mode=='cpu'?'':'none';$('b-again').style.display='';show('prep')};$('b-play').onclick=()=>{goFull();show('mode')};$('b-again').onclick=toPrep;$('m-cpu').onclick=()=>{mode='cpu';toPrep()};$('m-loc').onclick=()=>{mode='local';toPrep()};$('m-on').onclick=()=>{buildSet();$('on-msg').textContent='';show('online')};$('m-back').onclick=()=>show('menu');$('b-start').onclick=start;$('b-pback').onclick=()=>show('mode');
$('b-set').onclick=()=>{setBack='menu';buildSet();show('set')};
$('b-pset').onclick=()=>{setBack='pause';buildSet();show('set')};
$('b-back').onclick=()=>show(setBack);
$('b-cont').onclick=resume;$('b-pmenu').onclick=toMenu;$('b-emenu').onclick=toMenu;$('pz').onclick=()=>mode=='online'?toMenu():pause();
addEventListener('keydown',e=>{if(e.key=='Escape'){paused?resume():pause()}});
let AC=null,shk=0,lastImp=0,tut=-1,tutDone=false,mode='cpu',inp={x:0,y:0},chg=[],me=0,lob=[];
try{tutDone=localStorage.getItem('sd_tut')=='1'}catch(e){}
const VOL=[.35,.7,1];
function ac(){if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)()}catch(e){}}if(AC&&AC.state=='suspended')AC.resume();return AC}
function tone(f,d,type,v,slide,delay){if(!cfg.snd)return;const a=ac();if(!a)return;const t=a.currentTime+(delay||0),o=a.createOscillator(),gn=a.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,f*slide),t+d);gn.gain.setValueAtTime((v||.2)*VOL[cfg.vol],t);gn.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(gn);gn.connect(a.destination);o.start(t);o.stop(t+d+.02)}
function noise(d,v,fq,delay,type){if(!cfg.snd)return;const a=ac();if(!a)return;const n=Math.floor(a.sampleRate*d),buf=a.createBuffer(1,n,a.sampleRate),dt=buf.getChannelData(0);for(let i=0;i<n;i++)dt[i]=(Math.random()*2-1)*(1-i/n);const s=a.createBufferSource();s.buffer=buf;const f=a.createBiquadFilter();f.type=type||'lowpass';f.frequency.value=fq;const gn=a.createGain();gn.gain.value=v*VOL[cfg.vol];s.connect(f);f.connect(gn);gn.connect(a.destination);s.start(a.currentTime+(delay||0))}
function snd(n,s){
  const now=performance.now();
  if(n=='hit'||n=='wall'){if(now-lastImp<70)return;lastImp=now}
  switch(n){
    case'click':tone(700,.06,'square',.06);break;
    case'kick':tone(170,.14,'sine',.55,.4);noise(.08,.3,900);break;
    case'hit':tone(260+s*260,.07,'triangle',.15+.35*s,.5);noise(.04,.1+.2*s,1800);break;
    case'wall':tone(130,.09,'sine',.3,.6);break;
    case'post':tone(1250,.4,'sine',.3);tone(1880,.3,'sine',.15);break;
    case'goal':noise(2.2,.35,1400,0,'bandpass');[523,659,784,1047].forEach((f,i)=>tone(f,.3,'square',.1,0,i*.12));tone(1047,.7,'square',.1,0,.5);break;
    case'whistle':tone(2300,.18,'sine',.2);tone(2300,.4,'sine',.2,0,.22);break;
    case'win':[523,659,784,1047,1319].forEach((f,i)=>tone(f,.25,'triangle',.25,0,i*.13));break;
    case'lose':[392,349,311,262].forEach((f,i)=>tone(f,.3,'sawtooth',.12,0,i*.2));break;
  }
}
function tutSet(n){
  tut=n;const t=$('tip');
  if(n<0){t.style.display='none';return}
  t.style.display='block';
  $('tip-t').textContent=['👆 Toque no disco brilhante, puxe para trás e solte. Quanto mais puxar, mais forte o chute!','⚽ Isso! Veja a bola rolar. Marque no gol da direita →','🔁 Os turnos se alternam com a CPU. Fez gol, ganha ponto. Boa sorte!'][n];
  $('tip-b').style.display=n==2?'inline-block':'none';
}
function tutEnd(){tutSet(-1);tutDone=true;try{localStorage.setItem('sd_tut','1')}catch(e){}}
$('tip-b').onclick=tutEnd;$('tip-s').onclick=tutEnd;
$('b-tut').onclick=()=>{tutDone=false;try{localStorage.removeItem('sd_tut')}catch(e){}$('b-tut').textContent='✔ Aparece na próxima partida'};
function tutDraw(ts){
  if(tut<0||paused||!playing)return;
  const k=ts/1000;
  if(tut==0&&phase=='idle'){
    const d=bodies.find(b=>b.team==0&&b.n==4);if(!d)return;
    const a=Math.atan2(ball.y-d.y,ball.x-d.x),pull=15+90*Math.min(1,((k%2)/2)*1.5);
    g.save();g.strokeStyle='#ffd23f';g.lineWidth=4;g.beginPath();g.arc(d.x,d.y,d.r+9+Math.sin(k*6)*3,0,7);g.stroke();
    g.setLineDash([8,8]);g.strokeStyle='rgba(255,255,255,.9)';g.beginPath();g.moveTo(d.x,d.y);g.lineTo(d.x+Math.cos(a)*160,d.y+Math.sin(a)*160);g.stroke();g.setLineDash([]);
    g.strokeStyle='#ffd23f';g.lineWidth=7;g.lineCap='round';g.beginPath();g.moveTo(d.x,d.y);g.lineTo(d.x-Math.cos(a)*pull,d.y-Math.sin(a)*pull);g.stroke();
    g.font='38px serif';g.textAlign='center';g.textBaseline='middle';g.fillText('👆',d.x-Math.cos(a)*pull,d.y-Math.sin(a)*pull+18);
    g.restore();
  }else if(tut==1){
    g.save();g.strokeStyle='#ffd23f';g.lineWidth=5;g.shadowColor='#ffd23f';g.shadowBlur=12+Math.sin(k*6)*8;g.strokeRect(R,GY1,GD,GY2-GY1);
    g.font='40px '+FONT;g.fillStyle='#ffd23f';g.textAlign='center';g.fillText('GOL',R+GD/2,GY1-12);g.restore();
  }
}
// ===== Multiplayer em tempo real (PeerJS) =====
function nm(){return mode=='cpu'?['Você','CPU']:mode=='local'?['Jogador 1','Jogador 2']:['Azul','Vermelho']}
const PFX='soccerdisk-',ACC=.22,KM={w:[0,-1],arrowup:[0,-1],s:[0,1],arrowdown:[0,1],a:[-1,0],arrowleft:[-1,0],d:[1,0],arrowright:[1,0]},touch=('ontouchstart' in window)||navigator.maxTouchPoints>0;
let dbg=false,rxN=0,peer=null,hostConn=null,isHost=false,rt=null,nextId=1,keys={},stick={x:0,y:0},kickReq=false,lastSend=0,acc=0,lastTs=0,sp=null,roomCode='',hostTry=0;
function layout(teams){const P={1:[[250,310]],2:[[200,230],[200,390]],3:[[130,310],[270,200],[270,420]]},n=Math.max(1,teams.filter(t=>t==0).length),c=[0,0];return teams.map(t=>{const q=P[n][c[t]++];return[t==0?q[0]:W-q[0],q[1]]})}
function buildOnline(teams){const c=[0,0];bodies=teams.map(t=>mk(0,0,24,3,t,2+c[t]++));ball=mk(500,310,14,1,-1,0);bodies.push(ball);const ps=layout(teams);ps.forEach((q,i)=>{bodies[i].x=q[0];bodies[i].y=q[1]})}
function beginOnline(){mode='online';score=[0,0];upd();conf=[];playing=true;paused=false;phase='rt';turn=0;chg=[];$('ln').textContent='Azul';$('rn').textContent='Vermelho';$('b-again').style.display='none';$('pz').style.visibility='visible';$('pz').textContent='Sair';$('msg').textContent='';$('kb').classList.toggle('on',touch);try{document.activeElement&&document.activeElement.blur();window.focus()}catch(e){}show(null);snd('whistle');tutSet(-1)}
function bcast(m){lob.forEach(x=>{if(x.conn&&x.conn.open)x.conn.send(m)})}
function sfx(n){snd(n,.8);bcast({t:'x',n})}
function rtStart(){
  const n=cfg.fmt;rt={players:[],score:[0,0],goals:cfg.goals,ph:'play',gt:0};
  for(let t=0;t<2;t++){const hs=lob.filter(m=>m.team==t&&!m.gone);for(let i=0;i<n;i++){const m=hs[i]||null;rt.players.push({team:t,m,bot:!m,in:{x:0,y:0},kick:false,charge:0,body:null})}}
  const teams=rt.players.map(p=>p.team);buildOnline(teams);rt.players.forEach((p,i)=>p.body=bodies[i]);
  me=rt.players.findIndex(p=>p.m===lob[0]);
  lob.forEach(m=>{if(m.conn)m.conn.send({t:'start',teams,me:rt.players.findIndex(p=>p.m===m)})});
  beginOnline();
}
function botAI(p){
  const b=p.body,dir=p.team==0?1:-1,tgx=p.team==0?R+30:L-30,ownx=p.team==0?L:R,mates=rt.players.filter(q=>q.team==p.team);
  const near=mates.slice().sort((a,c)=>Math.hypot(ball.x-a.body.x,ball.y-a.body.y)-Math.hypot(ball.x-c.body.x,ball.y-c.body.y));
  const dB=Math.hypot(ball.x-b.x,ball.y-b.y);let tx,ty;
  if(near[0]===p){
    let gx=tgx-ball.x,gy=GM-ball.y;const gl=Math.hypot(gx,gy)||1;gx/=gl;gy/=gl;
    const bx=ball.x-gx*(b.r+ball.r+4),by=ball.y-gy*(b.r+ball.r+4);
    if(Math.hypot(bx-b.x,by-b.y)<26||dB<b.r+ball.r+8){tx=tgx;ty=GM}else{tx=bx;ty=by}
    p.kick=dB<b.r+ball.r+6&&p.charge>.55&&(Math.abs(tgx-b.x)<340||p.charge>.95)&&Math.random()<.08;
  }else{tx=ownx+dir*(120+mates.indexOf(p)*70);ty=GM+(ball.y-GM)*.55;p.kick=false}
  const dx=tx-b.x,dy=ty-b.y,l=Math.hypot(dx,dy);p.in=l>10?{x:dx/l*.9,y:dy/l*.9}:{x:0,y:0};
}
function goalFx(s){confetti(s==1?0:1);snd('goal');shk=24;goalInfo={by:s};goalT=0;phase='goal'}
function endOnline(s){phase='over';$('end-t').textContent='🏆 '+nm()[s]+' venceu!';$('b-again').style.display='none';snd(s==0?'win':'lose');setTimeout(()=>{if(phase=='over')show('end')},900)}
function rtReset(){
  const ps=layout(rt.players.map(p=>p.team));
  rt.players.forEach((p,i)=>{p.body.x=ps[i][0];p.body.y=ps[i][1];p.body.vx=p.body.vy=0;p.charge=0});
  ball.x=500;ball.y=310;ball.vx=ball.vy=0;
  const s=goalInfo.by;
  if(rt.score[s]>=rt.goals){rt.ph='over';bcast({t:'end',w:s});endOnline(s);return}
  rt.ph='play';phase='rt';bcast({t:'rs'});
}
function rtStep(){
  if(rt.ph=='over')return;
  if(rt.ph=='goal'&&++rt.gt>150){rtReset();if(rt.ph=='over')return}
  for(const p of rt.players){
    const b=p.body;let m=p.m;
    if(m&&m.gone){p.m=null;p.bot=true;m=null}
    if(p.bot)botAI(p);
    const iv=m?m.in:p.in,ix=iv.x,iy=iv.y,l=Math.hypot(ix,iy);
    if(l>0){b.vx+=ix/Math.max(1,l)*ACC;b.vy+=iy/Math.max(1,l)*ACC}
    const dx=ball.x-b.x,dy=ball.y-b.y,d=Math.hypot(dx,dy),con=d<b.r+ball.r+5;
    p.charge=con?Math.min(1,p.charge+1/72):Math.max(0,p.charge-1/18);
    const k=m?m.kick:p.kick;if(m)m.kick=false;
    if(k&&con){
      let ux=dx/(d||1),uy=dy/(d||1);
      if(l>0){ux+=ix/l*.6;uy+=iy/l*.6;const q=Math.hypot(ux,uy)||1;ux/=q;uy/=q}
      const v=6+p.charge*19;ball.vx=ux*v;ball.vy=uy*v;p.charge=0;sfx('kick');
    }
  }
  for(const b of bodies){b.vx/=4;b.vy/=4}
  for(let k=0;k<4;k++)step();
  for(const b of bodies){b.vx*=4;b.vy*=4}
  ball.a+=Math.hypot(ball.vx,ball.vy)/ball.r*(ball.vx>=0?1:-1);
  if(rt.ph=='play'&&(ball.x<L-ball.r*.5||ball.x>R+ball.r*.5)){
    const s=ball.x<L?1:0;rt.score[s]++;score=rt.score.slice();upd();rt.ph='goal';rt.gt=0;goalFx(s);bcast({t:'goal',by:s,sc:score});
  }
  chg=rt.players.map(p=>Math.round(p.charge*100)/100);
}
function readInput(){let x=0,y=0;for(const k in keys){x+=KM[k][0];y+=KM[k][1]}x+=stick.x;y+=stick.y;inp={x:Math.max(-1,Math.min(1,x)),y:Math.max(-1,Math.min(1,y))}}
function rtTick(ts){
  const dt=Math.min(100,ts-(lastTs||ts));lastTs=ts;readInput();
  if(isHost&&rt){
    lob[0].in=inp;if(kickReq){lob[0].kick=true;kickReq=false}
    acc+=dt;let n=0;while(acc>=16.67&&n<4){rtStep();acc-=16.67;n++}if(acc>50)acc=0;
    if(ts-lastSend>33){lastSend=ts;bcast({t:'s',p:bodies.map(b=>[Math.round(b.x*10)/10,Math.round(b.y*10)/10]),a:ball.a,c:chg})}
  }else if(!isHost){
    
    for(const b of bodies){if(b.tx){b.x+=(b.tx.x-b.x)*.5;b.y+=(b.tx.y-b.y)*.5}}
  }
  if(phase=='goal')goalT++;
}
function rtDraw(){
  if(mode!='online'||!playing||!bodies.length)return;
  if(sp&&sp.c){const R2=45*W/cv.clientWidth;g.save();g.globalAlpha=.3;g.fillStyle='#fff';g.beginPath();g.arc(sp.c.x,sp.c.y,R2,0,7);g.fill();g.globalAlpha=.8;g.beginPath();g.arc(sp.c.x+stick.x*R2,sp.c.y+stick.y*R2,R2*.5,0,7);g.fill();g.restore()}
  bodies.forEach((b,i)=>{if(b===ball)return;const c=chg[i]||0;if(c>.02){g.fillStyle='rgba(0,0,0,.55)';g.fillRect(b.x-19,b.y-b.r-14,38,7);g.fillStyle='hsl('+(120-c*120)+',90%,50%)';g.fillRect(b.x-17,b.y-b.r-13,34*c,5)}});
  const m=bodies[me];if(!m)return;
  g.fillStyle='#ffd23f';g.beginPath();g.moveTo(m.x,m.y-m.r-18);g.lineTo(m.x-8,m.y-m.r-30);g.lineTo(m.x+8,m.y-m.r-30);g.closePath();g.fill();
  const c=chg[me]||0;g.fillStyle='rgba(0,0,0,.55)';g.fillRect(W/2-132,B-36,264,20);g.fillStyle='hsl('+(120-c*120)+',90%,50%)';g.fillRect(W/2-129,B-33,258*c,14);
  g.fillStyle='#fff';g.font='15px '+FONT;g.textAlign='center';g.fillText('FORÇA • ESPAÇO CHUTA',W/2,B-42);
  if(dbg){g.fillStyle='#fff';g.font='14px monospace';g.textAlign='left';g.fillText(isHost?('HOST | entradas dos convidados: '+lob.slice(1).map(m=>m.in.x.toFixed(1)+','+m.in.y.toFixed(1)).join(' | ')):('CONVIDADO | minha entrada: '+inp.x.toFixed(1)+','+inp.y.toFixed(1)+' | estados recebidos: '+rxN),70,64)}
}
function renderLobby(teams,size){const a=teams.filter(t=>t==0).length,c=teams.length-a;$('lb-list').innerHTML='<span class="blue">Azul '+a+'/'+size+'</span> × <span class="red">Vermelho '+c+'/'+size+'</span>'}
function showLobby(){$('lb-code').textContent=roomCode;$('lb-start').style.display=isHost?'':'none';$('lb-info').textContent=isHost?'Passe o código para seus amigos. Vagas vazias viram bots.':'Aguardando o anfitrião iniciar…';renderLobby(isHost?lob.map(m=>m.team):[],cfg.fmt);show('lobby')}
function lobBroadcast(){const teams=lob.map(m=>m.team);renderLobby(teams,cfg.fmt);bcast({t:'lob',teams,size:cfg.fmt})}
function netLeave(){const p=peer,h=hostConn,l=lob;peer=null;hostConn=null;lob=[];rt=null;isHost=false;try{l.forEach(m=>m.conn&&m.conn.close())}catch(e){}try{h&&h.close()}catch(e){}try{p&&p.destroy()}catch(e){}}
function netErr(m){netLeave();mode='cpu';playing=false;$('pz').style.visibility='hidden';$('kb').classList.remove('on');show('online');$('on-msg').textContent=m}
function peerOpts(){return {host:'0.peerjs.com',port:443,path:'/',secure:true,debug:0,config:{iceServers:[
  {urls:'stun:stun.l.google.com:19302'},
  {urls:'stun:stun1.l.google.com:19302'},
  {urls:'stun:openrelay.metered.ca:80'},
  {urls:'turn:openrelay.metered.ca:80',username:'openrelayproject',credential:'openrelayproject'},
  {urls:'turn:openrelay.metered.ca:443',username:'openrelayproject',credential:'openrelayproject'},
  {urls:'turn:openrelay.metered.ca:443?transport=tcp',username:'openrelayproject',credential:'openrelayproject'}
]}}}
function hostCreate(){
  if(typeof Peer=='undefined'){netErr('Não foi possível carregar o PeerJS.');return}
  netLeave();isHost=true;mode='online';
  const ch='ABCDEFGHJKMNPQRSTUVWXYZ23456789';roomCode='';for(let i=0;i<5;i++)roomCode+=ch[Math.floor(Math.random()*ch.length)];
  lob=[{team:0,id:0,conn:null,in:{x:0,y:0},kick:false}];$('on-msg').textContent='Criando sala…';
  const p=peer=new Peer(PFX+roomCode,peerOpts());
  const to=setTimeout(()=>{if(peer===p&&!p.open)netErr('Não foi possível conectar ao servidor de salas. O navegador ou a página onde o jogo está hospedado pode estar bloqueando a conexão.')},9000);
  p.on('open',()=>{clearTimeout(to);$('on-msg').textContent='';showLobby()});
  p.on('error',e=>{clearTimeout(to);if(peer!==p)return;if(e.type=='unavailable-id'&&hostTry++<4)hostCreate();else netErr('Erro ao criar a sala ('+e.type+').')});
  p.on('connection',c=>{c.on('open',()=>{
    const cnt=[0,0];lob.forEach(m=>cnt[m.team]++);
    if(rt||cnt[0]+cnt[1]>=cfg.fmt*2){c.send({t:'full'});setTimeout(()=>c.close(),400);return}
    const m={team:cnt[0]<=cnt[1]?0:1,id:nextId++,conn:c,in:{x:0,y:0},kick:false};lob.push(m);
    c.send({t:'hi',size:cfg.fmt,goals:cfg.goals});lobBroadcast();
    c.on('data',d=>{if(d&&d.t=='in'&&d.i){m.in={x:+d.i.x||0,y:+d.i.y||0};if(d.k)m.kick=true}});
    c.on('close',()=>{if(rt)m.gone=true;else{lob=lob.filter(x=>x!==m);lobBroadcast()}});
  })});
}
function guestJoin(code){
  if(typeof Peer=='undefined'){netErr('Não foi possível carregar o PeerJS.');return}
  netLeave();isHost=false;roomCode=code;$('on-msg').textContent='Conectando…';
  const p=peer=new Peer(peerOpts());
  const to=setTimeout(()=>{if(peer===p&&!(hostConn&&hostConn.open))netErr('Não foi possível conectar. Confira o código e a conexão com o servidor de salas.')},10000);
  p.on('open',()=>{const c=hostConn=p.connect(PFX+code,{reliable:true});
    c.on('open',()=>{clearTimeout(to);$('on-msg').textContent='';showLobby()});
    c.on('data',onGuest);
    c.on('close',()=>{if(peer===p)netErr('A conexão com a sala foi encerrada.')})});
  p.on('error',e=>{clearTimeout(to);if(peer!==p)return;netErr(e.type=='peer-unavailable'?'Sala não encontrada.':'Erro de conexão ('+e.type+').')});
}
function onGuest(d){
  if(!d)return;
  switch(d.t){
    case'hi':cfg.fmt=d.size;cfg.goals=d.goals;break;
    case'full':netErr('A sala está cheia.');break;
    case'lob':renderLobby(d.teams,d.size);break;
    case'start':buildOnline(d.teams);me=d.me;rt={};beginOnline();break;
    case's':rxN++;d.p.forEach((q,i)=>{const b=bodies[i];if(b)b.tx={x:q[0],y:q[1]}});if(ball)ball.a=d.a;chg=d.c||[];break;
    case'goal':score=d.sc.slice();upd();goalFx(d.by);break;
    case'rs':phase='rt';break;
    case'end':endOnline(d.w);break;
    case'x':snd(d.n,.8);break;
  }
}
addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(mode!='online'||!playing)return;if(e.key=='F3'){e.preventDefault();dbg=!dbg}if(KM[k]){keys[k]=true;e.preventDefault()}if(e.key==' '){e.preventDefault();if(!e.repeat)kickReq=true}});
addEventListener('keyup',e=>{delete keys[e.key.toLowerCase()]});
addEventListener('blur',()=>{keys={}});
cv.addEventListener('pointerdown',e=>{if(mode!='online'||!playing||e.pointerType!='touch')return;const p=pos(e);if(p.x>W*.55){kickReq=true;return}if(sp)return;sp={x:e.clientX,y:e.clientY,id:e.pointerId,c:p};cv.setPointerCapture(e.pointerId)});
cv.addEventListener('pointermove',e=>{if(!sp||e.pointerId!==sp.id)return;stick={x:Math.max(-1,Math.min(1,(e.clientX-sp.x)/45)),y:Math.max(-1,Math.min(1,(e.clientY-sp.y)/45))}});
const stickEnd=e=>{if(sp&&e.pointerId===sp.id){sp=null;stick={x:0,y:0}}};cv.addEventListener('pointerup',stickEnd);cv.addEventListener('pointercancel',e=>{stickEnd(e);drag=null});
$('kb').addEventListener('pointerdown',e=>{e.preventDefault();kickReq=true});
setInterval(()=>{if(mode=='online'&&playing&&!isHost&&hostConn&&hostConn.open){readInput();hostConn.send({t:'in',i:inp,k:kickReq});kickReq=false}},33);
$('o-create').onclick=hostCreate;
$('o-join').onclick=()=>{const c=$('code-in').value.trim().toUpperCase();if(c.length<4){$('on-msg').textContent='Digite o código da sala.';return}guestJoin(c)};
$('o-back').onclick=()=>{netLeave();mode='cpu';show('mode')};
$('lb-start').onclick=rtStart;
$('lb-leave').onclick=()=>{netLeave();mode='cpu';$('on-msg').textContent='';show('online')};
$('lb-code').onclick=()=>{try{navigator.clipboard.writeText(roomCode);$('lb-info').textContent='Código copiado!'}catch(e){}};
function pos(e){const r=cv.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height}}
cv.addEventListener('pointerdown',e=>{
  if(!playing||paused||mode=='online'||(turn!=0&&mode!='local')||phase!='idle')return;
  const p=pos(e);
  for(const b of bodies){if(b.team==turn&&Math.hypot(p.x-b.x,p.y-b.y)<b.r+Math.max(10,30*W/cv.clientWidth)){drag={b,x:p.x,y:p.y};cv.setPointerCapture(e.pointerId);break}}
});
cv.addEventListener('pointermove',e=>{if(drag){const p=pos(e);drag.x=p.x;drag.y=p.y}});
cv.addEventListener('pointerup',()=>{
  if(!drag)return;
  const dx=drag.b.x-drag.x,dy=drag.b.y-drag.y,d=Math.hypot(dx,dy);
  if(d>12)shoot(drag.b,dx,dy,Math.min(d,140)/140);
  drag=null;
});
function shoot(b,dx,dy,pw){const d=Math.hypot(dx,dy)||1;b.vx=dx/d*pw*20;b.vy=dy/d*pw*20;phase='moving';snd('kick',pw);if(tut==0)tutSet(1)}
function aiMove(){
  const c=bodies.filter(b=>b.team==1).sort((a,b)=>Math.hypot(a.x-ball.x,a.y-ball.y)-Math.hypot(b.x-ball.x,b.y-ball.y));
  const d=c[cfg.diff==2?0:Math.floor(Math.random()*(cfg.diff==0?4:2))];
  let gx=(L-30)-ball.x,gy=GM-ball.y;const gl=Math.hypot(gx,gy)||1;gx/=gl;gy/=gl;
  const tx=ball.x-gx*(d.r+ball.r),ty=ball.y-gy*(d.r+ball.r),dist=Math.hypot(tx-d.x,ty-d.y);
  const noise=[.38,.14,.04][cfg.diff];
  const ang=Math.atan2(ty-d.y,tx-d.x)+(Math.random()-.5)*noise;
  shoot(d,Math.cos(ang),Math.sin(ang),Math.min(1,.4+dist/420+Math.random()*.2));
}
function post(b,px,py){
  let dx=b.x-px,dy=b.y-py;const d=Math.hypot(dx,dy),m=b.r+PR;
  if(d<m&&d>0){dx/=d;dy/=d;b.x=px+dx*m;b.y=py+dy*m;const v=b.vx*dx+b.vy*dy;if(v<0){if(b===ball&&v<-.4)snd('post');b.vx-=1.9*v*dx;b.vy-=1.9*v*dy}}
}
function step(){
  for(const b of bodies){
    b.x+=b.vx;b.y+=b.vy;
    const f=b===ball?.9925:.987;b.vx*=f;b.vy*=f;
    if(Math.hypot(b.vx,b.vy)<.04){b.vx=0;b.vy=0}
    if(b===ball&&(b.x<L||b.x>R)){
      if(b.y<GY1+b.r){b.y=GY1+b.r;b.vy=Math.abs(b.vy)*.7}
      if(b.y>GY2-b.r){b.y=GY2-b.r;b.vy=-Math.abs(b.vy)*.7}
      if(b.x<L-GD+b.r){b.x=L-GD+b.r;b.vx=Math.abs(b.vx)*.35}
      if(b.x>R+GD-b.r){b.x=R+GD-b.r;b.vx=-Math.abs(b.vx)*.35}
    }else{
      if(b.y<T+b.r){b.y=T+b.r;b.vy=Math.abs(b.vy)*.9}
      if(b.y>B-b.r){b.y=B-b.r;b.vy=-Math.abs(b.vy)*.9}
      const open=b===ball&&b.y>GY1&&b.y<GY2;
      if(!open){
        if(b.x<L+b.r){b.x=L+b.r;b.vx=Math.abs(b.vx)*.9}
        if(b.x>R-b.r){b.x=R-b.r;b.vx=-Math.abs(b.vx)*.9}
      }
    }
    post(b,L,GY1);post(b,L,GY2);post(b,R,GY1);post(b,R,GY2);
  }
  for(let i=0;i<bodies.length;i++)for(let j=i+1;j<bodies.length;j++){
    const a=bodies[i],c=bodies[j];let dx=c.x-a.x,dy=c.y-a.y;const d=Math.hypot(dx,dy),mn=a.r+c.r;
    if(d<mn&&d>0){
      dx/=d;dy/=d;const ov=mn-d,tm=a.m+c.m;
      a.x-=dx*ov*c.m/tm;a.y-=dy*ov*c.m/tm;c.x+=dx*ov*a.m/tm;c.y+=dy*ov*a.m/tm;
      const rv=(c.vx-a.vx)*dx+(c.vy-a.vy)*dy;
      if(rv<0){const sI=Math.min(1,-rv*4/20);if(sI>.04)snd('hit',sI);if(sI>.6)shk=Math.max(shk,4);const im=-(1+(mode=='online'&&(a===ball||c===ball)?.25:.92))*rv/(1/a.m+1/c.m);a.vx-=im*dx/a.m;a.vy-=im*dy/a.m;c.vx+=im*dx/c.m;c.vy+=im*dy/c.m}
    }
  }
}
function confetti(side){
  const cols=['#ff3b3b','#ffd23f','#3fdc6a','#2f9bff','#ff6bd6','#ffffff','#ff9f1c'];
  const x=side==0?L-GD/2:R+GD/2,dir=side==0?1:-1;
  for(let i=0;i<170;i++){
    const a=(Math.random()-.5)*Math.PI*1.3,s=3+Math.random()*10;
    conf.push({x,y:GM+(Math.random()-.5)*80,vx:Math.cos(a)*s*dir,vy:Math.sin(a)*s-1.5,r:Math.random()*6,vr:(Math.random()-.5)*.5,w:6+Math.random()*7,h:4+Math.random()*5,c:cols[i%cols.length],l:150+Math.random()*60});
  }
}
function checkGoal(){
  if(ball.x<L-ball.r*.5||ball.x>R+ball.r*.5){
    const s=ball.x<L?1:0;score[s]++;upd();
    confetti(ball.x<L?0:1);snd('goal');shk=24;if(tut>=0)tutEnd();
    goalInfo={by:s};goalT=0;phase='goal';$('msg').textContent='';
  }
}
function endGoal(){
  const s=goalInfo.by;
  if(score[s]>=cfg.goals){phase='over';snd(s==0?'win':'lose');$('end-t').textContent='🏆 '+nm()[s]+' venceu!';setTimeout(()=>{if(phase=='over')show('end')},900);return}
  setup(s==0?1:0);
}
let barOn=false;
function loop(ts){
  t0=ts;
  if(barOn!==!!playing){barOn=!!playing;document.querySelector('.bar').style.display=barOn?'':'none';fit()}
  if(mode=='online'&&playing)rtTick(ts);if(playing&&!paused&&mode!='online'){
    if(phase=='moving'){
      for(const b of bodies){b.vx/=4;b.vy/=4}
      const pvx=ball.vx,pvy=ball.vy;for(let k=0;k<4;k++)step();if((pvx*ball.vx<0||pvy*ball.vy<0)&&Math.hypot(pvx,pvy)>.5)snd('wall');
      for(const b of bodies){b.vx*=4;b.vy*=4}
      ball.a+=Math.hypot(ball.vx,ball.vy)/ball.r*(ball.vx>=0?1:-1);
      checkGoal();
      if(phase=='moving'&&bodies.every(b=>!b.vx&&!b.vy)){turn=1-turn;phase='idle';aiTimer=50;setMsg();if(tut==1)tutSet(2)}
    }else if(phase=='idle'&&turn==1&&tut!=2&&mode=='cpu'){if(--aiTimer<=0)aiMove()}
    else if(phase=='goal'){goalT++;if(goalT>150)endGoal()}
  }
  if(!paused){for(const p of conf){p.x+=p.vx;p.y+=p.vy;p.vy+=.14;p.vx*=.985;p.vy*=.985;p.r+=p.vr;p.l--}conf=conf.filter(p=>p.l>0)}
  draw(ts);requestAnimationFrame(loop);
}
function drawGoal(x0,dir){
  // rede
  const x1=x0-dir*GD;
  g.save();g.beginPath();g.rect(Math.min(x0,x1),GY1,GD,GY2-GY1);g.clip();
  g.fillStyle='rgba(0,0,0,.38)';g.fillRect(Math.min(x0,x1),GY1,GD,GY2-GY1);
  g.strokeStyle='rgba(255,255,255,.45)';g.lineWidth=1;
  for(let x=Math.min(x0,x1);x<=Math.max(x0,x1);x+=8){g.beginPath();g.moveTo(x,GY1);g.lineTo(x,GY2);g.stroke()}
  for(let y=GY1;y<=GY2;y+=8){g.beginPath();g.moveTo(Math.min(x0,x1),y);g.lineTo(Math.max(x0,x1),y);g.stroke()}
  g.restore();
  g.strokeStyle='#f4f4f4';g.lineWidth=5;g.lineJoin='round';
  g.beginPath();g.moveTo(x0,GY1);g.lineTo(x1,GY1);g.lineTo(x1,GY2);g.lineTo(x0,GY2);g.stroke();
}
function drawPost(x,y){
  const gr=g.createRadialGradient(x-2,y-2,1,x,y,PR+2);gr.addColorStop(0,'#fff');gr.addColorStop(1,'#9aa4ad');
  g.beginPath();g.arc(x,y,PR+1,0,7);g.fillStyle=gr;g.fill();g.strokeStyle='#5b656e';g.lineWidth=1.5;g.stroke();
}
function field(){
  g.fillStyle='#0d1b14';g.fillRect(0,0,W,H);
  // placas de publicidade
  const ads=['#e63946','#ffd23f','#2f7bff','#3fdc6a'];
  for(let i=0;i<10;i++){const x=L-GD+i*((R-L+2*GD)/10),w=(R-L+2*GD)/10;
    [[6,24],[H-30,24]].forEach(([y,h])=>{g.fillStyle=ads[i%4];g.fillRect(x+1,y,w-2,h);g.fillStyle=i%4==1?'#222':'#fff';g.font='16px '+FONT;g.textAlign='center';g.fillText('SOCCER DISK',x+w/2,y+18)})}
  // gramado
  const sw=(R-L)/11;
  for(let i=0;i<11;i++){g.fillStyle=i%2?'#2e9a4c':'#36ab57';g.fillRect(L+i*sw,T,sw+1,B-T)}
  g.fillStyle='#2e9a4c';g.fillRect(L-GD,T,GD,B-T);g.fillRect(R,T,GD,B-T);
  const v=g.createRadialGradient(W/2,H/2,150,W/2,H/2,560);v.addColorStop(0,'rgba(255,255,255,.07)');v.addColorStop(1,'rgba(0,30,10,.35)');
  g.fillStyle=v;g.fillRect(L-GD,T,R-L+2*GD,B-T);
  // linhas
  g.strokeStyle='rgba(255,255,255,.92)';g.fillStyle='rgba(255,255,255,.92)';g.lineWidth=4;
  g.strokeRect(L,T,R-L,B-T);
  g.beginPath();g.moveTo(W/2,T);g.lineTo(W/2,B);g.stroke();
  g.beginPath();g.arc(W/2,GM,75,0,7);g.stroke();
  g.beginPath();g.arc(W/2,GM,5,0,7);g.fill();
  [[L,1],[R,-1]].forEach(([x,d])=>{
    g.strokeRect(d>0?x:x-130,GM-150,130,300);
    g.strokeRect(d>0?x:x-50,GM-90,50,180);
    g.beginPath();g.arc(x+d*95,GM,5,0,7);g.fill();
    g.beginPath();if(d>0)g.arc(x+95,GM,70,-1.047,1.047);else g.arc(x-95,GM,70,Math.PI-1.047,Math.PI+1.047);g.stroke();
  });
  [[L,T,0],[R,T,1.57],[R,B,3.14],[L,B,4.71]].forEach(([x,y,a])=>{g.beginPath();g.arc(x,y,20,a,a+1.57);g.stroke()});
  drawGoal(L,1);drawGoal(R,-1);
}
function drawBall(b){
  g.beginPath();g.ellipse(b.x+3,b.y+6,b.r,b.r*.8,0,0,7);g.fillStyle='rgba(0,0,0,.3)';g.fill();
  g.save();g.translate(b.x,b.y);
  g.beginPath();g.arc(0,0,b.r,0,7);g.fillStyle=BSK[cfg.bsk].w;g.fill();g.clip();
  g.rotate(b.a);g.fillStyle=BSK[cfg.bsk].k;
  const pent=(cx,cy,r,rot)=>{g.beginPath();for(let i=0;i<5;i++){const a=rot+i*1.2566;g.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r)}g.closePath();g.fill()};
  pent(0,0,b.r*.4,-1.57);
  for(let i=0;i<5;i++){const a=-1.57+i*1.2566+.63;pent(Math.cos(a)*b.r*1.02,Math.sin(a)*b.r*1.02,b.r*.36,a+3.14)}
  g.strokeStyle='#9aa3ab';g.lineWidth=1;
  for(let i=0;i<5;i++){const a=-1.57+i*1.2566;g.beginPath();g.moveTo(Math.cos(a)*b.r*.4,Math.sin(a)*b.r*.4);g.lineTo(Math.cos(a+.63)*b.r*.75,Math.sin(a+.63)*b.r*.75);g.stroke()}
  g.rotate(-b.a);
  const sh=g.createRadialGradient(-b.r*.35,-b.r*.4,1,0,0,b.r*1.05);sh.addColorStop(0,'rgba(255,255,255,.75)');sh.addColorStop(.45,'rgba(255,255,255,0)');sh.addColorStop(1,'rgba(0,0,0,.35)');
  g.fillStyle=sh;g.fillRect(-b.r,-b.r,b.r*2,b.r*2);
  g.restore();
  g.beginPath();g.arc(b.x,b.y,b.r,0,7);g.strokeStyle='rgba(0,0,0,.55)';g.lineWidth=1.5;g.stroke();
}
function drawDisc(b,active){
  const c=b.team==0?DSK[cfg.dsk].c:['#ff9a9a','#ee4040','#8f1414'];
  g.beginPath();g.ellipse(b.x+3,b.y+7,b.r,b.r*.85,0,0,7);g.fillStyle='rgba(0,0,0,.32)';g.fill();
  if(active){g.beginPath();g.arc(b.x,b.y,b.r+7,0,7);g.strokeStyle='#ffd23f';g.lineWidth=3;g.setLineDash([6,5]);g.stroke();g.setLineDash([])}
  g.beginPath();g.arc(b.x,b.y,b.r,0,7);g.fillStyle='#f6f6f6';g.fill();
  const gr=g.createRadialGradient(b.x-b.r*.35,b.y-b.r*.4,2,b.x,b.y,b.r);gr.addColorStop(0,c[0]);gr.addColorStop(.55,c[1]);gr.addColorStop(1,c[2]);
  g.beginPath();g.arc(b.x,b.y,b.r-4,0,7);g.fillStyle=gr;g.fill();
  const sk=b.team==0?DSK[cfg.dsk]:null;
  if(sk&&sk.p){g.save();g.beginPath();g.arc(b.x,b.y,b.r-4,0,7);g.clip();g.fillStyle='rgba(255,255,255,.28)';
    if(sk.p=='s'){for(let i=-3;i<=3;i+=2)g.fillRect(b.x+i*4-2,b.y-b.r,4,b.r*2)}
    else if(sk.p=='d'){for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){g.beginPath();g.arc(b.x+i*12,b.y+j*12,2.6,0,7);g.fill()}}
    else{g.fillRect(b.x-b.r,b.y-3,b.r*2,6)}
    g.restore()}
  g.beginPath();g.arc(b.x,b.y,b.r*.58,0,7);g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=2;g.stroke();
  g.fillStyle='#fff';g.font='20px '+FONT;g.textAlign='center';g.textBaseline='middle';g.fillText(b.n==1?'G':b.n,b.x,b.y+1);g.textBaseline='alphabetic';
  g.beginPath();g.arc(b.x-b.r*.25,b.y-b.r*.3,b.r*.6,3.4,4.7);g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=3;g.stroke();
  g.beginPath();g.arc(b.x,b.y,b.r,0,7);g.strokeStyle='rgba(0,0,0,.4)';g.lineWidth=1.5;g.stroke();
}
function draw(ts){
  g.fillStyle='#0d1b14';g.fillRect(0,0,W,H);g.save();if(cfg.shake&&shk>.3){g.translate((Math.random()-.5)*shk,(Math.random()-.5)*shk);shk*=.9}else shk=0;
  field();
  if(drag){
    const b=drag.b,dx=b.x-drag.x,dy=b.y-drag.y,d=Math.min(Math.hypot(dx,dy),140),a=Math.atan2(dy,dx),pw=d/140;
    g.setLineDash([10,9]);g.strokeStyle='rgba(255,255,255,.9)';g.lineWidth=4;g.lineCap='round';
    g.beginPath();g.moveTo(b.x,b.y);g.lineTo(b.x+Math.cos(a)*(60+pw*160),b.y+Math.sin(a)*(60+pw*160));g.stroke();g.setLineDash([]);
    g.strokeStyle=`hsl(${120-pw*120},95%,55%)`;g.lineWidth=7;
    g.beginPath();g.moveTo(b.x,b.y);g.lineTo(b.x-Math.cos(a)*d,b.y-Math.sin(a)*d);g.stroke();
  }
  if(playing)for(const b of bodies)if(b!==ball)drawDisc(b,!paused&&mode!='online'&&phase=='idle'&&b.team==turn&&(turn==0||mode=='local'));
  if(ball&&playing)drawBall(ball);
  drawPost(L,GY1);drawPost(L,GY2);drawPost(R,GY1);drawPost(R,GY2);
  tutDraw(ts);rtDraw();for(const p of conf){g.save();g.translate(p.x,p.y);g.rotate(p.r);g.globalAlpha=Math.min(1,p.l/40);g.fillStyle=p.c;g.fillRect(-p.w/2,-p.h/2*Math.abs(Math.cos(p.r*2))-1,p.w,p.h*Math.abs(Math.cos(p.r*2))+2);g.restore()}
  if(playing&&phase=='goal'&&goalInfo){
    const k=Math.min(1,goalT/18),sc=(0.2+k*0.8)*(1+Math.sin(goalT*.25)*.04)+(goalT<18?(1-k)*0.5:0);
    g.save();g.translate(W/2,H/2-10);g.scale(sc,sc);g.rotate(-.06);
    g.font='190px '+FONT;g.textAlign='center';g.textBaseline='middle';g.lineJoin='round';
    g.lineWidth=18;g.strokeStyle='#7a3b00';g.strokeText('GOOOL!',0,6);
    g.lineWidth=12;g.strokeStyle='#fff';g.strokeText('GOOOL!',0,0);
    const gr=g.createLinearGradient(0,-90,0,90);gr.addColorStop(0,'#fff27a');gr.addColorStop(1,'#ff9f1c');
    g.fillStyle=gr;g.fillText('GOOOL!',0,0);
    g.font='46px '+FONT;g.lineWidth=8;g.strokeStyle='#7a3b00';const s=mode=='cpu'?(goalInfo.by==0?'Gol seu! ⚽':'Gol da CPU'):'Gol de '+nm()[goalInfo.by]+'!';
    g.strokeText(s,0,120);g.fillStyle='#fff';g.fillText(s,0,120);
    g.restore();
  }
g.restore();
}
document.fonts&&document.fonts.load("20px 'Lilita One'");
buildSet();tint();upd();setup(0);document.addEventListener('click',e=>{if(e.target.closest('.btn,.seg button,.sk,.pbtn'))snd('click')});
/* ===== tela cheia e layout responsivo ===== */
function fit(){
  const a=$('area').getBoundingClientRect(),w=$('wrap');
  const k=Math.min(a.width/W,a.height/H),pw=Math.floor(W*k),ph=Math.floor(H*k);
  w.style.width=pw+'px';w.style.height=ph+'px';
  w.style.fontSize=Math.max(10,Math.min(20,Math.min(pw/62,ph/38)))+'px';
}
const fullOn=()=>document.fullscreenElement||document.webkitFullscreenElement;
function lockLand(){try{if(screen.orientation&&screen.orientation.lock)screen.orientation.lock('landscape').catch(()=>{})}catch(e){}}
function goFull(){
  const e=document.documentElement,f=e.requestFullscreen||e.webkitRequestFullscreen;
  if(!f||fullOn())return;
  try{const p=f.call(e);if(p&&p.then)p.then(lockLand).catch(()=>{});else lockLand()}catch(x){}
}
function exitFull(){const f=document.exitFullscreen||document.webkitExitFullscreen;if(f){try{f.call(document)}catch(e){}}}
if(!(document.documentElement.requestFullscreen||document.documentElement.webkitRequestFullscreen))$('fs').style.display='none';
$('fs').onclick=()=>fullOn()?exitFull():goFull();
$('rot-ok').onclick=()=>$('rot').classList.remove('on');
addEventListener('resize',fit);
addEventListener('orientationchange',()=>setTimeout(fit,250));
document.addEventListener('fullscreenchange',()=>setTimeout(fit,100));
document.addEventListener('webkitfullscreenchange',()=>setTimeout(fit,100));
if(window.ResizeObserver)new ResizeObserver(fit).observe($('area'));
addEventListener('contextmenu',e=>e.preventDefault());
fit();
requestAnimationFrame(loop);
