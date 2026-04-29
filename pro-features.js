/* Harvester Parts v10 Pro Add-ons: AI assistant, voice search, PWA, payments, performance */
(function(){
  const cfg = window.HP_SUPABASE || {};
  window.HP_PAYMENTS = window.HP_PAYMENTS || {
    razorpayKeyId: 'rzp_test_REPLACE_WITH_YOUR_KEY_ID',
    currency: 'INR',
    merchantName: 'Harvester Parts'
  };
  const $ = (q,r=document)=>r.querySelector(q);
  const $$ = (q,r=document)=>[...r.querySelectorAll(q)];
  const money = n => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(+n||0);
  const products = () => (window.state?.products || window.D?.products || []);

  function installPWA(){
    if('serviceWorker' in navigator){ navigator.serviceWorker.register('./sw.js').catch(()=>{}); }
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', e=>{ e.preventDefault(); deferredPrompt=e; showInstallButton(); });
    function showInstallButton(){
      if($('#installAppBtn')) return;
      const btn=document.createElement('button'); btn.id='installAppBtn'; btn.className='install-app'; btn.textContent='Install App';
      btn.onclick=async()=>{ if(deferredPrompt){ deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt=null; btn.remove(); }};
      document.body.appendChild(btn);
    }
  }

  function enhanceTransitions(){
    document.addEventListener('click', e=>{
      const a=e.target.closest('a[href^="#"]');
      if(!a) return;
      document.body.classList.add('route-leaving');
      setTimeout(()=>document.body.classList.remove('route-leaving'),420);
    });
    const reveal=()=>$$('.card,.section-head,.hero-copy,.hero-stage,.royal-panel').forEach(el=>{
      const top=el.getBoundingClientRect().top;
      if(top < innerHeight-60) el.classList.add('reveal-in');
    });
    addEventListener('scroll', reveal, {passive:true}); setTimeout(reveal,500);
  }

  function injectSearchTools(){
    const app=$('#app'); if(!app) return;
    const mo=new MutationObserver(()=>{
      const toolbar=$('.toolbar');
      if(toolbar && !$('#voiceSearchBtn')){
        const btn=document.createElement('button'); btn.id='voiceSearchBtn'; btn.className='btn ghost voice-btn'; btn.type='button'; btn.textContent='Voice Search';
        btn.onclick=startVoiceSearch;
        toolbar.appendChild(btn);
      }
      const productTitle=$('.detail h1');
      if(productTitle && !$('#aiPriceBox')) addPriceBox();
    });
    mo.observe(app,{childList:true,subtree:true});
  }

  function startVoiceSearch(){
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR) return alert('Voice search is not supported in this browser. Try Chrome on Android/Desktop.');
    const rec=new SR(); rec.lang=(localStorage.hpLang==='hi'?'hi-IN':'en-IN'); rec.interimResults=false;
    $('#voiceSearchBtn').textContent='Listening...';
    rec.onresult=e=>{ const text=e.results[0][0].transcript; const search=$('#search'); if(search){ search.value=text; search.dispatchEvent(new Event('input')); } else location.hash='#marketplace'; setTimeout(()=>{ const s=$('#search'); if(s){s.value=text;s.dispatchEvent(new Event('input'));}},350); };
    rec.onend=()=>{ const b=$('#voiceSearchBtn'); if(b)b.textContent='Voice Search'; };
    rec.start();
  }

  function addPriceBox(){
    const detail=$('.detail > div:last-child'); if(!detail) return;
    const id=(location.hash||'').replace('#product-','');
    const p=products().find(x=>String(x.id)===String(id)); if(!p) return;
    const estimate=estimatePrice(p);
    const box=document.createElement('div'); box.id='aiPriceBox'; box.className='card ai-price-box';
    box.innerHTML=`<h3>AI price guidance</h3><p class="muted">Estimated fair range based on category, condition, year and demo marketplace data.</p><div class="price-range"><strong>${money(estimate.low)}</strong><span>to</span><strong>${money(estimate.high)}</strong></div><small>This is a guide, not a guarantee. Final price depends on inspection, documents and location.</small>`;
    detail.appendChild(box);
  }

  function estimatePrice(p){
    const base=+p.price||100000; const age=Math.max(0,new Date().getFullYear()-(+p.year||new Date().getFullYear()));
    const condition=(p.condition||'').toLowerCase(); let spread=condition.includes('new')?0.08:0.18;
    const agePenalty=Math.min(age*0.015,0.25); const low=Math.round(base*(1-spread-agePenalty)); const high=Math.round(base*(1+spread));
    return {low:Math.max(999,low), high:Math.max(low+1000,high)};
  }

  function makeAI(){
    if($('#aiAssistant')) return;
    const wrap=document.createElement('aside'); wrap.id='aiAssistant'; wrap.className='ai-assistant';
    wrap.innerHTML=`<button class="ai-toggle" id="aiToggle">AI</button><div class="ai-panel" id="aiPanel"><div class="ai-head"><strong>Harvester AI</strong><button id="aiClose">×</button></div><div id="aiMessages" class="ai-messages"><div class="ai-msg bot">Namaste! Tell me your crop, budget, brand or part. I can suggest machines, plans and next steps.</div></div><div class="ai-quick"><button data-q="tractor under 5 lakh">Tractor under 5 lakh</button><button data-q="best plan for dealer">Best dealer plan</button><button data-q="parts for John Deere">Parts for John Deere</button></div><form id="aiForm"><input id="aiInput" placeholder="Ask in Hindi/English…"><button>Send</button></form></div>`;
    document.body.appendChild(wrap);
    $('#aiToggle').onclick=()=>$('#aiPanel').classList.toggle('show'); $('#aiClose').onclick=()=>$('#aiPanel').classList.remove('show');
    $$('#aiAssistant [data-q]').forEach(b=>b.onclick=()=>askAI(b.dataset.q));
    $('#aiForm').onsubmit=e=>{e.preventDefault(); const input=$('#aiInput'); askAI(input.value); input.value='';};
  }

  function askAI(q){
    q=(q||'').trim(); if(!q) return;
    addMsg(q,'user'); setTimeout(()=>addMsg(answer(q),'bot'),250);
  }
  function addMsg(t,who){ const box=$('#aiMessages'); const div=document.createElement('div'); div.className='ai-msg '+who; div.innerHTML=t; box.appendChild(div); box.scrollTop=box.scrollHeight; }
  function answer(q){
    const text=q.toLowerCase(); const ps=products();
    const budgetMatch=text.match(/(under|below|less than|तक|नीचे)\s*([0-9,.]+)\s*(lakh|lac|लाख|k)?/i);
    let budget=null; if(budgetMatch){budget=parseFloat(budgetMatch[2].replace(/,/g,'')); budget*=budgetMatch[3]?.toLowerCase().includes('l')||budgetMatch[3]?.includes('लाख')?100000:1000;}
    let filtered=ps.filter(p=>{
      const blob=`${p.title} ${p.brand} ${p.model} ${p.categoryName||p.category} ${p.type}`.toLowerCase();
      const brandHit=['mahindra','swaraj','john deere','sonalika','new holland','massey','kubota'].some(b=>text.includes(b)&&blob.includes(b));
      const catHit=['tractor','harvester','parts','spare','seed','drill','rotavator','reaper','baler'].some(c=>text.includes(c)&&blob.includes(c));
      return (budget?+p.price<=budget:true) && (brandHit||catHit||text.length<18);
    }).slice(0,3);
    if(text.includes('plan')||text.includes('dealer')) return `For dealers, start with <b>Gold/Platinum</b> if you need featured listings. For testing, buy a lower plan first, then upgrade after real leads start.`;
    if(text.includes('verify')||text.includes('seller')) return `To sell, complete seller verification: Aadhaar front/back, phone OTP, shop/farm photo and admin approval. Then choose a plan and post listings.`;
    if(!filtered.length) filtered=ps.slice(0,3);
    return `Best matches I found:<br>${filtered.map(p=>`<a href="#product-${p.id}">${p.title}</a> — <b>${money(p.price)}</b>`).join('<br>')}<br><br>Tip: inspect documents, engine hours, condition and seller verification before payment.`;
  }

  async function savePayment(plan){
    try{
      if(window.sb && window.state?.user){
        await window.sb.from('plan_orders').insert({plan_id:plan.id||plan.name,user_id:window.state.user.id,amount:plan.price,status:'paid'});
      }
    }catch(e){ console.warn(e); }
  }

  window.buyPlan = function(planId){
    const plans=window.state?.plans||window.D?.plans||[]; const plan=plans.find(p=>String(p.id||p.name)===String(planId))||plans[0];
    if(!plan) return alert('Plan not found.');
    if(!window.Razorpay || !window.HP_PAYMENTS.razorpayKeyId || window.HP_PAYMENTS.razorpayKeyId.includes('REPLACE')){
      alert(`Demo payment: ${plan.name} ${money(plan.price)} selected. Add Razorpay key in pro-features.js or config to go live.`);
      savePayment({...plan,status:'demo'}); return;
    }
    const rz=new Razorpay({
      key:window.HP_PAYMENTS.razorpayKeyId, amount:(+plan.price||0)*100, currency:'INR', name:window.HP_PAYMENTS.merchantName,
      description:`${plan.name} seller plan`, handler:async function(res){ await savePayment({...plan,razorpay_payment_id:res.razorpay_payment_id}); alert('Payment successful. Plan activation saved.'); },
      prefill:{name:window.state?.profile?.full_name||'',email:window.state?.user?.email||''}, theme:{color:'#0f3d2e'}
    }); rz.open();
  };

  document.addEventListener('DOMContentLoaded',()=>{installPWA(); enhanceTransitions(); injectSearchTools(); makeAI();});
})();

/* v12 production helpers: lazy media, safe external links, basic performance badge */
(function(){
  function hardenLinks(){document.querySelectorAll('a[target="_blank"]').forEach(a=>{a.rel='noopener noreferrer';});}
  function lazyImages(){document.querySelectorAll('img:not([loading])').forEach(img=>{img.loading='lazy';img.decoding='async';});}
  function perfBadge(){
    if(localStorage.hpPerfBadge!=='on') return;
    const b=document.createElement('div');b.className='performance-chip';b.textContent='Optimized build';document.body.appendChild(b);
  }
  function safeHash(){
    if(!location.hash) location.replace('#home');
    addEventListener('hashchange',()=>{document.getElementById('siteNav')?.classList.remove('show','open','active');document.body.classList.remove('menu-open');});
  }
  document.addEventListener('DOMContentLoaded',()=>{hardenLinks();lazyImages();perfBadge();safeHash();});
  new MutationObserver(()=>{hardenLinks();lazyImages();}).observe(document.documentElement,{childList:true,subtree:true});
})();
