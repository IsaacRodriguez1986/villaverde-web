import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHmac} from 'node:crypto';
import ts from 'typescript';
process.env.SUPABASE_URL='https://database.invalid';
process.env.SUPABASE_SERVICE_KEY='synthetic-test-secret';
const src=await readFile(new URL('../src/app/api/eventus/route.ts',import.meta.url),'utf8');
const {POST,GET,PATCH}=await import('data:text/javascript;base64,'+Buffer.from(ts.transpileModule(src,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText).toString('base64'));
const token=(scope,code='AAA',guestId='1')=>{const p=Buffer.from(JSON.stringify({scope,code,guestId,exp:Math.floor(Date.now()/1000)+3600,nonce:'test'})).toString('base64url');return 'ev1.'+p+'.'+createHmac('sha256','synthetic-test-secret').update('eventus-v1.'+p).digest('base64url');};
let calls=[];
globalThis.fetch=async(url,opts)=>{calls.push({url:String(url),body:opts.body&&JSON.parse(opts.body)}); if(String(url).includes('eventus_events'))return Response.json([{code:'AAA'}]); if(String(url).includes('muro_config'))return Response.json([{enabled:true,gallery_token:'gallery-only'}]); return Response.json({guest:{id:1},alreadyArrived:false});};
const post=(body,admin=false)=>POST(new Request('https://example.test/api/eventus',{method:'POST',headers:{'content-type':'application/json',...(admin?{cookie:'eventus_admin='+token('admin')}:{})},body:JSON.stringify(body)}));
assert.equal((await post({op:'guest-checkin',code:'AAA',accessToken:token('event'),guestId:1})).status,403);
assert.equal((await post({op:'guest-checkin',code:'AAA',guestToken:token('guest','BBB')},true)).status,401);
assert.equal((await post({op:'guest-checkin',code:'AAA',guestToken:token('guest')+'broken'},true)).status,401);
assert.equal((await post({op:'guest-checkin',code:'AAA',guestToken:token('guest')},true)).status,200);
assert.equal(calls.at(-1).body.p_event_code,'AAA'); assert.equal(calls.at(-1).body.p_data.guestId,'1');
assert.equal((await post({op:'guest-seat',accessToken:token('event'),code:'BBB',guestId:1,mesa:1,expectedVersion:1})).status,403);
assert.equal((await post({op:'program-save',accessToken:token('event'),name:'A',time:'99:00',dur:20,note:'',responsible:'',status:'pending'})).status,400);
assert.equal((await post({op:'db',table:'eventus_guests',method:'PATCH',query:'id=eq.1',body:{arrived:true},accessToken:token('event')})).status,400);
assert.equal((await post({op:'db',table:'eventus_program',method:'DELETE',query:'id=eq.1',accessToken:token('event')})).status,400);
const gallery=await (await post({op:'gallery-get',accessToken:token('event')})).json();
assert.equal(gallery.uploadUrl,'https://muro-villaverde.vercel.app/e/AAA'); assert.equal(gallery.galleryUrl,'https://muro-villaverde.vercel.app/galeria/gallery-only');
assert.ok(calls.find(c=>c.url.includes('muro_config')).url.includes('event_code=eq.AAA')); assert.ok(!calls.find(c=>c.url.includes('muro_config')).url.includes('screen_token'));
console.log('Eventus API: admin-only reception, altered/cross-event tokens, scope, dedicated mutations and gallery projection passed');
const exactSeat={op:'guest-seat',accessToken:token('event'),guestId:1,mesa:1,expectedVersion:2,seatIndex:8,personIndex:1};
assert.equal((await post(exactSeat)).status,200);
assert.deepEqual(calls.at(-1).body.p_data,{guestId:'1',mesa:1,expectedVersion:2,seatIndex:8,personIndex:1});
for(const invalid of [{seatIndex:0},{seatIndex:1.5},{personIndex:-1},{personIndex:null},{mesa:null}])assert.equal((await post({...exactSeat,...invalid})).status,400);
assert.equal((await post({op:'db',table:'eventus_guests',method:'PATCH',query:'id=eq.1',body:{seat_slots:[8]},accessToken:token('event')})).status,400);
console.log('Exact seat API: indexes validated and generic writes blocked');
// Database errors reach the client as known codes, never as raw database text.
const rpcError=(code,message)=>{globalThis.fetch=async(url,opts)=>{calls.push({url:String(url),body:opts.body&&JSON.parse(opts.body)});if(String(url).includes('eventus_events'))return Response.json([{code:'AAA'}]);return Response.json({code,message},{status:400});};};
rpcError('23514','seat_occupied');let res=await post(exactSeat);assert.equal(res.status,409);assert.equal((await res.json()).error,'seat_occupied');
rpcError('22023','invalid_seat');res=await post(exactSeat);assert.equal(res.status,400);assert.equal((await res.json()).error,'invalid_seat');
rpcError('23514','check violation detail');res=await post(exactSeat);assert.equal((await res.json()).error,'invalid_data');
// A deadlock is retried once (Postgres rolled the loser back); a second one is a version conflict.
let deadlocks=1;globalThis.fetch=async(url,opts)=>{calls.push({url:String(url),body:opts.body&&JSON.parse(opts.body)});if(String(url).includes('eventus_events'))return Response.json([{code:'AAA'}]);if(deadlocks-->0)return Response.json({code:'40P01',message:'deadlock detected'},{status:400});return Response.json({guest:{id:1}});};
calls=[];assert.equal((await post(exactSeat)).status,200);assert.equal(calls.filter(c=>c.url.includes('eventus_experience_mutate')).length,2,'deadlock retried once');
deadlocks=2;res=await post(exactSeat);assert.equal(res.status,409);assert.equal((await res.json()).error,'version_conflict');
// The chair the client saw travels to the RPC, validated.
globalThis.fetch=async(url,opts)=>{calls.push({url:String(url),body:opts.body&&JSON.parse(opts.body)});if(String(url).includes('eventus_events'))return Response.json([{code:'AAA'}]);return Response.json({guest:{id:1}});};
assert.equal((await post({...exactSeat,expectedOccupant:null})).status,200);assert.equal(calls.at(-1).body.p_data.expectedOccupant,null);
assert.equal((await post({...exactSeat,expectedOccupant:{guestId:4,personIndex:0}})).status,200);assert.deepEqual(calls.at(-1).body.p_data.expectedOccupant,{guestId:'4',personIndex:0});
for(const bad of [{guestId:'x',personIndex:0},{guestId:4,personIndex:-1},'4'])assert.equal((await post({...exactSeat,expectedOccupant:bad})).status,400);
assert.equal((await post({...exactSeat,guestId:9999999999})).status,400,'ids longer than the RPC accepts are rejected here');
// Tables hold up to 16 people: that is what the salon plan lays out.
const tableSave={op:'table-save',accessToken:token('event'),mesa:1,capacity:16,x:10,y:9,expectedVersion:1};
assert.equal((await post(tableSave)).status,200);assert.equal((await post({...tableSave,capacity:17})).status,400);
// RSVP: a guest who cancelled and comes back stays confirmed; if the table filled up, they wait without a table.
const rsvp=(status)=>PATCH(new Request('https://example.test/api/eventus',{method:'PATCH',headers:{'content-type':'application/json',authorization:'Bearer '+token('guest')},body:JSON.stringify({code:'AAA',guestId:'1',status})}));
let patches=[];globalThis.fetch=async(url,opts)=>{const body=opts.body&&JSON.parse(opts.body);if(String(url).includes('eventus_events'))return Response.json([{code:'AAA'}]);patches.push(body);return patches.length===1?Response.json({code:'23514',message:'table_full'},{status:400}):Response.json([{id:1}]);};
assert.equal((await rsvp('confirmed')).status,200);assert.deepEqual(patches,[{status:'confirmed'},{status:'confirmed',mesa:null}]);
patches=[];res=await rsvp('cancelled');assert.equal(patches.length,1,'only a reconfirmation falls back to no table');
console.log('Eventus API: error codes, deadlock retry, stale-chair guard, 16-seat tables and RSVP without table passed');
