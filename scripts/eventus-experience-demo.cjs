/* Local-only review fixture. Does not connect to Supabase or send messages. */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../public');
function bootstrap() {
  window.addEventListener('load', () => {
    const guests = [{id:1,name:'Ana Martínez',companions:2,mesa:null,status:'confirmed',version:1},{id:2,name:'Luis Torres',companions:1,mesa:1,status:'confirmed',version:1},{id:3,name:'María López',companions:0,mesa:2,status:'confirmed',version:1}];
    guests.push(...[{id:4,name:'Sofía Ramos',companions:1,mesa:1},{id:5,name:'Diego Pérez',companions:0,mesa:1},{id:6,name:'Elena Ruiz',companions:2,mesa:2},{id:7,name:'Carlos Vega',companions:1,mesa:3},{id:8,name:'Valeria Luna',companions:0,mesa:4},{id:9,name:'Andrés Castro',companions:1,mesa:null}].map(g=>({...g,status:'confirmed',version:1})));
    const tables = Array.from({length:6}, (_,i)=>({mesa:i+1,capacity:10,x:(i%3)*35,y:Math.floor(i/3)*40,version:1}));
    const program = [{id:1,name:'Recepción',time:'18:00',dur:30,note:'Bienvenida a los invitados',responsible:'Equipo del salón',status:'pending',day_offset:0,version:1},{id:2,name:'Cena',time:'19:00',dur:60,note:'',responsible:'Coordinación',status:'pending',day_offset:0,version:1}];
    const storageKey='eventus-exact-seat-demo-v1';
    try{const saved=JSON.parse(localStorage.getItem(storageKey));if(saved){guests.splice(0,guests.length,...saved.guests);tables.splice(0,tables.length,...saved.tables);}}catch{}
    function persist(){localStorage.setItem(storageKey,JSON.stringify({guests,tables}));}
    function normalize(){for(const t of tables){const rows=guests.filter(g=>g.mesa===t.mesa&&g.status!=='cancelled').sort((a,b)=>a.id-b.id),used=new Set();for(const g of rows){g.seat_slots=Array.from({length:1+g.companions},(_,i)=>{const n=(g.seat_slots||[])[i];if(n>=1&&n<=t.capacity&&!used.has(n)){used.add(n);return n;}return null;});}for(const g of rows)g.seat_slots=g.seat_slots.map(n=>{if(n)return n;for(let i=1;i<=t.capacity;i++)if(!used.has(i)){used.add(i);return i;}return null;});}}
    normalize();
    apiCall = async b => {
      if(b.op==='tables-get')return {tables:structuredClone(tables.filter(t=>t.mesa<=E.numMesas||guests.some(g=>g.mesa===t.mesa)))};
      if(b.op==='db'&&b.method==='GET')return structuredClone(guests);
      if(b.op==='db'&&b.method==='PATCH'&&b.table==='eventus_events')return [{num_mesas:b.body.num_mesas}];
      if(b.op==='guest-seat') {
        const g=guests.find(g=>g.id===b.guestId),t=tables.find(t=>t.mesa===b.mesa),person=b.personIndex||0;
        if(b.expectedVersion!==g.version)throw Object.assign(new Error('version_conflict'),{status:409});
        if(t&&g.mesa!==b.mesa&&guests.filter(x=>x.mesa===b.mesa&&x.status!=='cancelled').reduce((n,x)=>n+1+x.companions,0)+1+g.companions>t.capacity)throw Object.assign(new Error('table_full'),{status:409});
        if(b.seatIndex){const other=guests.find(x=>x.mesa===b.mesa&&x.status!=='cancelled'&&(x.seat_slots||[]).includes(b.seatIndex));
          if(g.mesa!==b.mesa&&other)throw Object.assign(new Error('seat_occupied'),{status:409});
          if(g.mesa===b.mesa&&other){const old=g.seat_slots[person],idx=other.seat_slots.indexOf(b.seatIndex);other.seat_slots[idx]=old;if(other!==g)other.version++;}
          if(g.mesa!==b.mesa)g.seat_slots=[];
          g.seat_slots[person]=b.seatIndex;
        }else if(g.mesa!==b.mesa)g.seat_slots=[];
        Object.assign(g,{mesa:b.mesa,version:g.version+1});normalize();persist();return {guest:structuredClone(g),guests:structuredClone(guests)};
      }
      if(b.op==='table-save') {const t=tables.find(t=>t.mesa===b.mesa);Object.assign(t,{capacity:b.capacity,x:b.x,y:b.y,version:t.version+1});persist();return {table:structuredClone(t)};}
      if(b.op==='program-save')return {activity:{...b,id:b.id||Date.now(),day_offset:b.dayOffset,version:(b.expectedVersion||0)+1}};
      if(b.op==='program-delete')return {ok:true};
      if(b.op==='gallery-get')return {configured:false};
      if(['coordination-list','requests-list','history-list'].includes(b.op))return {items:[],nextCursor:null};
      throw new Error('Esta acción no está habilitada en la demostración local.');
    };
    E={code:'DEMO-LOCAL',name:'Evento de demostración',type:'xv',date:'2027-05-01',activated:true,numMesas:6,hours:6,guests:structuredClone(guests),program:structuredClone(program),payments:[],checklist:[],menuSel:{}};
    show();goPanel('mesas');
    const banner=document.createElement('div');banner.textContent='DEMOSTRACIÓN LOCAL · Datos ficticios · Guardado en este navegador';banner.style.cssText='position:sticky;top:0;z-index:9999;background:#d8b77b;color:#171b17;text-align:center;padding:10px;font:13px system-ui;';document.body.prepend(banner);
    document.addEventListener('click',e=>{const a=e.target.closest('a');if(a&&a.href&&!a.href.startsWith(location.origin)){e.preventDefault();toast('Enlaces externos deshabilitados en esta demostración.',1);}},true);
    window.open=()=>{toast('Envíos y enlaces externos deshabilitados en esta demostración.',1);return null;};
  });
}
const server=http.createServer((req,res)=>{
  const url=new URL(req.url,'http://localhost');
  const file=path.resolve(root,'.'+(url.pathname==='/'?'/eventus.html':url.pathname));
  if(!file.startsWith(root+path.sep)){res.writeHead(404).end();return;}
  try {
    let body=fs.readFileSync(file);
    if(file.endsWith('eventus.html'))body=body.toString().replace('</body>',`<script>(${bootstrap.toString()})();</script></body>`);
    res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':'application/octet-stream');
    res.end(body);
  } catch {res.writeHead(404).end();}
});
server.listen(Number(process.env.PORT||3211),'127.0.0.1',()=>console.log('Eventus local fixture: http://localhost:'+server.address().port));
