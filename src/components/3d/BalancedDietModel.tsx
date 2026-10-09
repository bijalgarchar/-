import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import { SceneContainer } from './SceneContainer';
import { sounds } from '../../utils/audio';
import {
  createRotliTexture,
  createSteelTexture,
  createDalTexture,
  createCurdTexture,
  createCucumberTexture,
  createTomatoTexture,
  createBurgerBunTexture,
  createColaTexture
} from '../../utils/thaliTextures';
import { Salad, AlertTriangle, Scale, Sparkles, CheckCircle2, Info } from 'lucide-react';

interface FoodDetail {
  id: string;
  nameGu: string;
  nameEn: string;
  categoryGu: string;
  nutrientsGu: string;
  roleGu: string;
  healthTipGu: string;
}

const HEALTHY_FOODS: Record<string, FoodDetail> = {
  rotli: {
    id: 'rotli',
    nameGu: 'ગરમાગરમ ફુલકા રોટલી (ઘી સાથે)',
    nameEn: 'Phulka Rotlis with Ghee',
    categoryGu: 'કાર્બોહાઇડ્રેટ્સ અને ઊર્જા',
    nutrientsGu: 'જટિલ કાર્બોહાઇડ્રેટ્સ, ફાઇબર, વિટામિન-B',
    roleGu: 'શરીરને આખો દિવસ સતત ઊર્જા પૂરી પાડે છે અને પાચનતંત્ર સારું રાખે છે.',
    healthTipGu: 'ઘઉંના લોટની તાજી રોટલી પાચનમાં હલકી અને પૌષ્ટિક છે.'
  },
  dal: {
    id: 'dal',
    nameGu: 'તુવેરની વઘારેલી દાળ',
    nameEn: 'Gujarati Spiced Tuver Dal',
    categoryGu: 'પ્રોટીનનો મુખ્ય સ્ત્રોત',
    nutrientsGu: 'પ્રોટીન, આયર્ન, ફોલિક એસિડ, જીરું-રાઈના એન્ટીઑકિસડન્ટ્સ',
    roleGu: 'સ્નાયુઓ અને શરીરના નવા કોષોના નિર્માણ માટે અતિ જરૂરી છે.',
    healthTipGu: 'દાળ-ભાતનું મિશ્રણ ઉત્તમ સંપૂર્ણ પ્રોટીન બનાવે છે.'
  },
  sabji: {
    id: 'sabji',
    nameGu: 'લીલું દેશી શાકભાજી (ભીંડા-વટાણા)',
    nameEn: 'Green Vegetable Sabji',
    categoryGu: 'વિટામિન્સ અને ખનિજ ક્ષારો',
    nutrientsGu: 'વિટામિન A, C, ફાઇબર, આયર્ન અને ફોલેટ',
    roleGu: 'રોગપ્રતિકારક શક્તિ વધારે છે અને કબજિયાત અટકાવે છે.',
    healthTipGu: 'ડો. રૂતાએ રશ્મિને રોજ લીલા શાકભાજી ખાવાની સલાહ આપી હતી.'
  },
  curd: {
    id: 'curd',
    nameGu: 'તાજું દેશી દહીં (જીરું પાઉડર સાથે)',
    nameEn: 'Fresh Curd with Cumin',
    categoryGu: 'પ્રોબાયોટિક્સ અને કેલ્શિયમ',
    nutrientsGu: 'કેલ્શિયમ, પ્રોટીન, ફાયદાકારક બેક્ટેરિયા',
    roleGu: 'હાડકાં મજબૂત કરે છે અને આંતરડાના પાચક રસોને સક્રિય રાખે છે.',
    healthTipGu: 'પાચન સુધારવા માટે બપોરના ભોજનમાં દહીં ઉત્તમ છે.'
  },
  rice: {
    id: 'rice',
    nameGu: 'સુગંધી બાસમતી ભાત',
    nameEn: 'Steamed Rice',
    categoryGu: 'સરળ કાર્બોહાઇડ્રેટ્સ',
    nutrientsGu: 'સ્ટાર્ચ, ઊર્જા, ન્યૂનતમ ચરબી',
    roleGu: 'સરળતાથી પચી જાય છે અને ઝડપી ઊર્જા આપે છે.',
    healthTipGu: 'દાળ સાથે ભાત ખાવાથી સંપૂર્ણ એમિનો એસિડ મળે છે.'
  },
  salad: {
    id: 'salad',
    nameGu: 'તાજું કચુંબર (ટામેટાં, કાકડી, લીંબુ)',
    nameEn: 'Fresh Kachumber Salad',
    categoryGu: 'પાચક ફાઇબર અને વિટામિન C',
    nutrientsGu: 'વિટામિન C, પાણી, પોટેશિયમ, રફેજ',
    roleGu: 'પાચનક્રિયા ઝડપી બનાવે છે અને શરીરને હાઇડ્રેટેડ રાખે છે.',
    healthTipGu: 'લીંબુનો રસ ખોરાકમાંથી આયર્નનું શોષણ વધારે છે.'
  },
  jaggery: {
    id: 'jaggery',
    nameGu: 'દેશી ગોળનો ટુકડો',
    nameEn: 'Natural Jaggery Block',
    categoryGu: 'કુદરતી આયર્ન અને ખનિજો',
    nutrientsGu: 'આયર્ન (લોહતત્વ), મેગ્નેશિયમ, પોટેશિયમ',
    roleGu: 'લોહીમાં હિમોગ્લોબિન વધારે છે અને એનિમિયા અટકાવે છે.',
    healthTipGu: 'ભોજન પછી ગોળનો નાનો ટુકડો પાચક રસોને સક્રિય કરે છે.'
  },
  chaas: {
    id: 'chaas',
    nameGu: 'ઠંડી મસાલા છાશ (સ્ટીલ ગ્લાસ)',
    nameEn: 'Chilled Spiced Buttermilk',
    categoryGu: 'પાચક અમૃત અને ઇલેક્ટ્રોલાઇટ્સ',
    nutrientsGu: 'લેક્ટિક એસિડ, પાણી, ખનિજો',
    roleGu: 'પેટને ઠંડક આપે છે અને નિર્જલીકરણ (Dehydration) અટકાવે છે.',
    healthTipGu: 'ગરમીમાં શરીરનું તાપમાન નિયંત્રિત રાખે છે.'
  }
};

const JUNK_FOODS: Record<string, FoodDetail> = {
  burger: {
    id: 'burger',
    nameGu: 'ચીઝ બર્ગર (મેંદાની બ્રેડ)',
    nameEn: 'Cheese Burger',
    categoryGu: 'બિનઆરોગ્યપ્રદ ફાસ્ટ ફૂડ',
    nutrientsGu: 'વધુ પડતી કેલરી, સંતૃપ્ત ચરબી, મેંદો, સોડિયમ',
    roleGu: 'શરીરમાં ચરબી જમા કરે છે અને પાચનને ધીમું પાડે છે.',
    healthTipGu: 'જયેશ આખો દિવસ બર્ગર ખાતો હોવાથી તેનું શરીર બેડોળ બન્યું છે.'
  },
  fries: {
    id: 'fries',
    nameGu: 'તળેલા ફ્રેન્ચ ફ્રાઈઝ (વધુ મીઠું)',
    nameEn: 'Salted French Fries',
    categoryGu: 'ડીપ ફ્રાઈડ જંક ફૂડ',
    nutrientsGu: 'ટ્રાન્સ ફેટ્સ, ઉચ્ચ મીઠું (સોડિયમ), એક્રેલામાઇડ',
    roleGu: 'બ્લડ પ્રેશર વધારે છે અને લોહીની નસોને નુકસાન પહોંચાડે છે.',
    healthTipGu: 'તળેલો ખોરાક પેટમાં ભારેપણું અને સુસ્તી પેદા કરે છે.'
  },
  soda: {
    id: 'soda',
    nameGu: 'ઠંડું સોડા પીણું (૩૯ ગ્રામ ખાંડ)',
    nameEn: 'Sugary Carbonated Cola',
    categoryGu: 'ખાલી કેલરી (ખાંડનો બોમ્બ)',
    nutrientsGu: '૧૦ ચમચી ખાંડ, કૃત્રિમ રંગ, કેફીન, ફોસ્ફોરિક એસિડ',
    roleGu: 'દાંતનું ઇનેમલ ઓગાળે છે અને હાડકાંમાંથી કેલ્શિયમ ઘટાડે છે.',
    healthTipGu: 'જયેશ પાણીને બદલે સોડા પીવે છે, જેનાથી તેના પગમાં સતત દુખાવો થાય છે.'
  },
  chips: {
    id: 'chips',
    nameGu: 'પેકેટના બટાટા ચિપ્સ',
    nameEn: 'Packaged Potato Chips',
    categoryGu: 'પ્રોસેસ્ડ પેકેટ ફૂડ',
    nutrientsGu: 'પ્રિઝર્વેટિવ્સ, સોડિયમ, પામ ઓઇલ',
    roleGu: 'ભૂખ મારી નાખે છે અને સાચું પોષણ મળવા દેતું નથી.',
    healthTipGu: 'બહારનું પેકેટ ફૂડ ખાવાથી બાળકોમાં કુપોષણ થઈ શકે છે.'
  }
};

export const BalancedDietModel: React.FC = () => {
  const [dietMode, setDietMode] = useState<'healthy' | 'junk' | 'compare'>('healthy');
  const [activePersona, setActivePersona] = useState<'rashmi' | 'jayesh'>('rashmi');
  const [selectedFood, setSelectedFood] = useState<FoodDetail>(HEALTHY_FOODS['rotli']);

  const healthyGroupRef = useRef<THREE.Group | null>(null);
  const junkGroupRef = useRef<THREE.Group | null>(null);

  const handleSceneReady = (scene: THREE.Scene) => {
    // ==========================================================
    // 1. ORIGINAL GUJARATI BALANCED THALI (ઓરિજિનલ ગુજરાતી થાળી)
    // ==========================================================
    const healthyGroup = new THREE.Group();
    healthyGroupRef.current = healthyGroup;
    scene.add(healthyGroup);

    // Stainless Steel Platter (ચળકતી સ્ટીલની થાળી)
    const steelMat = new THREE.MeshStandardMaterial({
      map: createSteelTexture(),
      color: 0xe2e8f0,
      metalness: 0.85,
      roughness: 0.22,
      side: THREE.DoubleSide
    });
    const thaliGeo = new THREE.CylinderGeometry(1.35, 1.3, 0.08, 48);
    const thaliPlate = new THREE.Mesh(thaliGeo, steelMat);
    thaliPlate.position.set(0, -0.04, 0);
    thaliPlate.receiveShadow = true;
    healthyGroup.add(thaliPlate);

    // Raised rim of steel thali
    const rimGeo = new THREE.TorusGeometry(1.35, 0.045, 16, 48);
    const thaliRim = new THREE.Mesh(rimGeo, steelMat);
    thaliRim.rotation.x = Math.PI / 2;
    thaliRim.position.set(0, 0.01, 0);
    healthyGroup.add(thaliRim);

    // Katori bowls helper
    const katoriMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      metalness: 0.9,
      roughness: 0.2
    });
    const createKatori = (x: number, z: number) => {
      const kGeo = new THREE.CylinderGeometry(0.32, 0.25, 0.22, 24);
      const kMesh = new THREE.Mesh(kGeo, katoriMat);
      kMesh.position.set(x, 0.11, z);
      kMesh.castShadow = true;
      return kMesh;
    };

    // Katori 1: તુવેર દાળ (Dal)
    const dalKatori = createKatori(-0.75, -0.55);
    const dalSoup = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.3, 0.02, 24),
      new THREE.MeshStandardMaterial({
        map: createDalTexture(),
        roughness: 0.25,
        metalness: 0.1
      })
    );
    dalSoup.position.set(0, 0.09, 0);
    dalKatori.add(dalSoup);
    healthyGroup.add(dalKatori);

    // Katori 2: લીલું શાક (Sabji - Bhindi & Peas)
    const sabjiKatori = createKatori(-0.25, -0.85);
    const sabjiContent = new THREE.Group();
    sabjiContent.position.set(0, 0.08, 0);
    // Green okra pieces & peas
    for (let i = 0; i < 9; i++) {
      const bhindi = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.045, 0.12, 6),
        new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.4 })
      );
      bhindi.position.set((Math.random() - 0.5) * 0.32, 0, (Math.random() - 0.5) * 0.32);
      bhindi.rotation.set(Math.random(), Math.random(), Math.random());
      sabjiContent.add(bhindi);

      const pea = new THREE.Mesh(
        new THREE.SphereGeometry(0.035, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.3 })
      );
      pea.position.set((Math.random() - 0.5) * 0.35, 0.02, (Math.random() - 0.5) * 0.35);
      sabjiContent.add(pea);
    }
    sabjiKatori.add(sabjiContent);
    healthyGroup.add(sabjiKatori);

    // Katori 3: તાજું દહીં (Curd)
    const curdKatori = createKatori(0.35, -0.85);
    const curdSurface = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.3, 0.02, 24),
      new THREE.MeshStandardMaterial({
        map: createCurdTexture(),
        roughness: 0.3
      })
    );
    curdSurface.position.set(0, 0.09, 0);
    curdKatori.add(curdSurface);
    healthyGroup.add(curdKatori);

    // Katori 4: પ્રોટીનયુક્ત કઠોળ - મગ (Sprouted Moong)
    const moongKatori = createKatori(0.85, -0.55);
    const moongGroup = new THREE.Group();
    moongGroup.position.set(0, 0.08, 0);
    for (let i = 0; i < 14; i++) {
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(0.035, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0x65a30d, roughness: 0.35 })
      );
      m.position.set((Math.random() - 0.5) * 0.35, 0.01, (Math.random() - 0.5) * 0.35);
      moongGroup.add(m);
    }
    moongKatori.add(moongGroup);
    healthyGroup.add(moongKatori);

    // 5. ગરમાગરમ ફુલકા રોટલીઓ (Folded layered Rotlis with ghee and toasted spots)
    const rotliTex = createRotliTexture();
    const rotliMat = new THREE.MeshStandardMaterial({
      map: rotliTex,
      roughness: 0.5,
      side: THREE.DoubleSide
    });
    for (let r = 0; r < 3; r++) {
      const rotli = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.02, 32), rotliMat);
      rotli.position.set(-0.52 + r * 0.05, 0.03 + r * 0.025, 0.22 - r * 0.04);
      rotli.rotation.y = r * 0.4;
      rotli.castShadow = true;
      healthyGroup.add(rotli);
    }

    // 6. સુગંધી બાસમતી ભાત (Steamed Rice mound)
    const riceGeo = new THREE.SphereGeometry(0.42, 24, 16);
    riceGeo.scale(1.0, 0.45, 1.0);
    const riceMat = new THREE.MeshStandardMaterial({
      color: 0xfefce8,
      roughness: 0.4
    });
    const riceMound = new THREE.Mesh(riceGeo, riceMat);
    riceMound.position.set(0.35, 0.08, 0.18);
    riceMound.castShadow = true;
    // Coriander sprig on rice
    const dhania = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.06),
      new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.3 })
    );
    dhania.position.set(0.35, 0.28, 0.18);
    healthyGroup.add(riceMound, dhania);

    // 7. તાજું કચુંબર અને સલાડ (Tomato & Cucumber slices)
    const tomatoMat = new THREE.MeshStandardMaterial({
      map: createTomatoTexture(),
      roughness: 0.25,
      side: THREE.DoubleSide
    });
    const cucumberMat = new THREE.MeshStandardMaterial({
      map: createCucumberTexture(),
      roughness: 0.3,
      side: THREE.DoubleSide
    });

    for (let i = 0; i < 3; i++) {
      const tom = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.025, 20), tomatoMat);
      tom.position.set(-0.05 + i * 0.14, 0.025, 0.65 - i * 0.05);
      tom.rotation.x = -Math.PI / 8;
      healthyGroup.add(tom);

      const cuc = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.025, 20), cucumberMat);
      cuc.position.set(0.12 + i * 0.14, 0.025, 0.78 - i * 0.05);
      cuc.rotation.x = -Math.PI / 8;
      healthyGroup.add(cuc);
    }

    // 8. દેશી ગોળ (Natural Jaggery chunk)
    const gurMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.14, 0.16),
      new THREE.MeshStandardMaterial({
        color: 0xb45309,
        roughness: 0.3,
        emissive: 0x78350f,
        emissiveIntensity: 0.2
      })
    );
    gurMesh.position.set(-0.65, 0.07, 0.68);
    gurMesh.rotation.y = 0.3;
    healthyGroup.add(gurMesh);

    // 9. સ્ટીલનો ગ્લાસ - છાશ (Steel tumbler with chaas)
    const glassGeo = new THREE.CylinderGeometry(0.18, 0.14, 0.55, 24);
    const glassMesh = new THREE.Mesh(glassGeo, steelMat);
    glassMesh.position.set(1.15, 0.28, -0.85);
    glassMesh.castShadow = true;
    // Chaas surface
    const chaasTop = new THREE.Mesh(
      new THREE.CylinderGeometry(0.17, 0.17, 0.02, 24),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 })
    );
    chaasTop.position.set(1.15, 0.54, -0.85);
    healthyGroup.add(glassMesh, chaasTop);

    // ==========================================================
    // 2. ORIGINAL FAST-FOOD JUNK THALI (ઓરિજિનલ જંક ફૂડ પ્લેટ)
    // ==========================================================
    const junkGroup = new THREE.Group();
    junkGroupRef.current = junkGroup;
    junkGroup.visible = false;
    scene.add(junkGroup);

    // Fast Food Platter / Basket
    const trayGeo = new THREE.CylinderGeometry(1.35, 1.25, 0.08, 48);
    const trayMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.4
    });
    const trayMesh = new THREE.Mesh(trayGeo, trayMat);
    trayMesh.position.set(0, -0.04, 0);
    junkGroup.add(trayMesh);

    // 1. Juicy Double Burger
    const burgerGroup = new THREE.Group();
    burgerGroup.position.set(-0.35, 0, 0.15);

    // Sesame top bun
    const topBunGeo = new THREE.SphereGeometry(0.48, 24, 16);
    topBunGeo.scale(1.0, 0.55, 1.0);
    const bunMat = new THREE.MeshStandardMaterial({
      map: createBurgerBunTexture(),
      roughness: 0.35
    });
    const topBun = new THREE.Mesh(topBunGeo, bunMat);
    topBun.position.set(0, 0.48, 0);
    topBun.castShadow = true;
    burgerGroup.add(topBun);

    // Tomato slice
    const bTomato = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.44, 0.04, 24), tomatoMat);
    bTomato.position.set(0, 0.38, 0);
    burgerGroup.add(bTomato);

    // Cheese slice (drooping yellow square)
    const cheeseGeo = new THREE.BoxGeometry(0.72, 0.025, 0.72);
    const cheeseMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      roughness: 0.3,
      emissive: 0xeab308,
      emissiveIntensity: 0.2
    });
    const cheese = new THREE.Mesh(cheeseGeo, cheeseMat);
    cheese.position.set(0, 0.32, 0);
    cheese.rotation.y = Math.PI / 4;
    burgerGroup.add(cheese);

    // Patty
    const pattyGeo = new THREE.CylinderGeometry(0.46, 0.46, 0.12, 24);
    const pattyMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.6 });
    const patty = new THREE.Mesh(pattyGeo, pattyMat);
    patty.position.set(0, 0.24, 0);
    burgerGroup.add(patty);

    // Lettuce leaf (wavy green rim)
    const lettuceGeo = new THREE.TorusGeometry(0.46, 0.06, 8, 24);
    const lettuceMat = new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.4 });
    const lettuce = new THREE.Mesh(lettuceGeo, lettuceMat);
    lettuce.rotation.x = Math.PI / 2;
    lettuce.position.set(0, 0.16, 0);
    burgerGroup.add(lettuce);

    // Bottom bun
    const botBunGeo = new THREE.CylinderGeometry(0.46, 0.46, 0.14, 24);
    const botBun = new THREE.Mesh(botBunGeo, bunMat);
    botBun.position.set(0, 0.07, 0);
    burgerGroup.add(botBun);

    junkGroup.add(burgerGroup);

    // 2. French Fries Red Packet
    const friesGroup = new THREE.Group();
    friesGroup.position.set(0.65, 0, 0.15);

    // Red carton
    const cartonGeo = new THREE.BoxGeometry(0.42, 0.42, 0.28);
    const cartonMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.3 });
    const carton = new THREE.Mesh(cartonGeo, cartonMat);
    carton.position.set(0, 0.21, 0);
    carton.castShadow = true;
    friesGroup.add(carton);

    // Crispy golden fries sticks overflowing
    const fryGeo = new THREE.BoxGeometry(0.045, 0.48, 0.045);
    const fryMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.3 });
    for (let f = 0; f < 18; f++) {
      const fry = new THREE.Mesh(fryGeo, fryMat);
      fry.position.set((Math.random() - 0.5) * 0.3, 0.32 + Math.random() * 0.12, (Math.random() - 0.5) * 0.18);
      fry.rotation.set((Math.random() - 0.5) * 0.4, 0, (Math.random() - 0.5) * 0.4);
      friesGroup.add(fry);
    }
    junkGroup.add(friesGroup);

    // 3. Chilled Cola Can
    const colaGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.65, 24);
    const colaMat = new THREE.MeshStandardMaterial({
      map: createColaTexture(),
      metalness: 0.6,
      roughness: 0.25
    });
    const colaCan = new THREE.Mesh(colaGeo, colaMat);
    colaCan.position.set(0.15, 0.33, -0.65);
    colaCan.castShadow = true;
    junkGroup.add(colaCan);

    // 4. Crinkle Potato Chips
    const chipsGroup = new THREE.Group();
    chipsGroup.position.set(-0.65, 0.04, -0.55);
    const chipGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.015, 12);
    const chipMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.35 });
    for (let c = 0; c < 12; c++) {
      const ch = new THREE.Mesh(chipGeo, chipMat);
      ch.position.set((Math.random() - 0.5) * 0.35, c * 0.02, (Math.random() - 0.5) * 0.35);
      ch.rotation.set(Math.random() * 0.4, Math.random(), Math.random() * 0.4);
      chipsGroup.add(ch);
    }
    junkGroup.add(chipsGroup);
  };

  const handleToggleDiet = (mode: 'healthy' | 'junk' | 'compare') => {
    sounds.playClick();
    setDietMode(mode);

    if (healthyGroupRef.current && junkGroupRef.current) {
      if (mode === 'healthy') {
        healthyGroupRef.current.visible = true;
        healthyGroupRef.current.position.set(0, 0, 0);
        junkGroupRef.current.visible = false;
        setSelectedFood(HEALTHY_FOODS['rotli']);
      } else if (mode === 'junk') {
        healthyGroupRef.current.visible = false;
        junkGroupRef.current.visible = true;
        junkGroupRef.current.position.set(0, 0, 0);
        setSelectedFood(JUNK_FOODS['burger']);
      } else if (mode === 'compare') {
        // Show side-by-side
        healthyGroupRef.current.visible = true;
        healthyGroupRef.current.position.set(-1.45, 0, 0);
        junkGroupRef.current.visible = true;
        junkGroupRef.current.position.set(1.45, 0, 0);
      }
    }
  };

  return (
    <div className="relative w-full h-full">
      <SceneContainer
        onSceneReady={handleSceneReady}
        cameraPosition={[0, 2.2, dietMode === 'compare' ? 3.8 : 2.7]}
        targetPosition={[0, 0.1, 0]}
      />

      {/* Top Controls: 3 Modes Toggle */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-1.5 p-1.5 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700/60 shadow-xl">
        <button
          onClick={() => handleToggleDiet('healthy')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            dietMode === 'healthy'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Salad className="w-3.5 h-3.5" />
          <span>ઓરિજિનલ ગુજરાતી સમતોલ થાળી</span>
        </button>

        <button
          onClick={() => handleToggleDiet('junk')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            dietMode === 'junk'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>ઓરિજિનલ જંક ફૂડ થાળી</span>
        </button>

        <button
          onClick={() => handleToggleDiet('compare')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            dietMode === 'compare'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>બંનેની સરખામણી</span>
        </button>
      </div>

      {/* Food Items Selector Badges */}
      <div className="absolute top-16 left-4 z-10 flex flex-wrap gap-1 max-w-xl">
        {dietMode === 'healthy' &&
          Object.values(HEALTHY_FOODS).map((item) => (
            <button
              key={item.id}
              onClick={() => {
                sounds.playClick();
                setSelectedFood(item);
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border ${
                selectedFood.id === item.id
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow'
                  : 'bg-slate-900/80 text-slate-300 border-slate-700/60 hover:bg-slate-800'
              }`}
            >
              {item.nameGu.split(' ')[0]}
            </button>
          ))}

        {dietMode === 'junk' &&
          Object.values(JUNK_FOODS).map((item) => (
            <button
              key={item.id}
              onClick={() => {
                sounds.playClick();
                setSelectedFood(item);
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border ${
                selectedFood.id === item.id
                  ? 'bg-rose-500 text-white border-rose-400 shadow'
                  : 'bg-slate-900/80 text-slate-300 border-slate-700/60 hover:bg-slate-800'
              }`}
            >
              {item.nameGu.split(' ')[0]}
            </button>
          ))}
      </div>

      {/* Bottom Panel: Textbook Medical Case Study (Rashmi vs Jayesh) */}
      <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-xl z-10 bg-slate-900/95 backdrop-blur-md p-3.5 rounded-xl border border-slate-700/70 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-500/20 rounded-lg text-amber-400">
              <Scale className="w-4 h-4" />
            </span>
            <div>
              <h4 className="text-xs font-bold text-slate-100">સારો ખોરાક, સારી તંદુરસ્તી (પાન ૩૨-૩૪)</h4>
              <p className="text-[11px] text-slate-400">
                ડો. રૂતાના બે દર્દીઓ: રશ્મિ (૫ વર્ષ) અને જયેશ (૭ વર્ષ)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => {
                sounds.playClick();
                setActivePersona('rashmi');
              }}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                activePersona === 'rashmi'
                  ? 'bg-amber-500/25 text-amber-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              રશ્મિ (૫ વર્ષ)
            </button>
            <button
              onClick={() => {
                sounds.playClick();
                setActivePersona('jayesh');
              }}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                activePersona === 'jayesh'
                  ? 'bg-rose-500/25 text-rose-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              જયેશ (૭ વર્ષ)
            </button>
          </div>
        </div>

        {/* Selected Food Item Card */}
        {selectedFood && (
          <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 text-xs mb-2">
            <div className="flex items-center justify-between font-bold text-amber-400 mb-1">
              <span>{selectedFood.nameGu}</span>
              <span className="text-[10px] text-slate-400 font-normal">({selectedFood.nameEn})</span>
            </div>
            <p className="text-slate-300 text-[11px] mb-1">
              <span className="text-emerald-400 font-semibold">પોષકતત્વો:</span> {selectedFood.nutrientsGu}
            </p>
            <p className="text-slate-400 text-[10px] leading-relaxed">
              <span className="text-amber-300 font-semibold">શરીરમાં કાર્ય:</span> {selectedFood.roleGu}
            </p>
          </div>
        )}

        {/* Persona Case Info */}
        <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60 text-[11px]">
          {activePersona === 'rashmi' ? (
            <div className="space-y-1 text-slate-300">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <Info className="w-3.5 h-3.5" />
                <span>રશ્મિની સ્થિતિ (કુપોષણ - પૂરતો ખોરાક ન મળવો):</span>
              </div>
              <p>
                • તે ૫ વર્ષની છે પણ ૩ વર્ષ જેવી દુબળી-પાતળી દેખાય છે. તેના હાથ-પગ ખૂબ પાતળા છે અને પેટ ફૂલેલું (મટકા જેવું) છે.
              </p>
              <p>
                • તે વારંવાર બીમાર પડે છે અને હંમેશા થાકેલી રહે છે. તેને આખો દિવસમાં ફક્ત ૧ રોટલી કે થોડા ભાત જ ખાવા મળે છે!
              </p>
              <p className="text-emerald-400 font-semibold">
                ✓ ઉપાય (ડો. રૂતા): રશ્મિ માટે એક જ ઇલાજ છે - <b>'યોગ્ય સમતોલ આહાર'</b> (દાળ, ભાત, શાક, રોટલી અને દૂધ).
              </p>
            </div>
          ) : (
            <div className="space-y-1 text-slate-300">
              <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>જયેશની સ્થિતિ (જંક ફૂડની આડઅસર - બેડોળ શરીર):</span>
              </div>
              <p>
                • તે ૭ વર્ષનો છે પણ તેની ઉંમર કરતાં ઘણો મોટો લાગે છે. તેનું શરીર જાડું, બેડોળ અને ચરબીવાળું છે.
              </p>
              <p>
                • તેને પગમાં સતત દુખાવો રહે છે અને તે ખૂબ આળસુ છે. તે બસમાં જ જાય છે અને ટીવી જોયા કરે છે.
              </p>
              <p className="text-rose-300">
                • તેને ઘરે બનાવેલી રોટલી, દાળ, શાક કે ભાત જરાય ભાવતા નથી! તેને ફક્ત બજારના <b>બર્ગર, પિઝા, ચિપ્સ અને ઠંડા પીણાં</b> જ ગમે છે.
              </p>
              <p className="text-amber-400 font-semibold">
                ✓ ઉપાય (ડો. રૂતા): જંક ફૂડ સંપૂર્ણપણે બંધ કરી ઘરનો <b>સમતોલ સાદો ખોરાક</b> લેવો જોઈએ.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
