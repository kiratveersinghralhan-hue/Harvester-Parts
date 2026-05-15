(() => {
  const cfg = window.HP_CONFIG || {};
  const hasConfig = cfg.SUPABASE_URL && !cfg.SUPABASE_URL.includes('YOUR_') && cfg.SUPABASE_ANON_KEY && !cfg.SUPABASE_ANON_KEY.includes('YOUR_');
  const sb = hasConfig && window.supabase ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY) : null;
  const ADMIN_EMAIL = (cfg.ADMIN_EMAIL || 'kiratveersinghralhan@gmail.com').toLowerCase();
  const state = { user:null, profile:null, seller:null, products:[], cart:[], wishlist:[], route:'home', currentProduct:null, lang:localStorage.hp_lang || 'en', stats:{products:0,categories:0,sellers:0,orders:0}, admin:{orders:[],sellers:[],reports:[],plans:[],boosts:[]} };
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const app = $('#app');

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
  function tx(text){ return text; }
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

  // v75: Core renderer stays in clean English. The standalone language patch
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
      home:'Home', market:'Market', sell:'Sell a Part', messages:'Chat', account:'Account',
      cart:'Cart', checkout:'Checkout', orders:'My Orders', admin:'Admin Panel'
    };
    $$('.side-menu button[data-route], .bottom-nav button, .nav-tabs button').forEach(el=>{
      if(el.classList.contains('sell-fab') || el.textContent.trim()==='＋'){ el.dataset.rawText='＋'; el.textContent='＋'; return; }
      const key = routeLabels[el.dataset.route] || el.dataset.i18n || el.dataset.label || el.textContent.trim();
      el.dataset.rawText = key;
      el.textContent = tx(key);
    });
    const label=$('.menu-lang label'); if(label) label.textContent=tx('Language');
    syncMenu(false);
    translateVisibleText(document.body);
    updateCartCount();
  }
  function money(n){return '₹' + Math.round(Number(n||0)).toLocaleString('en-IN')}
  function toast(msg){ const el=$('#toast'); el.textContent=localText(msg); el.classList.add('show'); setTimeout(()=>el.classList.remove('show'),2600); }
  function closeMenu(){ $('#sideMenu')?.classList.remove('open'); $('#backdrop')?.classList.remove('show'); }
  function openMenu(){ $('#sideMenu')?.classList.add('open'); $('#backdrop')?.classList.add('show'); }
  function route(name, params={}){ closeMenu(); if(params.category){ sessionStorage.hp_market_category=params.category; } state.route=name; history.replaceState(null,'','#'+name+(params.id?`/${params.id}`:'')); render(); setTimeout(()=>window.scrollTo({top:0,behavior:'smooth'}),30); }
  function parseRoute(){ const h=location.hash.replace('#',''); if(!h) return ['home']; return h.split('/'); }
  function placeholder(cat='parts'){ const c=(cat||'parts').toLowerCase(); if(c.includes('bearing'))return 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=900&q=75'; if(c.includes('tractor'))return 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=900&q=75'; if(c.includes('harvester'))return 'https://images.unsplash.com/photo-1598514982195-f36b96d1e8d4?auto=format&fit=crop&w=900&q=75'; if(c.includes('rubber'))return 'https://images.unsplash.com/photo-1581091215367-59ab6b292ddb?auto=format&fit=crop&w=900&q=75'; return 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=900&q=75'; }
  function productImage(p){ return (Array.isArray(p.image_urls)&&p.image_urls[0]) || p.image || placeholder(p.category); }
  function platformFee(subtotal){ subtotal=Number(subtotal||0); if(!subtotal) return 0; if(subtotal<=2000) return Math.max(20, Math.round(subtotal*.025)); if(subtotal<=3000) return 100; if(subtotal<=5000) return 200; if(subtotal<=10000) return 350; if(subtotal<=25000) return 750; if(subtotal<=50000) return 1400; if(subtotal<=100000) return 2500; if(subtotal<=500000) return 12000; return Math.min(30000, Math.round(subtotal*.03)); }
  function sellerFee(price){ price=Number(price||0); if(!price)return 0; if(price<=2000)return 50; if(price<=5000)return 200; if(price<=10000)return 500; if(price<=50000)return Math.round(price*.045); if(price<=100000)return Math.round(price*.04); return Math.round(price*.03); }
  function shippingFee(subtotal, method='standard'){ subtotal=Number(subtotal||0); if(!subtotal)return 0; const base = subtotal<=2000?120:subtotal<=10000?250:subtotal<=50000?850:1800; return method==='premium'?Math.round(base*1.8):base; }

  async function init(){
    setTimeout(()=>$('#intro')?.classList.add('hide'),1200);
    if(localStorage.hp_lang_done==='1') $('#languageModal')?.classList.remove('show');
    setTimeout(()=>{ if(localStorage.hp_install_done!=='1') $('#installModal')?.classList.add('show'); },1800);
    bindShell(); applyLang(); await loadSession(); await loadProducts(); loadCart(); loadWishlist(); syncMenu(); render(); setupScroll();
  }
  function bindShell(){
    document.addEventListener('click', e=>{
      const routeEl=e.target.closest('[data-route]');
      if(routeEl){ e.preventDefault(); route(routeEl.dataset.route); return; }
      const close=e.target.closest('[data-close-modal]');
      if(close){ const id=close.dataset.closeModal; $('#'+id)?.classList.remove('show'); if(id==='installModal' && $('#dontShowInstall')?.checked) localStorage.hp_install_done='1'; }
    });
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
    await sb.from('users').upsert({auth_id:state.user.id,email:state.user.email,phone:state.user.phone||'',role:(state.user.email||'').toLowerCase()===ADMIN_EMAIL?'admin':'user',user_uid:'HP-'+state.user.id.replaceAll('-','').slice(0,8).toUpperCase()},{onConflict:'auth_id'});
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
    await loadSession(); syncMenu();
    if(data?.session || state.user){ route('account'); toast('Account created and logged in'); }
    else { route('login'); toast('Account created. Check email to confirm, then login.'); }
  }
  async function login(email,password){
    if(!sb) return toast('Add Supabase keys first');
    const {error}=await sb.auth.signInWithPassword({email,password});
    if(error)return toast(friendlyAuthError(error));
    await loadSession(); await loadProducts(); syncMenu(); route('home'); toast('Logged in');
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
    await loadSession(); syncMenu(); route('home'); toast('Phone login successful');
  }
  async function forgotPassword(email){
    if(!sb) return toast('Add Supabase keys first');
    if(!email) return toast('Enter your email first');
    const {error}=await sb.auth.resetPasswordForEmail(email,{redirectTo: authRedirectUrl() + '#account'});
    if(error) return toast(friendlyAuthError(error));
    toast('Password reset link sent to email');
  }
  async function logout(){ if(sb) await sb.auth.signOut(); state.user=null; state.profile=null; state.seller=null; state.cart=[]; localStorage.hp_cart='[]'; syncMenu(); route('home'); }
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
    $('#menuRole') && ($('#menuRole').textContent=isAdmin?tx('Platform Owner / Admin'):(state.profile?.badge_title || tx('Buyer / Seller')));
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
  
  async function loadProducts(){
    if(sb){
      let q=sb.from('products').select('*, sellers(business_name,status), users(email,full_name,badge_title)');
      const visibleUid = state.user?.id || '00000000-0000-0000-0000-000000000000';
      const {data,error}=await q.or(`status.eq.approved,user_id.eq.${visibleUid}`).order('is_boosted',{ascending:false}).order('created_at',{ascending:false});
      if(!error && data){
        state.products=data;
        const cats=[...new Set(data.map(p=>p.category).filter(Boolean))];
        state.stats.products=data.length;
        state.stats.categories=cats.length || 0;
        state.stats.sellers=[...new Set(data.map(p=>p.user_id||p.seller_id).filter(Boolean))].length || 0;
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
  function addToCart(id, qty=1){ const p=state.products.find(x=>String(x.id)===String(id)); if(!p)return toast('Product not found'); const existing=state.cart.find(i=>String(i.id)===String(id)); if(existing) existing.qty+=qty; else state.cart.push({id:p.id,title:p.title,price:p.price,image:productImage(p),category:p.category,qty}); saveCart(); toast('Added to cart'); }
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


  function home(){
    const cats=AGRI_CATEGORIES;
    const categoryCount = state.stats.categories || cats.length;
    const sellerCount = state.stats.sellers || 0;
    return `<section class="hero"><div><span class="eyebrow">Verified agricultural marketplace</span><h1>Buy & sell farm machinery, implements and spare parts.</h1><p>Harvester Parts is built for farmers, dealers, workshops and machine owners to trade new and used agricultural machinery, combine harvester parts, tractor spares, seed drill parts, straw reaper spares, bearings, belts and more.</p><div class="hero-actions"><button class="primary" data-route="market">Browse Marketplace</button><button class="ghost" data-route="sell">Start Selling</button><button class="ghost" data-route="how">How it Works</button><button class="ghost" data-route="support">Support</button></div></div><div class="hero-card glass"><img src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1200&q=80" alt="Agriculture"><div class="stats"><div class="stat"><b data-count="${state.stats.products||state.products.length}">0</b><span>Live products</span></div><div class="stat"><b data-count="${categoryCount}">0</b><span>Categories</span></div><div class="stat"><b data-count="${sellerCount}">0</b><span>Verified sellers</span></div><div class="stat"><b data-count="${state.stats.orders||0}">0</b><span>Orders</span></div></div></div></section><section><div class="section-head"><h2>Shop by farming need</h2><p class="muted">Professional categories for machines and spare parts.</p></div><div class="agri-category-grid compact">${cats.slice(0,8).map(categoryCard).join('')}</div></section><section class="page-card explain-strip"><div><span class="eyebrow">Why Harvester Parts?</span><h2>Verified sellers first. Better discovery. Safer agriculture trading.</h2><p class="muted">Buy machinery, compare spare parts, send in-app messages, and sell only after admin verification.</p></div><div class="mini-steps"><div><b>01</b><span>Find machinery or part</span></div><div><b>02</b><span>Message or checkout</span></div><div><b>03</b><span>Seller ships after confirmation</span></div></div></section><section><div class="section-head"><h2>Recently listed</h2><button class="ghost" data-route="market">View all</button></div><div class="grid">${state.products.slice(0,6).map(productCard).join('')||empty('No live catalog. Ask sellers to list products.')}</div></section>`;
  }

  
  function market(){
    const categories=[...new Set([...state.products.map(p=>p.category).filter(Boolean), ...AGRI_CATEGORIES.map(c=>c.title)])];
    const selected=sessionStorage.hp_market_category||'';
    const shown=selected?state.products.filter(p=>String(p.category||'').toLowerCase().includes(selected.toLowerCase()) || String(p.title||'').toLowerCase().includes(selected.toLowerCase())):state.products;
    return `<section class="page-card market-head-card"><div class="section-head"><h2>Browse Marketplace</h2><button class="primary" data-route="sell">List Product</button></div><div class="market-tools"><input id="searchInput" placeholder="Search parts, brand, model"><select id="categoryFilter"><option value="">All categories</option>${categories.map(c=>`<option ${c===selected?'selected':''}>${c}</option>`).join('')}</select><select id="sortFilter"><option value="new">Newest</option><option value="low">Price low</option><option value="high">Price high</option></select></div></section><section class="grid" id="marketGrid">${shown.map(productCard).join('')||empty('No live catalog. Ask sellers to list products.')}</section>`;
  }
  
  function productPage(id){ const p=state.products.find(x=>String(x.id)===String(id)); if(!p)return emptyPage('Product not found'); const fee=sellerFee(p.price); return `<section class="product-page"><div class="gallery page-card"><img src="${productImage(p)}" onerror="this.src='${placeholder(p.category)}'" alt="${p.title}"></div><aside class="detail-stack sticky-buy"><div class="page-card"><span class="badge verified">Verified listing</span><h1>${p.title}</h1><p class="muted">${p.category||'Spare part'} • ${p.brand||'Harvester Parts'} ${p.model?`• ${p.model}`:''}</p><div class="price">${money(p.price)}</div><p class="muted">Estimated price. Contact seller inside website for exact final price.</p><div class="actions"><button class="primary" onclick="HP.buyNow('${p.id}')">Buy Now</button><button class="secondary" onclick="HP.addToCart('${p.id}')">Add to Cart</button><button class="ghost" onclick="HP.toggleWishlist('${p.id}')">Wishlist</button><button class="ghost" onclick="HP.route('messages',{id:'${p.id}'})">Message Seller</button></div></div><div class="summary-card"><h3>Buyer protection</h3><div class="summary-row"><span>Platform fee</span><b>Calculated at checkout</b></div><div class="summary-row"><span>Shipping</span><b>Standard / Premium</b></div><div class="summary-row"><span>Seller receives approx.</span><b>${money(Number(p.price||0)-fee)}</b></div></div></aside></section><section class="page-card"><h2>Product details</h2><p>${p.description||'Genuine agricultural spare part listing. Please confirm compatibility, dimensions and condition through in-app message before final purchase.'}</p><div class="stats"><div class="stat"><b>${p.condition||'Stock'}</b><span>Condition</span></div><div class="stat"><b>${p.weight_kg||'—'} kg</b><span>Weight</span></div><div class="stat"><b>${p.state||'India'}</b><span>Location</span></div><div class="stat"><b>${p.views||0}</b><span>Views</span></div></div></section>`; }
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

  function cartPage(){ const totals=getTotals(); return `<section class="checkout-grid"><div class="page-card"><h1>Your Cart</h1>${state.cart.map(item=>`<div class="cart-item"><img src="${item.image}" onerror="this.src='${placeholder(item.category)}'"><div><b>${item.title}</b><p class="muted">${money(item.price)} × ${item.qty}</p></div><div class="qty"><button onclick="HP.changeQty('${item.id}',-1)">−</button><b>${item.qty}</b><button onclick="HP.changeQty('${item.id}',1)">+</button><button class="danger" onclick="HP.removeCart('${item.id}')">Remove</button></div></div>`).join('')||empty('Cart is empty. Add products to continue.')}</div><aside class="summary-card"><h2>Order summary</h2>${summaryRows(totals)}<button class="primary" style="width:100%" data-route="checkout">Proceed to Checkout</button></aside></section>`; }
  function getTotals(method='standard'){ const subtotal=state.cart.reduce((s,i)=>s+Number(i.price||0)*Number(i.qty||1),0); const shipping=shippingFee(subtotal,method); const pf=platformFee(subtotal); const total=subtotal+shipping+pf; return {subtotal,shipping,pf,total}; }
  function summaryRows(t){ return `<div class="summary-row"><span>Subtotal</span><b>${money(t.subtotal)}</b></div><div class="summary-row"><span>Shipping</span><b>${money(t.shipping)}</b></div><div class="summary-row"><span>Platform protection fee</span><b>${money(t.pf)}</b></div><div class="summary-row"><span>Total</span><b>${money(t.total)}</b></div>`; }
  function checkoutPage(){ const totals=getTotals(); return `<section class="checkout-grid"><div class="page-card"><h1>Secure Checkout</h1><div class="notice">Orders are saved in Supabase. Razorpay verification should be connected through Supabase Edge Function before full production launch.</div><form id="checkoutForm" class="form"><input name="name" placeholder="Full name" required><input name="phone" placeholder="Phone number" required><input name="address" placeholder="Complete delivery address" required><input name="pincode" placeholder="Pincode" required><select name="shipping"><option value="standard">Standard delivery</option><option value="premium">Premium / heavy courier</option></select><input name="coupon" placeholder="Coupon code optional"><button class="primary">Place Secure Order</button></form></div><aside class="summary-card"><h2>Payment Summary</h2><div id="checkoutSummary">${summaryRows(totals)}</div><p class="muted">Payment: Razorpay / manual confirmation depending on your active key setup.</p></aside></section>`; }
  async function placeOrder(form){ if(!state.user)return route('login'); if(!state.cart.length)return toast('Cart is empty'); const fd=new FormData(form); const totals=getTotals(fd.get('shipping')); const order={buyer_id:state.user.id,user_id:state.user.id,amount:totals.total,shipping_amount:totals.shipping,platform_fee:totals.pf,status:'pending',buyer_name:fd.get('name'),buyer_phone:fd.get('phone'),address:fd.get('address'),pincode:fd.get('pincode')}; let orderId='local-'+Date.now(); if(sb){ const {data,error}=await sb.from('orders').insert(order).select().single(); if(error)return toast(error.message); orderId=data.id; const items=state.cart.map(i=>({order_id:orderId,product_id:i.id,quantity:i.qty,price:i.price})); await sb.from('order_items').insert(items); }
    if(cfg.RAZORPAY_KEY_ID && !cfg.RAZORPAY_KEY_ID.includes('YOUR_') && window.Razorpay){ const rz=new Razorpay({key:cfg.RAZORPAY_KEY_ID,amount:Math.round(totals.total*100),currency:'INR',name:'Harvester Parts',description:'Order '+orderId,handler:async(resp)=>{ if(sb) await sb.from('orders').update({status:'paid',payment_id:resp.razorpay_payment_id}).eq('id',orderId); state.cart=[]; saveCart(); toast('Payment successful. Order placed.'); route('orders'); }}); rz.open(); } else { state.cart=[]; saveCart(); toast('Order saved. Connect Razorpay key for online payment.'); route('orders'); } }
  function changeQty(id,delta){ const it=state.cart.find(i=>String(i.id)===String(id)); if(!it)return; it.qty+=delta; if(it.qty<=0)state.cart=state.cart.filter(i=>String(i.id)!==String(id)); saveCart(); render(); }
  function removeCart(id){ state.cart=state.cart.filter(i=>String(i.id)!==String(id)); saveCart(); render(); }
  function countryOptions(){
    const list = [
      ['+91','🇮🇳 India'],['+1','🇺🇸 United States / Canada'],['+44','🇬🇧 United Kingdom'],['+61','🇦🇺 Australia'],['+971','🇦🇪 UAE'],['+966','🇸🇦 Saudi Arabia'],['+974','🇶🇦 Qatar'],['+965','🇰🇼 Kuwait'],['+968','🇴🇲 Oman'],['+973','🇧🇭 Bahrain'],['+92','🇵🇰 Pakistan'],['+880','🇧🇩 Bangladesh'],['+977','🇳🇵 Nepal'],['+94','🇱🇰 Sri Lanka'],['+60','🇲🇾 Malaysia'],['+65','🇸🇬 Singapore'],['+66','🇹🇭 Thailand'],['+62','🇮🇩 Indonesia'],['+63','🇵🇭 Philippines'],['+49','🇩🇪 Germany'],['+33','🇫🇷 France'],['+39','🇮🇹 Italy'],['+34','🇪🇸 Spain'],['+31','🇳🇱 Netherlands'],['+27','🇿🇦 South Africa'],['+254','🇰🇪 Kenya'],['+234','🇳🇬 Nigeria'],['+81','🇯🇵 Japan'],['+82','🇰🇷 South Korea'],['+86','🇨🇳 China']
    ];
    return list.map(([code,label])=>`<option value="${code}" ${code==='+91'?'selected':''}>${label} ${code}</option>`).join('');
  }

  function loginPage(){ return `<section class="page-card auth-card"><h1>Login / Create Account</h1><div class="notice auth-notice">Email login works after Supabase Auth is configured. Phone OTP needs Supabase Phone provider + Twilio Verify credentials saved in the dashboard.</div><form id="loginForm" class="form"><input name="email" type="email" autocomplete="email" placeholder="Email" required><input name="password" type="password" autocomplete="current-password" placeholder="Password" required><button class="primary">Login</button><button type="button" class="ghost" id="signupSwitch">Create new account</button><button type="button" class="link-btn" id="forgotBtn">Forgot password?</button></form><div class="auth-divider"><span>or</span></div><button class="google-btn" id="googleLoginBtn">Continue with Google</button><div class="phone-login"><h3>Mobile OTP Login</h3><p class="muted tiny-note">Choose country code, then enter mobile number. Example: 9814800017</p><div class="phone-row"><select id="countryCodeSelect" data-no-translate aria-label="Country code">${countryOptions()}</select><input id="phoneOtpInput" type="tel" inputmode="tel" autocomplete="tel-national" placeholder="Mobile number"></div><button class="ghost" id="sendOtpBtn">Send OTP</button><input id="otpCodeInput" inputmode="numeric" autocomplete="one-time-code" maxlength="8" placeholder="OTP code"><button class="secondary" id="verifyOtpBtn">Verify OTP</button><p class="muted tiny-note otp-help">If OTP fails with Twilio 60200, check the SMS provider credentials in Supabase. The website formats the number before sending.</p></div></section>`; }
  
  function accountPage(){
    if(!state.user)return loginPage();
    const isAdmin=state.profile?.role==='admin'||(state.user.email||'').toLowerCase()===ADMIN_EMAIL;
    const profileName=state.profile?.full_name || state.user.user_metadata?.full_name || '';
    const email=state.user.email || 'Phone login account';
    const fullName=profileName || email;
    const phone=state.profile?.phone || state.user.phone || '';
    const uid=state.profile?.user_uid || ('HP-'+String(state.user.id||'account').replaceAll('-','').slice(0,8).toUpperCase());
    const role=isAdmin?'Platform Owner / Admin':(state.profile?.badge_title || (state.seller?.status==='approved'?'Verified Seller':'Buyer / Seller'));
    const myProducts=state.products.filter(p=>String(p.user_id||'')===String(state.user.id));
    const approvedListings=myProducts.filter(p=>p.status==='approved').length;
    const pendingListings=myProducts.filter(p=>p.status!=='approved').length;
    const sellerStatus=state.seller?.status || (isAdmin?'approved':'not verified');
    const avatarText=(fullName||email||'HP').split(/[\s@.]+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'HP';
    return `<section class="profile-page"><div class="profile-cover page-card"><div class="profile-avatar"><img src="./logo-192.png" alt="Harvester Parts"><span>${avatarText}</span></div><div class="profile-main"><div class="profile-title-row"><div data-no-translate><h1>${fullName}</h1><p>${email}</p></div><span class="badge ${isAdmin?'owner':'verified'}">${role}</span></div><div class="profile-id"><span data-no-translate>${uid}</span> • <span>${sellerStatus}</span></div><div class="profile-stats"><div><b>${myProducts.length}</b><span>Listings</span></div><div><b>${approvedListings}</b><span>Live</span></div><div><b>${state.wishlist.length}</b><span>Wishlist</span></div><div><b>${state.cart.reduce((s,i)=>s+Number(i.qty||1),0)}</b><span>Cart</span></div></div><div class="profile-actions"><button class="primary" data-route="sell">Sell a Part</button><button class="ghost" data-route="orders">My Orders</button>${isAdmin?'<button class="secondary" data-route="admin">Admin Panel</button>':''}</div></div></div><div class="profile-grid"><div class="page-card profile-edit-card"><h2>Profile details</h2><p class="muted">Keep your buyer and seller profile updated for faster support and verification.</p><form id="profileForm" class="form profile-form"><input name="full_name" value="${profileName}" placeholder="Full name"><input name="phone" type="tel" value="${phone}" placeholder="Phone number"><select name="gender"><option value="">Gender</option><option ${state.profile?.gender==='Male'?'selected':''}>Male</option><option ${state.profile?.gender==='Female'?'selected':''}>Female</option><option ${state.profile?.gender==='Other'?'selected':''}>Other</option></select><button class="primary">Save Profile</button></form></div><div class="page-card profile-info-card"><h2>Account overview</h2><div class="info-list"><div><span>User ID</span><b data-no-translate>${uid}</b></div><div><span>Email</span><b data-no-translate>${email}</b></div><div><span>Phone</span><b>${phone || 'Not added'}</b></div><div><span>Seller status</span><b>${sellerStatus}</b></div><div><span>Pending listings</span><b>${pendingListings}</b></div></div></div><div class="page-card profile-info-card"><h2>Quick tools</h2><div class="quick-grid"><button class="ghost" data-route="market">Browse Marketplace</button><button class="ghost" data-route="messages">Chat</button><button class="ghost" data-route="cart">Cart</button><button class="ghost" data-route="contact">Contact Support</button>${state.seller?.status==='approved'||isAdmin?'<button class="secondary" data-route="sell">Add New Listing</button>':'<button class="secondary" data-route="sell">Become Verified Seller</button>'}</div></div><div class="page-card profile-info-card"><h2>Trust & safety</h2><p class="muted">Use website chat and checkout so orders, seller approvals and support history stay protected inside Harvester Parts.</p><div class="trust-pills"><span>Verified sellers</span><span>Admin review</span><span>Secure orders</span></div></div></div></section>`;
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
    return `<form id="sellerVerifyForm" class="form seller-verify-form"><input name="business_name" placeholder="Business / seller name" required><input name="phone" placeholder="Phone number" required><input name="state" placeholder="State" required><input name="district" placeholder="District" required><input name="city" placeholder="City / village" required><textarea name="address" placeholder="Pickup/shop address"></textarea><label class="file-label">Aadhaar front / ID document<input name="aadhaar_front" type="file" accept="image/*"></label><label class="file-label">Shop or stock photo<input name="shop_photo" type="file" accept="image/*"></label><button class="primary">Submit Seller Verification</button></form>`;
  }
  function sellPage(){
    if(!state.user)return loginPage();
    const gate=sellerStatusCard();
    if(gate) return gate;
    return `<section class="page-card sell-head"><span class="eyebrow">Approved seller</span><h1>Sell machinery or spare parts.</h1><p class="muted">Choose what you are selling, set condition, price and exact location. Listing goes to admin approval before appearing live.</p></section><section class="page-card"><form id="sellForm" class="form sell-form"><div class="sell-choice"><label><input type="radio" name="sell_type" value="machine" checked><span><b>Machinery</b><small>Combine harvester, tractor, seed drill, straw reaper, implements</small></span></label><label><input type="radio" name="sell_type" value="spare"><span><b>Spare Part</b><small>Belts, bearings, blades, shafts, gears, hydraulic parts</small></span></label></div><select name="condition" required><option value="New">New</option><option value="Used">Used</option><option value="Refurbished">Refurbished</option><option value="Factory Stock">Factory Stock</option></select><input name="title" placeholder="Product name" required><input name="price" type="number" placeholder="Listing price" required><select name="category" required><option value="Combine Harvester">Combine Harvester</option><option value="Tractor">Tractor</option><option value="Seed Drill">Seed Drill</option><option value="Straw Reaper">Straw Reaper</option><option value="Rotavator & Tillage">Rotavator & Tillage</option><option value="Belts & Chains">Belts & Chains</option><option value="Bearings">Bearings</option><option value="Blades & Cutter Parts">Blades & Cutter Parts</option><option value="Shafts & Gears">Shafts & Gears</option><option value="Rubber Seals & Bushes">Rubber Seals & Bushes</option><option value="Hydraulic Parts">Hydraulic Parts</option></select><input name="brand" placeholder="Brand / machine"><input name="model" placeholder="Model / compatibility"><input name="weight_kg" type="number" step="0.1" placeholder="Weight kg"><input name="state" placeholder="State" required><input name="district" placeholder="District" required><input name="city" placeholder="City / village" required><textarea name="description" placeholder="Describe condition, exact location, compatibility"></textarea><input name="images" type="file" accept="image/*" multiple><div class="notice" id="sellerFeePreview">Enter price to see seller payout.</div><button class="primary">Submit Listing for Approval</button></form></section>`;
  }
  async function submitSellerVerification(form){
    if(!state.user)return route('login');
    const fd=new FormData(form); let aadhaar_front='', shop_photo='';
    async function uploadDoc(field){ const f=fd.get(field); if(!sb||!f||!f.name)return ''; const path=`${state.user.id}/${field}-${Date.now()}-${f.name.replace(/[^a-z0-9.]/gi,'-')}`; const {error}=await sb.storage.from('verification-docs').upload(path,f,{upsert:true}); if(error){ toast(error.message); return ''; } return path; }
    aadhaar_front=await uploadDoc('aadhaar_front'); shop_photo=await uploadDoc('shop_photo');
    const payload={user_id:state.user.id,business_name:fd.get('business_name'),phone:fd.get('phone'),state:fd.get('state'),district:fd.get('district'),city:fd.get('city'),address:fd.get('address'),aadhaar_front,shop_photo,status:'pending',verification_status:'pending'};
    if(sb){ const {error}=await sb.from('sellers').upsert(payload,{onConflict:'user_id'}); if(error)return toast(error.message); }
    state.seller=payload; toast('Seller verification submitted for admin approval'); render();
  }
  async function submitProduct(form){ if(!state.user)return route('login'); const fd=new FormData(form); const price=Number(fd.get('price')||0); let image_urls=[]; const files=[...(fd.getAll('images')||[])].filter(f=>f&&f.name); if(sb&&files.length){ for(const f of files){ const path=`${state.user.id}/${Date.now()}-${f.name.replace(/[^a-z0-9.]/gi,'-')}`; const {error}=await sb.storage.from('product-images').upload(path,f,{upsert:true}); if(!error){ const {data}=sb.storage.from('product-images').getPublicUrl(path); image_urls.push(data.publicUrl); } } }
    const payload={user_id:state.user.id,sell_type:fd.get('sell_type')||'spare',condition:fd.get('condition')||'Used',title:fd.get('title'),price,category:fd.get('category'),brand:fd.get('brand'),model:fd.get('model'),weight_kg:Number(fd.get('weight_kg')||0),state:fd.get('state'),district:fd.get('district'),city:fd.get('city'),description:fd.get('description'),image_urls,status:'pending'};
    if(sb){ const {error}=await sb.from('products').insert(payload); if(error)return toast(error.message); }
    else{ payload.id='local-'+Date.now(); payload.status='approved'; state.products.unshift(payload); localStorage.hp_products=JSON.stringify(state.products); }
    toast('Listing submitted for admin approval'); route('market'); }
  function messagesPage(){ return `<section class="page-card"><h1>Messages</h1><div class="notice">In-app chat protects your platform earnings. Phone numbers and emails are blocked automatically.</div><form id="messageForm" class="form"><input name="to" placeholder="Seller/User ID or email"><textarea name="message" placeholder="Write message"></textarea><button class="primary">Send Message</button></form></section>`; }
  function cleanMessage(m){ return String(m||'').replace(/\b\d{10}\b/g,'[phone blocked]').replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/ig,'[email blocked]').replace(/wa\.me|whatsapp/ig,'[contact link blocked]'); }
  async function sendMsg(form){ if(!state.user)return route('login'); const fd=new FormData(form); const msg=cleanMessage(fd.get('message')); if(sb){ await sb.from('messages').insert({sender_id:state.user.id,receiver_id:null,message:msg}); } toast('Message sent inside platform'); form.reset(); }
  function ordersPage(){ return `<section class="page-card"><h1>Orders</h1><div class="notice">Orders placed through checkout will show here. Admin can manage shipment and payment status from dashboard.</div><div id="ordersList"></div></section>`; }
  async function loadOrders(){ if(!sb||!state.user)return; const {data}=await sb.from('orders').select('*').or(`buyer_id.eq.${state.user.id},user_id.eq.${state.user.id}`).order('created_at',{ascending:false}); $('#ordersList') && ($('#ordersList').innerHTML=localizeHtml((data||[]).map(o=>`<div class="cart-item"><div><b>Order ${String(o.id).slice(0,8)}</b><p>${money(o.amount)} • ${o.status}</p></div><span class="badge">${new Date(o.created_at).toLocaleDateString()}</span></div>`).join('')||empty('No orders yet.'))); }
  function sum(arr,key){ return (arr||[]).reduce((s,x)=>s+Number(x?.[key]||0),0); }
  function adminMoney(n){ return money(Number(n||0)); }
  function adminPage(){
    const isAdmin=state.profile?.role==='admin'||(state.user?.email||'').toLowerCase()===ADMIN_EMAIL;
    if(!state.user)return loginPage();
    if(!isAdmin)return emptyPage('Admin access only');
    const pendingProducts=state.products.filter(p=>p.status==='pending');
    const boostedCount=state.products.filter(p=>p.is_boosted || (p.boost_until && new Date(p.boost_until)>new Date())).length;
    const orders=state.admin.orders||[];
    const sellers=state.admin.sellers||[];
    const reports=state.admin.reports||[];
    const plans=state.admin.plans||[];
    const boosts=state.admin.boosts||[];
    const gross=sum(orders,'amount');
    const paid=sum(orders.filter(o=>o.status==='paid'),'amount');
    const platform=sum(orders,'platform_fee') || Math.round(gross*.04);
    const planRev=sum(plans,'amount') || 0;
    const boostRev=sum(boosts,'amount') || boostedCount*50;
    const today=new Date().toISOString().slice(0,10);
    const todayOrders=orders.filter(o=>(o.created_at||'').slice(0,10)===today).length;
    return `<section class="admin-hero-pro page-card">
      <div class="admin-orb"></div>
      <div class="admin-owner-row"><img src="./logo-192.png" alt=""><div><span class="badge owner">ADMIN CONTROL CENTER</span><h1>Platform Owner Dashboard</h1><p>${state.user.email}</p></div></div>
      <div class="admin-quick-actions"><button class="primary" data-route="sell">List Product</button><button class="secondary" data-route="market">View Marketplace</button><button class="ghost" data-route="orders">Orders</button></div>
    </section>
    <section class="admin-kpi-grid">
      <div class="admin-kpi"><small>Total GMV</small><b>${adminMoney(gross)}</b><span>All checkout value</span></div>
      <div class="admin-kpi"><small>Paid Revenue</small><b>${adminMoney(paid)}</b><span>Paid orders only</span></div>
      <div class="admin-kpi"><small>Platform Fees</small><b>${adminMoney(platform)}</b><span>Buyer + protection fees</span></div>
      <div class="admin-kpi"><small>Boost + Plans</small><b>${adminMoney(boostRev+planRev)}</b><span>Promotion income</span></div>
      <div class="admin-kpi"><small>Today Orders</small><b>${todayOrders}</b><span>New orders today</span></div>
      <div class="admin-kpi"><small>Pending Work</small><b>${pendingProducts.length + sellers.filter(s=>['pending','provisional'].includes(s.status)).length + reports.filter(r=>r.status==='open').length}</b><span>Needs admin review</span></div>
    </section>
    <section class="admin-columns">
      <div class="page-card admin-panel"><div class="section-head compact"><h2>Seller approval queue</h2><span class="badge">${sellers.filter(s=>['pending','provisional'].includes(s.status)).length} pending</span></div><div id="sellerApprovalList">${adminSellerList(sellers)}</div></div>
      <div class="page-card admin-panel"><div class="section-head compact"><h2>Product approval queue</h2><span class="badge">${pendingProducts.length} pending</span></div>${pendingProducts.map(adminProductRow).join('')||empty('No pending products')}</div>
    </section>
    <section class="admin-columns">
      <div class="page-card admin-panel"><div class="section-head compact"><h2>Latest orders</h2><span class="badge">${orders.length}</span></div><div id="adminOrdersList">${adminOrdersList(orders)}</div></div>
      <div class="page-card admin-panel"><div class="section-head compact"><h2>Reports & safety</h2><span class="badge danger-soft">${reports.filter(r=>r.status==='open').length} open</span></div><div id="adminReportsList">${adminReportsList(reports)}</div></div>
    </section>
    <section class="page-card admin-panel"><div class="section-head compact"><h2>Revenue systems</h2><span class="badge owner">Plans • Boosts • Fees</span></div>
      <div class="revenue-mini-grid">
        <div><b>Seller Plans</b><span>${plans.length} purchases</span><strong>${adminMoney(planRev)}</strong></div>
        <div><b>Boosted Listings</b><span>${boostedCount} active / ${boosts.length} logs</span><strong>${adminMoney(boostRev)}</strong></div>
        <div><b>Approved Products</b><span>${state.products.filter(p=>p.status==='approved').length} live</span><strong>${state.products.length} total</strong></div>
        <div><b>Seller Pipeline</b><span>${sellers.length} sellers</span><strong>${sellers.filter(s=>s.status==='approved').length} approved</strong></div>
      </div>
    </section>`;
  }
  function adminSellerList(list=[]){ const pending=(list||[]).filter(s=>['pending','provisional'].includes(s.status)); return localizeHtml(pending.map(s=>`<div class="cart-item seller-approval admin-rich-row"><div class="doc-avatar">${(s.business_name||s.users?.full_name||'S').slice(0,2).toUpperCase()}</div><div><b>${s.business_name||'Seller request'}</b><p>${s.users?.email||''} • ${s.phone||''}</p><small>${[s.city,s.district,s.state].filter(Boolean).join(', ')||'Location not added'} • ${s.status}</small></div><div class="approval-actions"><button class="secondary" onclick="HP.approveSeller('${s.id}','${s.user_id}')">Approve</button><button class="danger" onclick="HP.rejectSeller('${s.id}')">Reject</button></div></div>`).join('')||empty('No pending sellers')); }
  function adminProductRow(p){ return `<div class="cart-item admin-rich-row"><img src="${productImage(p)}" onerror="this.src='${placeholder(p.category)}'"><div><b>${p.title}</b><p>${money(p.price)} • ${p.category||'Product'} • ${[p.city,p.state].filter(Boolean).join(', ')}</p><small>Seller earns approx ${money(Number(p.price||0)-sellerFee(p.price))} • Platform fee ${money(sellerFee(p.price))}</small></div><div class="approval-actions"><button class="secondary" onclick="HP.approveProduct('${p.id}')">Approve</button><button class="danger" onclick="HP.rejectProduct('${p.id}')">Reject</button></div></div>`; }
  function adminOrdersList(orders=[]){ return (orders||[]).slice(0,8).map(o=>`<div class="cart-item admin-order-row"><div><b>Order ${String(o.id).slice(0,8)}</b><p>${money(o.amount)} • ${o.status||'pending'} • ${o.buyer_phone||''}</p><small>${new Date(o.created_at||Date.now()).toLocaleString('en-IN')}</small></div><span class="badge ${o.status==='paid'?'verified':''}">${o.status||'pending'}</span></div>`).join('')||empty('No orders yet'); }
  function adminReportsList(reports=[]){ return (reports||[]).slice(0,8).map(r=>`<div class="cart-item"><div><b>${r.target_type||'Report'} report</b><p>${r.reason||'No reason added'}</p><small>${new Date(r.created_at||Date.now()).toLocaleDateString('en-IN')} • ${r.status||'open'}</small></div><span class="badge danger-soft">${r.status||'open'}</span></div>`).join('')||empty('No reports'); }
  async function loadAdminProData(){
    if(!sb)return;
    const safe=async(fn,fallback=[])=>{try{const {data,error}=await fn(); if(error) return fallback; return data||fallback;}catch(e){return fallback;}};
    state.admin.sellers=await safe(()=>sb.from('sellers').select('*, users(email,full_name,badge_title,role)').order('created_at',{ascending:false}).limit(50));
    state.admin.orders=await safe(()=>sb.from('orders').select('*').order('created_at',{ascending:false}).limit(60));
    state.admin.reports=await safe(()=>sb.from('reports').select('*').order('created_at',{ascending:false}).limit(60));
    state.admin.plans=await safe(()=>sb.from('seller_plans').select('*').order('created_at',{ascending:false}).limit(60));
    state.admin.boosts=await safe(()=>sb.from('boost_purchases').select('*').order('created_at',{ascending:false}).limit(60));
    const wrap=$('#sellerApprovalList'); if(wrap) wrap.innerHTML=adminSellerList(state.admin.sellers);
    const ow=$('#adminOrdersList'); if(ow) ow.innerHTML=adminOrdersList(state.admin.orders);
    const rw=$('#adminReportsList'); if(rw) rw.innerHTML=adminReportsList(state.admin.reports);
  }
  async function loadAdminSellers(){ await loadAdminProData(); }
  async function approveSeller(id,userId){ if(!sb)return; const {error}=await sb.from('sellers').update({status:'approved',verification_status:'approved',approved_at:new Date().toISOString()}).eq('id',id); if(error)return toast(error.message); if(userId) await sb.from('users').update({role:'seller',badge_title:'Verified Seller',badge_color:'green'}).eq('auth_id',userId); toast('Seller approved'); await loadAdminSellers(); }
  async function rejectSeller(id){ if(!sb)return; const {error}=await sb.from('sellers').update({status:'rejected',verification_status:'rejected'}).eq('id',id); if(error)return toast(error.message); toast('Seller rejected'); await loadAdminSellers(); }
  async function approveProduct(id){ if(sb){ const {error}=await sb.from('products').update({status:'approved',approved_at:new Date().toISOString()}).eq('id',id); if(error)return toast(error.message); } const p=state.products.find(x=>String(x.id)===String(id)); if(p)p.status='approved'; toast('Product approved'); render(); }
  async function rejectProduct(id){ if(sb){ const {error}=await sb.from('products').update({status:'rejected'}).eq('id',id); if(error)return toast(error.message); } state.products=state.products.filter(x=>String(x.id)!==String(id)); toast('Product rejected'); render(); }
  function empty(msg){return `<div class="page-card muted" style="grid-column:1/-1">${msg}</div>`} function emptyPage(msg){return `<section class="page-card"><h1>${msg}</h1><button class="primary" data-route="home">Go Home</button></section>`}
  function render(){ const [r,id]=parseRoute(); state.route=r||state.route||'home'; state.currentProduct=id||state.currentProduct; let html=''; if(state.route==='home')html=home(); else if(state.route==='market')html=market(); else if(state.route==='product')html=productPage(state.currentProduct); else if(state.route==='cart')html=cartPage(); else if(state.route==='checkout')html=checkoutPage(); else if(state.route==='login')html=loginPage(); else if(state.route==='account')html=accountPage(); else if(state.route==='sell')html=sellPage(); else if(state.route==='messages')html=messagesPage(); else if(state.route==='orders')html=ordersPage(); else if(state.route==='admin')html=adminPage(); else if(state.route==='categories')html=categoriesPage(); else if(state.route==='about')html=aboutPage(); else if(state.route==='contact')html=contactPage(); else if(state.route==='how')html=howPage(); else if(state.route==='support')html=supportPage(); else html=home(); app.innerHTML=localizeHtml(html); syncMenu(); bindPage(); applyLang(); animateCounters(); if(state.route==='orders')loadOrders(); if(state.route==='admin')loadAdminProData(); }
  function bindPage(){
    $('#loginForm')?.addEventListener('submit',e=>{e.preventDefault(); const fd=new FormData(e.target); login(fd.get('email'),fd.get('password'));});
    $('#signupSwitch')?.addEventListener('click',()=>{ const f=$('#loginForm'); const fd=new FormData(f); const email=fd.get('email'), pass=fd.get('password'); if(!email||!pass)return toast('Enter email and password first'); signup(email,pass,''); });
    $('#forgotBtn')?.addEventListener('click',()=>{ const fd=new FormData($('#loginForm')); forgotPassword(fd.get('email')); });
    $('#googleLoginBtn')?.addEventListener('click',loginGoogle);
    $('#sendOtpBtn')?.addEventListener('click',()=>sendPhoneOtp(getOtpPhone()));
    $('#verifyOtpBtn')?.addEventListener('click',()=>verifyPhoneOtp(getOtpPhone(), $('#otpCodeInput')?.value.trim()));
    $('#profileForm')?.addEventListener('submit',e=>{e.preventDefault();saveProfile(e.target)});
    $('#sellerVerifyForm')?.addEventListener('submit',e=>{e.preventDefault();submitSellerVerification(e.target)});
    $('#sellForm')?.addEventListener('submit',e=>{e.preventDefault();submitProduct(e.target)});
    $('#sellForm input[name="price"]')?.addEventListener('input',e=>{ const price=Number(e.target.value||0); $('#sellerFeePreview').innerHTML=localizeHtml(`Listing price: <b>${money(price)}</b> • Platform marketing fee: <b>${money(sellerFee(price))}</b> • Seller earns approx: <b>${money(price-sellerFee(price))}</b>`); });
    $('#checkoutForm')?.addEventListener('submit',e=>{e.preventDefault();placeOrder(e.target)});
    $('#checkoutForm select[name="shipping"]')?.addEventListener('change',e=>{ $('#checkoutSummary').innerHTML=localizeHtml(summaryRows(getTotals(e.target.value))); });
    $('#messageForm')?.addEventListener('submit',e=>{e.preventDefault();sendMsg(e.target)});
    $('#contactForm')?.addEventListener('submit',e=>{e.preventDefault();sendContact(e.target)});
    $('#searchInput')?.addEventListener('input',filterMarket); $('#categoryFilter')?.addEventListener('change',filterMarket); $('#sortFilter')?.addEventListener('change',filterMarket);
  }
  function filterMarket(){ const q=($('#searchInput')?.value||'').toLowerCase(); const cat=$('#categoryFilter')?.value||''; sessionStorage.hp_market_category=cat; const sort=$('#sortFilter')?.value||'new'; let arr=state.products.filter(p=>(!q||[p.title,p.category,p.brand,p.model].join(' ').toLowerCase().includes(q))&&(!cat||p.category===cat)); if(sort==='low')arr.sort((a,b)=>a.price-b.price); if(sort==='high')arr.sort((a,b)=>b.price-a.price); $('#marketGrid').innerHTML=localizeHtml(arr.map(productCard).join('')||empty('No matching products')); }
  function animateCounters(){ $$('[data-count]').forEach(el=>{ const target=Number(el.dataset.count||0); let n=0; const step=Math.max(1,Math.ceil(target/40)); const timer=setInterval(()=>{n+=step; if(n>=target){n=target;clearInterval(timer)} el.textContent=n.toLocaleString('en-IN');},18); }); }
  window.HP={route,addToCart,buyNow,toggleWishlist,changeQty,removeCart,approveProduct,rejectProduct,approveSeller,rejectSeller,loginGoogle,sendPhoneOtp,verifyPhoneOtp,forgotPassword,getOtpPhone};
  document.addEventListener('DOMContentLoaded',init);
})();
