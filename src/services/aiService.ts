import { dataService } from './dataService';
import { CPCB_BENCHMARK_STANDARDS } from '../data/cpcbStandards';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  citations?: string[];
  suggestedFollowUps?: string[];
}

export const INITIAL_SUGGESTIONS_EN = [
  'Why did Dissolved Oxygen plunge post-visarjan at Khatlapura Ghat in 2023?',
  'Compare water quality benchmarks between Upper Lake and Lower Lake.',
  'What is the CPCB Class B standard and how does it apply to visarjan ghats?',
  'Which Bhopal ghats require priority confirmatory testing and why?',
  'How effective have the engineered eco-immersion pits at Prempura Ghat been?',
];

export const INITIAL_SUGGESTIONS_HI = [
  '2023 में विसर्जन के बाद खटलापुरा घाट पर घुलित ऑक्सीजन (DO) क्यों गिरी?',
  'बड़ा तालाब (Bhojtal) और छोटा तालाब के जल गुणवत्ता मानकों की तुलना करें।',
  'सीपीसीबी क्लास बी (CPCB Class B) विसर्जन मानक क्या हैं और यह कैसे लागू होते हैं?',
  'भोपाल के किन घाटों पर प्राथमिकता से पुष्टिकरण परीक्षण की आवश्यकता है?',
  'प्रेमपुरा घाट के इको-विसर्जन कुंडों का खुला तालाब पर क्या प्रभाव रहा?',
];

export async function askWaterQualityAssistant(
  userQuery: string,
  history: ChatMessage[],
  language: 'en' | 'hi' = 'en'
): Promise<{ text: string; citations: string[]; suggestedFollowUps: string[] }> {
  // First, attempt to query the server-side Gemini API endpoint
  try {
    const contextSummary = generateDatasetContext();
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: userQuery,
        language,
        context: contextSummary,
        history: history.slice(-4).map((h) => ({ role: h.sender, content: h.text })),
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.reply) {
        return {
          text: data.reply,
          citations: data.citations || [
            'Central Pollution Control Board (CPCB) Designated Best Use Criteria (Class B)',
            'Illustrative Historical Screening Dataset (Calibrated against CPCB Standards)',
          ],
          suggestedFollowUps: data.suggestedFollowUps || getRelevantFollowUps(userQuery, language),
        };
      }
    }
  } catch {
    // Server endpoint not reachable or network issue, fall through to domain engine
  }

  // Domain-specific scientific intelligence fallback
  return getScientificRuleBasedResponse(userQuery, language);
}

function generateDatasetContext(): string {
  const ghats = dataService.getGhats();
  const summaries = dataService.getGhatSummaries();
  return JSON.stringify({
    ghats: ghats.map((g) => ({ id: g.id, name: g.name, waterBody: g.waterBody })),
    summaries: summaries.map((s) => ({
      name: s.ghatName,
      validReadings: s.validComparableReadings,
      outOfBenchmarkPercent: s.outOfBenchmarkPercent,
      priority: s.priorityTier,
      hasData: s.hasData,
    })),
    standards: CPCB_BENCHMARK_STANDARDS,
  });
}

function getScientificRuleBasedResponse(
  query: string,
  lang: 'en' | 'hi'
): {
  text: string;
  citations: string[];
  suggestedFollowUps: string[];
} {
  const q = query.toLowerCase();

  if (lang === 'hi') {
    if (q.includes('खटलापुरा') || q.includes('छोटा तालाब') || q.includes('khatlapura')) {
      return {
        text: `**खटलापुरा घाट (छोटा तालाब) जल-रासायनिक विश्लेषण:**\n\n1. **गंभीर ऑक्सीजन गिरावट (Hypoxic Sag):** उपलब्ध ऐतिहासिक आंकड़ों में, खटलापुरा घाट पर विसर्जन के दौरान और तुरंत बाद घुलित ऑक्सीजन (DO) में भारी गिरावट दर्ज की गई। 2023 में विसर्जन पूर्व DO 5.1 mg/L से गिरकर **3.1 mg/L (विसर्जन उपरांत)** हो गई थी—जो कि सीपीसीबी क्लास बी के न्यूनतम मानक 5.0 mg/L से 38% नीचे है।\n\n2. **बीओडी (BOD) वृद्धि:** बायोकेमिकल ऑक्सीजन डिमांड 2023 में **8.2 mg/L** तक उछल गई, जो 3.0 mg/L की अनुमेय सीमा से कहीं अधिक है। यह विसर्जित पूजा सामग्री व कार्बनिक पदार्थों के तीव्र अपघटन को दर्शाता है।\n\n3. **जलग्रहण क्षेत्र की संवेदनशीलता:** छोटे तालाब का जल आयतन (~1.5 MCM) बड़ा तालाब (~101 MCM) की तुलना में बहुत कम है। यह एक बंद जल निकाय होने के कारण विसर्जन के मलबे को तेजी से नहीं बहा पाता।`,
        citations: [
          'खटलापुरा घाट ऐतिहासिक निगरानी अभिलेख (2021–2025)',
          'सीपीसीबी क्लास बी मानक: DO ≥ 5.0 mg/L, BOD ≤ 3.0 mg/L',
          'भोपाल झील जल-पारिस्थितिकी रिपोर्ट',
        ],
        suggestedFollowUps: [
          'प्रेमपुरा घाट के इको-कुंडों का क्या प्रभाव रहा?',
          'खटलापुरा के लिए क्या सुधारात्मक उपाय अनुशंसित हैं?',
          'सीपीसीबी क्लास बी मानक क्या हैं?',
        ],
      };
    }

    if (q.includes('प्रेमपुरा') || q.includes('इको') || q.includes('prempura')) {
      return {
        text: `**प्रेमपुरा घाट (बड़ा तालाब) इको-विसर्जन कुंडों का प्रभाव:**\n\n1. **मलबा रोकथाम (Containment Efficacy):** भोपाल नगर निगम (BMC) द्वारा प्रेमपुरा पर बनाए गए पक्के तीन-कक्षीय इको-विसर्जन कुंडों ने मूर्तियों के मलबे को मुख्य बड़े तालाब से अलग रखा।\n\n2. **खुले तालाब का संरक्षण:** 2024 और 2025 के आंकड़ों से स्पष्ट है कि जहां कुंडों में गाद जमा हुई, वहीं खुले बड़े तालाब का DO स्तर **5.6–5.8 mg/L** बना रहा, जो सीपीसीबी 5.0 mg/L बेंचमार्क से ऊपर रहा।\n\n3. **बीओडी सुधार:** विसर्जन उपरांत खुले पानी में बीओडी 2025 में 2.8 mg/L रही, जो मानक के भीतर है। यह प्रमाणित करता है कि भौतिक कुंड तकनीक खुले जल निकाय को ऑक्सीजन संकट से बचाती है।`,
        citations: [
          'प्रेमपुरा घाट निगरानी डेटा (बड़ा तालाब, 2022–2025)',
          'भोपाल नगर निगम इको-विसर्जन बुनियादी ढांचा मूल्यांकन',
          'सीपीसीबी मूर्ति विसर्जन दिशानिर्देश (2020)',
        ],
        suggestedFollowUps: [
          'क्या ऐसे इको-कुंड छोटे तालाब पर भी बनाए जा सकते हैं?',
          'शीतलदास की बगिया का प्रदर्शन कैसा रहा?',
        ],
      };
    }

    // Default Hindi
    return {
      text: `**भोपाल विसर्जन घाट जल गुणवत्ता सारांश:**\n\n* **निगरानी पैरामीटर:** घुलित ऑक्सीजन (DO, मानक ≥ 5.0 mg/L), बीओडी (BOD, मानक ≤ 3.0 mg/L), तथा pH (मानक 6.5–8.5)।\n* **मुख्य निष्कर्ष:** छोटे और घिरे हुए जल निकायों (खटलापुरा, शाहपुरा) में विसर्जन के बाद ऑक्सीजन की कमी और बीओडी की भारी वृद्धि दर्ज की जाती है। जहां कृत्रिम कुंडों में विसर्जन हुआ (प्रेमपुरा), वहां खुला तालाब मानक के भीतर सुरक्षित रहा।\n\n*नोट: यह केवल ऐतिहासिक स्क्रीनिंग डेटा है और वास्तविक समय का सरकारी अलर्ट नहीं है।*`,
      citations: [
        'केंद्रीय प्रदूषण नियंत्रण बोर्ड (CPCB) क्लास बी मानदंड',
        'उदाहरणात्मक ऐतिहासिक स्क्रीनिंग डेटासेट (CPCB मानकों पर आधारित)',
      ],
      suggestedFollowUps: [
        'खटलापुरा घाट की स्थिति विस्तार से बताएं',
        'सीपीसीबी क्लास बी मानक क्या हैं?',
      ],
    };
  }

  // English Responses
  if (q.includes('khatlapura') || q.includes('lower lake') || q.includes('chhota talab')) {
    return {
      text: `**Hydrochemical Analysis for Khatlapura Ghat (Lower Lake):**\n\n1. **Severe Oxygen Sag:** In the historical dataset, Khatlapura Ghat regularly exhibited critical dissolved oxygen depletion during and immediately following idol immersion cycles. In 2023, DO plunged from 5.1 mg/L (pre-immersion) down to **3.1 mg/L (post-visarjan)**—representing a 38% deficit below the CPCB Class B minimum threshold of 5.0 mg/L.\n\n2. **BOD Surge:** Biochemical Oxygen Demand escalated to **8.2 mg/L in 2023** and **7.5 mg/L in 2024**, far exceeding the permissible ceiling of 3.0 mg/L. This reflects severe organic decomposition (flowers, puja offerings, and biodegradable binders).\n\n3. **Catchment Vulnerability:** Lower Lake possesses a much smaller water volume (~1.5 MCM vs. Upper Lake’s ~101 MCM) and lacks an active spillway outflow during late September. Consequently, immersion silt and organic materials remain trapped in the basin rather than being diluted, generating localized anaerobic decomposition.`,
      citations: [
        'Khatlapura Ghat Historical Monitoring (Lower Lake, 2021–2025)',
        'CPCB Class B Standard: DO ≥ 5.0 mg/L, BOD ≤ 3.0 mg/L',
        'Bhopal Lake Hydrological Assessment Report',
      ],
      suggestedFollowUps: [
        'How does Khatlapura compare with Prempura Ghat?',
        'What remediation measures does the dashboard recommend for Khatlapura?',
        'What was the turbidity level at Khatlapura in 2025?',
      ],
    };
  }

  if (q.includes('prempura') || q.includes('eco-immersion') || q.includes('pit')) {
    return {
      text: `**Impact of Engineered Eco-Immersion Pits at Prempura Ghat:**\n\n1. **Containment Efficacy:** Prempura Ghat was engineered by Bhopal Municipal Corporation (BMC) with three compartmentalized concrete immersion ponds located adjacent to, but physically separated from, Upper Lake (Bhojtal).\n\n2. **Observed Lake Protection:** Data from 2024 and 2025 demonstrate that while the enclosed immersion pits absorb high sediment and organic loads, the **open lake DO at Prempura remained compliant at 5.8 mg/L (2025 during-visarjan)** and **5.6 mg/L (post-visarjan)**, consistently above the CPCB 5.0 mg/L threshold.\n\n3. **BOD Recovery:** Post-visarjan BOD in open water registered 2.8 mg/L in 2025, safely below the 3.0 mg/L standard. This provides verifiable evidence that isolating immersion sludge with physical containment bunds prevents systemic lake hypoxia.`,
      citations: [
        'Prempura Ghat Observation Series (Upper Lake, 2022–2025)',
        'Bhopal Municipal Corporation Eco-Immersion Infrastructure Assessment',
        'CPCB Guidelines for Idol Immersion in Natural Water Bodies (2020)',
      ],
      suggestedFollowUps: [
        'Could similar eco-tanks be replicated at Lower Lake?',
        'What was the pre-visarjan baseline at Prempura?',
        'How did Sheetaldas Ki Bagiya perform in 2025?',
      ],
    };
  }

  if (q.includes('cpcb') || q.includes('class b') || q.includes('standard') || q.includes('benchmark')) {
    return {
      text: `**CPCB Water Quality Criteria for Visarjan Ghats (Designated Best Use Class B):**\n\nUnder the Central Pollution Control Board (CPCB) Designated Best Use classification, natural water bodies where public bathing and ritual idol immersion occur are screened against **Class B (Outdoor Bathing / Organized Immersion)** criteria:\n\n* **Dissolved Oxygen (DO):** Minimum **≥ 5.0 mg/L**. Essential for sustaining aerobic aquatic respiration.\n* **Biochemical Oxygen Demand (BOD, 3-day at 27°C):** Maximum **≤ 3.0 mg/L**. Indicates organic loading and microbial decomposition rate.\n* **pH:** Permissible range **6.5 to 8.5**. Prevents physiological stress on aquatic fauna and excessive chemical leaching.\n* **Total Coliforms:** Desirable **≤ 500 MPN/100ml**, Max permissible **≤ 2500 MPN/100ml**.\n\n*Note:* While Upper Lake (Bhojtal) also serves as a drinking water source (Class C: DO ≥ 4.0, BOD ≤ 3.0), Class B sets a stricter oxygen floor (≥ 5.0 mg/L) for public immersion ghat zones.`,
      citations: [
        'CPCB Designated Best Use Classification Scheme (Classes A to E)',
        'Environment (Protection) Act, 1986 Water Quality Benchmarks',
      ],
      suggestedFollowUps: [
        'What are the Class C and Class D standards?',
        'Which parameters exceeded Class B most frequently in Bhopal?',
        'Show out-of-benchmark statistics for 2025.',
      ],
    };
  }

  if (q.includes('priority') || q.includes('confirmatory') || q.includes('testing') || q.includes('screen')) {
    return {
      text: `**Confirmatory Testing Priority Screening Results:**\n\nBased on multi-criteria screening (Exceedance Frequency, Severe Hypoxia Frequency [DO < 4.0 mg/L], Extreme Organic Load [BOD > 6.0 mg/L], and Ecological Basin Vulnerability), the following priorities are established:\n\n1. **High Confirmatory Priority:**\n   * **Khatlapura Ghat (Lower Lake):** Exceedance rate of 67%; multiple severe hypoxic readings (3.1–3.8 mg/L); high enclosed basin vulnerability.\n   * **Shahpura Lake Ghat:** Exceedance rate of 88%; acute organic surges (BOD up to 9.4 mg/L) due to urban runoff confluence.\n\n2. **Moderate Surveillance:**\n   * **Sheetaldas Ki Bagiya Ghat (Upper Lake):** Exceedance rate 57%; direct frontage on Bhoj Wetland Ramsar site and drinking water intake zone.\n   * **Sant Hirdaram Nagar Ghat:** Exceedance rate 33%; moderate macrophyte density and western bay turnover.\n\n3. **Routine Baseline:**\n   * **Prempura Ghat & Kaliasot Dam:** Demonstrating compliant or near-compliant parameters due to engineered mitigation or reservoir flushing.\n\n*Note: Ghats without available records in a given period are classified as Insufficient Data, not Routine Baseline.*`,
      citations: [
        'Visarjan Ghat Watch Confirmatory Priority Matrix',
        'Bhoj Wetland Ramsar Site Ecological Character Description',
      ],
      suggestedFollowUps: [
        'What specific instruments are recommended for Khatlapura?',
        'Explain the screening scoring formula.',
        'View the full Priority Analysis tab.',
      ],
    };
  }

  // General environmental intelligence answer
  return {
    text: `**Environmental Screening Summary for Bhopal Visarjan Ghats:**\n\n* **Primary Parameters Monitored:** Dissolved Oxygen (DO, standard ≥ 5.0 mg/L), Biochemical Oxygen Demand (BOD, standard ≤ 3.0 mg/L), and pH (standard 6.5–8.5) across 7 designated sites on Upper Lake (Bhojtal), Lower Lake, Shahpura Lake, and peripheral reservoirs.\n* **Key Pattern:** Historical data reveals a recurring post-immersion "oxygen sag" and organic BOD spike caused by ritual offerings, unsegregated biodegradable matter, and idol materials. This effect is substantially amplified in smaller, enclosed lakes (Khatlapura, Shahpura).\n* **Mitigation Evidence:** Where engineered diversion pits were introduced (such as Prempura Ghat in 2023–2025), open water DO remained compliant (above 5.0 mg/L), highlighting the efficacy of containment structures.\n\n*Disclaimer:* All data presented are historical screening observations for prioritization and comparison; they do not represent real-time sensor streams.`,
    citations: [
      'CPCB Designated Best Use Criteria (Class B)',
      'Illustrative Historical Screening Dataset (Calibrated to CPCB Standards)',
      'Bhopal Lake Conservation and Management Plan Reference',
    ],
    suggestedFollowUps: [
      'Tell me about Khatlapura Ghat in 2023.',
      'How does Prempura compare with Sheetaldas Ki Bagiya?',
      'What are the CPCB Class B thresholds?',
    ],
  };
}

function getRelevantFollowUps(userQuery: string, lang: 'en' | 'hi'): string[] {
  if (lang === 'hi') {
    return [
      'खटलापुरा घाट की स्थिति विस्तार से बताएं',
      'सीपीसीबी क्लास बी मानक क्या हैं?',
      'प्रेमपुरा घाट के इको-कुंडों का क्या प्रभाव रहा?',
    ];
  }
  const q = userQuery.toLowerCase();
  if (q.includes('khatlapura')) {
    return ['What remediation is recommended for Khatlapura?', 'Compare Khatlapura with Prempura'];
  }
  return ['Tell me about CPCB Class B standards', 'Which ghat has the highest out-of-benchmark share?'];
}
