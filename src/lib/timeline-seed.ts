/**
 * Seed data for the SC timeline.
 * All translatable fields carry `en` and `fr` entries.
 * The schema accepts any ISO 639-1 locale code — add more locales here as needed.
 */
import { IEra, IEvent } from "@/types/timeline";

type SeedEra = Omit<IEra, "_id" | "createdAt" | "updatedAt">;
type SeedEvent = Omit<IEvent, "_id" | "createdAt" | "updatedAt">;

export const SEED_ERAS: SeedEra[] = [
  {
    slug: "age-of-exploration",
    name: {
      en: "Age of Exploration",
      fr: "Âge de l'Exploration",
    },
    shortName: {
      en: "Exploration",
      fr: "Exploration",
    },
    startYear: 2075,
    endYear: 2540,
    description: {
      en: "Humanity shatters the bounds of the solar system, discovers jump points, and makes first contact with alien civilizations.",
      fr: "L'humanité brise les limites du système solaire, découvre des points de saut et établit le premier contact avec des civilisations extraterrestres.",
    },
  },
  {
    slug: "first-tevarin-war",
    name: {
      en: "First Tevarin War",
      fr: "Première Guerre Tevarin",
    },
    shortName: {
      en: "First War",
      fr: "Première Guerre",
    },
    startYear: 2541,
    endYear: 2546,
    description: {
      en: "Humanity's first true interstellar conflict — against the militaristic Tevarin species — reshapes the political order.",
      fr: "Le premier véritable conflit interstellaire de l'humanité — contre la militariste espèce Tevarin — remodèle l'ordre politique.",
    },
  },
  {
    slug: "messer-era",
    name: {
      en: "Messer Era",
      fr: "Ère Messer",
    },
    shortName: {
      en: "Messer Era",
      fr: "Ère Messer",
    },
    startYear: 2546,
    endYear: 2792,
    description: {
      en: "A dynastic line of authoritarian Imperators reshapes the UEE over 246 years, marked by expansion, suppression, and eventual collapse.",
      fr: "Une lignée dynastique d'Imperators autoritaires remodèle l'UEE sur 246 ans, marquée par l'expansion, la répression et l'effondrement final.",
    },
  },
  {
    slug: "restoration",
    name: {
      en: "Restoration",
      fr: "Restauration",
    },
    shortName: {
      en: "Restoration",
      fr: "Restauration",
    },
    startYear: 2792,
    endYear: 2900,
    description: {
      en: "The fall of the Messer regime opens a century of democratic reform, cultural recovery, and painful reckoning with the past.",
      fr: "La chute du régime Messer ouvre un siècle de réforme démocratique, de rétablissement culturel et de douloureux bilan avec le passé.",
    },
  },
  {
    slug: "modern-uee",
    name: {
      en: "Modern UEE",
      fr: "UEE Moderne",
    },
    shortName: {
      en: "Modern",
      fr: "Moderne",
    },
    startYear: 2900,
    endYear: null,
    description: {
      en: "The contemporary era — a civilization navigating the existential threat of the Vanduul, fragile interstellar diplomacy, and its own contradictions.",
      fr: "L'ère contemporaine — une civilisation faisant face à la menace existentielle des Vanduul, à une diplomatie interstellaire fragile et à ses propres contradictions.",
    },
  },
];

export const SEED_EVENTS: SeedEvent[] = [
  // ── AGE OF EXPLORATION ──────────────────────────────────────────────────
  {
    slug: "rsi-founded",
    title: {
      en: "Roberts Space Industries Founded",
      fr: "Fondation de Roberts Space Industries",
    },
    date: { year: 2075 },
    eraSlug: "age-of-exploration",
    tags: ["TECHNOLOGY", "CIVILIZATION"],
    significance: "major",
    content: {
      en: `<p>In a modest development campus outside Denver, engineer Wallace Muhammed and entrepreneur Nathan Warrick establish Roberts Space Industries — a private aerospace company with the singular vision of advancing humanity's reach into the cosmos.</p>
<p>Initially focused on commercial satellite deployment, RSI quickly pivots to experimental propulsion research. Their early quantum drive prototypes, though crude by later standards, represent the first serious civilian investment in post-conventional space travel. The company's motto — <strong>"Reach for the Stars"</strong> — proves to be more than corporate aspiration.</p>`,
      fr: `<p>Dans un modeste campus de développement à l'extérieur de Denver, l'ingénieur Wallace Muhammed et l'entrepreneur Nathan Warrick fondent Roberts Space Industries — une entreprise aérospatiale privée avec la vision singulière de repousser les limites de l'humanité dans le cosmos.</p>
<p>D'abord axée sur le déploiement de satellites commerciaux, RSI pivote rapidement vers la recherche en propulsion expérimentale. Leurs premiers prototypes de propulseur quantique, bien que rudimentaires selon les normes ultérieures, représentent le premier investissement civil sérieux dans le voyage spatial post-conventionnel. La devise de l'entreprise — <strong>"Atteignez les étoiles"</strong> — s'avère être bien plus qu'une simple aspiration d'entreprise.</p>`,
    },
  },
  {
    slug: "first-quantum-drive",
    title: {
      en: "Quantum Drive Successfully Tested",
      fr: "Propulseur Quantique Testé avec Succès",
    },
    date: { year: 2096 },
    eraSlug: "age-of-exploration",
    tags: ["TECHNOLOGY", "HISTORY"],
    significance: "critical",
    content: {
      en: `<p>RSI's Mark I Quantum Drive undergoes its first successful full-scale test aboard the <em>UEES Artemis</em> in low Earth orbit. The drive achieves 0.2c — one-fifth the speed of light — a leap orders of magnitude beyond any prior propulsion system.</p>
<p>The demonstration reshapes global investment priorities overnight. NASA, restructured into the United Earth Space Agency (UESA) a decade prior, contracts RSI to supply quantum drives for a new national exploration fleet. The age of human confinement to the solar system is declared over. Mining corporations begin lobbying for priority access to the outer belt within the week.</p>`,
      fr: `<p>Le propulseur quantique Mark I de RSI subit son premier test complet réussi à bord de l'<em>UEES Artemis</em> en orbite basse terrestre. Le propulseur atteint 0,2c — un cinquième de la vitesse de la lumière — un bond de plusieurs ordres de grandeur au-delà de tout système de propulsion antérieur.</p>
<p>La démonstration remodèle les priorités d'investissement mondiales du jour au lendemain. La NASA, restructurée en Agence spatiale unifiée de la Terre (UESA) dix ans auparavant, contracte RSI pour fournir des propulseurs quantiques pour une nouvelle flotte d'exploration nationale. L'ère du confinement humain au système solaire est déclarée terminée.</p>`,
    },
  },
  {
    slug: "first-jump-point",
    title: {
      en: "First Jump Point Discovered",
      fr: "Premier Point de Saut Découvert",
    },
    date: { year: 2113 },
    eraSlug: "age-of-exploration",
    tags: ["EXPLORATION", "HISTORY"],
    significance: "critical",
    content: {
      en: `<p>Survey vessel <em>ISS Perses</em>, dispatched to catalogue anomalous gravitational readings near Saturn's outer orbit, discovers something that will redefine humanity's place in the universe: a stable, traversable jump point leading to an entirely new star system.</p>
<p>Scientists designate the destination Davien System. The find sparks immediate theoretical debate — are jump points natural phenomena, or evidence of prior intelligent engineering? No consensus emerges. What is certain is that humanity has a doorway to the galaxy.</p>
<p>Controlled access to jump points becomes one of the most politically contentious issues of the following century, with corporations, governments, and military bodies all vying for priority licensing. The discovery makes three executives billionaires before the week is out.</p>`,
      fr: `<p>Le vaisseau d'exploration <em>ISS Perses</em>, envoyé pour cataloguer des lectures gravitationnelles anormales près de l'orbite externe de Saturne, découvre quelque chose qui redéfinira la place de l'humanité dans l'univers : un point de saut stable et traversable menant à un tout nouveau système stellaire.</p>
<p>Les scientifiques désignent la destination comme le Système Davien. La découverte déclenche immédiatement un débat théorique — les points de saut sont-ils des phénomènes naturels ou la preuve d'une ingénierie intelligente antérieure ? Aucun consensus n'émerge, mais il est certain que l'humanité dispose désormais d'une porte vers la galaxie.</p>`,
    },
  },
  {
    slug: "banu-first-contact",
    title: {
      en: "First Contact: Banu Protectorate",
      fr: "Premier Contact : Protectorat Banu",
    },
    date: { year: 2157 },
    eraSlug: "age-of-exploration",
    tags: ["DIPLOMACY", "HISTORY", "CIVILIZATION"],
    significance: "critical",
    content: {
      en: `<p>Near the Davien System's outer rim, scout pilot Vernon Tar — flying a standard resource survey run — encounters a Banu merchant vessel. Tar's instinct to broadcast a non-threatening greeting signal rather than activate defensive systems is widely credited as one of the most consequential individual decisions in human history.</p>
<p>Initial communication, conducted through improvised symbol exchange, establishes mutual intent. Earth governments scramble to assemble a diplomatic team. The Banu, a species of intensely individual merchants organized around a Protectorate structure, show no hostility — only commercial curiosity.</p>
<p>The resulting treaty, finalized three years later, establishes the first-ever diplomatic and trade relationship between humanity and an alien species. The <strong>Banu-Human Trade &amp; Mutual Defense Pact</strong> remains foundational interstellar law to this day.</p>`,
      fr: `<p>Près du bord extérieur du Système Davien, le pilote explorateur Vernon Tar — effectuant une mission standard de relevé de ressources — rencontre un vaisseau marchand Banu. L'instinct de Tar d'émettre un signal de salutation non menaçant plutôt que d'activer les systèmes défensifs est largement reconnu comme l'une des décisions individuelles les plus importantes de l'histoire humaine.</p>
<p>La communication initiale, menée par échange de symboles improvisés, établit une intention mutuelle. Les gouvernements terrestres se hâtent de constituer une équipe diplomatique. Les Banu, une espèce de marchands intensément individualistes organisés autour d'une structure de Protectorat, ne montrent aucune hostilité — seulement une curiosité commerciale.</p>`,
    },
  },
  {
    slug: "xian-first-contact",
    title: {
      en: "First Contact: Xi'An Empire",
      fr: "Premier Contact : Empire Xi'An",
    },
    date: { year: 2262 },
    eraSlug: "age-of-exploration",
    tags: ["DIPLOMACY", "HISTORY", "CONFLICT"],
    significance: "critical",
    content: {
      en: `<p>Unlike the Banu encounter, first contact with the Xi'An Empire unfolds as a series of tense border skirmishes rather than diplomatic exchange. Xi'An patrol vessels respond to human survey ships entering the Perry Line with weapons fire. Three human scouts are destroyed; two Xi'An vessels are damaged in return.</p>
<p>Neither side declares war. Both sides dispatch military fleets to the border and diplomatic vessels to neutral space simultaneously. The Xi'An, it emerges, are an ancient species with millennia of recorded history — and a particular wariness of younger civilizations that have historically proven destructive.</p>
<p>Formal diplomatic exchange begins in 2264. The Perry Line ceasefire treaty remains the cornerstone of human-Xi'An relations — fragile, frequently tested, but unbroken for nearly seven centuries.</p>`,
      fr: `<p>Contrairement à la rencontre Banu, le premier contact avec l'Empire Xi'An se déroule sous la forme d'une série d'escarmouches frontalières tendues plutôt que d'échanges diplomatiques. Les vaisseaux de patrouille Xi'An répondent aux navires d'exploration humains entrant dans la Ligne Perry par des tirs d'armes. Trois éclaireurs humains sont détruits ; deux vaisseaux Xi'An sont endommagés en retour.</p>
<p>Aucun camp ne déclare la guerre. Les deux parties envoient simultanément des flottes militaires à la frontière et des vaisseaux diplomatiques dans l'espace neutre.</p>`,
    },
  },
  {
    slug: "managed-democracy-reform",
    title: {
      en: "Managed Democracy Reform",
      fr: "Réforme de la Démocratie Encadrée",
    },
    date: { year: 2380 },
    eraSlug: "age-of-exploration",
    tags: ["POLITICAL", "CIVILIZATION"],
    significance: "major",
    content: {
      en: `<p>Facing the logistical impossibility of representative democracy across dozens of inhabited systems with years of light-speed communication delay, the United Planets of Earth undergoes its most significant constitutional reform since its founding. Senator Assan Kieren's Managed Democracy bill passes by a narrow majority.</p>
<p>The new system centralizes executive authority in an elected Imperator while maintaining a Senate with limited oversight. Critics immediately label it authoritarian drift; proponents argue it is a pragmatic necessity for governing an interstellar civilization that spans light-years.</p>`,
      fr: `<p>Face à l'impossibilité logistique d'une démocratie représentative sur des dizaines de systèmes habités avec des années de délai de communication à la vitesse de la lumière, les Planètes Unies de la Terre subissent leur réforme constitutionnelle la plus significative depuis leur fondation. Le projet de loi sur la Démocratie Encadrée du sénateur Assan Kieren est adopté à courte majorité.</p>
<p>Le nouveau système centralise le pouvoir exécutif dans un Imperator élu tout en maintenant un Sénat à surveillance limitée. Les critiques le qualifient immédiatement de dérive autoritaire ; les partisans soutiennent que c'est une nécessité pragmatique pour gouverner une civilisation interstellaire.</p>`,
    },
  },
  // ── FIRST TEVARIN WAR ───────────────────────────────────────────────────
  {
    slug: "tevarin-discovered",
    title: {
      en: "Tevarin Homeworld Discovered",
      fr: "Monde Natal Tevarin Découvert",
    },
    date: { year: 2540 },
    eraSlug: "first-tevarin-war",
    tags: ["EXPLORATION", "MILITARY"],
    significance: "major",
    content: {
      en: `<p>A series of unmanned probes ventures into a previously uncharted jump corridor and returns with imagery of a developed alien civilization. The Tevarin homeworld, designated Kaleeth, is a planet of striking geometric architecture and unmistakable military infrastructure.</p>
<p>Unlike the Banu encounter, there is no ambiguity about the Tevarin's nature: they are a martial species whose first intercepted broadcasts consist almost entirely of territorial claim signals. UPE military intelligence begins immediate defensive mobilization.</p>`,
      fr: `<p>Une série de sondes non habitées s'aventure dans un corridor de saut jusque-là inexploré et revient avec des images d'une civilisation extraterrestre développée. Le monde natal Tevarin, désigné Kaleeth, est une planète à l'architecture géométrique frappante et à l'infrastructure militaire indéniable.</p>
<p>Contrairement à la rencontre Banu, il n'y a aucune ambiguïté sur la nature des Tevarins : ce sont une espèce guerrière dont les premières émissions interceptées se composent presque entièrement de signaux de revendication territoriale.</p>`,
    },
  },
  {
    slug: "first-tevarin-war-start",
    title: {
      en: "First Tevarin War Begins",
      fr: "Début de la Première Guerre Tevarin",
    },
    date: { year: 2541 },
    eraSlug: "first-tevarin-war",
    tags: ["MILITARY", "CONFLICT", "HISTORY"],
    significance: "critical",
    content: {
      en: `<p>Without formal declaration, Tevarin war fleets cross into Orion System, destroying two colony stations and a civilian transport carrying 4,200 passengers. The brutality of the assault — later analyzed as a ritual declaration of war in Tevarin martial culture — shocks the UPE Senate into emergency session.</p>
<p>Junior Fleet Officer Ivar Messer distinguishes himself in the defense of Orion II, receiving decoration for holding a defensive perimeter with half-crew against twice the expected Tevarin force. His name begins appearing in UPE propaganda broadcasts within the month.</p>`,
      fr: `<p>Sans déclaration formelle, les flottes de guerre Tevarin traversent le Système Orion, détruisant deux stations coloniales et un transport civil transportant 4 200 passagers. La brutalité de l'assaut — analysée plus tard comme une déclaration de guerre rituelle dans la culture martiale Tevarin — choque le Sénat UPE qui se réunit en session d'urgence.</p>
<p>L'officier junior de flotte Ivar Messer se distingue dans la défense d'Orion II, recevant une décoration pour avoir tenu un périmètre défensif avec la moitié de l'équipage face au double des forces Tevarin attendues.</p>`,
    },
  },
  {
    slug: "battle-idris-iv",
    title: {
      en: "Battle of Idris IV",
      fr: "Bataille d'Idris IV",
    },
    date: { year: 2544 },
    eraSlug: "first-tevarin-war",
    tags: ["MILITARY", "CONFLICT"],
    significance: "critical",
    content: {
      en: `<p>The defining engagement of the First Tevarin War. A Tevarin fleet of over three hundred vessels makes a surprise incursion into Idris System, targeting the planet's critical shipyard complex. Fleet Admiral Ernst Bishop commits forty-seven UPE warships in what becomes a six-day running battle through the system's dense asteroid field.</p>
<p>The outnumbered UPE fleet destroys or disables 212 Tevarin vessels and forces a full withdrawal. Human casualties number 12,000 across the fleet engagement. The shipyard survives intact.</p>`,
      fr: `<p>L'engagement décisif de la Première Guerre Tevarin. Une flotte Tevarin de plus de trois cents vaisseaux effectue une incursion surprise dans le Système Idris, ciblant le complexe de chantiers navals critiques de la planète. L'amiral de flotte Ernst Bishop engage quarante-sept navires de guerre UPE dans ce qui devient une bataille de six jours à travers le dense champ d'astéroïdes du système.</p>
<p>La flotte UPE en infériorité numérique détruit ou désactive 212 vaisseaux Tevarins et force un retrait complet. Les pertes humaines s'élèvent à 12 000 lors de l'engagement de la flotte.</p>`,
    },
  },
  {
    slug: "messer-first-citizen",
    title: {
      en: "Ivar Messer Named First Citizen",
      fr: "Ivar Messer Nommé Premier Citoyen",
    },
    date: { year: 2546 },
    eraSlug: "first-tevarin-war",
    tags: ["POLITICAL", "MILITARY", "HISTORY"],
    significance: "critical",
    content: {
      en: `<p>With the Tevarin militarily finished but the specter of renewed conflict looming, the Senate invokes emergency wartime provisions to elevate Fleet Admiral Ivar Messer to "First Citizen" — a theoretically temporary executive position with broad emergency powers.</p>
<p>His appointment is celebrated in streets across dozens of systems. Few realize they have just witnessed the death of democratic civilian governance. The emergency powers will never be relinquished. The Messer Era has begun — not with a coup, but with applause.</p>`,
      fr: `<p>Alors que les Tevarins sont militairement vaincus mais que le spectre d'un conflit renouvelé plane, le Sénat invoque les dispositions d'urgence en temps de guerre pour élever l'amiral de flotte Ivar Messer au rang de "Premier Citoyen" — une position exécutive théoriquement temporaire avec de larges pouvoirs d'urgence.</p>
<p>Sa nomination est célébrée dans les rues de dizaines de systèmes. Peu réalisent qu'ils viennent d'assister à la mort de la gouvernance civile démocratique. Les pouvoirs d'urgence ne seront jamais abandonnés. L'Ère Messer a commencé — non par un coup d'État, mais par des applaudissements.</p>`,
    },
  },
  // ── MESSER ERA ──────────────────────────────────────────────────────────
  {
    slug: "messer-imperator",
    title: {
      en: "Ivar Messer I Declares Himself Imperator",
      fr: "Ivar Messer I Se Déclare Imperator",
    },
    date: { year: 2546 },
    eraSlug: "messer-era",
    tags: ["POLITICAL", "HISTORY"],
    significance: "critical",
    content: {
      en: `<p>Within months of appointment as First Citizen, Ivar Messer maneuvers through a compliant Senate to have his title permanently renamed "Imperator" and his powers constitutionally enshrined. The move marks the formal transformation of the United Planets of Earth into the <strong>United Empire of Earth (UEE)</strong>.</p>
<p>The new title carries hereditary succession rights. Dissenting senators who spoke against the measure find themselves facing corruption charges within the year. A pattern of political suppression is established that will intensify over the next two centuries.</p>`,
      fr: `<p>Dans les mois suivant sa nomination comme Premier Citoyen, Ivar Messer manœuvre à travers un Sénat complaisant pour faire renommer définitivement son titre en "Imperator" et consacrer constitutionnellement ses pouvoirs. Cette décision marque la transformation formelle des Planètes Unies de la Terre en <strong>Empire Uni de la Terre (UEE)</strong>.</p>
<p>Le nouveau titre confère des droits de succession héréditaire. Les sénateurs dissidents qui ont parlé contre la mesure se retrouvent confrontés à des accusations de corruption dans l'année. Un schéma de répression politique est établi qui s'intensifiera au cours des deux siècles suivants.</p>`,
    },
  },
  {
    slug: "second-tevarin-war",
    title: {
      en: "Second Tevarin War: Corath'Thal's Last Stand",
      fr: "Deuxième Guerre Tevarin : Le Dernier Combat de Corath'Thal",
    },
    date: { year: 2603 },
    eraSlug: "messer-era",
    tags: ["MILITARY", "CONFLICT", "CULTURE"],
    significance: "major",
    content: {
      en: `<p>The surviving Tevarin, stripped of their homeworld and scattered to refugee fleets, launch a desperate final campaign to reclaim Kaleeth. Under the command of warrior-poet Corath'Thal, the Tevarin fleet strikes with extraordinary coordination and sacrificial ferocity.</p>
<p>The UEE responds with overwhelming force. The final battle above Kaleeth ends when Corath'Thal, rather than surrender, leads his remaining vessels in a deliberate dive into the planet's atmosphere. The image — hundreds of burning Tevarin ships descending like falling stars — is broadcast across humanity and evokes a complicated, uneasy grief even among veterans.</p>`,
      fr: `<p>Les Tevarins survivants, dépouillés de leur monde natal et dispersés en flottes de réfugiés, lancent une ultime campagne désespérée pour reconquérir Kaleeth. Sous le commandement du guerrier-poète Corath'Thal, la flotte Tevarin frappe avec une coordination extraordinaire et une férocité sacrificielle.</p>
<p>L'UEE répond par une force écrasante. La bataille finale au-dessus de Kaleeth se termine lorsque Corath'Thal, plutôt que de se rendre, entraîne ses vaisseaux restants dans une plongée délibérée dans l'atmosphère de la planète.</p>`,
    },
  },
  {
    slug: "massacre-garron-ii",
    title: {
      en: "Massacre of Garron II",
      fr: "Massacre de Garron II",
    },
    date: { year: 2715 },
    eraSlug: "messer-era",
    tags: ["TRAGEDY", "HISTORY", "CIVILIZATION"],
    significance: "critical",
    content: {
      en: `<p>Garron II hosts a pre-industrial alien species classified by UEE xenobiologists as "Category Four: minimal sentience." When a terraforming operation begins despite ongoing surveys, the Messers authorize it under commercial development clauses. Local scientists who protest are transferred off-world.</p>
<p>The leaked footage, distributed under the designation <em>The Garron Transmissions</em>, sparks the first significant anti-Messer political underground. Bettencourt is sentenced to life imprisonment on a mining platform. His recordings survive. They are the beginning of organized resistance against the Messer line.</p>`,
      fr: `<p>Garron II accueille une espèce extraterrestre pré-industrielle classifiée par les xénobiologistes de l'UEE comme "Catégorie Quatre : sensibilité minimale." Lorsqu'une opération de terraformation commence malgré des études en cours, les Messers l'autorisent en vertu de clauses de développement commercial.</p>
<p>Les séquences divulguées, distribuées sous la désignation <em>Les Transmissions Garron</em>, déclenchent le premier underground politique anti-Messer significatif.</p>`,
    },
  },
  {
    slug: "synthworld-project",
    title: {
      en: "Synthworld Project Commences",
      fr: "Début du Projet Synthworld",
    },
    date: { year: 2751 },
    eraSlug: "messer-era",
    tags: ["TECHNOLOGY", "CIVILIZATION"],
    significance: "major",
    content: {
      en: `<p>Messer VII's obsession with legacy produces the most ambitious — and catastrophically unsuccessful — engineering project in UEE history: the artificial construction of an entire habitable planet. The Synthworld project aims to demonstrate that human technology has transcended the natural universe.</p>
<p>The planet remains fundamentally unfinished. The Synthworld becomes a monument to Messer megalomania — a decades-long drain maintained more from political inertia than any genuine intent to complete.</p>`,
      fr: `<p>L'obsession de Messer VII pour son héritage produit le projet d'ingénierie le plus ambitieux — et catastrophiquement raté — de l'histoire de l'UEE : la construction artificielle d'une planète entière habitable. Le projet Synthworld vise à démontrer que la technologie humaine a transcendé l'univers naturel.</p>
<p>La planète reste fondamentalement inachevée. Le Synthworld devient un monument à la mégalomanie Messer — un gouffre maintenu des décennies durant plus par inertie politique que par une véritable intention de le terminer.</p>`,
    },
  },
  {
    slug: "three-pillars",
    title: {
      en: '"The Three Pillars" Distributed Underground',
      fr: '"Les Trois Piliers" Distribués Clandestinement',
    },
    date: { year: 2780, month: 3 },
    eraSlug: "messer-era",
    tags: ["CULTURE", "HISTORY", "CIVILIZATION"],
    significance: "major",
    content: {
      en: `<p>Philosopher Sujata Vatari, writing under the pseudonym Suj Vattic to evade Messer censors, begins distributing her banned text <em>The Three Pillars</em> through underground networks across thirty systems. The work articulates a philosophical framework for post-authoritarian governance built on three foundations: <strong>accountability</strong>, <strong>transparency</strong>, and <strong>measured representation</strong>.</p>
<p>Within two years, handwritten copies exist on every inhabited world. Suj Vattic is eventually revealed to be Vatari — she lives to see her three pillars codified into UEE law.</p>`,
      fr: `<p>La philosophe Sujata Vatari, écrivant sous le pseudonyme Suj Vattic pour échapper aux censeurs Messer, commence à distribuer son texte interdit <em>Les Trois Piliers</em> à travers des réseaux souterrains sur trente systèmes. L'œuvre articule un cadre philosophique pour une gouvernance post-autoritaire bâtie sur trois fondements : <strong>responsabilité</strong>, <strong>transparence</strong> et <strong>représentation mesurée</strong>.</p>
<p>En deux ans, des copies manuscrites existent sur chaque monde habité. Suj Vattic est finalement révélée être Vatari — elle vit pour voir ses trois piliers codifiés dans la loi de l'UEE.</p>`,
    },
  },
  {
    slug: "messer-overthrown",
    title: {
      en: "Messer XI Overthrown: Operation Archangel",
      fr: "Renversement de Messer XI : Opération Archange",
    },
    date: { year: 2792, month: 6 },
    eraSlug: "messer-era",
    tags: ["POLITICAL", "MILITARY", "HISTORY"],
    significance: "critical",
    content: {
      en: `<p>A coordinated military coup codenamed <strong>Operation Archangel</strong>, organized by a network of high-ranking Navy officers, Senate security personnel, and civilian resistance members who spent decades preparing in secret, executes simultaneously across seven systems. Messer XI — Gavor Messer, widely regarded as the cruelest of the dynasty — is removed from power without a single armed engagement.</p>
<p>The 246-year Messer dynasty ends not with a battle, but with silence. A duty officer in the Senate security bureau writes in his log that evening: <em>"Nobody cried. That was the strangest part. We had all imagined we would cry."</em></p>`,
      fr: `<p>Un coup d'État militaire coordonné sous le nom de code <strong>Opération Archange</strong>, organisé par un réseau d'officiers de la Marine de haut rang, de personnel de sécurité du Sénat et de membres de la résistance civile qui ont passé des décennies à se préparer en secret, s'exécute simultanément dans sept systèmes.</p>
<p>La dynastie Messer de 246 ans ne se termine pas par une bataille, mais par le silence. Un officier de service au bureau de sécurité du Sénat écrit dans son journal ce soir-là : <em>"Personne n'a pleuré. C'était la partie la plus étrange. Nous avions tous imaginé que nous allions pleurer."</em></p>`,
    },
  },
  // ── RESTORATION ─────────────────────────────────────────────────────────
  {
    slug: "erin-toi-imperator",
    title: {
      en: "Erin Toi Named Imperator — Restoration Begins",
      fr: "Erin Toi Nommée Imperator — La Restauration Commence",
    },
    date: { year: 2792, month: 9 },
    eraSlug: "restoration",
    tags: ["POLITICAL", "HISTORY"],
    significance: "critical",
    content: {
      en: `<p>The Senate, freed from Messer control for the first time in two and a half centuries, names Erin Toi — a widely respected jurist and former head of the civilian review board that had secretly supported Operation Archangel — as transitional Imperator. Her mandate is explicitly reformist.</p>
<p>Toi's first address to the Senate is still studied in political philosophy programs: <em>"We do not discard the structure of Empire; we fill it with meaning. Not the meaning of one family's ambition, but of every family's hope."</em></p>`,
      fr: `<p>Le Sénat, libéré du contrôle Messer pour la première fois en deux siècles et demi, nomme Erin Toi — une juriste largement respectée et ancienne présidente du comité de révision civile qui avait secrètement soutenu l'Opération Archange — comme Imperator transitoire.</p>
<p>Le premier discours de Toi au Sénat est encore étudié dans les programmes de philosophie politique : <em>"Nous ne jetons pas la structure de l'Empire ; nous la remplissons de sens. Non pas le sens de l'ambition d'une famille, mais de l'espoir de chaque famille."</em></p>`,
    },
  },
  {
    slug: "restoration-acts",
    title: {
      en: "Restoration Acts Passed",
      fr: "Adoption des Actes de Restauration",
    },
    date: { year: 2800 },
    eraSlug: "restoration",
    tags: ["POLITICAL", "CIVILIZATION"],
    significance: "major",
    content: {
      en: `<p>Eight years of legislative work culminates in the passage of the <strong>Restoration Acts</strong> — a sweeping package of constitutional reforms that formally repudiates Messer-era law. Key provisions include: mandatory Senate review of all Imperatorship executive actions, reinstatement of habeas corpus across all UEE systems, and recognition of the Tevarin as a protected cultural group.</p>
<p>The passage date — the 14th of March, 2800 — is declared a UEE public holiday: <em>Restoration Day</em>. On the first celebration, Tevarin communities across fourteen systems hold public ceremonial vigils. No UEE official is invited. None attempts to attend.</p>`,
      fr: `<p>Huit ans de travail législatif culminent dans l'adoption des <strong>Actes de Restauration</strong> — un ensemble complet de réformes constitutionnelles qui répudie formellement la législation de l'ère Messer. Les dispositions clés comprennent : la révision obligatoire par le Sénat de toutes les actions exécutives de l'Imperator et la reconnaissance des Tevarins comme groupe culturel protégé.</p>
<p>La date d'adoption — le 14 mars 2800 — est déclarée jour férié de l'UEE : <em>Jour de la Restauration</em>. Lors de la première célébration, les communautés Tevarins dans quatorze systèmes tiennent des veillées cérémonielles publiques.</p>`,
    },
  },
  {
    slug: "tevarin-cultural-reintegration",
    title: {
      en: "Tevarin Cultural Reintegration Accords",
      fr: "Accords de Réintégration Culturelle Tevarin",
    },
    date: { year: 2843 },
    eraSlug: "restoration",
    tags: ["CIVILIZATION", "DIPLOMACY", "CULTURE"],
    significance: "major",
    content: {
      en: `<p>Fifty years after the Restoration Acts formally recognized Tevarin rights, the UEE Senate passes the Reintegration Accords — providing land grants in three systems for Tevarin communal settlement, government funding for preservation of Tevarin language and martial traditions, and the formal return of confiscated artifacts.</p>
<p>The accords are imperfect and contested within Tevarin communities: some see engagement with UEE governance as collaboration; others see it as survival.</p>`,
      fr: `<p>Cinquante ans après que les Actes de Restauration ont formellement reconnu les droits des Tevarins, le Sénat de l'UEE adopte les Accords de Réintégration — fournissant des concessions de territoire dans trois systèmes pour les colonies communautaires Tevarins et le financement gouvernemental pour la préservation de la langue et des traditions martiales Tevarins.</p>
<p>Les accords sont imparfaits et contestés au sein des communautés Tevarins : certains voient l'engagement avec la gouvernance de l'UEE comme une collaboration ; d'autres le voient comme une survie.</p>`,
    },
  },
  {
    slug: "nul-system-abandoned",
    title: {
      en: "Nul System Declared Abandoned Territory",
      fr: "Le Système Nul Déclaré Territoire Abandonné",
    },
    date: { year: 2872 },
    eraSlug: "restoration",
    tags: ["CIVILIZATION", "HISTORY"],
    significance: "standard",
    content: {
      en: `<p>Following decades of failed economic development and persistent organized crime dominance, the Senate votes to officially withdraw administrative presence from Nul System. Generations of families who built lives in Nul are bitterly divided: some accept relocation grants; many remain, building a culture of radical self-sufficiency.</p>
<p><em>"They gave up on us, so we learned to not need them."</em> — Common Nulian proverb, origin unknown.</p>`,
      fr: `<p>Suite à des décennies de développement économique raté et à la domination persistante du crime organisé, le Sénat vote pour retirer officiellement la présence administrative du Système Nul. Des générations de familles qui ont bâti leur vie dans Nul sont profondément divisées : certaines acceptent les subventions de relocalisation ; beaucoup restent, construisant une culture d'autosuffisance radicale.</p>
<p><em>"Ils ont abandonné notre cause, alors nous avons appris à ne pas avoir besoin d'eux."</em> — Proverbe Nulien commun, origine inconnue.</p>`,
    },
  },
  // ── MODERN UEE ──────────────────────────────────────────────────────────
  {
    slug: "vanduul-vega-attack",
    title: {
      en: "Vanduul Devastate Vega System",
      fr: "Les Vanduul Dévastent le Système Vega",
    },
    date: { year: 2945 },
    eraSlug: "modern-uee",
    tags: ["MILITARY", "CONFLICT", "TRAGEDY"],
    significance: "critical",
    content: {
      en: `<p>Without warning, a Vanduul war party of unprecedented scale — over nine hundred vessels — crosses into Vega System and begins a systematic campaign of civilian extermination. The planet Vega II, population 4.7 billion, is bombarded for eleven continuous days.</p>
<p>The final death toll exceeds 450 million. It is the largest single casualty event in human history. Vega remains a monument system. No civilian habitation has been permitted on Vega II since the attack.</p>`,
      fr: `<p>Sans avertissement, une guerre vanduul d'une échelle sans précédent — plus de neuf cents vaisseaux — traverse le Système Vega et commence une campagne systématique d'extermination civile. La planète Vega II, avec une population de 4,7 milliards, est bombardée pendant onze jours consécutifs.</p>
<p>Le bilan final dépasse 450 millions de morts. C'est le plus grand événement de victimes unique de l'histoire humaine. Vega reste un système monument. Aucune habitation civile n'a été autorisée sur Vega II depuis l'attaque.</p>`,
    },
  },
  {
    slug: "project-rebirth",
    title: {
      en: "Project Rebirth Report Released",
      fr: "Publication du Rapport Projet Renaissance",
    },
    date: { year: 2945, month: 11 },
    eraSlug: "modern-uee",
    tags: ["HISTORY", "CIVILIZATION", "TRAGEDY"],
    significance: "major",
    content: {
      en: `<p>The independent historical commission chartered by the Senate releases <em>Project Rebirth</em> — a 12,000-page report documenting Messer-era atrocities previously classified, suppressed, or denied. The report details 42 separate events involving deliberate mass civilian casualties and systematic torture programs.</p>
<p>The Senate formally apologizes to Tevarin and Garron II survivor communities — 230 years late. The apology is read into the record without debate.</p>`,
      fr: `<p>La commission historique indépendante créée par le Sénat publie <em>Projet Renaissance</em> — un rapport de 12 000 pages documentant les atrocités de l'ère Messer précédemment classifiées, supprimées ou niées. Le rapport détaille 42 événements distincts impliquant des pertes civiles massives délibérées et des programmes de torture systématiques.</p>
<p>Le Sénat présente officiellement ses excuses aux communautés survivantes Tevarins et de Garron II — 230 ans trop tard.</p>`,
    },
  },
  {
    slug: "concord-of-ayr",
    title: {
      en: "Concord of Ayr: UEE–Xi'An Peace Framework",
      fr: "Concorde d'Ayr : Cadre de Paix UEE–Xi'An",
    },
    date: { year: 2950 },
    eraSlug: "modern-uee",
    tags: ["DIPLOMACY", "POLITICAL"],
    significance: "major",
    content: {
      en: `<p>Centuries of cold war, proxy skirmishes, and border tensions between the UEE and Xi'An Empire reach a tentative moment of de-escalation with the signing of the <strong>Concord of Ayr</strong>. Neither side trusts the other. Both recognize the alternative: a shooting war that would devastate both civilizations while handing the Vanduul a decisive strategic advantage.</p>
<p>A Xi'An diplomat, when asked for comment, replies: <em>"A good treaty requires no enforcement. A bad treaty requires only patience."</em></p>`,
      fr: `<p>Des siècles de guerre froide, d'escarmouches par procuration et de tensions frontalières entre l'UEE et l'Empire Xi'An atteignent un moment d'apaisement avec la signature de la <strong>Concorde d'Ayr</strong>. Aucun camp ne fait confiance à l'autre. Les deux reconnaissent l'alternative : une guerre armée qui dévasterait les deux civilisations.</p>
<p>Un diplomate Xi'An, interrogé pour un commentaire, répond : <em>"Un bon traité ne nécessite aucune application. Un mauvais traité ne nécessite que de la patience."</em></p>`,
    },
  },
  {
    slug: "vanduul-expansion-2951",
    title: {
      en: "Vanduul Tactical Shift: Coordinated Expansion",
      fr: "Changement Tactique Vanduul : Expansion Coordonnée",
    },
    date: { year: 2951 },
    eraSlug: "modern-uee",
    tags: ["MILITARY", "POLITICAL"],
    significance: "major",
    content: {
      en: `<p>Intelligence reports confirm that Vanduul war parties are now operating in coordinated patterns that suggest confederation-level strategic direction, rather than the opportunistic raiding behavior of previous centuries. Military analysts classify this as a doctrinal shift — from resource harvesting to territorial consolidation.</p>
<p>The Senate passes the <strong>Security Expansion Act</strong>, the largest single military buildup since the Second Tevarin War: 340 new combat vessels commissioned, twelve frontier defense platforms approved.</p>`,
      fr: `<p>Les rapports de renseignement confirment que les groupes de guerre Vanduul opèrent désormais selon des schémas coordonnés suggérant une direction stratégique au niveau de la confédération, plutôt que le comportement de pillage opportuniste des siècles précédents.</p>
<p>Le Sénat adopte la <strong>Loi d'Expansion Sécuritaire</strong>, la plus grande mobilisation militaire unique depuis la Deuxième Guerre Tevarin : 340 nouveaux vaisseaux de combat commandés, douze plateformes de défense frontalières approuvées.</p>`,
    },
  },
  {
    slug: "year-2954-status",
    title: {
      en: "The Empire at 2954",
      fr: "L'Empire en 2954",
    },
    date: { year: 2954 },
    eraSlug: "modern-uee",
    tags: ["CIVILIZATION", "HISTORY"],
    significance: "standard",
    content: {
      en: `<p>The United Empire of Earth in 2954 is a civilization in tension with itself. Economically, it represents the most prosperous period in human history. Politically, it remains fragile: democratic accountability depends almost entirely on the character of whoever holds the Imperatorship.</p>
<p>The story is not finished. What any given citizen makes of their place in this moment — their small portion of 879 years of human history in the stars — is entirely up to them.</p>`,
      fr: `<p>L'Empire Uni de la Terre en 2954 est une civilisation en tension avec elle-même. Économiquement, il représente la période la plus prospère de l'histoire humaine. Politiquement, il reste fragile : la responsabilité démocratique dépend presque entièrement du caractère de celui qui détient la position d'Imperator.</p>
<p>L'histoire n'est pas terminée. Ce que chaque citoyen fait de sa place dans ce moment — sa petite part de 879 ans d'histoire humaine dans les étoiles — lui appartient entièrement.</p>`,
    },
  },
];
