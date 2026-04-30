(() => {
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const {products,categories,brands,states,districtsByState,languages,plans,titles} = window.HP_DATA;
  const cfg = window.HP_CONFIG;
  let state = { route:'home', lang:localStorage.hp_lang || '', cart: JSON.parse(localStorage.hp_cart||'[]'), user: JSON.parse(localStorage.hp_user||'null'), filter:{q:'',category:'',brand:'',state:'',district:'',type:''}, selectedProduct:null };
  let supabaseClient = null;
  if (window.supabase && cfg.SUPABASE_URL && !cfg.SUPABASE_URL.includes('YOUR_')) supabaseClient = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);

  const money = n => '₹' + Number(n).toLocaleString('en-IN');
  const toast = m => { const t=$('#toast'); t.textContent=m; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),2200); };
  const saveCart = () => { localStorage.hp_cart = JSON.stringify(state.cart); $('#cartCount').textContent = state.cart.reduce((a,b)=>a+b.qty,0); };
  const route = r => { state.route = r || location.hash.replace('#','') || 'home'; closeMenu(); window.scrollTo({top:0,behavior:'smooth'}); render(); };
  window.addEventListener('hashchange',()=>route());

  function init(){
    setTimeout(()=>$('#intro')?.classList.add('done'),1450);
    if(state.lang) $('#languageModal').classList.remove('active');
    renderLanguage(); saveCart(); bindGlobal(); route();
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(()=>{});
  }
  function bindGlobal(){
    $('#menuBtn').onclick=openMenu; $$('#smartMenu [data-close="menu"]').forEach(x=>x.onclick=closeMenu);
    $('#loginBtn').onclick=()=>openAuth(); $('#languageBtn').onclick=()=>$('#languageModal').classList.add('active');
    $('#continueLanguage').onclick=()=>{ state.lang ||= 'English'; localStorage.hp_lang=state.lang; $('#languageModal').classList.remove('active'); toast(`Language: ${state.lang}`); };
    document.body.addEventListener('click',e=>{ const btn=e.target.closest('[data-route]'); if(btn){ location.hash=btn.dataset.route; }});
    $('#scrollTop').onclick=()=>scrollTo({top:0,behavior:'smooth'});
    addEventListener('scroll',()=>$('#scrollTop').classList.toggle('show',scrollY>500),{passive:true});
    $('#cartBubble').onclick=()=>location.hash='cart';
    $('#aiFab').onclick=()=>$('#aiPanel').classList.add('open'); $('#closeAi').onclick=()=>$('#aiPanel').classList.remove('open');
    $('#aiForm').onsubmit=e=>{e.preventDefault(); askAI($('#aiInput').value); $('#aiInput').value='';};
  }
  function renderLanguage(){
    $('#languageGrid').innerHTML = languages.map(l=>`<button class="${state.lang===l?'active':''}" data-lang="${l}">${l}</button>`).join('');
    $$('#languageGrid button').forEach(b=>b.onclick=()=>{state.lang=b.dataset.lang; $$('#languageGrid button').forEach(x=>x.classList.remove('active')); b.classList.add('active');});
  }
  function openMenu(){
    $('#smartMenu').classList.add('open'); $('#smartMenu').setAttribute('aria-hidden','false');
    $('#accountBlock').innerHTML = state.user ? `<b>${state.user.name}</b><p>${state.user.role} • Verified demo account</p><button class="btn dark full" id="logoutNow">Logout</button>` : `<b>Welcome to Harvester Parts</b><p>Login to sell, buy, chat and earn rewards.</p><button class="btn full" id="menuLogin">Login / Register</button>`;
    $('#menuLogin')?.addEventListener('click',()=>{closeMenu();openAuth();}); $('#logoutNow')?.addEventListener('click',()=>{state.user=null;localStorage.removeItem('hp_user');closeMenu();toast('Logged out');});
    $('#menuCats').innerHTML = categories.slice(0,10).map(c=>`<button data-cat="${c[1]}">${c[1]}</button>`).join('');
    $$('#menuCats button').forEach(b=>b.onclick=()=>{state.filter.category=b.dataset.cat; closeMenu(); location.hash='marketplace';});
  }
  function closeMenu(){ $('#smartMenu').classList.remove('open'); $('#smartMenu').setAttribute('aria-hidden','true'); }
  function openAuth(){
    const modal=document.createElement('div'); modal.className='modal active'; modal.innerHTML=`<div class="modal-card"><button class="round" style="float:right" data-x>×</button><p class="eyebrow">Account</p><h2 style="font-family:var(--serif);font-size:54px;margin:0">Login / Register</h2><div class="forms-grid" style="margin-top:18px"><input id="authName" placeholder="Full name"><select id="authRole"><option>Buyer</option><option>Seller</option><option>Dealer</option><option>Admin</option></select><input id="authPhone" placeholder="Phone number"><input id="authEmail" placeholder="Email"></div><button class="btn dark full" id="authSave" style="margin-top:16px">Continue</button></div>`;
    document.body.appendChild(modal); modal.querySelector('[data-x]').onclick=()=>modal.remove(); modal.querySelector('#authSave').onclick=()=>{ state.user={name:$('#authName').value||'Harvester User',role:$('#authRole').value,phone:$('#authPhone').value,email:$('#authEmail').value}; localStorage.hp_user=JSON.stringify(state.user); modal.remove(); toast('Account ready'); };
  }

  function render(){
    const r = location.hash.replace('#','') || state.route || 'home';
    if(r.startsWith('product-')) return productPage(r.replace('product-',''));
    const views = {home, marketplace, selector, plans:plansView, rewards, sell, admin, cart, chat};
    ($('#app')).innerHTML = (views[r]||home)();
    afterRender(r);
  }
  function home(){ return `
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">Verified Agricultural Marketplace</p>
        <h1>Buy machines. Sell equipment. Source genuine parts.</h1>
        <p>Harvester Parts is a complete agriculture trading platform for buyers, verified sellers and dealers — combining Amazon-style product discovery with OLX-style local enquiries for tractors, harvesters, implements and spare parts.</p>
        <div class="hero-actions"><a class="btn" href="#marketplace" id="browseMarketBtn">Explore Marketplace</a><a class="btn dark" href="#sell">Become Verified Seller</a></div>
        <div class="counters live-stats"><div class="counter"><b data-count="72000">0</b><span> Products</span></div><div class="counter"><b data-count="18000">0</b><span> Dealers</span></div><div class="counter"><b data-count="640">0</b><span> Districts</span></div></div>
      </div>
      <div class="hero-visual"><div class="live-card"><p class="eyebrow">Live Platform Pulse</p><h3><span id="liveDeals">128</span> active enquiries</h3><small><span id="liveListings">42</span> listings reviewed today • <span id="liveBuyers">390</span> buyers browsing now</small></div></div>
    </section>
    <section class="pulse-strip" aria-label="Live marketplace numbers">
      <div><span id="pulseOne">256</span><small>live searches</small></div>
      <div><span id="pulseTwo">74</span><small>seller approvals</small></div>
      <div><span id="pulseThree">19</span><small>plan checks</small></div>
      <div><span id="pulseFour">11</span><small>enquiries/min</small></div>
    </section>
    <section class="section"><div class="section-head"><div><p class="eyebrow">Featured Product Carousel</p><h2>Browse like a premium ecommerce store.</h2></div><a class="btn" href="#marketplace">View All</a></div><div class="carousel product-carousel">${products.slice(0,10).map(themeCard).join('')}</div></section>
    <section class="section"><div class="section-head"><div><p class="eyebrow">Complete Agricultural Categories</p><h2>Machinery and parts for every field operation.</h2></div></div><div class="category-grid">${categories.map(c=>`<div class="cat-tile"><p class="eyebrow">${c[0]}</p><h3>${c[1]}</h3><button class="ghost" data-catgo="${c[1]}">Explore</button></div>`).join('')}</div></section>
    <section class="section"><div class="section-head"><div><p class="eyebrow">Demo Catalogue</p><h2>New machines, used machines and spare parts.</h2></div></div><div class="products">${products.slice(12,18).map(productCard).join('')}</div></section>`; }
  function themeCard(p){return `<article class="theme-card" onclick="location.hash='product-${p.id}'"><img src="${p.image}" alt="${p.name}"><span>${p.brand}</span></article>`}
  function productCard(p){return `<article class="product-card" onclick="location.hash='product-${p.id}'"><img src="${p.image}" alt="${p.name}"><div class="product-info"><span class="chip">${p.condition}</span> <span class="chip verified">Verified</span><h3>${p.name}</h3><p>${p.brand} • ${p.state}</p><div class="price">${money(p.price)}</div><small>⭐ ${p.rating} • ${p.seller}</small></div></article>`}
  function marketplace(){
    const list=filtered();
    const districtList = state.filter.state ? (districtsByState[state.filter.state]||[]) : Object.values(districtsByState||{}).flat().slice(0,220);
    return `<section class="section"><p class="eyebrow">Marketplace</p><h2>Search like ecommerce, negotiate like OLX.</h2></section><section class="market-layout"><aside class="filters"><input id="q" placeholder="Search tractors, harvesters, parts" value="${state.filter.q}"><select id="fType"><option value="">All types</option><option ${state.filter.type==='machine'?'selected':''} value="machine">Machines</option><option ${state.filter.type==='part'?'selected':''} value="part">Spare Parts</option></select><select id="fCat"><option value="">All categories</option>${categories.map(c=>`<option ${state.filter.category===c[1]?'selected':''}>${c[1]}</option>`)}</select><select id="fBrand"><option value="">All brands</option>${brands.map(b=>`<option ${state.filter.brand===b?'selected':''}>${b}</option>`)}</select><select id="fState"><option value="">All India + Worldwide</option>${states.map(s=>`<option ${state.filter.state===s?'selected':''}>${s}</option>`)}</select><select id="fDistrict"><option value="">All districts / cities</option>${districtList.map(d=>`<option ${state.filter.district===d?'selected':''}>${d}</option>`)}</select><button class="btn dark" id="clearFilters">Clear Filters</button></aside><div><div class="result-row"><b>${list.length}</b><span>verified demo listings found</span></div><div class="products">${list.map(productCard).join('') || '<div class="empty">No products found.</div>'}</div></div></section>`;
  }
  function filtered(){return products.filter(p=>(!state.filter.q || (p.name+p.brand+p.category).toLowerCase().includes(state.filter.q.toLowerCase())) && (!state.filter.category || p.category===state.filter.category) && (!state.filter.brand || p.brand===state.filter.brand) && (!state.filter.state || p.state===state.filter.state) && (!state.filter.district || p.district===state.filter.district) && (!state.filter.type || p.type===state.filter.type));}
  function productPage(id){
    const p=products.find(x=>x.id===id)||products[0];
    const similar=products.filter(x=>(x.category===p.category||x.brand===p.brand)&&x.id!==p.id).slice(0,8);
    $('#app').innerHTML=`<section class="product-page"><div><div class="gallery-main"><img src="${p.image}" alt="${p.name}"></div><div class="thumb-row"><img src="${p.image}"><img src="https://source.unsplash.com/500x360/?tractor,cabin&sig=${p.id}a"><img src="https://source.unsplash.com/500x360/?farm,machinery&sig=${p.id}b"></div><section class="section tight"><p class="eyebrow">Machine / Part Details</p><div class="spec-grid"><div><b>Engine No.</b><span>${p.engineNo}</span></div><div><b>Chassis No.</b><span>${p.chassisNo}</span></div><div><b>Year</b><span>${p.year}</span></div><div><b>Hours Used</b><span>${p.type==='part'?'Not applicable':p.hours+' hrs'}</span></div><div><b>Horsepower</b><span>${p.hp?p.hp+' HP':'Part item'}</span></div><div><b>Fuel</b><span>${p.fuel}</span></div><div><b>Transmission</b><span>${p.transmission}</span></div><div><b>Ownership</b><span>${p.ownership}</span></div></div></section><section class="section tight"><p class="eyebrow">Seller Notes</p><div class="info-box"><p>${p.desc}</p><ul><li>Documents can be checked before final deal.</li><li>Inspection and local visit can be scheduled with seller.</li><li>Final price, delivery and transfer are confirmed directly with seller.</li></ul></div></section><section class="section tight"><div class="section-head"><div><p class="eyebrow">Reviews & Feedback</p><h2>Buyer confidence</h2></div><button class="btn dark" id="reviewBtn">Post Feedback</button></div><div class="review-grid">${p.reviews.map(r=>`<article class="review-card"><b>${r.name}</b><span>★★★★★</span><p>${r.text}</p></article>`).join('')}</div></section><section class="section tight"><p class="eyebrow">Similar Products</p><div class="carousel">${similar.map(productCard).join('')}</div></section></div><aside class="detail-panel"><span class="chip">${p.condition}</span> <span class="chip verified">Verified Seller</span><span class="chip sale-chip">${p.saleType}</span><h1>${p.name}</h1><div class="price">${money(p.price)}</div><small class="old-price">Indicative market value ${money(p.oldPrice)}</small><div class="deal-box"><b>Sale Type</b><span>${p.type==='part'?'Spare part checkout available':'Machine enquiry and direct seller deal'}</span></div><p><b>Brand:</b> ${p.brand}<br><b>Model:</b> ${p.model}<br><b>Location:</b> ${p.village}, ${p.district}, ${p.state}<br><b>Seller:</b> ${p.seller}<br><b>Stock:</b> ${p.stock}</p><button class="btn full" id="addCart">${p.type==='part'?'Add to Cart':'Send Enquiry'}</button><button class="btn dark full" style="margin-top:10px" id="whatsappBtn">WhatsApp Seller</button><button class="ghost full" style="margin-top:10px" data-route="chat">Open Chat</button><div class="safe-box"><b>Harvester Parts Safety</b><p>Pay only after verification. For demo launch, listings use temporary catalog data and internet images.</p></div></aside></section>`;
    $('#addCart').onclick=()=>addCart(p);
    $('#reviewBtn').onclick=()=>toast('Feedback posting demo ready');
    $('#whatsappBtn').onclick=()=>open(`https://wa.me/${cfg.WHATSAPP_NUMBER}?text=${encodeURIComponent('I am interested in '+p.name+' on Harvester Parts')}`,'_blank');
  }
  function selector(){return `<section class="section"><p class="eyebrow">Machine Selector</p><h2>Brand → model → compatible parts.</h2></section><div class="form-card"><div class="forms-grid"><select id="selBrand">${brands.map(b=>`<option>${b}</option>`)}</select><select id="selModel"><option>5310</option><option>744 FE</option><option>605 DI</option><option>Crop Tiger</option><option>TC5.30</option></select></div><button class="btn" id="findParts" style="margin-top:14px">Find Compatible Products</button></div><section class="section"><div id="selectorResults" class="products"></div></section>`}
  function plansView(){return `<section class="section"><p class="eyebrow">Seller Plans</p><h2>Start ₹999. Scale to ₹15,999.</h2></section><div class="plans">${plans.map((p,i)=>`<article class="plan-card ${i===3?'featured':''}"><span class="chip">${p.tag}</span><h3>${p.name}</h3><div class="plan-price">${money(p.price)}</div><p>${p.listings} listings • ${p.boosts} boosts • verified seller tools • rewards</p><button class="btn full" data-plan="${i}">Buy Plan</button></article>`).join('')}</div>`}
  function rewards(){return `<section class="section"><p class="eyebrow">Rewards</p><h2>Custom badges and titles.</h2></section><div class="badge-grid">${titles.map((t,i)=>`<div class="badge-card"><div class="custom-badge">${t.split(' ').map(w=>w[0]).join('')}</div><h3>${t}</h3><p>Earn through verified listings, sales, purchases, daily tasks and dealer activity.</p><b>+${(i+1)*125} points</b></div>`).join('')}</div>`}
  function sell(){return `<section class="section"><p class="eyebrow">Verified Sellers Only</p><h2>Submit product and verification.</h2></section><div class="forms-grid"><form class="form-card" id="sellForm"><h3>Product Details</h3><input required placeholder="Product title"><select>${categories.map(c=>`<option>${c[1]}</option>`)}</select><select>${brands.map(b=>`<option>${b}</option>`)}</select><input placeholder="Price in INR"><select><option>New</option><option>Used</option><option>Spare Part</option></select><input type="file" multiple><textarea placeholder="Description"></textarea><button class="btn full">Submit Listing</button></form><form class="form-card" id="verifyForm"><h3>Seller Verification</h3><input placeholder="Aadhaar number"><label>Aadhaar Front<input type="file"></label><label>Aadhaar Back<input type="file"></label><label>Shop Photo<input type="file"></label><input placeholder="Phone OTP"><button class="btn dark full">Send For Approval</button></form></div>`}
  function admin(){return `<section class="section"><p class="eyebrow">Admin</p><h2>Approval command center.</h2></section><div class="admin-grid"><div class="dash-card"><b>142</b><p>Pending Sellers</p></div><div class="dash-card"><b>318</b><p>Pending Listings</p></div><div class="dash-card"><b>₹8.4L</b><p>Plan Revenue</p></div><div class="dash-card"><b>27</b><p>Reports</p></div></div><section class="section"><div class="products">${products.slice(0,6).map(p=>`<div class="product-card"><img src="${p.image}"><div class="product-info"><h3>${p.name}</h3><p>${p.seller}</p><button class="btn">Approve</button> <button class="ghost">Reject</button></div></div>`).join('')}</div></section>`}
  function cart(){ const items=state.cart.map(i=>products.find(p=>p.id===i.id)).filter(Boolean); const total=items.reduce((a,p)=>a+p.price*(state.cart.find(i=>i.id===p.id)?.qty||1),0); return `<section class="section"><p class="eyebrow">Cart</p><h2>Checkout spare parts.</h2></section><div class="forms-grid"><div>${items.map(p=>`<div class="product-card" style="margin-bottom:12px"><div class="product-info"><h3>${p.name}</h3><p>${money(p.price)}</p></div></div>`).join('')||'<div class="empty">Cart is empty.</div>'}</div><div class="form-card"><h3>Total ${money(total)}</h3><button class="btn full" id="checkoutBtn">Pay with Razorpay</button></div></div>`}
  function chat(){return `<section class="section"><p class="eyebrow">Messages</p><h2>Buyer seller chat.</h2></section><div class="form-card"><div class="ai-log"><div class="msg">Hello, is this machine available?</div><div class="msg user">Yes, inspection can be scheduled.</div></div><form class="ai-form"><input placeholder="Type message"><button>Send</button></form></div>`}
  function afterRender(r){
    $$('[data-catgo]').forEach(b=>b.onclick=()=>{state.filter.category=b.dataset.catgo; location.hash='marketplace';});
    ['q','fType','fCat','fBrand','fState','fDistrict'].forEach(id=>{$('#'+id)?.addEventListener('input',e=>{const map={q:'q',fType:'type',fCat:'category',fBrand:'brand',fState:'state',fDistrict:'district'}; state.filter[map[id]]=e.target.value; if(id==='fState') state.filter.district=''; render();});});
    $('#clearFilters')?.addEventListener('click',()=>{state.filter={q:'',category:'',brand:'',state:'',district:'',type:''};render();});
    $('#findParts')?.addEventListener('click',()=>{$('#selectorResults').innerHTML=products.filter(p=>p.brand===$('#selBrand').value || p.type==='part').slice(0,9).map(productCard).join('');});
    $$('[data-plan]').forEach(b=>b.onclick=()=>buyPlan(plans[b.dataset.plan]));
    $('#sellForm')?.addEventListener('submit',e=>{e.preventDefault(); toast('Listing submitted for admin approval');});
    $('#verifyForm')?.addEventListener('submit',e=>{e.preventDefault(); toast('Verification sent to admin');});
    $('#checkoutBtn')?.addEventListener('click',()=>pay('Cart checkout', state.cart.reduce((a,i)=>a+(products.find(p=>p.id===i.id)?.price||0)*i.qty,0)));
    initCounters();
    initScrollReveal();
    if($('#liveDeals')) {
      const updatePulse=()=>{
        const set=(id,base,range)=>{ const el=$('#'+id); if(el) el.textContent=base+Math.floor(Math.random()*range); };
        set('liveDeals',128,38); set('liveListings',42,19); set('liveBuyers',390,88);
        set('pulseOne',256,90); set('pulseTwo',74,18); set('pulseThree',19,8); set('pulseFour',11,6);
      };
      updatePulse(); setInterval(updatePulse,2300);
    }
  }
  function addCart(p){ if(p.type!=='part'){toast('Enquiry sent to seller'); return;} const item=state.cart.find(i=>i.id===p.id); item?item.qty++:state.cart.push({id:p.id,qty:1}); saveCart(); toast('Added to cart'); }
  function buyPlan(plan){ pay(plan.name+' plan',plan.price); }
  function pay(name,amount){ if(!amount){toast('Nothing to pay');return;} if(window.Razorpay && !cfg.RAZORPAY_KEY_ID.includes('YOUR_')){ new Razorpay({key:cfg.RAZORPAY_KEY_ID,amount:amount*100,currency:'INR',name:'Harvester Parts',description:name,handler:()=>toast('Payment successful')}).open(); } else toast('Demo payment success. Add Razorpay key in config.js'); }
  function askAI(q){ if(!q.trim())return; const log=$('#aiLog'); log.innerHTML+=`<div class="msg user">${q}</div>`; const words=q.toLowerCase(); let matches=products.filter(p=>words.includes(p.brand.toLowerCase())||words.includes(p.category.toLowerCase().split(' ')[0])||p.name.toLowerCase().includes(words.split(' ')[0])).slice(0,3); let reply=matches.length?`I found ${matches.length} matching options: ${matches.map(p=>p.name+' '+money(p.price)).join(', ')}.`:'Tell me your budget, state and brand. I can suggest tractor, harvester or spare parts.'; log.innerHTML+=`<div class="msg">${reply}</div>`; log.scrollTop=log.scrollHeight; }
  function initCounters(){
    const counters=$$('.counter b');
    if(!counters.length) return;
    const run=(el)=>{ if(el.dataset.done==='1') return; el.dataset.done='1'; animateCount(el,+el.dataset.count); };
    if(!('IntersectionObserver' in window)){ counters.forEach(run); return; }
    const io=new IntersectionObserver(entries=>{ entries.forEach(entry=>{ if(entry.isIntersecting){ run(entry.target); io.unobserve(entry.target); } }); },{threshold:.35,rootMargin:'0px 0px -8% 0px'});
    counters.forEach(el=>io.observe(el));
  }
  function initScrollReveal(){
    const items=$$('.section,.hero,.pulse-strip,.product-card,.theme-card,.cat-tile,.plan-card,.badge-card,.form-card,.dash-card,.counter');
    items.forEach((el,i)=>{ el.classList.add('reveal'); el.style.setProperty('--reveal-delay', Math.min(i%8,7)*55+'ms'); });
    if(!('IntersectionObserver' in window)){ items.forEach(el=>el.classList.add('in-view')); return; }
    const io=new IntersectionObserver(entries=>{ entries.forEach(entry=>{ entry.target.classList.toggle('in-view', entry.isIntersecting); }); },{threshold:.10,rootMargin:'0px 0px -6% 0px'});
    items.forEach(el=>io.observe(el));
  }
  function animateCount(el,target){
    const duration=1350;
    const start=performance.now();
    const tick=(now)=>{ const p=Math.min(1,(now-start)/duration); const eased=1-Math.pow(1-p,3); el.textContent=Math.round(target*eased).toLocaleString('en-IN'); if(p<1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }
  init();
})();
