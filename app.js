(() => {
  const cfg = window.HP_CONFIG || {};
  const hasConfig = cfg.SUPABASE_URL && !cfg.SUPABASE_URL.includes('YOUR_') && cfg.SUPABASE_ANON_KEY && !cfg.SUPABASE_ANON_KEY.includes('YOUR_');
  const sb = hasConfig && window.supabase ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY) : null;
  const ADMIN_EMAIL = (cfg.ADMIN_EMAIL || 'kiratveersinghralhan@gmail.com').toLowerCase();
  const PHONE_OTP_ENABLED = cfg.ENABLE_PHONE_OTP === true || String(cfg.ENABLE_PHONE_OTP || '').toLowerCase() === 'true';
  const state = { user:null, profile:null, seller:null, products:[], cart:[], wishlist:[], siteSlides:[], messages:[], unreadMessages:0, factIndex:0, route:'home', currentProduct:null, lang:localStorage.hp_lang || 'en', stats:{products:0,categories:0,sellers:0,orders:0}, admin:{orders:[],sellers:[],products:[],reports:[],contacts:[],plans:[],boosts:[],users:[],badges:[],events:[],memberships:[],docUrls:{},balances:[],payoutAccounts:[],payoutRequests:[],ledger:[],siteSlides:[],notifications:[]}, finance:{balance:null,payoutAccount:null,payoutRequests:[],ledger:[]}, realtimeReady:false };
  const VALID_ROUTES = new Set(['home','market','product','cart','checkout','login','account','sell','messages','orders','admin','membership','rewards','categories','about','contact','how','support','legal','terms','privacy','refund','shipping','razorpay','seller-policy','buyer-policy','payout-policy','fees-policy','prohibited-policy','dispute-policy','grievance']);
  function normalizeRouteName(name){ const r=String(name||'home').trim().toLowerCase(); return ({plans:'membership',plan:'membership',badges:'rewards',rewards:'rewards',order:'orders',message:'messages',parts:'market',browse:'market',termsconditions:'terms','terms-and-conditions':'terms','privacy-policy':'privacy','refund-policy':'refund','refund-cancellation':'refund','cancellation-policy':'refund','shipping-policy':'shipping','delivery-policy':'shipping','payment-policy':'razorpay','razorpay-payment-policy':'razorpay','seller-payout-policy':'payout-policy','payout':'payout-policy','fees':'fees-policy','commission':'fees-policy','prohibited':'prohibited-policy','disputes':'dispute-policy','grievance-redressal':'grievance'}[r] || r); }
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

  const FREE_LISTING_LIMIT = 10;
  const DEFAULT_SELLER_COMMISSION_RATE = 0.035;
  const BUYER_PLATFORM_FEE_RATE = 0.035;
  const SUPPORT_EMAIL = cfg.SUPPORT_EMAIL || 'ralhanstore985@gmail.com';
  const ADMIN_ALERT_EMAIL = cfg.ADMIN_ALERT_EMAIL || ADMIN_EMAIL;
  const ASSISTED_LISTING_FEE = 29;
  const ROAD_TRANSPORT_RATE_PER_KM = 60;
  const LAUNCH_CLEAN_VERSION = 'v98';
  const COMMISSION_SLABS = [
    {upto:5000, rate:0.035, label:'3.5% under Rs. 5,000'},
    {upto:10000, rate:0.03, label:'3% from Rs. 5,000 to Rs. 9,999'},
    {upto:100000, rate:0.025, label:'2.5% from Rs. 10,000 to Rs. 99,999'},
    {upto:300000, rate:0.02, label:'2% from Rs. 1 lakh to Rs. 2.99 lakh'},
    {upto:1000000, rate:0.015, label:'1.5% from Rs. 3 lakh to Rs. 9.99 lakh'},
    {upto:Infinity, rate:0.01, label:'1% from Rs. 10 lakh and above'}
  ];
  const COUPONS = {
    NEWUSER10:{code:'NEWUSER10', label:'10% off for new users', percent:10, max:500, min:500},
    LAUNCH5:{code:'LAUNCH5', label:'5% launch discount', percent:5, max:300, min:1000},
    FARMER50:{code:'FARMER50', label:'Rs. 50 farmer welcome saving', flat:50, min:500},
    SPARE7:{code:'SPARE7', label:'7% off spare-part orders', percent:7, max:250, min:700, type:'spare'}
  };
  const MEMBERSHIP_PLANS = [
    {key:'starter_19', name:'Starter Offer', price:19, days:15, title:'Starter Seller', banner:'New Seller Offer', badge:'Starter Offer', tag:'Launch offer', listings:25, boost:3, reward:180, feeLabel:'Slab', discount:'Launch price', benefits:['25 listing limit','Slab commission from 3.5% to 1%','3 boosted listing days','Starter badge and title']},
    {key:'growth_49', name:'Growth Seller', price:49, days:30, title:'Growth Seller', banner:'Growth Seller Banner', badge:'Growth Seller', tag:'Best start', listings:75, boost:12, reward:650, feeLabel:'Slab', discount:'High value plan', benefits:['75 listing limit','Slab commission from 3.5% to 1%','12 boost days','Priority listing review']},
    {key:'dealer_99', name:'Dealer Plus', price:99, days:45, title:'Dealer Plus', banner:'Dealer Plus Banner', badge:'Dealer Plus', tag:'Popular', listings:180, boost:35, reward:1500, feeLabel:'Slab', discount:'More reach', benefits:['180 listing limit','Slab commission from 3.5% to 1%','35 boost days','Dealer profile presence']},
    {key:'partner_199', name:'Market Partner', price:199, days:75, title:'Market Partner', banner:'Market Partner Banner', badge:'Market Partner', tag:'Partner', listings:500, boost:90, reward:3600, feeLabel:'Slab', discount:'Agency ready', benefits:['500 listing limit','Slab commission from 3.5% to 1%','90 boost days','Partner title and banner']},
    {key:'leader_499', name:'Market Leader', price:499, days:120, title:'Market Leader', banner:'Market Leader Banner', badge:'Market Leader', tag:'Maximum', listings:999999, boost:250, reward:9000, feeLabel:'Slab', discount:'Unlimited launch pack', benefits:['Unlimited fair-use listings','Slab commission from 3.5% to 1%','250 boost days','Maximum visibility pack']}
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
    return `<div class="page-card badge-collection"><div class="section-head compact"><h2>Badge collection</h2><span class="badge">${have.length} earned</span></div><p class="muted">Custom text badges only. No icon badges. More event badges can be added later.</p><div class="badge-grid-custom">${all.map(k=>customBadge(k,!have.includes(k))).join('')}</div><button class="primary" data-route="rewards">Manage badges and titles</button></div>`;
  }
  function rewardsPage(){
    const have=earnedBadges();
    const all=Object.keys(CUSTOM_BADGE_DEFS);
    const equipped=state.profile?.badge_key || have[0] || 'buyer_member';
    return `<section class="page-card rewards-hero"><span class="eyebrow">Badges & titles</span><h1>Your marketplace identity, rewards and equipped badge.</h1><p class="muted">Users can see earned badges, locked achievements and the badge/title currently equipped on their profile. More seasonal event rewards can be added later from admin.</p><div class="title-row"><em>Equipped badge: ${esc(CUSTOM_BADGE_DEFS[equipped]?.name||'Member')}</em><em>Title: ${esc(state.profile?.membership_title||state.profile?.badge_title||'Marketplace Member')}</em><em>Earned: ${have.length}</em></div></section><section class="badge-page-grid">${all.map(k=>`<article class="page-card reward-equip-card ${have.includes(k)?'earned':'locked'}">${customBadge(k,!have.includes(k))}<div><b>${have.includes(k)?'Unlocked':'Locked'}</b><p class="muted">${esc(CUSTOM_BADGE_DEFS[k].line)}</p>${have.includes(k)?`<button class="secondary" onclick="HP.equipBadge('${esc(k)}')">${k===equipped?'Equipped':'Equip badge'}</button>`:'<button class="ghost" data-route="sell">How to unlock</button>'}</div></article>`).join('')}</section>`;
  }
  function eventPreviewCard(){
    return `<div class="page-card event-preview-card"><div class="section-head compact"><h2>Future events</h2><span class="badge owner">Ready</span></div><p class="muted">Use this system later for challenges like highest listings, most approved sellers, most orders or festival rewards.</p><div class="event-strip"><div><b>Listing Sprint</b><span>Highest approved listings wins a custom event badge.</span></div><div><b>Dealer Week</b><span>Top seller gets a limited banner and title.</span></div><div><b>Buyer Trust Drive</b><span>Reward trusted buying activity and completed profiles.</span></div></div></div>`;
  }
  async function equipBadge(key){
    if(!state.user) return route('login');
    if(!earnedBadges().includes(key)) return toast('This badge is locked.');
    const badge=CUSTOM_BADGE_DEFS[key]||CUSTOM_BADGE_DEFS.buyer_member;
    const patch={badge_key:key,badge_title:badge.name,rank_title:badge.title,updated_at:new Date().toISOString()};
    if(sb){ const {error}=await sb.from('users').update(patch).eq('auth_id',state.user.id); if(error) return toast(error.message); }
    state.profile={...(state.profile||{}),...patch};
    toast('Badge equipped');
    render();
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
      'Home':'होम','Enter Marketplace':'मार्केट देखें','Sell a Part':'पार्ट बेचें','Cart':'कार्ट','Checkout':'चेकआउट','Messages':'संदेश','My Orders':'मेरे ऑर्डर','My Account':'मेरा अकाउंट','Admin Panel':'एडमिन पैनल','Login / Signup':'लॉगिन / साइनअप','Logout':'लॉगआउट','Language':'भाषा','Market':'मार्केट','Chat':'चैट','Account':'अकाउंट','Login':'लॉगिन','Admin':'एडमिन','Parts':'पार्ट्स','Sell':'बेचें','Orders':'ऑर्डर',
      'Buy verified harvester parts with secure orders and admin-approved sellers.':'सुरक्षित ऑर्डर और एडमिन-अप्रूव्ड sellers के साथ verified harvester parts खरीदें।','Verified sellers':'Verified sellers','Secure checkout':'सुरक्षित checkout','Buyer assurance':'Buyer assurance','Browse parts':'Parts देखें','Sell parts':'Parts बेचें','Trending parts':'Trending parts','Shop by crop and machine need':'खेती की जरूरत के हिसाब से खरीदें','Products':'Products','Sellers':'Sellers','States covered':'States covered',
      'Search parts, bearings, cutter, shaft...':'Parts, bearings, cutter, shaft खोजें...','All categories':'सभी categories','Newest':'नया','Price: low to high':'कीमत: कम से ज्यादा','Price: high to low':'कीमत: ज्यादा से कम','Details':'Details','Add to Cart':'कार्ट में जोड़ें','Buy Now':'अभी खरीदें','Wishlist':'Wishlist','Message Seller':'Seller को message करें','Contact seller for exact final price.':'Exact final price के लिए seller से contact करें।',
      'Your cart.':'आपका cart.','Cart is empty.':'Cart खाली है.','Subtotal':'Subtotal','Estimated shipping':'Estimated shipping','Handling':'Handling','Buyer platform fee':'Buyer platform fee','Total estimate':'Total estimate','Place Secure Order':'सुरक्षित order करें','Full name':'पूरा नाम','Phone':'फोन','City / village':'City / village','Pincode':'Pincode','Full delivery address':'पूरा delivery address','Standard Cargo':'Standard Cargo','Premium Blue Dart estimate':'Premium Blue Dart estimate','Razorpay Online':'Razorpay Online','Pay after seller confirmation':'Seller confirmation के बाद pay करें','Apply':'Apply',
      'Login / Create Account':'Login / Create Account','Email':'Email','Password':'Password','Continue':'Continue','New users are created automatically.':'New users are created automatically.','List a Product':'Product list करें','Product name':'Product name','Listing price':'Listing price','Category e.g. Bearing, Cutter Part':'Category e.g. Bearing, Cutter Part','Publish Listing':'Approval के लिए listing submit करें','Orders':'ऑर्डर','No orders yet.':'अभी कोई order नहीं.'
    },
    pa: {
      'Home':'ਹੋਮ','Enter Marketplace':'ਮਾਰਕੀਟ ਵੇਖੋ','Sell a Part':'ਪਾਰਟ ਵੇਚੋ','Cart':'ਕਾਰਟ','Checkout':'ਚੈੱਕਆਉਟ','Messages':'ਸੁਨੇਹੇ','My Orders':'ਮੇਰੇ ਆਰਡਰ','My Account':'ਮੇਰਾ ਖਾਤਾ','Admin Panel':'ਐਡਮਿਨ ਪੈਨਲ','Login / Signup':'ਲਾਗਇਨ / ਸਾਈਨਅੱਪ','Logout':'ਲਾਗਆਉਟ','Language':'ਭਾਸ਼ਾ','Market':'ਮਾਰਕੀਟ','Chat':'ਚੈਟ','Account':'ਖਾਤਾ','Login':'ਲਾਗਇਨ','Admin':'ਐਡਮਿਨ','Parts':'ਪਾਰਟਸ','Sell':'ਵੇਚੋ','Orders':'ਆਰਡਰ',
      'Buy verified harvester parts with secure orders and admin-approved sellers.':'ਸੁਰੱਖਿਅਤ ਆਰਡਰ ਅਤੇ ਐਡਮਿਨ-ਅਪ੍ਰੂਵਡ sellers ਨਾਲ verified harvester parts ਖਰੀਦੋ।','Verified sellers':'Verified sellers','Secure checkout':'ਸੁਰੱਖਿਅਤ checkout','Buyer assurance':'Buyer assurance','Browse parts':'Parts ਵੇਖੋ','Sell parts':'Parts ਵੇਚੋ','Trending parts':'Trending parts','Shop by crop and machine need':'ਖੇਤੀ ਦੀ ਲੋੜ ਮੁਤਾਬਕ ਖਰੀਦੋ','Products':'Products','Sellers':'Sellers','States covered':'States covered',
      'Search parts, bearings, cutter, shaft...':'Parts, bearings, cutter, shaft ਲੱਭੋ...','All categories':'ਸਾਰੀਆਂ categories','Newest':'ਨਵਾਂ','Price: low to high':'ਕੀਮਤ: ਘੱਟ ਤੋਂ ਵੱਧ','Price: high to low':'ਕੀਮਤ: ਵੱਧ ਤੋਂ ਘੱਟ','Details':'Details','Add to Cart':'ਕਾਰਟ ਵਿੱਚ ਪਾਓ','Buy Now':'ਹੁਣੇ ਖਰੀਦੋ','Wishlist':'Wishlist','Message Seller':'Seller ਨੂੰ message ਕਰੋ','Contact seller for exact final price.':'Exact final price ਲਈ seller ਨਾਲ contact ਕਰੋ।',
      'Your cart.':'ਤੁਹਾਡਾ cart.','Cart is empty.':'Cart ਖਾਲੀ ਹੈ.','Subtotal':'Subtotal','Estimated shipping':'Estimated shipping','Handling':'Handling','Buyer platform fee':'Buyer platform fee','Total estimate':'Total estimate','Place Secure Order':'ਸੁਰੱਖਿਅਤ order ਕਰੋ','Full name':'ਪੂਰਾ ਨਾਮ','Phone':'ਫੋਨ','City / village':'ਸ਼ਹਿਰ / ਪਿੰਡ','Pincode':'ਪਿੰਨਕੋਡ','Full delivery address':'ਪੂਰਾ delivery address','Standard Cargo':'Standard Cargo','Premium Blue Dart estimate':'Premium Blue Dart estimate','Razorpay Online':'Razorpay Online','Pay after seller confirmation':'Seller confirmation ਤੋਂ ਬਾਅਦ pay ਕਰੋ','Apply':'Apply',
      'Login / Create Account':'ਲਾਗਇਨ / ਖਾਤਾ ਬਣਾਓ','Email':'ਈਮੇਲ','Password':'ਪਾਸਵਰਡ','Continue':'ਜਾਰੀ ਰੱਖੋ','New users are created automatically.':'ਨਵੇਂ users automatically ਬਣ ਜਾਂਦੇ ਹਨ.','List a Product':'Product list ਕਰੋ','Product name':'Product name','Listing price':'Listing price','Category e.g. Bearing, Cutter Part':'Category e.g. Bearing, Cutter Part','Publish Listing':'Approval ਲਈ listing submit ਕਰੋ','No orders yet.':'ਅਜੇ ਕੋਈ order ਨਹੀਂ.'
    }
  };
  function t(k){return (i18n.en&&i18n.en[k])||k}
  function tx(text){ return (window.HP_TRANSLATE ? window.HP_TRANSLATE(text) : text); }
  const COMMON_TRANSLATIONS = {
    hi:{
      'Guest':'अतिथि','Buyer':'खरीदार','Buyer / Seller':'खरीदार / विक्रेता','Platform Owner / Admin':'प्लेटफॉर्म मालिक / एडमिन','Home':'होम','Market':'मार्केट','Chat':'चैट','Account':'अकाउंट','Cart':'कार्ट','Login':'लॉगिन','Logout':'लॉगआउट','Login / Signup':'लॉगिन / साइनअप','My Account':'मेरा अकाउंट','My Orders':'मेरे ऑर्डर','Messages':'संदेश','Checkout':'चेकआउट','Enter Marketplace':'मार्केट देखें','Sell a Part':'पार्ट बेचें','List Product':'प्रोडक्ट जोड़ें','Sell a Product':'प्रोडक्ट बेचें','Admin Panel':'एडमिन पैनल','Admin':'एडमिन','Language':'भाषा',
      'Royal agricultural marketplace':'प्रमाणित कृषि मार्केटप्लेस','Buy & sell farm parts with confidence.':'भरोसे के साथ फार्म पार्ट्स खरीदें और बेचें।','Harvester Parts connects buyers, sellers and dealers with verified listings, secure checkout, in-app messages and admin approved sellers.':'Harvester Parts खरीदारों, विक्रेताओं और डीलरों को सत्यापित लिस्टिंग, सुरक्षित चेकआउट, इन-ऐप संदेश और एडमिन अप्रूव्ड sellers से जोड़ता है।','Browse Parts':'पार्ट्स देखें','Live products':'लाइव प्रोडक्ट','Categories':'कैटेगरी','Verified sellers':'सत्यापित विक्रेता','Support hours':'सपोर्ट घंटे','% verified flow':'% सत्यापित प्रक्रिया','Shop by crop and machine need':'खेती की जरूरत के हिसाब से खरीदें','Premium categories for quick discovery.':'जल्दी खोज के लिए प्रीमियम कैटेगरी।','Fresh in the agri mandi':'नई लिस्टिंग','View all':'सभी देखें',
      'Search parts, brand, model':'पार्ट, ब्रांड, मॉडल खोजें','All categories':'सभी कैटेगरी','Newest':'नया','Price low':'कम कीमत','Price high':'ज्यादा कीमत','No live catalog. Ask sellers to list products.':'अभी लाइव कैटलॉग नहीं है। sellers से product list करने को कहें।','No matching products':'कोई मिलता-जुलता product नहीं','Product not found':'Product नहीं मिला','Verified Stock':'सत्यापित स्टॉक','Confirmed before order':'सटीक कीमत पूछें','Details':'विवरण','Add Cart':'कार्ट में जोड़ें','Add to Cart':'कार्ट में जोड़ें','Buy Now':'अभी खरीदें','Wishlist':'विशलिस्ट','Message Seller':'Seller को message करें','Contact seller for exact final price.':'अंतिम सही कीमत के लिए seller से संपर्क करें।',
      'Your Cart':'आपका कार्ट','Order summary':'ऑर्डर सारांश','Cart is empty. Add products to continue.':'कार्ट खाली है। आगे बढ़ने के लिए products जोड़ें।','Proceed to Checkout':'चेकआउट करें','Subtotal':'सबटोटल','Shipping':'शिपिंग','Platform protection fee':'प्लेटफॉर्म सुरक्षा शुल्क','Total':'कुल','Secure Checkout':'सुरक्षित चेकआउट','Full name':'पूरा नाम','Phone number':'फोन नंबर','Complete delivery address':'पूरा डिलीवरी पता','Pincode':'पिनकोड','Standard delivery':'स्टैंडर्ड डिलीवरी','Premium / heavy courier':'प्रीमियम / भारी कूरियर','Coupon code optional':'कूपन कोड वैकल्पिक','Place Secure Order':'सुरक्षित ऑर्डर करें','Payment Summary':'पेमेंट सारांश','Payment: Razorpay / manual confirmation depending on your active key setup.':'पेमेंट: आपकी key setup के हिसाब से Razorpay / manual confirmation।',
      'Login / Create Account':'लॉगिन / खाता बनाएं','Email':'ईमेल','Password':'पासवर्ड','Continue':'जारी रखें','Create new account':'नया खाता बनाएं','Continue with Google':'Google से जारी रखें','Mobile OTP Login':'मोबाइल OTP लॉगिन','Phone with country code, e.g. +919000000000':'देश कोड वाला फोन, जैसे +919000000000','Send OTP':'OTP भेजें','Verify OTP':'OTP verify करें','OTP code':'OTP कोड','Forgot password?':'पासवर्ड भूल गए?','Reset password':'पासवर्ड रीसेट करें','Email verification may be required after signup.':'Signup के बाद email verification जरूरी हो सकता है।','Profile':'प्रोफाइल','Save Profile':'प्रोफाइल सेव करें','Gender':'लिंग','Male':'पुरुष','Female':'महिला','Other':'अन्य',
      'List a Product':'Product जोड़ें','Product name':'Product नाम','Listing price':'Listing कीमत','Category e.g. Bearing, Cutter Part':'Category जैसे Bearing, Cutter Part','Brand / machine':'Brand / machine','Model / compatibility':'Model / compatibility','Weight kg':'वजन kg','State':'राज्य','District':'जिला','City / village':'शहर / गांव','Describe condition, exact location, compatibility':'Condition, exact location, compatibility लिखें','Publish Listing':'Approval के लिए listing भेजें','Enter price to see seller payout.':'Seller payout देखने के लिए कीमत डालें।','Orders':'ऑर्डर','No orders yet.':'अभी कोई ऑर्डर नहीं।','Admin access only':'सिर्फ admin access','Platform Owner':'Platform Owner','Product approvals':'Product approvals','No pending products':'कोई pending product नहीं','Approve':'Approve','Reject':'Reject'
    },
    pa:{
      'Guest':'ਮਹਿਮਾਨ','Buyer':'ਖਰੀਦਦਾਰ','Buyer / Seller':'ਖਰੀਦਦਾਰ / ਵਿਕਰੇਤਾ','Platform Owner / Admin':'ਪਲੇਟਫਾਰਮ ਮਾਲਕ / ਐਡਮਿਨ','Home':'ਹੋਮ','Market':'ਮਾਰਕੀਟ','Chat':'ਚੈਟ','Account':'ਖਾਤਾ','Cart':'ਕਾਰਟ','Login':'ਲਾਗਿਨ','Logout':'ਲਾਗਆਉਟ','Login / Signup':'ਲਾਗਿਨ / ਸਾਈਨਅੱਪ','My Account':'ਮੇਰਾ ਖਾਤਾ','My Orders':'ਮੇਰੇ ਆਰਡਰ','Messages':'ਸੁਨੇਹੇ','Checkout':'ਚੈੱਕਆਉਟ','Enter Marketplace':'ਮਾਰਕੀਟ ਵੇਖੋ','Sell a Part':'ਪਾਰਟ ਵੇਚੋ','List Product':'ਪ੍ਰੋਡਕਟ ਜੋੜੋ','Sell a Product':'ਪ੍ਰੋਡਕਟ ਵੇਚੋ','Admin Panel':'ਐਡਮਿਨ ਪੈਨਲ','Admin':'ਐਡਮਿਨ','Language':'ਭਾਸ਼ਾ',
      'Royal agricultural marketplace':'ਤਸਦੀਕਸ਼ੁਦਾ ਖੇਤੀ ਮਾਰਕੀਟਪਲੇਸ','Buy & sell farm parts with confidence.':'ਭਰੋਸੇ ਨਾਲ ਖੇਤੀ ਵਾਲੇ ਪਾਰਟ ਖਰੀਦੋ ਤੇ ਵੇਚੋ।','Harvester Parts connects buyers, sellers and dealers with verified listings, secure checkout, in-app messages and admin approved sellers.':'Harvester Parts ਖਰੀਦਦਾਰਾਂ, ਵਿਕਰੇਤਾਵਾਂ ਅਤੇ ਡੀਲਰਾਂ ਨੂੰ verified listings, secure checkout, in-app messages ਅਤੇ admin approved sellers ਨਾਲ ਜੋੜਦਾ ਹੈ।','Browse Parts':'ਪਾਰਟਸ ਵੇਖੋ','Live products':'ਲਾਈਵ ਪ੍ਰੋਡਕਟ','Categories':'ਕੈਟੇਗਰੀਆਂ','Verified sellers':'ਤਸਦੀਕਸ਼ੁਦਾ ਵਿਕਰੇਤਾ','Support hours':'ਸਪੋਰਟ ਘੰਟੇ','% verified flow':'% verified flow','Shop by crop and machine need':'ਖੇਤੀ ਦੀ ਲੋੜ ਮੁਤਾਬਕ ਖਰੀਦੋ','Premium categories for quick discovery.':'ਤੇਜ਼ ਖੋਜ ਲਈ ਪ੍ਰੀਮੀਅਮ ਕੈਟੇਗਰੀਆਂ।','Fresh in the agri mandi':'ਨਵੀਂ ਲਿਸਟਿੰਗ','View all':'ਸਾਰੇ ਵੇਖੋ',
      'Search parts, brand, model':'ਪਾਰਟ, ਬ੍ਰਾਂਡ, ਮਾਡਲ ਲੱਭੋ','All categories':'ਸਾਰੀਆਂ ਕੈਟੇਗਰੀਆਂ','Newest':'ਨਵਾਂ','Price low':'ਘੱਟ ਕੀਮਤ','Price high':'ਵੱਧ ਕੀਮਤ','No live catalog. Ask sellers to list products.':'ਹਾਲੇ live catalog ਨਹੀਂ ਹੈ। sellers ਨੂੰ products list ਕਰਨ ਲਈ ਕਹੋ।','No matching products':'ਕੋਈ matching product ਨਹੀਂ','Product not found':'Product ਨਹੀਂ ਮਿਲਿਆ','Verified Stock':'ਤਸਦੀਕਸ਼ੁਦਾ ਸਟਾਕ','Confirmed before order':'ਸਹੀ ਕੀਮਤ ਪੁੱਛੋ','Details':'ਵੇਰਵਾ','Add Cart':'ਕਾਰਟ ਵਿੱਚ ਪਾਓ','Add to Cart':'ਕਾਰਟ ਵਿੱਚ ਪਾਓ','Buy Now':'ਹੁਣੇ ਖਰੀਦੋ','Wishlist':'ਵਿਸ਼ਲਿਸਟ','Message Seller':'Seller ਨੂੰ ਸੁਨੇਹਾ ਭੇਜੋ','Contact seller for exact final price.':'ਅੰਤਿਮ ਸਹੀ ਕੀਮਤ ਲਈ seller ਨਾਲ ਸੰਪਰਕ ਕਰੋ।',
      'Your Cart':'ਤੁਹਾਡਾ ਕਾਰਟ','Order summary':'ਆਰਡਰ ਸੰਖੇਪ','Cart is empty. Add products to continue.':'ਕਾਰਟ ਖਾਲੀ ਹੈ। ਅੱਗੇ ਵੱਧਣ ਲਈ products ਜੋੜੋ।','Proceed to Checkout':'ਚੈੱਕਆਉਟ ਕਰੋ','Subtotal':'ਸਬਟੋਟਲ','Shipping':'ਸ਼ਿਪਿੰਗ','Platform protection fee':'ਪਲੇਟਫਾਰਮ ਸੁਰੱਖਿਆ ਫੀਸ','Total':'ਕੁੱਲ','Secure Checkout':'ਸੁਰੱਖਿਅਤ ਚੈੱਕਆਉਟ','Full name':'ਪੂਰਾ ਨਾਮ','Phone number':'ਫੋਨ ਨੰਬਰ','Complete delivery address':'ਪੂਰਾ ਡਿਲਿਵਰੀ ਪਤਾ','Pincode':'ਪਿਨਕੋਡ','Standard delivery':'ਸਟੈਂਡਰਡ ਡਿਲਿਵਰੀ','Premium / heavy courier':'ਪ੍ਰੀਮੀਅਮ / heavy courier','Coupon code optional':'ਕੂਪਨ ਕੋਡ optional','Place Secure Order':'ਸੁਰੱਖਿਅਤ ਆਰਡਰ ਕਰੋ','Payment Summary':'ਪੇਮੈਂਟ ਸੰਖੇਪ','Payment: Razorpay / manual confirmation depending on your active key setup.':'ਪੇਮੈਂਟ: ਤੁਹਾਡੀ key setup ਦੇ ਹਿਸਾਬ ਨਾਲ Razorpay / manual confirmation।',
      'Login / Create Account':'ਲਾਗਿਨ / ਖਾਤਾ ਬਣਾਓ','Email':'ਈਮੇਲ','Password':'ਪਾਸਵਰਡ','Continue':'ਜਾਰੀ ਰੱਖੋ','Create new account':'ਨਵਾਂ ਖਾਤਾ ਬਣਾਓ','Continue with Google':'Google ਨਾਲ ਜਾਰੀ ਰੱਖੋ','Mobile OTP Login':'ਮੋਬਾਈਲ OTP ਲਾਗਿਨ','Phone with country code, e.g. +919000000000':'ਦੇਸ਼ ਕੋਡ ਨਾਲ ਫੋਨ, ਜਿਵੇਂ +919000000000','Send OTP':'OTP ਭੇਜੋ','Verify OTP':'OTP verify ਕਰੋ','OTP code':'OTP ਕੋਡ','Forgot password?':'ਪਾਸਵਰਡ ਭੁੱਲ ਗਏ?','Reset password':'ਪਾਸਵਰਡ ਰੀਸੈੱਟ ਕਰੋ','Email verification may be required after signup.':'Signup ਤੋਂ ਬਾਅਦ email verification ਲੋੜੀਂਦੀ ਹੋ ਸਕਦੀ ਹੈ।','Profile':'ਪ੍ਰੋਫਾਈਲ','Save Profile':'ਪ੍ਰੋਫਾਈਲ ਸੇਵ ਕਰੋ','Gender':'ਲਿੰਗ','Male':'ਮਰਦ','Female':'ਔਰਤ','Other':'ਹੋਰ',
      'List a Product':'Product ਜੋੜੋ','Product name':'Product ਨਾਮ','Listing price':'Listing ਕੀਮਤ','Category e.g. Bearing, Cutter Part':'Category ਜਿਵੇਂ Bearing, Cutter Part','Brand / machine':'Brand / machine','Model / compatibility':'Model / compatibility','Weight kg':'ਵਜ਼ਨ kg','State':'ਰਾਜ','District':'ਜ਼ਿਲ੍ਹਾ','City / village':'ਸ਼ਹਿਰ / ਪਿੰਡ','Describe condition, exact location, compatibility':'Condition, exact location, compatibility ਲਿਖੋ','Publish Listing':'Approval ਲਈ listing ਭੇਜੋ','Enter price to see seller payout.':'Seller payout ਵੇਖਣ ਲਈ ਕੀਮਤ ਪਾਓ।','Orders':'ਆਰਡਰ','No orders yet.':'ਹਾਲੇ ਕੋਈ ਆਰਡਰ ਨਹੀਂ।','Admin access only':'ਸਿਰਫ admin access','Platform Owner':'Platform Owner','Product approvals':'Product approvals','No pending products':'ਕੋਈ pending product ਨਹੀਂ','Approve':'Approve','Reject':'Reject'
    }
  };
  ['ta','te','bn','mr','gu'].forEach(l=>{ COMMON_TRANSLATIONS[l] = Object.assign({}, COMMON_TRANSLATIONS.hi, uiText[l]||{}); });
  Object.assign(COMMON_TRANSLATIONS.hi, {
    'Preparing a verified agri marketplace':'एक प्रमाणित कृषि मार्केटप्लेस तैयार हो रहा है',
    'For faster access, install it like an app.':'तेज उपयोग के लिए इसे ऐप की तरह इंस्टॉल करें।',
    'Tap browser Share button.':'ब्राउज़र का शेयर बटन दबाएं।',
    'Choose “Add to Home Screen”.':'“Add to Home Screen” चुनें।',
    'Open Harvester Parts from your phone.':'फोन से Harvester Parts खोलें।',
    'Continue':'जारी रखें','or':'या','Login service is not ready yet':'लॉगिन सेवा अभी तैयार नहीं है','Account created. Please verify your email if Supabase asks.':'अकाउंट बन गया। अगर Supabase पूछे तो ईमेल verify करें।','Logged in':'लॉगिन हो गया','Enter phone with country code, e.g. +919000000000':'देश कोड के साथ फोन डालें','OTP sent':'OTP भेज दिया गया','Phone login successful':'फोन लॉगिन सफल','Enter your email first':'पहले ईमेल डालें','Password reset link sent to email':'पासवर्ड रीसेट लिंक ईमेल पर भेज दिया गया','Added to cart':'कार्ट में जोड़ दिया','Removed from wishlist':'वishlist से हटाया','Saved to wishlist':'वishlist में सेव किया','Cart is empty':'कार्ट खाली है','Order saved. Connect Razorpay key for online payment.':'ऑर्डर सेव हो गया। ऑनलाइन पेमेंट के लिए Razorpay key जोड़ें।','Payment successful. Order placed.':'पेमेंट सफल। ऑर्डर हो गया।','Listing submitted for admin approval':'लिस्टिंग admin approval के लिए भेजी गई','Message sent inside platform':'संदेश प्लेटफॉर्म में भेजा गया','Product approved':'प्रोडक्ट approve हुआ','Product rejected':'प्रोडक्ट reject हुआ','Profile saved':'प्रोफाइल सेव हुई',
    'Buyer assurance':'खरीदार सुरक्षा','Platform fee':'प्लेटफॉर्म फीस','Calculated at checkout':'चेकआउट पर गणना होगी','Seller receives approx.':'','Product details':'प्रोडक्ट विवरण','Genuine agricultural spare part listing. Please confirm compatibility, dimensions and condition through in-app message before final purchase.':'असली कृषि spare part listing। अंतिम खरीद से पहले in-app message से compatibility, size और condition confirm करें।','Condition':'स्थिति','Weight':'वजन','Location':'स्थान','Views':'व्यूज','Verified Farm Listing':'सत्यापित लिस्टिंग','Spare part':'स्पेयर पार्ट','Harvester Parts':'Harvester Parts','Agricultural Part':'कृषि पार्ट','Stock':'स्टॉक','India':'भारत','Standard / Premium':'स्टैंडर्ड / प्रीमियम',
    'Seller/User ID or email':'Seller/User ID या ईमेल','Write message':'संदेश लिखें','Send Message':'संदेश भेजें','In-app chat protects your platform earnings. Phone numbers and emails are blocked automatically.':'In-app chat आपकी platform earnings बचाता है। फोन नंबर और ईमेल अपने आप block होते हैं।','Orders placed through checkout will show here. Admin can manage shipment and payment status from dashboard.':'Checkout से दिए गए orders यहां दिखेंगे। Admin shipment और payment status dashboard से manage कर सकता है।','Order':'ऑर्डर','pending':'pending','paid':'paid','Products':'प्रोडक्ट्स','Pending listings':'Pending listings','Boosted':'Boosted','ADMIN CONTROL':'ADMIN CONTROL','Go Home':'होम जाएं',
    'Listing price:':'लिस्टिंग कीमत:','Platform marketing fee:':'प्लेटफॉर्म मार्केटिंग फीस:','Seller earns approx:':'Seller को लगभग मिलेगा:'
  });
  Object.assign(COMMON_TRANSLATIONS.pa, {
    'Preparing a verified agri marketplace':'ਤਸਦੀਕਸ਼ੁਦਾ ਖੇਤੀ ਮਾਰਕੀਟਪਲੇਸ ਤਿਆਰ ਹੋ ਰਿਹਾ ਹੈ',
    'For faster access, install it like an app.':'ਤੇਜ਼ ਵਰਤੋਂ ਲਈ ਇਸਨੂੰ ਐਪ ਵਾਂਗ ਇੰਸਟਾਲ ਕਰੋ।',
    'Tap browser Share button.':'ਬਰਾਊਜ਼ਰ ਦਾ Share ਬਟਨ ਦਬਾਓ।','Choose “Add to Home Screen”.':'“Add to Home Screen” ਚੁਣੋ।','Open Harvester Parts from your phone.':'ਫੋਨ ਤੋਂ Harvester Parts ਖੋਲ੍ਹੋ।','Continue':'ਜਾਰੀ ਰੱਖੋ','or':'ਜਾਂ','Login service is not ready yet':'ਪਹਿਲਾਂ Supabase keys ਜੋੜੋ','Account created. Please verify your email if Supabase asks.':'ਅਕਾਊਂਟ ਬਣ ਗਿਆ। ਜੇ ਕਿਹਾ ਜਾਵੇ ਤਾਂ email verify ਕਰੋ।','Logged in':'ਲਾਗਿਨ ਹੋ ਗਿਆ','Enter phone with country code, e.g. +919000000000':'ਦੇਸ਼ ਕੋਡ ਨਾਲ ਫੋਨ ਪਾਓ','OTP sent':'OTP ਭੇਜਿਆ ਗਿਆ','Phone login successful':'ਫੋਨ ਲਾਗਿਨ ਸਫਲ','Enter your email first':'ਪਹਿਲਾਂ email ਪਾਓ','Password reset link sent to email':'Password reset link email ਤੇ ਭੇਜਿਆ ਗਿਆ','Added to cart':'ਕਾਰਟ ਵਿੱਚ ਜੋੜਿਆ','Removed from wishlist':'Wishlist ਤੋਂ ਹਟਾਇਆ','Saved to wishlist':'Wishlist ਵਿੱਚ save ਕੀਤਾ','Cart is empty':'ਕਾਰਟ ਖਾਲੀ ਹੈ','Order saved. Connect Razorpay key for online payment.':'Order save ਹੋ ਗਿਆ। Online payment ਲਈ Razorpay key ਜੋੜੋ।','Payment successful. Order placed.':'Payment successful। Order placed।','Listing submitted for admin approval':'Listing admin approval ਲਈ ਭੇਜੀ ਗਈ','Message sent inside platform':'ਸੁਨੇਹਾ platform ਵਿੱਚ ਭੇਜਿਆ ਗਿਆ','Product approved':'Product approve ਹੋਇਆ','Product rejected':'Product reject ਹੋਇਆ','Profile saved':'Profile save ਹੋਈ',
    'Buyer assurance':'ਖਰੀਦਦਾਰ ਸੁਰੱਖਿਆ','Platform fee':'ਪਲੇਟਫਾਰਮ ਫੀਸ','Calculated at checkout':'Checkout ਤੇ calculate ਹੋਵੇਗੀ','Seller receives approx.':'','Product details':'Product ਵੇਰਵਾ','Genuine agricultural spare part listing. Please confirm compatibility, dimensions and condition through in-app message before final purchase.':'ਅਸਲੀ agriculture spare part listing। Final purchase ਤੋਂ ਪਹਿਲਾਂ in-app message ਨਾਲ compatibility, size ਅਤੇ condition confirm ਕਰੋ।','Condition':'ਹਾਲਤ','Weight':'ਵਜ਼ਨ','Location':'ਸਥਾਨ','Views':'Views','Verified Farm Listing':'ਤਸਦੀਕਸ਼ੁਦਾ listing','Spare part':'Spare part','Agricultural Part':'ਖੇਤੀ ਪਾਰਟ','Stock':'ਸਟਾਕ','India':'ਭਾਰਤ','Standard / Premium':'Standard / Premium',
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
      home:'Home', market:'Buyer Marketplace', sell:'Seller Tools', membership:'Seller Plans', rewards:'Rewards', categories:'Farm Categories', how:'How it works',
      about:'About Us', contact:'Contact Us', support:'Support', legal:'Legal Centre', terms:'Terms', privacy:'Privacy', refund:'Refunds', shipping:'Shipping', razorpay:'Payments', 'payout-policy':'Payouts', grievance:'Grievance', messages:'Messages', account:'My Account', cart:'Cart', checkout:'Checkout', orders:'Order History', admin:'Admin Panel'
    };
    $$('.side-menu button[data-route], .bottom-nav button, .nav-tabs button').forEach(el=>{
      if(el.classList.contains('sell-fab') || el.textContent.trim()==='＋'){ el.dataset.rawText='＋'; el.textContent='＋'; return; }
      let key = routeLabels[el.dataset.route] || el.dataset.i18n || el.dataset.label || el.textContent.trim();
      if(el.closest('.bottom-nav') && el.dataset.route === 'membership') key = 'Plans';
      if(el.closest('.bottom-nav') && el.dataset.route === 'market') key = 'Buyer';
      if(el.closest('.bottom-nav') && el.dataset.route === 'account') key = 'Account';
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
  function commissionRateForAmount(amount){
    if(isAdminUser()) return 0;
    const value=Number(amount||0);
    return (COMMISSION_SLABS.find(s=>value < s.upto) || COMMISSION_SLABS[COMMISSION_SLABS.length-1]).rate;
  }
  function commissionLabel(amount){
    const value=Number(amount||0);
    const slab=COMMISSION_SLABS.find(s=>value < s.upto) || COMMISSION_SLABS[COMMISSION_SLABS.length-1];
    return slab.label;
  }
  function commissionRateForKey(key){ return DEFAULT_SELLER_COMMISSION_RATE; }
  function currentCommissionRate(){ return isAdminUser()?0:DEFAULT_SELLER_COMMISSION_RATE; }
  function listingLimitForKey(key){ return planByKey(key)?.listings || FREE_LISTING_LIMIT; }
  function currentListingLimit(){ return isAdminUser()?999999:(activePlan()?.listings || FREE_LISTING_LIMIT); }
  function limitLabel(n=currentListingLimit()){ return Number(n)>=999999 ? 'Unlimited' : String(n); }
  function userListingCount(uid=state.user?.id){ return state.products.filter(p=>String(p.user_id||'')===String(uid) && !['rejected','removed','banned','cancelled'].includes(String(p.status||'').toLowerCase())).length; }
  function productStatus(p){ return String(p?.status || 'approved').toLowerCase(); }
  function isVisibleProduct(p){ return ['approved','live','active'].includes(productStatus(p)); }
  function visibleProducts(){ return (state.products||[]).filter(isVisibleProduct); }
  function myProducts(uid=state.user?.id){ return (state.products||[]).filter(p=>String(p.user_id||'')===String(uid)); }
  function myLiveProducts(uid=state.user?.id){ return myProducts(uid).filter(isVisibleProduct); }

  function feeDiscountForPlan(plan=activePlan()){ if(isAdminUser()) return 'Admin account: all plans, titles, banners and listing controls unlocked'; if(!plan) return 'Free launch plan: 10 listings + slab commission from 3.5% down to 1%'; return `${plan.discount} + slab commission from 3.5% down to 1%`; }
  function sevenBusinessDaysFrom(date=new Date()){
    const d=new Date(date); let added=0;
    while(added<7){ d.setDate(d.getDate()+1); const day=d.getDay(); if(day!==0 && day!==6) added++; }
    return d;
  }
  function payoutDateText(date){ try{return new Date(date).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});}catch(e){return ''} }
  function isSellerApproved(){ return isAdminUser() || ['approved'].includes(String(state.seller?.status||state.seller?.verification_status||'').toLowerCase()); }
  function planCard(p){
    const active=(state.profile?.active_membership===p.key || state.profile?.membership_key===p.key);
    return `<article class="membership-card ${active?'active':''}"><div class="plan-ribbon">${esc(p.tag)}</div><div class="plan-head"><span>${esc(p.banner)}</span><h3>${esc(p.name)}</h3><div class="plan-price">₹${Number(p.price).toLocaleString('en-IN')}<small>/${p.days} days</small></div></div><div class="plan-title-preview"><b>${esc(p.title)}</b><small>${esc(p.badge)} custom badge • no icons</small></div><div class="plan-stats"><div><b>${limitLabel(p.listings)}</b><span>listing limit</span></div><div><b>${esc(p.feeLabel||'Slab')}</b><span>seller fee</span></div><div><b>${p.boost}</b><span>boost days</span></div><div><b>${p.reward}</b><span>points</span></div></div><div class="plan-fee-strip"><b>${esc(p.discount)}</b><span>Commission follows the value slab shown before listing and checkout.</span></div><ul>${p.benefits.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><button class="${active?'secondary':'primary'}" data-plan-key="${esc(p.key)}">${active?'Current Plan':'Choose Plan'}</button></article>`;
  }
  function freePlanCard(){
    return `<article class="membership-card free-plan-card"><div class="plan-ribbon">Free</div><div class="plan-head"><span>Launch free offer</span><h3>Free Member</h3><div class="plan-price">₹0<small>/always</small></div></div><div class="plan-title-preview"><b>Marketplace Starter</b><small>Default member title</small></div><div class="plan-stats"><div><b>10</b><span>free listings</span></div><div><b>Slab</b><span>seller fee</span></div><div><b>1</b><span>trial boost</span></div></div><div class="plan-fee-strip"><b>Start free</b><span>Seller commission uses launch slabs from 3.5% down to 1%.</span></div><button class="ghost" data-route="sell">Use Free Plan</button></article>`;
  }
  function membershipPage(){
    const plan=activePlan(); const used=userListingCount(); const limit=currentListingLimit();
    const d=formDraft('sellFormDraft');
    return `<section class="membership-hero page-card"><div><span class="eyebrow">Membership & rewards</span><h1>Low-cost seller plans for more listings, badges and visibility.</h1><p class="muted">Free users can post 10 listings during launch. Paid plans start at ₹19 and unlock more listings, boosts, custom titles, banners and reward points while commission follows the published value slab.</p><div class="hero-actions"><button class="primary" data-route="sell">Become a Seller</button><button class="ghost" data-route="rewards">View Badges</button></div></div><div class="membership-current ${plan?'active':''}"><span>${plan?'ACTIVE PLAN':'FREE PLAN'}</span><h2>${esc(plan?.name || 'Free Member')}</h2><p>${esc(feeDiscountForPlan(plan))}</p><div class="mini-limit"><b>${used}/${limitLabel(limit)}</b><span>listings used</span></div></div></section><section><div class="section-head"><h2>Choose your plan</h2><p class="muted">Start free, upgrade only when you need more listings and visibility. Launch commission starts at 3.5% on small orders and reduces down to 1% for high-value machinery.</p></div><div class="membership-grid">${freePlanCard()}${MEMBERSHIP_PLANS.map(planCard).join('')}</div></section><section class="page-card reward-system-card"><div class="section-head compact"><h2>Rewards and membership benefits</h2><span class="badge owner">Ready</span></div><div class="reward-columns"><div><b>Post more</b><span>Points for approved listings and seller verification.</span></div><div><b>Keep fees clear</b><span>Buyer protection fee and seller commission follow the same transparent value slabs.</span></div><div><b>Win events</b><span>Future events can reward top sellers with limited badges, titles and banners.</span></div></div></section>`;
  }
  function hasRazorpayKey(){ return !!(cfg.RAZORPAY_KEY_ID && !String(cfg.RAZORPAY_KEY_ID).includes('YOUR_')); }
  async function ensureRazorpayReady(){
    if(!hasRazorpayKey()){ toast('Razorpay key is missing. Add your live or test key in supabase-config.js.'); return false; }
    if(window.Razorpay) return true;
    await new Promise(resolve=>{
      const existing=document.querySelector('script[src*="checkout.razorpay.com"]');
      if(existing){ existing.addEventListener('load',resolve,{once:true}); existing.addEventListener('error',resolve,{once:true}); setTimeout(resolve,2500); return; }
      const s=document.createElement('script'); s.src='https://checkout.razorpay.com/v1/checkout.js'; s.async=true; s.onload=resolve; s.onerror=resolve; document.head.appendChild(s);
    });
    if(!window.Razorpay){ toast('Razorpay could not open. Check internet, ad blocker, and Razorpay key activation.'); return false; }
    return true;
  }
  async function openRazorpayPayment({amount,description,handler,prefill={}}){
    if(!(await ensureRazorpayReady())) return false;
    try{
      const rz=new Razorpay({key:cfg.RAZORPAY_KEY_ID,amount:Math.round(Number(amount||0)*100),currency:'INR',name:'Harvester Parts',description,handler,modal:{ondismiss:()=>toast('Payment window closed. No payment was captured.')},prefill});
      rz.open();
      return true;
    }catch(e){
      toast('Razorpay could not open. Please check the key and browser permissions.');
      return false;
    }
  }
  async function purchaseMembership(key){
    if(!state.user) return route('login');
    const plan=MEMBERSHIP_PLANS.find(p=>p.key===key);
    if(!plan) return toast('Plan not found');
    const start=new Date(); const exp=new Date(Date.now()+plan.days*86400000);
    const activate=async(paymentId)=>{
      const purchase={user_id:state.user.id, plan_key:plan.key, plan_name:plan.name, amount:plan.price, status:'paid', payment_id:paymentId, starts_at:start.toISOString(), expires_at:exp.toISOString(), updated_at:new Date().toISOString()};
      if(sb){
        const {error}=await sb.from('membership_purchases').insert(purchase);
        if(error) return toast('Membership payment succeeded, but plan save failed. Contact support with Razorpay ID.');
        await sb.from('users').update({active_membership:plan.key,membership_key:plan.key,membership_title:plan.title,membership_badge:plan.badge,membership_banner:plan.banner,membership_expires_at:exp.toISOString(),badge_key:'premium_member',badge_title:plan.title,banner_key:plan.key,banner_title:plan.banner,points:Math.max(Number(state.profile?.points||0), userPoints()+plan.reward)}).eq('auth_id',state.user.id);
        await loadSession(); await loadFinanceData();
      } else {
        state.profile={...(state.profile||{}),active_membership:plan.key,membership_key:plan.key,membership_title:plan.title,membership_badge:plan.badge,membership_banner:plan.banner,membership_expires_at:exp.toISOString(),badge_key:'premium_member',badge_title:plan.title,banner_title:plan.banner};
      }
      toast('Payment successful. Membership activated.');
      route('account');
    };
    await openRazorpayPayment({amount:plan.price,description:plan.name,prefill:{email:state.user.email||'',contact:state.profile?.phone||''},handler:async(resp)=>activate(resp.razorpay_payment_id||'razorpay_paid')});
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
  function closeMenu(){
    $('#sideMenu')?.classList.remove('open');
    $('#backdrop')?.classList.remove('show');
    document.body.classList.remove('menu-open');
  }
  function openMenu(){
    $('#sideMenu')?.classList.add('open');
    $('#backdrop')?.classList.add('show');
    document.body.classList.add('menu-open');
  }
  function isActuallyClickable(el){
    if(!el) return false;
    if(el.closest('#sideMenu') && !$('#sideMenu')?.classList.contains('open')) return false;
    for(let n=el; n && n.nodeType===1 && n!==document.documentElement; n=n.parentElement){
      const cs = window.getComputedStyle(n);
      if(cs.display==='none' || cs.visibility==='hidden' || cs.pointerEvents==='none') return false;
      if(n.id==='sideMenu' && !n.classList.contains('open')) return false;
    }
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }
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
  function parsePrice(v){ return Number(String(v||'').replace(/[^\d.]/g,'')) || 0; }
  function formatINRInput(v){ const raw=String(v||'').replace(/[^\d]/g,''); return raw ? Number(raw).toLocaleString('en-IN') : ''; }
  function placeholder(cat='parts'){ return './harvester-logo-full.jpg'; }
  function productImage(p){ return productImages(p)[0] || placeholder(p.category); }
  function productImages(p){
    const arr=[];
    if(Array.isArray(p?.image_urls)) arr.push(...p.image_urls.filter(Boolean));
    else if(typeof p?.image_urls==='string'){
      try{ const parsed=JSON.parse(p.image_urls); if(Array.isArray(parsed)) arr.push(...parsed.filter(Boolean)); }
      catch(e){ if(p.image_urls) arr.push(p.image_urls); }
    }
    if(p?.image) arr.push(p.image);
    const clean=[...new Set(arr.map(x=>String(x||'').trim()).filter(Boolean))];
    return clean.length ? clean : [placeholder(p?.category)];
  }
  function platformFee(subtotal){ subtotal=Number(subtotal||0); if(!subtotal) return 0; return Math.round(subtotal * commissionRateForAmount(subtotal)); }
  function sellerFee(price, planKey){ price=Number(price||0); if(!price)return 0; return Math.round(price*commissionRateForAmount(price)); }
  function sellerFeeForProduct(p){ return sellerFee(p?.price, sellerPlanKeyFromProduct(p)); }
  function cartHasHeavyItems(items=state.cart){
    return (items||[]).some(i=>{
      const p=state.products.find(x=>String(x.id)===String(i.id)) || i;
      return matchesProductType(p,'machine') || Number(p.weight_kg||i.weight_kg||0) > 30;
    });
  }
  function cartHasOnlySpares(items=state.cart){ return !!items.length && !cartHasHeavyItems(items); }
  function shippingFee(subtotal, method='standard', km=0){
    subtotal=Number(subtotal||0); if(!subtotal)return 0;
    if(method==='seller_delivery' || method==='buyer_pickup') return 0;
    if(method==='road_transport') return Math.max(0, Math.round(Number(km||0) * ROAD_TRANSPORT_RATE_PER_KM));
    const base = subtotal<=2000?120:subtotal<=10000?250:subtotal<=50000?850:1800;
    return method==='express_courier'?Math.round(base*1.8):base;
  }
  function couponDiscount(code, subtotal, items=state.cart){
    const c=COUPONS[String(code||'').trim().toUpperCase()];
    subtotal=Number(subtotal||0);
    if(!c || subtotal < Number(c.min||0)) return {code:'',amount:0,label:c?`Minimum order ${money(c.min)} required`:'Invalid coupon'};
    if(c.type==='spare' && !cartHasOnlySpares(items)) return {code:c.code,amount:0,label:'SPARE7 works only on spare-part carts'};
    const amount=c.flat ? Number(c.flat) : Math.min(Math.round(subtotal * Number(c.percent||0) / 100), Number(c.max||999999));
    return {code:c.code,amount:Math.min(amount, subtotal),label:c.label};
  }

  async function init(){
    if(localStorage.hp_launch_clean_version !== LAUNCH_CLEAN_VERSION){
      ['hp_products','hp_cart','hp_wishlist','hp_last_order','hp_checkout_coupon','hp_fact_ts','hp_fact_index'].forEach(k=>localStorage.removeItem(k));
      localStorage.hp_launch_clean_version = LAUNCH_CLEAN_VERSION;
    }
    setTimeout(()=>$('#intro')?.classList.add('hide'),900);
    const langModal = $('#languageModal');
    if(localStorage.hp_lang_done==='1') langModal?.classList.remove('show');
    bindShell(); applyLang(); await loadSession(); await loadProducts(); await loadSiteContent(); await loadFinanceData(); await loadMessages(); loadCart(); loadWishlist(); syncMenu(); render(); setupScroll(); setupFinanceRealtime();
    if(localStorage.hp_lang_done==='1' || !langModal?.classList.contains('show')) scheduleInstallPrompt(1200);
  }
  function scheduleInstallPrompt(delay=700){
    if(localStorage.hp_install_done==='1') return;
    clearTimeout(window.__hpInstallTimer);
    window.__hpInstallTimer=setTimeout(()=>{
      const langOpen = $('#languageModal')?.classList.contains('show');
      if(!langOpen && localStorage.hp_install_done!=='1') $('#installModal')?.classList.add('show');
    }, delay);
  }
  function bindShell(){
    // v86: bubble-phase routing only. Invisible/closed menu buttons must never steal taps from forms.
    document.addEventListener('click', e=>{
      const formTarget = e.target.closest('input, textarea, select, option, label, form, [contenteditable="true"]');
      const routeEl=e.target.closest('button[data-route],a[data-route],[role="button"][data-route],.brand[data-route],.icon-btn[data-route]');
      if(formTarget && !routeEl) return;
      if(routeEl){
        if(!isActuallyClickable(routeEl)) return;
        e.preventDefault();
        e.stopPropagation();
        route(routeEl.dataset.route);
        return;
      }
      const close=e.target.closest('[data-close-modal]');
      if(close){ const id=close.dataset.closeModal; $('#'+id)?.classList.remove('show'); if(id==='installModal' && $('#dontShowInstall')?.checked) localStorage.hp_install_done='1'; }
    });
    $('#menuButton')?.addEventListener('click',openMenu); $('#closeMenu')?.addEventListener('click',closeMenu); $('#backdrop')?.addEventListener('click',closeMenu);
    $('#authButton')?.addEventListener('click',()=> state.user ? route('account') : route('login'));
    $('#menuLoginBtn')?.addEventListener('click',()=> state.user ? route('account') : route('login'));
    $('#logoutBtn')?.addEventListener('click',logout);
    $$('#languageModal [data-lang]').forEach(b=>b.addEventListener('click',()=>{ state.lang=b.dataset.lang; localStorage.hp_lang=state.lang; localStorage.hp_lang_seen='1'; if($('#dontShowLang')?.checked) localStorage.hp_lang_done='1'; $('#languageModal')?.classList.remove('show'); applyLang(); render(); scheduleInstallPrompt(700); }));
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
    const msg = String(error?.message || error || 'Something went wrong. Please try again.');
    const lower = msg.toLowerCase();
    if(lower.includes('email not confirmed')) return 'Email not confirmed. Please open the confirmation email, then login again.';
    if(lower.includes('invalid login credentials')) return 'Wrong email or password, or this account is not confirmed yet.';
    if(lower.includes('21608') || lower.includes('unverified')) return 'Phone OTP is currently available only for verified test numbers. Please use email or Google login until public SMS is enabled.';
    if(lower.includes('60200') || lower.includes('invalid parameter')) return 'Phone OTP could not be sent. Please check the phone number or use email / Google login.';
    if(lower.includes('sms') || lower.includes('phone') || lower.includes('provider')) return 'Phone OTP is temporarily unavailable. Please use email or Google login.';
    return msg.replace(/Supabase/gi,'account system').replace(/Twilio/gi,'SMS service');
  }
  async function signup(email,password,name){
    if(!sb) return toast('Login service is not ready yet');
    const {data,error}=await sb.auth.signUp({email,password,options:{data:{full_name:name}, emailRedirectTo: authRedirectUrl()}});
    if(error)return toast(friendlyAuthError(error));
    await loadSession(); await loadFinanceData(); syncMenu();
    if(data?.session || state.user){ route('account'); toast('Account created and logged in'); }
    else { route('login'); toast('Account created. Check email to confirm, then login.'); }
  }
  async function login(email,password){
    if(!sb) return toast('Login service is not ready yet');
    const {error}=await sb.auth.signInWithPassword({email,password});
    if(error)return toast(friendlyAuthError(error));
    await loadSession(); await loadProducts(); await loadFinanceData(); syncMenu(); route('home'); toast('Logged in');
  }
  async function loginGoogle(){
    if(!sb) return toast('Login service is not ready yet');
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
    if(!sb) return toast('Login service is not ready yet');
    if(!PHONE_OTP_ENABLED) return toast('Phone OTP is not available right now. Please use email or Google login.');
    phone = normalizePhone(phone, $('#countryCodeSelect')?.value||'+91');
    if(!isValidE164(phone)) return toast('Enter a valid mobile number with country code.');
    $('#phoneOtpInput') && ($('#phoneOtpInput').dataset.fullPhone=phone);
    const {error}=await sb.auth.signInWithOtp({phone, options:{shouldCreateUser:true}});
    if(error) return toast(friendlyAuthError(error));
    toggleOtpFields(true);
    toast('OTP sent. Enter the 6 digit code.');
  }
  async function verifyPhoneOtp(phone,token){
    if(!sb) return toast('Login service is not ready yet');
    if(!PHONE_OTP_ENABLED) return toast('Phone OTP is not available right now. Please use email or Google login.');
    phone = normalizePhone(phone || $('#phoneOtpInput')?.dataset.fullPhone || '', $('#countryCodeSelect')?.value||'+91');
    token = String(token||'').trim();
    if(!isValidE164(phone)) return toast('Enter a valid mobile number with country code.');
    if(!token) return toast('Enter OTP code');
    const {error}=await sb.auth.verifyOtp({phone,token,type:'sms'});
    if(error) return toast(friendlyAuthError(error));
    await loadSession(); await loadFinanceData(); syncMenu(); route('home'); toast('Phone login successful');
  }
  async function forgotPassword(email){
    if(!sb) return toast('Login service is not ready yet');
    if(!email) return toast('Enter your email first');
    const {error}=await sb.auth.resetPasswordForEmail(email,{redirectTo: authRedirectUrl() + '#account'});
    if(error) return toast(friendlyAuthError(error));
    toast('Password reset link sent to email');
  }
  async function logout(){ if(sb) await sb.auth.signOut(); state.user=null; state.profile=null; state.seller=null; state.finance={balance:null,payoutAccount:null,payoutRequests:[],ledger:[]}; state.cart=[]; localStorage.hp_cart='[]'; syncMenu(); route('home'); }
  function syncMenu(updateLang=true){
    const isAdmin=(state.profile?.role==='admin') || ((state.user?.email||'').toLowerCase()===ADMIN_EMAIL);
    $('#authButton') && ($('#authButton').textContent=state.user?(window.innerWidth<520?tx('Account'):tx('My Account')):tx('Login'));
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
    const msgBtn = document.querySelector('[data-route="messages"]'); if(msgBtn && state.unreadMessages){ msgBtn.classList.add('has-unread'); msgBtn.setAttribute('data-unread', String(state.unreadMessages)); }
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

  function commonsImg(file){ return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}`; }
  function demoProducts(){
    const now=Date.now();
    const imgs={
      combine:commonsImg('Combine_harvester.jpg'),
      tractor:commonsImg('Farmall_Tractor_(51325633027).jpg'),
      harvester2:commonsImg('CaseCombineHarvester.jpg'),
      belt:commonsImg('Keilriemen-V-Belt.png'),
      pulley:commonsImg('Belt_pulleys.svg'),
      bearing:commonsImg('High_Speed_Ball_Bearing_(6868658067).jpg'),
      hydraulic:commonsImg('Hydraulic_cylinder.JPG'),
      tyre:commonsImg('Old_Truck_or_Tractor_Tire_(14621672472).jpg')
    };
    const base=[
      ['demo-m-1','New Holland TC56 Combine Harvester','Combine Harvester','New Holland','TC56','Used',875000,'Ludhiana','Punjab',imgs.combine,'Field-ready combine harvester demo listing with header, threshing unit and basic service history.'],
      ['demo-m-2','Mahindra 575 DI Tractor With Trolley','Tractor','Mahindra','575 DI','Used',385000,'Karnal','Haryana',imgs.tractor,'Popular 45 HP tractor package for haulage, tillage and daily farm work.'],
      ['demo-m-3','Swaraj 744 FE Tractor 4WD','Tractor','Swaraj','744 FE','Used',515000,'Patiala','Punjab',imgs.tractor,'Strong demo tractor listing with 4WD configuration and good tyres.'],
      ['demo-m-4','Super Seeder 7 Feet Heavy Duty','Super Seeder','Fieldking','7 ft','Factory Stock',145000,'Sangrur','Punjab',imgs.harvester2,'Residue-management seeder for wheat sowing after paddy harvest.'],
      ['demo-m-5','Straw Reaper With New Blades','Straw Reaper','Dasmesh','SR-56','Used',225000,'Hisar','Haryana',imgs.combine,'Demo straw reaper listing with cutter assembly and belt condition notes.'],
      ['demo-m-6','Laser Land Leveler Scraper Set','Laser Land Leveler','SoilPro','LL-84','New',168000,'Jaipur','Rajasthan',imgs.tractor,'Laser land leveler setup for field levelling and water saving.'],
      ['demo-m-7','Boom Sprayer 600 Litre','Sprayer','AgriTech','600L','New',72000,'Moga','Punjab',imgs.harvester2,'Mounted boom sprayer with pump, nozzles and hose kit.'],
      ['demo-m-8','Rotavator 6 Feet Heavy Series','Rotavator','Shaktiman','6 ft','Used',82000,'Meerut','Uttar Pradesh',imgs.tractor,'Demo rotavator listing for soil preparation and seedbed finishing.'],
      ['demo-p-1','Harvester V Belt Set B-72','Belts & Chains','Pix','B-72','New',1350,'Ludhiana','Punjab',imgs.belt,'Matched V belt set for harvester drive and workshop replacement.'],
      ['demo-p-2','Combine Elevator Chain Kit','Belts & Chains','Diamond','ECK-22','New',4200,'Karnal','Haryana',imgs.pulley,'Elevator chain kit for grain handling assembly.'],
      ['demo-p-3','High Speed Ball Bearing 6208','Bearings','SKF','6208','New',780,'Delhi','Delhi',imgs.bearing,'Sealed high-speed bearing for shaft and pulley applications.'],
      ['demo-p-4','Harvester Cutter Blade Pack','Blades & Cutter Parts','AgroBlade','CB-24','New',2450,'Patiala','Punjab',imgs.harvester2,'Cutter blade pack for crop cutting bar maintenance.'],
      ['demo-p-5','Cutter Bar Guard Finger Set','Blades & Cutter Parts','CropCut','GF-10','New',3100,'Hisar','Haryana',imgs.combine,'Guard finger set for smoother crop feeding and reduced losses.'],
      ['demo-p-6','Air Filter For Tractor Engine','Filters','Fleetguard','AF-204','New',950,'Bathinda','Punjab',imgs.tractor,'Air filter demo listing for tractor and harvester engine protection.'],
      ['demo-p-7','Fuel Filter Pair For Harvester','Filters','Bosch','FF-19','New',680,'Moga','Punjab',imgs.tractor,'Fuel filter pair for clean diesel supply and reliable engine running.'],
      ['demo-p-8','PTO Shaft With Cross Joint','PTO & Universal Joints','AgriLine','PTO-6','New',6500,'Jaipur','Rajasthan',imgs.pulley,'PTO shaft assembly with cross joint for implements.'],
      ['demo-p-9','Hydraulic Cylinder 2 Inch Bore','Hydraulic Parts','HydroMax','HC-2','New',7800,'Meerut','Uttar Pradesh',imgs.hydraulic,'Hydraulic cylinder for trolleys, loaders and implements.'],
      ['demo-p-10','Hydraulic Hose Pipe Set','Hydraulic Parts','HydroFlex','HHP-12','New',1900,'Sangrur','Punjab',imgs.hydraulic,'High-pressure hydraulic hose set for farm machinery.'],
      ['demo-p-11','Rear Tractor Tyre 13.6-28','Tyres & Tubes','MRF','13.6-28','New',26500,'Karnal','Haryana',imgs.tyre,'Rear tractor tyre demo listing with agricultural tread.'],
      ['demo-p-12','LED Work Light Pair','Electrical Parts','Lumax','LED-48W','New',1600,'Delhi','Delhi',imgs.tractor,'Water-resistant LED work light pair for night harvesting.'],
      ['demo-p-13','Starter Motor Assembly','Electrical Parts','Lucas','SM-12V','Refurbished',5400,'Ludhiana','Punjab',imgs.tractor,'Refurbished starter motor assembly for tractor engines.'],
      ['demo-p-14','Engine Piston Ring Set','Engine Parts','Goetze','PRS-4','New',2100,'Patiala','Punjab',imgs.bearing,'Piston ring set for common tractor engine rebuilds.'],
      ['demo-p-15','Clutch Plate 11 Inch','Clutch & Brake Parts','Luk','CP-11','New',3200,'Hisar','Haryana',imgs.pulley,'Clutch plate demo listing for tractor and implement power transfer.'],
      ['demo-p-16','Oil Seal Kit For Gearbox','Rubber Seals & Bushes','NOK','OSK-9','New',850,'Moga','Punjab',imgs.belt,'Oil seal kit for gearbox and shaft sealing work.'],
      ['demo-p-17','Nut Bolt Hardware Assortment','Nuts, Bolts & Hardware','TVS','NB-100','New',1200,'Delhi','Delhi',imgs.pulley,'Workshop pack of bolts, nuts, pins and common fasteners.'],
      ['demo-p-18','Pulley Wheel For Thresher','Shafts & Gears','AgroPulley','PW-18','New',2750,'Bathinda','Punjab',imgs.pulley,'Pulley wheel for thresher and belt-drive repair.']
    ];
    return base.map((x,i)=>({id:x[0],title:x[1],category:x[2],brand:x[3],model:x[4],condition:x[5],price:x[6],city:x[7],state:x[8],image_urls:[x[9]],image:x[9],description:x[10],status:'approved',is_boosted:i<5,views:220-i*6,user_id:'demo-seller',created_at:new Date(now-i*86400000).toISOString()}));
  }

  function withDemoCatalog(products=[]){
    const arr=Array.isArray(products)?products:[];
    if(cfg.SHOW_DEMO_CATALOG!==true) return arr;
    const seen=new Set(arr.map(p=>String(p.id||p.title||'').toLowerCase()));
    const demo=demoProducts().filter(p=>!seen.has(String(p.id||p.title||'').toLowerCase()));
    return [...arr, ...demo];
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
        const products=withDemoCatalog(data);
        state.products=products;
        const cats=[...new Set(products.map(p=>p.category).filter(Boolean))];
        state.stats.products=products.filter(isVisibleProduct).length;
        state.stats.categories=cats.length || 0;
        state.stats.sellers=[...new Set(products.filter(isVisibleProduct).map(p=>p.user_id||p.seller_id).filter(Boolean))].length || 0;
        try{ const {count}=await sb.from('orders').select('*',{count:'exact',head:true}); state.stats.orders=count||0; }catch(e){}
        return;
      }
    }
    const localProducts=JSON.parse(localStorage.hp_products||'[]');
    state.products=withDemoCatalog(localProducts);
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
    const boosted=p.is_boosted?'<span class="badge owner royal-seal">Sponsored</span>':'';
    return `<article class="product-card fade-up"><div class="product-img"><img src="${productImage(p)}" onerror="this.src='${placeholder(p.category)}'" alt="${p.title||'Product'}"></div><div class="product-body"><div>${boosted} <span class="badge verified">Verified Farm Listing</span></div><h3>${p.title||'Agricultural Listing'}</h3><p class="muted">${p.category||'Spare Part'} • ${p.brand||'Harvester Parts'}</p><div class="price-row"><span class="price">${money(p.price)}</span><span class="chip">Confirmed before order</span></div><div class="actions"><button class="ghost" onclick="HP.route('product',{id:'${p.id}'})">Details</button><button class="secondary" onclick="HP.addToCart('${p.id}')">Add Cart</button><button class="primary wide" onclick="HP.buyNow('${p.id}')">Buy Now</button></div></div></article>`;
  }
  const AGRI_CATEGORIES = [
    {group:'Machines', title:'Combine Harvester', desc:'New and used combine harvesters, feeder houses, threshing units and harvesting machines.', icon:'CH', filters:['Combine Harvester','Harvester','Combine']},
    {group:'Machines', title:'Tractor', desc:'2WD, 4WD, mini and used tractors with compatible spares.', icon:'TR', filters:['Tractor']},
    {group:'Machines', title:'Rotavator', desc:'Rotavators and rotary tillers for soil preparation.', icon:'RT', filters:['Rotavator','Rotary']},
    {group:'Machines', title:'Cultivator', desc:'Cultivators, spring loaded cultivators and tillage tools.', icon:'CU', filters:['Cultivator']},
    {group:'Machines', title:'Disc Harrow', desc:'Disc harrows, offset harrows and soil finishing implements.', icon:'DH', filters:['Disc Harrow','Harrow']},
    {group:'Machines', title:'MB Plough', desc:'Mould board ploughs, reversible ploughs and plough assemblies.', icon:'MP', filters:['Plough','MB Plough']},
    {group:'Machines', title:'Seed Drill', desc:'Seed drills, zero till drills and precision seeding machines.', icon:'SD', filters:['Seed Drill','Seeding Drill','Drill']},
    {group:'Machines', title:'Super Seeder', desc:'Super seeders, happy seeders and residue-management seeders.', icon:'SS', filters:['Super Seeder','Happy Seeder']},
    {group:'Machines', title:'Straw Reaper', desc:'Straw reapers, reaper binders and crop residue machinery.', icon:'SR', filters:['Straw Reaper','Reaper']},
    {group:'Machines', title:'Baler', desc:'Hay balers, straw balers and bale handling machinery.', icon:'BA', filters:['Baler']},
    {group:'Machines', title:'Sprayer', desc:'Boom sprayers, orchard sprayers and power sprayers.', icon:'SP', filters:['Sprayer','Spray']},
    {group:'Machines', title:'Laser Land Leveler', desc:'Laser levelers, scrapers and land leveling equipment.', icon:'LL', filters:['Laser','Leveler']},
    {group:'Machines', title:'Paddy Transplanter', desc:'Rice and paddy transplanters for farm operations.', icon:'PT', filters:['Paddy Transplanter','Transplanter']},
    {group:'Machines', title:'Potato Planter / Digger', desc:'Potato planters, diggers and harvesting equipment.', icon:'PD', filters:['Potato']},
    {group:'Machines', title:'Maize Sheller', desc:'Maize shellers, corn threshers and grain processing equipment.', icon:'MS', filters:['Maize','Corn','Sheller']},
    {group:'Machines', title:'Thresher', desc:'Wheat, paddy, maize and multi-crop threshers.', icon:'TH', filters:['Thresher']},
    {group:'Machines', title:'Trailer / Trolley', desc:'Farm trailers, trolleys and haulage equipment.', icon:'TL', filters:['Trailer','Trolley']},
    {group:'Machines', title:'Irrigation & Pumps', desc:'Pump sets, pipes, motors, sprinklers and irrigation kits.', icon:'IP', filters:['Irrigation','Pump','Water','Motor']},
    {group:'Spare Parts', title:'Belts & Chains', desc:'Drive belts, elevator chains, roller chains and transmission wear parts.', icon:'BC', filters:['Belts','Belt','Chains','Chain']},
    {group:'Spare Parts', title:'Bearings', desc:'Harvester, tractor and implement bearings for shafts, rollers and pulleys.', icon:'BR', filters:['Bearings','Bearing']},
    {group:'Spare Parts', title:'Blades & Cutter Parts', desc:'Cutter bars, knives, guards, fingers, sections and crop cutting assemblies.', icon:'BL', filters:['Cutter Parts','Blade','Blades','Knife']},
    {group:'Spare Parts', title:'Filters', desc:'Air, oil, fuel and hydraulic filters for machines and tractors.', icon:'FL', filters:['Filter','Filters']},
    {group:'Spare Parts', title:'Shafts & Gears', desc:'Drive shafts, PTO shafts, gears, pulleys and gearbox-related spares.', icon:'SG', filters:['Shafts','Shaft','Gear','Gears','Pulley']},
    {group:'Spare Parts', title:'PTO & Universal Joints', desc:'PTO shafts, cross joints, yokes and couplings.', icon:'PJ', filters:['PTO','Universal Joint','Joint']},
    {group:'Spare Parts', title:'Hydraulic Parts', desc:'Hydraulic pipes, pumps, cylinders, valves and oil-flow components.', icon:'HY', filters:['Hydraulic','Cylinder','Valve']},
    {group:'Spare Parts', title:'Tyres & Tubes', desc:'Tractor, trolley and implement tyres, tubes and wheels.', icon:'TY', filters:['Tyre','Tire','Tube','Wheel']},
    {group:'Spare Parts', title:'Electrical Parts', desc:'Batteries, wiring, lights, sensors, switches and electrical spares.', icon:'EL', filters:['Electrical','Battery','Light','Sensor','Switch']},
    {group:'Spare Parts', title:'Engine Parts', desc:'Pistons, rings, liners, gaskets, injectors and engine spares.', icon:'EN', filters:['Engine','Piston','Injector','Liner']},
    {group:'Spare Parts', title:'Clutch & Brake Parts', desc:'Clutch plates, brake shoes, master cylinders and related spares.', icon:'CB', filters:['Clutch','Brake']},
    {group:'Spare Parts', title:'Rubber Seals & Bushes', desc:'Oil seals, rubber bushes, gaskets, o-rings and sealing components.', icon:'RS', filters:['Rubber Seals','Seals','Bush','Gasket']},
    {group:'Spare Parts', title:'Nuts, Bolts & Hardware', desc:'Fasteners, pins, clips and common farm machine hardware.', icon:'NB', filters:['Nut','Bolt','Hardware','Pin']}
  ];
  function categoryIconSvg(c){
    const t=String(c.title||'').toLowerCase();
    const wheel='<circle cx="18" cy="36" r="7"/><circle cx="42" cy="36" r="10"/>';
    if(t.includes('tractor')) return `<svg viewBox="0 0 64 48" aria-hidden="true"><path d="M10 34h8l6-14h15l5 8h7v6"/><path d="M26 20v-8h10l7 8"/><path d="M8 36h46"/>${wheel}</svg>`;
    if(t.includes('harvester')) return `<svg viewBox="0 0 64 48" aria-hidden="true"><path d="M8 30h32l8-10h8v14H8z"/><path d="M10 20h24l6 10"/><path d="M6 36h52"/><circle cx="18" cy="36" r="6"/><circle cx="46" cy="36" r="7"/></svg>`;
    if(t.includes('blade')||t.includes('cutter')) return `<svg viewBox="0 0 64 48" aria-hidden="true"><path d="M8 34c18-18 30-24 48-25-7 14-20 25-42 31z"/><path d="M17 30l10 8"/></svg>`;
    if(t.includes('bearing')||t.includes('gear')||t.includes('shaft')) return `<svg viewBox="0 0 64 48" aria-hidden="true"><circle cx="32" cy="24" r="15"/><circle cx="32" cy="24" r="6"/><path d="M32 4v8M32 36v8M12 24H4M60 24h-8M18 10l6 7M46 38l-6-7M46 10l-6 7M18 38l6-7"/></svg>`;
    if(t.includes('hydraulic')) return `<svg viewBox="0 0 64 48" aria-hidden="true"><path d="M10 29h24l15-12 5 6-15 12H10z"/><path d="M12 20h20M44 14l8 10"/></svg>`;
    if(t.includes('tyre')) return `<svg viewBox="0 0 64 48" aria-hidden="true"><circle cx="32" cy="24" r="17"/><circle cx="32" cy="24" r="8"/><path d="M32 7v8M32 33v8M15 24h8M41 24h8"/></svg>`;
    if(t.includes('filter')) return `<svg viewBox="0 0 64 48" aria-hidden="true"><path d="M17 8h30v32H17z"/><path d="M23 14h18M23 21h18M23 28h18M23 35h18"/></svg>`;
    return `<svg viewBox="0 0 64 48" aria-hidden="true"><path d="M11 34h42"/><path d="M16 34l6-18h20l6 18"/><path d="M25 16v18M39 16v18"/><circle cx="22" cy="36" r="5"/><circle cx="44" cy="36" r="5"/></svg>`;
  }
  function categoryCard(c){
    const count = state.products.filter(p=> c.filters.some(f=>String(p.category||'').toLowerCase().includes(f.toLowerCase()) || String(p.title||'').toLowerCase().includes(f.toLowerCase()))).length;
    return `<article class="agri-category-card pro-cat fade-up" onclick="HP.route('market',{category:'${c.title}'})"><div class="cat-mark">${categoryIconSvg(c)}</div><div><small>${c.group}</small><h3>${c.title}</h3><p>${c.desc}</p><span>${count} active listings</span></div></article>`;
  }
  function categoriesBySellType(type){ return AGRI_CATEGORIES.filter(c => type==='machine' ? c.group==='Machines' : c.group==='Spare Parts'); }
  function categoryOptionsFor(type){ return categoriesBySellType(type).map(c=>`<option value="${esc(c.title)}">${esc(c.title)}</option>`).join(''); }



  function fallbackSlides(){
    return [
      {title:'Verified machine trading',subtitle:'Buy and sell harvesters, tractors, implements and used farm equipment with seller review.',cta_text:'Open Market',cta_route:'market',image_url:'./harvester-logo-full.jpg'},
      {title:'Workshop-ready spare parts',subtitle:'Belts, bearings, blades, filters, hydraulic parts and repair stock grouped for fast discovery.',cta_text:'Browse Parts',cta_route:'categories',image_url:'./harvester-logo-full.jpg'},
      {title:'Built-in commission workflow',subtitle:'Buyer fees, seller platform commission, membership limits, balances and payout requests stay organized.',cta_text:'View Plans',cta_route:'membership',image_url:'./harvester-logo-full.jpg'}
    ];
  }

  const AGRI_FACTS = [
    'A sharp cutter bar and clean guards reduce crop loss during harvesting.',
    'Correct tyre pressure improves traction and can reduce fuel use in field work.',
    'Greasing bearings on time protects shafts, pulleys and chains from early wear.',
    'Clean air, fuel and hydraulic filters help tractors and harvesters run reliably.',
    'Balanced blades and chains reduce vibration and protect machine life.',
    'Keeping spare belts, bearings and filters ready can prevent harvest-time delays.',
    'Checking oil levels before field work is one of the cheapest ways to prevent breakdowns.',
    'Good storage of rubber seals, belts and hoses protects them from cracking and early failure.'
  ];
  function factIndex(){
    const saved = Number(localStorage.hp_fact_index || 0);
    const last = Number(localStorage.hp_fact_ts || 0);
    if(!last || Date.now() - last > 60*1000){
      const next = (saved + 1) % AGRI_FACTS.length;
      localStorage.hp_fact_index = String(next);
      localStorage.hp_fact_ts = String(Date.now());
      return next;
    }
    return saved % AGRI_FACTS.length;
  }
  function currentAgriFact(){ return AGRI_FACTS[factIndex()] || AGRI_FACTS[0]; }
  function agriFactCard(){
    return `<section class="page-card agri-fact-card" id="agriFactCard"><div><span class="eyebrow">Agriculture fact</span><h2>Useful farm machine tip</h2><p id="agriFactText">${esc(currentAgriFact())}</p></div><span class="badge live-badge">Updates every 1 min</span></section>`;
  }
  function startFactTicker(){
    clearInterval(window.__hpFactTimer);
    const update=()=>{ const el=document.getElementById('agriFactText'); if(el){ el.classList.add('fact-swap'); setTimeout(()=>{ localStorage.hp_fact_index=String((Number(localStorage.hp_fact_index||0)+1)%AGRI_FACTS.length); localStorage.hp_fact_ts=String(Date.now()); el.textContent=currentAgriFact(); el.classList.remove('fact-swap'); if(window.HP_APPLY_LANGUAGE) setTimeout(window.HP_APPLY_LANGUAGE,30); },180); } };
    window.__hpFactTimer=setInterval(update,60*1000);
  }
  function normalizeSlide(sl={}){
    const text=`${sl.title||''} ${sl.subtitle||''}`.toLowerCase();
    if(text.includes('free sellers get 5 listings') || text.includes('reduce platform fees') || text.includes('lower seller commission')){
      return {...sl,title:'Launch seller plans from ₹19',subtitle:'Free users get 10 listings, paid plans add boosts and badges, and commission follows clear value slabs.',cta_text:'View Plans',cta_route:'membership'};
    }
    if(text.includes('seller payouts after platform commission')){
      return {...sl,subtitle:'Post your stock, build trust, earn ranks and receive organized payouts with transparent slab commission during launch.'};
    }
    return sl;
  }
  function carouselSlides(){
    const seen=new Set();
    return (state.siteSlides&&state.siteSlides.length?state.siteSlides:fallbackSlides())
      .filter(s=>s!==null)
      .map(normalizeSlide)
      .filter(s=>{ const key=`${s.title||''}|${s.subtitle||''}`; if(seen.has(key)) return false; seen.add(key); return true; })
      .slice(0,6);
  }
  function homeCarousel(){
    const approved=visibleProducts();
    const boosted=approved.filter(p=>p.is_boosted).slice(0,8);
    const newest=[...approved].sort((a,b)=>new Date(b.created_at||0)-new Date(a.created_at||0)).slice(0,8);
    const highValue=[...approved].sort((a,b)=>Number(b.price||0)-Number(a.price||0)).slice(0,8);
    const popular=[...approved].sort((a,b)=>Number(b.views||0)-Number(a.views||0)).slice(0,8);
    const sections=[
      ['Sponsored listings', boosted.length?boosted:highValue.slice(0,4), 'Boosted and high-value products get extra visibility.'],
      ['New arrivals', newest, 'Fresh products listed by approved sellers.'],
      ['Top machinery and parts', highValue, 'High-value farm machinery, implements and spare parts.'],
      ['Popular products', popular, 'Products receiving more marketplace attention.']
    ];
    return sections.map(([title,items,subtitle])=> items&&items.length ? `<section class="product-carousel-section"><div class="section-head"><h2>${title}</h2><p class="muted">${subtitle}</p></div><div class="product-row-carousel">${items.map(productCard).join('')}</div></section>` : '').join('');
  }
  function featureCarousel(){
    const slides=carouselSlides();
    return `<section class="home-carousel-section"><div class="section-head"><h2>Marketplace highlights</h2><p class="muted">Quick rotating cards for buying, selling, plans and verified listings.</p></div><div class="home-carousel">${slides.map(s=>`<article class="carousel-slide"><img src="${esc(s.image_url||'./harvester-logo-full.jpg')}" onerror="this.src='./harvester-logo-full.jpg'" alt="${esc(s.title||'Marketplace update')}"><div><span class="eyebrow">Harvester Parts</span><h3>${esc(s.title||'Marketplace update')}</h3><p>${esc(s.subtitle||'Verified agriculture machinery and spare-part trading.')}</p><button class="primary" data-route="${esc(normalizeRouteName(s.cta_route||'market'))}">${esc(s.cta_text||'Open')}</button></div></article>`).join('')}</div></section>`;
  }

  function home(){
    const categoryCount = state.stats.categories || AGRI_CATEGORIES.length;
    const sellerCount = state.stats.sellers || 0;
    const liveProducts = visibleProducts();
    return `<section class="hp92-hero"><video class="hp92-hero-bg" autoplay muted loop playsinline preload="metadata" poster="./harvester-logo-full.jpg"><source src="./hero-bg.mp4" type="video/mp4"></video><div class="hp92-hero-shade"></div><div class="hp92-hero-copy"><span class="eyebrow">Farm trade made simple</span><h1>Buy and sell farm machines and spare parts without confusion.</h1><p>Harvester Parts connects farmers, dealers, workshops and machine owners with verified sellers, clean search, seller approval, secure checkout, delivery coordination and slab-based launch commission from 3.5% down to 1%.</p><div class="hero-actions"><button class="primary" data-route="market">Browse Marketplace</button><button class="secondary" data-route="sell">Start Selling</button><button class="ghost" data-route="membership">Seller Plans</button></div><div class="hp92-trust-row"><span>Verified sellers</span><span>New + used stock</span><span>Courier for spares</span><span>Road transport for machinery</span></div></div><div class="hp92-hero-panel"><div class="hp92-panel-top"><img src="./logo-512.png" alt="Harvester Parts"><div><b>Harvester Parts</b><span>Live marketplace console</span></div></div><div class="hp92-market-visual" aria-hidden="true"><div class="hp92-radar"><span></span><span></span><span></span></div><div class="hp92-activity-list"><i></i><i></i><i></i><i></i></div><div class="hp92-route-line"></div></div><div class="hp92-metric-grid"><div><b data-count="${state.stats.products||state.products.length}">0</b><span>Live listings</span></div><div><b data-count="${categoryCount}">0</b><span>Categories</span></div><div><b data-count="${sellerCount}">0</b><span>Sellers</span></div><div><b data-count="${state.stats.orders||0}">0</b><span>Orders</span></div></div></div></section>${agriFactCard()}${featureCarousel()}<section class="hp92-role-grid"><article><span>Buyer area</span><h2>Find the right item quickly.</h2><p>Search by category, model, brand, condition and location. Cart, checkout and seller chat stay inside the website.</p></article><article><span>Seller tools</span><h2>List only after verification.</h2><p>Dealers, agencies, farmers and owners can upload details, dimensions, price, condition and compatibility for clean listings.</p></article><article><span>Owner revenue</span><h2>Small launch fees that scale with value.</h2><p>Commission starts higher on small orders and drops down to 1% for high-value machinery to keep serious deals attractive.</p></article></section>${homeCarousel()}<section><div class="section-head"><h2>Fresh listings</h2><button class="ghost" data-route="market">View all</button></div><div class="grid">${liveProducts.slice(0,6).map(productCard).join('')||empty('No live products yet.')}</div></section>`;
  }

  
  function market(){
    const marketProducts=visibleProducts();
    const categories=[...new Set([...marketProducts.map(p=>p.category).filter(Boolean), ...AGRI_CATEGORIES.map(c=>c.title)])];
    const selected=sessionStorage.hp_market_category||'';
    const type=sessionStorage.hp_market_type||'all';
    const shown=marketProducts.filter(p=>matchesProductType(p,type) && (!selected || String(p.category||'').toLowerCase().includes(selected.toLowerCase()) || String(p.title||'').toLowerCase().includes(selected.toLowerCase())));
    return `<section class="page-card market-head-card hp92-market-head"><div><span class="eyebrow">Buyer marketplace</span><h1>Search verified farm machines and spare parts.</h1><p class="muted">Use fast suggestions, product type, category, condition and price filters to find the right farm item quickly.</p></div><button class="primary" data-route="sell">List Product</button><div class="market-tools"><select id="typeFilter"><option value="all" ${type==='all'?'selected':''}>All products</option><option value="machine" ${type==='machine'?'selected':''}>Machinery</option><option value="spare" ${type==='spare'?'selected':''}>Spare parts</option></select><div class="search-wrap"><input id="searchInput" autocomplete="off" placeholder="Search tractor, harvester, bearing, belt or model"><div id="searchSuggest" class="search-suggest"></div></div><select id="categoryFilter"><option value="">All categories</option>${categories.map(c=>`<option ${c===selected?'selected':''}>${c}</option>`).join('')}</select><select id="sortFilter"><option value="all">All listings</option><option value="condition_new">New</option><option value="condition_used">Used</option><option value="price_low">Price low to high</option><option value="price_high">Price high to low</option></select></div></section><section class="grid hp92-market-grid" id="marketGrid">${shown.map(productCard).join('')||empty('No live catalog. Ask sellers to list products.')}</section>`;
  }
  
  function productPage(id){
    const p=state.products.find(x=>String(x.id)===String(id));
    if(!p)return emptyPage('Product not found');
    const imgs=productImages(p);
    const sellerName=p.sellers?.business_name || p.users?.full_name || p.users?.email || 'Verified seller';
    const loc=[p.city,p.district,p.state].filter(Boolean).join(', ') || 'Location shared by seller';
    const related=visibleProducts().filter(x=>String(x.id)!==String(p.id) && (String(x.category||'').toLowerCase()===String(p.category||'').toLowerCase() || String(x.sell_type||'')===String(p.sell_type||''))).slice(0,8);
    return `<section class="product-page"><div class="gallery page-card product-gallery"><div class="main-product-photo" onclick="HP.openGallery('${esc(p.id)}',0)"><img src="${esc(imgs[0])}" onerror="this.src='${placeholder(p.category)}'" alt="${esc(p.title||'Product')}"><span class="photo-count">${imgs.length} photo${imgs.length>1?'s':''}</span></div>${imgs.length>1?`<div class="gallery-thumbs">${imgs.map((img,i)=>`<button onclick="HP.openGallery('${esc(p.id)}',${i})"><img src="${esc(img)}" onerror="this.src='${placeholder(p.category)}'"></button>`).join('')}</div>`:''}</div><aside class="detail-stack sticky-buy"><div class="page-card"><span class="badge verified">Verified Farm Listing</span><h1>${esc(p.title||'Agricultural Product')}</h1><p class="muted">${esc(p.category||'Spare Part')} • ${esc(p.brand||'Harvester Parts')} ${p.model?`• ${esc(p.model)}`:''}</p><div class="price">${money(p.price)}</div><p class="muted">Confirm final price, freight, dimensions and availability before payment.</p><div class="seller-mini-card"><b>${esc(sellerName)}</b><span>${esc(loc)}</span></div><div class="actions"><button class="primary" onclick="HP.buyNow('${esc(p.id)}')">Buy Now</button><button class="secondary" onclick="HP.addToCart('${esc(p.id)}')">Add to Cart</button><button class="ghost" onclick="HP.toggleWishlist('${esc(p.id)}')">Wishlist</button><button class="ghost" onclick="HP.route('messages',{id:'${esc(p.id)}'})">Message Seller</button></div></div><div class="summary-card buyer-only-card"><h3>Buyer assurance</h3><div class="summary-row"><span>Verified seller</span><b>Seller verified</b></div><div class="summary-row"><span>Payment</span><b>Secure checkout</b></div><div class="summary-row"><span>Delivery</span><b>${matchesProductType(p,'machine')?'Road / seller coordination':'Courier for spare parts'}</b></div></div></aside></section><section class="page-card"><h2>Product details</h2><p>${esc(p.description||'Agricultural machinery or spare part listing from a verified seller. Confirm compatibility, condition, dimensions and delivery details before final purchase.')}</p><div class="stats"><div class="stat"><b>${esc(p.condition||'Stock')}</b><span>Condition</span></div><div class="stat"><b>${esc(p.weight_kg||'—')} kg</b><span>Weight</span></div><div class="stat"><b>${esc(p.state||'India')}</b><span>Location</span></div><div class="stat"><b>${esc(p.views||0)}</b><span>Views</span></div></div></section>${related.length?`<section class="product-carousel-section related-products"><div class="section-head"><h2>Similar products</h2><p class="muted">Related listings from the same category, like Amazon or Flipkart style product discovery.</p></div><div class="product-row-carousel">${related.map(productCard).join('')}</div></section>`:''}<div id="photoLightbox" class="photo-lightbox" aria-hidden="true"><button class="lightbox-close" onclick="HP.closeGallery()">×</button><button class="lightbox-nav prev" onclick="HP.stepGallery(-1)">‹</button><img id="lightboxImage" src="${esc(imgs[0])}" alt="${esc(p.title||'Product photo')}"><button class="lightbox-nav next" onclick="HP.stepGallery(1)">›</button><div id="lightboxCount" class="lightbox-count">1 / ${imgs.length}</div></div>`;
  }
  function categoriesPage(){
    const machines=AGRI_CATEGORIES.filter(c=>c.group==='Machines').map(categoryCard).join('');
    const spares=AGRI_CATEGORIES.filter(c=>c.group==='Spare Parts').map(categoryCard).join('');
    return `<section class="page-card category-hero"><span class="eyebrow">All agriculture categories</span><h1>Machinery, implements and every important spare part.</h1><p class="muted">Browse combine harvesters, tractors, seed drills, straw reapers, rotavators and essential parts like belts, bearings, blades, shafts, gears, seals and hydraulic components.</p></section><section><div class="section-head"><h2>Farm Machinery</h2><p class="muted">New and used machines for every stage of farming.</p></div><div class="agri-category-grid">${machines}</div></section><section><div class="section-head"><h2>Spare Parts</h2><p class="muted">Fast discovery for workshops, dealers and farmers.</p></div><div class="agri-category-grid">${spares}</div></section>`;
  }
  function aboutPage(){
    return `<section class="about-hero page-card"><span class="eyebrow">About Harvester Parts</span><h1>India-first marketplace for agricultural machinery and spare parts.</h1><p>Harvester Parts helps farmers, dealers, workshops and machinery owners buy and sell new and used agricultural machinery, combine harvester parts, tractor parts, seed drill spares, straw reaper parts, belts, bearings, cutter components and more through one trusted platform.</p><div class="about-metrics"><div><b>Verified</b><span>seller approvals</span></div><div><b>Secure</b><span>in-app enquiry</span></div><div><b>Multi-use</b><span>machines + spares</span></div></div></section><section class="about-grid"><div class="page-card"><h2>What we do</h2><p>We bring agricultural sellers and buyers together with searchable listings, product details, checkout flow, seller verification and admin approvals. The goal is to make agriculture trading easier, safer and more organized.</p></div><div class="page-card"><h2>For farmers</h2><p>Find nearby machinery and spare parts quickly. Compare estimated prices, message sellers inside the website and keep your purchase journey organized.</p></div><div class="page-card"><h2>For dealers & workshops</h2><p>List inventory, get buyer leads, manage enquiries and grow visibility across agricultural categories without depending only on offline contacts.</p></div><div class="page-card"><h2>Our promise</h2><p>We focus on verified sellers, clear product information, direct in-platform communication and a cleaner buying experience for Indian agriculture.</p></div></section>`;
  }
  function contactPage(){
    return `<section class="contact-grid premium-info-grid"><div class="page-card contact-card"><span class="eyebrow">Contact Harvester Parts</span><h1>Support for buyers, sellers and listing help.</h1><p class="muted">Reach us for seller approval, assisted listings, order questions, delivery coordination or platform support.</p><div class="contact-actions"><a class="primary" href="mailto:${SUPPORT_EMAIL}">Email Support</a><button class="ghost" data-route="support">Open AI Help</button></div><div class="support-list"><div><b>Email</b><span>${SUPPORT_EMAIL}</span></div><div><b>Response</b><span>Important requests are also logged for admin review.</span></div><div><b>Safety</b><span>Never share OTP, bank password or private documents outside verification forms.</span></div></div></div><div class="page-card"><h2>Send a message</h2><form id="contactForm" class="form"><input name="name" placeholder="Your name" required><input name="phone" placeholder="Phone number optional"><select name="topic"><option>Buying help</option><option>Selling help</option><option>Seller verification</option><option>Order support</option><option>Report product</option><option>Other</option></select><textarea name="message" placeholder="Tell us what you need" required></textarea><button class="primary">Send Support Request</button></form></div></section>`;
  }

  function howPage(){
    return `<section class="page-card about-hero"><span class="eyebrow">How Harvester Parts works</span><h1>A simpler route from farm requirement to verified deal.</h1><p>Harvester Parts keeps buying and selling focused: search the right category, verify the seller, confirm delivery method and keep the order record inside the marketplace.</p></section><section class="about-grid premium-info-grid"><div class="page-card process-card"><b>1</b><h2>Search by need</h2><p>Buyers search by machine, spare part, brand, model, category, condition and location.</p></div><div class="page-card process-card"><b>2</b><h2>Seller verification</h2><p>Sellers submit shop, location, pincode and documents before they can publish live listings.</p></div><div class="page-card process-card"><b>3</b><h2>Clean product details</h2><p>Machinery asks for machine details. Spare parts ask for compatibility, dimensions, size, weight and part details.</p></div><div class="page-card process-card"><b>4</b><h2>Delivery decision</h2><p>Spare parts can move through courier partners. Heavy machinery needs seller delivery, buyer pickup or road transport quote.</p></div></section>`;
  }
  function supportPage(){
    return `<section class="contact-grid premium-info-grid"><div class="page-card contact-card"><span class="eyebrow">Support Centre</span><h1>AI help plus admin-backed marketplace support.</h1><p class="muted">Use support for verification, listing issues, assisted listing requests, delivery choices, orders, payments or product questions.</p><div class="support-list"><div><b>Buyer help</b><span>Finding products, cart, checkout and delivery support.</span></div><div><b>Seller help</b><span>Verification, listing approval, pricing, dimensions and images.</span></div><div><b>Email support</b><span>${SUPPORT_EMAIL}</span></div></div><div class="contact-actions"><a class="primary" href="mailto:${SUPPORT_EMAIL}">Email Support</a><button class="ghost" data-route="contact">Contact Form</button></div></div><div class="page-card ai-support-card"><h2>AI Support Bot</h2><p class="muted">Ask quick marketplace questions. For real disputes or verification, send the support form so admin receives the record.</p><form id="supportBotForm" class="form"><select name="topic"><option value="seller">Seller verification</option><option value="listing">Product listing</option><option value="delivery">Delivery and transport</option><option value="buyer">Buyer safety</option><option value="commission">Fees and commission</option></select><textarea name="question" placeholder="Type your question"></textarea><button class="primary">Ask AI Help</button></form><div id="supportBotAnswer" class="support-bot-answer">Choose a topic and ask a question.</div></div><div class="page-card"><h2>Common questions</h2><div class="faq"><details open><summary>Can anyone sell?</summary><p>No. Sellers must login and submit verification first. Admin approval is required before selling.</p></details><details><summary>Can I sell machinery and spare parts?</summary><p>Yes. Choose Machinery or Spare Part on the sell page, then fill the correct detail fields.</p></details><details><summary>How are heavy machines delivered?</summary><p>Heavy machinery should use seller delivery, buyer pickup or road transport quote. Courier delivery is mainly for spare parts.</p></details></div></div></section>`;
  }
  async function sendContact(form){ const fd=new FormData(form); const text=`Support request from ${fd.get('name')} (${fd.get('phone')}): ${fd.get('topic')} - ${fd.get('message')}`; localStorage.hp_last_contact=text; if(sb){ await sb.from('contact_messages').insert({name:fd.get('name'),phone:fd.get('phone'),topic:fd.get('topic'),message:fd.get('message')}); await sendAdminNotice('support_request','New support request', text, {topic:fd.get('topic'),name:fd.get('name'),phone:fd.get('phone'),message:fd.get('message')}); } toast('Support request saved. We will reply by email/support record.'); form.reset(); }
  function supportBotReply(topic, question=''){
    const q=String(question||'').trim();
    const replies={
      seller:'Seller verification needs seller/business name, phone, state, district, city, pincode, pickup address, Aadhaar photos and stock/shop photo. Admin reviews it before selling is enabled.',
      listing:'For machinery, add brand, model, hours/year if known, condition, weight, location and clear photos. For spare parts, add part number, compatibility, size, dimensions, material and weight.',
      delivery:'Small spare parts can be handled by courier partners after pincode serviceability. Start with Shiprocket or Blue Dart for COD spare-part parcels, and use Delhivery PTL/FTL or a truck-booking service such as Porter for heavy machinery quotes. Heavy machines should use seller delivery, buyer pickup or road transport at an estimated Rs. 60/km until a transport partner is connected.',
      buyer:'Always inspect high-value used machines, confirm ownership/documents, ask for fresh photos/videos and keep payment/order records inside the platform wherever possible.',
      commission:'Launch commission is slab-based: 3.5% under Rs. 5,000, 3% under Rs. 10,000, 2.5% under Rs. 1 lakh, 2% under Rs. 3 lakh, 1.5% under Rs. 10 lakh and 1% above Rs. 10 lakh.'
    };
    return `${replies[topic]||replies.buyer}${q?' If this is urgent, send the contact form with product/order ID so admin can review it.':''}`;
  }

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
        if(type==='messages' || type==='all') await loadMessages();
        if(isAdminUser() && state.route==='admin') await loadAdminProData();
        if(['home','market','account','admin','sell','orders','messages'].includes(state.route) && !shouldHoldRender()) render();
      }catch(e){ console.warn('realtime refresh skipped', e); }
    };
    try{
      sb.channel('hp-realtime-v88')
        .on('postgres_changes',{event:'*',schema:'public',table:'products'},()=>refreshVisible('products'))
        .on('postgres_changes',{event:'*',schema:'public',table:'sellers'},()=>refreshVisible('all'))
        .on('postgres_changes',{event:'*',schema:'public',table:'orders'},()=>refreshVisible('finance'))
        .on('postgres_changes',{event:'*',schema:'public',table:'membership_purchases'},()=>refreshVisible('all'))
        .on('postgres_changes',{event:'*',schema:'public',table:'seller_ledger'},()=>refreshVisible('finance'))
        .on('postgres_changes',{event:'*',schema:'public',table:'seller_balances'},()=>refreshVisible('finance'))
        .on('postgres_changes',{event:'*',schema:'public',table:'seller_payout_requests'},()=>refreshVisible('finance'))
        .on('postgres_changes',{event:'*',schema:'public',table:'site_carousel_slides'},()=>refreshVisible('site'))
        .on('postgres_changes',{event:'INSERT',schema:'public',table:'messages'},async(payload)=>{ await loadMessages(); if(payload?.new?.receiver_id===state.user?.id){ toast('New message received'); if(!shouldHoldRender()) render(); } })
        .subscribe();
    }catch(e){}
    setInterval(async()=>{ await refreshVisible(isAdminUser()?'all':'finance'); }, 25000);
  }
  function moneyCounter(n){ return `<b class="live-money" data-money="${Number(n||0)}">${money(n)}</b>`; }
  function payoutMethodLabel(a=state.finance.payoutAccount){ if(!a) return 'Not added'; return a.payout_method==='bank'?'Bank transfer':'UPI'; }
  function accountBalanceCard(){
    const b=state.finance.balance||{}; const reqs=state.finance.payoutRequests||[]; const next=(state.finance.ledger||[]).find(x=>x.available_on)?.available_on;
    return `<div class="page-card money-card"><div class="section-head compact"><h2>Seller balance</h2><span class="badge live-badge">Live</span></div><div class="money-grid"><div><small>Available / pending payout</small>${moneyCounter(b.available_balance||b.pending_balance||0)}</div><div><small>Paid till now</small>${moneyCounter(b.paid_balance||0)}</div><div><small>Platform fee deducted</small>${moneyCounter(b.platform_fee_total||0)}</div></div><p class="muted">Money comes to platform account first. Your seller amount is payout amount after platform commission. Standard payout target: within 7 business days${next?' around '+payoutDateText(next):''}.</p><div class="quick-grid"><button class="secondary" id="requestPayoutBtn">Request payout</button><button class="ghost" data-route="membership">Seller plans</button></div>${reqs.slice(0,3).map(r=>`<div class="payout-row"><b>${money(r.amount)}</b><span>${esc(r.status)} • ${payoutDateText(r.created_at)}</span></div>`).join('')}</div>`;
  }
  function payoutAccountCard(){
    const a=state.finance.payoutAccount||{}; const method=a.payout_method||'upi';
    return `<div class="page-card payout-card"><div class="section-head compact"><h2>Payout method</h2><span class="badge">${esc(payoutMethodLabel(a))}</span></div><p class="muted">Choose where admin should send your seller payout: UPI or bank account.</p><form id="payoutAccountForm" class="form payout-form"><select name="payout_method"><option value="upi" ${method==='upi'?'selected':''}>UPI</option><option value="bank" ${method==='bank'?'selected':''}>Bank account</option></select><input name="account_holder_name" placeholder="Account holder name" value="${esc(a.account_holder_name||state.profile?.full_name||'')}"><input name="upi_id" placeholder="UPI ID, e.g. name@upi" value="${esc(a.upi_id||'')}"><input name="bank_name" placeholder="Bank name" value="${esc(a.bank_name||'')}"><input name="account_number" placeholder="Account number" value="${esc(a.account_number||'')}"><input name="ifsc" placeholder="IFSC code" value="${esc(a.ifsc||'')}"><button class="primary">Save payout details</button></form></div>`;
  }
  async function savePayoutAccount(form){
    if(!state.user||!sb) return toast('Please login first. If this continues, contact support.');
    const fd=new FormData(form); const method=fd.get('payout_method');
    const payload={user_id:state.user.id,payout_method:method,account_holder_name:fd.get('account_holder_name'),upi_id:fd.get('upi_id'),bank_name:fd.get('bank_name'),account_number:fd.get('account_number'),ifsc:String(fd.get('ifsc')||'').toUpperCase(),updated_at:new Date().toISOString()};
    if(method==='upi' && !payload.upi_id) return toast('Enter UPI ID');
    if(method==='bank' && (!payload.account_number || !payload.ifsc || !payload.account_holder_name)) return toast('Enter bank account holder, account number and IFSC');
    const {error}=await sb.from('seller_payout_accounts').upsert(payload,{onConflict:'user_id'});
    if(error) return toast('Payout setup is not ready yet. Please contact support.');
    await loadFinanceData(); toast('Payout details saved'); render();
  }
  async function requestPayout(){
    if(!state.user||!sb) return toast('Login first');
    const b=state.finance.balance||{}; const amount=Number(b.available_balance||b.pending_balance||0);
    if(amount<=0) return toast('No payout balance yet');
    const a=state.finance.payoutAccount; if(!a) return toast('Save UPI or bank payout details first');
    const payload={user_id:state.user.id,amount,status:'requested',payout_method:a.payout_method,upi_id:a.upi_id,account_holder_name:a.account_holder_name,bank_name:a.bank_name,account_number:a.account_number,ifsc:a.ifsc};
    const {error}=await sb.from('seller_payout_requests').insert(payload);
    if(error) return toast('Payout request could not be created. Please contact support.');
    await sb.from('seller_ledger').update({status:'payout_requested',updated_at:new Date().toISOString()}).eq('seller_id',state.user.id).in('status',['pending_clearance','available']);
    await loadFinanceData(); toast('Payout request sent to admin'); render();
  }

  function cartPage(){ const totals=getTotals(); return `<section class="checkout-grid"><div class="page-card"><h1>Your Cart</h1>${state.cart.map(item=>`<div class="cart-item"><img src="${item.image}" onerror="this.src='${placeholder(item.category)}'"><div><b>${item.title}</b><p class="muted">${money(item.price)} × ${item.qty}</p></div><div class="qty"><button onclick="HP.changeQty('${item.id}',-1)">−</button><b>${item.qty}</b><button onclick="HP.changeQty('${item.id}',1)">+</button><button class="danger" onclick="HP.removeCart('${item.id}')">Remove</button></div></div>`).join('')||empty('Cart is empty. Add products to continue.')}</div><aside class="summary-card"><h2>Order summary</h2>${summaryRows(totals)}<button class="primary" style="width:100%" data-route="checkout">Proceed to Checkout</button></aside></section>`; }
  function getTotals(method='standard', km=0, couponCode=''){ const subtotal=state.cart.reduce((s,i)=>s+Number(i.price||0)*Number(i.qty||1),0); const shipping=shippingFee(subtotal,method,km); const pf=platformFee(subtotal); const discount=couponDiscount(couponCode, subtotal); const total=Math.max(0,subtotal+shipping+pf-discount.amount); return {subtotal,shipping,pf,discount:discount.amount,coupon:discount,total,method,km}; }
  function summaryRows(t){ return `<div class="summary-row"><span>Subtotal</span><b>${money(t.subtotal)}</b></div><div class="summary-row"><span>Delivery / logistics</span><b>${t.shipping?money(t.shipping):(t.method==='seller_delivery'?'Seller quote later':t.method==='buyer_pickup'?'Buyer pickup':'To confirm')}</b></div><div class="summary-row"><span>Platform protection fee</span><b>${money(t.pf)}</b></div>${t.discount?`<div class="summary-row coupon-row"><span>Coupon ${esc(t.coupon.code)}</span><b>- ${money(t.discount)}</b></div>`:''}<div class="summary-row"><span>Total</span><b>${money(t.total)}</b></div><small class="muted">${esc(t.coupon?.label||'Commission and buyer fee use slabs from 3.5% down to 1%.')}</small>`; }
  function checkoutPage(){
    const heavy=cartHasHeavyItems();
    const method=heavy?'seller_delivery':'standard';
    const totals=getTotals(method);
    const couponHints=Object.values(COUPONS).map(c=>`<span>${c.code}: ${c.label}</span>`).join('');
    return `<section class="checkout-grid"><div class="page-card"><h1>Secure Checkout</h1><div class="notice">Spare parts can be shipped by courier after pincode serviceability. Heavy machinery should use seller delivery, buyer pickup or road transport quote; courier delivery is not promised for combines, trolleys, tractors or trailers.</div><form id="checkoutForm" class="form"><input name="name" placeholder="Full name" required><input name="phone" placeholder="Phone number" required><input name="address" placeholder="Complete delivery address" required><input name="pincode" placeholder="Delivery pincode" inputmode="numeric" required><select name="shipping">${heavy?`<option value="seller_delivery" selected>Heavy item: seller delivery quote later</option><option value="road_transport">Road transport estimate at Rs. ${ROAD_TRANSPORT_RATE_PER_KM}/km</option><option value="buyer_pickup">Buyer pickup / own transport</option>`:`<option value="standard" selected>Standard courier for spare parts</option><option value="express_courier">Express courier / premium partner</option><option value="seller_delivery">Seller delivery quote later</option>`}</select><input name="distance_km" inputmode="numeric" placeholder="Distance in km for road transport only"><div class="coupon-apply-row"><input name="coupon" placeholder="Coupon code, e.g. NEWUSER10"><button id="applyCouponBtn" class="secondary" type="button">Apply</button></div><div class="coupon-hints">${couponHints}</div><button class="primary">Place Secure Order</button></form></div><aside class="summary-card"><h2>Payment Summary</h2><div id="checkoutSummary">${summaryRows(totals)}</div><p class="muted">Payments are processed through the available secure payment method.</p></aside></section>`;
  }
  function updateCheckoutSummary(celebrate=false){
    const form=$('#checkoutForm'); if(!form) return;
    const fd=new FormData(form);
    const totals=getTotals(fd.get('shipping')||'standard', Number(fd.get('distance_km')||0), fd.get('coupon')||'');
    const wrap=$('#checkoutSummary'); if(wrap) wrap.innerHTML=localizeHtml(summaryRows(totals));
    if(celebrate){
      if(totals.discount>0) showCouponCelebration(totals.coupon.code, totals.discount);
      else toast(totals.coupon.label || 'Coupon not valid for this cart');
    }
  }
  function showCouponCelebration(code, amount){
    if(!code || !amount) return;
    document.querySelector('.coupon-pop')?.remove();
    const pop=document.createElement('div');
    pop.className='coupon-pop';
    pop.innerHTML=`<div class="confetti"><i></i><i></i><i></i><i></i><i></i><i></i></div><b>${esc(code)} applied</b><span>You saved ${money(amount)}</span>`;
    document.body.appendChild(pop);
    setTimeout(()=>pop.classList.add('show'),20);
    setTimeout(()=>pop.remove(),2600);
  }
  async function placeOrder(form){
    if(!state.user)return route('login');
    if(!state.cart.length)return toast('Cart is empty');
    const fd=new FormData(form); const totals=getTotals(fd.get('shipping'), Number(fd.get('distance_km')||0), fd.get('coupon')||'');
    const paidId=form.dataset.razorpayPaid || '';
    if(hasRazorpayKey() && !paidId){
      await openRazorpayPayment({amount:totals.total,description:'Harvester Parts order',prefill:{name:fd.get('name')||'',contact:fd.get('phone')||'',email:state.user.email||''},handler:async(resp)=>{ form.dataset.razorpayPaid=resp.razorpay_payment_id||'razorpay_paid'; await placeOrder(form); }});
      return;
    }
    const payoutDue=sevenBusinessDaysFrom();
    const order={buyer_id:state.user.id,user_id:state.user.id,amount:totals.total,shipping_amount:totals.shipping,platform_fee:totals.pf,status:paidId?'paid':'pending',payment_id:paidId||'manual_pending',buyer_name:fd.get('name'),buyer_phone:fd.get('phone'),address:fd.get('address'),pincode:fd.get('pincode'),shipping_method:fd.get('shipping'),coupon_code:totals.coupon?.code||'',coupon_discount:totals.discount||0,seller_payout_total:0,platform_commission_total:0,payout_status:'pending',expected_payout_at:payoutDue.toISOString()};
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
      if(res.error && /seller_payout_total|platform_commission_total|payout_status|expected_payout_at|payment_id/i.test(String(res.error.message||''))){
        const fallback={...order}; ['seller_payout_total','platform_commission_total','payout_status','expected_payout_at','payment_id','shipping_method','coupon_code','coupon_discount'].forEach(k=>delete fallback[k]);
        res=await sb.from('orders').insert(fallback).select().single();
      }
      if(res.error) return toast(res.error.message);
      inserted=res.data; orderId=inserted.id;
      const items=itemRows.map(i=>({...i,order_id:orderId}));
      let itemRes=await sb.from('order_items').insert(items);
      if(itemRes.error && /seller_user_id|platform_commission|seller_amount|payout_status/i.test(String(itemRes.error.message||''))){
        const fallbackItems=items.map(i=>({order_id:i.order_id,product_id:i.product_id,quantity:i.quantity,price:i.price}));
        await sb.from('order_items').insert(fallbackItems);
        toast('Order saved. Seller payout record will be updated by admin.');
      } else if(itemRes.error){ return toast(itemRes.error.message); }
      if(ledgerRows.length){
        const ledgers=ledgerRows.map(l=>({...l,order_id:orderId}));
        const lg=await sb.from('seller_ledger').insert(ledgers);
        if(!lg.error){ await refreshSellerBalancesFromLedger(ledgers); }
      }
    }
    localStorage.hp_last_order=orderId; state.cart=[]; saveCart(); toast(paidId?'Payment successful. Order placed.':'Order saved. Razorpay was not available for this payment.'); route('orders');
  }
  function changeQty(id,delta){ const it=state.cart.find(i=>String(i.id)===String(id)); if(!it)return; it.qty+=delta; if(it.qty<=0)state.cart=state.cart.filter(i=>String(i.id)!==String(id)); saveCart(); render(); }
  function removeCart(id){ state.cart=state.cart.filter(i=>String(i.id)!==String(id)); saveCart(); render(); }
  function countryOptions(){
    const list = [
      ['+91','🇮🇳 India'],['+1','🇺🇸 United States / Canada'],['+44','🇬🇧 United Kingdom'],['+61','🇦🇺 Australia'],['+971','🇦🇪 UAE'],['+966','🇸🇦 Saudi Arabia'],['+974','🇶🇦 Qatar'],['+965','🇰🇼 Kuwait'],['+968','🇴🇲 Oman'],['+973','🇧🇭 Bahrain'],['+92','🇵🇰 Pakistan'],['+880','🇧🇩 Bangladesh'],['+977','🇳🇵 Nepal'],['+94','🇱🇰 Sri Lanka'],['+60','🇲🇾 Malaysia'],['+65','🇸🇬 Singapore'],['+66','🇹🇭 Thailand'],['+62','🇮🇩 Indonesia'],['+63','🇵🇭 Philippines'],['+49','🇩🇪 Germany'],['+33','🇫🇷 France'],['+39','🇮🇹 Italy'],['+34','🇪🇸 Spain'],['+31','🇳🇱 Netherlands'],['+27','🇿🇦 South Africa'],['+254','🇰🇪 Kenya'],['+234','🇳🇬 Nigeria'],['+81','🇯🇵 Japan'],['+82','🇰🇷 South Korea'],['+86','🇨🇳 China']
    ];
    return list.map(([code,label])=>`<option value="${code}" ${code==='+91'?'selected':''}>${label} ${code}</option>`).join('');
  }

  const INDIA_STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Andaman and Nicobar Islands','Chandigarh','Dadra and Nagar Haveli and Daman and Diu','Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry'];
  function stateOptions(selected=''){
    return `<option value="">Select State</option>` + INDIA_STATES.map(st=>`<option value="${esc(st)}" ${String(selected)===st?'selected':''}>${esc(st)}</option>`).join('');
  }
  function formDraft(key){ try{return JSON.parse(localStorage.getItem('hp_'+key)||sessionStorage.getItem('hp_'+key)||'{}')}catch(e){return {}} }
  function bindFormDraft(formId,key){
    const form=document.getElementById(formId); if(!form) return;
    const saved=formDraft(key);
    [...form.elements].forEach(el=>{
      if(!el.name || el.type==='file' || el.type==='password') return;
      if(saved[el.name] !== undefined && !el.value) el.value = saved[el.name];
      if((el.type==='radio'||el.type==='checkbox') && saved[el.name] !== undefined) el.checked = String(saved[el.name]) === String(el.value);
    });
    form.addEventListener('input',()=>saveFormDraft(form,key));
    form.addEventListener('change',()=>saveFormDraft(form,key));
  }
  function saveFormDraft(form,key){
    const data={};
    [...form.elements].forEach(el=>{ if(el.name && el.type!=='file' && el.type!=='password'){ if(el.type==='radio'){ if(el.checked) data[el.name]=el.value; } else data[el.name]=el.value; }});
    localStorage.setItem('hp_'+key, JSON.stringify(data));
    sessionStorage.setItem('hp_'+key, JSON.stringify(data));
  }
  function clearFormDraft(key){ sessionStorage.removeItem('hp_'+key); localStorage.removeItem('hp_'+key); }
  function isUserEditing(){ const el=document.activeElement; return !!el && ['INPUT','TEXTAREA','SELECT'].includes(el.tagName); }
  function shouldHoldRender(){ return isUserEditing() || !!document.querySelector('#sellForm,#sellerVerifyForm,#loginForm,#profileForm'); }

  function loginPage(){
    const phoneBlock = PHONE_OTP_ENABLED ? `<div class="phone-login"><h3>Mobile OTP Login</h3><p class="muted tiny-note">Choose country code, then enter your mobile number.</p><div class="phone-row"><select id="countryCodeSelect" data-no-translate aria-label="Country code">${countryOptions()}</select><input id="phoneOtpInput" type="tel" inputmode="tel" autocomplete="tel-national" placeholder="Mobile number"></div><button class="ghost" id="sendOtpBtn">Send OTP</button><input id="otpCodeInput" inputmode="numeric" autocomplete="one-time-code" maxlength="8" placeholder="OTP code"><button class="secondary" id="verifyOtpBtn">Verify OTP</button></div>` : ``;
    return `<section class="page-card auth-card"><h1>Login / Create Account</h1><p class="muted auth-intro">Use email/password or Google to continue. Seller verification and orders stay linked to your account.</p><form id="loginForm" class="form"><input name="email" type="email" autocomplete="email" placeholder="Email" required><input name="password" type="password" autocomplete="current-password" placeholder="Password" required><button class="primary">Login</button><button type="button" class="ghost" id="signupSwitch">Create new account</button><button type="button" class="link-btn" id="forgotBtn">Forgot password?</button></form><div class="auth-divider"><span>or</span></div><button class="google-btn" id="googleLoginBtn">Continue with Google</button>${phoneBlock}</section>`;
  }
  

  function membershipMiniCard(){
    const plan=activePlan();
    return `<div class="page-card membership-mini-card"><div class="section-head compact"><h2>Membership</h2><span class="badge ${plan?'owner':''}">${plan?'Active':'Free'}</span></div>${plan?`<div class="mini-plan-banner"><b>${esc(plan.title)}</b><span>${esc(plan.banner)} • expires ${membershipExpiryText()||'soon'}</span></div><div class="rank-ways"><div><b>${plan.boost}</b><span>boost days</span></div><div><b>${limitLabel(plan.listings)}</b><span>listing limit</span></div><div><b>${plan.reward}</b><span>reward pts</span></div><div><b>${money(plan.price)}</b><span>value</span></div></div>`:`<p class="muted">Free launch plan gives 10 listings with transparent slab commission. Upgrade from ₹19 for more listings, boosts and badges.</p>`}<button class="primary" data-route="membership">${plan?'Upgrade Plan':'Seller Plans'}</button><button class="ghost" data-route="rewards">Badges & titles</button></div>`;
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
    return `<section class="profile-page">${userBanner()}<div class="profile-cover page-card ${isAdmin?'founder-profile-cover':''}"><div class="profile-avatar"><img src="./logo-192.png" alt="Harvester Parts"><span>${avatarText}</span></div><div class="profile-main"><div class="profile-title-row"><div data-no-translate><h1>${esc(fullName)}</h1><p>${esc(email)}</p></div><span class="badge ${isAdmin?'owner':'verified'}">${esc(role)}</span></div><div class="profile-id"><span data-no-translate>${esc(uid)}</span> • <span>${esc(rank.title)}</span> • <span>${esc(sellerStatus)}</span></div><div class="profile-stats"><div><b>${myProducts.length}</b><span>Listings</span></div><div><b>${approvedListings}</b><span>Live</span></div><div><b>${pts>=999999?'MAX':pts}</b><span>Points</span></div><div><b>${earnedBadges().length}</b><span>Badges</span></div></div><div class="profile-actions"><button class="primary" data-route="sell">Sell a Part</button><button class="ghost" data-route="orders">My Orders</button>${isAdmin?'<button class="secondary" data-route="admin">Admin Panel</button>':''}</div></div></div><div class="profile-grid"><div class="page-card profile-edit-card"><h2>Profile details</h2><p class="muted">Keep your buyer and seller profile updated for faster support and verification.</p><form id="profileForm" class="form profile-form"><input name="full_name" value="${esc(profileName)}" placeholder="Full name"><input name="phone" type="tel" value="${esc(phone)}" placeholder="Phone number"><select name="gender"><option value="">Gender</option><option ${state.profile?.gender==='Male'?'selected':''}>Male</option><option ${state.profile?.gender==='Female'?'selected':''}>Female</option><option ${state.profile?.gender==='Other'?'selected':''}>Other</option></select><button class="primary">Save Profile</button></form></div><div class="page-card profile-info-card"><h2>Account overview</h2><div class="info-list"><div><span>User ID</span><b data-no-translate>${esc(uid)}</b></div><div><span>Email</span><b data-no-translate>${esc(email)}</b></div><div><span>Phone</span><b>${esc(phone || 'Not added')}</b></div><div><span>Seller status</span><b>${esc(sellerStatus)}</b></div><div><span>Pending listings</span><b>${pendingListings}</b></div></div></div>${rankProgressCard()}${membershipMiniCard()}${accountBalanceCard()}${payoutAccountCard()}${badgeCollectionCard()}<div class="page-card profile-info-card"><h2>Quick tools</h2><div class="quick-grid"><button class="ghost" data-route="market">Enter Marketplace</button><button class="ghost" data-route="messages">Chat</button><button class="ghost" data-route="cart">Cart</button><button class="ghost" data-route="contact">Contact Support</button>${state.seller?.status==='approved'||isAdmin?'<button class="secondary" data-route="sell">Add New Listing</button>':'<button class="secondary" data-route="sell">Become Verified Seller</button>'}</div></div>${eventPreviewCard()}<div class="page-card profile-info-card"><h2>Trust & safety</h2><p class="muted">Use website chat and checkout so orders, seller approvals and support history stay protected inside Harvester Parts.</p><div class="trust-pills"><span>Verified sellers</span><span>Admin review</span><span>Secure orders</span></div></div></div></section>`;
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
    const d=formDraft('sellerVerifyDraft');
    return `<form id="sellerVerifyForm" class="form seller-verify-form"><input name="business_name" value="${esc(d.business_name||'')}" placeholder="Business / seller name" required><input name="phone" value="${esc(d.phone||state.profile?.phone||state.user?.phone||'')}" placeholder="Phone number" inputmode="tel" autocomplete="tel" required><select name="state" required>${stateOptions(d.state||'')}</select><input name="district" value="${esc(d.district||'')}" placeholder="District" required><input name="city" value="${esc(d.city||'')}" placeholder="City / village" required><input name="pincode" value="${esc(d.pincode||'')}" placeholder="Pickup pincode" inputmode="numeric" maxlength="6" required><textarea name="address" placeholder="Pickup / shop address">${esc(d.address||'')}</textarea><div class="doc-upload-grid"><label class="file-label">Aadhaar front photo<input name="aadhaar_front" type="file" accept="image/*,application/pdf" required></label><label class="file-label">Aadhaar back photo<input name="aadhaar_back" type="file" accept="image/*,application/pdf" required></label><label class="file-label">Shop / stock photo<input name="shop_photo" type="file" accept="image/*,application/pdf"></label></div><div class="notice tiny-note">Upload clear document photos. Only admin can view seller verification files.</div><button class="primary">Submit Seller Verification</button></form>`;
  }
  function sellPage(){
    if(!state.user)return loginPage();
    const gate=sellerStatusCard();
    if(gate) return gate;
    const used=userListingCount(); const limit=currentListingLimit();
    const d=formDraft('sellFormDraft');
    return `<section class="page-card sell-head"><span class="eyebrow">Approved seller</span><h1>Sell machinery or spare parts.</h1><p class="muted">Choose Machinery or Spare Part first. The form changes so buyers get the right details. You can list yourself or request assisted listing for ${money(ASSISTED_LISTING_FEE)} per item.</p><div class="sell-limit-note"><span>Listings used: ${used}/${limitLabel(limit)}</span><small>${esc(feeDiscountForPlan(activePlan()))}</small></div></section><section class="page-card"><form id="sellForm" class="form sell-form"><div class="sell-type-grid" role="radiogroup" aria-label="What are you selling?"><label class="sell-type-card active" data-sell-card="machine"><input type="radio" name="sell_type" value="machine" checked><span class="sell-dot"></span><span><b>Machinery</b><small>Combine harvester, tractor, trolley, seed drill, straw reaper, implements</small></span></label><label class="sell-type-card" data-sell-card="spare"><input type="radio" name="sell_type" value="spare"><span class="sell-dot"></span><span><b>Spare Part</b><small>Belts, bearings, blades, shafts, gears, hydraulic parts and exact fitment</small></span></label></div><div class="assist-choice"><label><input type="radio" name="listing_service" value="self" ${d.listing_service!=='assisted'?'checked':''}> <b>I will fill and manage this listing</b><span>Free self listing</span></label><label><input type="radio" name="listing_service" value="assisted" ${d.listing_service==='assisted'?'checked':''}> <b>Harvester Parts should help list it</b><span>${money(ASSISTED_LISTING_FEE)} assisted listing request</span></label></div><select name="condition" required><option value="New">New</option><option value="Used" selected>Used</option><option value="Refurbished">Refurbished</option><option value="Factory Stock">Factory Stock</option></select><input name="title" value="${esc(d.title||'')}" placeholder="Product name" required><input name="price" value="${esc(formatINRInput(d.price)||'')}" inputmode="numeric" placeholder="Listing price, e.g. 1,25,000" required><select name="category" id="sellCategorySelect" required>${categoryOptionsFor('machine')}</select><input name="brand" value="${esc(d.brand||'')}" placeholder="Brand / company"><input name="model" value="${esc(d.model||'')}" placeholder="Model / compatibility"><div class="sell-dynamic-section machine-fields"><h3>Machinery details</h3><input name="machine_year" value="${esc(d.machine_year||'')}" placeholder="Year / hours used, if known"><input name="engine_hp" value="${esc(d.engine_hp||'')}" placeholder="HP / capacity / attachment details"><input name="machine_delivery_note" value="${esc(d.machine_delivery_note||'')}" placeholder="Seller delivery or buyer pickup note"></div><div class="sell-dynamic-section spare-fields"><h3>Spare part details</h3><input name="part_number" value="${esc(d.part_number||'')}" placeholder="Part number / code"><input name="compatible_machine" value="${esc(d.compatible_machine||'')}" placeholder="Compatible machine, brand or model"><input name="dimensions" value="${esc(d.dimensions||'')}" placeholder="Dimensions L x W x H, size or belt/bearing number"><input name="material" value="${esc(d.material||'')}" placeholder="Material / grade / teeth / blade size"></div><input name="weight_kg" value="${esc(d.weight_kg||'')}" type="number" step="0.1" placeholder="Weight kg"><select name="state" required>${stateOptions(d.state||'')}</select><input name="district" value="${esc(d.district||'')}" placeholder="District" required><input name="city" value="${esc(d.city||'')}" placeholder="City / village" required><input name="pincode" value="${esc(d.pincode||'')}" placeholder="Pickup pincode" inputmode="numeric" maxlength="6"><textarea name="description" placeholder="Describe condition, exact location, compatibility, dimensions and delivery details">${esc(d.description||'')}</textarea><label class="file-label">Product photos<input name="images" type="file" accept="image/*" multiple></label><div class="notice" id="sellerFeePreview">Enter price to preview your slab commission and payout.</div><button class="primary">Publish Listing</button></form></section>${sellerListingsPanel()}`;
  }

  function sellerListingsPanel(){
    if(!state.user) return '';
    const rows=myProducts().sort((a,b)=>new Date(b.created_at||0)-new Date(a.created_at||0));
    if(!rows.length) return `<section class="page-card my-listings-panel"><div class="section-head compact"><h2>My listings</h2><span class="badge">0</span></div><p class="muted">Your listings will appear here after you publish them.</p></section>`;
    return `<section class="page-card my-listings-panel"><div class="section-head compact"><h2>My listings</h2><span class="badge">${rows.length}</span></div><div class="seller-listing-list">${rows.map(p=>`<div class="seller-listing-row"><img src="${productImage(p)}" onerror="this.src='${placeholder(p.category)}'"><div><b>${esc(p.title||'Product')}</b><span>${money(p.price)} • ${esc(p.category||'Product')} • ${esc(p.status||'approved')}</span></div><div class="seller-listing-actions"><button class="ghost" onclick="HP.route('product',{id:'${esc(p.id)}'})">Open</button><button class="danger" onclick="HP.deleteOwnProduct('${esc(p.id)}')">Delete</button></div></div>`).join('')}</div></section>`;
  }
  async function submitSellerVerification(form){
    if(!state.user)return route('login');
    const fd=new FormData(form); let aadhaar_front='', aadhaar_back='', shop_photo='';
    async function uploadDoc(field){ const f=fd.get(field); if(!sb||!f||!f.name)return ''; const safeName=f.name.replace(/[^a-z0-9.]/gi,'-'); const path=`${state.user.id}/${field}-${Date.now()}-${safeName}`; const {error}=await sb.storage.from('verification-docs').upload(path,f,{upsert:true}); if(error){ toast(error.message); return ''; } return path; }
    aadhaar_front=await uploadDoc('aadhaar_front'); aadhaar_back=await uploadDoc('aadhaar_back'); shop_photo=await uploadDoc('shop_photo');
    const payload={user_id:state.user.id,business_name:fd.get('business_name'),phone:fd.get('phone'),state:fd.get('state'),district:fd.get('district'),city:fd.get('city'),pincode:fd.get('pincode'),address:fd.get('address'),aadhaar_front,aadhaar_back,shop_photo,status:'pending',verification_status:'pending'};
    if(sb){
      let {error}=await sb.from('sellers').upsert(payload,{onConflict:'user_id'});
      if(error && /aadhaar_back|pincode/i.test(String(error.message||''))){
        const fallback={...payload}; delete fallback.aadhaar_back;
        if(/pincode/i.test(String(error.message||''))) delete fallback.pincode;
        const res=await sb.from('sellers').upsert(fallback,{onConflict:'user_id'}); error=res.error;
        if(error) return toast(error.message);
        toast('Seller request saved. Aadhaar back storage is not enabled yet.');
      } else if(error) return toast(error.message);
    }
    clearFormDraft('sellerVerifyDraft'); state.seller=payload; await sendAdminNotice('seller_verification','New seller verification request', `${payload.business_name||'Seller'} submitted verification from ${payload.city||''}, ${payload.state||''}`, payload); toast('Seller verification submitted for admin approval'); render();
  }
  async function submitProduct(form){
    if(!state.user)return route('login');
    if(!isSellerApproved()) return toast('Seller verification must be approved before listing.');
    const limit=currentListingLimit(); const used=userListingCount();
    if(used>=limit){ toast(`Your ${activePlan()?.name||'Free'} plan allows ${limitLabel(limit)} listings. Upgrade to list more.`); setTimeout(()=>route('membership'),700); return; }
    const fd=new FormData(form); const price=parsePrice(fd.get('price'));
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
    const detailLines=[
      fd.get('sell_type')==='machine' && `Machinery details: Year/hours ${fd.get('machine_year')||'not added'}, HP/capacity ${fd.get('engine_hp')||'not added'}, delivery note ${fd.get('machine_delivery_note')||'not added'}`,
      fd.get('sell_type')==='spare' && `Spare part details: part number ${fd.get('part_number')||'not added'}, compatible machine ${fd.get('compatible_machine')||'not added'}, dimensions/size ${fd.get('dimensions')||'not added'}, material/grade ${fd.get('material')||'not added'}`,
      fd.get('pincode') && `Pickup pincode: ${fd.get('pincode')}`,
      fd.get('listing_service')==='assisted' && `Assisted listing requested: ${money(ASSISTED_LISTING_FEE)} per item.`
    ].filter(Boolean);
    const description=[fd.get('description'),...detailLines].filter(Boolean).join('\n\n');
    const payload={user_id:state.user.id,seller_id:state.seller?.id||null,sell_type:fd.get('sell_type')||'spare',condition:fd.get('condition')||'Used',title:fd.get('title'),price,category:fd.get('category'),brand:fd.get('brand'),model:fd.get('model'),weight_kg:Number(fd.get('weight_kg')||0),state:fd.get('state'),district:fd.get('district'),city:fd.get('city'),pincode:fd.get('pincode')||'',description,image_urls,status:'approved'};
    if(sb){
      let {error}=await sb.from('products').insert(payload);
      if(error && /seller_id|pincode/i.test(String(error.message||''))){ const fallback={...payload}; delete fallback.seller_id; delete fallback.pincode; const res=await sb.from('products').insert(fallback); error=res.error; }
      if(error)return toast(error.message);
      await loadProducts();
    } else{ payload.id='local-'+Date.now(); payload.status='approved'; state.products.unshift(payload); localStorage.hp_products=JSON.stringify(state.products); }
    if(fd.get('listing_service')==='assisted') await sendAdminNotice('assisted_listing','Assisted listing requested', `${state.profile?.full_name||state.user.email||'Seller'} requested assisted listing for ${fd.get('title')}`, {...payload, assisted_fee:ASSISTED_LISTING_FEE, pincode:fd.get('pincode')});
    clearFormDraft('sellFormDraft'); toast(fd.get('listing_service')==='assisted'?'Listing saved and assisted listing request sent to admin.':'Listing published. Admin can remove unsafe or incorrect items.'); route('market');
  }
  function messageRows(){
    const rows=(state.messages||[]).slice(0,30);
    if(!rows.length) return empty('No messages yet. Open a product and tap Message Seller to start.');
    return rows.map(m=>{
      const sent=String(m.sender_id)===String(state.user?.id);
      const p=(state.products||[]).find(x=>String(x.id)===String(m.product_id));
      const who=sent?'You':(m.sender?.full_name||m.sender?.email||m.receiver?.full_name||m.receiver?.email||'User');
      return `<div class="message-row ${sent?'sent':'received'}"><div><b>${esc(who)}</b><span>${p?esc(p.title):'Marketplace message'} • ${m.created_at?new Date(m.created_at).toLocaleString('en-IN'):''}</span><p>${esc(m.message||'')}</p></div>${!sent && !m.is_read?'<span class="badge owner">New</span>':''}</div>`;
    }).join('');
  }
  function messagesPage(){
    if(!state.user) return loginPage();
    const pid=state.currentProduct;
    const p=state.products.find(x=>String(x.id)===String(pid));
    const sellerName=p ? (p.sellers?.business_name || p.users?.full_name || p.users?.email || 'Seller') : '';
    const intro=p ? `You are messaging ${esc(sellerName)} about ${esc(p.title||'this listing')}.` : 'Use in-app chat for order and product questions.';
    const prefill=p ? `Hello, I am interested in ${p.title||'your product'} listed for ${money(p.price)}. Please confirm availability, condition and final price.` : '';
    return `<section class="page-card"><h1>Messages</h1><div class="notice">${intro}</div><form id="messageForm" class="form"><input name="to" value="${esc(sellerName)}" placeholder="Seller name" readonly><input type="hidden" name="product_id" value="${esc(pid||'')}"><textarea name="message" placeholder="Write message">${esc(prefill)}</textarea><button class="primary">Send Message</button></form></section><section class="page-card message-inbox"><div class="section-head compact"><h2>Message inbox</h2><span class="badge ${state.unreadMessages?'owner':''}">${state.unreadMessages} new</span></div>${messageRows()}</section>`;
  }
  async function loadMessages(){
    state.messages=[]; state.unreadMessages=0;
    if(!sb||!state.user) return;
    try{
      let {data,error}=await sb.from('messages').select('*, sender:sender_id(email,full_name), receiver:receiver_id(email,full_name), products(title)').or(`sender_id.eq.${state.user.id},receiver_id.eq.${state.user.id}`).order('created_at',{ascending:false}).limit(60);
      if(error){ const res=await sb.from('messages').select('*').or(`sender_id.eq.${state.user.id},receiver_id.eq.${state.user.id}`).order('created_at',{ascending:false}).limit(60); data=res.data; error=res.error; }
      if(!error && data){ state.messages=data; state.unreadMessages=data.filter(m=>String(m.receiver_id)===String(state.user.id) && !m.is_read).length; }
    }catch(e){}
  }
  function cleanMessage(m){ return String(m||'').replace(/\b\d{10}\b/g,'[phone blocked]').replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/ig,'[email blocked]').replace(/wa\.me|whatsapp/ig,'[contact link blocked]'); }
  async function sendAdminNotice(type, subject, body, payload={}){
    const notice={type,subject,body,payload,status:'unread',priority:'important',admin_email:ADMIN_ALERT_EMAIL,email_to:ADMIN_ALERT_EMAIL,created_at:new Date().toISOString()};
    if(cfg.ADMIN_ALERT_WEBHOOK){
      try{ await fetch(cfg.ADMIN_ALERT_WEBHOOK,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(notice)}); }catch(e){}
    }
    if(!sb) return;
    try{ await sb.from('admin_notifications').insert(notice); }catch(e){ try{ await sb.from('admin_notifications').insert({type,subject,body,payload,status:'unread',admin_email:ADMIN_EMAIL}); }catch(_e){} }
  }
  async function sendMsg(form){
    if(!state.user)return route('login');
    const fd=new FormData(form); const productId=fd.get('product_id')||''; const msg=cleanMessage(fd.get('message'));
    if(!msg.trim()) return toast('Write a message first');
    const product=state.products.find(p=>String(p.id)===String(productId));
    const receiverId=product?.user_id || null;
    if(!product || !receiverId) return toast('Open a product and tap Message Seller to start a seller chat.');
    if(product && String(receiverId)===String(state.user.id)) return toast('This is your own listing.');
    if(sb){
      const payload={sender_id:state.user.id,receiver_id:receiverId,product_id:productId,message:msg,is_read:false};
      const {error}=await sb.from('messages').insert(payload);
      if(error) return toast(error.message);
      if(receiverId){ await sendAdminNotice('buyer_message','New product message', `${state.profile?.full_name||state.user.email||'Buyer'} messaged ${product?.title||'a product'}`, {product_id:productId,seller_id:receiverId}); }
      await loadMessages();
    }
    toast('Message sent to seller'); form.reset(); render();
  }
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
  function adminNotificationsPanel(){
    if(!isAdminUser()) return '';
    const rows=(state.admin.notifications||[]).slice(0,12).map(n=>`<details class="admin-detail-card"><summary><div><b>${esc(n.subject||'Admin notification')}</b><p>${esc(n.body||'')}</p><small>${n.created_at?new Date(n.created_at).toLocaleString('en-IN'):''}</small></div><span class="badge ${n.status==='unread'?'owner':'verified'}">${esc(n.status||'new')}</span></summary><pre class="admin-json">${esc(JSON.stringify(n.payload||{},null,2))}</pre></details>`).join('');
    return `<section class="page-card admin-panel"><div class="section-head compact"><h2>Admin notifications</h2><span class="badge live-badge">Realtime</span></div><p class="muted">Seller verification requests, product messages and important platform actions appear here instantly.</p><div>${rows||empty('No notifications yet')}</div></section>`;
  }
  function adminAssistedListingPanel(){
    if(!isAdminUser()) return '';
    return `<section class="page-card admin-panel admin-assisted-panel"><div class="section-head compact"><h2>Add listing for user</h2><span class="badge owner">Admin tool</span></div><p class="muted">Use a user's auth UID or email. This creates a clean live listing for a seller when you are doing assisted listing work.</p><form id="adminListingForm" class="form admin-listing-form"><input name="user_ref" placeholder="User UID or registered email" required><select name="sell_type"><option value="machine">Machinery</option><option value="spare">Spare part</option></select><input name="title" placeholder="Product title" required><input name="price" inputmode="numeric" placeholder="Price, e.g. 25,000" required><select name="category">${AGRI_CATEGORIES.map(c=>`<option>${esc(c.title)}</option>`).join('')}</select><input name="brand" placeholder="Brand"><input name="model" placeholder="Model / compatibility"><input name="weight_kg" type="number" step="0.1" placeholder="Weight kg"><select name="state">${stateOptions('')}</select><input name="district" placeholder="District"><input name="city" placeholder="City / village"><input name="pincode" inputmode="numeric" maxlength="6" placeholder="Pickup pincode"><input name="image_url" placeholder="Image URL optional"><textarea name="description" placeholder="Description, dimensions, size and delivery note"></textarea><button class="primary">Create Listing for User</button></form></section>`;
  }
  async function submitAdminListingForUser(form){
    if(!isAdminUser()) return toast('Admin access required');
    const fd=new FormData(form);
    let userRef=String(fd.get('user_ref')||'').trim();
    if(!userRef) return toast('Enter user UID or email');
    if(sb && userRef.includes('@')){
      const {data}=await sb.from('users').select('auth_id,email').ilike('email',userRef).limit(1).maybeSingle();
      if(data?.auth_id) userRef=data.auth_id;
    }
    const description=[fd.get('description'), fd.get('pincode')?`Pickup pincode: ${fd.get('pincode')}`:'', `Created by admin as assisted listing. Fee: ${money(ASSISTED_LISTING_FEE)}.`].filter(Boolean).join('\n\n');
    const payload={user_id:userRef,sell_type:fd.get('sell_type')||'spare',condition:'Used',title:fd.get('title'),price:parsePrice(fd.get('price')),category:fd.get('category'),brand:fd.get('brand'),model:fd.get('model'),weight_kg:Number(fd.get('weight_kg')||0),state:fd.get('state'),district:fd.get('district'),city:fd.get('city'),pincode:fd.get('pincode')||'',description,image_urls:fd.get('image_url')?[fd.get('image_url')]:[],status:'approved'};
    if(!payload.price) return toast('Enter valid price');
    if(sb){ let {error}=await sb.from('products').insert(payload); if(error && /pincode/i.test(String(error.message||''))){ const fallback={...payload}; delete fallback.pincode; const res=await sb.from('products').insert(fallback); error=res.error; } if(error)return toast(error.message); await sendAdminNotice('admin_listing_created','Admin created assisted listing', `${state.user?.email||'Admin'} created ${payload.title} for ${userRef}`, payload); await loadAdminProData(); }
    else { payload.id='admin-'+Date.now(); state.products.unshift(payload); localStorage.hp_products=JSON.stringify(state.products); }
    form.reset(); toast('Listing created for user'); render();
  }

  function adminCarouselRows(){
    return (state.admin.siteSlides&&state.admin.siteSlides.length?state.admin.siteSlides:state.siteSlides).map(sl=>`<details class="admin-detail-card"><summary><div><b>${esc(sl.title||'Slide')}</b><p>${esc(sl.cta_text||'Open')} → ${esc(sl.cta_route||'market')}</p><small>${sl.active===false?'Hidden':'Live'} • order ${Number(sl.sort_order||0)}</small></div><span class="badge ${sl.active===false?'danger-soft':'verified'}">${sl.active===false?'Hidden':'Live'}</span></summary><div class="info-list"><div><span>Subtitle</span><b>${esc(sl.subtitle||'')}</b></div><div><span>Image</span><b data-no-translate>${esc(sl.image_url||'Default image')}</b></div></div>${sl.id?`<div class="approval-actions"><button class="secondary" onclick="HP.toggleCarouselSlide('${esc(sl.id)}',${sl.active===false?'true':'false'})">${sl.active===false?'Show':'Hide'}</button><button class="danger" onclick="HP.deleteCarouselSlide('${esc(sl.id)}')">Delete</button></div>`:''}</details>`).join('') || empty('No carousel slides yet.');
  }
  function adminCarouselPanel(){ return ''; }
  async function saveCarouselSlide(form){
    if(!sb||!isAdminUser()) return toast('Admin access required');
    const fd=new FormData(form); const payload={title:fd.get('title'),subtitle:fd.get('subtitle'),image_url:fd.get('image_url')||'',cta_text:fd.get('cta_text')||'Open',cta_route:normalizeRouteName(fd.get('cta_route')||'market'),sort_order:Number(fd.get('sort_order')||10),active:true,updated_at:new Date().toISOString()};
    const {error}=await sb.from('site_carousel_slides').insert(payload);
    if(error) return toast('Carousel save failed. Please check admin setup.');
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
    <section class="page-card admin-nav-strip"><button onclick="document.getElementById('sellerApprovalList')?.scrollIntoView({behavior:'smooth',block:'start'})">Seller approvals</button><button onclick="document.getElementById('approvedProductsList')?.scrollIntoView({behavior:'smooth',block:'start'})">Products</button><button onclick="document.getElementById('adminOrdersList')?.scrollIntoView({behavior:'smooth',block:'start'})">Orders</button><button onclick="document.getElementById('adminMoneyList')?.scrollIntoView({behavior:'smooth',block:'start'})">Money & payouts</button><button onclick="document.getElementById('adminRanksList')?.scrollIntoView({behavior:'smooth',block:'start'})">Badges</button><button onclick="document.getElementById('adminMembershipList')?.scrollIntoView({behavior:'smooth',block:'start'})">Plans</button></section>
    ${adminIdentityPanel()}${adminNotificationsPanel()}${adminAssistedListingPanel()}${adminCarouselPanel()}
    <section class="admin-kpi-grid">
      <div class="admin-kpi"><small>Total GMV</small><b>${adminMoney(gross)}</b><span>All checkout value</span></div>
      <div class="admin-kpi"><small>Paid Revenue</small><b>${adminMoney(paid)}</b><span>Paid / shipped / delivered</span></div>
      <div class="admin-kpi"><small>Platform Fees</small><b>${adminMoney(platform)}</b><span>Buyer and seller fee tracking uses launch slabs</span></div>
      <div class="admin-kpi"><small>Pending Sellers</small><b>${pendingSellers.length}</b><span>Need document review</span></div>
      <div class="admin-kpi"><small>Live Products</small><b>${products.filter(isVisibleProduct).length}</b><span>Monitor and remove unsafe items</span></div>
      <div class="admin-kpi"><small>Safety Reports</small><b>${reports.filter(r=>r.status==='open').length}</b><span>Open reports</span></div>
    </section>
    <details class="page-card admin-fold" open><summary><b>Seller verification</b><span>${pendingSellers.length} pending</span></summary><div class="admin-columns">
      <div class="admin-panel"><div class="section-head compact"><h2>Seller approval queue</h2><span class="badge">${pendingSellers.length} pending</span></div><div id="sellerApprovalList">${adminSellerList(sellers)}</div></div>
      <div class="admin-panel"><div class="section-head compact"><h2>Approved sellers</h2><span class="badge verified">${sellers.filter(s=>s.status==='approved').length} active</span></div><div id="approvedSellersList">${adminSellerManager(sellers,'approved')}</div></div>
      <div class="admin-panel"><div class="section-head compact"><h2>Rejected / banned sellers</h2><span class="badge danger-soft">${sellers.filter(s=>['rejected','banned'].includes(s.status)).length}</span></div><div id="sellerArchiveList">${adminSellerManager(sellers,'archive')}</div></div>
    </div></details>
    <details class="page-card admin-fold"><summary><b>Marketplace products</b><span>${products.filter(isVisibleProduct).length} live</span></summary><div class="admin-columns">
      <div class="admin-panel"><div class="section-head compact"><h2>Live products</h2><span class="badge verified">${products.filter(isVisibleProduct).length} live</span></div><div id="approvedProductsList">${adminProductManager(products,'approved')}</div></div>
      <div class="admin-panel"><div class="section-head compact"><h2>Removed / banned products</h2><span class="badge danger-soft">${products.filter(p=>['removed','rejected','banned'].includes(p.status)).length}</span></div><div id="productArchiveList">${adminProductManager(products,'archive')}</div></div>
    </div></details>
    <details class="page-card admin-fold"><summary><b>Orders, reports and support</b><span>${orders.length} orders</span></summary><div class="admin-columns">
      <div class="admin-panel"><div class="section-head compact"><h2>Latest orders</h2><span class="badge">${orders.length}</span></div><div id="adminOrdersList">${adminOrdersList(orders)}</div></div>
      <div class="admin-panel"><div class="section-head compact"><h2>Reports & support</h2><span class="badge danger-soft">${reports.filter(r=>r.status==='open').length} open</span></div><div id="adminReportsList">${adminReportsList(reports)}</div><div id="adminContactsList">${adminContactsList(contacts)}</div></div>
    </div></details>
    <details class="page-card admin-fold"><summary><b>Revenue, fees and payouts</b><span>${adminMoney(platform)}</span></summary><div class="admin-panel"><div class="section-head compact"><h2>Revenue systems</h2><span class="badge owner">Plans, boosts and fees</span></div>
      <div class="revenue-mini-grid">
        <div><b>Memberships</b><span>${memberships.length} purchases</span><strong>${adminMoney(memberships.reduce((s,p)=>s+Number(p.amount||0),0))}</strong></div><div><b>Seller Plans</b><span>${plans.length} purchases</span><strong>${adminMoney(plans.reduce((s,p)=>s+Number(p.amount||0),0))}</strong></div>
        <div><b>Boosted Listings</b><span>${products.filter(p=>p.is_boosted).length} active / ${boosts.length} logs</span><strong>${adminMoney(boosts.reduce((s,b)=>s+Number(b.amount||0),0))}</strong></div>
        <div><b>Approved Products</b><span>${products.filter(isVisibleProduct).length} live</span><strong>${products.length} total</strong></div>
        <div><b>Seller Pipeline</b><span>${sellers.length} sellers</span><strong>${sellers.filter(s=>s.status==='approved').length} approved</strong></div>
      </div>
    </div><div class="admin-panel money-admin-panel"><div class="section-head compact"><h2>Money in and seller payouts</h2><span class="badge live-badge">Live counters</span></div><div id="adminMoneyList">${adminMoneyList()}</div></div></details>
    <details class="page-card admin-fold"><summary><b>Rewards, badges and memberships</b><span>${memberships.length} plan logs</span></summary><div class="admin-columns">
      <div class="admin-panel"><div class="section-head compact"><h2>Ranks & badges</h2><span class="badge owner">Ranks and rewards</span></div><div id="adminRanksList">${adminRanksList()}</div></div>
      <div class="admin-panel"><div class="section-head compact"><h2>Events & rewards</h2><span class="badge">Ready</span></div><div id="adminEventsList">${adminEventsList()}</div></div>
    </div><div class="admin-panel"><div class="section-head compact"><h2>Membership purchases</h2><span class="badge owner">Rs. 19 to Rs. 499</span></div><div id="adminMembershipList">${adminMembershipList(memberships)}</div></div></details>`;
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
    return `<details class="admin-detail-card" ${compact?'':'open'}><summary><div class="doc-avatar">${name.slice(0,2).toUpperCase()}</div><div><b>${name}</b><p data-no-translate>${email} ${s.phone?'• '+esc(s.phone):''}</p><small>${loc}</small></div>${statusBadge(s.status)}</summary><div class="admin-detail-body"><div class="info-list"><div><span>Business</span><b>${name}</b></div><div><span>Phone</span><b data-no-translate>${esc(s.phone||'Not added')}</b></div><div><span>Location</span><b>${loc}</b></div><div><span>Pincode</span><b>${esc(s.pincode||'Not added')}</b></div><div><span>Address</span><b>${esc(s.address||'Not added')}</b></div></div><div class="doc-preview-grid">${adminDocPreview(s.aadhaar_front,'Aadhaar front')}${adminDocPreview(s.aadhaar_back,'Aadhaar back')}${adminDocPreview(s.shop_photo,'Shop / stock')}</div><div class="approval-actions"><button class="secondary" onclick="HP.approveSeller('${id}','${uid}')">Approve</button><button class="danger" onclick="HP.rejectSeller('${id}','${uid}')">Reject</button><button class="danger" onclick="HP.banSeller('${id}','${uid}')">Ban</button>${s.status==='banned'?`<button class="ghost" onclick="HP.restoreSeller('${id}','${uid}')">Restore</button>`:''}</div></div></details>`;
  }
  function adminSellerList(list=[]){ const pending=(list||[]).filter(s=>['pending','provisional'].includes(s.status)); return localizeHtml(pending.map(s=>adminSellerRow(s,false)).join('')||empty('No pending sellers')); }
  function adminSellerManager(list=[],mode='approved'){ const rows=(list||[]).filter(s=> mode==='approved' ? s.status==='approved' : ['rejected','banned'].includes(s.status)); return localizeHtml(rows.map(s=>adminSellerRow(s,true)).join('')||empty(mode==='approved'?'No approved sellers yet':'No rejected or banned sellers')); }
  function adminProductRow(p,compact=false){
    const id=esc(p.id), title=esc(p.title||'Product'), img=productImage(p);
    return `<details class="admin-detail-card product-admin-card" ${compact?'':'open'}><summary><img src="${img}" onerror="this.src='${placeholder(p.category)}'"><div><b>${title}</b><p>${money(p.price)} • ${esc(p.category||'Product')} • ${esc([p.city,p.state].filter(Boolean).join(', '))}</p><small>${esc(p.sell_type||'spare')} • ${esc(p.condition||'Used')} • Seller ${esc(p.users?.email||p.sellers?.business_name||'')}</small></div>${statusBadge(p.status)}</summary><div class="admin-detail-body"><p class="muted">${esc(p.description||'No description added.')}</p><div class="info-list"><div><span>Brand</span><b>${esc(p.brand||'Not added')}</b></div><div><span>Model</span><b>${esc(p.model||'Not added')}</b></div><div><span>Weight</span><b>${esc(p.weight_kg||'—')} kg</b></div><div><span>Status</span><b>${esc(p.status||'approved')}</b></div></div><div class="approval-actions">${!isVisibleProduct(p)?`<button class="secondary" onclick="HP.approveProduct('${id}')">Restore</button>`:''}<button class="danger" onclick="HP.removeProduct('${id}')">Remove</button><button class="danger" onclick="HP.banProduct('${id}')">Ban</button><button class="ghost" onclick="HP.route('product',{id:'${id}'})">Open</button></div></div></details>`;
  }
  function adminProductQueue(products=[]){ const rows=(products||[]).filter(p=>productStatus(p)==='pending'); return rows.map(p=>adminProductRow(p,false)).join('')||empty('No pending products'); }
  function adminProductManager(products=[],mode='approved'){ const rows=(products||[]).filter(p=> mode==='approved' ? isVisibleProduct(p) : ['removed','rejected','banned'].includes(productStatus(p))); return rows.slice(0,40).map(p=>adminProductRow(p,true)).join('')||empty(mode==='approved'?'No approved products yet':'No rejected or banned products'); }
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
    state.admin.notifications=await safe(()=>sb.from('admin_notifications').select('*').order('created_at',{ascending:false}).limit(60));
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
    const patch={status,updated_at:new Date().toISOString()}; if(status==='approved') patch.approved_at=new Date().toISOString(); if(status==='banned') patch.banned_at=new Date().toISOString(); if(status==='removed') patch.removed_at=new Date().toISOString();
    if(sb){ const {error}=await sb.from('products').update(patch).eq('id',id); if(error)return toast(statusPatchHint(error)); }
    const p=state.products.find(x=>String(x.id)===String(id)); if(p) Object.assign(p,patch);
    toast(`Product ${status}`); await loadProducts(); await loadAdminProData(); render();
  }
  async function approveProduct(id){ return setProductStatus(id,'approved'); }
  async function removeProduct(id){ const reason=prompt('Reason for removing this listing? This can be sent to seller.','Listing removed by admin review.'); if(reason===null) return; await notifyProductSeller(id, reason); return setProductStatus(id,'removed'); }
  async function rejectProduct(id){ return removeProduct(id); }
  async function banProduct(id){ const reason=prompt('Reason for banning this listing?','Listing banned due to safety or policy issue.'); if(reason===null) return; await notifyProductSeller(id, reason); return setProductStatus(id,'banned'); }
  async function restoreProduct(id){ return setProductStatus(id,'approved'); }
  async function notifyProductSeller(id, reason=''){
    const p=(state.products||[]).find(x=>String(x.id)===String(id)) || (state.admin.products||[]).find(x=>String(x.id)===String(id));
    if(!p||!sb||!p.user_id) return;
    try{ await sb.from('messages').insert({sender_id:state.user.id,receiver_id:p.user_id,product_id:id,message:`Admin notice for ${p.title||'your listing'}: ${reason}`,is_read:false}); }catch(e){}
  }
  async function deleteOwnProduct(id){
    if(!state.user) return route('login');
    const p=(state.products||[]).find(x=>String(x.id)===String(id));
    if(!p || String(p.user_id)!==String(state.user.id)) return toast('You can delete only your own listing.');
    if(!confirm('Delete this listing from marketplace?')) return;
    if(sb){
      const {error}=await sb.from('products').delete().eq('id',id).eq('user_id',state.user.id);
      if(error) return toast('Unable to delete. Run v88 SQL patch once, then try again.');
    }
    state.products=state.products.filter(x=>String(x.id)!==String(id));
    localStorage.hp_products=JSON.stringify(state.products);
    toast('Listing deleted'); render();
  }

  async function setOrderStatus(id,status){ if(!sb)return; const {error}=await sb.from('orders').update({status,updated_at:new Date().toISOString()}).eq('id',id); if(error)return toast(error.message); toast('Order updated'); await loadAdminProData(); }
  async function setReportStatus(id,status){ if(!sb)return; const {error}=await sb.from('reports').update({status,updated_at:new Date().toISOString()}).eq('id',id); if(error)return toast(error.message); toast('Report updated'); await loadAdminProData(); }
  async function setContactStatus(id,status){ if(!sb)return; const {error}=await sb.from('contact_messages').update({status}).eq('id',id); if(error)return toast(error.message); toast('Support message updated'); await loadAdminProData(); }


  const LEGAL_LAST_UPDATED = '16 May 2026';
  const LEGAL_OWNER = 'Harvester Parts';
  const LEGAL_WEBSITE = 'https://harvesterparts.in';
  const LEGAL_SUPPORT_EMAIL = SUPPORT_EMAIL;
  const LEGAL_SUPPORT_PHONE = 'Email support only';
  const LEGAL_BUSINESS_ADDRESS = 'Business address, GSTIN and registered entity details will be displayed after final business registration details are confirmed by the owner.';

  const legalDocs = {
    terms:{
      title:'Terms & Conditions',
      subtitle:'Rules for using Harvester Parts as a buyer, seller, member, admin-approved seller or visitor.',
      staticFile:'terms.html',
      sections:[
        ['1. Introduction',`These Terms & Conditions govern access to and use of Harvester Parts, including the website, marketplace, accounts, seller verification, product listings, plans, payments, support, messages, rewards, badges, banners and admin-reviewed services. By using the platform, creating an account, posting a listing, placing an order or buying a membership, you agree to these Terms.`],
        ['2. Marketplace Role',`Harvester Parts operates as an online marketplace and facilitator for agricultural machinery, harvester parts, tractor parts, farm implements and related inventory. Harvester Parts is not the seller, manufacturer, owner, mechanic, surveyor, insurer or transport provider for seller-listed items unless expressly stated in writing. Sellers are responsible for the accuracy, ownership, legality, condition, pricing, availability and delivery readiness of their listings. Buyers are responsible for inspecting, verifying compatibility, checking documents, confirming freight and deciding whether the product is suitable before payment or acceptance. Harvester Parts may review, approve, reject, hide, ban or remove listings to protect marketplace quality, but such review is not a product guarantee.`],
        ['3. Accounts and Eligibility',`Users must provide accurate details and keep login credentials secure. Users may use email, Google login or phone OTP when enabled. A user must not create false accounts, impersonate any person, misuse another person’s documents or submit fake seller information. Harvester Parts may restrict or suspend accounts for fraud, suspicious activity, abuse, non-payment, repeated disputes, policy violation or legal risk.`],
        ['4. Seller Verification',`Only approved sellers can publish products. Seller approval may require business details, contact details, shop or stock photos, Aadhaar or other verification documents, bank or UPI payout information and any additional information requested by admin. Approval does not create employment, partnership, franchise or agency. Admin may approve, reject, ban, restore or re-check a seller at any time for buyer safety and platform compliance.`],
        ['5. Listings and Product Information',`Every listing must be accurate and must include correct title, category, product type, model, brand, price, condition, images and availability. Sellers must not mislead buyers with fake images, hidden defects, false compatibility, copied listings, stolen products or unrealistic offers. Harvester Parts may edit visibility, reject, ban, archive or request changes to any listing.`],
        ['6. Orders and Payments',`When checkout is used, buyer payment is collected through the available payment method such as Razorpay or approved manual confirmation. During launch, buyer protection fee and seller commission use value slabs: 3.5% under Rs. 5,000, 3% from Rs. 5,000 to Rs. 9,999, 2.5% from Rs. 10,000 to Rs. 99,999, 2% from Rs. 1 lakh to Rs. 2.99 lakh, 1.5% from Rs. 3 lakh to Rs. 9.99 lakh and 1% from Rs. 10 lakh and above. The platform may hold order amounts for processing, fraud checks, dispute handling, refund review and seller payout calculation. Seller payout is calculated after deducting seller commission, refunds, chargebacks, penalties, shipping adjustments or other applicable deductions.`],
        ['7. Seller Commission and Payouts',`Seller commission follows the active value slab shown before listing and checkout unless a later notice or written agreement says otherwise. Membership plans increase listing limits, boosts and profile rewards; they do not make Harvester Parts responsible for product condition, ownership, delivery or buyer-seller claims. Seller balance shown in the account is an estimated payable amount and may change if the order is cancelled, refunded, disputed, charged back, adjusted or found to violate policy.`],
        ['8. Membership Plans and Rewards',`Membership plans may provide listing limits, fee discounts, boost days, badges, banners, titles, reward points or visibility benefits. Plans are digital platform services and begin when activated. Plan benefits are not guaranteed sales, leads or profit. Harvester Parts may update plan names, pricing, benefits, ranking rules, reward rules and event rules with notice on the platform.`],
        ['9. Badges, Titles, Banners and Ranks',`Badges, titles, banners, ranks and points are platform identity features. They are not financial assets and cannot be sold, transferred, redeemed for cash or used as proof of business quality outside the platform. Founder/admin identity may be unique and controlled by the platform owner. Users may lose badges, ranks or benefits if their account violates policy.`],
        ['10. User Conduct',`Users must communicate respectfully, avoid spam, avoid bypassing platform checkout when order protection is used, avoid sharing prohibited content, avoid harassment, avoid fraudulent claims and avoid any activity that harms buyers, sellers, admin, payment processors or the platform. Harvester Parts may moderate chat and support messages for safety, fraud prevention and policy enforcement.`],
        ['11. No Guarantee',`Harvester Parts does not guarantee uninterrupted service, guaranteed buyer leads, product quality, product authenticity, ownership, product availability, delivery time, seller profit, resale value or compatibility of any part with any machine. Marketplace content is mainly provided by sellers and users. Buyers should verify critical details, ownership documents, invoice details, compatibility, condition and freight before purchase or acceptance.`],
        ['12. Limitation of Liability',`To the maximum extent permitted by law, Harvester Parts is not liable for indirect, incidental, special, consequential or punitive loss, loss of profit, downtime, loss of business, compatibility error, wrong fitment, third-party courier delay, seller misrepresentation, buyer-side inspection failure, payment gateway downtime or user misuse. The platform's role is limited to providing marketplace tools, payment flow, support records and policy review. Nothing in these Terms limits liability where it cannot legally be limited.`],
        ['13. Changes to Terms',`Harvester Parts may update these Terms to improve the platform, meet legal requirements, support new features or update payment/payout rules. Continued use of the platform after updates means acceptance of the updated Terms.`],
        ['14. Contact',`For support, disputes, seller verification, payment help or legal notices, contact ${LEGAL_SUPPORT_EMAIL} or use the Contact/Support page. Business identity details should be updated before full public launch if your final entity, GSTIN or registered office changes.`]
      ]
    },
    privacy:{
      title:'Privacy Policy',
      subtitle:'How Harvester Parts collects, uses, protects and shares personal information.',
      staticFile:'privacy-policy.html',
      sections:[
        ['1. Scope',`This Privacy Policy applies to users, visitors, buyers, sellers, admins and support contacts who use Harvester Parts. It explains how we collect and use account details, contact details, seller verification details, product listings, payment-related references, payout information, messages, support requests, device data and website activity.`],
        ['2. Information We Collect',`We may collect name, email, phone number, login identifier, profile details, seller business details, shop address, Aadhaar or verification images uploaded by sellers, payout method, UPI ID, bank account details, product listings, order details, payment IDs, support messages, reports, device/browser data and language preferences.`],
        ['3. Why We Use Data',`We use data to create accounts, verify sellers, approve listings, process orders, calculate seller payouts, reduce fraud, support users, manage membership plans, show rank/badge/title/banner features, maintain admin records, meet legal obligations, improve marketplace safety and communicate important service updates.`],
        ['4. Payment Data',`Card numbers, UPI PINs, banking passwords and sensitive payment credentials are not stored by Harvester Parts. Payment processing is handled through the payment gateway selected at checkout. We may store transaction IDs, payment status, refund status, order amount and related payment references for support and accounting.`],
        ['5. Seller Verification Documents',`Seller verification documents and shop/stock photos are collected only for verification, fraud prevention, trust and safety, dispute handling and platform compliance. Access is limited to admin and authorized operational use. Sellers must upload only their own valid documents and must not upload another person’s documents without lawful authority.`],
        ['6. Data Sharing',`We may share limited information with payment providers, delivery partners, service providers, legal authorities, fraud-prevention services, hosting providers or professional advisors when required for platform operation, legal compliance, dispute handling, payment processing, security or user support. We do not sell personal data to advertisers.`],
        ['7. Data Security',`We use technical and organizational measures such as authenticated access, database policies, restricted admin functions and secure payment routing. No internet service is 100% secure. Users should keep passwords, OTPs and devices safe and should report suspicious activity immediately.`],
        ['8. User Choices',`Users can update profile details, request support, request correction of inaccurate details and request account/data review. Some records may be retained when required for orders, disputes, accounting, fraud prevention, legal compliance or security.`],
        ['9. Children and Minors',`The marketplace is intended for lawful commercial and consumer use. Users should use the platform only if they can lawfully enter into transactions or with appropriate guardian/business authority where applicable.`],
        ['10. Contact for Privacy',`For privacy questions or correction requests, contact ${LEGAL_SUPPORT_EMAIL} through the Support page.`]
      ]
    },
    refund:{
      title:'Refund & Cancellation Policy',
      subtitle:'Buyer cancellation, return, refund, gateway refund and seller payout adjustment rules.',
      staticFile:'refund-cancellation-policy.html',
      sections:[
        ['1. Overview',`This policy applies to orders placed through Harvester Parts checkout. Because many products are used machinery, spare parts, heavy items or seller-managed inventory, cancellation and refund decisions depend on order status, product condition, seller confirmation, shipping status and dispute review.`],
        ['2. Buyer Cancellation',`A buyer may request cancellation before seller confirmation or dispatch. If cancellation is approved before dispatch and no service or shipping cost has been incurred, the eligible order amount may be refunded to the original payment method. If dispatch, procurement, packing, loading, transport or inspection has started, cancellation may be refused or charges may apply where legally permitted.`],
        ['3. Eligible Refund Cases',`Refunds may be approved when the seller cannot supply the item, the order is cancelled by Harvester Parts, the buyer is charged but order creation fails, the wrong item is delivered, the product is materially different from the approved listing, or a dispute review confirms refund eligibility.`],
        ['4. Non-Refundable or Limited Refund Cases',`Refund may be rejected or reduced for buyer change of mind after dispatch, wrong machine compatibility selected by buyer, damage after delivery, missing original packaging where relevant, used/installed parts, altered items, custom-procured parts, false claims, delayed complaint after acceptance or cases where seller listing was accurate.`],
        ['5. Refund Timelines',`Approved refunds are usually initiated through the payment gateway to the original payment method. Normal gateway/bank timelines may take several working days after initiation. Exact timing depends on Razorpay, banks, card networks, UPI providers and payment method.`],
        ['6. Platform Fees and Deductions',`During launch, checkout may include a buyer protection fee and seller payout may include seller commission based on the active value slab. Payment gateway charges, shipping, loading, inspection, return shipping, cancellation charges, chargebacks or bank fees may also be deducted where applicable and legally allowed. Seller payout and seller balance are adjusted if a refund or chargeback is created.`],
        ['7. How to Request Refund',`Open Support/Contact with order ID, product name, reason, photos/videos where relevant and contact details. Harvester Parts may request seller response, courier proof, inspection proof or extra details before final decision.`]
      ]
    },
    shipping:{
      title:'Shipping & Delivery Policy',
      subtitle:'Delivery expectations for spare parts, machinery, heavy products and seller-managed dispatch.',
      staticFile:'shipping-delivery-policy.html',
      sections:[
        ['1. Delivery Model',`Products may be shipped by seller, buyer-arranged pickup, platform-assisted courier, transport service, local delivery or heavy machinery logistics depending on item size, location and seller terms. Delivery availability and cost can vary by pincode, weight, volume and route.`],
        ['2. Timelines',`Estimated dispatch and delivery timelines shown on the platform are estimates only. Heavy machinery, large parts, remote locations, road permits, transport availability, weather, strikes, holidays, inspection delays or seller stock confirmation may extend timelines.`],
        ['3. Shipping Charges',`Shipping charges may include packing, loading, transport, courier, insurance, handling and heavy item logistics. Some products may need manual shipping quotation before final delivery. Buyer is responsible for providing complete address, phone number, pincode and unloading availability.`],
        ['4. Delivery Inspection',`Buyer should inspect package/item at delivery wherever possible. For visible damage, missing parts or wrong item, contact support quickly with photos, video and delivery proof. Do not install or modify disputed items before support review unless instructed.`],
        ['5. Risk and Ownership',`Risk transfer may depend on order terms, delivery method and seller arrangement. If Harvester Parts checkout protection is used, seller payout may remain pending until order review, delivery confirmation or dispute window is handled.`]
      ]
    },
    razorpay:{
      title:'Razorpay Payment Policy',
      subtitle:'Payment gateway, secure checkout, refunds and payment status rules.',
      staticFile:'razorpay-payment-policy.html',
      sections:[
        ['1. Payment Gateway',`Harvester Parts uses Razorpay or other enabled payment methods for online payment collection. Razorpay may support payment modes such as UPI, cards, netbanking, wallets or other methods depending on availability, bank status, gateway rules and merchant activation.`],
        ['2. Payment Security',`Harvester Parts does not store card numbers, CVV, UPI PIN, netbanking password or other sensitive payment credentials. These are handled by the payment gateway/bank/payment app. Users should never share OTP, PIN, card password or banking password with any seller, buyer or support person.`],
        ['3. Payment Confirmation',`An order may show pending until Razorpay/payment gateway confirms payment success. If money is deducted but order is not visible, contact support with payment ID, amount, date/time, phone/email and bank reference. Duplicate or failed payments are reviewed and refunded/adjusted where eligible.`],
        ['4. Refunds via Razorpay',`Approved online refunds are normally sent back to the original payment method through Razorpay/payment gateway. Refund timing depends on gateway and banking networks. Harvester Parts cannot control bank-side delays after refund initiation.`],
        ['5. Chargebacks and Fraud',`Suspicious transactions, chargebacks, payment disputes, fake orders, unauthorized use, high-risk activity or gateway alerts may result in order hold, seller payout hold, account review or cancellation.`]
      ]
    },
    'seller-policy':{
      title:'Seller Policy',
      subtitle:'Rules for seller verification, product listing, order handling and seller conduct.',
      staticFile:'seller-policy.html',
      sections:[
        ['1. Seller Approval',`Sellers must complete verification before listing products. Admin may request identity, shop, stock, business, GST, address, phone, bank/UPI and other details. Approval can be revoked if information is false, outdated, incomplete or risky.`],
        ['2. Seller Duties',`Sellers must list only products they own or are authorized to sell, keep inventory updated, describe condition clearly, respond to buyer/admin messages, pack items safely, follow delivery commitments, cooperate with disputes and avoid any misleading claim.`],
        ['3. Pricing and Availability',`Seller price must be genuine and current. Admin may remove unrealistic, duplicate, misleading, bait, out-of-stock or suspicious listings. If a seller fails to supply after accepting an order, penalties, ranking reduction or account action may apply.`],
        ['4. Prohibited Seller Actions',`Sellers must not sell stolen goods, counterfeit products, unsafe items, illegal products, weapons, drugs, restricted products, fake invoices, fake documents or products violating law. Sellers must not bypass platform rules, manipulate ratings, harass buyers or misuse buyer data.`]
      ]
    },
    'buyer-policy':{
      title:'Buyer Policy',
      subtitle:'Rules for buying, checkout, inspection and dispute support.',
      staticFile:'buyer-policy.html',
      sections:[
        ['1. Buyer Responsibility',`Buyers must review product details, part compatibility, model, brand, ownership, invoice/document availability, condition, price, shipping cost, loading/unloading needs and delivery terms before ordering. For used machinery, spare parts and compatibility-critical items, buyers should inspect directly, ask for photos/videos and confirm fitment before payment or acceptance.`],
        ['2. Safe Buying',`Use platform checkout and support channels wherever order records and payment references are required. Do not share OTP, banking passwords or unnecessary personal documents with sellers. If a buyer chooses to pay, inspect, collect or settle outside the platform, that buyer accepts the added risk and Harvester Parts may have limited ability to help.`],
        ['3. Disputes',`Buyers must raise disputes quickly with evidence such as photos, videos, delivery proof, order ID and chat history. Harvester Parts may contact seller and decide next steps based on available evidence and policy, but it is not responsible for losses caused by false seller information, buyer's failure to inspect, off-platform payment or incompatible product selection except where liability cannot legally be limited.`]
      ]
    },
    'payout-policy':{
      title:'Seller Payout Policy',
      subtitle:'How seller balances, commission, payout methods and 7 business day payout targets work.',
      staticFile:'seller-payout-policy.html',
      sections:[
        ['1. Platform Collection',`For protected checkout, buyer payment is collected by Harvester Parts/payment gateway first. The platform then calculates seller payable balance after seller platform commission, membership fee rate, refunds, chargebacks, shipping adjustments, penalties and any applicable deductions.`],
        ['2. Seller Balance Example',`If a seller lists an item for Rs. 1,000 during launch, the active slab is 3.5%, so estimated seller commission is Rs. 35 and estimated seller balance becomes Rs. 965 before any shipping, refund, chargeback or policy adjustment. Higher-value items move to lower slabs, down to 1% from Rs. 10 lakh and above.`],
        ['3. Payout Method',`Sellers must choose payout by UPI or bank account and submit accurate details. For UPI, seller must provide valid UPI ID and account holder name. For bank transfer, seller must provide account holder name, bank name, account number and IFSC. Wrong payout details may delay or fail transfer.`],
        ['4. Payout Timeline',`Seller payouts are targeted within 7 business days after payment/order confirmation, subject to delivery status, dispute window, fraud checks, bank holidays, payment gateway settlement, compliance review and any buyer complaint. High-value orders may require additional confirmation before payout.`],
        ['5. Admin Controls',`Admin can view money-in, platform commission, seller balances, payout requests, seller bank/UPI details and mark payouts as pending, processing, paid or rejected. Manual payout records are operational records and should match actual bank/UPI transfers.`],
        ['6. Holds and Deductions',`Payout may be held or reduced for refunds, cancellations, chargebacks, fake listings, seller non-cooperation, legal notice, suspicious activity, buyer dispute, wrong shipment, missing product, policy violation or account verification issue.`]
      ]
    },
    'fees-policy':{
      title:'Fees & Commission Policy',
      subtitle:'Platform fee, seller commission, membership discounts and transaction cost information.',
      staticFile:'fees-commission-policy.html',
      sections:[
        ['1. Buyer Charges',`Buyer checkout may include product subtotal, shipping/logistics charges and a buyer protection fee based on the active value slab. Final payable amount is displayed before order placement.`],
        ['2. Seller Commission',`Seller commission is deducted from seller payout. During launch, seller commission is slab-based: 3.5% under Rs. 5,000, 3% under Rs. 10,000, 2.5% under Rs. 1 lakh, 2% under Rs. 3 lakh, 1.5% under Rs. 10 lakh and 1% from Rs. 10 lakh and above. Rates can change for future transactions after platform notice, but the active rate should be shown before checkout or payout calculation.`],
        ['3. Membership Fees',`Membership fees are paid for digital platform benefits such as listing limits, visibility, rank benefits, banners, badges, titles, boosts and rewards. Membership purchase does not guarantee sales, leads or profit.`]
      ]
    },
    'prohibited-policy':{
      title:'Prohibited Items Policy',
      subtitle:'Items and activity not allowed on Harvester Parts.',
      staticFile:'prohibited-items-policy.html',
      sections:[
        ['1. Strictly Prohibited',`Users must not list or trade illegal goods, stolen goods, counterfeit goods, weapons, explosives, ammunition, controlled substances, dangerous chemicals, wildlife products, fake documents, government restricted items, pornographic material, gambling products, hacking tools or any item that violates applicable law.`],
        ['2. Restricted Agricultural Goods',`Products such as pesticides, fertilizers, chemicals, fuel, lubricants, batteries, engines, electronics or safety-critical machine parts must be listed only where legally allowed and must include accurate safety, warranty, usage and compliance information where applicable.`],
        ['3. Enforcement',`Harvester Parts may reject, hide, ban, report or remove prohibited listings and may suspend sellers or users involved in prohibited activity.`]
      ]
    },
    'dispute-policy':{
      title:'Dispute Resolution Policy',
      subtitle:'How order, seller, buyer, refund and payout disputes are handled.',
      staticFile:'dispute-resolution-policy.html',
      sections:[
        ['1. Raising a Dispute',`Users should contact Support with order ID, product details, date, reason, photos/videos, delivery proof and chat screenshots where relevant. Disputes should be raised as soon as possible after the issue is noticed.`],
        ['2. Review Process',`Harvester Parts may review listing data, chat, payment status, delivery proof, seller response, buyer evidence and admin notes. The platform may approve refund, reject refund, request return, hold payout, release payout, ask for extra proof or close the case.`],
        ['3. Final Decision',`Marketplace decisions are based on available evidence and platform policy. Users may still use legal remedies available under applicable law. Harvester Parts encourages fair resolution before escalation.`]
      ]
    },
    grievance:{
      title:'Grievance Redressal',
      subtitle:'How users can contact Harvester Parts for complaints, legal notices and support escalation.',
      staticFile:'grievance-redressal.html',
      sections:[
        ['1. Contact Point',`For complaints about orders, sellers, products, refunds, privacy, payout, payment, account access or content, contact ${LEGAL_SUPPORT_EMAIL} or use the Support page. Include your name, registered email/phone, order/listing ID and clear details.`],
        ['2. Response Target',`We aim to acknowledge serious complaints within a reasonable time and work toward resolution based on complexity, evidence, seller/buyer response, payment gateway status and logistics information.`],
        ['3. Required Details',`Please include order ID, payment ID if any, product title, seller/buyer name if available, issue summary, photos/videos, delivery proof, bank/UPI reference where relevant and your preferred contact method.`],
        ['4. Legal Notices',`Formal legal notices should include complete sender details, authority, facts, relief sought and supporting documents. Business address and entity details must be updated by the owner once final registration details are confirmed.`]
      ]
    }
  };

  function legalFooter(){
    return `<footer class="company-footer royal-footer"><div class="footer-brand"><img src="./logo-192.png" alt="Harvester Parts"><div><b>Harvester Parts</b><span>India’s trusted agri mandi for farm machinery, implements and spare parts.</span></div></div><div class="footer-columns"><div><h4>Marketplace</h4><button data-route="market">Browse farm listings</button><button data-route="sell">Sell machinery or parts</button><button data-route="membership">Seller plans</button></div><div><h4>For farmers & dealers</h4><button data-route="categories">Categories</button><button data-route="how">How it works</button><button data-route="support">Support</button><button data-route="contact">Contact</button></div><div><h4>Company</h4><button data-route="about">About Harvester Parts</button><button data-route="terms">Terms</button><button data-route="privacy">Privacy</button><button data-route="refund">Refunds</button><button data-route="shipping">Shipping</button><button data-route="grievance">Grievance</button></div></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} Harvester Parts. All rights reserved.</span><span>Verified sellers • Secure checkout • Agricultural marketplace</span></div></footer>`;
  }
  function legalCardLink(key,label,desc){
    const doc=legalDocs[key]||{};
    return `<button class="legal-link-card" data-route="${esc(key)}"><b>${esc(label||doc.title||key)}</b><span>${esc(desc||doc.subtitle||'Open policy')}</span></button>`;
  }
  function legalCentrePage(){
    return `<section class="legal-hero page-card"><span class="eyebrow">Legal centre</span><h1>Clear policies for buyers, sellers, payments, refunds and payouts.</h1><p class="muted">These pages are written for a real marketplace workflow: verified sellers, Razorpay checkout, platform commission, seller balance, payout review, refunds, disputes and support escalation.</p><div class="legal-meta"><span>Last updated: ${LEGAL_LAST_UPDATED}</span><span>Website: ${LEGAL_WEBSITE}</span><span>Support: ${LEGAL_SUPPORT_EMAIL}</span></div></section><section class="legal-grid">${legalCardLink('terms','Terms & Conditions','Complete rules for accounts, listings, orders, plans and platform use.')}${legalCardLink('privacy','Privacy Policy','Personal data, seller documents, payout information and payment references.')}${legalCardLink('refund','Refund & Cancellation','Cancellation, refund eligibility, non-refundable cases and timelines.')}${legalCardLink('shipping','Shipping & Delivery','Dispatch, delivery, logistics and inspection rules.')}${legalCardLink('razorpay','Razorpay Payment Policy','Payment gateway, failed payment, refunds, chargebacks and security.')}${legalCardLink('seller-policy','Seller Policy','Seller approval, product accuracy, order handling and prohibited conduct.')}${legalCardLink('buyer-policy','Buyer Policy','Buyer responsibility, safe buying and dispute reporting.')}${legalCardLink('payout-policy','Seller Payout Policy','Seller balance, commission, UPI/bank payout and 7 business day target.')}${legalCardLink('fees-policy','Fees & Commission','Buyer charges, seller commission and membership fee discounts.')}${legalCardLink('prohibited-policy','Prohibited Items','Items and activities not allowed on the marketplace.')}${legalCardLink('dispute-policy','Dispute Resolution','Evidence, review process and resolution options.')}${legalCardLink('grievance','Grievance Redressal','Complaint and support escalation process.')}</section><section class="page-card legal-note"><h2>Launch checklist</h2><p>Before public launch, update your final legal entity name, registered address, GSTIN if applicable, business email and grievance officer/contact details. Do not add fake details.</p></section>`;
  }
  function legalDocPage(key){
    const doc=legalDocs[key] || legalDocs.terms;
    return `<section class="legal-doc page-card"><div class="legal-doc-head"><span class="eyebrow">Harvester Parts policy</span><h1>${esc(doc.title)}</h1><p class="muted">${esc(doc.subtitle)}</p><div class="legal-meta"><span>Last updated: ${LEGAL_LAST_UPDATED}</span><span>Operator: ${LEGAL_OWNER}</span><span>Support: ${LEGAL_SUPPORT_EMAIL}</span></div></div><div class="legal-toc">${doc.sections.map((s,i)=>`<span>${i+1}. ${esc(s[0].replace(/^\d+\.\s*/,''))}</span>`).join('')}</div><div class="legal-body">${doc.sections.map((s,i)=>`<article id="policy-${i+1}"><h2>${esc(s[0])}</h2><p>${esc(s[1])}</p></article>`).join('')}</div><div class="legal-contact-box"><h2>Contact and notices</h2><div class="info-list"><div><span>Email</span><b>${LEGAL_SUPPORT_EMAIL}</b></div><div><span>Support mode</span><b>${LEGAL_SUPPORT_PHONE}</b></div><div><span>Website</span><b>${LEGAL_WEBSITE}</b></div><div><span>Business details</span><b>${LEGAL_BUSINESS_ADDRESS}</b></div></div><button class="primary" data-route="contact">Contact Support</button><button class="ghost" data-route="legal">Back to Legal Centre</button>${doc.staticFile?`<a class="ghost legal-static-link" href="./${esc(doc.staticFile)}" target="_blank" rel="noopener">Open standalone page</a>`:''}</div></section>`;
  }

  function empty(msg){return `<div class="page-card muted" style="grid-column:1/-1">${msg}</div>`} function emptyPage(msg){return `<section class="page-card"><h1>${msg}</h1><button class="primary" data-route="home">Go Home</button></section>`}
  function render(){ const [r,id]=parseRoute(); state.route=r||state.route||'home'; state.currentProduct=id||state.currentProduct; let html=''; if(state.route==='home')html=home(); else if(state.route==='market')html=market(); else if(state.route==='product')html=productPage(state.currentProduct); else if(state.route==='cart')html=cartPage(); else if(state.route==='checkout')html=checkoutPage(); else if(state.route==='login')html=loginPage(); else if(state.route==='account')html=accountPage(); else if(state.route==='sell')html=sellPage(); else if(state.route==='messages')html=messagesPage(); else if(state.route==='orders')html=ordersPage(); else if(state.route==='admin')html=adminPage(); else if(state.route==='membership')html=membershipPage(); else if(state.route==='rewards')html=rewardsPage(); else if(state.route==='categories')html=categoriesPage(); else if(state.route==='about')html=aboutPage(); else if(state.route==='contact')html=contactPage(); else if(state.route==='how')html=howPage(); else if(state.route==='support')html=supportPage(); else if(state.route==='legal')html=legalCentrePage(); else if(legalDocs[state.route])html=legalDocPage(state.route); else html=home(); app.innerHTML=localizeHtml(html + legalFooter()); syncMenu(); bindPage(); applyLang(); if(window.HP_APPLY_LANGUAGE) setTimeout(window.HP_APPLY_LANGUAGE,40); animateCounters(); startFactTicker(); if(state.route==='orders')loadOrders(); if(state.route==='admin')loadAdminProData(); }
  function bindPage(){
    $$('#app input, #app textarea, #app select').forEach(el=>el.addEventListener('click',e=>e.stopPropagation()));
    $('#loginForm')?.addEventListener('submit',e=>{e.preventDefault(); const fd=new FormData(e.target); withLoading(e.target,()=>login(fd.get('email'),fd.get('password')),'Logging in...');});
    $('#signupSwitch')?.addEventListener('click',()=>{ const f=$('#loginForm'); const fd=new FormData(f); const email=fd.get('email'), pass=fd.get('password'); if(!email||!pass)return toast('Enter email and password first'); signup(email,pass,''); });
    $('#forgotBtn')?.addEventListener('click',()=>{ const fd=new FormData($('#loginForm')); forgotPassword(fd.get('email')); });
    $('#googleLoginBtn')?.addEventListener('click',loginGoogle);
    $('#sendOtpBtn')?.addEventListener('click',()=>sendPhoneOtp(getOtpPhone()));
    $('#verifyOtpBtn')?.addEventListener('click',()=>verifyPhoneOtp(getOtpPhone(), $('#otpCodeInput')?.value.trim()));
    $('#profileForm')?.addEventListener('submit',e=>{e.preventDefault();withLoading(e.target,()=>saveProfile(e.target),'Saving...')});
    bindFormDraft('sellerVerifyForm','sellerVerifyDraft');
    $('#sellerVerifyForm')?.addEventListener('submit',e=>{e.preventDefault();withLoading(e.target,()=>submitSellerVerification(e.target),'Submitting verification...')});
    bindFormDraft('sellForm','sellFormDraft');
    $('#sellForm')?.addEventListener('submit',e=>{e.preventDefault();withLoading(e.target,()=>submitProduct(e.target),'Submitting listing...')});
    bindSellTypeChooser();
    $('#sellForm input[name="price"]')?.addEventListener('input',e=>{ const raw=parsePrice(e.target.value); const cursor=e.target.selectionStart; e.target.value=formatINRInput(e.target.value); try{e.target.setSelectionRange(e.target.value.length,e.target.value.length)}catch(_e){} const price=raw; $('#sellerFeePreview').innerHTML=localizeHtml(`Listing price: <b>${money(price)}</b> • Seller commission: <b>${money(sellerFee(price))}</b> (${commissionLabel(price)}) • Your payout before delivery/refund adjustments: <b>${money(price-sellerFee(price))}</b> • ${feeDiscountForPlan(activePlan())}`); });
    $('#checkoutForm')?.addEventListener('submit',e=>{e.preventDefault();withLoading(e.target,()=>placeOrder(e.target),'Placing order...')});
    $('#checkoutForm')?.addEventListener('input',updateCheckoutSummary);
    $('#checkoutForm')?.addEventListener('change',updateCheckoutSummary);
    $('#applyCouponBtn')?.addEventListener('click',e=>{ e.preventDefault(); updateCheckoutSummary(true); });
    $('#messageForm')?.addEventListener('submit',e=>{e.preventDefault();withLoading(e.target,()=>sendMsg(e.target),'Sending...')});
    $('#contactForm')?.addEventListener('submit',e=>{e.preventDefault();withLoading(e.target,()=>sendContact(e.target),'Saving request...')});
    $('#supportBotForm')?.addEventListener('submit',e=>{e.preventDefault(); const fd=new FormData(e.target); const ans=$('#supportBotAnswer'); if(ans){ ans.textContent=supportBotReply(fd.get('topic'),fd.get('question')); ans.classList.add('active'); }});
    $$('[data-plan-key]').forEach(btn=>btn.addEventListener('click',e=>{ e.preventDefault(); e.stopPropagation(); withLoading(btn.closest('.membership-card')||btn,()=>purchaseMembership(btn.dataset.planKey),'Opening plan...'); }));
    $('#payoutAccountForm')?.addEventListener('submit',e=>{e.preventDefault();withLoading(e.target,()=>savePayoutAccount(e.target),'Saving payout...')});
    $('#adminIdentityForm')?.addEventListener('submit',e=>{e.preventDefault();withLoading(e.target,()=>saveAdminIdentity(e.target),'Saving admin identity...')});
    $('#adminListingForm')?.addEventListener('submit',e=>{e.preventDefault();withLoading(e.target,()=>submitAdminListingForUser(e.target),'Creating listing...')});
    $('#adminListingForm input[name="price"]')?.addEventListener('input',e=>{ e.target.value=formatINRInput(e.target.value); try{e.target.setSelectionRange(e.target.value.length,e.target.value.length)}catch(_e){} });
    $('#carouselSlideForm')?.addEventListener('submit',e=>{e.preventDefault();withLoading(e.target,()=>saveCarouselSlide(e.target),'Saving carousel...')});
    $('#requestPayoutBtn')?.addEventListener('click',e=>{e.preventDefault();requestPayout();});
    $('#searchInput')?.addEventListener('input',filterMarket);
    $('#searchInput')?.addEventListener('focus',updateSearchSuggestions);
    $('#searchInput')?.addEventListener('blur',()=>setTimeout(()=>$('#searchSuggest')?.classList.remove('show'),140));
    $('#searchSuggest')?.addEventListener('click',e=>{ const b=e.target.closest('[data-suggest]'); if(!b)return; const input=$('#searchInput'); if(input){ input.value=b.dataset.suggest; input.blur(); $('#searchSuggest')?.classList.remove('show'); filterMarket(); } });
    $('#typeFilter')?.addEventListener('change',filterMarket); $('#categoryFilter')?.addEventListener('change',filterMarket); $('#sortFilter')?.addEventListener('change',filterMarket);
  }
  function bindSellTypeChooser(){
    const form=$('#sellForm'); if(!form) return;
    const cards=$$('.sell-type-card'); const select=$('#sellCategorySelect');
    const draft=formDraft('sellFormDraft');
    const setType=(type, preferredCategory='')=>{
      type = type === 'spare' ? 'spare' : 'machine';
      cards.forEach(card=>card.classList.toggle('active', card.dataset.sellCard===type));
      const radio=form.querySelector(`input[name="sell_type"][value="${type}"]`); if(radio) radio.checked=true;
      if(select){
        const old=preferredCategory || select.value || draft.category || '';
        select.innerHTML=categoryOptionsFor(type);
        if([...select.options].some(o=>o.value===old)) select.value=old;
      }
      form.querySelectorAll('.machine-fields').forEach(el=>el.classList.toggle('hidden-fields', type!=='machine'));
      form.querySelectorAll('.spare-fields').forEach(el=>el.classList.toggle('hidden-fields', type!=='spare'));
      saveFormDraft(form,'sellFormDraft');
    };
    cards.forEach(card=>card.addEventListener('click',()=>setType(card.dataset.sellCard||'machine')));
    form.querySelectorAll('input[name="sell_type"]').forEach(r=>r.addEventListener('change',()=>setType(r.value)));
    setType(draft.sell_type || form.querySelector('input[name="sell_type"]:checked')?.value || 'machine', draft.category || '');
  }
  function matchesProductType(p,type='all'){
    if(type==='all') return true;
    const category=String(p.category||'').toLowerCase();
    const sellType=String(p.sell_type||'').toLowerCase();
    const cat=AGRI_CATEGORIES.find(c=>c.title.toLowerCase()===category);
    if(type==='machine') return sellType==='machine' || cat?.group==='Machines';
    if(type==='spare') return sellType==='spare' || cat?.group==='Spare Parts';
    return true;
  }
  function suggestionItems(query=''){
    const q=String(query||'').trim().toLowerCase();
    if(!q) return [];
    const names=[...visibleProducts().flatMap(p=>[p.title,p.category,p.brand,p.model].filter(Boolean)), ...AGRI_CATEGORIES.map(c=>c.title)];
    return [...new Set(names.map(x=>String(x).trim()).filter(Boolean))]
      .filter(x=>x.toLowerCase().startsWith(q))
      .sort((a,b)=>a.localeCompare(b))
      .slice(0,9);
  }
  function updateSearchSuggestions(){
    const input=$('#searchInput'), wrap=$('#searchSuggest');
    if(!input||!wrap) return;
    if(document.activeElement!==input){ wrap.classList.remove('show'); return; }
    const items=suggestionItems(input.value);
    wrap.innerHTML=items.map(x=>`<button type="button" data-suggest="${esc(x)}">${esc(x)}</button>`).join('');
    wrap.classList.toggle('show', items.length>0);
  }
  function openGallery(id,index=0){
    const p=state.products.find(x=>String(x.id)===String(id)); if(!p)return;
    const imgs=productImages(p); window.__hpGallery={id:String(id),index:Number(index)||0,imgs};
    const lb=document.getElementById('photoLightbox'); const img=document.getElementById('lightboxImage'); const cnt=document.getElementById('lightboxCount');
    if(!lb||!img)return; img.src=imgs[window.__hpGallery.index]||imgs[0]; if(cnt)cnt.textContent=`${window.__hpGallery.index+1} / ${imgs.length}`; lb.classList.add('show'); document.body.classList.add('lightbox-open');
  }
  function stepGallery(delta){ const g=window.__hpGallery; if(!g||!g.imgs?.length)return; g.index=(g.index+delta+g.imgs.length)%g.imgs.length; const img=document.getElementById('lightboxImage'); const cnt=document.getElementById('lightboxCount'); if(img)img.src=g.imgs[g.index]; if(cnt)cnt.textContent=`${g.index+1} / ${g.imgs.length}`; }
  function closeGallery(){ document.getElementById('photoLightbox')?.classList.remove('show'); document.body.classList.remove('lightbox-open'); }

  function filterMarket(){
    const q=($('#searchInput')?.value||'').toLowerCase();
    const type=$('#typeFilter')?.value||'all'; sessionStorage.hp_market_type=type;
    const cat=$('#categoryFilter')?.value||''; sessionStorage.hp_market_category=cat;
    const sort=$('#sortFilter')?.value||'all';
    let arr=visibleProducts().filter(p=>matchesProductType(p,type)&&(!q||[p.title,p.category,p.brand,p.model,p.condition].join(' ').toLowerCase().includes(q))&&(!cat||String(p.category||'').toLowerCase().includes(String(cat).toLowerCase()) || String(p.title||'').toLowerCase().includes(String(cat).toLowerCase())));
    if(sort==='condition_new') arr=arr.filter(p=>String(p.condition||'').toLowerCase()==='new');
    if(sort==='condition_used') arr=arr.filter(p=>String(p.condition||'').toLowerCase()==='used');
    if(sort==='price_low') arr.sort((a,b)=>Number(a.price||0)-Number(b.price||0));
    if(sort==='price_high') arr.sort((a,b)=>Number(b.price||0)-Number(a.price||0));
    const grid=$('#marketGrid'); if(grid){ grid.innerHTML=localizeHtml(arr.map(productCard).join('')||empty('No matching products')); if(window.HP_APPLY_LANGUAGE) setTimeout(window.HP_APPLY_LANGUAGE,20); }
    updateSearchSuggestions();
  }
  function animateCounters(){ $$('[data-count]').forEach(el=>{ const target=Number(el.dataset.count||0); let n=0; const step=Math.max(1,Math.ceil(target/40)); const timer=setInterval(()=>{n+=step; if(n>=target){n=target;clearInterval(timer)} el.textContent=n.toLocaleString('en-IN');},18); }); }
  window.HP={route,addToCart,buyNow,toggleWishlist,changeQty,removeCart,approveProduct,rejectProduct,removeProduct,banProduct,restoreProduct,deleteOwnProduct,approveSeller,rejectSeller,banSeller,restoreSeller,setOrderStatus,setReportStatus,setContactStatus,loginGoogle,sendPhoneOtp,verifyPhoneOtp,forgotPassword,getOtpPhone,purchaseMembership,savePayoutAccount,requestPayout,setPayoutStatus,saveAdminIdentity,saveCarouselSlide,toggleCarouselSlide,deleteCarouselSlide,equipBadge,openGallery,closeGallery,stepGallery};
  document.addEventListener('DOMContentLoaded',init);
})();
