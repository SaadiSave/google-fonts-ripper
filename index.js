var E=Object.defineProperty;var q=(t,e,s)=>e in t?E(t,e,{enumerable:!0,configurable:!0,writable:!0,value:s}):t[e]=s;var c=(t,e,s)=>q(t,typeof e!="symbol"?e+"":e,s);function L(...t){for(let e of t)if(e==null)throw new TypeError("Cannot be null or undefined")}var R=new Headers({Accept:"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8","User-Agent":"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.116"}),g=class g{constructor(e,s,n,r,l){c(this,"family");c(this,"url");c(this,"italic");c(this,"weight");c(this,"script");this.family=e,this.url=s,this.italic=n,this.weight=r,this.script=l}get fileName(){return`${this.family.replace(/ /g,"")}${this.italic?"Italic":""}${this.weight}${this.script}.woff2`}async fetchFont(){let e=new Request(this.url,{method:"GET",headers:R,mode:"cors"});return(await fetch(e)).blob()}};c(g,"fromCssDecl",e=>{var d,w,b,y,x;let s=/\/\*\s([^\s]*)\s\*\//g,n=/src:\s*url\(([^\(]*)\)/g,r=/font-family:\s*'(.*)'/g,l=/font-style:\s*(\w+)/g,h=/font-weight:\s*(\d+)/g,a=(d=s.exec(e))==null?void 0:d.pop(),i=(w=n.exec(e))==null?void 0:w.pop(),m=(b=r.exec(e))==null?void 0:b.pop(),u=(y=l.exec(e))==null?void 0:y.pop(),o=(x=h.exec(e))==null?void 0:x.pop();return L(m,u,o,i,a),new g(m,i,u==="italic",parseInt(o),a)});var f=g;async function C(t){return await(await fetch(t,{headers:R})).text()}import v from"https://esm.sh/jszip@3.10.1";function N(t,e){let s=URL.createObjectURL(t),n=document.createElement("a");n.href=s,n.download=e,document.body.appendChild(n),n.dispatchEvent(new MouseEvent("click",{bubbles:!0,cancelable:!0,view:window})),document.body.removeChild(n)}async function U(){let t=document.getElementById("req"),e=new URL(t.value),s=await C(t.value.replace(e.origin,"https://fonts.googleapis.com")),n=/(\/\*.*\*\/\s@font-face {[^}]*})/g,r=[];for(let o of s.matchAll(n))r.push(f.fromCssDecl(o.pop()));let l=r.reduce((o,p)=>o.replace(p.url,`./${p.fileName}`),s),h=r.map(o=>({fileName:o.fileName,blob:o.fetchFont()})),a=new v,i=a.folder("fonts");i==null||i.file("fonts.css",l);let m=h.map(async({fileName:o,blob:p})=>{i==null||i.file(o,await p)});await Promise.all(m);let u=await a.generateAsync({type:"blob"});N(u,"fonts.zip")}var k=document.getElementById("download");k.onclick=U;
