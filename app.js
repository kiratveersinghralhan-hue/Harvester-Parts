(() => {
  const cfg = window.HP_CONFIG || {};
  const hasConfig = cfg.SUPABASE_URL && !cfg.SUPABASE_URL.includes('YOUR_') && cfg.SUPABASE_ANON_KEY && !cfg.SUPABASE_ANON_KEY.includes('YOUR_');
  const sb = hasConfig && window.supabase ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY) : null;
  const ADMIN_EMAIL = (cfg.ADMIN_EMAIL || 'kiratveersinghralhan@gmail.com').toLowerCase();
  const state = { user:null, profile:null, seller:null, products:[], cart:[], wishlist:[], siteSlides:[], route:'home', currentProduct:null, lang:localStorage.hp_lang || 'en', stats:{products:0,categories:0,sellers:0,orders:0}, admin:{orders:[],sellers:[],products:[],reports:[],contacts:[],plans:[],boosts:[],users:[],badges:[],events:[],memberships:[],docUrls:{},balances:[],payoutAccounts:[],payoutRequests:[],ledger:[],siteSlides:[]}, finance:{balance:null,payoutAccount:null,payoutRequests:[],ledger:[]}, realtimeReady:false };
  const VALID_ROUTES = new Set(['home','market','product','cart','checkout','login','account','sell','messages','orders','admin','membership','categories','about','contact','how','support']);
  function normalizeRouteName(name){ const r=String(name||'home').trim().toLowerCase(); return ({plans:'membership',plan:'membership',order:'orders',message:'messages',parts:'market',browse:'market'}[r] || r); }
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const app = $('#app');
  function isAdminUser(){ return (state.profile?.role==='admin') || ((state.user?.email||'').toLowerCase()===ADMIN_EMAIL); }
  function esc(v){ return String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }


  const RANK_RULES = [
    {key:'starter', title:'Farm Starter', min:0, banner:'Field Starter', next:'rising', subtitle:'New member learning the marketplace'},
    {key:'rising', title:'Rising Trader', min:120, banner:'Rising Trader', next:'trusted', subtitle:'Active seller building first trust'},
    {key:'trusted', title:'Trusted Dealer', min:400, banner:'Trusted Dealer', next:'pro', subtitle:'Verified activity and clean listings'},
    {key:'pro', title:'Pro Seller', min:900, banner:'Pro Seller', next:'elite', subtitle:'Strong catalog and consistent activity'},
    {key:'elite', title:'Elite Harvester Seller', min:1800, banner:'Elite Harvester Seller', next:'legend', subtitle:'Premium seller reputation'},
    {key:'legend', title:'Marketplace Legend', min:3500, banner:'Marketplace Legend', next:null, subtitle:'Top marketplace identity'},
    {key:'founder', title:'Founder 1 of 1', min:999999, banner:'Original Founder', next:null, subtitle:'One-of-one platform owner identity'}
  ];
  const CUSTOM_BADGE_DEFS = {
    founder_1_of_1:{name:'Founder 1 of 1', title:'Platform Founder', tier:'founder', line:'One owner. One original account. Permanent identity.', rarity:'1 OF 1'},
    original_builder:{name:'Original Builder', title:'Built the Market', tier:'founder', line:'Reserved founder-series badge for the platform creator.', rarity:'FOUNDER'},
    admin_crown:{name:'Admin Authority', title:'Control Center', tier:'admin', line:'Can approve, reject, ban and protect platform quality.', rarity:'UNIQUE'},
    market_guardian:{name:'Market Guardian', title:'Safety Admin', tier:'admin', line:'Protects buyers, sellers, documents and marketplace trust.', rarity:'ADMIN'},
    verified_seller:{name:'Verified Seller', title:'Trusted Seller', tier:'green', line:'Documents approved and seller profile reviewed.', rarity:'VERIFIED'},
    first_listing:{name:'First Listing', title:'Marketplace Starter', tier:'bronze', line:'Posted the first product for admin approval.', rarity:'STARTER'},
    growth_seller:{name:'Growth Seller', title:'Listing Builder', tier:'silver', line:'Multiple listings created and seller activity started.', rarity:'GROWTH'},
    trusted_dealer:{name:'Trusted Dealer', title:'Dealer Rank', tier:'gold', line:'High approved catalog activity and trust signals.', rarity:'HIGH'},
    premium_member:{name:'Premium Member', title:'Plan Holder', tier:'premium', line:'Membership plan active with extra rewards and visibility.', rarity:'PLAN'},
    event_champion:{name:'Event Champion', title:'Campaign Winner', tier:'event', line:'Limited reward for future leaderboard events.', rarity:'EVENT'},
    buyer_member:{name:'Buyer Member', title:'Market Member', tier:'base', line:'Joined Harvester Parts marketplace.', rarity:'MEMBER'}
  };

  const FREE_LISTING_LIMIT = 5;
  const DEFAULT_SELLER_COMMISSION_RATE = 0.03;
  const MEMBERSHIP_PLANS = [
    {key:'starter_49', name:'Starter Boost', price:49, days:7, title:'Starter Supporter', banner:'Starter Boost Banner', badge:'Starter Boost', tag:'Entry', listings:6, boost:1, reward:80, feeRate:0.029, discount:'3% lower fee', benefits:['6 total listings after free 5','2.90% seller platform fee','1 listing visibility boost','Starter custom title and banner']},
    {key:'basic_99', name:'Basic Member', price:99, days:15, title:'Basic Member', banner:'Basic Member Banner', badge:'Basic Member', tag:'Popular start', listings:12, boost:2, reward:180, feeRate:0.0275, discount:'8% lower fee', benefits:['12 total listing limit','2.75% seller platform fee','2 boosted listing days','Basic member badge and title']},
    {key:'seller_199', name:'Seller Plus', price:199, days:30, title:'Seller Plus', banner:'Seller Plus Banner', badge:'Seller Plus', tag:'Seller', listings:25, boost:5, reward:420, feeRate:0.025, discount:'17% lower fee', benefits:['25 total listing limit','2.50% seller platform fee','5 boosted listing days','Priority review request']},
    {key:'growth_499', name:'Growth Seller', price:499, days:30, title:'Growth Seller Pro', banner:'Growth Seller Banner', badge:'Growth Plan', tag:'Growth', listings:60, boost:12, reward:1100, feeRate:0.0225, discount:'25% lower fee', benefits:['60 total listing limit','2.25% seller platform fee','12 boosted listing days','Growth seller profile banner']},
    {key:'pro_999', name:'Pro Dealer', price:999, days:45, title:'Pro Dealer', banner:'Pro Dealer Banner', badge:'Pro Dealer', tag:'Best value', listings:150, boost:30, reward:2500, feeRate:0.02, discount:'33% lower fee', benefits:['150 total listing limit','2.00% seller platform fee','30 boost days','Priority seller support']},
    {key:'elite_1999', name:'Elite Dealer', price:1999, days:60, title:'Elite Dealer', banner:'Elite Dealer Banner', badge:'Elite Dealer', tag:'Premium', listings:400, boost:70, reward:6200, feeRate:0.0175, discount:'42% lower fee', benefits:['400 total listing limit','1.75% seller platform fee','70 boost days','Premium profile presence']},
    {key:'partner_2999', name:'Market Partner', price:2999, days:75, title:'Market Partner', banner:'Market Partner Banner', badge:'Market Partner', tag:'Partner', listings:1000, boost:120, reward:9800, feeRate:0.015, discount:'50% lower fee', benefits:['1,000 total listing limit','1.50% seller platform fee','120 boost days','Partner title and banner']},
    {key:'leader_5999', name:'Market Leader', price:5999, days:120, title:'Market Leader', banner:'Market Leader Banner', badge:'Market Leader', tag:'Maximum', listings:999999, boost:250, reward:24000, feeRate:0.0125, discount:'58% lower fee', benefits:['Unlimited fair-usage listings','1.25% seller platform fee','250 boost days','Maximum earning visibility pack']}
  ];

  const ADMIN_UNLOCKED_PLAN = {key:'admin_unlimited', name:'Admin Unlimited Access', price:0, days:9999, title:'Platform Founder', banner:'Original Founder • One of One', badge:'Founder 1 of 1', tag:'Admin', listings:999999, boost:999999, reward:999999, feeRate:0, discount:'Admin unlocked access', benefits:['Unlimited listings','0% seller platform fee for admin test listings','All titles, badges and banners selectable','Full admin controls unlocked']};
  const ADMIN_TITLE_OPTIONS = ['Platform Founder','Founder 1 of 1','Original Builder','Admin Authority','Market Guardian','Market Leader','Elite Dealer','Pro Dealer','Trusted Dealer','Verified Seller','Marketplace Starter'];
  const ADMIN_BANNER_OPTIONS = ['Original Founder • One of One','Founder Gold Banner','Admin Command Banner','Market Guardian Banner','Elite Dealer Banner','Market Leader Banner','Growth Seller Banner','Verified Seller Banner','Starter Banner'];
  const ADMIN_BADGE_OPTIONS = Object.keys(CUSTOM_BADGE_DEFS);

  function userPoints(user=state.profile, seller=state.seller, products=state.products){
    const uid=state.user?.id || user?.auth_id || user?.user_id;
    const mine=(products||[]).filter(p=>String(p.user_id||'')===String(uid));
    const approved=mine.filter(p=>p.status==='approved').length;
    const pending=mine.filter(p=>p.status==='pending').length;
    let pts=approved*120 + pending*25 + mine.length*15;
    if(user?.profile_completed) pts+=50;
    if(seller?.status==='approved') pts+=180;
    if((user?.role==='admin') || ((state.user?.email||user?.email||'').toLowerCase()===ADMIN_EMAIL)) pts=999999;
    return pts;
  }
  function rankForPoints(points){
    if(points>=999999) return RANK_RULES.find(r=>r.key==='founder');
    let rank=RANK_RULES[0];
    for(const r of RANK_RULES.filter(x=>x.key!=='founder')) if(points>=r.min) rank=r;
    return rank;
  }
  function nextRankInfo(points){
    const current=rankForPoints(points);
    if(!current.next) return {current,next:null,progress:100,needed:0};
    const next=RANK_RULES.find(r=>r.key===current.next);
    const progress=Math.max(0,Math.min(100,Math.round(((points-current.min)/(next.min-current.min))*100)));
    return {current,next,progress,needed:Math.max(0,next.min-points)};
  }
  function earnedBadges(){
    const pts=userPoints();
    const mine=state.products.filter(p=>String(p.user_id||'')===String(state.user?.id));
    const approved=mine.filter(p=>p.status==='approved').length;
    const arr=['buyer_member'];
    if(isAdminUser()) arr.unshift('founder_1_of_1','original_builder','admin_crown','market_guardian');
    if(state.profile?.active_membership) arr.push('premium_member');
    if(state.seller?.status==='approved') arr.push('verified_seller');
    if(mine.length>=1) arr.push('first_listing');
    if(mine.length>=3) arr.push('growth_seller');
    if(approved>=10 || pts>=900) arr.push('trusted_dealer');
    return [...new Set(arr)];
  }
  function customBadge(key, locked=false){
    const b=CUSTOM_BADGE_DEFS[key] || CUSTOM_BADGE_DEFS.buyer_member;
    return `<div class="custom-badge tier-${esc(b.tier)} ${locked?'locked':''}"><span>${esc(b.rarity)}</span><b>${esc(b.name)}</b><small>${esc(b.title)}</small><p>${esc(b.line||'Achievement badge')}</p></div>`;
  }
  function userBanner(){
    if(isAdminUser()) return `<div class="unique-founder-banner"><div><span>ONE OF ONE • NEVER DUPLICATED</span><h2>Original Founder</h2><p><strong>${esc(state.profile?.title_prefix || 'Platform Founder')}</strong> title with selectable founder badge and one-of-one owner banner for ${esc(ADMIN_EMAIL)}.</p><div class="title-row"><em>Title: Platform Founder</em><em>Badge: Founder 1 of 1</em><em>Banner: Original Founder</em></div></div><b>1 / 1</b></div>`;
    const pts=userPoints(); const info=nextRankInfo(pts);
    const plan=activePlan();
    const title=plan?.title || state.profile?.membership_title || info.current.title;
    const banner=plan?.banner || state.profile?.banner_title || info.current.banner;
    return `<div class="rank-banner tier-${esc(info.current.key)} ${plan?'has-plan':''}"><div><span>${esc(plan?plan.tag+' MEMBER':banner)}</span><h2>${esc(title)}</h2><p>${plan?`Active ${esc(plan.name)} membership • ${plan.boost} boost days • ${plan.reward} reward points`:(info.next?`${info.needed} points to ${esc(info.next.title)}`:'Highest rank unlocked')}</p><div class="title-row"><em>Rank: ${esc(info.current.title)}</em><em>Title: ${esc(title)}</em><em>Badge: ${esc(plan?.badge || state.profile?.badge_title || 'Member')}</em></div></div><b>${pts>=999999?'MAX':pts}</b></div>`;
  }
  function rankProgressCard(){
    const pts=userPoints(); const info=nextRankInfo(pts);
    return `<div class="page-card rank-card"><div class="section-head compact"><h2>Rank progress</h2><span class="badge owner">${esc(info.current.title)}</span></div><div class="rank-progress"><div style="width:${info.progress}%"></div></div><div class="rank-meta"><span>${pts>=999999?'Founder rank locked as 1 of 1':`${pts} points earned`}</span><b>${info.next?`${info.progress}% to ${esc(info.next.title)}`:'Top rank'}</b></div><div class="rank-ways"><div><b>+120</b><span>approved listing</span></div><div><b>+180</b><span>seller verified</span></div><div><b>+25</b><span>pending listing</span></div><div><b>+50</b><span>profile complete</span></div></div></div>`;
  }
  function badgeCollectionCard(){
    const have=earnedBadges(); const all=['founder_1_of_1','original_builder','admin_crown','market_guardian','premium_member','verified_seller','first_listing','growth_seller','trusted_dealer','event_champion','buyer_member'];
    return `<div class="page-card badge-collection"><div class="section-head compact"><h2>Badge collection</h2><span class="badge">${have.length} earned</span></div><p class="muted">Custom text badges only. No icon badges. More event badges can be added later.</p><div class="badge-grid-custom">${all.map(k=>customBadge(k,!have.includes(k))).join('')}</div></div>`;
  }
  function eventPreviewCard(){
    return `<div class="page-card event-preview-card"><div class="section-head compact"><h2>Future events</h2><span class="badge owner">Ready</span></div><p class="muted">Use this system later for challenges like highest listings, most approved sellers, most orders or festival rewards.</p><div class="event-strip"><div><b>Listing Sprint</b><span>Highest approved listings wins a custom event badge.</span></div><div><b>Dealer Week</b><span>Top seller gets a limited banner and title.</span></div><div><b>Buyer Trust Drive</b><span>Reward trusted buying activity and completed profiles.</span></div></div></div>`;
  }

  const i18n = {
    en:{choose_language:'Choose your language',language_hint:'You can change it anytime from the menu.',dont_show:'Do not show again',install_title:'Add Harvester Parts to your phone',install_hint:'For faster access, install it like an app.',parts:'Parts',sell:'Sell',orders:'Orders'},
    hi:{choose_language:'अपनी भाषा चुनें',language_hint:'आप इसे मेनू से कभी भी बदल सकते हैं।',dont_show:'फिर न दिखाएं',install_title:'Harvester Parts को फोन में जोड़ें',install_hint:'तेज उपयोग के लिए इसे ऐप की तरह जोड़ें।',parts:'पार्ट्स',sell:'बेचें',orders:'ऑर्डर'},
    pa:{choose_language:'ਆਪਣੀ ਭਾਸ਼ਾ ਚੁਣੋ',language_hint:'ਤੁਸੀਂ ਇਹ ਮੀਨੂ ਤੋਂ ਬਾਅਦ ਵੀ ਬਦਲ ਸਕਦੇ ਹੋ।',dont_show:'ਦੁਬਾਰਾ ਨਾ ਦਿਖਾਓ',install_title:'Harvester Parts ਫੋਨ ਵਿੱਚ ਜੋੜੋ',install_hint:'ਤੇਜ਼ ਪਹੁੰਚ ਲਈ ਇਸਨੂੰ ਐਪ ਵਾਂਗ ਜੋੜੋ।',parts:'ਪਾਰਟਸ',sell:'ਵੇਚੋ',orders:'ਆਰਡਰ'},
    ta:{choose_language:'மொழியை தேர்ந்தெடுக்கவும்',language_hint:'பின்னர் மெனுவில் மாற்றலாம்.',dont_show:'மீண்டும் காட்ட வேண்டாம்',install_title:'Harvester Parts-ஐ தொலைபேசியில் சேர்க்கவும்',install_hint:'வேகமாக பயன்படுத்த app போல சேர்க்கவும்.',parts:'பாகங்கள்',sell:'விற்க',orders:'ஆர்டர்கள்'},
    te:{choose_language:'మీ భాషను ఎంచుకోండి',language_hint:'మెనూ నుండి ఎప్పుడైనా మార్చవచ్చు.',dont_show:'మళ్లీ చూపించవద్దు',install_title:'Harvester Parts ను ఫోన్ లో జోడించండి',install_hint:'త్వరగా వాడేందుకు యాప్ లా జోడించండి.',parts:'భాగాలు',sell:'అమ్మండి',orders:'ఆర్డర్లు'},
    bn:{choose_language:'ভাষা নির্বাচন করুন',language_hint:'মেনু থেকে পরে পরিবর্তন করা যাবে।',dont_show:'আবার দেখাবেন না',install_title:'Harvester Parts ফোনে যোগ করুন',install_hint:'দ্রুত ব্যবহারের জন্য অ্যাপের মতো যোগ করুন।',parts:'পার্টস',sell:'বিক্রি করুন',orders:'অর্ডার'},
    mr:{choose_language:'भाषा निवडा',language_hint:'मेनूमधून कधीही बदलू शकता.',dont_show:'पुन्हा दाखवू नका',install_title:'Harvester Parts फोनमध्ये जोडा',install_hint:'जलद वापरासाठी अॅपसारखे जोडा.',parts:'पार्ट्स',sell:'विका',orders:'ऑर्डर'},
    gu:{choose_language:'ભાષા પસંદ કરો',language_hint:'તમે મેનુમાંથી પછી બદલી શકો છો.',dont_show:'ફરી ન બતાવો',install_title:'Harvester Parts ફોનમાં ઉમેરો',install_hint:'ઝડપી વપરાશ માટે એપ જેવી ઉમેરો.',parts:'પાર્ટ્સ',sell:'વેચો',orders:'ઓર્ડર'}
  };
  const uiText = {
    hi: {
      'Home':'होम','Browse Marketplace':'मार्केट देखें','Sell a Part':'पार्ट बेचें','Cart':'कार्ट','Checkout':'चेकआउट','Messages':'संदेश','My Orders':'मेरे ऑर्डर','My Account':'मेरा अकाउंट','Admin Panel':'एडमिन पैनल','Login / Signup':'लॉगिन / साइनअप','Logout':'लॉगआउट','Language':'भाषा','Market':'मार्केट','Chat':'चैट','Account':'अकाउंट','Login':'लॉगिन','Admin':'एडमिन','Parts':'पार्ट्स','Sell':'बेचें','Orders':'ऑर्डर',
      'Buy verified harvester parts with secure orders and admin-approved sellers.':'सुरक्षित ऑर्डर और एडमिन-अप्रूव्ड sellers के साथ verified harvester parts खरीदें।','Verified sellers':'Verified sellers','Secure checkout':'सुरक्षित checkout','Buyer protection':'Buyer protection','Browse parts':'Parts देखें','Sell parts':'Parts बेचें','Trending parts':'Trending parts','Shop by farming need':'खेती की जरूरत के हिसाब से खरीदें','Products':'Products','Sellers':'Sellers','States covered':'States covered',
      'Search parts, bearings, cutter, shaft...':'Parts, bearings, cutter, shaft खोजें...','All categories':'सभी categories','Newest':'नया','Price: low to high':'कीमत: कम से ज्यादा','Price: high to low':'कीमत: ज्यादा से कम','Details':'Details','Add to Cart':'कार्ट में जोड़ें','Buy Now':'अभी खरीदें','Wishlist':'Wishlist','Message Seller':'Seller को message करें','Contact seller for exact final price.':'Exact final price के लिए seller से contact करें।',
      'Your cart.':'आपका cart.','Cart is empty.':'Cart खाली है.','Subtotal':'Subtotal','Estimated shipping':'Estimated shipping','Handling':'Handling','Buyer platform fee':'Buyer platform fee','Total estimate':'Total estimate','Place Secure Order':'सुरक्षित order करें','Full name':'पूरा नाम','Phone':'फोन','City / village':'City / village','Pincode':'Pincode','Full delivery address':'पूरा delivery address','Standard Cargo':'Standard Cargo','Premium Blue Dart estimate':'Premium Blue Dart estimate','Razorpay Online':'Razorpay Online','Pay after seller confirmation':'Seller confirmation के बाद pay करें','Apply':'Apply',
      'Login / Create Account':'Login / Create Account','Email':'Email','Password':'Password','Continue':'Continue','New users are created automatically.':'New users are created automatically.','List a Product':'Product list करें','Product name':'Product name','Listing price':'Listing price','Category e.g. Bearing, Cutter Part':'Category e.g. Bearing, Cutter Part','Submit Listing for Approval':'Approval के लिए listing submit करें','Orders':'ऑर्डर','No orders yet.':'अभी कोई order नहीं.'
    },
    pa: {
      'Home':'ਹੋਮ','Browse Marketplace':'ਮਾਰਕੀਟ ਵੇਖੋ','Sell a Part':'ਪਾਰਟ ਵੇਚੋ','Cart':'ਕਾਰਟ','Checkout':'ਚੈੱਕਆਉਟ','Messages':'ਸੁਨੇਹੇ','My Orders':'ਮੇਰੇ ਆਰਡਰ','My Account':'ਮੇਰਾ ਖਾਤਾ','Admin Panel':'ਐਡਮਿਨ ਪੈਨਲ','Login / Signup':'ਲਾਗਇਨ / ਸਾਈਨਅੱਪ','Logout':'ਲਾਗਆਉਟ','Language':'ਭਾਸ਼ਾ','Market':'ਮਾਰਕੀਟ','Chat':'ਚੈਟ','Account':'ਖਾਤਾ','Login':'ਲਾਗਇਨ','Admin':'ਐਡਮਿਨ','Parts':'ਪਾਰਟਸ','Sell':'ਵੇਚੋ','Orders':'ਆਰਡਰ',
      'Buy verified harvester parts with secure orders and admin-approved sellers.':'ਸੁਰੱਖਿਅਤ ਆਰਡਰ ਅਤੇ ਐਡਮਿਨ-ਅਪ੍ਰੂਵਡ sellers ਨਾਲ verified harvester parts ਖਰੀਦੋ।','Verified sellers':'Verified sellers','Secure checkout':'ਸੁਰੱਖਿਅਤ checkout','Buyer protection':'Buyer protection','Browse parts':'Parts ਵੇਖੋ','Sell parts':'Parts ਵੇਚੋ','Trending parts':'Trending parts','Shop by farming need':'ਖੇਤੀ ਦੀ ਲੋੜ ਮੁਤਾਬਕ ਖਰੀਦੋ','Products':'Products','Sellers':'Sellers','States covered':'States covered',
      'Search parts, bearings, cutter, shaft...':'Parts, bearings, cutter, shaft ਲੱਭੋ...','All categories':'ਸਾਰੀਆਂ categories','Newest':'ਨਵਾਂ','Price: low to high':'ਕੀਮਤ: ਘੱਟ ਤੋਂ ਵੱਧ','Price: high to low':'ਕੀਮਤ: ਵੱਧ ਤੋਂ ਘੱਟ','Details':'Details','Add to Cart':'ਕਾਰਟ ਵਿੱਚ ਪਾਓ','Buy Now':'ਹੁਣੇ ਖਰੀਦੋ','Wishlist':'Wishlist','Message Seller':'Seller ਨੂੰ message ਕਰੋ','Contact seller for exact final price.':'Exact final price ਲਈ seller ਨਾਲ contact ਕਰੋ।',
      'Your cart.':'ਤੁਹਾਡਾ cart.','Cart is empty.':'Cart ਖਾਲੀ ਹੈ.','Subtotal':'Subtotal','Estimated shipping':'Estimated shipping','Handling':'Handling','Buyer platform fee':'Buyer platform fee','Total estimate':'Total estimate','Place Secure Order':'ਸੁਰੱਖਿਅਤ order ਕਰੋ','Full name':'ਪੂਰਾ ਨਾਮ','Phone':'ਫੋਨ','City / village':'ਸ਼ਹਿਰ / ਪਿੰਡ','Pincode':'ਪਿੰਨਕੋਡ','Full delivery address':'ਪੂਰਾ delivery address','Standard Cargo':'Standard Cargo','Premium Blue Dart estimate':'Premium Blue Dart estimate','Razorpay Online':'Razorpay Online','Pay after seller confirmation':'Seller confirmation ਤੋਂ ਬਾਅਦ pay ਕਰੋ','Apply':'Apply',
      'Login / Create Account':'ਲਾਗਇਨ / ਖਾਤਾ ਬਣਾਓ','Email':'ਈਮੇਲ','Password':'ਪਾਸਵਰਡ','Continue':'ਜਾਰੀ ਰੱਖੋ','New users are created automatically.':'ਨਵੇਂ users automatically ਬਣ ਜਾਂਦੇ ਹਨ.','List a Product':'Product list ਕਰੋ','Product name':'Product name','Listing price':'Listing price','Category e.g. Bearing, Cutter Part':'Category e.g. Bearing, Cutter Part','Submit Listing for Approval':'Approval ਲਈ listing submit ਕਰੋ','No orders yet.':'ਅਜੇ ਕੋਈ order ਨਹੀਂ.'
    }
  };
  function t(k){return (i18n.en&&i18n.en[k])||k}
  function tx(text){ return (window.HP_TRANSLATE ? window.HP_TRANSLATE(text) : text); }
  const COMMON_TRANSLATIONS = {
    hi:{
      'Guest':'अतिथि','Buyer':'खरीदार','Buyer / Seller':'खरीदार / विक्रेता','Platform Owner / Admin':'प्लेटफॉर्म मालिक / एडमिन','Home':'होम','Market':'मार्केट','Chat':'चैट','Account':'अकाउंट','Cart':'कार्ट','Login':'लॉगिन','Logout':'लॉगआउट','Login / Signup':'लॉगिन / साइनअप','My Account':'मेरा अकाउंट','My Orders':'मेरे ऑर्डर','Messages':'संदेश','Checkout':'चेकआउट','Browse Marketplace':'मार्केट देखें','Sell a Part':'पार्ट बेचें','List Product':'प्रोडक्ट जोड़ें','Sell a Product':'प्रोडक्ट बेचें','Admin Panel':'एडमिन पैनल','Admin':'एडमिन','Language':'भाषा',
      'Verified agricultural marketplace':'प्रमाणित कृषि मार्केटप्लेस','Buy & sell farm parts with confidence.':'भरोसे के साथ फार्म पार्ट्स खरीदें और बेचें।','Harvester Parts connects buyers, sellers and dealers with verified listings, secure checkout, in-app messages and admin approved sellers.':'Harvester Parts खरीदारों, विक्रेताओं और डीलरों को सत्यापित लिस्टिंग, सुरक्षित चेकआउट, इन-ऐप संदेश और एडमिन अप्रूव्ड sellers से जोड़ता है।','Browse Parts':'पार्ट्स देखें','Live products':'लाइव प्रोडक्ट','Categories':'कैटेगरी','Verified sellers':'सत्यापित विक्रेता','Support hours':'सपोर्ट घंटे','% verified flow':'% सत्यापित प्रक्रिया','Shop by farming need':'खेती की जरूरत के हिसाब से खरीदें','Premium categories for quick discovery.':'जल्दी खोज के लिए प्रीमियम कैटेगरी।','Recently listed':'नई लिस्टिंग','View all':'सभी देखें',
      'Search parts, brand, model':'पार्ट, ब्रांड, मॉडल खोजें','All categories':'सभी कैटेगरी','Newest':'नया','Price low':'कम कीमत','Price high':'ज्यादा कीमत','No live catalog. Ask sellers to list products.':'अभी लाइव कैटलॉग नहीं है। sellers से product list करने को कहें।','No matching products':'कोई मिलता-जुलता product नहीं','Product not found':'Product नहीं मिला','Verified Stock':'सत्यापित स्टॉक','Exact price on request':'सटीक कीमत पूछें','Details':'विवरण','Add Cart':'कार्ट में जोड़ें','Add to Cart':'कार्ट में जोड़ें','Buy Now':'अभी खरीदें','Wishlist':'विशलिस्ट','Message Seller':'Seller को message करें','Contact seller for exact final price.':'अंतिम सही कीमत के लिए seller से संपर्क करें।',
      'Your Cart':'आपका कार्ट','Order summary':'ऑर्डर सारांश','Cart is empty. Add products to continue.':'कार्ट खाली है। आगे बढ़ने के लिए products जोड़ें।','Proceed to Checkout':'चेकआउट करें','Subtotal':'सबटोटल','Shipping':'शिपिंग','Platform protection fee':'प्लेटफॉर्म सुरक्षा शुल्क','Total':'कुल','Secure Checkout':'सुरक्षित चेकआउट','Full name':'पूरा नाम','Phone number':'फोन नंबर','Complete delivery address':'पूरा डिलीवरी पता','Pincode':'पिनकोड','Standard delivery':'स्टैंडर्ड डिलीवरी','Premium / heavy courier':'प्रीमियम / भारी कूरियर','Coupon code optional':'कूपन कोड वैकल्पिक','Place Secure Order':'सुरक्षित ऑर्डर करें','Payment Summary':'पेमेंट सारांश','Payment: Razorpay / manual confirmation depending on your active key setup.':'पेमेंट: आपकी key setup के हिसाब से Razorpay / manual confirmation।',
      'Login / Create Account':'लॉगिन / खाता बनाएं','Email':'ईमेल','Password':'पासवर्ड','Continue':'जारी रखें','Create new account':'नया खाता बनाएं','Continue with Google':'Google से जारी रखें','Mobile OTP Login':'मोबाइल OTP लॉगिन','Phone with country code, e.g. +919814800017':'देश कोड वाला फोन, जैसे +919814800017','Send OTP':'OTP भेजें','Verify OTP':'OTP verify करें','OTP code':'OTP कोड','Forgot password?':'पासवर्ड भूल गए?','Reset password':'पासवर्ड रीसेट करें','Email verification may be required after signup.':'Signup के बाद email verification जरूरी हो सकता है।','Profile':'प्रोफाइल','Save Profile':'प्रोफाइल सेव करें','Gender':'लिंग','Male':'पुरुष','Female':'महिला','Other':'अन्य',
      'List a Product':'Product जोड़ें','Product name':'Product नाम','Listing price':'Listing कीमत','Category e.g. Bearing, Cutter Part':'Category जैसे Bearing, Cutter Part','Brand / machine':'Brand / machine','Model / compatibility':'Model / compatibility','Weight kg':'वजन kg','State':'राज्य','District':'जिला','City / village':'शहर / गांव','Describe condition, exact location, compatibility':'Condition, exact location, compatibility लिखें','Submit Listing for Approval':'Approval के लिए listing भेजें','Enter price to see seller payout.':'Seller payout देखने के लिए कीमत डालें।','Orders':'ऑर्डर','No orders yet.':'अभी कोई ऑर्डर नहीं।','Admin access only':'सिर्फ admin access','Platform Owner':'Platform Owner','Product approvals':'Product approvals','No pending products':'कोई pending product नहीं','Approve':'Approve','Reject':'Reject'
    },
    pa:{
      'Guest':'ਮਹਿਮਾਨ','Buyer':'ਖਰੀਦਦਾਰ','Buyer / Seller':'ਖਰੀਦਦਾਰ / ਵਿਕਰੇਤਾ','Platform Owner / Admin':'ਪਲੇਟਫਾਰਮ ਮਾਲਕ / ਐਡਮਿਨ','Home':'ਹੋਮ','Market':'ਮਾਰਕੀਟ','Chat':'ਚੈਟ','Account':'ਖਾਤਾ','Cart':'ਕਾਰਟ','Login':'ਲਾਗਿਨ','Logout':'ਲਾਗਆਉਟ','Login / Signup':'ਲਾਗਿਨ / ਸਾਈਨਅੱਪ','My Account':'ਮੇਰਾ ਖਾਤਾ','My Orders':'ਮੇਰੇ ਆਰਡਰ','Messages':'ਸੁਨੇਹੇ','Checkout':'ਚੈੱਕਆਉਟ','Browse Marketplace':'ਮਾਰਕੀਟ ਵੇਖੋ','Sell a Part':'ਪਾਰਟ ਵੇਚੋ','List Product':'ਪ੍ਰੋਡਕਟ ਜੋੜੋ','Sell a Product':'ਪ੍ਰੋਡਕਟ ਵੇਚੋ','Admin Panel':'ਐਡਮਿਨ ਪੈਨਲ','Admin':'ਐਡਮਿਨ','Language':'ਭਾਸ਼ਾ',
      'Verified agricultural marketplace':'ਤਸਦੀਕਸ਼ੁਦਾ ਖੇਤੀ ਮਾਰਕੀਟਪਲੇਸ','Buy & sell farm parts with confidence.':'ਭਰੋਸੇ ਨਾਲ ਖੇਤੀ ਵਾਲੇ ਪਾਰਟ ਖਰੀਦੋ ਤੇ ਵੇਚੋ।','Harvester Parts connects buyers, sellers and dealers with verified listings, secure checkout, in-app messages and admin approved sellers.':'Harvester Parts ਖਰੀਦਦਾਰਾਂ, ਵਿਕਰੇਤਾਵਾਂ ਅਤੇ ਡੀਲਰਾਂ ਨੂੰ verified listings, secure checkout, in-app messages ਅਤੇ admin approved sellers ਨਾਲ ਜੋੜਦਾ ਹੈ।','Browse Parts':'ਪਾਰਟਸ ਵੇਖੋ','Live products':'ਲਾਈਵ ਪ੍ਰੋਡਕਟ','Categories':'ਕੈਟੇਗਰੀਆਂ','Verified sellers':'ਤਸਦੀਕਸ਼ੁਦਾ ਵਿਕਰੇਤਾ','Support hours':'ਸਪੋਰਟ ਘੰਟੇ','% verified flow':'% verified flow','Shop by farming need':'ਖੇਤੀ ਦੀ ਲੋੜ ਮੁਤਾਬਕ ਖਰੀਦੋ','Premium categories for quick discovery.':'ਤੇਜ਼ ਖੋਜ ਲਈ ਪ੍ਰੀਮੀਅਮ ਕੈਟੇਗਰੀਆਂ।','Recently listed':'ਨਵੀਂ ਲਿਸਟਿੰਗ','View all':'ਸਾਰੇ ਵੇਖੋ',
      'Search parts, brand, model':'ਪਾਰਟ, ਬ੍ਰਾਂਡ, ਮਾਡਲ ਲੱਭੋ','All categories':'ਸਾਰੀਆਂ ਕੈਟੇਗਰੀਆਂ','Newest':'ਨਵਾਂ','Price low':'ਘੱਟ ਕੀਮਤ','Price high':'ਵੱਧ ਕੀਮਤ','No live catalog. Ask sellers to list products.':'ਹਾਲੇ live catalog ਨਹੀਂ ਹੈ। sellers ਨੂੰ products list ਕਰਨ ਲਈ ਕਹੋ।','No matching products':'ਕੋਈ matching product ਨਹੀਂ','Product not found':'Product ਨਹੀਂ ਮਿਲਿਆ','Verified Stock':'ਤਸਦੀਕਸ਼ੁਦਾ ਸਟਾਕ','Exact price on request':'ਸਹੀ ਕੀਮਤ ਪੁੱਛੋ','Details':'ਵੇਰਵਾ','Add Cart':'ਕਾਰਟ ਵਿੱਚ ਪਾਓ','Add to Cart':'ਕਾਰਟ ਵਿੱਚ ਪਾਓ','Buy Now':'ਹੁਣੇ ਖਰੀਦੋ','Wishlist':'ਵਿਸ਼ਲਿਸਟ','Message Seller':'Seller ਨੂੰ ਸੁਨੇਹਾ ਭੇਜੋ','Contact seller for exact final price.':'ਅੰਤਿਮ ਸਹੀ ਕੀਮਤ ਲਈ seller ਨਾਲ ਸੰਪਰਕ ਕਰੋ।',
      'Your Cart':'ਤੁਹਾਡਾ ਕਾਰਟ','Order summary':'ਆਰਡਰ ਸੰਖੇਪ','Cart is empty. Add products to continue.':'ਕਾਰਟ ਖਾਲੀ ਹੈ। ਅੱਗੇ ਵੱਧਣ ਲਈ products ਜੋੜੋ।','Proceed to Checkout':'ਚੈੱਕਆਉਟ ਕਰੋ','Subtotal':'ਸਬਟੋਟਲ','Shipping':'ਸ਼ਿਪਿੰਗ','Platform protection fee':'ਪਲੇਟਫਾਰਮ ਸੁਰੱਖਿਆ ਫੀਸ','Total':'ਕੁੱਲ','Secure Checkout':'ਸੁਰੱਖਿਅਤ ਚੈੱਕਆਉਟ','Full name':'ਪੂਰਾ ਨਾਮ','Phone number':'ਫੋਨ ਨੰਬਰ','Complete delivery address':'ਪੂਰਾ ਡਿਲਿਵਰੀ ਪਤਾ','Pincode':'ਪਿਨਕੋਡ','Standard delivery':'ਸਟੈਂਡਰਡ ਡਿਲਿਵਰੀ','Premium / heavy courier':'ਪ੍ਰੀਮੀਅਮ / heavy courier','Coupon code optional':'ਕੂਪਨ ਕੋਡ optional','Place Secure Order':'ਸੁਰੱਖਿਅਤ ਆਰਡਰ ਕਰੋ','Payment Summary':'ਪੇਮੈਂਟ ਸੰਖੇਪ','Payment: Razorpay / manual confirmation depending on your active key setup.':'ਪੇਮੈਂਟ: ਤੁਹਾਡੀ key setup ਦੇ ਹਿਸਾਬ ਨਾਲ Razorpay / manual confirmation।',
      'Login / Create Account':'ਲਾਗਿਨ / ਖਾਤਾ ਬਣਾਓ','Email':'ਈਮੇਲ','Password':'ਪਾਸਵਰਡ','Continue':'ਜਾਰੀ ਰੱਖੋ','Create new account':'ਨਵਾਂ ਖਾਤਾ ਬਣਾਓ','Continue with Google':'Google ਨਾਲ ਜਾਰੀ ਰੱਖੋ','Mobile OTP Login':'ਮੋਬਾਈਲ OTP ਲਾਗਿਨ','Phone with country code, e.g. +919814800017':'ਦੇਸ਼ ਕੋਡ ਨਾਲ ਫੋਨ, ਜਿਵੇਂ +919814800017','Send OTP':'OTP ਭੇਜੋ','Verify OTP':'OTP verify ਕਰੋ','OTP code':'OTP ਕੋਡ','Forgot password?':'ਪਾਸਵਰਡ ਭੁੱਲ ਗਏ?','Reset password':'ਪਾਸਵਰਡ ਰੀਸੈੱਟ ਕਰੋ','Email verification may be required after signup.':'Signup ਤੋਂ ਬਾਅਦ email verification ਲੋੜੀਂਦੀ ਹੋ ਸਕਦੀ ਹੈ।','Profile':'ਪ੍ਰੋਫਾਈਲ','Save Profile':'ਪ੍ਰੋਫਾਈਲ ਸੇਵ ਕਰੋ','Gender':'ਲਿੰਗ','Male':'ਮਰਦ','Female':'ਔਰਤ','Other':'ਹੋਰ',
      'List a Product':'Product ਜੋੜੋ','Product name':'Product ਨਾਮ','Listing price':'Listing ਕੀਮਤ','Category e.g. Bearing, Cutter Part':'Category ਜਿਵੇਂ Bearing, Cutter Part','Brand / machine':'Brand / machine','Model / compatibility':'Model / compatibility','Weight kg':'ਵਜ਼ਨ kg','State':'ਰਾਜ','District':'ਜ਼ਿਲ੍ਹਾ','City / village':'ਸ਼ਹਿਰ / ਪਿੰਡ','Describe condition, exact location, compatibility':'Condition, exact location, compatibility ਲਿਖੋ','Submit Listing for Approval':'Approval ਲਈ listing ਭੇਜੋ','Enter price to see seller payout.':'Seller payout ਵੇਖਣ ਲਈ ਕੀਮਤ ਪਾਓ।','Orders':'ਆਰਡਰ','No orders yet.':'ਹਾਲੇ ਕੋਈ ਆਰਡਰ ਨਹੀਂ।','Admin access only':'ਸਿਰਫ admin access','Platform Owner':'Platform Owner','Product approvals':'Product approvals','No pending products':'ਕੋਈ pending product ਨਹੀਂ','Approve':'Approve','Reject':'Reject'
    }
  };
  ['ta','te','bn','mr','gu'].forEach(l=>{ COMMON_TRANSLATIONS[l] = Object.assign({}, COMMON_TRANSLATIONS.hi, uiText[l]||{}); });
  Object.assign(COMMON_TRANSLATIONS.hi, {
    'Preparing a verified agri marketplace':'एक प्रमाणित कृषि मार्केटप्लेस तैयार हो रहा है',
    'For faster access, install it like an app.':'तेज उपयोग के लिए इसे ऐप की तरह इंस्टॉल करें।',
    'Tap browser Share button.':'ब्राउज़र का शेयर बटन दबाएं।',
    'Choose “Add to Home Screen”.':'“Add to Home Screen” चुनें।',
    'Open Harvester Parts from your phone.':'फोन से Harvester Parts खोलें।',
    'Continue':'जारी रखें','or':'या','Add Supabase keys first':'पहले Supabase keys जोड़ें','Account created. Please verify your email if Supabase asks.':'अकाउंट बन गया। अगर Supabase पूछे तो ईमेल verify करें।','Logged in':'लॉगिन हो गया','Enter phone with country code, e.g. +919814800017':'देश कोड के साथ फोन डालें, जैसे +919814800017','OTP sent':'OTP भेज दिया गया','Phone login successful':'फोन लॉगिन सफल','Enter your email first':'पहले ईमेल डालें','Password reset link sent to email':'पासवर्ड रीसेट लिंक ईमेल पर भेज दिया गया','Added to cart':'कार्ट में जोड़ दिया','Removed from wishlist':'वishlist से हटाया','Saved to wishlist':'वishlist में सेव किया','Cart is empty':'कार्ट खाली है','Order saved. Connect Razorpay key for online payment.':'ऑर्डर सेव हो गया। ऑनलाइन पेमेंट के लिए Razorpay key जोड़ें।','Payment successful. Order placed.':'पेमेंट सफल। ऑर्डर हो गया।','Listing submitted for admin approval':'लिस्टिंग admin approval के लिए भेजी गई','Message sent inside platform':'संदेश प्लेटफॉर्म में भेजा गया','Product approved':'प्रोडक्ट approve हुआ','Product rejected':'प्रोडक्ट reject हुआ','Profile saved':'प्रोफाइल सेव हुई',
    'Buyer protection':'खरीदार सुरक्षा','Platform fee':'प्लेटफॉर्म फीस','Calculated at checkout':'चेकआउट पर गणना होगी','Seller receives approx.':'Seller को लगभग मिलेगा','Product details':'प्रोडक्ट विवरण','Genuine agricultural spare part listing. Please confirm compatibility, dimensions and condition through in-app message before final purchase.':'असली कृषि spare part listing। अंतिम खरीद से पहले in-app message से compatibility, size और condition confirm करें।','Condition':'स्थिति','Weight':'वजन','Location':'स्थान','Views':'व्यूज','Verified listing':'सत्यापित लिस्टिंग','Spare part':'स्पेयर पार्ट','Harvester Parts':'Harvester Parts','Agricultural Part':'कृषि पार्ट','Stock':'स्टॉक','India':'भारत','Standard / Premium':'स्टैंडर्ड / प्रीमियम',
    'Seller/User ID or email':'Seller/User ID या ईमेल','Write message':'संदेश लिखें','Send Message':'संदेश भेजें','In-app chat protects your platform earnings. Phone numbers and emails are blocked automatically.':'In-app chat आपकी platform earnings बचाता है। फोन नंबर और ईमेल अपने आप block होते हैं।','Orders placed through checkout will show here. Admin can manage shipment and payment status from dashboard.':'Checkout से दिए गए orders यहां दिखेंगे। Admin shipment और payment status dashboard से manage कर सकता है।','Order':'ऑर्डर','pending':'pending','paid':'paid','Products':'प्रोडक्ट्स','Pending listings':'Pending listings','Boosted':'Boosted','ADMIN CONTROL':'ADMIN CONTROL','Go Home':'होम जाएं',
    'Listing price:':'लिस्टिंग कीमत:','Platform marketing fee:':'प्लेटफॉर्म मार्केटिंग फीस:','Seller earns approx:':'Seller को लगभग मिलेगा:'
  });
  Object.assign(COMMON_TRANSLATIONS.pa, {
    'Preparing a verified agri marketplace':'ਤਸਦੀਕਸ਼ੁਦਾ ਖੇਤੀ ਮਾਰਕੀਟਪਲੇਸ ਤਿਆਰ ਹੋ ਰਿਹਾ ਹੈ',
    'For faster access, install it like an app.':'ਤੇਜ਼ ਵਰਤੋਂ ਲਈ ਇਸਨੂੰ ਐਪ ਵਾਂਗ ਇੰਸਟਾਲ ਕਰੋ।',
    'Tap browser Share button.':'ਬਰਾਊਜ਼ਰ ਦਾ Share ਬਟਨ ਦਬਾਓ।','Choose “Add to Home Screen”.':'“Add to Home Screen” ਚੁਣੋ।','Open Harvester Parts from your phone.':'ਫੋਨ ਤੋਂ Harvester Parts ਖੋਲ੍ਹੋ।','Continue':'ਜਾਰੀ ਰੱਖੋ','or':'ਜਾਂ','Add Supabase keys first':'ਪਹਿਲਾਂ Supabase keys ਜੋੜੋ','Account created. Please verify your email if Supabase asks.':'ਅਕਾਊਂਟ ਬਣ ਗਿਆ। ਜੇ Supabase ਪੁੱਛੇ ਤਾਂ email verify ਕਰੋ।','Logged in':'ਲਾਗਿਨ ਹੋ ਗਿਆ','Enter phone with country code, e.g. +919814800017':'ਦੇਸ਼ ਕੋਡ ਨਾਲ ਫੋਨ ਪਾਓ, ਜਿਵੇਂ +919814800017','OTP sent':'OTP ਭੇਜਿਆ ਗਿਆ','Phone login successful':'ਫੋਨ ਲਾਗਿਨ ਸਫਲ','Enter your email first':'ਪਹਿਲਾਂ email ਪਾਓ','Password reset link sent to email':'Password reset link email ਤੇ ਭੇਜਿਆ ਗਿਆ','Added to cart':'ਕਾਰਟ ਵਿੱਚ ਜੋੜਿਆ','Removed from wishlist':'Wishlist ਤੋਂ ਹਟਾਇਆ','Saved to wishlist':'Wishlist ਵਿੱਚ save ਕੀਤਾ','Cart is empty':'ਕਾਰਟ ਖਾਲੀ ਹੈ','Order saved. Connect Razorpay key for online payment.':'Order save ਹੋ ਗਿਆ। Online payment ਲਈ Razorpay key ਜੋੜੋ।','Payment successful. Order placed.':'Payment successful। Order placed।','Listing submitted for admin approval':'Listing admin approval ਲਈ ਭੇਜੀ ਗਈ','Message sent inside platform':'ਸੁਨੇਹਾ platform ਵਿੱਚ ਭੇਜਿਆ ਗਿਆ','Product approved':'Product approve ਹੋਇਆ','Product rejected':'Product reject ਹੋਇਆ','Profile saved':'Profile save ਹੋਈ',
    'Buyer protection':'ਖਰੀਦਦਾਰ ਸੁਰੱਖਿਆ','Platform fee':'ਪਲੇਟਫਾਰਮ ਫੀਸ','Calculated at checkout':'Checkout ਤੇ calculate ਹੋਵੇਗੀ','Seller receives approx.':'Seller ਨੂੰ ਲਗਭਗ ਮਿਲੇਗਾ','Product details':'Product ਵੇਰਵਾ','Genuine agricultural spare part listing. Please confirm compatibility, dimensions and condition through in-app message before final purchase.':'ਅਸਲੀ agriculture spare part listing। Final purchase ਤੋਂ ਪਹਿਲਾਂ in-app message ਨਾਲ compatibility, size ਅਤੇ condition confirm ਕਰੋ।','Condition':'ਹਾਲਤ','Weight':'ਵਜ਼ਨ','Location':'ਸਥਾਨ','Views':'Views','Verified listing':'ਤਸਦੀਕਸ਼ੁਦਾ listing','Spare part':'Spare part','Agricultural Part':'ਖੇਤੀ ਪਾਰਟ','Stock':'ਸਟਾਕ','India':'ਭਾਰਤ','Standard / Premium':'Standard / Premium',
    'Seller/User ID or email':'Seller/User ID ਜਾਂ email','Write message':'ਸੁਨੇਹਾ ਲਿਖੋ','Send Message':'ਸੁਨੇਹਾ ਭੇਜੋ','In-app chat protects your platform earnings. Phone numbers and emails are blocked automatically.':'In-app chat ਤੁਹਾਡੀ platform earnings ਬਚਾਉਂਦਾ ਹੈ। Phone numbers ਅਤੇ emails ਆਪਣੇ ਆਪ block ਹੁੰਦੇ ਹਨ।','Orders placed through checkout will show here. Admin can manage shipment and payment status from dashboard.':'Checkout ਰਾਹੀਂ ਕੀਤੇ orders ਇੱਥੇ ਦਿਖਣਗੇ। Admin shipment ਅਤੇ payment status dashboard ਤੋਂ manage ਕਰ ਸਕਦਾ ਹੈ।','Order':'ਆਰਡਰ','Products':'ਪ੍ਰੋਡਕਟਸ','Pending listings':'Pending listings','Boosted':'Boosted','ADMIN CONTROL':'ADMIN CONTROL','Go Home':'ਹੋਮ ਜਾਓ',
    'Listing price:':'Listing ਕੀਮਤ:','Platform marketing fee:':'Platform marketing fee:','Seller earns approx:':'Seller ਨੂੰ ਲਗਭਗ ਮਿਲੇਗਾ:'
  });
  ['ta','te','bn','mr','gu'].forEach(l=>{ COMMON_TRANSLATIONS[l] = Object.assign({}, COMMON_TRANSLATIONS.hi, uiText[l]||{}); });

  // v77: Core renderer stays in clean English. The standalone language patch
  // translates the visible UI safely after render, so words never get mixed.
  function translateVisibleText(root=document.body){ return; }
  function localizeHtml(html){ return html; }
  function localText(text){ return text; }
  function applyLang(){
    $$('[data-i18n]').forEach(el=>el.textContent=t(el.dataset.i18n));
    $('#languageSelect') && ($('#languageSelect').value=state.lang);
    document.documentElement.lang = state.lang;

    // Header is outside the routed page, so always rebuild its text from English keys.
    const authText = state.user ? 'My Account' : 'Login';
    const authButton = $('#authButton'); if(authButton) authButton.textContent = tx(authText);
    const menuLogin = $('#menuLoginBtn'); if(menuLogin){ menuLogin.textContent = tx('Login / Signup'); menuLogin.classList.toggle('hidden', !!state.user); }
    const logoutBtn = $('#logoutBtn'); if(logoutBtn) logoutBtn.textContent = tx('Logout');
    const cartButton = $('.header-actions .icon-btn[data-route="cart"]');
    if(cartButton){
      const count = state.cart.reduce((sum,item)=>sum+Number(item.qty||1),0);
      cartButton.innerHTML = `${tx('Cart')} <b id="cartCount">${count}</b>`;
    }

    const routeLabels = {
      home:'Home', market:'Market', sell:'Sell a Part', membership:'Membership & Rewards', categories:'Categories', how:'How it works',
      about:'About Us', contact:'Contact Us', support:'Support', messages:'Chat', account:'Account', cart:'Cart', checkout:'Checkout', orders:'My Orders', admin:'Admin Panel'
    };
    $$('.side-menu button[data-route], .bottom-nav button, .nav-tabs button').forEach(el=>{
      if(el.classList.contains('sell-fab') || el.textContent.trim()==='＋'){ el.dataset.rawText='＋'; el.textContent='＋'; return; }
      let key = routeLabels[el.dataset.route] || el.dataset.i18n || el.dataset.label || el.textContent.trim();
      if(el.closest('.bottom-nav') && el.dataset.route === 'membership') key = 'Plans';
      if(el.closest('.nav-tabs') && el.dataset.route === 'membership') key = 'Plans';
      el.dataset.rawText = key;
      el.textContent = tx(key);
    });
    $$('.menu-group-label').forEach(el=>{ const key=(el.textContent||'').trim().toLowerCase()==='main'?'Main':(el.textContent||'').trim().toLowerCase()==='company'?'Company':(el.textContent||'').trim().toLowerCase()==='account'?'Account':el.textContent.trim(); el.textContent=tx(key); });
    const label=$('.menu-lang label'); if(label) label.textContent=tx('Language');
    syncMenu(false);
    translateVisibleText(document.body);
    if(window.HP_APPLY_LANGUAGE) window.HP_APPLY_LANGUAGE();
    updateCartCount();
  }
  function money(n){return '₹' + Math.round(Number(n||0)).toLocaleString('en-IN')}
  function activePlan(){
    if(isAdminUser()) return ADMIN_UNLOCKED_PLAN;
    const key=state.profile?.active_membership || state.profile?.membership_key || '';
    return MEMBERSHIP_PLANS.find(p=>p.key===key) || null;
  }
  function membershipExpiryText(){
    const exp=state.profile?.membership_expires_at;
    if(!exp) return '';
    try{return new Date(exp).toLocaleDateString('en-IN')}catch(e){return ''}
  }
  function planByKey(key){ if(key==='admin_unlimited') return ADMIN_UNLOCKED_PLAN; return MEMBERSHIP_PLANS.find(p=>p.key===key) || null; }
  function sellerPlanKeyFromProduct(p={}){ return p?.users?.active_membership || p?.users?.membership_key || p?.seller_membership_key || p?.membership_key || ''; }
  function commissionRateForKey(key){ return (planByKey(key)?.feeRate) || DEFAULT_SELLER_COMMISSION_RATE; }
  function currentCommissionRate(){ return isAdminUser()?0:(activePlan()?.feeRate || DEFAULT_SELLER_COMMISSION_RATE); }
  function listingLimitForKey(key){ return planByKey(key)?.listings || FREE_LISTING_LIMIT; }
  function currentListingLimit(){ return isAdminUser()?999999:(activePlan()?.listings || FREE_LISTING_LIMIT); }
  function limitLabel(n=currentListingLimit()){ return Number(n)>=999999 ? 'Unlimited' : String(n); }
  function userListingCount(uid=state.user?.id){ return state.products.filter(p=>String(p.user_id||'')===String(uid) && !['rejected','banned','cancelled'].includes(String(p.status||'').toLowerCase())).length; }
  function feeDiscountForPlan(plan=activePlan()){ if(isAdminUser()) return 'Admin account: all plans, titles, banners and listing controls unlocked'; if(!plan) return 'Free plan: 5 listings • 3.00% seller platform fee'; return `${plan.discount} • ${(plan.feeRate*100).toFixed(2)}% seller platform fee`; }
  function sevenBusinessDaysFrom(date=new Date()){
    const d=new Date(date); let added=0;
    while(added<7){ d.setDate(d.getDate()+1); const day=d.getDay(); if(day!==0 && day!==6) added++; }
    return d;
  }
  function payoutDateText(date){ try{return new Date(date).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});}catch(e){return ''} }
  function isSellerApproved(){ return isAdminUser() || ['approved'].includes(String(state.seller?.status||state.seller?.verification_status||'').toLowerCase()); }
  function planCard(p){
    const active=(state.profile?.active_membership===p.key || state.profile?.membership_key===p.key);
    return `<article class="membership-card ${active?'active':''}"><div class="plan-ribbon">${esc(p.tag)}</div><div class="plan-head"><span>${esc(p.banner)}</span><h3>${esc(p.name)}</h3><div class="plan-price">₹${Number(p.price).toLocaleString('en-IN')}<small>/${p.days} days</small></div></div><div class="plan-title-preview"><b>${esc(p.title)}</b><small>${esc(p.badge)} custom badge • no icons</small></div><div class="plan-stats"><div><b>${limitLabel(p.listings)}</b><span>listing limit</span></div><div><b>${(p.feeRate*100).toFixed(2)}%</b><span>seller fee</span></div><div><b>${p.boost}</b><span>boost days</span></div><div><b>${p.reward}</b><span>points</span></div></div><div class="plan-fee-strip"><b>${esc(p.discount)}</b><span>Lower platform commission on seller payout</span></div><ul>${p.benefits.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><button class="${active?'secondary':'primary'}" data-plan-key="${esc(p.key)}">${active?'Current Plan':'Choose Plan'}</button></article>`;
  }
  function freePlanCard(){
    return `<article class="membership-card free-plan-card"><div class="plan-ribbon">Free</div><div class="plan-head"><span>Free Seller Start</span><h3>Free Member</h3><div class="plan-price">₹0<small>/always</small></div></div><div class="plan-title-preview"><b>Marketplace Starter</b><small>Default member title</small></div><div class="plan-stats"><div><b>5</b><span>free listings</span></div><div><b>3.00%</b><span>seller fee</span></div><div><b>0</b><span>boost days</span></div></div><div class="plan-fee-strip"><b>Standard commission</b><span>Example: ₹30,00,000 sale → ₹90,000 platform fee → seller balance ₹29,10,000.</span></div><button class="ghost" data-route="sell">Use Free Plan</button></article>`;
  }
  function membershipPage(){
    const plan=activePlan(); const used=userListingCount(); const limit=currentListingLimit();
    return `<section class="membership-hero page-card"><div><span class="eyebrow">Membership & rewards</span><h1>Plans that increase listing limits and reduce seller platform fees.</h1><p class="muted">Free users can post 5 listings. Paid plans start at ₹49 and unlock more listings, lower commission, custom titles, custom banners, reward points and boost days.</p><div class="hero-actions"><button class="primary" data-route="sell">Start Selling</button><button class="ghost" data-route="account">View My Badges</button></div></div><div class="membership-current ${plan?'active':''}"><span>${plan?'ACTIVE PLAN':'FREE PLAN'}</span><h2>${esc(plan?.name || 'Free Member')}</h2><p>${esc(feeDiscountForPlan(plan))}</p><div class="mini-limit"><b>${used}/${limitLabel(limit)}</b><span>listings used</span></div></div></section><section><div class="section-head"><h2>Choose your plan</h2><p class="muted">Free gives 5 listings. Paid options from ₹49 to ₹5,999 unlock 6 to unlimited listings and lower platform commission.</p></div><div class="membership-grid">${freePlanCard()}${MEMBERSHIP_PLANS.map(planCard).join('')}</div></section><section class="page-card reward-system-card"><div class="section-head compact"><h2>Rewards and membership benefits</h2><span class="badge owner">Ready</span></div><div class="reward-columns"><div><b>Post more</b><span>Points for approved listings and seller verification.</span></div><div><b>Pay less fee</b><span>Higher plans reduce seller platform commission before payout.</span></div><div><b>Win events</b><span>Future events can reward top sellers with limited badges, titles and banners.</span></div></div></section>`;
  }
  async function purchaseMembership(key){
    if(!state.user) return route('login');
    const plan=MEMBERSHIP_PLANS.find(p=>p.key===key);
    if(!plan) return toast('Plan not found');
    const start=new Date(); const exp=new Date(Date.now()+plan.days*86400000);
    const purchase={user_id:state.user.id, plan_key:plan.key, plan_name:plan.name, amount:plan.price, status:'pending', starts_at:start.toISOString(), expires_at:exp.toISOString()};
    let purchaseId=null;
    if(sb){
      try{
        const {data,error}=await sb.from('membership_purchases').insert(purchase).select('id').single();
        if(error) throw error; purchaseId=data?.id||null;
      }catch(e){ return toast('Run SUPABASE_v78_MEMBERSHIP_PATCH.sql and SUPABASE_v82_PAYOUT_PATCH.sql once, then try plan purchase.'); }
    }
    const activate=async(paymentId='manual_pending')=>{
      if(sb){
        await sb.from('membership_purchases').update({status:paymentId==='manual_pending'?'pending':'paid',payment_id:paymentId,updated_at:new Date().toISOString()}).eq('id',purchaseId);
        await sb.from('users').update({active_membership:plan.key,membership_key:plan.key,membership_title:plan.title,membership_badge:plan.badge,membership_banner:plan.banner,membership_expires_at:exp.toISOString(),badge_key:'premium_member',badge_title:plan.title,banner_key:plan.key,banner_title:plan.banner,points:Math.max(Number(state.profile?.points||0), userPoints()+plan.reward)}).eq('auth_id',state.user.id);
        await loadSession(); await loadFinanceData();
      }
      toast(paymentId==='manual_pending'?'Membership request saved. Connect Razorpay/admin confirmation for live payments.':'Membership activated');
      route('account');
    };
    if(cfg.RAZORPAY_KEY_ID && !cfg.RAZORPAY_KEY_ID.includes('YOUR_') && window.Razorpay){
      const rz=new Razorpay({key:cfg.RAZORPAY_KEY_ID,amount:Math.round(plan.price*100),currency:'INR',name:'Harvester Parts',description:plan.name,handler:async(resp)=>activate(resp.razorpay_payment_id)});
      rz.open();
    } else {
      await activate('manual_pending');
    }
  }
  function toast(msg){ const el=$('#toast'); el.textContent=localText(msg); el.classList.add('show'); setTimeout(()=>el.classList.remove('show'),2600); }
  function setFormLoading(form,on=true,msg='Working...'){
    if(!form) return;
    form.classList.toggle('is-loading', !!on);
    const btn=form.querySelector('button[type="submit"],button.primary,button.secondary,button:not([type])');
    if(btn){
      if(on){ btn.dataset.oldText=btn.textContent; btn.disabled=true; btn.innerHTML=`<span class="btn-spinner"></span>${esc(msg)}`; }
      else { btn.disabled=false; if(btn.dataset.oldText) btn.textContent=btn.dataset.oldText; }
    }
    let status=form.querySelector('.form-status');
    if(on){ if(!status){ status=document.createElement('div'); status.className='form-status'; form.appendChild(status); } status.innerHTML=`<span class="mini-spinner"></span>${esc(msg)} Please wait...`; }
    else if(status){ status.remove(); }
  }
  async function withLoading(form,fn,msg='Working...'){
    try{ setFormLoading(form,true,msg); return await fn(); }
    catch(e){ console.error(e); toast(e?.message || String(e) || 'Something went wrong'); }
    finally{ setFormLoading(form,false); }
  }
  function closeMenu(){ $('#sideMenu')?.classList.remove('open'); $('#backdrop')?.classList.remove('show'); }
  function openMenu(){ $('#sideMenu')?.classList.add('open'); $('#backdrop')?.classList.add('show'); }
  function route(name, params={}){
    name = normalizeRouteName(name);
    if(!VALID_ROUTES.has(name)) name='home';
    closeMenu();
    if(params.category){ sessionStorage.hp_market_category=params.category; }
    state.route=name;
    const nextHash = '#'+name+(params.id?`/${params.id}`:'');
    if(location.hash !== nextHash) history.replaceState(null,'',nextHash);
    render();
    setTimeout(()=>window.scrollTo({top:0,behavior:'smooth'}),30);
  }
  function parseRoute(){ const h=location.hash.replace('#',''); if(!h) return ['home']; return h.split('/'); }
  function placeholder(cat='parts'){ const c=(cat||'parts').toLowerCase(); if(c.includes('bearing'))return 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=900&q=75'; if(c.includes('tractor'))return 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=900&q=75'; if(c.includes('harvester'))return 'https://images.unsplash.com/photo-1598514982195-f36b96d1e8d4?auto=format&fit=crop&w=900&q=75'; if(c.includes('rubber'))return 'https://images.unsplash.com/photo-1581091215367-59ab6b292ddb?auto=format&fit=crop&w=900&q=75'; return 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=900&q=75'; }
  function productImage(p){ return (Array.isArray(p.image_urls)&&p.image_urls[0]) || p.image || placeholder(p.category); }
  function platformFee(subtotal){ subtotal=Number(subtotal||0); if(!subtotal) return 0; if(subtotal<=2000) return Math.max(20, Math.round(subtotal*.025)); if(subtotal<=3000) return 100; if(subtotal<=5000) return 200; if(subtotal<=10000) return 350; if(subtotal<=25000) return 750; if(subtotal<=50000) return 1400; if(subtotal<=100000) return 2500; if(subtotal<=500000) return 12000; return Math.min(30000, Math.round(subtotal*.03)); }
  function sellerFee(price, planKey){ price=Number(price||0); if(!price)return 0; const rate=commissionRateForKey(planKey || state.profile?.active_membership || state.profile?.membership_key || ''); return Math.max(price>=1000?20:0, Math.round(price*rate)); }
  function sellerFeeForProduct(p){ return sellerFee(p?.price, sellerPlanKeyFromProduct(p)); }
  function shippingFee(subtotal, method='standard'){ subtotal=Number(subtotal||0); if(!subtotal)return 0; const base = subtotal<=2000?120:subtotal<=10000?250:subtotal<=50000?850:1800; return method==='premium'?Math.round(base*1.8):base; }

  async function init(){
    setTimeout(()=>$('#intro')?.classList.add('hide'),1200);
    if(localStorage.hp_lang_done==='1') $('#languageModal')?.classList.remove('show');
    setTimeout(()=>{ if(localStorage.hp_install_done!=='1') $('#installModal')?.classList.add('show'); },1800);
    bindShell(); applyLang(); await loadSession(); await loadProducts(); await loadSiteContent(); await loadFinanceData(); loadCart(); loadWishlist(); syncMenu(); render(); setupScroll(); setupFinanceRealtime();
  }
  function bindShell(){
    document.addEventListener('click', e=>{
      // v82: protect forms/inputs from accidental route bubbling on mobile Safari.
      if(e.target.closest('input, textarea, select, option, label')) return;
      const routeEl=e.target.closest('button[data-route],a[data-route],[role="button"][data-route],.brand[data-route],.icon-btn[data-route]');
      if(routeEl){
        e.preventDefault();
        e.stopPropagation();
        route(routeEl.dataset.route);
        return;
      }
      const close=e.target.closest('[data-close-modal]');
      if(close){ const id=close.dataset.closeModal; $('#'+id)?.classList.remove('show'); if(id==='installModal' && $('#dontShowInstall')?.checked) localStorage.hp_install_done='1'; }
    }, true);
    $('#menuButton')?.addEventListener('click',openMenu); $('#closeMenu')?.addEventListener('click',closeMenu); $('#backdrop')?.addEventListener('click',closeMenu);
    $('#authButton')?.addEventListener('click',()=> state.user ? route('account') : route('login'));
    $('#menuLoginBtn')?.addEventListener('click',()=> state.user ? route('account') : route('login'));
    $('#logoutBtn')?.addEventListener('click',logout);
    $$('#languageModal [data-lang]').forEach(b=>b.addEventListener('click',()=>{ state.lang=b.dataset.lang; localStorage.hp_lang=state.lang; if($('#dontShowLang')?.checked) localStorage.hp_lang_done='1'; $('#languageModal')?.classList.remove('show'); applyLang(); render(); }));
    $('#languageSelect')?.addEventListener('change',e=>{state.lang=e.target.value;localStorage.hp_lang=state.lang;applyLang(); render();});
    window.addEventListener('hashchange',()=>{ const [r,id]=parseRoute(); state.route=r||'home'; state.currentProduct=id||null; closeMenu(); render(); });
    $('#scrollTop')?.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));
  }
  function setupScroll(){ window.addEventListener('scroll',()=>$('#scrollTop')?.classList.toggle('show',scrollY>650)); }

  async function loadSession(){
    if(!sb) return;
    const {data}=await sb.auth.getUser(); state.user=data?.user||null;
    if(state.user){
      await ensureProfile();
      const {data:profile}=await sb.from('users').select('*').eq('auth_id',state.user.id).maybeSingle(); state.profile=profile||null;
      const {data:seller}=await sb.from('sellers').select('*').eq('user_id',state.user.id).maybeSingle(); state.seller=seller||null;
    } else { state.seller=null; }
  }
  async function ensureProfile(){
    if(!sb||!state.user)return;
    const isOwner=(state.user.email||'').toLowerCase()===ADMIN_EMAIL;
    const base={auth_id:state.user.id,email:state.user.email,phone:state.user.phone||'',role:isOwner?'admin':'user',user_uid:'HP-'+state.user.id.replaceAll('-','').slice(0,8).toUpperCase()};
    const extended={...base,rank_key:'founder',rank_title:'Founder 1 of 1',badge_key:'founder_1_of_1',badge_title:'Founder 1 of 1',banner_key:'founder_1_of_1',banner_title:'Original Founder • One of One',title_prefix:'Platform Founder',is_founder:true,founder_number:1,points:999999};
    let {error}=await sb.from('users').upsert(isOwner?extended:base,{onConflict:'auth_id'});
    if(error && /rank_key|badge_key|banner_key|is_founder|points|founder/i.test(String(error.message||''))){
      await sb.from('users').upsert(base,{onConflict:'auth_id'});
    }
  }
  function authRedirectUrl(){
    return location.origin + location.pathname;
  }
  function friendlyAuthError(error){
    const msg = String(error?.message || error || 'Authentication error');
    const lower = msg.toLowerCase();
    if(lower.includes('email not confirmed')) return 'Email not confirmed. Open the confirmation email, then login again.';
    if(lower.includes('invalid login credentials')) return 'Wrong email or password, or this email is not confirmed yet.';
    if(lower.includes('60200') || lower.includes('invalid parameter')) return 'Phone OTP setup error: Twilio rejected the request. Use a real mobile number in +country format and check Supabase Phone provider is Twilio Verify with the correct Account SID, Auth Token and Verify Service SID.';
    if(lower.includes('sms') || lower.includes('phone') || lower.includes('provider')) return msg + ' — Enable Phone provider and SMS provider in Supabase Auth, then save the correct SMS provider credentials.';
    return msg;
  }
  async function signup(email,password,name){
    if(!sb) return toast('Add Supabase keys first');
    const {data,error}=await sb.auth.signUp({email,password,options:{data:{full_name:name}, emailRedirectTo: authRedirectUrl()}});
    if(error)return toast(friendlyAuthError(error));
    await loadSession(); await loadFinanceData(); syncMenu();
    if(data?.session || state.user){ route('account'); toast('Account created and logged in'); }
    else { route('login'); toast('Account created. Check email to confirm, then login.'); }
  }
  async function login(email,password){
    if(!sb) return toast('Add Supabase keys first');
    const {error}=await sb.auth.signInWithPassword({email,password});
    if(error)return toast(friendlyAuthError(error));
    await loadSession(); await loadProducts(); await loadFinanceData(); syncMenu(); route('home'); toast('Logged in');
  }
  async function loginGoogle(){
    if(!sb) return toast('Add Supabase keys first');
    const {error}=await sb.auth.signInWithOAuth({provider:'google', options:{redirectTo: authRedirectUrl()}});
    if(error) toast(friendlyAuthError(error));
  }
  function toggleOtpFields(show=true){
    $('#otpCodeInput')?.classList.toggle('otp-visible', show);
    $('#verifyOtpBtn')?.classList.toggle('otp-visible', show);
    if(show) setTimeout(()=>$('#otpCodeInput')?.focus(),80);
  }
  function cleanPhone(phone){
    const raw=String(phone||'').trim();
    const hasPlus=raw.startsWith('+');
    const digits=raw.replace(/\D/g,'');
    return hasPlus ? '+'+digits : digits;
  }
  function normalizePhone(phone,countryCode='+91'){
    const p=cleanPhone(phone);
    if(!p) return '';
    if(p.startsWith('+')) return p;
    const code=cleanPhone(countryCode).startsWith('+') ? cleanPhone(countryCode) : '+'+cleanPhone(countryCode);
    const codeDigits=code.replace(/\D/g,'');
    if(p.startsWith(codeDigits) && p.length>10) return '+'+p;
    return code+p;
  }
  function getOtpPhone(){
    const phone=normalizePhone($('#phoneOtpInput')?.value||'', $('#countryCodeSelect')?.value||'+91');
    const input=$('#phoneOtpInput'); if(input && phone) input.dataset.fullPhone=phone;
    return phone;
  }
  function isValidE164(phone){ return /^\+[1-9]\d{7,14}$/.test(phone); }
  async function sendPhoneOtp(phone){
    if(!sb) return toast('Add Supabase keys first');
    phone = normalizePhone(phone, $('#countryCodeSelect')?.value||'+91');
    if(!isValidE164(phone)) return toast('Enter a valid mobile number with country code. Example: +919814800017');
    $('#phoneOtpInput') && ($('#phoneOtpInput').dataset.fullPhone=phone);
    const {error}=await sb.auth.signInWithOtp({phone, options:{shouldCreateUser:true}});
    if(error) return toast(friendlyAuthError(error));
    toggleOtpFields(true);
    toast('OTP sent. Enter the 6 digit code.');
  }
  async function verifyPhoneOtp(phone,token){
    if(!sb) return toast('Add Supabase keys first');
    phone = normalizePhone(phone || $('#phoneOtpInput')?.dataset.fullPhone || '', $('#countryCodeSelect')?.value||'+91');
    token = String(token||'').trim();
    if(!isValidE164(phone)) return toast('Enter a valid mobile number with country code. Example: +919814800017');
    if(!token) return toast('Enter OTP code');
    const {error}=await sb.auth.verifyOtp({phone,token,type:'sms'});
    if(error) return toast(friendlyAuthError(error));
    await loadSession(); await loadFinanceData(); syncMenu(); route('home'); toast('Phone login successful');
  }
  async function forgotPassword(email){
    if(!sb) return toast('Add Supabase keys first');
    if(!email) return toast('Enter your email first');
    const {error}=await sb.auth.resetPasswordForEmail(email,{redirectTo: authRedirectUrl() + '#account'});
    if(error) return toast(friendlyAuthError(error));
    toast('Password reset link sent to email');
  }
  async function logout(){ if(sb) await sb.auth.signOut(); state.user=null; state.profile=null; state.seller=null; state.finance={balance:null,payoutAccount:null,payoutRequests:[],ledger:[]}; state.cart=[]; localStorage.hp_cart='[]'; syncMenu(); route('home'); }
  function syncMenu(updateLang=true){
    const isAdmin=(state.profile?.role==='admin') || ((state.user?.email||'').toLowerCase()===ADMIN_EMAIL);
    $('#authButton') && ($('#authButton').textContent=state.user?tx('My Account'):tx('Login'));
    const menuLoginBtn = $('#menuLoginBtn');
    if(menuLoginBtn){
      menuLoginBtn.textContent=tx('Login / Signup');
      menuLoginBtn.classList.toggle('hidden', !!state.user);
    }
    $('#logoutBtn')?.classList.toggle('hidden',!state.user);
    $('#menuName') && ($('#menuName').textContent=state.profile?.full_name || state.user?.email || tx('Guest'));
    $('#menuRole') && ($('#menuRole').textContent=isAdmin?'Founder 1 of 1 • Platform Founder':(state.profile?.membership_title || state.profile?.badge_title || tx('Buyer / Seller')));
    $('#sideMenu')?.classList.toggle('founder-menu', !!isAdmin);
    $('#sideMenu')?.classList.toggle('member-menu', !!state.profile?.active_membership && !isAdmin);
    $$('[data-admin-only]').forEach(el=>el.style.display=isAdmin?'':'none');
    updateCartCount();
    if(updateLang) {
      const cartButton = $('.header-actions .icon-btn[data-route="cart"]');
      if(cartButton){
        const count = state.cart.reduce((sum,item)=>sum+Number(item.qty||1),0);
        cartButton.innerHTML = `${tx('Cart')} <b id="cartCount">${count}</b>`;
      }
    }
  }
  

  async function loadSiteContent(){
    state.siteSlides=fallbackSlides();
    if(!sb) return;
    try{
      const {data,error}=await sb.from('site_carousel_slides').select('*').eq('active',true).order('sort_order',{ascending:true}).order('created_at',{ascending:false}).limit(8);
      if(!error && data && data.length) state.siteSlides=data;
      if(isAdminUser()){
        const {data:all}=await sb.from('site_carousel_slides').select('*').order('sort_order',{ascending:true}).order('created_at',{ascending:false}).limit(50);
        state.admin.siteSlides=all||[];
      }
    }catch(e){}
  }

  async function loadProducts(){
    if(sb){
      const cols='*, sellers(business_name,status), users(email,full_name,badge_title,active_membership,membership_key,membership_title)';
      let query=sb.from('products').select(cols);
      if(isAdminUser()){
        query=query.order('status',{ascending:true}).order('is_boosted',{ascending:false}).order('created_at',{ascending:false});
      } else {
        const visibleUid = state.user?.id || '00000000-0000-0000-0000-000000000000';
        query=query.or(`status.eq.approved,user_id.eq.${visibleUid}`).order('is_boosted',{ascending:false}).order('created_at',{ascending:false});
      }
      const {data,error}=await query;
      if(!error && data){
        state.products=data;
        const cats=[...new Set(data.map(p=>p.category).filter(Boolean))];
        state.stats.products=data.filter(p=>p.status==='approved').length;
        state.stats.categories=cats.length || 0;
        state.stats.sellers=[...new Set(data.filter(p=>p.status==='approved').map(p=>p.user_id||p.seller_id).filter(Boolean))].length || 0;
        try{ const {count}=await sb.from('orders').select('*',{count:'exact',head:true}); state.stats.orders=count||0; }catch(e){}
        return;
      }
    }
    state.products=JSON.parse(localStorage.hp_products||'[]');
    state.stats.products=state.products.length;
    state.stats.categories=[...new Set(state.products.map(p=>p.category).filter(Boolean))].length;
    state.stats.sellers=[...new Set(state.products.map(p=>p.user_id||p.seller_id).filter(Boolean))].length;
  }
  
  function loadCart(){ state.cart=JSON.parse(localStorage.hp_cart||'[]'); updateCartCount(); }
  function saveCart(){ localStorage.hp_cart=JSON.stringify(state.cart); updateCartCount(); }
  function updateCartCount(){ const c=state.cart.reduce((s,i)=>s+Number(i.qty||1),0); $$('#cartCount,.cart-count').forEach(el=>el.textContent=c); }
  function loadWishlist(){ state.wishlist=JSON.parse(localStorage.hp_wishlist||'[]'); }
  function saveWishlist(){ localStorage.hp_wishlist=JSON.stringify(state.wishlist); }
  function addToCart(id, qty=1){ const p=state.products.find(x=>String(x.id)===String(id)); if(!p)return toast('Product not found'); const existing=state.cart.find(i=>String(i.id)===String(id)); if(existing) existing.qty+=qty; else state.cart.push({id:p.id,title:p.title,price:p.price,image:productImage(p),category:p.category,user_id:p.user_id,seller_id:p.seller_id,seller_membership_key:sellerPlanKeyFromProduct(p),qty}); saveCart(); toast('Added to cart'); }
  function buyNow(id){ addToCart(id,1); route('checkout'); }
  function toggleWishlist(id){ const ix=state.wishlist.indexOf(String(id)); if(ix>=0){state.wishlist.splice(ix,1);toast('Removed from wishlist')}else{state.wishlist.push(String(id));toast('Saved to wishlist')} saveWishlist(); render(); }

  function productCard(p){
    const boosted=p.is_boosted?'<span class="badge owner">BOOSTED</span>':'';
    return `<article class="product-card fade-up"><div class="product-img"><img src="${productImage(p)}" onerror="this.src='${placeholder(p.category)}'" alt="${p.title||'Product'}"></div><div class="product-body"><div>${boosted} <span class="badge verified">Verified Stock</span></div><h3>${p.title||'Agricultural Part'}</h3><p class="muted">${p.category||'Spare Part'} • ${p.brand||'Harvester Parts'}</p><div class="price-row"><span class="price">${money(p.price)}</span><span class="chip">Exact price on request</span></div><div class="actions"><button class="ghost" onclick="HP.route('product',{id:'${p.id}'})">Details</button><button class="secondary" onclick="HP.addToCart('${p.id}')">Add Cart</button><button class="primary wide" onclick="HP.buyNow('${p.id}')">Buy Now</button></div></div></article>`;
  }
  const AGRI_CATEGORIES = [
    {group:'Machines', title:'Combine Harvester', desc:'New and used combines, feeder houses, threshing units and complete harvesting machines.', icon:'CH', filters:['Combine Harvester','Harvester','Combine']},
    {group:'Machines', title:'Tractor', desc:'2WD, 4WD and used tractors with compatible spares and workshop-ready listings.', icon:'TR', filters:['Tractor']},
    {group:'Machines', title:'Seed Drill', desc:'Seed drills, zero till drills, precision seeding machines and their spares.', icon:'SD', filters:['Seed Drill','Seeding Drill','Drill']},
    {group:'Machines', title:'Straw Reaper', desc:'Straw reapers, reaper binders and crop residue machinery for wheat and paddy fields.', icon:'SR', filters:['Straw Reaper','Reaper']},
    {group:'Machines', title:'Rotavator & Tillage', desc:'Rotavators, cultivators, ploughs and soil preparation implements.', icon:'RT', filters:['Rotavator','Cultivator','Tillage','Plough']},
    {group:'Machines', title:'Irrigation & Pumps', desc:'Pump sets, pipes, irrigation kits and field water-management equipment.', icon:'IP', filters:['Irrigation','Pump','Water']},
    {group:'Spare Parts', title:'Belts & Chains', desc:'Drive belts, elevator chains, roller chains and transmission wear parts.', icon:'BC', filters:['Belts','Belt','Chains','Chain']},
    {group:'Spare Parts', title:'Bearings', desc:'Harvester, tractor and implement bearings for shafts, rollers and pulleys.', icon:'BR', filters:['Bearings','Bearing']},
    {group:'Spare Parts', title:'Blades & Cutter Parts', desc:'Cutter bars, knives, guards, fingers, sections and crop cutting assemblies.', icon:'BL', filters:['Cutter Parts','Blade','Blades','Knife']},
    {group:'Spare Parts', title:'Shafts & Gears', desc:'Drive shafts, PTO shafts, gears, pulleys and gearbox-related spares.', icon:'SG', filters:['Shafts','Shaft','Gear','Gears','Pulley']},
    {group:'Spare Parts', title:'Rubber Seals & Bushes', desc:'Oil seals, rubber bushes, gaskets, o-rings and sealing components.', icon:'RS', filters:['Rubber Seals','Seals','Bush','Gasket']},
    {group:'Spare Parts', title:'Hydraulic Parts', desc:'Hydraulic pipes, pumps, cylinders, filters and oil-flow components.', icon:'HY', filters:['Hydraulic','Hydraulic Parts','Cylinder','Filter']}
  ];
  function categoryCard(c){
    const count = state.products.filter(p=> c.filters.some(f=>String(p.category||'').toLowerCase().includes(f.toLowerCase()) || String(p.title||'').toLowerCase().includes(f.toLowerCase()))).length;
    return `<article class="agri-category-card pro-cat fade-up" onclick="HP.route('market',{category:'${c.title}'})"><div class="cat-mark">${c.icon}</div><div><small>${c.group}</small><h3>${c.title}</h3><p>${c.desc}</p><span>${count} active listings</span></div></article>`;
  }
  function categoriesBySellType(type){ return AGRI_CATEGORIES.filter(c => type==='machine' ? c.group==='Machines' : c.group==='Spare Parts'); }
  function categoryOptionsFor(type){ return categoriesBySellType(type).map(c=>`<option value="${esc(c.title)}">${esc(c.title)}</option>`).join(''); }



  function fallbackSlides(){
    return [
      {title:'Verified machinery and spare parts',subtitle:'Buy harvesters, tractors, implements and genuine agricultural spares from approved sellers.',cta_text:'Browse Marketplace',cta_route:'market',image_url:'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1200&q=80'},
      {title:'Sell with admin approval',subtitle:'Post your stock, build trust, earn ranks and receive seller payouts after platform commission.',cta_text:'Start Selling',cta_route:'sell',image_url:'https://images.unsplash.com/photo-1598514982195-f36b96d1e8d4?auto=format&fit=crop&w=1200&q=80'},
      {title:'Plans that reduce platform fees',subtitle:'Free sellers get 5 listings. Paid plans unlock more listings, rewards, boosts and lower seller commission.',cta_text:'View Plans',cta_route:'membership',image_url:'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=1200&q=80'}
    ];
  }
  function carouselSlides(){ return (state.siteSlides&&state.siteSlides.length?state.siteSlides:fallbackSlides()).filter(s=>s!==null).slice(0,6); }
  function homeCarousel(){
    const slides=carouselSlides();
    return `<section class="home-carousel-section"><div class="section-head"><h2>Featured marketplace updates</h2><p class="muted">Live banners for listings, plans and platform updates.</p></div><div class="home-carousel">${slides.map((sl,i)=>`<article class="carousel-slide ${i===0?'active':''}"><img src="${esc(sl.image_url||placeholder('tractor'))}" onerror="this.src='${placeholder('tractor')}'"><div><span class="eyebrow">${i+1<10?'0'+(i+1):i+1}</span><h3>${esc(sl.title||'Marketplace update')}</h3><p>${esc(sl.subtitle||'Browse verified agriculture listings.')}</p><button class="primary" data-route="${esc(sl.cta_route||'market')}">${esc(sl.cta_text||'Open')}</button></div></article>`).join('')}</div></section>`;
  }

  function home(){
    const cats=AGRI_CATEGORIES;
    const categoryCount = state.stats.categories || cats.length;
    const sellerCount = state.stats.sellers || 0;
    return `<section class="hero video-hero"><video class="hero-bg-video" autoplay muted loop playsinline preload="metadata" poster="./harvester-logo-full.jpg"><source src="./hero-bg.mp4" type="video/mp4"></video><div class="hero-copy"><span class="eyebrow">Verified agricultural marketplace</span><h1>Buy and sell farm machinery, implements and spare parts.</h1><p>Harvester Parts connects farmers, dealers, workshops and machine owners with approved sellers, secure orders, seller payouts and trusted product listings.</p><div class="hero-actions"><button class="primary" data-route="market">Browse Marketplace</button><button class="ghost" data-route="sell">Start Selling</button><button class="ghost" data-route="membership">View Plans</button></div></div><div class="hero-card glass"><img src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1200&q=80" alt="Agriculture"><div class="stats"><div class="stat"><b data-count="${state.stats.products||state.products.length}">0</b><span>Live products</span></div><div class="stat"><b data-count="${categoryCount}">0</b><span>Categories</span></div><div class="stat"><b data-count="${sellerCount}">0</b><span>Verified sellers</span></div><div class="stat"><b data-count="${state.stats.orders||0}">0</b><span>Orders</span></div></div></div></section>${homeCarousel()}<section><div class="section-head"><h2>Shop by farming need</h2><p class="muted">Browse professional categories for machines and spare parts.</p></div><div class="agri-category-grid compact">${cats.slice(0,8).map(categoryCard).join('')}</div></section><section class="page-card explain-strip"><div><span class="eyebrow">Why Harvester Parts?</span><h2>Verified sellers, clear listings and organized payouts.</h2><p class="muted">Buy machinery, compare spare parts, send in-app messages and sell through an admin-approved marketplace.</p></div><div class="mini-steps"><div><b>01</b><span>Find machinery or part</span></div><div><b>02</b><span>Message or checkout</span></div><div><b>03</b><span>Platform manages seller payout</span></div></div></section><section><div class="section-head"><h2>Recently listed</h2><button class="ghost" data-route="market">View all</button></div><div class="grid">${state.products.slice(0,6).map(productCard).join('')||empty('No live products yet.')}</div></section>`;
  }

  
  function market(){
    const categories=[...new Set([...state.products.map(p=>p.category).filter(Boolean), ...AGRI_CATEGORIES.map(c=>c.title)])];
    const selected=sessionStorage.hp_market_category||'';
    const shown=selected?state.products.filter(p=>String(p.category||'').toLowerCase().includes(selected.toLowerCase()) || String(p.title||'').toLowerCase().includes(selected.toLowerCase())):state.products;
    return `<section class="page-card market-head-card"><div class="section-head"><h2>Browse Marketplace</h2><button class="primary" data-route="sell">List Product</button></div><div class="market-tools"><input id="searchInput" placeholder="Search parts, brand, model"><select id="categoryFilter"><option value="">All categories</option>${categories.map(c=>`<option ${c===selected?'selected':''}>${c}</option>`).join('')}</select><select id="sortFilter"><option value="new">Newest</option><option value="low">Price low</option><option value="high">Price high</option></select></div></section><section class="grid" id="marketGrid">${shown.map(productCard).join('')||empty('No live catalog. Ask sellers to list products.')}</section>`;
  }
  
  function productPage(id){ const p=state.products.find(x=>String(x.id)===String(id)); if(!p)return emptyPage('Product not found'); const fee=sellerFeeForProduct(p); return `<section class="product-page"><div class="gallery page-card"><img src="${productImage(p)}" onerror="this.src='${placeholder(p.category)}'" alt="${p.title}"></div><aside class="detail-stack sticky-buy"><div class="page-card"><span class="badge verified">Verified listing</span><h1>${p.title}</h1><p class="muted">${p.category||'Spare part'} • ${p.brand||'Harvester Parts'} ${p.model?`• ${p.model}`:''}</p><div class="price">${money(p.price)}</div><p class="muted">Estimated price. Contact seller inside website for exact final price.</p><div class="actions"><button class="primary" onclick="HP.buyNow('${p.id}')">Buy Now</button><button class="secondary" onclick="HP.addToCart('${p.id}')">Add to Cart</button><button class="ghost" onclick="HP.toggleWishlist('${p.id}')">Wishlist</button><button class="ghost" onclick="HP.route('messages',{id:'${p.id}'})">Message Seller</button></div></div><div class="summary-card"><h3>Buyer protection</h3><div class="summary-row"><span>Platform fee</span><b>Calculated at checkout</b></div><div class="summary-row"><span>Shipping</span><b>Standard / Premium</b></div><div class="summary-row"><span>Seller receives approx.</span><b>${money(Number(p.price||0)-fee)}</b></div></div></aside></section><section class="page-card"><h2>Product details</h2><p>${p.description||'Genuine agricultural spare part listing. Please confirm compatibility, dimensions and condition through in-app message before final purchase.'}</p><div class="stats"><div class="stat"><b>${p.condition||'Stock'}</b><span>Condition</span></div><div class="stat"><b>${p.weight_kg||'—'} kg</b><span>Weight</span></div><div class="stat"><b>${p.state||'India'}</b><span>Location</span></div><div class="stat"><b>${p.views||0}</b><span>Views</span></div></div></section>`; }
  function categoriesPage(){
    const machines=AGRI_CATEGORIES.filter(c=>c.group==='Machines').map(categoryCard).join('');
    const spares=AGRI_CATEGORIES.filter(c=>c.group==='Spare Parts').map(categoryCard).join('');
    return `<section class="page-card category-hero"><span class="eyebrow">All agriculture categories</span><h1>Machinery, implements and every important spare part.</h1><p class="muted">Browse combine harvesters, tractors, seed drills, straw reapers, rotavators and essential parts like belts, bearings, blades, shafts, gears, seals and hydraulic components.</p></section><section><div class="section-head"><h2>Farm Machinery</h2><p class="muted">New and used machines for every stage of farming.</p></div><div class="agri-category-grid">${machines}</div></section><section><div class="section-head"><h2>Spare Parts</h2><p class="muted">Fast discovery for workshops, dealers and farmers.</p></div><div class="agri-category-grid">${spares}</div></section>`;
  }
  function aboutPage(){
    return `<section class="about-hero page-card"><span class="eyebrow">About Harvester Parts</span><h1>India-first marketplace for agricultural machinery and spare parts.</h1><p>Harvester Parts helps farmers, dealers, workshops and machinery owners buy and sell new and used agricultural machinery, combine harvester parts, tractor parts, seed drill spares, straw reaper parts, belts, bearings, cutter components and more through one trusted platform.</p><div class="about-metrics"><div><b>Verified</b><span>seller approvals</span></div><div><b>Secure</b><span>in-app enquiry</span></div><div><b>Multi-use</b><span>machines + spares</span></div></div></section><section class="about-grid"><div class="page-card"><h2>What we do</h2><p>We bring agricultural sellers and buyers together with searchable listings, product details, checkout flow, seller verification and admin approvals. The goal is to make agriculture trading easier, safer and more organized.</p></div><div class="page-card"><h2>For farmers</h2><p>Find nearby machinery and spare parts quickly. Compare estimated prices, message sellers inside the website and keep your purchase journey organized.</p></div><div class="page-card"><h2>For dealers & workshops</h2><p>List inventory, get buyer leads, manage enquiries and grow visibility across agricultural categories without depending only on offline contacts.</p></div><div class="page-card"><h2>Our promise</h2><p>We focus on verified sellers, clear product information, direct in-platform communication and a cleaner buying experience for Indian agriculture.</p></div></section>`;
  }
  function contactPage(){
    return `<section class="contact-grid"><div class="page-card contact-card"><span class="eyebrow">Contact Harvester Parts</span><h1>Need help buying, selling or listing spare parts?</h1><p class="muted">Reach us for seller approval, product listing help, order questions or platform support.</p><div class="contact-actions"><a class="primary" href="tel:9814800017">Call 9814800017</a><a class="secondary" href="https://wa.me/919814800017" target="_blank" rel="noopener">WhatsApp Support</a><a class="ghost" href="mailto:kiratveersinghralhan@gmail.com">Email Us</a></div><div class="support-list"><div><b>Phone</b><span>9814800017</span></div><div><b>WhatsApp</b><span>9814800017</span></div><div><b>Email</b><span>kiratveersinghralhan@gmail.com</span></div></div></div><div class="page-card"><h2>Send a message</h2><form id="contactForm" class="form"><input name="name" placeholder="Your name" required><input name="phone" placeholder="Phone number" required><select name="topic"><option>Buying help</option><option>Selling help</option><option>Seller verification</option><option>Order support</option><option>Other</option></select><textarea name="message" placeholder="Tell us what you need" required></textarea><button class="primary">Send Support Request</button></form></div></section>`;
  }

  function howPage(){
    return `<section class="page-card about-hero"><span class="eyebrow">How Harvester Parts works</span><h1>A simple verified marketplace for agriculture.</h1><p>Harvester Parts helps buyers find machinery and spare parts while keeping sellers verified and listings organized.</p></section><section class="about-grid"><div class="page-card process-card"><b>1</b><h2>Buyers browse or search</h2><p>Users can search by machine, spare part, brand, model, location and category.</p></div><div class="page-card process-card"><b>2</b><h2>Sellers get verified</h2><p>Before listing products, sellers submit verification details for admin review.</p></div><div class="page-card process-card"><b>3</b><h2>Products go for approval</h2><p>Admin approves quality listings so buyers see cleaner and safer products.</p></div><div class="page-card process-card"><b>4</b><h2>Orders and messages stay inside</h2><p>Buyers can cart, checkout or message sellers through the platform for a more organized deal flow.</p></div></section>`;
  }
  function supportPage(){
    return `<section class="contact-grid"><div class="page-card contact-card"><span class="eyebrow">Support Centre</span><h1>Help for buyers, sellers and dealers.</h1><p class="muted">Use support for verification, listing issues, orders, payments or product questions.</p><div class="support-list"><div><b>Buyer help</b><span>Finding products, cart, checkout and order support.</span></div><div><b>Seller help</b><span>Verification, listing approval, pricing and images.</span></div><div><b>Admin help</b><span>Report fake products, suspicious sellers or safety concerns.</span></div></div><div class="contact-actions"><a class="primary" href="tel:9814800017">Call Support</a><a class="secondary" href="https://wa.me/919814800017" target="_blank" rel="noopener">WhatsApp Support</a><button class="ghost" data-route="contact">Contact Form</button></div></div><div class="page-card"><h2>Common questions</h2><div class="faq"><details open><summary>Can anyone sell?</summary><p>No. Sellers must login and submit verification first. Admin approval is required before selling.</p></details><details><summary>Can I sell machinery and spare parts?</summary><p>Yes. Choose Machinery or Spare Part on the sell page, then fill condition, price, location and images.</p></details><details><summary>How do buyers contact sellers?</summary><p>Buyers can use in-app messages and checkout. Contact sharing can be controlled later if required.</p></details></div></div></section>`;
  }
  async function sendContact(form){ const fd=new FormData(form); const text=`Support request from ${fd.get('name')} (${fd.get('phone')}): ${fd.get('topic')} - ${fd.get('message')}`; localStorage.hp_last_contact=text; if(sb){ await sb.from('contact_messages').insert({name:fd.get('name'),phone:fd.get('phone'),topic:fd.get('topic'),message:fd.get('message')}); } toast('Support request saved. You can also call or WhatsApp us.'); form.reset(); }

  async function refreshSellerBalancesFromLedger(rows=[]){
    if(!sb) return;
    const sellers=[...new Set(rows.map(r=>r.seller_id).filter(Boolean))];
    for(const sellerId of sellers){
      try{
        const {data}=await sb.from('seller_ledger').select('seller_amount,platform_fee,status').eq('seller_id',sellerId);
        const ledger=data||[];
        const pending=ledger.filter(x=>['pending_clearance','available','payout_requested'].includes(x.status)).reduce((s,x)=>s+Number(x.seller_amount||0),0);
        const paid=ledger.filter(x=>x.status==='paid').reduce((s,x)=>s+Number(x.seller_amount||0),0);
        const fees=ledger.reduce((s,x)=>s+Number(x.platform_fee||0),0);
        await sb.from('seller_balances').upsert({user_id:sellerId,available_balance:pending,pending_balance:pending,paid_balance:paid,platform_fee_total:fees,last_order_at:new Date().toISOString(),updated_at:new Date().toISOString()},{onConflict:'user_id'});
      }catch(e){ console.warn('balance refresh skipped', e); }
    }
  }
  async function loadFinanceData(){
    if(!sb||!state.user) return;
    const safe=async(fn,fallback=null)=>{try{const {data,error}=await fn(); return error?fallback:(data??fallback);}catch(e){return fallback;}};
    state.finance.payoutAccount=await safe(()=>sb.from('seller_payout_accounts').select('*').eq('user_id',state.user.id).maybeSingle(), null);
    state.finance.balance=await safe(()=>sb.from('seller_balances').select('*').eq('user_id',state.user.id).maybeSingle(), null);
    state.finance.payoutRequests=await safe(()=>sb.from('seller_payout_requests').select('*').eq('user_id',state.user.id).order('created_at',{ascending:false}).limit(20), []);
    state.finance.ledger=await safe(()=>sb.from('seller_ledger').select('*').eq('seller_id',state.user.id).order('created_at',{ascending:false}).limit(30), []);
  }
  function setupFinanceRealtime(){
    if(!sb || state.realtimeReady) return; state.realtimeReady=true;
    const refreshVisible=async(type='all')=>{
      try{
        if(type==='site' || type==='all') await loadSiteContent();
        if(type==='products' || type==='all') await loadProducts();
        if(type==='finance' || type==='all') await loadFinanceData();
        if(isAdminUser() && state.route==='admin') await loadAdminProData();
        if(['home','market','account','admin','sell','orders'].includes(state.route)) render();
      }catch(e){ console.warn('realtime refresh skipped', e); }
    };
    try{
      sb.channel('hp-realtime-v82')
        .on('postgres_changes',{event:'*',schema:'public',table:'products'},()=>refreshVisible('products'))
        .on('postgres_changes',{event:'*',schema:'public',table:'sellers'},()=>refreshVisible('all'))
        .on('postgres_changes',{event:'*',schema:'public',table:'orders'},()=>refreshVisible('finance'))
        .on('postgres_changes',{event:'*',schema:'public',table:'membership_purchases'},()=>refreshVisible('all'))
        .on('postgres_changes',{event:'*',schema:'public',table:'seller_ledger'},()=>refreshVisible('finance'))
        .on('postgres_changes',{event:'*',schema:'public',table:'seller_balances'},()=>refreshVisible('finance'))
        .on('postgres_changes',{event:'*',schema:'public',table:'seller_payout_requests'},()=>refreshVisible('finance'))
        .on('postgres_changes',{event:'*',schema:'public',table:'site_carousel_slides'},()=>refreshVisible('site'))
        .subscribe();
    }catch(e){}
    setInterval(async()=>{ await refreshVisible(isAdminUser()?'all':'finance'); }, 25000);
  }
  function moneyCounter(n){ return `<b class="live-money" data-money="${Number(n||0)}">${money(n)}</b>`; }
  function payoutMethodLabel(a=state.finance.payoutAccount){ if(!a) return 'Not added'; return a.payout_method==='bank'?'Bank transfer':'UPI'; }
  function accountBalanceCard(){
    const b=state.finance.balance||{}; const reqs=state.finance.payoutRequests||[]; const next=(state.finance.ledger||[]).find(x=>x.available_on)?.available_on;
    return `<div class="page-card money-card"><div class="section-head compact"><h2>Seller balance</h2><span class="badge live-badge">Live</span></div><div class="money-grid"><div><small>Available / pending payout</small>${moneyCounter(b.available_balance||b.pending_balance||0)}</div><div><small>Paid till now</small>${moneyCounter(b.paid_balance||0)}</div><div><small>Platform fee deducted</small>${moneyCounter(b.platform_fee_total||0)}</div></div><p class="muted">Money comes to platform account first. Your seller amount is payout amount after platform commission. Standard payout target: within 7 business days${next?' around '+payoutDateText(next):''}.</p><div class="quick-grid"><button class="secondary" id="requestPayoutBtn">Request payout</button><button class="ghost" data-route="membership">Reduce fees with plan</button></div>${reqs.slice(0,3).map(r=>`<div class="payout-row"><b>${money(r.amount)}</b><span>${esc(r.status)} • ${payoutDateText(r.created_at)}</span></div>`).join('')}</div>`;
  }
  function payoutAccountCard(){
    const a=state.finance.payoutAccount||{}; const method=a.payout_method||'upi';
    return `<div class="page-card payout-card"><div class="section-head compact"><h2>Payout method</h2><span class="badge">${esc(payoutMethodLabel(a))}</span></div><p class="muted">Choose where admin should send your seller payout: UPI or bank account.</p><form id="payoutAccountForm" class="form payout-form"><select name="payout_method"><option value="upi" ${method==='upi'?'selected':''}>UPI</option><option value="bank" ${method==='bank'?'selected':''}>Bank account</option></select><input name="account_holder_name" placeholder="Account holder name" value="${esc(a.account_holder_name||state.profile?.full_name||'')}"><input name="upi_id" placeholder="UPI ID, e.g. name@upi" value="${esc(a.upi_id||'')}"><input name="bank_name" placeholder="Bank name" value="${esc(a.bank_name||'')}"><input name="account_number" placeholder="Account number" value="${esc(a.account_number||'')}"><input name="ifsc" placeholder="IFSC code" value="${esc(a.ifsc||'')}"><button class="primary">Save payout details</button></form></div>`;
  }
  async function savePayoutAccount(form){
    if(!state.user||!sb) return toast('Login and connect Supabase first');
    const fd=new FormData(form); const method=fd.get('payout_method');
    const payload={user_id:state.user.id,payout_method:method,account_holder_name:fd.get('account_holder_name'),upi_id:fd.get('upi_id'),bank_name:fd.get('bank_name'),account_number:fd.get('account_number'),ifsc:String(fd.get('ifsc')||'').toUpperCase(),updated_at:new Date().toISOString()};
    if(method==='upi' && !payload.upi_id) return toast('Enter UPI ID');
    if(method==='bank' && (!payload.account_number || !payload.ifsc || !payload.account_holder_name)) return toast('Enter bank account holder, account number and IFSC');
    const {error}=await sb.from('seller_payout_accounts').upsert(payload,{onConflict:'user_id'});
    if(error) return toast('Run SUPABASE_v82_PAYOUT_PATCH.sql once, then save payout details.');
    await loadFinanceData(); toast('Payout details saved'); render();
  }
  async function requestPayout(){
    if(!state.user||!sb) return toast('Login first');
    const b=state.finance.balance||{}; const amount=Number(b.available_balance||b.pending_balance||0);
    if(amount<=0) return toast('No payout balance yet');
    const a=state.finance.payoutAccount; if(!a) return toast('Save UPI or bank payout details first');
    const payload={user_id:state.user.id,amount,status:'requested',payout_method:a.payout_method,upi_id:a.upi_id,account_holder_name:a.account_holder_name,bank_name:a.bank_name,account_number:a.account_number,ifsc:a.ifsc};
    const {error}=await sb.from('seller_payout_requests').insert(payload);
    if(error) return toast('Run SUPABASE_v82_PAYOUT_PATCH.sql once, then request payout.');
    await sb.from('seller_ledger').update({status:'payout_requested',updated_at:new Date().toISOString()}).eq('seller_id',state.user.id).in('status',['pending_clearance','available']);
    await loadFinanceData(); toast('Payout request sent to admin'); render();
  }

  function cartPage(){ const totals=getTotals(); return `<section class="checkout-grid"><div class="page-card"><h1>Your Cart</h1>${state.cart.map(item=>`<div class="cart-item"><img src="${item.image}" onerror="this.src='${placeholder(item.category)}'"><div><b>${item.title}</b><p class="muted">${money(item.price)} × ${item.qty}</p></div><div class="qty"><button onclick="HP.changeQty('${item.id}',-1)">−</button><b>${item.qty}</b><button onclick="HP.changeQty('${item.id}',1)">+</button><button class="danger" onclick="HP.removeCart('${item.id}')">Remove</button></div></div>`).join('')||empty('Cart is empty. Add products to continue.')}</div><aside class="summary-card"><h2>Order summary</h2>${summaryRows(totals)}<button class="primary" style="width:100%" data-route="checkout">Proceed to Checkout</button></aside></section>`; }
  function getTotals(method='standard'){ const subtotal=state.cart.reduce((s,i)=>s+Number(i.price||0)*Number(i.qty||1),0); const shipping=shippingFee(subtotal,method); const pf=platformFee(subtotal); const total=subtotal+shipping+pf; return {subtotal,shipping,pf,total}; }
  function summaryRows(t){ return `<div class="summary-row"><span>Subtotal</span><b>${money(t.subtotal)}</b></div><div class="summary-row"><span>Shipping</span><b>${money(t.shipping)}</b></div><div class="summary-row"><span>Platform protection fee</span><b>${money(t.pf)}</b></div><div class="summary-row"><span>Total</span><b>${money(t.total)}</b></div>`; }
  function checkoutPage(){ const totals=getTotals(); return `<section class="checkout-grid"><div class="page-card"><h1>Secure Checkout</h1><div class="notice">Buyer pays Harvester Parts first. Seller balance is created after platform commission and is marked for payout within 7 business days after order/payment confirmation.</div><form id="checkoutForm" class="form"><input name="name" placeholder="Full name" required><input name="phone" placeholder="Phone number" required><input name="address" placeholder="Complete delivery address" required><input name="pincode" placeholder="Pincode" required><select name="shipping"><option value="standard">Standard delivery</option><option value="premium">Premium / heavy courier</option></select><input name="coupon" placeholder="Coupon code optional"><button class="primary">Place Secure Order</button></form></div><aside class="summary-card"><h2>Payment Summary</h2><div id="checkoutSummary">${summaryRows(totals)}</div><p class="muted">Payment: Razorpay / manual confirmation depending on your active key setup.</p></aside></section>`; }
  async function placeOrder(form){
    if(!state.user)return route('login');
    if(!state.cart.length)return toast('Cart is empty');
    const fd=new FormData(form); const totals=getTotals(fd.get('shipping'));
    const payoutDue=sevenBusinessDaysFrom();
    const order={buyer_id:state.user.id,user_id:state.user.id,amount:totals.total,shipping_amount:totals.shipping,platform_fee:totals.pf,status:'pending',buyer_name:fd.get('name'),buyer_phone:fd.get('phone'),address:fd.get('address'),pincode:fd.get('pincode'),seller_payout_total:0,platform_commission_total:0,payout_status:'pending',expected_payout_at:payoutDue.toISOString()};
    const itemRows=[]; const ledgerRows=[];
    let sellerPayoutTotal=0, commissionTotal=0;
    state.cart.forEach(i=>{
      const product=state.products.find(p=>String(p.id)===String(i.id)) || i;
      const qty=Number(i.qty||1); const gross=Number(i.price||0)*qty; const fee=sellerFee(gross, i.seller_membership_key || sellerPlanKeyFromProduct(product)); const sellerAmount=Math.max(0,gross-fee);
      sellerPayoutTotal+=sellerAmount; commissionTotal+=fee;
      itemRows.push({product_id:i.id,quantity:qty,price:i.price,seller_user_id:i.user_id||product.user_id||null,platform_commission:fee,seller_amount:sellerAmount,payout_status:'pending_clearance'});
      if(i.user_id||product.user_id){ ledgerRows.push({seller_id:i.user_id||product.user_id,product_id:i.id,gross_amount:gross,platform_fee:fee,seller_amount:sellerAmount,status:'pending_clearance',available_on:payoutDue.toISOString().slice(0,10),notes:'Buyer payment collected by platform. Seller payout due within 7 business days after confirmation.'}); }
    });
    order.seller_payout_total=sellerPayoutTotal; order.platform_commission_total=commissionTotal;
    let orderId='local-'+Date.now();
    if(sb){
      let inserted=null;
      let res=await sb.from('orders').insert(order).select().single();
      if(res.error && /seller_payout_total|platform_commission_total|payout_status|expected_payout_at/i.test(String(res.error.message||''))){
        const fallback={...order}; ['seller_payout_total','platform_commission_total','payout_status','expected_payout_at'].forEach(k=>delete fallback[k]);
        res=await sb.from('orders').insert(fallback).select().single();
      }
      if(res.error) return toast(res.error.message);
      inserted=res.data; orderId=inserted.id;
      const items=itemRows.map(i=>({...i,order_id:orderId}));
      let itemRes=await sb.from('order_items').insert(items);
      if(itemRes.error && /seller_user_id|platform_commission|seller_amount|payout_status/i.test(String(itemRes.error.message||''))){
        const fallbackItems=items.map(i=>({order_id:i.order_id,product_id:i.product_id,quantity:i.quantity,price:i.price}));
        await sb.from('order_items').insert(fallbackItems);
        toast('Order saved. Run SUPABASE_v82_PAYOUT_PATCH.sql to enable payout ledger.');
      } else if(itemRes.error){ return toast(itemRes.error.message); }
      if(ledgerRows.length){
        const ledgers=ledgerRows.map(l=>({...l,order_id:orderId}));
        const lg=await sb.from('seller_ledger').insert(ledgers);
        if(!lg.error){ await refreshSellerBalancesFromLedger(ledgers); }
      }
    }
    localStorage.hp_last_order=orderId; state.cart=[]; saveCart(); toast('Order placed. Seller payout balance will show after platform commission.'); route('orders');
  }
  function changeQty(id,delta){ const it=state.cart.find(i=>String(i.id)===String(id)); if(!it)return; it.qty+=delta; if(it.qty<=0)state.cart=state.cart.filter(i=>String(i.id)!==String(id)); saveCart(); render(); }
  function removeCart(id){ state.cart=state.cart.filter(i=>String(i.id)!==String(id)); saveCart(); render(); }
  function countryOptions(){
    const list = [
      ['+91','🇮🇳 India'],['+1','🇺🇸 United States / Canada'],['+44','🇬🇧 United Kingdom'],['+61','🇦🇺 Australia'],['+971','🇦🇪 UAE'],['+966','🇸🇦 Saudi Arabia'],['+974','🇶🇦 Qatar'],['+965','🇰🇼 Kuwait'],['+968','🇴🇲 Oman'],['+973','🇧🇭 Bahrain'],['+92','🇵🇰 Pakistan'],['+880','🇧🇩 Bangladesh'],['+977','🇳🇵 Nepal'],['+94','🇱🇰 Sri Lanka'],['+60','🇲🇾 Malaysia'],['+65','🇸🇬 Singapore'],['+66','🇹🇭 Thailand'],['+62','🇮🇩 Indonesia'],['+63','🇵🇭 Philippines'],['+49','🇩🇪 Germany'],['+33','🇫🇷 France'],['+39','🇮🇹 Italy'],['+34','🇪🇸 Spain'],['+31','🇳🇱 Netherlands'],['+27','🇿🇦 South Africa'],['+254','🇰🇪 Kenya'],['+234','🇳🇬 Nigeria'],['+81','🇯🇵 Japan'],['+82','🇰🇷 South Korea'],['+86','🇨🇳 China']
    ];
    return list.map(([code,label])=>`<option value="${code}" ${code==='+91'?'selected':''}>${label} ${code}</option>`).join('');
  }

  function loginPage(){ return `<section class="page-card auth-card"><h1>Login / Create Account</h1><div class="notice auth-notice">Email login works after Supabase Auth is configured. Phone OTP needs Supabase Phone provider + Twilio Verify credentials saved in the dashboard.</div><form id="loginForm" class="form"><input name="email" type="email" autocomplete="email" placeholder="Email" required><input name="password" type="password" autocomplete="current-password" placeholder="Password" required><button class="primary">Login</button><button type="button" class="ghost" id="signupSwitch">Create new account</button><button type="button" class="link-btn" id="forgotBtn">Forgot password?</button></form><div class="auth-divider"><span>or</span></div><button class="google-btn" id="googleLoginBtn">Continue with Google</button><div class="phone-login"><h3>Mobile OTP Login</h3><p class="muted tiny-note">Choose country code, then enter mobile number. Example: 9814800017</p><div class="phone-row"><select id="countryCodeSelect" data-no-translate aria-label="Country code">${countryOptions()}</select><input id="phoneOtpInput" type="tel" inputmode="tel" autocomplete="tel-national" placeholder="Mobile number"></div><button class="ghost" id="sendOtpBtn">Send OTP</button><input id="otpCodeInput" inputmode="numeric" autocomplete="one-time-code" maxlength="8" placeholder="OTP code"><button class="secondary" id="verifyOtpBtn">Verify OTP</button><p class="muted tiny-note otp-help">If OTP fails with Twilio 60200, check the SMS provider credentials in Supabase. The website formats the number before sending.</p></div></section>`; }
  

  function membershipMiniCard(){
    const plan=activePlan();
    return `<div class="page-card membership-mini-card"><div class="section-head compact"><h2>Membership</h2><span class="badge ${plan?'owner':''}">${plan?'Active':'Free'}</span></div>${plan?`<div class="mini-plan-banner"><b>${esc(plan.title)}</b><span>${esc(plan.banner)} • expires ${membershipExpiryText()||'soon'}</span></div><div class="rank-ways"><div><b>${plan.boost}</b><span>boost days</span></div><div><b>${limitLabel(plan.listings)}</b><span>listing limit</span></div><div><b>${plan.reward}</b><span>reward pts</span></div><div><b>${money(plan.price)}</b><span>value</span></div></div>`:`<p class="muted">Free plan gives 5 listings. Upgrade from ₹49 for more listings and lower seller platform fee.</p>`}<button class="primary" data-route="membership">${plan?'Upgrade Plan':'View Plans'}</button></div>`;
  }
  function accountPage(){
    if(!state.user)return loginPage();
    const isAdmin=state.profile?.role==='admin'||(state.user.email||'').toLowerCase()===ADMIN_EMAIL;
    const profileName=state.profile?.full_name || state.user.user_metadata?.full_name || '';
    const email=state.user.email || 'Phone login account';
    const fullName=profileName || email;
    const phone=state.profile?.phone || state.user.phone || '';
    const uid=state.profile?.user_uid || ('HP-'+String(state.user.id||'account').replaceAll('-','').slice(0,8).toUpperCase());
    const pts=userPoints(); const rank=rankForPoints(pts);
    const memberPlan=activePlan();
    const role=isAdmin?'Platform Founder • 1 of 1':(memberPlan?.title || state.profile?.membership_title || state.profile?.badge_title || (state.seller?.status==='approved'?'Verified Seller':'Buyer / Seller'));
    const myProducts=state.products.filter(p=>String(p.user_id||'')===String(state.user.id));
    const approvedListings=myProducts.filter(p=>p.status==='approved').length;
    const pendingListings=myProducts.filter(p=>p.status!=='approved').length;
    const sellerStatus=state.seller?.status || (isAdmin?'approved':'not verified');
    const avatarText=(fullName||email||'HP').split(/[\s@.]+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'HP';
    return `<section class="profile-page">${userBanner()}<div class="profile-cover page-card ${isAdmin?'founder-profile-cover':''}"><div class="profile-avatar"><img src="./logo-192.png" alt="Harvester Parts"><span>${avatarText}</span></div><div class="profile-main"><div class="profile-title-row"><div data-no-translate><h1>${esc(fullName)}</h1><p>${esc(email)}</p></div><span class="badge ${isAdmin?'owner':'verified'}">${esc(role)}</span></div><div class="profile-id"><span data-no-translate>${esc(uid)}</span> • <span>${esc(rank.title)}</span> • <span>${esc(sellerStatus)}</span></div><div class="profile-stats"><div><b>${myProducts.length}</b><span>Listings</span></div><div><b>${approvedListings}</b><span>Live</span></div><div><b>${pts>=999999?'MAX':pts}</b><span>Points</span></div><div><b>${earnedBadges().length}</b><span>Badges</span></div></div><div class="profile-actions"><button class="primary" data-route="sell">Sell a Part</button><button class="ghost" data-route="orders">My Orders</button>${isAdmin?'<button class="secondary" data-route="admin">Admin Panel</button>':''}</div></div></div><div class="profile-grid"><div class="page-card profile-edit-card"><h2>Profile details</h2><p class="muted">Keep your buyer and seller profile updated for faster support and verification.</p><form id="profileForm" class="form profile-form"><input name="full_name" value="${esc(profileName)}" placeholder="Full name"><input name="phone" type="tel" value="${esc(phone)}" placeholder="Phone number"><select name="gender"><option value="">Gender</option><option ${state.profile?.gender==='Male'?'selected':''}>Male</option><option ${state.profile?.gender==='Female'?'selected':''}>Female</option><option ${state.profile?.gender==='Other'?'selected':''}>Other</option></select><button class="primary">Save Profile</button></form></div><div class="page-card profile-info-card"><h2>Account overview</h2><div class="info-list"><div><span>User ID</span><b data-no-translate>${esc(uid)}</b></div><div><span>Email</span><b data-no-translate>${esc(email)}</b></div><div><span>Phone</span><b>${esc(phone || 'Not added')}</b></div><div><span>Seller status</span><b>${esc(sellerStatus)}</b></div><div><span>Pending listings</span><b>${pendingListings}</b></div></div></div>${rankProgressCard()}${membershipMiniCard()}${accountBalanceCard()}${payoutAccountCard()}${badgeCollectionCard()}<div class="page-card profile-info-card"><h2>Quick tools</h2><div class="quick-grid"><button class="ghost" data-route="market">Browse Marketplace</button><button class="ghost" data-route="messages">Chat</button><button class="ghost" data-route="cart">Cart</button><button class="ghost" data-route="contact">Contact Support</button>${state.seller?.status==='approved'||isAdmin?'<button class="secondary" data-route="sell">Add New Listing</button>':'<button class="secondary" data-route="sell">Become Verified Seller</button>'}</div></div>${eventPreviewCard()}<div class="page-card profile-info-card"><h2>Trust & safety</h2><p class="muted">Use website chat and checkout so orders, seller approvals and support history stay protected inside Harvester Parts.</p><div class="trust-pills"><span>Verified sellers</span><span>Admin review</span><span>Secure orders</span></div></div></div></section>`;
  }

  async function saveProfile(form){ if(!sb||!state.user)return; const fd=new FormData(form); const {error}=await sb.from('users').update({full_name:fd.get('full_name'),phone:fd.get('phone')||state.user.phone||'',gender:fd.get('gender'),profile_completed:true}).eq('auth_id',state.user.id); if(error)toast(error.message); else{toast('Profile saved'); await loadSession(); syncMenu(); render();} }
  function sellerStatusCard(){
    const st=(state.seller?.status||state.seller?.verification_status||'not_submitted').toLowerCase();
    if(st==='approved') return '';
    if(st==='pending' || st==='provisional') return `<section class="page-card sell-gate"><span class="eyebrow">Verification under review</span><h1>Your seller request is ${st}.</h1><p class="muted">You can list products after admin approval. We review seller details to keep buyers safe.</p><button class="ghost" data-route="support">Need help?</button></section>`;
    if(st==='rejected') return `<section class="page-card sell-gate"><span class="eyebrow">Verification rejected</span><h1>Please update your seller details.</h1><p class="muted">Your previous request needs correction. Submit again with correct information and clear documents.</p>${sellerVerificationForm()}</section>`;
    return `<section class="page-card sell-gate"><span class="eyebrow">Seller verification required</span><h1>Get verified before selling machinery or spare parts.</h1><p class="muted">For buyer safety, only approved sellers can post products. Submit your business/contact details first.</p>${sellerVerificationForm()}</section>`;
  }
  function sellerVerificationForm(){
    return `<form id="sellerVerifyForm" class="form seller-verify-form"><input name="business_name" placeholder="Business / seller name" required><input name="phone" placeholder="Phone number" required><input name="state" placeholder="State" required><input name="district" placeholder="District" required><input name="city" placeholder="City / village" required><textarea name="address" placeholder="Pickup/shop address"></textarea><div class="doc-upload-grid"><label class="file-label">Aadhaar front photo<input name="aadhaar_front" type="file" accept="image/*,application/pdf" required></label><label class="file-label">Aadhaar back photo<input name="aadhaar_back" type="file" accept="image/*,application/pdf" required></label><label class="file-label">Shop / stock photo<input name="shop_photo" type="file" accept="image/*,application/pdf"></label></div><div class="notice tiny-note">Upload clear front and back Aadhaar photos. Only admin can view verification documents.</div><button class="primary">Submit Seller Verification</button></form>`;
  }
  function sellPage(){
    if(!state.user)return loginPage();
    const gate=sellerStatusCard();
    if(gate) return gate;
    const used=userListingCount(); const limit=currentListingLimit();
    return `<section class="page-card sell-head"><span class="eyebrow">Approved seller</span><h1>Sell machinery or spare parts.</h1><p class="muted">Choose Machinery or Spare Part first. The category list changes automatically, then your listing goes to admin approval.</p><div class="sell-limit-note"><span>Listings used: ${used}/${limitLabel(limit)}</span><small>${esc(feeDiscountForPlan(activePlan()))}</small></div></section><section class="page-card"><form id="sellForm" class="form sell-form"><div class="sell-type-grid" role="radiogroup" aria-label="What are you selling?"><label class="sell-type-card active" data-sell-card="machine"><input type="radio" name="sell_type" value="machine" checked><span class="sell-dot"></span><span><b>Machinery</b><small>Combine harvester, tractor, seed drill, straw reaper, implements</small></span></label><label class="sell-type-card" data-sell-card="spare"><input type="radio" name="sell_type" value="spare"><span class="sell-dot"></span><span><b>Spare Part</b><small>Belts, bearings, blades, shafts, gears, hydraulic parts</small></span></label></div><select name="condition" required><option value="New">New</option><option value="Used" selected>Used</option><option value="Refurbished">Refurbished</option><option value="Factory Stock">Factory Stock</option></select><input name="title" placeholder="Product name" required><input name="price" type="number" min="0" placeholder="Listing price" required><select name="category" id="sellCategorySelect" required>${categoryOptionsFor('machine')}</select><input name="brand" placeholder="Brand / machine"><input name="model" placeholder="Model / compatibility"><input name="weight_kg" type="number" step="0.1" placeholder="Weight kg"><input name="state" placeholder="State" required><input name="district" placeholder="District" required><input name="city" placeholder="City / village" required><textarea name="description" placeholder="Describe condition, exact location, compatibility"></textarea><label class="file-label">Product photos<input name="images" type="file" accept="image/*" multiple></label><div class="notice" id="sellerFeePreview">Enter price to see seller payout.</div><button class="primary">Submit Listing for Approval</button></form></section>`;
  }
  async function submitSellerVerification(form){
    if(!state.user)return route('login');
    const fd=new FormData(form); let aadhaar_front='', aadhaar_back='', shop_photo='';
    async function uploadDoc(field){ const f=fd.get(field); if(!sb||!f||!f.name)return ''; const safeName=f.name.replace(/[^a-z0-9.]/gi,'-'); const path=`${state.user.id}/${field}-${Date.now()}-${safeName}`; const {error}=await sb.storage.from('verification-docs').upload(path,f,{upsert:true}); if(error){ toast(error.message); return ''; } return path; }
    aadhaar_front=await uploadDoc('aadhaar_front'); aadhaar_back=await uploadDoc('aadhaar_back'); shop_photo=await uploadDoc('shop_photo');
    const payload={user_id:state.user.id,business_name:fd.get('business_name'),phone:fd.get('phone'),state:fd.get('state'),district:fd.get('district'),city:fd.get('city'),address:fd.get('address'),aadhaar_front,aadhaar_back,shop_photo,status:'pending',verification_status:'pending'};
    if(sb){
      let {error}=await sb.from('sellers').upsert(payload,{onConflict:'user_id'});
      if(error && String(error.message||'').includes('aadhaar_back')){
        const fallback={...payload}; delete fallback.aadhaar_back;
        const res=await sb.from('sellers').upsert(fallback,{onConflict:'user_id'}); error=res.error;
        if(error) return toast(error.message);
        toast('Seller request saved. Aadhaar back storage is not enabled yet.');
      } else if(error) return toast(error.message);
    }
    state.seller=payload; toast('Seller verification submitted for admin approval'); render();
  }
  async function submitProduct(form){
    if(!state.user)return route('login');
    if(!isSellerApproved()) return toast('Seller verification must be approved before listing.');
    const limit=currentListingLimit(); const used=userListingCount();
    if(used>=limit){ toast(`Your ${activePlan()?.name||'Free'} plan allows ${limitLabel(limit)} listings. Upgrade to list more.`); setTimeout(()=>route('membership'),700); return; }
    const fd=new FormData(form); const price=Number(fd.get('price')||0);
    if(!price || price<1) return toast('Enter a valid listing price');
    let image_urls=[]; const files=[...(fd.getAll('images')||[])].filter(f=>f&&f.name);
    if(sb&&files.length){
      for(const f of files){
        const path=`${state.user.id}/${Date.now()}-${f.name.replace(/[^a-z0-9.]/gi,'-')}`;
        const {error}=await sb.storage.from('product-images').upload(path,f,{upsert:true});
        if(error) return toast('Image upload failed: '+error.message);
        const {data}=sb.storage.from('product-images').getPublicUrl(path); if(data?.publicUrl) image_urls.push(data.publicUrl);
      }
    }
    const payload={user_id:state.user.id,seller_id:state.seller?.id||null,sell_type:fd.get('sell_type')||'spare',condition:fd.get('condition')||'Used',title:fd.get('title'),price,category:fd.get('category'),brand:fd.get('brand'),model:fd.get('model'),weight_kg:Number(fd.get('weight_kg')||0),state:fd.get('state'),district:fd.get('district'),city:fd.get('city'),description:fd.get('description'),image_urls,status:'pending'};
    if(sb){
      let {error}=await sb.from('products').insert(payload);
      if(error && /seller_id/i.test(String(error.message||''))){ const fallback={...payload}; delete fallback.seller_id; const res=await sb.from('products').insert(fallback); error=res.error; }
      if(error)return toast(error.message);
      await loadProducts();
    } else{ payload.id='local-'+Date.now(); payload.status='approved'; state.products.unshift(payload); localStorage.hp_products=JSON.stringify(state.products); }
    toast('Listing submitted for admin approval'); route('market');
  }
  function messagesPage(){ return `<section class="page-card"><h1>Messages</h1><div class="notice">In-app chat protects your platform earnings. Phone numbers and emails are blocked automatically.</div><form id="messageForm" class="form"><input name="to" placeholder="Seller/User ID or email"><textarea name="message" placeholder="Write message"></textarea><button class="primary">Send Message</button></form></section>`; }
  function cleanMessage(m){ return String(m||'').replace(/\b\d{10}\b/g,'[phone blocked]').replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/ig,'[email blocked]').replace(/wa\.me|whatsapp/ig,'[contact link blocked]'); }
  async function sendMsg(form){ if(!state.user)return route('login'); const fd=new FormData(form); const msg=cleanMessage(fd.get('message')); if(sb){ await sb.from('messages').insert({sender_id:state.user.id,receiver_id:null,message:msg}); } toast('Message sent inside platform'); form.reset(); }
  function ordersPage(){ return `<section class="page-card"><h1>Orders</h1><div class="notice">Orders placed through checkout will show here. Admin can manage shipment and payment status from dashboard.</div><div id="ordersList"></div></section>`; }
  async function loadOrders(){ if(!sb||!state.user)return; const {data}=await sb.from('orders').select('*').or(`buyer_id.eq.${state.user.id},user_id.eq.${state.user.id}`).order('created_at',{ascending:false}); $('#ordersList') && ($('#ordersList').innerHTML=localizeHtml((data||[]).map(o=>`<div class="cart-item"><div><b>Order ${String(o.id).slice(0,8)}</b><p>${money(o.amount)} • ${o.status}</p></div><span class="badge">${new Date(o.created_at).toLocaleDateString()}</span></div>`).join('')||empty('No orders yet.'))); }
  function sum(arr,key){ return (arr||[]).reduce((s,x)=>s+Number(x?.[key]||0),0); }
  function adminMoney(n){ return money(Number(n||0)); }
  function statusBadge(status){ const st=String(status||'pending'); return `<span class="badge ${st==='approved'||st==='paid'||st==='delivered'?'verified':(st==='rejected'||st==='banned'||st==='cancelled'?'danger-soft':'')}">${esc(st)}</span>`; }

  function adminIdentityPanel(){
    if(!isAdminUser()) return '';
    const currentBadge=state.profile?.badge_key || 'founder_1_of_1';
    const currentTitle=state.profile?.title_prefix || state.profile?.rank_title || 'Platform Founder';
    const currentBanner=state.profile?.banner_title || 'Original Founder • One of One';
    const planKey=state.profile?.active_membership || 'admin_unlimited';
    const badgeOpts=ADMIN_BADGE_OPTIONS.map(k=>`<option value="${esc(k)}" ${k===currentBadge?'selected':''}>${esc(CUSTOM_BADGE_DEFS[k]?.name||k)}</option>`).join('');
    const titleOpts=ADMIN_TITLE_OPTIONS.map(x=>`<option value="${esc(x)}" ${x===currentTitle?'selected':''}>${esc(x)}</option>`).join('');
    const bannerOpts=ADMIN_BANNER_OPTIONS.map(x=>`<option value="${esc(x)}" ${x===currentBanner?'selected':''}>${esc(x)}</option>`).join('');
    const planOpts=[ADMIN_UNLOCKED_PLAN,...MEMBERSHIP_PLANS].map(p=>`<option value="${esc(p.key)}" ${p.key===planKey?'selected':''}>${esc(p.name)} • ${limitLabel(p.listings)} listings</option>`).join('');
    return `<section class="page-card admin-panel admin-identity-control"><div class="section-head compact"><h2>Admin access and identity</h2><span class="badge owner">Unlocked</span></div><p class="muted">Founder/admin account has every feature unlocked. Choose the title, banner, badge and plan style you want to display.</p><form id="adminIdentityForm" class="form admin-identity-form"><select name="title_prefix">${titleOpts}</select><select name="banner_title">${bannerOpts}</select><select name="badge_key">${badgeOpts}</select><select name="active_membership">${planOpts}</select><button class="primary">Save Admin Identity</button></form>${userBanner()}</section>`;
  }
  async function saveAdminIdentity(form){
    if(!sb||!isAdminUser()) return toast('Admin access required');
    const fd=new FormData(form); const badgeKey=fd.get('badge_key')||'founder_1_of_1'; const badge=CUSTOM_BADGE_DEFS[badgeKey]||CUSTOM_BADGE_DEFS.founder_1_of_1; const plan=planByKey(fd.get('active_membership'))||ADMIN_UNLOCKED_PLAN;
    const patch={role:'admin',is_founder:true,founder_number:1,points:999999,rank_key:'founder',rank_title:'Founder 1 of 1',title_prefix:fd.get('title_prefix')||'Platform Founder',banner_key:fd.get('banner_title')||'founder_1_of_1',banner_title:fd.get('banner_title')||'Original Founder • One of One',badge_key:badgeKey,badge_title:badge.name,active_membership:plan.key,membership_key:plan.key,membership_title:plan.title,membership_badge:plan.badge,membership_banner:plan.banner,membership_expires_at:new Date(Date.now()+3650*86400000).toISOString(),updated_at:new Date().toISOString()};
    const {error}=await sb.from('users').update(patch).eq('auth_id',state.user.id);
    if(error) return toast(error.message);
    state.profile={...(state.profile||{}),...patch}; toast('Admin identity updated'); syncMenu(); render();
  }
  function adminCarouselRows(){
    return (state.admin.siteSlides&&state.admin.siteSlides.length?state.admin.siteSlides:state.siteSlides).map(sl=>`<details class="admin-detail-card"><summary><div><b>${esc(sl.title||'Slide')}</b><p>${esc(sl.cta_text||'Open')} → ${esc(sl.cta_route||'market')}</p><small>${sl.active===false?'Hidden':'Live'} • order ${Number(sl.sort_order||0)}</small></div><span class="badge ${sl.active===false?'danger-soft':'verified'}">${sl.active===false?'Hidden':'Live'}</span></summary><div class="info-list"><div><span>Subtitle</span><b>${esc(sl.subtitle||'')}</b></div><div><span>Image</span><b data-no-translate>${esc(sl.image_url||'Default image')}</b></div></div>${sl.id?`<div class="approval-actions"><button class="secondary" onclick="HP.toggleCarouselSlide('${esc(sl.id)}',${sl.active===false?'true':'false'})">${sl.active===false?'Show':'Hide'}</button><button class="danger" onclick="HP.deleteCarouselSlide('${esc(sl.id)}')">Delete</button></div>`:''}</details>`).join('') || empty('No carousel slides yet.');
  }
  function adminCarouselPanel(){
    if(!isAdminUser()) return '';
    return `<section class="page-card admin-panel"><div class="section-head compact"><h2>Home carousel</h2><span class="badge live-badge">Realtime</span></div><p class="muted">Add or change home page banners without editing code.</p><form id="carouselSlideForm" class="form carousel-admin-form"><input name="title" placeholder="Slide title" required><textarea name="subtitle" placeholder="Short slide text" required></textarea><input name="image_url" placeholder="Image URL optional"><input name="cta_text" placeholder="Button text" value="Open"><select name="cta_route"><option value="market">Marketplace</option><option value="sell">Sell</option><option value="membership">Plans</option><option value="support">Support</option></select><input name="sort_order" type="number" placeholder="Sort order" value="10"><button class="primary">Save Carousel Slide</button></form><div id="adminCarouselList">${adminCarouselRows()}</div></section>`;
  }
  async function saveCarouselSlide(form){
    if(!sb||!isAdminUser()) return toast('Admin access required');
    const fd=new FormData(form); const payload={title:fd.get('title'),subtitle:fd.get('subtitle'),image_url:fd.get('image_url')||'',cta_text:fd.get('cta_text')||'Open',cta_route:normalizeRouteName(fd.get('cta_route')||'market'),sort_order:Number(fd.get('sort_order')||10),active:true,updated_at:new Date().toISOString()};
    const {error}=await sb.from('site_carousel_slides').insert(payload);
    if(error) return toast('Run the v82 SQL patch once to enable dynamic carousel.');
    form.reset(); await loadSiteContent(); toast('Carousel slide saved'); render();
  }
  async function toggleCarouselSlide(id,active){ if(!sb||!isAdminUser()) return; const {error}=await sb.from('site_carousel_slides').update({active,updated_at:new Date().toISOString()}).eq('id',id); if(error)return toast(error.message); await loadSiteContent(); render(); }
  async function deleteCarouselSlide(id){ if(!sb||!isAdminUser()) return; if(!confirm('Delete this carousel slide?')) return; const {error}=await sb.from('site_carousel_slides').delete().eq('id',id); if(error)return toast(error.message); await loadSiteContent(); render(); }

  function adminPage(){
    if(!isAdminUser()) return emptyPage('Admin access only');
    const products=(state.admin.products&&state.admin.products.length?state.admin.products:state.products)||[];
    const orders=state.admin.orders||[];
    const sellers=state.admin.sellers||[];
    const reports=state.admin.reports||[];
    const contacts=state.admin.contacts||[];
    const plans=state.admin.plans||[];
    const boosts=state.admin.boosts||[];
    const memberships=state.admin.memberships||[];
    const gross=orders.reduce((s,o)=>s+Number(o.amount||0),0);
    const paid=orders.filter(o=>['paid','confirmed','shipped','delivered'].includes(o.status)).reduce((s,o)=>s+Number(o.amount||0),0);
    const platform=orders.reduce((s,o)=>s+Number(o.platform_fee||0),0);
    const pendingProducts=products.filter(p=>p.status==='pending');
    const pendingSellers=sellers.filter(s=>['pending','provisional'].includes(s.status));
    return `<section class="admin-hero-pro page-card">
      <div class="admin-orb"></div>
      <div class="admin-owner-row"><img src="./logo-192.png" alt=""><div><span class="badge owner">ADMIN CONTROL CENTER</span><h1>Platform Owner Dashboard</h1><p data-no-translate>${esc(state.user.email||'')}</p></div></div>
      <div class="admin-quick-actions"><button class="primary" data-route="sell">List Product</button><button class="secondary" data-route="market">View Marketplace</button><button class="ghost" data-route="orders">Orders</button></div>
    </section>
    ${adminIdentityPanel()}${adminCarouselPanel()}
    <section class="admin-kpi-grid">
      <div class="admin-kpi"><small>Total GMV</small><b>${adminMoney(gross)}</b><span>All checkout value</span></div>
      <div class="admin-kpi"><small>Paid Revenue</small><b>${adminMoney(paid)}</b><span>Paid / shipped / delivered</span></div>
      <div class="admin-kpi"><small>Platform Fees</small><b>${adminMoney(platform)}</b><span>Buyer protection fees</span></div>
      <div class="admin-kpi"><small>Pending Sellers</small><b>${pendingSellers.length}</b><span>Need document review</span></div>
      <div class="admin-kpi"><small>Pending Products</small><b>${pendingProducts.length}</b><span>Need listing review</span></div>
      <div class="admin-kpi"><small>Safety Reports</small><b>${reports.filter(r=>r.status==='open').length}</b><span>Open reports</span></div>
    </section>
    <section class="admin-columns">
      <div class="page-card admin-panel"><div class="section-head compact"><h2>Seller approval queue</h2><span class="badge">${pendingSellers.length} pending</span></div><div id="sellerApprovalList">${adminSellerList(sellers)}</div></div>
      <div class="page-card admin-panel"><div class="section-head compact"><h2>Product approval queue</h2><span class="badge">${pendingProducts.length} pending</span></div><div id="productApprovalList">${adminProductQueue(products)}</div></div>
    </section>
    <section class="admin-columns">
      <div class="page-card admin-panel"><div class="section-head compact"><h2>Approved sellers</h2><span class="badge verified">${sellers.filter(s=>s.status==='approved').length} active</span></div><div id="approvedSellersList">${adminSellerManager(sellers,'approved')}</div></div>
      <div class="page-card admin-panel"><div class="section-head compact"><h2>Rejected / banned sellers</h2><span class="badge danger-soft">${sellers.filter(s=>['rejected','banned'].includes(s.status)).length}</span></div><div id="sellerArchiveList">${adminSellerManager(sellers,'archive')}</div></div>
    </section>
    <section class="admin-columns">
      <div class="page-card admin-panel"><div class="section-head compact"><h2>Live products</h2><span class="badge verified">${products.filter(p=>p.status==='approved').length} live</span></div><div id="approvedProductsList">${adminProductManager(products,'approved')}</div></div>
      <div class="page-card admin-panel"><div class="section-head compact"><h2>Rejected / banned products</h2><span class="badge danger-soft">${products.filter(p=>['rejected','banned'].includes(p.status)).length}</span></div><div id="productArchiveList">${adminProductManager(products,'archive')}</div></div>
    </section>
    <section class="admin-columns">
      <div class="page-card admin-panel"><div class="section-head compact"><h2>Latest orders</h2><span class="badge">${orders.length}</span></div><div id="adminOrdersList">${adminOrdersList(orders)}</div></div>
      <div class="page-card admin-panel"><div class="section-head compact"><h2>Reports & support</h2><span class="badge danger-soft">${reports.filter(r=>r.status==='open').length} open</span></div><div id="adminReportsList">${adminReportsList(reports)}</div><div id="adminContactsList">${adminContactsList(contacts)}</div></div>
    </section>
    <section class="page-card admin-panel"><div class="section-head compact"><h2>Revenue systems</h2><span class="badge owner">Plans, boosts and fees</span></div>
      <div class="revenue-mini-grid">
        <div><b>Memberships</b><span>${memberships.length} purchases</span><strong>${adminMoney(memberships.reduce((s,p)=>s+Number(p.amount||0),0))}</strong></div><div><b>Seller Plans</b><span>${plans.length} purchases</span><strong>${adminMoney(plans.reduce((s,p)=>s+Number(p.amount||0),0))}</strong></div>
        <div><b>Boosted Listings</b><span>${products.filter(p=>p.is_boosted).length} active / ${boosts.length} logs</span><strong>${adminMoney(boosts.reduce((s,b)=>s+Number(b.amount||0),0))}</strong></div>
        <div><b>Approved Products</b><span>${products.filter(p=>p.status==='approved').length} live</span><strong>${products.length} total</strong></div>
        <div><b>Seller Pipeline</b><span>${sellers.length} sellers</span><strong>${sellers.filter(s=>s.status==='approved').length} approved</strong></div>
      </div>
    </section>
    <section class="page-card admin-panel money-admin-panel"><div class="section-head compact"><h2>Money in and seller payouts</h2><span class="badge live-badge">Live counters</span></div><div id="adminMoneyList">${adminMoneyList()}</div></section>
    <section class="admin-columns">
      <div class="page-card admin-panel"><div class="section-head compact"><h2>Ranks & badges</h2><span class="badge owner">Ranks and rewards</span></div><div id="adminRanksList">${adminRanksList()}</div></div>
      <div class="page-card admin-panel"><div class="section-head compact"><h2>Events & rewards</h2><span class="badge">Ready</span></div><div id="adminEventsList">${adminEventsList()}</div></div>
    </section><section class="page-card admin-panel"><div class="section-head compact"><h2>Membership purchases</h2><span class="badge owner">₹49 to ₹5999</span></div><div id="adminMembershipList">${adminMembershipList(memberships)}</div></section>`;
  }

  function adminRanksList(){
    const users=state.admin.users||[];
    const rows=(users.length?users:[state.profile].filter(Boolean)).slice(0,25).map(u=>{
      const isFounder=(u?.is_founder || (u?.email||'').toLowerCase()===ADMIN_EMAIL || u?.role==='admin');
      const pts=isFounder?999999:Number(u?.points||0);
      const rank=rankForPoints(pts);
      return `<div class="rank-admin-row"><div>${customBadge(isFounder?'founder_1_of_1':(u?.badge_key||'buyer_member'))}</div><div><b data-no-translate>${esc(u?.email||u?.full_name||'User')}</b><span>${esc(isFounder?'Founder 1 of 1':rank.title)} • ${pts>=999999?'MAX':pts+' pts'}</span></div><span class="badge ${isFounder?'owner':'verified'}">${esc(u?.role||'user')}</span></div>`;
    }).join('');
    return rows || empty('No users loaded yet.');
  }
  function adminEventsList(){
    const ev=state.admin.events||[];
    const fallback=[{title:'Listing Sprint',status:'draft',description:'Reward the seller with highest approved listings.'},{title:'Dealer Week',status:'draft',description:'Give a limited custom title and banner to top dealer.'},{title:'Harvest Festival Rewards',status:'draft',description:'Event badge for seasonal winners.'}];
    return (ev.length?ev:fallback).map(e=>`<div class="event-admin-row"><div><b>${esc(e.title)}</b><span>${esc(e.description||'Event reward challenge')}</span></div><span class="badge">${esc(e.status||'draft')}</span></div>`).join('');
  }


  function adminMoneyList(){
    const balances=state.admin.balances||[], accounts=state.admin.payoutAccounts||[], requests=state.admin.payoutRequests||[], ledger=state.admin.ledger||[];
    const totalSellerDue=balances.reduce((s,b)=>s+Number(b.available_balance||b.pending_balance||0),0);
    const totalPaid=balances.reduce((s,b)=>s+Number(b.paid_balance||0),0);
    const totalFees=balances.reduce((s,b)=>s+Number(b.platform_fee_total||0),0) || ledger.reduce((s,l)=>s+Number(l.platform_fee||0),0);
    const reqRows=requests.slice(0,25).map(r=>{
      const acc=accounts.find(a=>String(a.user_id)===String(r.user_id)) || r;
      const payTo=acc.payout_method==='bank' ? `${esc(acc.account_holder_name||'')} • ${esc(acc.bank_name||'')} • ${esc(acc.account_number||'')} • ${esc(acc.ifsc||'')}` : `${esc(acc.upi_id||r.upi_id||'No UPI')}`;
      return `<details class="admin-detail-card payout-admin-row"><summary><div><b>${money(r.amount)}</b><p>${esc(r.users?.email||r.user_id||'Seller')} • ${esc(r.status||'requested')}</p><small>${esc(r.payout_method||acc.payout_method||'upi')} payout</small></div>${statusBadge(r.status||'requested')}</summary><div class="info-list"><div><span>Pay to</span><b data-no-translate>${payTo}</b></div><div><span>Seller</span><b data-no-translate>${esc(r.users?.full_name||r.users?.email||r.user_id||'')}</b></div><div><span>Requested</span><b>${payoutDateText(r.created_at)}</b></div></div><div class="approval-actions"><button class="secondary" onclick="HP.setPayoutStatus('${esc(r.id)}','paid','${esc(r.user_id)}',${Number(r.amount||0)})">Mark Paid</button><button class="ghost" onclick="HP.setPayoutStatus('${esc(r.id)}','processing','${esc(r.user_id)}',${Number(r.amount||0)})">Processing</button><button class="danger" onclick="HP.setPayoutStatus('${esc(r.id)}','rejected','${esc(r.user_id)}',${Number(r.amount||0)})">Reject</button></div></details>`;
    }).join('') || empty('No payout requests yet');
    const balanceRows=balances.slice(0,15).map(b=>`<div class="payout-row"><div><b data-no-translate>${esc(b.users?.email||b.user_id||'Seller')}</b><span>UPI/Bank: ${esc((accounts.find(a=>String(a.user_id)===String(b.user_id))?.payout_method)||'not added')}</span></div><strong>${money(b.available_balance||b.pending_balance||0)}</strong></div>`).join('') || empty('No seller balances yet');
    return `<div class="money-grid admin-money-totals"><div><small>Seller payout due</small>${moneyCounter(totalSellerDue)}</div><div><small>Platform commission earned</small>${moneyCounter(totalFees)}</div><div><small>Already paid sellers</small>${moneyCounter(totalPaid)}</div></div><h3>Payout requests</h3>${reqRows}<h3>Seller balances & payout accounts</h3>${balanceRows}`;
  }
  async function setPayoutStatus(id,status,userId,amount=0){
    if(!sb||!isAdminUser()) return toast('Admin only');
    const patch={status,updated_at:new Date().toISOString()}; if(status==='paid') patch.paid_at=new Date().toISOString();
    const {error}=await sb.from('seller_payout_requests').update(patch).eq('id',id); if(error) return toast(error.message);
    if(status==='paid'){
      await sb.from('seller_ledger').update({status:'paid',updated_at:new Date().toISOString()}).eq('seller_id',userId).in('status',['pending_clearance','available','payout_requested']);
      const {data}=await sb.from('seller_balances').select('*').eq('user_id',userId).maybeSingle();
      const old=data||{}; await sb.from('seller_balances').upsert({user_id:userId,available_balance:0,pending_balance:0,paid_balance:Number(old.paid_balance||0)+Number(amount||0),platform_fee_total:Number(old.platform_fee_total||0),updated_at:new Date().toISOString()},{onConflict:'user_id'});
    }
    toast(`Payout ${status}`); await loadAdminProData();
  }

  function adminMembershipList(rows=[]){
    return (rows||[]).slice(0,30).map(m=>`<details class="admin-detail-card"><summary><div><b>${esc(m.plan_name||m.plan_key||'Membership')}</b><p>${money(m.amount)} • ${esc(m.status||'pending')}</p><small data-no-translate>${esc(m.users?.email||m.user_id||'')}</small></div>${statusBadge(m.status||'pending')}</summary><div class="info-list"><div><span>Plan key</span><b>${esc(m.plan_key||'')}</b></div><div><span>Payment</span><b>${esc(m.payment_id||'Not paid online')}</b></div><div><span>Expires</span><b>${m.expires_at?new Date(m.expires_at).toLocaleDateString('en-IN'):'—'}</b></div><div><span>Created</span><b>${m.created_at?new Date(m.created_at).toLocaleDateString('en-IN'):'—'}</b></div></div></details>`).join('')||empty('No membership purchases yet');
  }
  function sellerDocUrl(path){ return state.admin.docUrls?.[path] || ''; }
  function adminDocPreview(path,label){
    if(!path) return `<div class="doc-tile missing"><b>${label}</b><span>Not uploaded</span></div>`;
    const url=sellerDocUrl(path);
    const file=esc(String(path).split('/').pop()||'document');
    if(!url) return `<div class="doc-tile"><b>${label}</b><span>${file}</span><small>Open after admin data loads</small></div>`;
    const isPdf=/\.pdf($|\?)/i.test(path);
    return `<a class="doc-tile" href="${url}" target="_blank" rel="noopener"><b>${label}</b>${isPdf?'<span class="doc-pdf">PDF document</span>':`<img src="${url}" alt="${label}">`}<small>${file}</small></a>`;
  }
  function adminSellerRow(s,compact=false){
    const name=esc(s.business_name||s.users?.full_name||'Seller request');
    const email=esc(s.users?.email||'');
    const loc=esc([s.city,s.district,s.state].filter(Boolean).join(', ')||'Location not added');
    const id=esc(s.id), uid=esc(s.user_id||'');
    return `<details class="admin-detail-card" ${compact?'':'open'}><summary><div class="doc-avatar">${name.slice(0,2).toUpperCase()}</div><div><b>${name}</b><p data-no-translate>${email} ${s.phone?'• '+esc(s.phone):''}</p><small>${loc}</small></div>${statusBadge(s.status)}</summary><div class="admin-detail-body"><div class="info-list"><div><span>Business</span><b>${name}</b></div><div><span>Phone</span><b data-no-translate>${esc(s.phone||'Not added')}</b></div><div><span>Location</span><b>${loc}</b></div><div><span>Address</span><b>${esc(s.address||'Not added')}</b></div></div><div class="doc-preview-grid">${adminDocPreview(s.aadhaar_front,'Aadhaar front')}${adminDocPreview(s.aadhaar_back,'Aadhaar back')}${adminDocPreview(s.shop_photo,'Shop / stock')}</div><div class="approval-actions"><button class="secondary" onclick="HP.approveSeller('${id}','${uid}')">Approve</button><button class="danger" onclick="HP.rejectSeller('${id}','${uid}')">Reject</button><button class="danger" onclick="HP.banSeller('${id}','${uid}')">Ban</button>${s.status==='banned'?`<button class="ghost" onclick="HP.restoreSeller('${id}','${uid}')">Restore</button>`:''}</div></div></details>`;
  }
  function adminSellerList(list=[]){ const pending=(list||[]).filter(s=>['pending','provisional'].includes(s.status)); return localizeHtml(pending.map(s=>adminSellerRow(s,false)).join('')||empty('No pending sellers')); }
  function adminSellerManager(list=[],mode='approved'){ const rows=(list||[]).filter(s=> mode==='approved' ? s.status==='approved' : ['rejected','banned'].includes(s.status)); return localizeHtml(rows.map(s=>adminSellerRow(s,true)).join('')||empty(mode==='approved'?'No approved sellers yet':'No rejected or banned sellers')); }
  function adminProductRow(p,compact=false){
    const id=esc(p.id), title=esc(p.title||'Product'), img=productImage(p);
    return `<details class="admin-detail-card product-admin-card" ${compact?'':'open'}><summary><img src="${img}" onerror="this.src='${placeholder(p.category)}'"><div><b>${title}</b><p>${money(p.price)} • ${esc(p.category||'Product')} • ${esc([p.city,p.state].filter(Boolean).join(', '))}</p><small>${esc(p.sell_type||'spare')} • ${esc(p.condition||'Used')} • Seller ${esc(p.users?.email||p.sellers?.business_name||'')}</small></div>${statusBadge(p.status)}</summary><div class="admin-detail-body"><p class="muted">${esc(p.description||'No description added.')}</p><div class="info-list"><div><span>Brand</span><b>${esc(p.brand||'Not added')}</b></div><div><span>Model</span><b>${esc(p.model||'Not added')}</b></div><div><span>Weight</span><b>${esc(p.weight_kg||'—')} kg</b></div><div><span>Seller earns</span><b>${money(Number(p.price||0)-sellerFeeForProduct(p))}</b></div></div><div class="approval-actions"><button class="secondary" onclick="HP.approveProduct('${id}')">Approve</button><button class="danger" onclick="HP.rejectProduct('${id}')">Reject</button><button class="danger" onclick="HP.banProduct('${id}')">Ban</button>${p.status==='banned'||p.status==='rejected'?`<button class="ghost" onclick="HP.restoreProduct('${id}')">Restore</button>`:''}<button class="ghost" onclick="HP.route('product',{id:'${id}'})">Open</button></div></div></details>`;
  }
  function adminProductQueue(products=[]){ const rows=(products||[]).filter(p=>p.status==='pending'); return rows.map(p=>adminProductRow(p,false)).join('')||empty('No pending products'); }
  function adminProductManager(products=[],mode='approved'){ const rows=(products||[]).filter(p=> mode==='approved' ? p.status==='approved' : ['rejected','banned'].includes(p.status)); return rows.slice(0,40).map(p=>adminProductRow(p,true)).join('')||empty(mode==='approved'?'No approved products yet':'No rejected or banned products'); }
  function adminOrdersList(orders=[]){ return (orders||[]).slice(0,12).map(o=>`<details class="admin-detail-card"><summary><div><b>Order ${esc(String(o.id).slice(0,8))}</b><p>${money(o.amount)} • ${esc(o.buyer_phone||'')}</p><small>${new Date(o.created_at||Date.now()).toLocaleString('en-IN')}</small></div>${statusBadge(o.status)}</summary><div class="approval-actions"><button class="ghost" onclick="HP.setOrderStatus('${esc(o.id)}','paid')">Paid</button><button class="ghost" onclick="HP.setOrderStatus('${esc(o.id)}','confirmed')">Confirm</button><button class="ghost" onclick="HP.setOrderStatus('${esc(o.id)}','shipped')">Ship</button><button class="secondary" onclick="HP.setOrderStatus('${esc(o.id)}','delivered')">Delivered</button><button class="danger" onclick="HP.setOrderStatus('${esc(o.id)}','cancelled')">Cancel</button></div></details>`).join('')||empty('No orders yet'); }
  function adminReportsList(reports=[]){ return (reports||[]).slice(0,8).map(r=>`<details class="admin-detail-card"><summary><div><b>${esc(r.target_type||'Report')} report</b><p>${esc(r.reason||'No reason added')}</p><small>${new Date(r.created_at||Date.now()).toLocaleDateString('en-IN')}</small></div>${statusBadge(r.status||'open')}</summary><div class="approval-actions"><button class="ghost" onclick="HP.setReportStatus('${esc(r.id)}','reviewing')">Reviewing</button><button class="secondary" onclick="HP.setReportStatus('${esc(r.id)}','closed')">Close</button></div></details>`).join('')||empty('No reports'); }
  function adminContactsList(contacts=[]){ if(!contacts?.length) return ''; return `<h3>Support messages</h3>`+(contacts||[]).slice(0,8).map(c=>`<details class="admin-detail-card"><summary><div><b>${esc(c.name||'Support request')}</b><p>${esc(c.topic||'Support')} • ${esc(c.phone||'')}</p><small>${new Date(c.created_at||Date.now()).toLocaleDateString('en-IN')}</small></div>${statusBadge(c.status||'open')}</summary><p>${esc(c.message||'')}</p><div class="approval-actions"><button class="secondary" onclick="HP.setContactStatus('${esc(c.id)}','closed')">Close</button><button class="ghost" onclick="HP.setContactStatus('${esc(c.id)}','open')">Reopen</button></div></details>`).join(''); }
  async function loadAdminProData(){
    if(!sb)return;
    const safe=async(fn,fallback=[])=>{try{const {data,error}=await fn(); if(error) return fallback; return data||fallback;}catch(e){return fallback;}};
    state.admin.sellers=await safe(()=>sb.from('sellers').select('*, users(*)').order('created_at',{ascending:false}).limit(120));
    state.admin.products=await safe(()=>sb.from('products').select('*, sellers(business_name,status), users(*)').order('created_at',{ascending:false}).limit(160));
    if(state.admin.products.length) state.products=state.admin.products;
    state.admin.orders=await safe(()=>sb.from('orders').select('*').order('created_at',{ascending:false}).limit(80));
    state.admin.reports=await safe(()=>sb.from('reports').select('*').order('created_at',{ascending:false}).limit(80));
    state.admin.contacts=await safe(()=>sb.from('contact_messages').select('*').order('created_at',{ascending:false}).limit(80));
    state.admin.plans=await safe(()=>sb.from('seller_plans').select('*').order('created_at',{ascending:false}).limit(80));
    state.admin.boosts=await safe(()=>sb.from('boost_purchases').select('*').order('created_at',{ascending:false}).limit(80));
    state.admin.users=await safe(()=>sb.from('users').select('*').order('created_at',{ascending:false}).limit(120));
    state.admin.badges=await safe(()=>sb.from('badge_definitions').select('*').order('sort_order',{ascending:true}).limit(120));
    state.admin.events=await safe(()=>sb.from('platform_events').select('*').order('created_at',{ascending:false}).limit(80));
    state.admin.memberships=await safe(()=>sb.from('membership_purchases').select('*, users(email,full_name)').order('created_at',{ascending:false}).limit(100));
    state.admin.balances=await safe(()=>sb.from('seller_balances').select('*, users(email,full_name,phone)').order('available_balance',{ascending:false}).limit(120));
    state.admin.payoutAccounts=await safe(()=>sb.from('seller_payout_accounts').select('*, users(email,full_name,phone)').order('updated_at',{ascending:false}).limit(120));
    state.admin.payoutRequests=await safe(()=>sb.from('seller_payout_requests').select('*, users(email,full_name,phone)').order('created_at',{ascending:false}).limit(120));
    state.admin.ledger=await safe(()=>sb.from('seller_ledger').select('*, users(email,full_name,phone)').order('created_at',{ascending:false}).limit(160));
    state.admin.siteSlides=await safe(()=>sb.from('site_carousel_slides').select('*').order('sort_order',{ascending:true}).order('created_at',{ascending:false}).limit(50));
    await prepareAdminDocUrls(state.admin.sellers);
    refreshAdminLists();
  }
  async function prepareAdminDocUrls(sellers=[]){
    state.admin.docUrls=state.admin.docUrls||{};
    if(!sb||!isAdminUser()) return;
    const paths=[...new Set((sellers||[]).flatMap(s=>[s.aadhaar_front,s.aadhaar_back,s.shop_photo]).filter(Boolean))];
    for(const path of paths){
      if(state.admin.docUrls[path]) continue;
      try{ const {data,error}=await sb.storage.from('verification-docs').createSignedUrl(path, 60*60); if(!error&&data?.signedUrl) state.admin.docUrls[path]=data.signedUrl; }catch(e){}
    }
  }
  function refreshAdminLists(){
    const sellers=state.admin.sellers||[], products=state.admin.products||state.products||[];
    const wrap=$('#sellerApprovalList'); if(wrap) wrap.innerHTML=adminSellerList(sellers);
    const aw=$('#approvedSellersList'); if(aw) aw.innerHTML=adminSellerManager(sellers,'approved');
    const sw=$('#sellerArchiveList'); if(sw) sw.innerHTML=adminSellerManager(sellers,'archive');
    const pw=$('#productApprovalList'); if(pw) pw.innerHTML=adminProductQueue(products);
    const apw=$('#approvedProductsList'); if(apw) apw.innerHTML=adminProductManager(products,'approved');
    const paw=$('#productArchiveList'); if(paw) paw.innerHTML=adminProductManager(products,'archive');
    const ow=$('#adminOrdersList'); if(ow) ow.innerHTML=adminOrdersList(state.admin.orders);
    const rw=$('#adminReportsList'); if(rw) rw.innerHTML=adminReportsList(state.admin.reports);
    const cw=$('#adminContactsList'); if(cw) cw.innerHTML=adminContactsList(state.admin.contacts);
    const rl=$('#adminRanksList'); if(rl) rl.innerHTML=adminRanksList();
    const ev=$('#adminEventsList'); if(ev) ev.innerHTML=adminEventsList();
    const ml=$('#adminMembershipList'); if(ml) ml.innerHTML=adminMembershipList(state.admin.memberships);
    const money=$('#adminMoneyList'); if(money) money.innerHTML=adminMoneyList();
    const car=$('#adminCarouselList'); if(car) car.innerHTML=adminCarouselRows();
  }
  async function loadAdminSellers(){ await loadAdminProData(); }
  function statusPatchHint(error){ const msg=String(error?.message||error||''); if(msg.includes('check constraint')||msg.includes('banned')||msg.includes('aadhaar_back')) return 'This admin action needs the latest database setup. Please update the database and try again.'; return msg; }
  async function updateUserRankPatch(userId,patch){
    if(!sb||!userId)return;
    let {error}=await sb.from('users').update(patch).eq('auth_id',userId);
    if(error && /rank_key|badge_key|banner_key|points/i.test(String(error.message||''))){
      const safe={...patch}; ['rank_key','rank_title','badge_key','banner_key','banner_title','points','is_founder','founder_number','title_prefix'].forEach(k=>delete safe[k]);
      await sb.from('users').update(safe).eq('auth_id',userId);
    }
  }
  async function setSellerStatus(id,userId,status){
    if(!sb)return; const patch={status,verification_status:status};
    if(status==='approved') patch.approved_at=new Date().toISOString();
    if(status==='banned') patch.banned_at=new Date().toISOString();
    const {error}=await sb.from('sellers').update(patch).eq('id',id); if(error)return toast(statusPatchHint(error));
    if(userId){
      if(status==='approved') await updateUserRankPatch(userId,{role:'seller',badge_title:'Verified Seller',badge_color:'green',badge_key:'verified_seller',rank_key:'rising',rank_title:'Rising Trader',banner_key:'verified_seller',banner_title:'Verified Seller Banner',points:180});
      if(['rejected','banned'].includes(status)) await updateUserRankPatch(userId,{role:'user',badge_title:status==='banned'?'Banned Seller':'Member',badge_color:status==='banned'?'red':'green',badge_key:'buyer_member'});
      if(status==='banned') await sb.from('products').update({status:'banned',banned_at:new Date().toISOString()}).eq('user_id',userId);
    }
    toast(`Seller ${status}`); await loadAdminProData();
  }
  async function approveSeller(id,userId){ return setSellerStatus(id,userId,'approved'); }
  async function rejectSeller(id,userId){ if(confirm('Reject this seller request?')) return setSellerStatus(id,userId,'rejected'); }
  async function banSeller(id,userId){ if(confirm('Ban this seller and hide their products?')) return setSellerStatus(id,userId,'banned'); }
  async function restoreSeller(id,userId){ return setSellerStatus(id,userId,'approved'); }
  async function setProductStatus(id,status){
    const patch={status}; if(status==='approved') patch.approved_at=new Date().toISOString(); if(status==='banned') patch.banned_at=new Date().toISOString();
    if(sb){ const {error}=await sb.from('products').update(patch).eq('id',id); if(error)return toast(statusPatchHint(error)); }
    const p=state.products.find(x=>String(x.id)===String(id)); if(p) Object.assign(p,patch);
    toast(`Product ${status}`); await loadAdminProData();
  }
  async function approveProduct(id){ return setProductStatus(id,'approved'); }
  async function rejectProduct(id){ if(confirm('Reject this product?')) return setProductStatus(id,'rejected'); }
  async function banProduct(id){ if(confirm('Ban this product from marketplace?')) return setProductStatus(id,'banned'); }
  async function restoreProduct(id){ return setProductStatus(id,'approved'); }
  async function setOrderStatus(id,status){ if(!sb)return; const {error}=await sb.from('orders').update({status,updated_at:new Date().toISOString()}).eq('id',id); if(error)return toast(error.message); toast('Order updated'); await loadAdminProData(); }
  async function setReportStatus(id,status){ if(!sb)return; const {error}=await sb.from('reports').update({status,updated_at:new Date().toISOString()}).eq('id',id); if(error)return toast(error.message); toast('Report updated'); await loadAdminProData(); }
  async function setContactStatus(id,status){ if(!sb)return; const {error}=await sb.from('contact_messages').update({status}).eq('id',id); if(error)return toast(error.message); toast('Support message updated'); await loadAdminProData(); }
  function empty(msg){return `<div class="page-card muted" style="grid-column:1/-1">${msg}</div>`} function emptyPage(msg){return `<section class="page-card"><h1>${msg}</h1><button class="primary" data-route="home">Go Home</button></section>`}
  function render(){ const [r,id]=parseRoute(); state.route=r||state.route||'home'; state.currentProduct=id||state.currentProduct; let html=''; if(state.route==='home')html=home(); else if(state.route==='market')html=market(); else if(state.route==='product')html=productPage(state.currentProduct); else if(state.route==='cart')html=cartPage(); else if(state.route==='checkout')html=checkoutPage(); else if(state.route==='login')html=loginPage(); else if(state.route==='account')html=accountPage(); else if(state.route==='sell')html=sellPage(); else if(state.route==='messages')html=messagesPage(); else if(state.route==='orders')html=ordersPage(); else if(state.route==='admin')html=adminPage(); else if(state.route==='membership')html=membershipPage(); else if(state.route==='categories')html=categoriesPage(); else if(state.route==='about')html=aboutPage(); else if(state.route==='contact')html=contactPage(); else if(state.route==='how')html=howPage(); else if(state.route==='support')html=supportPage(); else html=home(); app.innerHTML=localizeHtml(html); syncMenu(); bindPage(); applyLang(); animateCounters(); if(state.route==='orders')loadOrders(); if(state.route==='admin')loadAdminProData(); }
  function bindPage(){
    $$('#app input, #app textarea, #app select').forEach(el=>el.addEventListener('click',e=>e.stopPropagation()));
    $('#loginForm')?.addEventListener('submit',e=>{e.preventDefault(); const fd=new FormData(e.target); withLoading(e.target,()=>login(fd.get('email'),fd.get('password')),'Logging in...');});
    $('#signupSwitch')?.addEventListener('click',()=>{ const f=$('#loginForm'); const fd=new FormData(f); const email=fd.get('email'), pass=fd.get('password'); if(!email||!pass)return toast('Enter email and password first'); signup(email,pass,''); });
    $('#forgotBtn')?.addEventListener('click',()=>{ const fd=new FormData($('#loginForm')); forgotPassword(fd.get('email')); });
    $('#googleLoginBtn')?.addEventListener('click',loginGoogle);
    $('#sendOtpBtn')?.addEventListener('click',()=>sendPhoneOtp(getOtpPhone()));
    $('#verifyOtpBtn')?.addEventListener('click',()=>verifyPhoneOtp(getOtpPhone(), $('#otpCodeInput')?.value.trim()));
    $('#profileForm')?.addEventListener('submit',e=>{e.preventDefault();withLoading(e.target,()=>saveProfile(e.target),'Saving...')});
    $('#sellerVerifyForm')?.addEventListener('submit',e=>{e.preventDefault();withLoading(e.target,()=>submitSellerVerification(e.target),'Submitting verification...')});
    $('#sellForm')?.addEventListener('submit',e=>{e.preventDefault();withLoading(e.target,()=>submitProduct(e.target),'Submitting listing...')});
    bindSellTypeChooser();
    $('#sellForm input[name="price"]')?.addEventListener('input',e=>{ const price=Number(e.target.value||0); $('#sellerFeePreview').innerHTML=localizeHtml(`Listing price: <b>${money(price)}</b> • Seller platform fee: <b>${money(sellerFee(price))}</b> • Seller balance after fee: <b>${money(price-sellerFee(price))}</b> • ${feeDiscountForPlan(activePlan())}`); });
    $('#checkoutForm')?.addEventListener('submit',e=>{e.preventDefault();withLoading(e.target,()=>placeOrder(e.target),'Placing order...')});
    $('#checkoutForm select[name="shipping"]')?.addEventListener('change',e=>{ $('#checkoutSummary').innerHTML=localizeHtml(summaryRows(getTotals(e.target.value))); });
    $('#messageForm')?.addEventListener('submit',e=>{e.preventDefault();withLoading(e.target,()=>sendMsg(e.target),'Sending...')});
    $('#contactForm')?.addEventListener('submit',e=>{e.preventDefault();withLoading(e.target,()=>sendContact(e.target),'Saving request...')});
    $$('[data-plan-key]').forEach(btn=>btn.addEventListener('click',e=>{ e.preventDefault(); e.stopPropagation(); withLoading(btn.closest('.membership-card')||btn,()=>purchaseMembership(btn.dataset.planKey),'Opening plan...'); }));
    $('#payoutAccountForm')?.addEventListener('submit',e=>{e.preventDefault();withLoading(e.target,()=>savePayoutAccount(e.target),'Saving payout...')});
    $('#adminIdentityForm')?.addEventListener('submit',e=>{e.preventDefault();withLoading(e.target,()=>saveAdminIdentity(e.target),'Saving admin identity...')});
    $('#carouselSlideForm')?.addEventListener('submit',e=>{e.preventDefault();withLoading(e.target,()=>saveCarouselSlide(e.target),'Saving carousel...')});
    $('#requestPayoutBtn')?.addEventListener('click',e=>{e.preventDefault();requestPayout();});
    $('#searchInput')?.addEventListener('input',filterMarket); $('#categoryFilter')?.addEventListener('change',filterMarket); $('#sortFilter')?.addEventListener('change',filterMarket);
  }
  function bindSellTypeChooser(){
    const form=$('#sellForm'); if(!form) return;
    const cards=$$('.sell-type-card'); const select=$('#sellCategorySelect');
    const setType=(type)=>{
      cards.forEach(card=>card.classList.toggle('active', card.dataset.sellCard===type));
      const radio=form.querySelector(`input[name="sell_type"][value="${type}"]`); if(radio) radio.checked=true;
      if(select) select.innerHTML=categoryOptionsFor(type);
    };
    cards.forEach(card=>card.addEventListener('click',()=>setType(card.dataset.sellCard||'machine')));
    form.querySelectorAll('input[name="sell_type"]').forEach(r=>r.addEventListener('change',()=>setType(r.value)));
  }
  function filterMarket(){ const q=($('#searchInput')?.value||'').toLowerCase(); const cat=$('#categoryFilter')?.value||''; sessionStorage.hp_market_category=cat; const sort=$('#sortFilter')?.value||'new'; let arr=state.products.filter(p=>(!q||[p.title,p.category,p.brand,p.model].join(' ').toLowerCase().includes(q))&&(!cat||p.category===cat)); if(sort==='low')arr.sort((a,b)=>a.price-b.price); if(sort==='high')arr.sort((a,b)=>b.price-a.price); $('#marketGrid').innerHTML=localizeHtml(arr.map(productCard).join('')||empty('No matching products')); }
  function animateCounters(){ $$('[data-count]').forEach(el=>{ const target=Number(el.dataset.count||0); let n=0; const step=Math.max(1,Math.ceil(target/40)); const timer=setInterval(()=>{n+=step; if(n>=target){n=target;clearInterval(timer)} el.textContent=n.toLocaleString('en-IN');},18); }); }
  window.HP={route,addToCart,buyNow,toggleWishlist,changeQty,removeCart,approveProduct,rejectProduct,banProduct,restoreProduct,approveSeller,rejectSeller,banSeller,restoreSeller,setOrderStatus,setReportStatus,setContactStatus,loginGoogle,sendPhoneOtp,verifyPhoneOtp,forgotPassword,getOtpPhone,purchaseMembership,savePayoutAccount,requestPayout,setPayoutStatus,saveAdminIdentity,saveCarouselSlide,toggleCarouselSlide,deleteCarouselSlide};
  document.addEventListener('DOMContentLoaded',init);
})();
