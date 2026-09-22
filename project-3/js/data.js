/* ---------- data/menu.js (Arch §3.1) ---------- */
const CATEGORIES = [
  { id: "starters",  label: "Starters" },
  { id: "bbq",       label: "BBQ & Grill" },
  { id: "karahi",    label: "Karahi & Handi" },
  { id: "mains",     label: "Main Course" },
  { id: "rice",      label: "Rice & Biryani" },
  { id: "breads",    label: "Breads" },
  { id: "desserts",  label: "Desserts" },
  { id: "beverages", label: "Beverages" }
];

const MENU = [
  { id:"s-soup",    name:"Chicken Corn Soup",      category:"starters", price:250,  description:"Silky chicken and sweet corn soup, finished with egg swirl and spring onion.", image:IMG("photo-1547592180-85f173990554"), tags:["best-seller"], available:true },
  { id:"s-wings",   name:"Crispy Chicken Wings (6 pc)", category:"starters", price:480, description:"Double-fried wings tossed in our signature spicy glaze, served with garlic mayo.", image:IMG("photo-1555939594-58d7cb561ad1"), tags:["spicy"], available:true },
  { id:"s-fries",   name:"Masala Fries",           category:"starters", price:380,  description:"Golden fries dusted with chaat masala and fresh coriander.", image:IMG("photo-1573080496219-bb080dd4f877"), tags:["veg"], available:true },
  { id:"s-samosa",  name:"Punjabi Samosa (4 pc)",  category:"starters", price:200,  description:"Crisp pastry, spiced potato and pea filling, tamarind chutney on the side.", image:IMG("photo-1601050690597-df0568f70950"), tags:["veg","best-seller"], available:true },

  { id:"b-tikka",   name:"Chicken Tikka (Leg)",    category:"bbq", price:450, description:"Overnight-marinated leg piece, charred over open coals.", image:IMG("photo-1598103442097-8b74394b95c6"), tags:["spicy","best-seller"], available:true },
  { id:"b-seekh",   name:"Seekh Kebab (4 pc)",     category:"bbq", price:550, description:"Hand-minced beef kebabs with green chilli and roasted spices.", image:IMG("photo-1555939594-58d7cb561ad1"), tags:["spicy"], available:true },
  { id:"b-malai",   name:"Malai Boti",             category:"bbq", price:650, description:"Cream-and-cheese marinated chicken, melt-in-the-mouth soft.", image:IMG("photo-1504674900247-0877df9cc836"), tags:["chefs-special"], available:true },
  { id:"b-reshmi",  name:"Reshmi Kebab (4 pc)",    category:"bbq", price:620, description:"Velvet-textured chicken kebabs finished with butter and kasuri methi.", image:IMG("photo-1544025162-d76694265947"), tags:[], available:true },

  { id:"k-chk-half",  name:"Chicken Karahi (Half)",   category:"karahi", price:850,  description:"Our signature — desi chicken wok-tossed with tomatoes, ginger and green chilli. The dish that built our name.", image:IMG("photo-1585937421612-70a008356fbe"), tags:["spicy","best-seller"], available:true },
  { id:"k-chk-full",  name:"Chicken Karahi (Full)",   category:"karahi", price:1600, description:"A full karahi for the whole table, served sizzling with fresh naan.", image:IMG("photo-1589302168068-964664d93dc0"), tags:["spicy"], available:true },
  { id:"k-mut-half",  name:"Mutton Karahi (Half)",    category:"karahi", price:1450, description:"Tender mutton on the bone, slow-rendered in its own fat and spices.", image:IMG("photo-1565557623262-b51c2513a641"), tags:["chefs-special"], available:true },
  { id:"k-white",     name:"White Chicken Karahi (Half)", category:"karahi", price:950, description:"Cream, black pepper and green chilli — rich, gentle and aromatic.", image:IMG("photo-1631452180519-c014fe946bc7"), tags:[], available:true },
  { id:"k-handi",     name:"Chicken Handi (Half)",    category:"karahi", price:900,  description:"Boneless chicken in a clay handi with yoghurt, cream and butter.", image:IMG("photo-1589302168068-964664d93dc0"), tags:["best-seller"], available:true },
  { id:"k-mut-handi", name:"Mutton Handi (Half)",     category:"karahi", price:1500, description:"Mutton handi, finished tableside-style with julienned ginger.", image:IMG("photo-1565557623262-b51c2513a641"), tags:["chefs-special"], available:true },

  { id:"m-chk-qorma", name:"Chicken Qorma",     category:"mains", price:420, description:"Classic wedding-style qorma — browned onions, whole spices, sealed pot.", image:IMG("photo-1512058564366-18510be2db19"), tags:["best-seller"], available:true },
  { id:"m-mut-qorma", name:"Mutton Qorma",      category:"mains", price:650, description:"Slow-braised mutton in a rich, dark onion gravy.", image:IMG("photo-1504674900247-0877df9cc836"), tags:[], available:true },
  { id:"m-dal",       name:"Dal Makhani",       category:"mains", price:350, description:"Black lentils simmered overnight, finished with butter and cream.", image:IMG("photo-1540189549336-e6e99c3679fe"), tags:["veg"], available:true },
  { id:"m-palak",     name:"Palak Paneer",      category:"mains", price:450, description:"Fresh spinach and soft paneer, tempered with garlic and cumin.", image:IMG("photo-1512621776951-a57141f2eefd"), tags:["veg"], available:true },
  { id:"m-mix",       name:"Mixed Vegetables",  category:"mains", price:320, description:"Seasonal vegetables cooked home-style with whole spices.", image:IMG("photo-1546069901-ba9599a7e63c"), tags:["veg"], available:true },

  { id:"r-biryani", name:"Chicken Biryani",   category:"rice", price:350, description:"Fragrant long-grain rice, saffron, and our whole-spice masala. Served with raita.", image:IMG("photo-1606491956689-2ea866880c84"), tags:["spicy","best-seller"], available:true },
  { id:"r-sindhi",  name:"Sindhi Biryani",    category:"rice", price:400, description:"The bolder cousin — extra chillies, potatoes, and a proper masala kick.", image:IMG("photo-1512058564366-18510be2db19"), tags:["spicy"], available:true },
  { id:"r-pulao",   name:"Chicken Pulao",     category:"rice", price:380, description:"Delicate yakhni pulao with tender chicken and whole spices.", image:IMG("photo-1512058564366-18510be2db19"), tags:[], available:true },

  { id:"br-naan",    name:"Plain Naan",    category:"breads", price:60,  description:"Tandoor-fresh, brushed lightly with ghee.", image:IMG("photo-1590674899484-d5640e854abe"), tags:["veg"], available:true },
  { id:"br-garlic",  name:"Garlic Naan",   category:"breads", price:120, description:"Topped with garlic butter and coriander — dangerously good.", image:IMG("photo-1590674899484-d5640e854abe"), tags:["veg","chefs-special"], available:true },
  { id:"br-roghni",  name:"Roghni Naan",   category:"breads", price:100, description:"Sesame-topped, slightly sweet, made for mopping up karahi.", image:IMG("photo-1590674899484-d5640e854abe"), tags:["veg"], available:true },

  { id:"d-kheer",  name:"Kheer",              category:"desserts", price:200, description:"Slow-reduced rice pudding with cardamom and pistachio, served chilled.", image:IMG("photo-1488477181946-6428a0291777"), tags:["veg","best-seller"], available:true },
  { id:"d-jamun",  name:"Gulab Jamun (2 pc)", category:"desserts", price:150, description:"Warm, soaked in rose syrup — the only right way to end a karahi.", image:IMG("photo-1551024506-0bccd828d307"), tags:["veg"], available:true },
  { id:"d-halwa",  name:"Gajar ka Halwa",     category:"desserts", price:250, description:"Winter carrots, milk and khoya — served in season, worth the wait.", image:IMG("photo-1565958011703-44f9829ba187"), tags:["veg"], available:true },

  { id:"be-margarita", name:"Mint Margarita",     category:"beverages", price:250, description:"Fresh mint, lime and soda over crushed ice — the karahi's best friend.", image:IMG("photo-1437418747212-8d9709afab22"), tags:[], available:true },
  { id:"be-lime",      name:"Fresh Lime Soda",    category:"beverages", price:150, description:"Sweet, salted, or mixed — your call.", image:IMG("photo-1470337458703-46ad1756a187"), tags:["veg"], available:true },
  { id:"be-chai",      name:"Doodh Patti Chai",   category:"beverages", price:100, description:"Strong, milky, brewed the highway way.", image:IMG("photo-1544787219-7f47ccb76574"), tags:["veg"], available:true },
  { id:"be-soft",      name:"Soft Drink (Regular)", category:"beverages", price:100, description:"Chilled — ask for the day's flavours.", image:IMG("photo-1554866585-cd94860890b7"), tags:[], available:true }
];

/* ---------- data/packages.js (Arch §3.2) ---------- */
const PACKAGES = [
  { id:"essential", tier:"Essential", tagline:"Everything you need, beautifully done.", guestRange:[200,300], priceLabel:"On request",
    features:["Decorated stage & backdrop","Fairy-light canopy","Catering for 10 dishes","Parking for 60+ cars","Dedicated event coordinator"], popular:false },
  { id:"signature", tier:"Signature", tagline:"Our most-loved wedding setup.", guestRange:[200,500], priceLabel:"On request",
    features:["Decorated stage & grand walkway","LED + fairy lighting throughout","Catering for 14+ dishes","Live BBQ counter","Parking for 100+ cars","Bridal room & family suite","Dedicated event coordinator"], popular:true },
  { id:"grand", tier:"Grand", tagline:"The full Roopa Marri experience.", guestRange:[300,500], priceLabel:"On request",
    features:["Premium themed décor","LED stage, sound & hosting","Catering for 18+ dishes","Live BBQ & karahi counters","Valet + parking for 100+ cars","Bridal suite & green room","Photography corner setup","Dedicated event manager"], popular:false }
];

/* ---------- data/gallery.js (Arch §3.3) — online-hosted, same for every visitor ---------- */
const GALLERY = [
  { src:IMG("photo-1519167758481-83f550bb49b3"), alt:"Wedding pavilion in the garden with gold lighting", category:"weddings", caption:"The garden pavilion dressed for a walima" },
  { src:IMG("photo-1555939594-58d7cb561ad1"), alt:"Skewers over open flame at the live BBQ counter", category:"food", caption:"Live BBQ counter at full flame" },
  { src:IMG("photo-1525268323446-0505b6fe7778"), alt:"Garden aisle decorated with flowers at golden hour", category:"garden", caption:"The garden aisle at golden hour" },
  { src:IMG("photo-1585937421612-70a008356fbe"), alt:"Chicken karahi served with naan", category:"food", caption:"Chicken karahi, straight off the fire" },
  { src:IMG("photo-1519225421980-715cb0215aed"), alt:"Wedding table with candles and flowers", category:"weddings", caption:"Gold-and-maroon table settings" },
  { src:IMG("photo-1464366400600-7168b8af9bc3"), alt:"Long banquet table at a corporate dinner", category:"events", caption:"Corporate dinner under the lights" },
  { src:IMG("photo-1606491956689-2ea866880c84"), alt:"Biryani in a traditional handi", category:"food", caption:"Biryani, dum-sealed and fragrant" },
  { src:IMG("photo-1469371670807-013ccf25f16a"), alt:"Open-air wedding ceremony setup in the garden", category:"garden", caption:"An open-air ceremony at dusk" },
  { src:IMG("photo-1492684223066-81342ee5ff30"), alt:"Guests celebrating with sparklers at night", category:"events", caption:"Birthday celebrations on the terrace" },
  { src:IMG("photo-1511795409834-ef04bbd61622"), alt:"Head table setting awaiting the wedding couple", category:"weddings", caption:"The head table, awaiting the couple" },
  { src:IMG("photo-1589302168068-964664d93dc0"), alt:"Full spread of Pakistani dishes", category:"food", caption:"A full Roopa Marri spread" },
  { src:IMG("photo-1437418747212-8d9709afab22"), alt:"Mint margaritas served at the table", category:"events", caption:"Mint margaritas all around" }
];

/* ---------- data/testimonials.js (Arch §3.4) ---------- */
const TESTIMONIALS = [
  { quote:"We booked the Signature package for our daughter's walima. The stage, the lights, the food timing — our guests are still talking about it months later.", name:"Fatima & Imran S.", occasion:"Walima, 2025" },
  { quote:"The chicken karahi tastes exactly like my father remembers from his college days in Hyderabad. Some things shouldn't change, and thankfully this hasn't.", name:"Ahmed R.", occasion:"Regular since 2011" },
  { quote:"One hundred and eighty guests, zero hiccups. Parking, lighting, catering — everything ran like clockwork from the first guest to the last naan.", name:"Bilal K.", occasion:"Corporate annual dinner, 2025" },
  { quote:"I reserved a table for eight in the morning; it was ready at eight in the evening, and they remembered it was our anniversary. That's why we keep coming back.", name:"Sana M.", occasion:"Family dinner, 2026" }
];
