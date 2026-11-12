// The primary action (#discover) must be fully visible inside the story sheet and viewport, for every place, at 320 and 390.
const pp=require('puppeteer-core'),assert=require('node:assert/strict'),{spawn}=require('child_process');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{let s,b;try{
 const url=process.env.URL||'http://127.0.0.1:8843';
 if(!process.env.URL){s=spawn('python3',['-m','http.server','8843'],{cwd:'dist',stdio:'ignore'});await sleep(400)}
 b=await pp.launch({executablePath:process.env.CHROME||'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
 for(const w of [320,390]){const c=await b.createBrowserContext(),p=await c.newPage();await p.setViewport({width:w,height:844});
  await p.evaluateOnNewDocument(()=>{try{localStorage.setItem('rajasthaniodyssey-chrome-pin','1')}catch{}});
  await p.goto(url);await p.waitForSelector('canvas[data-ready=true]',{timeout:45000});
  for(let i=0;i<6;i++){await p.select('#chapter',''+i);await sleep(250);
   const r=await p.evaluate(()=>{const d=document.querySelector('#discover').getBoundingClientRect(),st=document.querySelector('#story').getBoundingClientRect();return {dTop:d.top,dBottom:d.bottom,sBottom:st.bottom,vh:innerHeight,canvasH:document.querySelector('canvas').getBoundingClientRect().height}});
   assert(r.dBottom<=r.sBottom+0.5&&r.dBottom<=r.vh,'Open landmark cut off at '+w+' place '+i+': '+JSON.stringify(r));assert(r.canvasH>=250,'canvas too short '+r.canvasH);}
  await c.close();}
 console.log('fold pass OK');
}finally{await b?.close();s?.kill()}})().catch(e=>{console.error(e);process.exit(1)});
