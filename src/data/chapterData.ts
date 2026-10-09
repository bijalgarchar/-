import { OrganDetail, TasteZone, FoodTasteItem, BeaumontExperimentFood, QuizQuestion, ModelId } from '../types/chapter';

export interface ModelMetadata {
  id: ModelId;
  titleGu: string;
  titleEn: string;
  tagGu: string;
  shortDescGu: string;
  textbookPage: string;
  badgeColor: string;
}

export const CHAPTER_MODELS: ModelMetadata[] = [
  {
    id: 'digestive-system',
    titleGu: 'માનવ પાચનતંત્ર અને ખોરાકની યાત્રા',
    titleEn: 'Human Digestive System & Food Journey',
    tagGu: 'મુખ્ય શરીરરચના',
    shortDescGu: 'મોંથી મળદ્વાર સુધી ખોરાકનું પરિભ્રમણ, લાળરસ અને પાચકરસોની કમાલ 3D માં જુઓ.',
    textbookPage: 'પાન નં. ૨૬ - ૨૭',
    badgeColor: 'amber'
  },
  {
    id: 'tongue-taste',
    titleGu: 'જીભ અને સ્વાદ કેન્દ્રો',
    titleEn: 'Tongue & Taste Buds (4 Tastes)',
    tagGu: 'સ્વાદ કલિકાઓ',
    shortDescGu: 'મીઠો, ખારો, ખાટો અને કડવો સ્વાદ જીભના કયા ભાગ પર પરખાય છે? ખોરાક મૂકીને તપાસો.',
    textbookPage: 'પાન નં. ૨૨ - ૨૫',
    badgeColor: 'emerald'
  },
  {
    id: 'beaumont-stomach',
    titleGu: 'ડો. બ્યુમોન્ટનું પ્રયોગશાળા: બારીવાળું પેટ',
    titleEn: 'Dr. Beaumont & Martin’s Window Stomach',
    tagGu: 'ઐતિહાસિક વિજ્ઞાન',
    shortDescGu: 'ઇ.સ. ૧૮૨૨ નો અસલી પ્રયોગ: પેટમાં ખોરાક ઝડપથી પચે છે કે બહાર પ્યાલામાં? 3D સરખામણી.',
    textbookPage: 'પાન નં. ૩૦ - ૩૧',
    badgeColor: 'rose'
  },
  {
    id: 'glucose-drip',
    titleGu: 'સાનિયાની ગ્લુકોઝ ડ્રિપ અને રક્તપ્રવાહ',
    titleEn: 'Sania’s Glucose Drip & Energy',
    tagGu: 'ઇન્સ્ટન્ટ ઊર્જા',
    shortDescGu: 'ઝાડા-ઉલટી થતાં સાનિયાને ગ્લુકોઝ કેમ ચડાવવું પડ્યું? પાચન વગર તાત્કાલિક તાકાત કેવી રીતે મળે છે?',
    textbookPage: 'પાન નં. ૨૮ - ૨૯',
    badgeColor: 'cyan'
  },
  {
    id: 'chewing-teeth',
    titleGu: 'ચાવવાની કળા: દાંત અને લાળરસ',
    titleEn: 'Chewing & Saliva (32 Chews)',
    tagGu: 'મુખ પાચન',
    shortDescGu: '૩-૪ વાર ચાવવું વિરુદ્ધ ૩૦-૩૨ વાર ચાવવું! રોટલી ચાવતાં મીઠી કેમ લાગે છે?',
    textbookPage: 'પાન નં. ૨૫ - ૨૬',
    badgeColor: 'violet'
  },
  {
    id: 'balanced-diet',
    titleGu: 'સમતોલ આહાર થાળી: રશ્મિ અને જયેશ',
    titleEn: 'Balanced Diet Plate (Rashmi vs Jayesh)',
    tagGu: 'સ્વાસ્થ્ય અને હક',
    shortDescGu: 'પોષણયુક્ત આહાર વિરુદ્ધ જંક ફૂડ. રશ્મિ અને જયેશના શરીર પર ખોરાકની અસર સમજો.',
    textbookPage: 'પાન નં. ૩૨ - ૩૪',
    badgeColor: 'emerald'
  },
  {
    id: 'custom-importer',
    titleGu: 'અસલી 3D મોડેલ લાઇબ્રેરી અને ઇમ્પોર્ટર',
    titleEn: 'Original 3D Model Explorer & Importer',
    tagGu: 'કસ્ટમ 3D',
    shortDescGu: 'ઓરિજિનલ મેડિકલ મૉડેલ્સ (અંગો, કંકાલ, નસો) જુઓ અથવા બહારથી કોઈપણ .glb ફાઈલ / URL અપલોડ કરીને તપાસો.',
    textbookPage: 'સર્વગ્રાહી વિજ્ઞાન',
    badgeColor: 'cyan'
  }
];

export const ORGANS_DATA: OrganDetail[] = [
  {
    id: 'mouth',
    nameGu: 'મોં અને દાંત (Mouth & Teeth)',
    nameEn: 'Mouth, Teeth & Salivary Glands',
    descGu: 'પાચનની શરૂઆત મોંથી જ થાય છે. દાંત ખોરાકને કાપીને ચાવે છે અને લાળગ્રંથિમાંથી લાળરસ (Saliva) ભળે છે.',
    descEn: 'Digestion begins here. Teeth grind food and saliva breaks down starch into simple sugars.',
    position: [0, 2.2, 0.4],
    color: '#f43f5e',
    factsGu: [
      'લાળરસ ખોરાકને પોચો અને ચીકણો બનાવે છે જેથી સરળતાથી ગળી શકાય.',
      'રોટલી કે ભાતને ૩૨ વાર ચાવવાથી લાળરસ સ્ટાર્ચનું ખાંડમાં રૂપાંતર કરે છે, જેથી સ્વાદ મીઠો લાગે છે.'
    ]
  },
  {
    id: 'esophagus',
    nameGu: 'અન્નનળી (Esophagus)',
    nameEn: 'Esophagus / Food Pipe',
    descGu: 'ખોરાક મોંમાંથી ગળા વાટે લગભગ ૨૫ સે.મી. લાંબી નળી દ્વારા જઠરમાં પહોંચે છે.',
    descEn: 'A muscular tube that pushes food bolus from the mouth down to the stomach via peristalsis.',
    position: [0, 1.3, 0.1],
    color: '#fb923c',
    factsGu: [
      'અન્નનળીના સ્નાયુઓ તરંગ જેવો સંકોચન-વિસ્તરણ (Peristalsis) કરીને ખોરાકને નીચે ધકેલે છે.',
      'આપણે ઊંધા માથે હોઈએ તો પણ ખોરાક જઠર તરફ જ જાય છે!'
    ]
  },
  {
    id: 'stomach',
    nameGu: 'જઠર / પેટ (Stomach)',
    nameEn: 'Stomach',
    descGu: 'જે-આકારની કોથળી જેવી રચના. અહીં ખોરાક ૨ થી ૪ કલાક સુધી વલોવાય છે અને પાચકરસો ઉમેરાય છે.',
    descEn: 'J-shaped muscular organ that churns food and secretes strong gastric juices and digestive acids.',
    position: [0.15, 0.4, 0.3],
    color: '#ef4444',
    factsGu: [
      'જઠર ખોરાકને મિક્સરની જેમ વલોવે છે (Churning).',
      'જઠરમાં હાઇડ્રોક્લોરિક એસિડ અને પાચકરસો ખોરાકના જંતુઓ નાશે છે અને પ્રોટીનનું પાચન કરે છે.',
      'ડો. બ્યુમોન્ટે માર્ટિનના પેટમાં કાણું જોઈને આ રહસ્ય સાબિત કર્યું હતું!'
    ]
  },
  {
    id: 'liver',
    nameGu: 'યકૃત (Liver)',
    nameEn: 'Liver & Gallbladder',
    descGu: 'શરીરની સૌથી મોટી ગ્રંથિ. તે પિત્તરસ (Bile) બનાવે છે જે ચરબીના પાચન માટે અત્યંત જરૂરી છે.',
    descEn: 'The body’s chemical factory. Produces bile juice to break down complex dietary fats.',
    position: [-0.35, 0.45, 0.35],
    color: '#b91c1c',
    factsGu: [
      'યકૃત લોહીમાંથી હાનિકારક તત્વોને સાફ કરે છે.',
      'પિત્તાશયમાં પિત્તરસ જમા થાય છે અને જ્યારે ખોરાક આવે ત્યારે આંતરડામાં ઠલવાય છે.'
    ]
  },
  {
    id: 'pancreas',
    nameGu: 'સ્વાદુપિંડ (Pancreas)',
    nameEn: 'Pancreas',
    descGu: 'જઠરની પાછળ આવેલી પાંદડા જેવી ગ્રંથિ. તે ઇન્સ્યુલિન અને શક્તિશાળી પાચક ઉત્સેચકો સ્ત્રાવ કરે છે.',
    descEn: 'Leaf-shaped organ behind the stomach producing insulin and digestive enzymes.',
    position: [0.05, 0.15, 0.05],
    color: '#f59e0b',
    factsGu: [
      'સ્વાદુપિંડ લોહીમાં શર્કરા (ગ્લુકોઝ)નું સ્તર નિયંત્રિત કરે છે.',
      'તેના સ્વાદુરસથી પ્રોટીન, કાર્બોહાઇડ્રેટ્સ અને ચરબી ત્રણેયનું સંપૂર્ણ પાચન થાય છે.'
    ]
  },
  {
    id: 'small-intestine',
    nameGu: 'નાનું આંતરડું (Small Intestine)',
    nameEn: 'Small Intestine',
    descGu: 'લગભગ ૬ થી ૭ મીટર લાંબી ગૂંચળાવાળી નળી! અહીં ખોરાકનું સંપૂર્ણ પાચન અને પોષક તત્વોનું શોષણ થાય છે.',
    descEn: 'A 6-7 meter long coiled tube where maximum digestion occurs and nutrients enter the bloodstream.',
    position: [0, -0.25, 0.3],
    color: '#eab308',
    factsGu: [
      'નામ "નાનું" છે પણ લંબાઈમાં તે મોટા આંતરડા કરતાં ૩ ગણું લાંબુ હોય છે!',
      'આંતરડાની અંદર લાખો નાના આંગળી જેવા રસાંકુરો (Villi) લોહીમાં વિટામિન્સ અને ઊર્જા પહોંચાડે છે.'
    ]
  },
  {
    id: 'large-intestine',
    nameGu: 'મોટું આંતરડું (Large Intestine)',
    nameEn: 'Large Intestine / Colon',
    descGu: 'લગભગ ૧.૫ મીટર લાંબી પહોળી નળી. તે અપાચ્ય ખોરાકમાંથી પાણી અને ક્ષારોનું શોષણ કરે છે.',
    descEn: 'Wider tract that absorbs remaining water and mineral salts from indigestible food mass.',
    position: [0, -0.3, 0.15],
    color: '#84cc16',
    factsGu: [
      'જો મોટું આંતરડું પાણી ન શોષે, તો શરીર નિર્જલીકરણ (Dehydration) નો ભોગ બને છે.',
      'અહીં પાચન ન થયેલો કચરો મળ સ્વરૂપે મળાશયમાં જમા થાય છે.'
    ]
  },
  {
    id: 'rectum',
    nameGu: 'મળાશય અને મળદ્વાર (Rectum & Anus)',
    nameEn: 'Rectum & Anus',
    descGu: 'પાચનતંત્રનો છેલ્લો ભાગ, જ્યાંથી અપાચ્ય કચરો શરીરની બહાર ઉત્સર્જિત થાય છે.',
    descEn: 'Terminal portion of the tract that stores and expels solid digestive waste from the body.',
    position: [0, -0.85, 0.1],
    color: '#65a30d',
    factsGu: [
      'આ દ્વારા શરીરમાં કચરાનો ભરાવો થતો અટકે છે અને શરીર તંદુરસ્ત રહે છે.'
    ]
  }
];

export const TASTE_ZONES: TasteZone[] = [
  {
    id: 'sweet',
    tasteGu: 'ગળ્યો / મીઠો સ્વાદ (Sweet)',
    tasteEn: 'Sweet Taste',
    locationGu: 'જીભનો આગળનો અગ્ર ભાગ (Tip)',
    locationEn: 'Tip of the tongue',
    examplesGu: ['ગોળ', 'ખાંડ', 'ચોકલેટ', 'પાકી કેરી', 'ગુલાબજાંબુ'],
    color: '#ec4899',
    position: [0, -0.4, 1.4]
  },
  {
    id: 'salty',
    tasteGu: 'ખારો સ્વાદ (Salty)',
    tasteEn: 'Salty Taste',
    locationGu: 'જીભની આગળની બંને બાજુઓ (Sides Front)',
    locationEn: 'Front lateral sides',
    examplesGu: ['મીઠું', 'વેફર્સ', 'સેવ-મમરા', 'પાપડ', 'ચીઝ'],
    color: '#06b6d4',
    position: [0.7, -0.1, 0.9]
  },
  {
    id: 'sour',
    tasteGu: 'ખાટો સ્વાદ (Sour)',
    tasteEn: 'Sour Taste',
    locationGu: 'જીભની પાછળની બંને બાજુઓ (Sides Back)',
    locationEn: 'Rear lateral sides',
    examplesGu: ['કાચી આમલી', 'લીંબુનો રસ', 'કાચી કેરી', 'દહીં', 'ટામેટાં'],
    color: '#eab308',
    position: [0.75, 0.25, -0.1]
  },
  {
    id: 'bitter',
    tasteGu: 'કડવો સ્વાદ (Bitter)',
    tasteEn: 'Bitter Taste',
    locationGu: 'જીભનો છેક પાછળનો ભાગ (Back)',
    locationEn: 'Back / Base of the tongue',
    examplesGu: ['કારેલાં', 'લીમડાના પાન', 'મેથીના દાણા', 'દવા', 'કોફી'],
    color: '#22c55e',
    position: [0, 0.5, -0.8]
  }
];

export const FOOD_TASTE_ITEMS: FoodTasteItem[] = [
  {
    id: 'jaggery',
    nameGu: 'ગોળ અને રોટલી',
    nameEn: 'Jaggery & Roti',
    primaryTaste: 'sweet',
    icon: '🍬',
    bookReference: 'હેન્સીએ કહ્યું: "મને ગોળ અને રોટલી આપો."',
    descriptionGu: 'ગોળમાં કુદરતી સુક્રોઝ અને આયર્ન હોય છે. તેનો સ્વાદ જીભના આગળના ટેરવે તરત જ મીઠો જણાય છે.'
  },
  {
    id: 'lemon',
    nameGu: 'લીંબુનો રસ',
    nameEn: 'Lemon Drops',
    primaryTaste: 'sour',
    icon: '🍋',
    bookReference: 'સરોજે લીંબુના રસનાં થોડાં ટીપાં ચમચીમાં લીધાં અને હેન્સીના મોંમાં મૂક્યાં.',
    descriptionGu: 'સાઇટ્રિક એસિડને કારણે જીભની બંને પાછલી બાજુઓ પર તીવ્ર ખાટો સ્વાદ અનુભવાય છે અને મોંમાં પાણી આવે છે.'
  },
  {
    id: 'karela',
    nameGu: 'કારેલાનું શાક',
    nameEn: 'Bitter Gourd (Karela)',
    primaryTaste: 'bitter',
    icon: '🥒',
    bookReference: 'હેન્સીએ કહ્યું: "મા, હું આ કડવાં કારેલાં નહિ ખાઉં."',
    descriptionGu: 'કારેલામાં મોમોર્ડિસિન તત્વ હોય છે. જીભના પાછળના ભાગે કડવો સ્વાદ જણાય છે જે પેટના પાચન અને ડાયાબિટીસ માટે ગુણકારી છે.'
  },
  {
    id: 'salt',
    nameGu: 'મીઠું',
    nameEn: 'Salt',
    primaryTaste: 'salty',
    icon: '🧂',
    bookReference: 'સરોજે કહ્યું: "હું મીઠી અને ખારી વસ્તુઓ પણ ખાઉં છું."',
    descriptionGu: 'સોડિયમ ક્લોરાઇડ જીભની બંને આગલી કિનારીઓ પર ખારો સ્વાદ ઉત્તેજિત કરે છે.'
  },
  {
    id: 'tamarind',
    nameGu: 'કાચી આમલી',
    nameEn: 'Tamarind (Aambli)',
    primaryTaste: 'sour',
    icon: '🍂',
    bookReference: 'હેન્સીએ કહ્યું: "તું આમલી ચાટીને કંટાળી જાય છે? આંબલીનું નામ સાંભળીને તરત જ મોંમાં પાણી આવી ગયું ને!"',
    descriptionGu: 'આંબલી ટાર્ટરિક એસિડ ધરાવે છે. તેનું નામ સાંભળતાં જ લાળગ્રંથિઓ સક્રિય થઈ જાય છે!'
  },
  {
    id: 'fennel',
    nameGu: 'વરિયાળીના બીજ',
    nameEn: 'Fennel Seeds (Variyali)',
    primaryTaste: 'sweet',
    icon: '🌿',
    bookReference: 'જો કોઈ તમારી જીભ પર વરિયાળીનાં થોડાં બીજ મૂકે, તો શું તમે આંખો બંધ કરીને કહી શકો?',
    descriptionGu: 'વરિયાળીમાં સુગંધિત તેલ (એનેથોલ) હોય છે જે સુગંધ અને મીઠાશ બંનેનું મિશ્રણ આપે છે.'
  }
];

export const BEAUMONT_TABLE: BeaumontExperimentFood[] = [
  {
    id: 'raw-milk',
    nameGu: '૧. ઉકાળ્યા વગરનું દૂધ',
    nameEn: 'Unboiled Milk',
    timeStomachGu: '૨ કલાક ૧૫ મિનિટ',
    timeStomachHours: 2.25,
    timeBeakerGu: '૪ કલાક ૪૫ મિનિટ',
    timeBeakerHours: 4.75,
    notesGu: 'પેટમાં ૨ કલાક કરતાં ઓછા સમયમાં પચ્યું જ્યારે પ્યાલામાં તેનાથી બમણો સમય લાગ્યો!'
  },
  {
    id: 'boiled-milk',
    nameGu: '૨. ઉકાળેલું દૂધ',
    nameEn: 'Boiled Milk',
    timeStomachGu: '૨ કલાક ૦૦ મિનિટ',
    timeStomachHours: 2.0,
    timeBeakerGu: '૪ કલાક ૧૫ મિનિટ',
    timeBeakerHours: 4.25,
    notesGu: 'ઉકાળેલું દૂધ પેટમાં ફક્ત ૨ કલાકમાં પચી ગયું.'
  },
  {
    id: 'hard-boiled-egg',
    nameGu: '૩. આખું બાફેલું ઈંડું',
    nameEn: 'Hard Boiled Egg',
    timeStomachGu: '૩ કલાક ૩૦ મિનિટ',
    timeStomachHours: 3.5,
    timeBeakerGu: '૮ કલાક ૦૦ મિનિટ',
    timeBeakerHours: 8.0,
    notesGu: 'બાફેલા ઈંડાનું પ્રોટીન પેટમાં ૩.૫ કલાકમાં પચે છે પણ બહાર પ્યાલામાં ૮ કલાક સુધી પણ બરાબર પચતું નથી.'
  },
  {
    id: 'soft-boiled-egg',
    nameGu: '૪. અડધું બાફેલું ઈંડું',
    nameEn: 'Soft Boiled Egg',
    timeStomachGu: '૩ કલાક ૦૦ મિનિટ',
    timeStomachHours: 3.0,
    timeBeakerGu: '૬ કલાક ૩૦ મિનિટ',
    timeBeakerHours: 6.5,
    notesGu: 'અડધું બાફેલું હોવાથી પેટમાં જલ્દી પચી ગયું.'
  },
  {
    id: 'raw-whipped-egg',
    nameGu: '૫. કાચું ઈંડું, ફીણેલું',
    nameEn: 'Raw Egg, Whipped',
    timeStomachGu: '૨ કલાક ૦૦ મિનિટ',
    timeStomachHours: 2.0,
    timeBeakerGu: '૪ કલાક ૧૫ મિનિટ',
    timeBeakerHours: 4.25,
    notesGu: 'ફીણેલું હોવાથી પાચકરસો ઝડપથી ભળી ગયા.'
  },
  {
    id: 'raw-egg',
    nameGu: '૬. કાચું ઈંડું',
    nameEn: 'Raw Plain Egg',
    timeStomachGu: '૧ કલાક ૩૦ મિનિટ',
    timeStomachHours: 1.5,
    timeBeakerGu: '૪ કલાક ૦૦ મિનિટ',
    timeBeakerHours: 4.0,
    notesGu: 'પેટમાં સૌથી ઝડપી ૧ કલાક ૩૦ મિનિટમાં પચી ગયું!'
  }
];

export const CHAPTER_QUIZ: QuizQuestion[] = [
  {
    id: 1,
    questionGu: 'પાચનની શરૂઆત શરીરના કયા અંગથી થાય છે?',
    optionsGu: ['જઠર (Stomach)', 'મોં (Mouth)', 'નાનું આંતરડું (Small Intestine)', 'અન્નનળી (Esophagus)'],
    correctIndex: 1,
    explanationGu: 'પાચન મોંથી જ શરૂ થાય છે. દાંત ખોરાકને ચાવે છે અને લાળરસ સ્ટાર્ચનું ખાંડમાં રૂપાંતર કરે છે.',
    modelTarget: 'digestive-system'
  },
  {
    id: 2,
    questionGu: 'જીભના કયા ભાગ પર ગળ્યો (મીઠો) સ્વાદ સૌથી વધુ પરખાય છે?',
    optionsGu: ['જીભના છેક પાછળના ભાગે', 'જીભની આગળના અગ્ર ભાગે (Tip)', 'જીભની બંને પાછલી બાજુઓ પર', 'જીભની નીચે'],
    correctIndex: 1,
    explanationGu: 'મીઠો સ્વાદ જીભના આગળના ટેરવા (Tip) પર સૌથી ઝડપી અને ચોક્કસ પરખાય છે.',
    modelTarget: 'tongue-taste'
  },
  {
    id: 3,
    questionGu: 'ખોરાકને ૩૦ થી ૩૨ વખત ચાવવાથી શું ફાયદો થાય છે?',
    optionsGu: ['દાંત ઘસાઈ જાય છે', 'લાળરસ ભળીને ખોરાક મીઠો અને સરળતાથી પચી જાય તેવો બને છે', 'ખોરાકનો સ્વાદ જતો રહે છે', 'પેટમાં દુખાવો થાય છે'],
    correctIndex: 1,
    explanationGu: 'વધુ વખત ચાવવાથી લાળરસ સંપૂર્ણ ભળે છે, જેથી ખોરાક પોચો બને છે અને જઠરમાં ઝડપથી પચી જાય છે.',
    modelTarget: 'chewing-teeth'
  },
  {
    id: 4,
    questionGu: 'ડો. બ્યુમોન્ટે માર્ટિનના પેટ પર પ્રયોગ કરીને શું સાબિત કર્યું?',
    optionsGu: ['પેટ કરતાં બહાર પ્યાલામાં ખોરાક ઝડપી પચે છે', 'પેટમાં ખોરાક બહારના પ્યાલા કરતાં ઘણો ઝડપથી પચે છે કારણ કે પેટ ખોરાકને વલોવે છે', 'દૂધ ક્યારેય પચતું નથી', 'પાચન માત્ર રાત્રે જ થાય છે'],
    correctIndex: 1,
    explanationGu: 'પેટમાં સ્નાયુઓના સતત વલોવાટ અને ૩૦°C તાપમાનના પાચકરસોને લીધે ખોરાક અડધાથી પણ ઓછા સમયમાં પચી જાય છે.',
    modelTarget: 'beaumont-stomach'
  },
  {
    id: 5,
    questionGu: 'સાનિયાને ઝાડા-ઉલટી થવાથી ડોક્ટરે ગ્લુકોઝ બોટલ કેમ ચડાવી?',
    optionsGu: ['તેને ભૂખ ન લાગે તે માટે', 'શરીરમાંથી પાણી અને ક્ષારો ઓછા થઈ ગયા હોવાથી પાચન વગર તરત તાકાત આપવા', 'તેને ઊંઘ આવી જાય તે માટે', 'તાવ ઓછો કરવા'],
    correctIndex: 1,
    explanationGu: 'ઝાડા-ઉલટીથી શરીર કમજોર થઈ જાય છે. ગ્લુકોઝ સીધું લોહીમાં ભળીને પાચનક્રિયાની રાહ જોયા વગર તરત ઊર્જા આપે છે.',
    modelTarget: 'glucose-drip'
  },
  {
    id: 6,
    questionGu: 'પુસ્તકમાં આપેલા ૭ વર્ષના જયેશને કયો ખોરાક ભાવતો હતો અને તેની શી અસર થઈ?',
    optionsGu: ['દાળ-ભાત, શાક-રોટલી જેથી તે ખૂબ દોડી શકતો', 'ચિપ્સ, બર્ગર, પિઝા અને ઠંડા પીણાં જેથી તેનું શરીર જાડું-બેડોળ બન્યું અને પગ દુખતા', 'માત્ર ફળો જેથી તે પાતળો રહ્યો', 'માત્ર દૂધ'],
    correctIndex: 1,
    explanationGu: 'જયેશ ઘરનો સમતોલ આહાર ખાતો ન હતો અને જંક ફૂડ ખાવાથી તે ખૂબ વહેલો થાકી જતો અને જાડો થઈ ગયો હતો.',
    modelTarget: 'balanced-diet'
  }
];

export const GLOSSARY_TERMS = [
  {
    termGu: 'પાચકરસ (Gastric / Digestive Juices)',
    termEn: 'Digestive Enzymes & Acids',
    meaningGu: 'જઠર અને આંતરડામાં ઉત્પન્ન થતા એસિડ અને ઉત્સેચકો જે જટિલ ખોરાકને સરળ તત્વોમાં તોડે છે.'
  },
  {
    termGu: 'લાળરસ (Saliva)',
    termEn: 'Salivary Secretion',
    meaningGu: 'મોંની લાળગ્રંથિમાંથી નીકળતું પ્રવાહી જેમાં ટાયલિન ઉત્સેચક હોય છે, જે રોટલી/ભાતના સ્ટાર્ચને મીઠી શર્કરામાં ફેરવે છે.'
  },
  {
    termGu: 'સ્વાદ કલિકાઓ (Taste Buds / Papillae)',
    termEn: 'Taste Buds',
    meaningGu: 'જીભની સપાટી પર આવેલા નાના ટેકરા જેવા સંવેદનાત્મક કોષો જે સ્વાદ ઓળખી મગજને સંદેશો મોકલે છે.'
  },
  {
    termGu: 'ગ્લુકોઝ (Glucose)',
    termEn: 'Simple Sugar',
    meaningGu: 'સૌથી સરળ શર્કરા જે સીધી રક્તવાહિનીઓમાં શોષાઈને કોષોને ત્વરિત તાકાત (ઇન્સ્ટન્ટ એનર્જી) પૂરી પાડે છે.'
  },
  {
    termGu: 'સમતોલ આહાર (Balanced Diet)',
    termEn: 'Balanced Nutrition',
    meaningGu: 'જે આહારમાં શરીરના વિકાસ માટે જરૂરી કાર્બોહાઇડ્રેટ્સ, પ્રોટીન, વિટામિન, ચરબી, ક્ષાર અને પાણી યોગ્ય માત્રામાં હોય.'
  },
  {
    termGu: 'નિર્જલીકરણ (Dehydration)',
    termEn: 'Dehydration',
    meaningGu: 'ઝાડા કે ઉલટી થવાથી શરીરમાંથી પાણી અને ક્ષારોનું પ્રમાણ ઘટી જવું.'
  }
];
