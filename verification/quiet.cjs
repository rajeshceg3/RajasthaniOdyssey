// Quiet chrome pass on a fresh unpinned profile (run after `vite build`): greet, retire, hint wakes,
// pin persists, token strips drive the selects, hint never covers text/targets at 320 and 390.
const pp=require('puppeteer-core'),assert=require('node:assert/strict'),{spawn}=require('child_process');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{let s,b;try{
 const url=process.env.URL||'http://127.0.0.1:8841';
 if(!process.env.URL){s=spawn('python3',['-m','http.server','8841'],{cwd:'dist',stdio:'ignore'});await sleep(400)}
 b=await pp.launch({executablePath:process.env.CHROME||'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
 const op=(p,sel)=>p.$eval(sel,e=>getComputedStyle(e).opacity);
 for(const motion of ['reduce','no-preference']){
  const c=await b.createBrowserContext(),p=await c.newPage();await p.setViewport({width:390,height:844});
  await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:motion}]);
  await p.evaluateOnNewDocument(()=>{new MutationObserver(()=>{const n=document.querySelector('nav.chrome');if(n&&n.classList.contains('chrome-on'))window.__sawOn=true}).observe(document,{subtree:true,childList:true,attributes:true})});
  await p.goto(url);await p.waitForSelector('canvas[data-ready=true]',{timeout:45000});
  assert(await p.evaluate(()=>window.__sawOn===true),'greets');
  await sleep(3600);assert.equal(await op(p,'nav'),'0','retires');
  assert(await p.$eval('.chrome-hint',e=>!e.hidden),'hint shows');
  const hb=await p.$eval('.chrome-hint',e=>e.getBoundingClientRect().toJSON());assert(hb.width>=44&&hb.height>=44,'hint target size');
  if(motion==='reduce')assert.equal(await p.$eval('nav',e=>getComputedStyle(e).transitionDuration),'0s','reduced motion');
  await p.$eval('.chrome-hint',e=>e.click());await sleep(400);assert.equal(await op(p,'nav'),'1','hint wakes');
  // token drives the select and the story
  await p.$eval('.chapter-tokens .token[data-value="2"]',e=>e.click());await sleep(300);
  assert.equal(await p.$eval('#chapter',e=>e.value),'2','token selects place');
  assert.equal(await p.$eval('.chapter-tokens .token[aria-checked=true]',e=>e.dataset.value),'2','active token follows');
  await p.$eval('#next',e=>e.click());await sleep(300);
  assert.equal(await p.$eval('.chapter-tokens .token[aria-checked=true]',e=>e.dataset.value),'3','tokens follow Next');
  await p.$eval('#pin-controls',e=>e.click());await p.reload();await p.waitForSelector('canvas[data-ready=true]',{timeout:45000});await sleep(3600);
  assert.equal(await op(p,'nav'),'1','pin persists');await c.close();
 }
 for(const w of [320,390]){
  const c=await b.createBrowserContext(),p=await c.newPage();await p.setViewport({width:w,height:844});
  await p.goto(url);await p.waitForSelector('canvas[data-ready=true]',{timeout:45000});await sleep(3800);
  const hits=await p.evaluate(()=>{const h=document.querySelector('.chrome-hint').getBoundingClientRect(),bad=[];
   const inter=r=>!(r.right<h.left||r.left>h.right||r.bottom<h.top||r.top>h.bottom);
   const sc=document.querySelector('#story').getBoundingClientRect();
   for(const el of document.querySelectorAll('a,p,h1,h2,span,button,label,.world-note')){if(el.classList.contains('chrome-hint'))continue;const cr=el.closest('.chrome');if(cr&&!cr.classList.contains('chrome-on'))continue;
    const r=el.getBoundingClientRect();if(r.width&&r.height&&getComputedStyle(el).visibility!=='hidden'&&getComputedStyle(el).opacity!=='0'&&!el.classList.contains('vh')&&inter(r))bad.push(el.tagName+'.'+el.className+'#'+el.id)}return bad});
  assert.deepEqual(hits,[],'hint overlap at '+w+': '+hits.join(','));
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'no overflow at '+w);await c.close();
 }
 console.log('quiet chrome pass OK');
}finally{await b?.close();s?.kill()}})().catch(e=>{console.error(e);process.exit(1)});
