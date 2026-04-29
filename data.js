window.HP_DATA = (() => {
  const img = (q, i=1) => `https://images.unsplash.com/photo-${q}?auto=format&fit=crop&w=1200&q=80&sig=${i}`;
  const categories = [
    ['prime','Power & Prime Movers'],['land','Land Development'],['tillage','Tillage & Soil'],['sowing','Planting & Sowing'],['water','Irrigation & Water'],['nutrient','Fertilizer & Nutrient'],['protection','Crop Protection'],['care','Crop Care'],['harvest','Harvesting'],['post','Post Harvest'],['transport','Transport'],['forage','Hay & Forage'],['livestock','Livestock Field'],['orchard','Orchard'],['smart','Smart Agriculture'],['parts','Spare Parts']
  ];
  const brands = ['Mahindra','Swaraj','Sonalika','John Deere','New Holland','Massey Ferguson','Kubota','CLAAS','Yanmar','Case IH','TAFE','Eicher','Escorts','Preet','Shaktiman','Fieldking','Lemken','Dasmesh','Landforce','Kartar'];
  const states = ['Punjab','Haryana','Uttar Pradesh','Rajasthan','Madhya Pradesh','Maharashtra','Gujarat','Bihar','Tamil Nadu','Telangana','Karnataka','Andhra Pradesh','West Bengal','Kerala','Odisha','Assam','Worldwide'];
  const languages = ['English','हिन्दी','ਪੰਜਾਬੀ','தமிழ்','తెలుగు','ಕನ್ನಡ','বাংলা','ગુજરાતી','मराठी','اردو','മലയാളം','ଓଡ଼ିଆ','অসমীয়া','नेपाली','العربية','Français','Español'];
  const plans = [
    {name:'Starter',price:999,listings:5,boosts:0,tag:'First seller'},
    {name:'Kisan Plus',price:2999,listings:20,boosts:2,tag:'Farmers'},
    {name:'Trader',price:4999,listings:50,boosts:5,tag:'Active sellers'},
    {name:'Dealer Gold',price:7999,listings:120,boosts:12,tag:'Best value'},
    {name:'Royal Dealer',price:11999,listings:250,boosts:25,tag:'Showroom'},
    {name:'Enterprise',price:15999,listings:999,boosts:60,tag:'Multi-city'}
  ];
  const titles = ['Verified Farmer','Rising Seller','Top Dealer','Harvest Pro','Parts Specialist','Royal Trader'];
  const catalogNames = [
    'John Deere 5310 4WD Tractor','Mahindra Arjun Novo 605','Swaraj 744 FE Refined','New Holland Combine TC5.30','CLAAS Crop Tiger Harvester','Preet 987 Combine Harvester','Shaktiman Rotavator 7ft','Fieldking Disc Harrow','Laser Land Leveler Kit','Sonalika Sikander Tractor','Massey Ferguson 241 DI','Kubota MU5502 4WD','Seed Drill 13 Row','Happy Seeder Super SMS','Straw Reaper Heavy Duty','Baler Square Heavy Duty','Power Weeder Petrol','Boom Sprayer 600L','Drone Sprayer Agri Pro','Diesel Pump Set 10HP','Solar Pump Controller','Tractor Tyre 16.9-28','Hydraulic Pump Assembly','Clutch Plate Kit','Combine Cutter Bar','Harvester Chain Set','Gear Box Assembly','Rice Transplanter','Sugarcane Harvester','Potato Digger','Cotton Picker Attachment','Corn Sheller','Grain Dryer Mini','Front End Loader','Farm Trailer 12 Ton','Silage Cutter','Mixer Wagon','Orchard Sprayer','GPS Guidance Kit','Autonomous Mini Tractor'
  ];
  const photoIds = ['1605000797499-95a51c5269ae','1592982537447-7440770cbfc9','1500382017468-9049fed747ef','1499529112087-3cb3b73cec95','1523348837708-15d4a09cfac2','1500937386664-56d1dfef3854','1557234195-bd9f290f0e4d','1464226184884-fa280b87c399'];
  const products = Array.from({length:72}, (_,i)=>{
    const isPart = i%5===0 || i%7===0;
    const condition = i%3===0?'Used':'New';
    const category = categories[i%categories.length];
    const brand = brands[i%brands.length];
    const price = isPart ? (3500 + i*850) : (175000 + i*63500);
    return { id:`P${1000+i}`, name:catalogNames[i%catalogNames.length], category:category[1], categoryId:category[0], brand, model:`${brand.split(' ')[0]}-${(240+i*7)}`, condition:isPart?'Spare Part':condition, type:isPart?'part':'machine', price, oldPrice: Math.round(price*1.12), state:states[i%states.length], district:['Ludhiana','Karnal','Hisar','Jaipur','Indore','Nagpur','Rajkot','Patna','Coimbatore'][i%9], rating:(4+(i%10)/10).toFixed(1), seller:['Royal Agro Traders','Punjab Kisan Mart','GreenLine Dealers','Bharat Harvest Hub','Mandi Machine Co.'][i%5], verified:true, stock:isPart ? 10+i : 1+(i%4), image:`https://images.unsplash.com/photo-${photoIds[i%photoIds.length]}?auto=format&fit=crop&w=1200&q=80`, desc:'Verified listing with inspection-ready details, local enquiry support, finance-ready documents and dealer/farmer contact flow.' }
  });
  return {categories,brands,states,languages,plans,titles,products};
})();
