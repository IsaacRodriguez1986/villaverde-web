// Run against the local synthetic demo, never a customer event.
const {test}=require('node:test');const assert=require('node:assert/strict');const {chromium}=require('playwright');
test('chosen chair persists, swaps and supports touch without moving companions unintentionally',async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{for(const width of [1280,390]){
  const page=await browser.newPage({viewport:{width,height:1000},hasTouch:width===390});page.setDefaultTimeout(8000);
  await page.goto('http://localhost:3211/eventus.html');
  await page.locator('.exp-person[data-guest="2"][data-person-index="0"]').waitFor();
  const source=page.locator('.exp-person[data-guest="2"][data-person-index="0"]');
  const target=page.locator('[data-seat-target="1"][data-chair="8"]');
  if(width===1280)await source.dragTo(target);
  else{
   await page.locator('.exp-plan-viewport').scrollIntoViewIfNeeded();
   const a=await source.boundingBox(),b=await target.boundingBox(),client=await page.context().newCDPSession(page);
   const from={x:a.x+a.width/2,y:a.y+a.height/2},to={x:b.x+b.width/2,y:b.y+b.height/2};
   await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[from]});
   for(let n=1;n<=8;n++)await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:from.x+(to.x-from.x)*n/8,y:from.y+(to.y-from.y)*n/8}]});
   await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await client.detach();
  }
  await page.getByText('Silla 8 guardada.',{exact:true}).waitFor();
  assert.equal(await source.getAttribute('data-chair'),'8');
  await page.reload();await source.waitFor();assert.equal(await source.getAttribute('data-chair'),'8','chair survives full reload');
  await source.click();await page.locator('#move-destination').selectOption('1');await page.locator('#move-chair').selectOption('3');await page.locator('#move-picked').click();
  await page.getByText('Silla 3 guardada.',{exact:true}).waitFor();
  assert.equal(await source.getAttribute('data-chair'),'3');
  assert.equal(await page.locator('.exp-person[data-guest="4"][data-person-index="0"]').getAttribute('data-chair'),'8','occupied chair swaps');
  await page.locator('.exp-person[data-guest="2"][data-person-index="1"]').click();
  await page.locator('#move-chair').selectOption('10');await page.locator('#move-picked').click();
  await page.getByText('Silla 10 guardada.',{exact:true}).waitFor();
  assert.equal(await page.locator('.exp-person[data-guest="2"][data-person-index="1"]').getAttribute('data-chair'),'10');
  assert.equal(await source.getAttribute('data-chair'),'3','holder remains seated while companion moves');
  await page.close();
 }}finally{await browser.close();}
});
