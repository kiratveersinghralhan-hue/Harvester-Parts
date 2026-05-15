(() => {
  const LANG_KEY = 'hp_lang';
  const currentLang = () => localStorage.getItem(LANG_KEY) || 'en';
  const dict = {
    hi: {
      'Categories':'कैटेगरी','About':'हमारे बारे में','Contact':'संपर्क','About Us':'हमारे बारे में','Contact Us':'संपर्क करें','Explore Categories':'कैटेगरी देखें','Buy & sell farm machinery and spare parts.':'कृषि मशीनरी और स्पेयर पार्ट्स खरीदें और बेचें।','Harvester Parts is built for farmers, dealers and workshops to trade new and used agricultural machinery, combine harvester parts, tractor spares, seed drill parts, straw reaper spares and more.':'Harvester Parts किसानों, डीलरों और वर्कशॉप के लिए नया और पुराना कृषि सामान, कंबाइन हार्वेस्टर पार्ट्स, ट्रैक्टर स्पेयर, सीड ड्रिल पार्ट्स, स्ट्रॉ रीपर स्पेयर और बहुत कुछ खरीदने-बेचने का प्लेटफॉर्म है।','Machines and spare parts arranged for quick discovery.':'तेज खोज के लिए मशीनें और स्पेयर पार्ट्स व्यवस्थित।','All agriculture categories':'सभी कृषि कैटेगरी','Machinery, implements and every important spare part.':'मशीनरी, उपकरण और हर जरूरी स्पेयर पार्ट।','Farm Machinery':'कृषि मशीनरी','New and used machines for every stage of farming.':'खेती के हर चरण के लिए नई और पुरानी मशीनें।','Spare Parts':'स्पेयर पार्ट्स','Fast discovery for workshops, dealers and farmers.':'वर्कशॉप, डीलर और किसानों के लिए तेज खोज।','About Harvester Parts':'Harvester Parts के बारे में','India-first marketplace for agricultural machinery and spare parts.':'कृषि मशीनरी और स्पेयर पार्ट्स के लिए भारत-केंद्रित मार्केटप्लेस।','What we do':'हम क्या करते हैं','For farmers':'किसानों के लिए','For dealers & workshops':'डीलरों और वर्कशॉप के लिए','Our promise':'हमारा वादा','Contact Harvester Parts':'Harvester Parts से संपर्क करें','Need help buying, selling or listing spare parts?':'खरीदने, बेचने या स्पेयर पार्ट लिस्ट करने में मदद चाहिए?','Call 9814800017':'9814800017 पर कॉल करें','WhatsApp Support':'WhatsApp सपोर्ट','Email Us':'ईमेल करें','Phone':'फोन','WhatsApp':'WhatsApp','Send a message':'संदेश भेजें','Your name':'आपका नाम','Phone number':'फोन नंबर','Buying help':'खरीदारी सहायता','Selling help':'बेचने में सहायता','Seller verification':'सेलर वेरिफिकेशन','Order support':'ऑर्डर सपोर्ट','Other':'अन्य','Tell us what you need':'हमें बताएं आपको क्या चाहिए','Send Support Request':'सपोर्ट रिक्वेस्ट भेजें','Support request saved. You can also call or WhatsApp us.':'सपोर्ट रिक्वेस्ट सेव हो गई। आप हमें कॉल या WhatsApp भी कर सकते हैं।','Combine Harvester':'कंबाइन हार्वेस्टर','Tractor':'ट्रैक्टर','Seed Drill':'सीड ड्रिल','Straw Reaper':'स्ट्रॉ रीपर','Rotavator & Tillage':'रोटावेटर और टिलेज','Irrigation & Sprayers':'सिंचाई और स्प्रेयर','Belts':'बेल्ट','Bearings':'बेयरिंग','Blades & Cutter Parts':'ब्लेड और कटर पार्ट्स','Shafts & Gears':'शाफ्ट और गियर','Rubber Seals':'रबर सील','Hydraulic Parts':'हाइड्रोलिक पार्ट्स','live listings':'लाइव लिस्टिंग',
      'Harvester Parts connects buyers, sellers and dealers with verified listings, secure checkout, in-app messages and admin approved sellers.':'Harvester पार्ट्स खरीदारों, विक्रेताओं और डीलरों को सत्यापित लिस्टिंग, सुरक्षित चेकआउट, इन-ऐप संदेश और एडमिन-अप्रूव्ड विक्रेताओं से जोड़ता है।',
      'In-app chat protects your platform earnings. Phone numbers and emails are blocked automatically.':'इन-ऐप चैट आपके प्लेटफॉर्म की कमाई सुरक्षित रखती है। फोन नंबर और ईमेल अपने-आप ब्लॉक होते हैं।',
      'Seller/User ID or email':'विक्रेता / यूज़र आईडी या ईमेल',
      'Write message':'संदेश लिखें','Send Message':'संदेश भेजें','Messages':'संदेश','Mobile OTP Login':'मोबाइल OTP लॉगिन','Phone with country code, e.g. +919814800017':'देश कोड के साथ मोबाइल नंबर, जैसे +919814800017','Send OTP':'OTP भेजें','OTP code':'OTP कोड','Verify OTP':'OTP सत्यापित करें','Continue with Google':'Google से जारी रखें','Forgot password?':'पासवर्ड भूल गए?','Create new account':'नया खाता बनाएं','Login / Create Account':'लॉगिन / खाता बनाएं','Email verification may be required after signup.':'साइनअप के बाद ईमेल सत्यापन की जरूरत हो सकती है।','or':'या','Password':'पासवर्ड','Email':'ईमेल',
      'Browse Marketplace':'मार्केट देखें','List Product':'प्रोडक्ट जोड़ें','Search parts, brand, model':'पार्ट, ब्रांड, मॉडल खोजें','All categories':'सभी कैटेगरी','categories':'कैटेगरी','Newest':'नया','Price low':'कम कीमत','Price high':'ज्यादा कीमत','No live catalog. Ask sellers to list products.':'अभी लाइव कैटलॉग नहीं है। विक्रेताओं से प्रोडक्ट लिस्ट करने को कहें।','No matching products':'कोई मिलता-जुलता प्रोडक्ट नहीं',
      'Buy & sell farm parts with confidence.':'भरोसे के साथ फार्म पार्ट्स खरीदें और बेचें।','Verified agricultural marketplace':'प्रमाणित कृषि मार्केटप्लेस','Browse Parts':'पार्ट्स देखें','Sell a Product':'प्रोडक्ट बेचें','Live products':'लाइव प्रोडक्ट','Categories':'कैटेगरी','Verified sellers':'सत्यापित विक्रेता','Orders':'ऑर्डर','Shop by farming need':'खेती की जरूरत के हिसाब से खरीदें','Premium categories for quick discovery.':'तेज खोज के लिए प्रीमियम कैटेगरी।','Recently listed':'नई लिस्टिंग','View all':'सभी देखें',
      'Buyer / Seller':'खरीदार / विक्रेता','Guest':'अतिथि','Home':'होम','Market':'मार्केट','Chat':'चैट','Account':'अकाउंट','Cart':'कार्ट','Login':'लॉगिन','Logout':'लॉगआउट','My Account':'मेरा अकाउंट','My Orders':'मेरे ऑर्डर','Checkout':'चेकआउट','Sell a Part':'पार्ट बेचें','Admin Panel':'एडमिन पैनल','Language':'भाषा',
      'Full name':'पूरा नाम','Gender':'लिंग','Male':'पुरुष','Female':'महिला','Other':'अन्य','Save Profile':'प्रोफाइल सेव करें','List a Product':'प्रोडक्ट लिस्ट करें','Product name':'प्रोडक्ट नाम','Listing price':'लिस्टिंग कीमत','Category e.g. Bearing, Cutter Part':'कैटेगरी जैसे Bearing, Cutter Part','Brand / machine':'ब्रांड / मशीन','Model / compatibility':'मॉडल / फिटमेंट','Weight kg':'वज़न kg','State':'राज्य','District':'ज़िला','City / village':'शहर / गांव','Describe condition, exact location, compatibility':'कंडीशन, exact location और compatibility लिखें','Submit Listing for Approval':'अप्रूवल के लिए लिस्टिंग भेजें','Enter price to see seller payout.':'Seller payout देखने के लिए price डालें।'
    },
    pa: {
      'Categories':'ਕੈਟੇਗਰੀਆਂ','About':'ਸਾਡੇ ਬਾਰੇ','Contact':'ਸੰਪਰਕ','About Us':'ਸਾਡੇ ਬਾਰੇ','Contact Us':'ਸੰਪਰਕ ਕਰੋ','Explore Categories':'ਕੈਟੇਗਰੀਆਂ ਵੇਖੋ','Buy & sell farm machinery and spare parts.':'ਖੇਤੀ ਮਸ਼ੀਨਰੀ ਅਤੇ ਸਪੇਅਰ ਪਾਰਟਸ ਖਰੀਦੋ ਤੇ ਵੇਚੋ।','Harvester Parts is built for farmers, dealers and workshops to trade new and used agricultural machinery, combine harvester parts, tractor spares, seed drill parts, straw reaper spares and more.':'Harvester Parts ਕਿਸਾਨਾਂ, ਡੀਲਰਾਂ ਅਤੇ ਵਰਕਸ਼ਾਪਾਂ ਲਈ ਨਵੀਂ ਤੇ ਪੁਰਾਣੀ ਖੇਤੀ ਮਸ਼ੀਨਰੀ, ਕੰਬਾਈਨ ਹਾਰਵੇਸਟਰ ਪਾਰਟਸ, ਟ੍ਰੈਕਟਰ ਸਪੇਅਰ, ਸੀਡ ਡ੍ਰਿਲ ਪਾਰਟਸ, ਸਟ੍ਰਾ ਰੀਪਰ ਸਪੇਅਰ ਅਤੇ ਹੋਰ ਸਮਾਨ ਖਰੀਦਣ-ਵੇਚਣ ਦਾ ਪਲੇਟਫਾਰਮ ਹੈ।','Machines and spare parts arranged for quick discovery.':'ਜਲਦੀ ਖੋਜ ਲਈ ਮਸ਼ੀਨਾਂ ਅਤੇ ਸਪੇਅਰ ਪਾਰਟਸ ਵਿਵਸਥਿਤ।','All agriculture categories':'ਸਾਰੀਆਂ ਖੇਤੀ ਕੈਟੇਗਰੀਆਂ','Machinery, implements and every important spare part.':'ਮਸ਼ੀਨਰੀ, ਇੰਪਲੀਮੈਂਟਸ ਅਤੇ ਹਰ ਜ਼ਰੂਰੀ ਸਪੇਅਰ ਪਾਰਟ।','Farm Machinery':'ਖੇਤੀ ਮਸ਼ੀਨਰੀ','New and used machines for every stage of farming.':'ਖੇਤੀ ਦੇ ਹਰ ਪੜਾਅ ਲਈ ਨਵੀਆਂ ਅਤੇ ਪੁਰਾਣੀਆਂ ਮਸ਼ੀਨਾਂ।','Spare Parts':'ਸਪੇਅਰ ਪਾਰਟਸ','Fast discovery for workshops, dealers and farmers.':'ਵਰਕਸ਼ਾਪਾਂ, ਡੀਲਰਾਂ ਅਤੇ ਕਿਸਾਨਾਂ ਲਈ ਤੇਜ਼ ਖੋਜ।','About Harvester Parts':'Harvester Parts ਬਾਰੇ','India-first marketplace for agricultural machinery and spare parts.':'ਖੇਤੀ ਮਸ਼ੀਨਰੀ ਅਤੇ ਸਪੇਅਰ ਪਾਰਟਸ ਲਈ ਭਾਰਤ-ਕੇਂਦਰਿਤ ਮਾਰਕੀਟਪਲੇਸ।','What we do':'ਅਸੀਂ ਕੀ ਕਰਦੇ ਹਾਂ','For farmers':'ਕਿਸਾਨਾਂ ਲਈ','For dealers & workshops':'ਡੀਲਰਾਂ ਅਤੇ ਵਰਕਸ਼ਾਪਾਂ ਲਈ','Our promise':'ਸਾਡਾ ਵਾਅਦਾ','Contact Harvester Parts':'Harvester Parts ਨਾਲ ਸੰਪਰਕ ਕਰੋ','Need help buying, selling or listing spare parts?':'ਖਰੀਦਣ, ਵੇਚਣ ਜਾਂ ਸਪੇਅਰ ਪਾਰਟ ਲਿਸਟ ਕਰਨ ਲਈ ਮਦਦ ਚਾਹੀਦੀ ਹੈ?','Call 9814800017':'9814800017 ਤੇ ਕਾਲ ਕਰੋ','WhatsApp Support':'WhatsApp ਸਪੋਰਟ','Email Us':'ਈਮੇਲ ਕਰੋ','Phone':'ਫੋਨ','WhatsApp':'WhatsApp','Send a message':'ਸੁਨੇਹਾ ਭੇਜੋ','Your name':'ਤੁਹਾਡਾ ਨਾਮ','Phone number':'ਫੋਨ ਨੰਬਰ','Buying help':'ਖਰੀਦ ਮਦਦ','Selling help':'ਵੇਚਣ ਦੀ ਮਦਦ','Seller verification':'ਸੇਲਰ ਵੈਰੀਫਿਕੇਸ਼ਨ','Order support':'ਆਰਡਰ ਸਪੋਰਟ','Other':'ਹੋਰ','Tell us what you need':'ਸਾਨੂੰ ਦੱਸੋ ਤੁਹਾਨੂੰ ਕੀ ਚਾਹੀਦਾ ਹੈ','Send Support Request':'ਸਪੋਰਟ ਰਿਕਵੈਸਟ ਭੇਜੋ','Support request saved. You can also call or WhatsApp us.':'ਸਪੋਰਟ ਰਿਕਵੈਸਟ ਸੇਵ ਹੋ ਗਈ। ਤੁਸੀਂ ਸਾਨੂੰ ਕਾਲ ਜਾਂ WhatsApp ਵੀ ਕਰ ਸਕਦੇ ਹੋ।','Combine Harvester':'ਕੰਬਾਈਨ ਹਾਰਵੇਸਟਰ','Tractor':'ਟ੍ਰੈਕਟਰ','Seed Drill':'ਸੀਡ ਡ੍ਰਿਲ','Straw Reaper':'ਸਟ੍ਰਾ ਰੀਪਰ','Rotavator & Tillage':'ਰੋਟਾਵੇਟਰ ਅਤੇ ਟਿਲੇਜ','Irrigation & Sprayers':'ਸਿੰਚਾਈ ਅਤੇ ਸਪ੍ਰੇਅਰ','Belts':'ਬੈਲਟ','Bearings':'ਬੇਅਰਿੰਗ','Blades & Cutter Parts':'ਬਲੇਡ ਅਤੇ ਕਟਰ ਪਾਰਟਸ','Shafts & Gears':'ਸ਼ਾਫਟ ਅਤੇ ਗੀਅਰ','Rubber Seals':'ਰਬਰ ਸੀਲ','Hydraulic Parts':'ਹਾਈਡ੍ਰੌਲਿਕ ਪਾਰਟਸ','live listings':'ਲਾਈਵ ਲਿਸਟਿੰਗ',
      'Harvester Parts connects buyers, sellers and dealers with verified listings, secure checkout, in-app messages and admin approved sellers.':'Harvester Parts ਖਰੀਦਦਾਰਾਂ, ਵਿਕਰੇਤਾਵਾਂ ਅਤੇ ਡੀਲਰਾਂ ਨੂੰ ਤਸਦੀਕਸ਼ੁਦਾ ਲਿਸਟਿੰਗਾਂ, ਸੁਰੱਖਿਅਤ ਚੈੱਕਆਉਟ, ਇਨ-ਐਪ ਸੁਨੇਹਿਆਂ ਅਤੇ ਐਡਮਿਨ-ਅਪ੍ਰੂਵਡ ਵਿਕਰੇਤਾਵਾਂ ਨਾਲ ਜੋੜਦਾ ਹੈ।',
      'In-app chat protects your platform earnings. Phone numbers and emails are blocked automatically.':'ਇਨ-ਐਪ ਚੈਟ ਤੁਹਾਡੀ ਪਲੇਟਫਾਰਮ ਕਮਾਈ ਬਚਾਉਂਦੀ ਹੈ। ਫੋਨ ਨੰਬਰ ਅਤੇ ਈਮੇਲ ਆਪਣੇ-ਆਪ ਬਲਾਕ ਹੋ ਜਾਂਦੇ ਹਨ।',
      'Seller/User ID or email':'ਵਿਕਰੇਤਾ / ਯੂਜ਼ਰ ਆਈਡੀ ਜਾਂ ਈਮੇਲ',
      'Write message':'ਸੁਨੇਹਾ ਲਿਖੋ','Send Message':'ਸੁਨੇਹਾ ਭੇਜੋ','Messages':'ਸੁਨੇਹੇ','Mobile OTP Login':'ਮੋਬਾਈਲ OTP ਲਾਗਇਨ','Phone with country code, e.g. +919814800017':'ਦੇਸ਼ ਕੋਡ ਨਾਲ ਮੋਬਾਈਲ ਨੰਬਰ, ਜਿਵੇਂ +919814800017','Send OTP':'OTP ਭੇਜੋ','OTP code':'OTP ਕੋਡ','Verify OTP':'OTP ਤਸਦੀਕ ਕਰੋ','Continue with Google':'Google ਨਾਲ ਜਾਰੀ ਰੱਖੋ','Forgot password?':'ਪਾਸਵਰਡ ਭੁੱਲ ਗਏ?','Create new account':'ਨਵਾਂ ਖਾਤਾ ਬਣਾਓ','Login / Create Account':'ਲਾਗਇਨ / ਖਾਤਾ ਬਣਾਓ','Email verification may be required after signup.':'ਸਾਈਨਅੱਪ ਤੋਂ ਬਾਅਦ ਈਮੇਲ ਤਸਦੀਕ ਦੀ ਲੋੜ ਹੋ ਸਕਦੀ ਹੈ।','or':'ਜਾਂ','Password':'ਪਾਸਵਰਡ','Email':'ਈਮੇਲ',
      'Browse Marketplace':'ਮਾਰਕੀਟ ਵੇਖੋ','List Product':'ਪ੍ਰੋਡਕਟ ਜੋੜੋ','Search parts, brand, model':'ਪਾਰਟ, ਬ੍ਰਾਂਡ, ਮਾਡਲ ਲੱਭੋ','All categories':'ਸਾਰੀਆਂ ਕੈਟੇਗਰੀਆਂ','categories':'ਕੈਟੇਗਰੀਆਂ','Newest':'ਨਵਾਂ','Price low':'ਘੱਟ ਕੀਮਤ','Price high':'ਵੱਧ ਕੀਮਤ','No live catalog. Ask sellers to list products.':'ਹਾਲੇ live catalog ਨਹੀਂ ਹੈ। ਵਿਕਰੇਤਾਵਾਂ ਨੂੰ product list ਕਰਨ ਲਈ ਕਹੋ।','No matching products':'ਕੋਈ ਮਿਲਦਾ product ਨਹੀਂ',
      'Buy & sell farm parts with confidence.':'ਭਰੋਸੇ ਨਾਲ farm parts ਖਰੀਦੋ ਅਤੇ ਵੇਚੋ।','Verified agricultural marketplace':'ਤਸਦੀਕਸ਼ੁਦਾ ਖੇਤੀ ਮਾਰਕੀਟਪਲੇਸ','Browse Parts':'ਪਾਰਟਸ ਵੇਖੋ','Sell a Product':'ਪ੍ਰੋਡਕਟ ਵੇਚੋ','Live products':'ਲਾਈਵ ਪ੍ਰੋਡਕਟ','Categories':'ਕੈਟੇਗਰੀਆਂ','Verified sellers':'ਤਸਦੀਕਸ਼ੁਦਾ ਵਿਕਰੇਤਾ','Orders':'ਆਰਡਰ','Shop by farming need':'ਖੇਤੀ ਦੀ ਲੋੜ ਮੁਤਾਬਕ ਖਰੀਦੋ','Premium categories for quick discovery.':'ਜਲਦੀ ਖੋਜ ਲਈ ਪ੍ਰੀਮੀਅਮ ਕੈਟੇਗਰੀਆਂ।','Recently listed':'ਨਵੀਆਂ ਲਿਸਟਿੰਗਾਂ','View all':'ਸਾਰੇ ਵੇਖੋ',
      'Buyer / Seller':'ਖਰੀਦਦਾਰ / ਵਿਕਰੇਤਾ','Guest':'ਮਹਿਮਾਨ','Home':'ਹੋਮ','Market':'ਮਾਰਕੀਟ','Chat':'ਚੈਟ','Account':'ਖਾਤਾ','Cart':'ਕਾਰਟ','Login':'ਲਾਗਇਨ','Logout':'ਲਾਗਆਉਟ','My Account':'ਮੇਰਾ ਖਾਤਾ','My Orders':'ਮੇਰੇ ਆਰਡਰ','Checkout':'ਚੈੱਕਆਉਟ','Sell a Part':'ਪਾਰਟ ਵੇਚੋ','Admin Panel':'ਐਡਮਿਨ ਪੈਨਲ','Language':'ਭਾਸ਼ਾ',
      'Full name':'ਪੂਰਾ ਨਾਮ','Gender':'ਲਿੰਗ','Male':'ਮਰਦ','Female':'ਔਰਤ','Other':'ਹੋਰ','Save Profile':'ਪ੍ਰੋਫਾਈਲ ਸੇਵ ਕਰੋ','List a Product':'ਪ੍ਰੋਡਕਟ ਲਿਸਟ ਕਰੋ','Product name':'ਪ੍ਰੋਡਕਟ ਨਾਮ','Listing price':'ਲਿਸਟਿੰਗ ਕੀਮਤ','Category e.g. Bearing, Cutter Part':'ਕੈਟੇਗਰੀ ਜਿਵੇਂ Bearing, Cutter Part','Brand / machine':'ਬ੍ਰਾਂਡ / ਮਸ਼ੀਨ','Model / compatibility':'ਮਾਡਲ / ਫਿਟਮੈਂਟ','Weight kg':'ਵਜ਼ਨ kg','State':'ਰਾਜ','District':'ਜ਼ਿਲ੍ਹਾ','City / village':'ਸ਼ਹਿਰ / ਪਿੰਡ','Describe condition, exact location, compatibility':'ਕੰਡੀਸ਼ਨ, exact location ਅਤੇ compatibility ਲਿਖੋ','Submit Listing for Approval':'ਅਪ੍ਰੂਵਲ ਲਈ ਲਿਸਟਿੰਗ ਭੇਜੋ','Enter price to see seller payout.':'Seller payout ਵੇਖਣ ਲਈ price ਪਾਓ।'
    }
  };
  const exact = (s) => (dict[currentLang()] || {})[s] || s;
  function replaceText(s){
    if(currentLang()==='en') return s;
    const pack = dict[currentLang()] || {};
    let out = String(s || '');
    const trimmed = out.trim();
    if(pack[trimmed]) return out.replace(trimmed, pack[trimmed]);
    Object.keys(pack).sort((a,b)=>b.length-a.length).forEach(k=>{
      if(k.length>2 && out.includes(k)) out = out.split(k).join(pack[k]);
    });
    return out;
  }
  function translateDeep(root=document.body){
    if(currentLang()==='en') return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode(node){
      if(!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      const p=node.parentElement; if(!p || ['SCRIPT','STYLE','TEXTAREA','OPTION'].includes(p.tagName)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }});
    const nodes=[]; while(walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(n=>{ const v=replaceText(n.nodeValue); if(v!==n.nodeValue) n.nodeValue=v; });
    document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(el=>{ const v=replaceText(el.getAttribute('placeholder')); el.setAttribute('placeholder', v); });
    document.querySelectorAll('option').forEach(el=>{ const v=replaceText(el.textContent); if(v!==el.textContent) el.textContent=v; });
    document.querySelectorAll('button, .tab, .badge, .chip').forEach(el=>{ if(el.childElementCount===0){ const v=replaceText(el.textContent); if(v!==el.textContent) el.textContent=v; }});
  }
  function polishAuth(){
    const otp = document.getElementById('otpCodeInput');
    const verify = document.getElementById('verifyOtpBtn');
    const send = document.getElementById('sendOtpBtn');
    if(otp && verify && !otp.dataset.patched){
      otp.dataset.patched='1';
      const sent = sessionStorage.getItem('hp_otp_sent')==='1';
      otp.closest('.phone-login')?.classList.add('premium-phone-login');
      otp.classList.toggle('otp-visible', sent);
      verify.classList.toggle('otp-visible', sent);
    }
    if(send && !send.dataset.otpPatch){
      send.dataset.otpPatch='1';
      send.addEventListener('click',()=>{
        setTimeout(()=>{
          sessionStorage.setItem('hp_otp_sent','1');
          document.getElementById('otpCodeInput')?.classList.add('otp-visible');
          document.getElementById('verifyOtpBtn')?.classList.add('otp-visible');
        },250);
      });
    }
  }
  function run(){ translateDeep(); polishAuth(); }
  document.addEventListener('DOMContentLoaded',()=>{ run(); setTimeout(run,400); setTimeout(run,1200); });
  const mo = new MutationObserver(()=>{ clearTimeout(window.__hpLangPatchTimer); window.__hpLangPatchTimer=setTimeout(run,60); });
  mo.observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:false});
  document.addEventListener('change', e=>{ if(e.target && e.target.id==='languageSelect') setTimeout(run,120); });
})();
