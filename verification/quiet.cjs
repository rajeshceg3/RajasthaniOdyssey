// Explicit disclosure replaces timed chrome retirement. Verify fresh AND legacy-pinned profiles.
const pp=require('puppeteer-core'),assert=require('node:assert/strict'),{spawn}=require('child_process');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{let s,b;try{
 const url=process.env.URL||'http://127.0.0.1:8841';
 if(!process.env.URL){s=spawn('python3',['-m','http.server','8841'],{cwd:'dist',stdio:'ignore'});await sleep(400)}
 b=await pp.launch({executablePath:process.env.CHROME||'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
 for(const w of [320,390,768,1280])for(const motion of ['reduce','no-preference']){
  const c=await b.createBrowserContext(),p=await c.newPage();await p.setViewport({width:w,height:844});
  await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:motion}]);
  await p.evaluateOnNewDocument(()=>localStorage.setItem('rajasthaniodyssey-chrome-pin','1'));
  await p.goto(url);await p.waitForSelector('canvas[data-ready=true]',{timeout:45000});
  const visible=()=>p.evaluate(()=>[...document.querySelectorAll('button')].filter(e=>e.checkVisibility({checkOpacity:true,checkVisibilityCSS:true})).map(e=>e.id));
  assert.deepEqual((await visible()).sort(),['discover','explore-controls'],'only primary action and disclosure on scene');
  await p.click('#explore-controls');assert(await p.$eval('#explore-panel',e=>e.open));
  await sleep(3000);assert(await p.$eval('#explore-panel',e=>e.open),'no timed disappearance');
  await p.$eval('.chapter-tokens .token[data-value="2"]',e=>e.click());
  assert.equal(await p.$eval('#chapter',e=>e.value),'2');
  await p.$eval('#next',e=>e.click());
  assert.equal(await p.$eval('.chapter-tokens .token[aria-checked=true]',e=>e.dataset.value),'3');
  await p.$eval('.landmark-tokens .token[data-value="1"]',e=>e.click());
  await sleep(80);assert.equal(await p.$eval('#landmark',e=>e.value),'1');
  assert(!await p.$eval('#explore-panel',e=>e.open),'landmark selection returns to scene');
  assert.equal(await p.evaluate(()=>document.activeElement.id),'discover');
  await p.click('#discover');assert(await p.$eval('#panel',e=>e.open));
  await p.keyboard.press('Escape');
  await p.click('#explore-controls');await p.keyboard.press('Escape');await sleep(80);
  assert.equal(await p.evaluate(()=>document.activeElement.id),'explore-controls','Escape restores focus');
  const bad=await p.evaluate(()=>{const out=[];for(const id of ['discover','explore-controls']){const e=document.getElementById(id),r=e.getBoundingClientRect();if(r.width<44||r.height<44||r.left<0||r.right>innerWidth||r.bottom>innerHeight)out.push(id)}return out});
  assert.deepEqual(bad,[],'visible targets fit and are 44px');
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'no horizontal overflow');
  await c.close();
 }
 console.log('explicit exploration panel pass OK: 4 widths x 2 motion settings; legacy pins ignored, tokens, focus, targets');
}finally{await b?.close();s?.kill()}})().catch(e=>{console.error(e);process.exit(1)});
