/* Shared slide-deck behaviour: scaling, navigation, spreadsheet tables, answer keys (K) */
(function(){
  const stage=document.getElementById('stage');
  const all=[...document.querySelectorAll('.slide')];
  let cur=0;

  // Spreadsheet look: column letters on top, row numbers on the left
  document.querySelectorAll('table.sheet').forEach(t=>{
    const rows=[...t.rows]; if(!rows.length) return;
    const n=rows[0].cells.length;
    rows.forEach((r,i)=>{const c=document.createElement('td');c.className='rn';c.textContent=i+1;r.insertBefore(c,r.firstChild)});
    const lt=document.createElement('tr');lt.className='lt';
    lt.innerHTML='<td></td>'+Array.from({length:n},(_,i)=>'<td>'+String.fromCharCode(65+i)+'</td>').join('');
    rows[0].parentNode.insertBefore(lt,rows[0]);
    const cg=t.querySelector('colgroup'); if(cg) cg.insertBefore(document.createElement('col'),cg.firstChild);
  });


  // ERD diagrams: <div class="erd"><script type="application/json">{w,h,e:[entities],r:[relations]}</script></div>
  // entity: {id,name,x,y,w,a:["Kolom|PK", ...],cls}; relation: {from,to,a,b,label}; ends: one | zone | many | zmany
  const NS='http://www.w3.org/2000/svg';
  const el=(tag,at,parent,text)=>{const e=document.createElementNS(NS,tag);for(const k in at)e.setAttribute(k,at[k]);if(text!=null)e.textContent=text;if(parent)parent.appendChild(e);return e};
  const defs=el('defs',{},el('svg',{width:0,height:0,style:'position:absolute','aria-hidden':'true'},document.body));
  const ends={one:['M18 4V20M24 4V20'],zone:['M24 4V20',12],many:['M30 2L16 12L30 22M16 12H30M10 4V20'],zmany:['M30 2L16 12L30 22M16 12H30',8]};
  for(const k in ends){
    const m=el('marker',{id:'m-'+k,viewBox:'0 0 30 24',refX:30,refY:12,markerWidth:42,markerHeight:34,markerUnits:'userSpaceOnUse',orient:'auto-start-reverse'},defs);
    el('path',{d:ends[k][0],fill:'none',stroke:'#1d1c1a','stroke-width':1.25},m);
    if(ends[k][1]) el('circle',{cx:ends[k][1],cy:12,r:5,fill:'#fffdf8',stroke:'#1d1c1a','stroke-width':1.25},m);
  }
  document.querySelectorAll('.erd').forEach(d=>{
    const s=JSON.parse(d.querySelector('script').textContent);
    const svg=el('svg',{viewBox:`0 0 ${s.w} ${s.h}`,width:s.w,height:s.h,class:'dg'});
    const HH=48,RH=34,E={};
    s.e.forEach(e=>{e.h=e.a.length?HH+e.a.length*RH+10:52;E[e.id]=e});
    s.r.forEach(r=>{
      const A=E[r.from],B=E[r.to];let x1,y1,x2,y2;
      if(Math.min(A.x+A.w,B.x+B.w)-Math.max(A.x,B.x)<=0){
        const l=A.x<B.x;x1=l?A.x+A.w:A.x;x2=l?B.x:B.x+B.w;
        y1=y2=r.y??(Math.max(A.y,B.y)+Math.min(A.y+A.h,B.y+B.h))/2;
      }else{
        const t=A.y<B.y;x1=x2=r.x??(Math.max(A.x,B.x)+Math.min(A.x+A.w,B.x+B.w))/2;
        y1=t?A.y+A.h:A.y;y2=t?B.y:B.y+B.h;
      }
      el('line',{x1,y1,x2,y2,class:'ln','marker-start':`url(#m-${r.a})`,'marker-end':`url(#m-${r.b})`},svg);
      if(r.label){const v=x1===x2;el('text',{x:v?x1+14:(x1+x2)/2,y:v?(y1+y2)/2+6:y1-12,class:'lb','text-anchor':v?'start':'middle'},svg,r.label)}
    });
    s.e.forEach(e=>{
      el('rect',{x:e.x,y:e.y,width:e.w,height:e.h,class:'box '+(e.cls||'')},svg);
      el('text',{x:e.x+14,y:e.y+(e.a.length?31:34),class:'t-h'},svg,e.name);
      if(!e.a.length) return;
      el('line',{x1:e.x,x2:e.x+e.w,y1:e.y+HH,y2:e.y+HH,class:'sep'},svg);
      e.a.forEach((a,i)=>{
        const [n,tag]=a.split('|'),y=e.y+HH+RH*i+27;
        el('text',{x:e.x+14,y,class:'t-a'+(tag&&tag.includes('PK')?' pk-t':'')},svg,n);
        if(tag) el('text',{x:e.x+e.w-12,y,class:'t-k','text-anchor':'end'},svg,tag);
      });
    });
    d.replaceChildren(svg);
  });

  const visible=()=>all.filter(s=>!s.classList.contains('answer')||document.body.classList.contains('kunci'));
  function show(i){
    const list=visible();
    i=Math.max(0,Math.min(list.length-1,i));
    all.forEach(s=>s.classList.remove('on'));
    const s=list[i]; s.classList.add('on'); cur=i;
    stage.classList.toggle('plain',s.hasAttribute('data-plain'));
    document.getElementById('sec').textContent=s.dataset.section||'';
    document.getElementById('count').textContent=String(i+1).padStart(2,'0')+' / '+String(list.length).padStart(2,'0');
    document.getElementById('bar').style.width=((i+1)/list.length*100)+'%';
    history.replaceState(null,'','#'+(i+1));
  }
  function fit(){stage.style.setProperty('--s',Math.min(innerWidth/1600,innerHeight/900))}
  function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');clearTimeout(toast.h);toast.h=setTimeout(()=>t.classList.remove('show'),1400)}

  document.getElementById('next').onclick=()=>show(cur+1);
  document.getElementById('prev').onclick=()=>show(cur-1);
  document.addEventListener('keydown',e=>{
    if(e.metaKey||e.ctrlKey||e.altKey) return;
    const k=e.key;
    if(['ArrowRight','PageDown',' ','Enter'].includes(k)){e.preventDefault();show(cur+1)}
    else if(['ArrowLeft','PageUp','Backspace'].includes(k)){e.preventDefault();show(cur-1)}
    else if(k==='Home'){show(0)} else if(k==='End'){show(visible().length-1)}
    else if(k==='f'||k==='F'){document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen().catch(()=>{})}
    else if(k==='k'||k==='K'){ // toggle answer-key slides
      const s=visible()[cur];
      document.body.classList.toggle('kunci');
      toast(document.body.classList.contains('kunci')?'Kunci jawaban ditampilkan':'Kunci jawaban disembunyikan');
      const list=visible(); let i=list.indexOf(s);
      if(i<0) i=list.indexOf(all.slice(0,all.indexOf(s)).reverse().find(x=>list.includes(x)));
      show(i);
    }
  });
  let tx=0;
  document.addEventListener('touchstart',e=>{tx=e.changedTouches[0].screenX},{passive:true});
  document.addEventListener('touchend',e=>{const d=tx-e.changedTouches[0].screenX;if(Math.abs(d)>50)show(cur+(d>0?1:-1))});
  addEventListener('resize',fit);
  fit();
  show((parseInt(location.hash.slice(1))||1)-1);
})();
