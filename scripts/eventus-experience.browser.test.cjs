/* Synthetic browser acceptance. Run with NODE_PATH pointing at a Playwright installation. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('playwright');
const root=path.join(__dirname,'..','public');

test('Eventus desktop and mobile experience with isolated fixtures', async()=>{
 const server=http.createServer((req,res)=>{let file=path.join(root,req.url.split('?')[0]);if(!file.startsWith(root)){res.writeHead(404).end();return;}try{res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html');res.end(fs.readFileSync(file));}catch(e){res.writeHead(404).end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true,channel:'chrome'});
 try { for(const width of [1280,390]) {
  const page=await browser.newPage({viewport:{width,height:900}});
  page.setDefaultTimeout(5000);
  page.on('pageerror',e=>console.error(e.message));
  const calls=[]; let failNext=false, failProgram=true;
  const guests=[{id:1,name:'Ana Fixture',companions:1,mesa:null,status:'confirmed',version:1},{id:2,name:'Luis Fixture',companions:0,mesa:2,status:'confirmed',version:1}];
  const tables=[{mesa:1,capacity:4,x:20,y:20,version:1},{mesa:2,capacity:1,x:28,y:20,version:1}];
  await page.route('**/api/eventus',async route=>{const b=route.request().postDataJSON();calls.push(b);let result={};let status=200;
    if(b.op==='tables-get')result={tables};
    if(b.op==='db') {result=guests;if(b.method==='DELETE' || b.method==='PATCH'){status=409;result={error:'table_full'};}}
    if(b.op==='guest-seat'){if(failNext){failNext=false;status=409;result={error:'version_conflict'};}else{const g=guests.find(g=>g.id===b.guestId);Object.assign(g,{mesa:b.mesa,version:g.version+1});result={guest:g};}}
    if(b.op==='table-save'){const t=tables.find(t=>t.mesa===b.mesa);Object.assign(t,{capacity:b.capacity,x:b.x,y:b.y,version:t.version+1});result={table:t};}
    if(b.op==='program-save'){if(failProgram){failProgram=false;status=503;result={error:'Servicio temporalmente no disponible'};}else result={activity:{...b,id:b.id||4,version:2,day_offset:b.dayOffset}};}
    if(b.op==='gallery-get')result={configured:false};
    if(b.op==='guest-checkin'){const g=guests.find(g=>g.id===(b.guestId||1));result={guest:{...g,arrived:true},alreadyArrived:true};}
    await route.fulfill({status,contentType:'application/json',body:JSON.stringify(result)});
  });
  await page.goto('http://127.0.0.1:'+server.address().port+'/eventus.html',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>{E={code:'FIXTURE',name:'Evento de prueba',activated:true,numMesas:2,hours:6,guests:[],program:[]};document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));document.getElementById('S2').classList.add('active');document.querySelectorAll('.pn').forEach(s=>s.classList.remove('active'));document.getElementById('p-mesas').classList.add('active');rT();});
  await page.locator('[data-seat="1"]').waitFor();
  assert.equal(await page.locator('[data-table="2"]').innerText(),'Mesa 2\n1 / 1 lugares');
  await page.locator('[data-seat="1"]').focus();
  assert.equal(await page.locator('[data-seat="1"]').evaluate(n=>document.activeElement===n),true,'selector supports keyboard focus');
  await page.locator('[data-seat="1"]').selectOption('2');
  await page.getByText('No hay lugares suficientes', {exact:false}).waitFor();
  assert.equal(calls.filter(b=>b.op==='guest-seat').length,0,'capacity prevents invalid request');
  failNext=true;await page.locator('[data-seat="1"]').selectOption('1');
  await page.getByText('Otro usuario cambió', {exact:false}).waitFor();
  assert.equal(await page.locator('[data-seat="1"]').inputValue(),'','failed movement leaves assignment');
  await page.locator('[data-seat="1"]').selectOption('1');
  await page.getByText('Asignación guardada.',{exact:true}).waitFor();
  assert.equal(await page.locator('[data-seat="1"]').inputValue(),'1');
  await page.locator('#table-form input[name=x]').fill('100');
  await page.getByRole('button',{name:'Guardar mesa',exact:true}).click();
  await page.getByText('Mesa guardada.',{exact:true}).waitFor();
  assert.equal(tables[0].x,100);
  if(width===1280){
    await page.locator('#table-select').selectOption('2');
    await page.locator('#table-form input[name=capacity]').fill('4');
    await page.getByRole('button',{name:'Guardar mesa',exact:true}).click();
    await page.getByText('Mesa guardada.',{exact:true}).waitFor();
    await page.locator('#table-select').selectOption('1');
    await page.setViewportSize({width:1280,height:1900});
    await page.locator('[data-guest="1"]').dragTo(page.locator('[data-table="2"]'),{sourcePosition:{x:15,y:15}});
    await page.getByText('Asignación guardada.',{exact:true}).waitFor();
    assert.equal(guests[0].mesa,2,'drag persists guest assignment');
    await page.setViewportSize({width,height:900});
  }
  await page.screenshot({path:'/tmp/eventus-seating-'+width+'.png',fullPage:true});
  const horizontal=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
  assert.equal(horizontal,false,'no page horizontal overflow at '+width);
  const priorStatus=await page.evaluate(async()=>{E.guests[0].status='cancelled';await sS(1,'confirmed');return E.guests[0].status;});
  assert.equal(priorStatus,'cancelled','failed reactivation preserves cancelled status');
  await page.evaluate(()=>goPanel('prog'));
  await page.locator('#program-form input[name=name]').fill('Baile de prueba');
  await page.locator('#program-form input[name=responsible]').fill('DJ Fixture');
  await page.getByRole('button',{name:'Agregar actividad',exact:true}).click();
  await page.getByText('Servicio temporalmente no disponible',{exact:true}).waitFor();
  assert.equal(await page.locator('#program-form input[name=name]').inputValue(),'Baile de prueba','network failure preserves form capture');
  await page.getByRole('button',{name:'Agregar actividad',exact:true}).click();
  await page.getByText('Actividad guardada.',{exact:true}).waitFor();
  await page.getByRole('button',{name:'Iniciar',exact:true}).click();
  await page.getByText('EN CURSO',{exact:true}).waitFor();
  assert.equal(calls.filter(b=>b.op==='program-save').at(-1).status,'in_progress');
  await page.screenshot({path:'/tmp/eventus-program-'+width+'.png',fullPage:true});
  await page.getByRole('button',{name:'Editar',exact:true}).click();
  await page.locator('#program-form input[name=time]').fill('23:55');
  await page.locator('#program-form input[name=dur]').fill('30');
  let warning='';page.once('dialog',async d=>{warning=d.message();await d.dismiss();});
  await page.getByRole('button',{name:'Guardar cambios',exact:true}).click();
  assert.match(warning,/día siguiente/);
  await page.evaluate(()=>{goPanel('mas');});
  await page.getByRole('button',{name:/Fotos del evento/}).click();
  await page.getByText('La galería de este evento todavía no está configurada.',{exact:false}).waitFor();
  await page.evaluate(()=>{ADMIN_VIEW=true;ADM_CHECKIN_CODE='FIXTURE';ADM_EVENTS=[{code:'FIXTURE',name:'Evento Fixture',_guests:[{id:1,name:'Ana Fixture',companions:1,status:'confirmed',arrived:false}]}];document.getElementById('p-galeria').innerHTML=admRenderCheckinDetail();});
  assert.equal(calls.filter(b=>b.op==='guest-checkin').length,0,'opening reception never checks in');
  await page.locator('#reception-token').fill('https://example.test/rsvp/FIXTURE/1#token=ev1.fixture');
  // Preserve fixture DOM after admin render while testing the dedicated mutation.
  await page.evaluate(()=>{admRender=()=>{};});
  await page.getByRole('button',{name:'Verificar y registrar',exact:true}).click();
  await page.getByText('Este pase ya fue registrado: Ana Fixture',{exact:true}).waitFor();
  assert.equal(calls.filter(b=>b.op==='guest-checkin').length,1);
  assert.equal(calls.at(-1).guestToken,'ev1.fixture');
  await page.evaluate(()=>{window.BarcodeDetector=undefined;});
  await page.getByRole('button',{name:'Abrir cámara',exact:true}).click();
  await page.getByText('Este navegador no puede leer QR con cámara.',{exact:false}).waitFor();
  await page.evaluate(()=>{window.BarcodeDetector=class {};navigator.mediaDevices.getUserMedia=async()=>{throw new DOMException('Denied','NotAllowedError');};});
  await page.getByRole('button',{name:'Abrir cámara',exact:true}).click();
  await page.getByText('Permiso de cámara denegado.',{exact:false}).waitFor();
  const beforeDelete=calls.length;
  const confirm=async d=>d.accept();page.on('dialog',confirm);
  await page.evaluate(()=>admDeleteEvent('FIXTURE','Evento Fixture'));
  page.off('dialog',confirm);
  assert.equal(calls.length-beforeDelete,1,'event deletion is one atomic request');
  assert.equal(calls.at(-1).table,'eventus_events');
  assert.equal(await page.evaluate(()=>ADM_EVENTS.length),1,'failed deletion preserves UI event');
  await page.close();
 }} finally {await browser.close();await new Promise(r=>server.close(r));}
});
