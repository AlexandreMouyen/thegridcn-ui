export type EventTag =
  | "CIVILIZATION"
  | "MILITARY"
  | "TECHNOLOGY"
  | "POLITICAL"
  | "HISTORY"
  | "EXPLORATION"
  | "DIPLOMACY"
  | "CONFLICT"
  | "TRAGEDY"
  | "ARCHEOLOGY"
  | "RELIGION"
  | "CULTURE";

export interface ScEra {
  id: string;
  name: string;
  shortName: string;
  startYear: number;
  endYear: number | null;
  description: string;
}

export interface ScEvent {
  id: string;
  slug: string;
  title: string;
  date: {
    year: number;
    month?: number;
    day?: number;
  };
  eraId: string;
  tags: EventTag[];
  content: string;
  significance?: "major" | "standard" | "critical";
}

export const eras: ScEra[] = [
  {
    id: "age-of-exploration",
    name: "Age of Exploration",
    shortName: "Exploration",
    startYear: 2075,
    endYear: 2540,
    description:
      "Humanity shatters the bounds of the solar system, discovers jump points, and makes first contact with alien civilizations.",
  },
  {
    id: "first-tevarin-war",
    name: "First Tevarin War",
    shortName: "First War",
    startYear: 2541,
    endYear: 2546,
    description:
      "Humanity's first true interstellar conflict — against the militaristic Tevarin species — reshapes the political order.",
  },
  {
    id: "messer-era",
    name: "Messer Era",
    shortName: "Messer Era",
    startYear: 2546,
    endYear: 2792,
    description:
      "A dynastic line of authoritarian Imperators reshapes the UEE over 246 years, marked by expansion, suppression, and eventual collapse.",
  },
  {
    id: "restoration",
    name: "Restoration",
    shortName: "Restoration",
    startYear: 2792,
    endYear: 2900,
    description:
      "The fall of the Messer regime opens a century of democratic reform, cultural recovery, and painful reckoning with the past.",
  },
  {
    id: "modern-uee",
    name: "Modern UEE",
    shortName: "Modern",
    startYear: 2900,
    endYear: null,
    description:
      "The contemporary era — a civilization navigating the existential threat of the Vanduul, fragile interstellar diplomacy, and its own contradictions.",
  },
];

export const events: ScEvent[] = [
  // ── AGE OF EXPLORATION ──────────────────────────────────────────────────
  {
    id: "rsi-founded",
    slug: "rsi-founded",
    title: "Roberts Space Industries Founded",
    date: { year: 2075 },
    eraId: "age-of-exploration",
    tags: ["TECHNOLOGY", "CIVILIZATION"],
    significance: "major",
    content: `<p>In a modest development campus outside Denver, engineer Wallace Muhammed and entrepreneur Nathan Warrick establish Roberts Space Industries — a private aerospace company with the singular vision of advancing humanity's reach into the cosmos.</p>
<p>Initially focused on commercial satellite deployment, RSI quickly pivots to experimental propulsion research. Their early quantum drive prototypes, though crude by later standards, represent the first serious civilian investment in post-conventional space travel. The company's motto — <strong>"Reach for the Stars"</strong> — proves to be more than corporate aspiration.</p>`,
  },
  {
    id: "first-quantum-drive",
    slug: "first-quantum-drive",
    title: "Quantum Drive Successfully Tested",
    date: { year: 2096 },
    eraId: "age-of-exploration",
    tags: ["TECHNOLOGY", "HISTORY"],
    significance: "critical",
    content: `<p>RSI's Mark I Quantum Drive undergoes its first successful full-scale test aboard the <em>UEES Artemis</em> in low Earth orbit. The drive achieves 0.2c — one-fifth the speed of light — a leap orders of magnitude beyond any prior propulsion system.</p>
<p>The demonstration reshapes global investment priorities overnight. NASA, restructured into the United Earth Space Agency (UESA) a decade prior, contracts RSI to supply quantum drives for a new national exploration fleet. The age of human confinement to the solar system is declared over. Mining corporations begin lobbying for priority access to the outer belt within the week.</p>`,
  },
  {
    id: "first-jump-point",
    slug: "first-jump-point",
    title: "First Jump Point Discovered",
    date: { year: 2113 },
    eraId: "age-of-exploration",
    tags: ["EXPLORATION", "HISTORY"],
    significance: "critical",
    content: `<p>Survey vessel <em>ISS Perses</em>, dispatched to catalogue anomalous gravitational readings near Saturn's outer orbit, discovers something that will redefine humanity's place in the universe: a stable, traversable jump point leading to an entirely new star system.</p>
<p>Scientists designate the destination Davien System. The find sparks immediate theoretical debate — are jump points natural phenomena, or evidence of prior intelligent engineering? No consensus emerges. What is certain is that humanity has a doorway to the galaxy.</p>
<p>Controlled access to jump points becomes one of the most politically contentious issues of the following century, with corporations, governments, and military bodies all vying for priority licensing. The discovery makes three executives billionaires before the week is out.</p>`,
  },
  {
    id: "banu-first-contact",
    slug: "banu-first-contact",
    title: "First Contact: Banu Protectorate",
    date: { year: 2157 },
    eraId: "age-of-exploration",
    tags: ["DIPLOMACY", "HISTORY", "CIVILIZATION"],
    significance: "critical",
    content: `<p>Near the Davien System's outer rim, scout pilot Vernon Tar — flying a standard resource survey run — encounters a Banu merchant vessel. Tar's instinct to broadcast a non-threatening greeting signal rather than activate defensive systems is widely credited as one of the most consequential individual decisions in human history.</p>
<p>Initial communication, conducted through improvised symbol exchange, establishes mutual intent. Earth governments scramble to assemble a diplomatic team. The Banu, a species of intensely individual merchants organized around a Protectorate structure, show no hostility — only commercial curiosity.</p>
<p>The resulting treaty, finalized three years later, establishes the first-ever diplomatic and trade relationship between humanity and an alien species. The <strong>Banu-Human Trade &amp; Mutual Defense Pact</strong> remains foundational interstellar law to this day. Its primary economic provision — most-favored-trader status for RSI ships — is widely seen as the moment corporate influence permanently entered UPE foreign policy.</p>`,
  },
  {
    id: "xian-first-contact",
    slug: "xian-first-contact",
    title: "First Contact: Xi'An Empire",
    date: { year: 2262 },
    eraId: "age-of-exploration",
    tags: ["DIPLOMACY", "HISTORY", "CONFLICT"],
    significance: "critical",
    content: `<p>Unlike the Banu encounter, first contact with the Xi'An Empire unfolds as a series of tense border skirmishes rather than diplomatic exchange. Xi'An patrol vessels respond to human survey ships entering the Perry Line with weapons fire. Three human scouts are destroyed; two Xi'An vessels are damaged in return.</p>
<p>Neither side declares war. Both sides dispatch military fleets to the border and diplomatic vessels to neutral space simultaneously. The Xi'An, it emerges, are an ancient species with millennia of recorded history — and a particular wariness of younger civilizations that have historically proven destructive.</p>
<p>Formal diplomatic exchange begins in 2264. The Xi'An assess humanity carefully, communicate with meticulous precision, and ultimately offer a cold but functional coexistence. The Perry Line ceasefire treaty remains the cornerstone of human-Xi'An relations — fragile, frequently tested, but unbroken for nearly seven centuries.</p>`,
  },
  {
    id: "managed-democracy-reform",
    slug: "managed-democracy-reform",
    title: "Managed Democracy Reform",
    date: { year: 2380 },
    eraId: "age-of-exploration",
    tags: ["POLITICAL", "CIVILIZATION"],
    significance: "major",
    content: `<p>Facing the logistical impossibility of representative democracy across dozens of inhabited systems with years of light-speed communication delay, the United Planets of Earth undergoes its most significant constitutional reform since its founding. Senator Assan Kieren's Managed Democracy bill passes by a narrow majority.</p>
<p>The new system centralizes executive authority in an elected Imperator while maintaining a Senate with limited oversight. Critics immediately label it authoritarian drift; proponents argue it is a pragmatic necessity for governing an interstellar civilization that spans light-years.</p>
<p>The compromise satisfies no one fully — and plants seeds that will germinate in the Messer rise to power nearly two centuries later. Historians examining the vote records note that several key senators changed position after private meetings with RSI executives. Those meetings remain classified.</p>`,
  },
  // ── FIRST TEVARIN WAR ───────────────────────────────────────────────────
  {
    id: "tevarin-discovered",
    slug: "tevarin-discovered",
    title: "Tevarin Homeworld Discovered",
    date: { year: 2540 },
    eraId: "first-tevarin-war",
    tags: ["EXPLORATION", "MILITARY"],
    significance: "major",
    content: `<p>A series of unmanned probes ventures into a previously uncharted jump corridor and returns with imagery of a developed alien civilization. The Tevarin homeworld, designated Kaleeth, is a planet of striking geometric architecture and unmistakable military infrastructure.</p>
<p>Unlike the Banu encounter, there is no ambiguity about the Tevarin's nature: they are a martial species whose first intercepted broadcasts consist almost entirely of territorial claim signals and what xenolinguists translate as ceremonial challenges. UPE military intelligence begins immediate defensive mobilization.</p>
<p>A civilian science team petitions for diplomatic engagement before military posturing escalates further. Their petition is classified and its authors reassigned. The decision is later described by historians as the UPE's most costliest single bureaucratic failure.</p>`,
  },
  {
    id: "first-tevarin-war-start",
    slug: "first-tevarin-war-start",
    title: "First Tevarin War Begins",
    date: { year: 2541 },
    eraId: "first-tevarin-war",
    tags: ["MILITARY", "CONFLICT", "HISTORY"],
    significance: "critical",
    content: `<p>Without formal declaration, Tevarin war fleets cross into Orion System, destroying two colony stations and a civilian transport carrying 4,200 passengers. The brutality of the assault — later analyzed as a ritual declaration of war in Tevarin martial culture — shocks the UPE Senate into emergency session.</p>
<p>Within seventy-two hours, the Senate authorizes military response. For the first time in human history, the UPE fights not pirates or separatists, but a peer civilization with equivalent space warfare capability. Early engagements are brutal and indecisive. Human tactical doctrine, designed for asymmetric conflict, struggles against Tevarin formation tactics.</p>
<p>Junior Fleet Officer Ivar Messer distinguishes himself in the defense of Orion II, receiving decoration for holding a defensive perimeter with half-crew against twice the expected Tevarin force. His name begins appearing in UPE propaganda broadcasts within the month.</p>`,
  },
  {
    id: "battle-idris-iv",
    slug: "battle-idris-iv",
    title: "Battle of Idris IV",
    date: { year: 2544 },
    eraId: "first-tevarin-war",
    tags: ["MILITARY", "CONFLICT"],
    significance: "critical",
    content: `<p>The defining engagement of the First Tevarin War. A Tevarin fleet of over three hundred vessels makes a surprise incursion into Idris System, targeting the planet's critical shipyard complex. Fleet Admiral Ernst Bishop commits forty-seven UPE warships in what becomes a six-day running battle through the system's dense asteroid field.</p>
<p>The outnumbered UPE fleet, using Bishop's improvised "rolling defense" tactics — trading territory for attrition — destroys or disables 212 Tevarin vessels and forces a full withdrawal. Human casualties number 12,000 across the fleet engagement. The shipyard survives intact.</p>
<p>Bishop is promoted to Supreme Fleet Admiral. Among the decorated officers for exceptional valor in the battle's final hours: Ivar Messer, who led a boarding action against the Tevarin flagship with twenty-nine volunteers. Twenty-six did not return. The action is commemorated each year. Messer's name is assigned to two cruisers and a colony station before his promotion is even finalized.</p>`,
  },
  {
    id: "messer-first-citizen",
    slug: "messer-first-citizen",
    title: "Ivar Messer Named First Citizen",
    date: { year: 2546 },
    eraId: "first-tevarin-war",
    tags: ["POLITICAL", "MILITARY", "HISTORY"],
    significance: "critical",
    content: `<p>With the Tevarin militarily finished but the specter of renewed conflict looming, the Senate invokes emergency wartime provisions to elevate Fleet Admiral Ivar Messer to the role of "First Citizen" — a theoretically temporary executive position with broad emergency powers. Messer's carefully engineered heroism, including several battles later revealed to have been staged or inflated for propaganda value, has made him the most beloved public figure in the UPE.</p>
<p>His appointment is celebrated in streets across dozens of systems. Citizens project his face onto government buildings. Children are named after him. News networks run continuous favorable coverage.</p>
<p>Few realize they have just witnessed the death of democratic civilian governance. The emergency powers will never be relinquished. The Messer Era has begun — not with a coup, but with applause.</p>`,
  },
  // ── MESSER ERA ──────────────────────────────────────────────────────────
  {
    id: "messer-imperator",
    slug: "messer-imperator",
    title: "Ivar Messer I Declares Himself Imperator",
    date: { year: 2546 },
    eraId: "messer-era",
    tags: ["POLITICAL", "HISTORY"],
    significance: "critical",
    content: `<p>Within months of appointment as First Citizen, Ivar Messer maneuvers through a compliant Senate to have his title permanently renamed "Imperator" and his powers constitutionally enshrined. The move is presented as modernization; in reality, it marks the formal transformation of the United Planets of Earth into the <strong>United Empire of Earth (UEE)</strong>.</p>
<p>The new title carries hereditary succession rights. The Senate retains legislative function but executive authority now rests permanently with the Messer line. Dissenting senators who spoke against the measure find themselves facing corruption charges within the year. A pattern of political suppression is established that will intensify over the next two centuries.</p>
<p>Messer's first public address as Imperator promises "an empire of merit, not birth." The speech is mandatory viewing in UEE schools for the next 244 years. The irony is noted only in private, and sometimes not even then.</p>`,
  },
  {
    id: "second-tevarin-war",
    slug: "second-tevarin-war",
    title: "Second Tevarin War: Corath'Thal's Last Stand",
    date: { year: 2603 },
    eraId: "messer-era",
    tags: ["MILITARY", "CONFLICT", "CULTURE"],
    significance: "major",
    content: `<p>The surviving Tevarin, stripped of their homeworld and scattered to refugee fleets, launch a desperate final campaign to reclaim Kaleeth. Under the command of warrior-poet Corath'Thal, the Tevarin fleet strikes with extraordinary coordination and sacrificial ferocity — their goal not conquest but spiritual reclamation of their ancestral world.</p>
<p>The UEE responds with overwhelming force. The final battle above Kaleeth ends when Corath'Thal, rather than surrender, leads his remaining vessels in a deliberate dive into the planet's atmosphere. The image — hundreds of burning Tevarin ships descending like falling stars onto the world they died trying to reclaim — is broadcast across humanity and evokes a complicated, uneasy grief even among veterans who fought in the war.</p>
<p>The Tevarin survive only as scattered individuals integrated, often forcibly, into human-dominated settlements. Corath'Thal's poem <em>Kaleeth Remembers</em>, transcribed and translated before the final assault, becomes one of the most widely read works of alien literature in human history.</p>`,
  },
  {
    id: "massacre-garron-ii",
    slug: "massacre-garron-ii",
    title: "Massacre of Garron II",
    date: { year: 2715 },
    eraId: "messer-era",
    tags: ["TRAGEDY", "HISTORY", "CIVILIZATION"],
    significance: "critical",
    content: `<p>Garron II hosts a pre-industrial alien species classified by UEE xenobiologists as "Category Four: minimal sentience." When a terraforming operation begins despite ongoing surveys, the Messers authorize it under commercial development clauses. Local scientists who protest are transferred off-world.</p>
<p>What follows is documented in graphic detail by embedded journalist Gant Bettencourt: the complete ecological destruction of one hemisphere, the deaths of millions of native beings who display clear social coordination, communication, and what appears to be organized mourning, and the subsequent suppression of Bettencourt's recordings under State Emergency Secrecy Law 7-C.</p>
<p>The leaked footage, distributed under the designation <em>The Garron Transmissions</em>, sparks the first significant anti-Messer political underground. Bettencourt is sentenced to life imprisonment on a mining platform. He dies there. His recordings survive. They are the beginning of organized resistance against the Messer line — distributed hand-to-hand across eighteen systems, watched in basements and locked cargo holds wherever humans gather out of official sight.</p>`,
  },
  {
    id: "synthworld-project",
    slug: "synthworld-project",
    title: "Synthworld Project Commences",
    date: { year: 2751 },
    eraId: "messer-era",
    tags: ["TECHNOLOGY", "CIVILIZATION"],
    significance: "major",
    content: `<p>Messer VII's obsession with legacy produces the most ambitious — and catastrophically unsuccessful — engineering project in UEE history: the artificial construction of an entire habitable planet. The Synthworld project aims to demonstrate that human technology has transcended the natural universe.</p>
<p>Legions of engineers, fabricators, and labor conscripts are deployed to Chronos System. Entire system-wide economics are restructured to fund it. Over the following centuries, the project consumes resources equivalent to fighting three major wars.</p>
<p>The planet remains fundamentally unfinished. Support structures are visible from orbit like a wound. The Synthworld becomes a monument to Messer megalomania — a decades-long drain maintained more from political inertia than any genuine intent to complete. Contractors who attempt to resign are reassigned under duress. Modern estimates suggest the project would require another four centuries to complete at current funding. Debate persists over whether it should be.</p>`,
  },
  {
    id: "three-pillars",
    slug: "three-pillars",
    title: '"The Three Pillars" Distributed Underground',
    date: { year: 2780, month: 3 },
    eraId: "messer-era",
    tags: ["CULTURE", "HISTORY", "CIVILIZATION"],
    significance: "major",
    content: `<p>Philosopher Sujata Vatari, writing under the pseudonym Suj Vattic to evade Messer censors, begins distributing her banned text <em>The Three Pillars</em> through underground networks across thirty systems. The work articulates a philosophical framework for post-authoritarian governance built on three foundations: <strong>accountability</strong>, <strong>transparency</strong>, and <strong>measured representation</strong>.</p>
<p>Within two years, handwritten copies exist on every inhabited world. The Advocacy arrests thousands for possession. The text survives regardless — reproduced in margins, tattooed on wrists, memorized by children who will one day write the legislation it inspires.</p>
<p>Suj Vattic is eventually revealed to be Vatari — she lives to see her three pillars codified into UEE law, dying at ninety-four years of age just months after Messer XI's overthrow. At her funeral, the presiding senator reads the entirety of <em>The Three Pillars</em> aloud to the Senate. It takes four hours. No member leaves early.</p>`,
  },
  {
    id: "messer-overthrown",
    slug: "messer-overthrown",
    title: "Messer XI Overthrown: Operation Archangel",
    date: { year: 2792, month: 6 },
    eraId: "messer-era",
    tags: ["POLITICAL", "MILITARY", "HISTORY"],
    significance: "critical",
    content: `<p>A coordinated military coup codenamed <strong>Operation Archangel</strong>, organized by a network of high-ranking Navy officers, Senate security personnel, and civilian resistance members who spent decades preparing in secret, executes simultaneously across seven systems. Messer XI — Gavor Messer, widely regarded as the cruelest of the dynasty — is removed from power without a single armed engagement.</p>
<p>The final confrontation occurs in the Senate chamber. Surrounded by officers who served under him for years, Gavor Messer is formally stripped of the Imperatorship and placed under permanent house arrest. His attempted broadcast appeal to loyalist fleet commanders goes unanswered — many had pledged support to the coup planners weeks prior, their loyalty quietly purchased not with gold but with the promise of a return to something better.</p>
<p>The 246-year Messer dynasty ends not with a battle, but with silence. A duty officer in the Senate security bureau writes in his log that evening: <em>"Nobody cried. That was the strangest part. We had all imagined we would cry."</em></p>`,
  },
  // ── RESTORATION ─────────────────────────────────────────────────────────
  {
    id: "erin-toi-imperator",
    slug: "erin-toi-imperator",
    title: "Erin Toi Named Imperator — Restoration Begins",
    date: { year: 2792, month: 9 },
    eraId: "restoration",
    tags: ["POLITICAL", "HISTORY"],
    significance: "critical",
    content: `<p>The Senate, freed from Messer control for the first time in two and a half centuries, convenes an emergency session and names Erin Toi — a widely respected jurist and former head of the civilian review board that had secretly supported Operation Archangel — as transitional Imperator. Her mandate is explicitly reformist: dismantle Messer-era legal coercions, restore civil liberties, and establish mechanisms for democratic accountability.</p>
<p>Toi's first address to the Senate is still studied in political philosophy programs: <em>"We do not discard the structure of Empire; we fill it with meaning. Not the meaning of one family's ambition, but of every family's hope."</em></p>
<p>The applause lasts eleven minutes. Several senators, who had spent their entire careers under the Messers and voted for legislation they privately opposed, weep openly. The broadcast is watched by 4.2 billion people. Toi's approval rating on the first day is the highest recorded for any Imperator in UEE history. It does not stay that way — the work of restoration is slow, painful, and full of compromise — but the direction, at last, is changed.</p>`,
  },
  {
    id: "restoration-acts",
    slug: "restoration-acts",
    title: "Restoration Acts Passed",
    date: { year: 2800 },
    eraId: "restoration",
    tags: ["POLITICAL", "CIVILIZATION"],
    significance: "major",
    content: `<p>Eight years of legislative work culminates in the passage of the <strong>Restoration Acts</strong> — a sweeping package of constitutional reforms that formally repudiates Messer-era law. Key provisions include: mandatory Senate review of all Imperatorship executive actions, reinstatement of habeas corpus across all UEE systems, recognition of the Tevarin as a protected cultural group with right of communal assembly, and establishment of an independent Bureau of Justice to investigate wartime atrocity claims.</p>
<p>The acts are imperfect compromises — many senators with Messer-era ties successfully watered down accountability provisions, particularly those related to corporate complicity. Several clauses are challenged in judicial review within years of passage. But the core framework holds, and reformers spend the next century strengthening it.</p>
<p>The passage date — the 14th of March, 2800 — is declared a UEE public holiday: <em>Restoration Day</em>. On the first celebration, Tevarin communities across fourteen systems hold public ceremonial vigils. No UEE official is invited. None attempts to attend.</p>`,
  },
  {
    id: "tevarin-cultural-reintegration",
    slug: "tevarin-cultural-reintegration",
    title: "Tevarin Cultural Reintegration Accords",
    date: { year: 2843 },
    eraId: "restoration",
    tags: ["CIVILIZATION", "DIPLOMACY", "CULTURE"],
    significance: "major",
    content: `<p>Fifty years after the Restoration Acts formally recognized Tevarin rights, the UEE Senate passes the Reintegration Accords — a more substantive set of measures providing land grants in three systems for Tevarin communal settlement, government funding for preservation of Tevarin language and martial traditions, and the formal return of artifacts confiscated during the Messer era from museum archives.</p>
<p>Tevarin community leaders accept the accords with carefully worded statements that acknowledge the gesture while explicitly noting its inadequacy. The ceremony is attended by the largest gathering of Tevarin representatives since before the Second Tevarin War — 847 individuals, many of whom were born in human-administered labor facilities they were told were homes.</p>
<p>The accords are imperfect and contested within Tevarin communities: some see engagement with UEE governance as collaboration; others see it as survival. The debate continues in Tevarin-only spaces the UEE is not invited into.</p>`,
  },
  {
    id: "nul-system-abandoned",
    slug: "nul-system-abandoned",
    title: "Nul System Declared Abandoned Territory",
    date: { year: 2872 },
    eraId: "restoration",
    tags: ["CIVILIZATION", "HISTORY"],
    significance: "standard",
    content: `<p>Following decades of failed economic development, persistent organized crime dominance, and a series of terraforming failures that leave Ashana's orbit cluttered with hazardous debris, the Senate votes to officially withdraw administrative presence from Nul System.</p>
<p>The designation "abandoned territory" — distinct from lawless space — means the UEE acknowledges existing settlements but provides no military protection, legal infrastructure, or services. Generations of families who built lives in Nul are bitterly divided: some accept relocation grants; many remain, building a culture of radical self-sufficiency that becomes one of the most distinctive subcultures in the rim.</p>
<p><em>"They gave up on us, so we learned to not need them."</em> — Common Nulian proverb, origin unknown.</p>
<p>The system develops a reputation for accepting those the UEE refuses: political dissidents, debt escapees, Tevarin who prefer the frontier to managed coexistence. Whether this is freedom or abandonment depends entirely on who is asked.</p>`,
  },
  // ── MODERN UEE ──────────────────────────────────────────────────────────
  {
    id: "vanduul-vega-attack",
    slug: "vanduul-vega-attack",
    title: "Vanduul Devastate Vega System",
    date: { year: 2945 },
    eraId: "modern-uee",
    tags: ["MILITARY", "CONFLICT", "TRAGEDY"],
    significance: "critical",
    content: `<p>Without warning, a Vanduul war party of unprecedented scale — over nine hundred vessels — crosses into Vega System and begins a systematic campaign of civilian extermination. The first UEE response fleet arrives fifteen hours into the assault and is largely destroyed in the initial engagement. The planet Vega II, population 4.7 billion, is bombarded for eleven continuous days.</p>
<p>The final death toll exceeds 450 million. It is the largest single casualty event in human history. Across the UEE, broadcasts of the planet burning — replayed on every media feed for weeks — transform public opinion with shocking speed. Pacifist senators face recall elections. Defense spending authorization triples within a year. Memorials are constructed on every inhabited world.</p>
<p>Vega remains a monument system. No civilian habitation has been permitted on Vega II since the attack. The planet's surface, viewed from orbit, shows impact scarring across two continents. Volunteer teams maintain a rotating presence near the atmosphere, broadcasting memorial transmissions on a frequency reserved by Senate decree. They will continue until the heat death of the star.</p>`,
  },
  {
    id: "project-rebirth",
    slug: "project-rebirth",
    title: "Project Rebirth Report Released",
    date: { year: 2945, month: 11 },
    eraId: "modern-uee",
    tags: ["HISTORY", "CIVILIZATION", "TRAGEDY"],
    significance: "major",
    content: `<p>The independent historical commission chartered by the Senate releases <em>Project Rebirth</em> — a 12,000-page report documenting Messer-era atrocities previously classified, suppressed, or denied. The report details 42 separate events involving deliberate mass civilian casualties, systematic torture programs run through the Advocacy, and the identities of personnel who were subsequently protected under transitional arrangements.</p>
<p>Many perpetrators named are long dead. Others are alive — a small number still hold academic and advisory positions in the very institutions that benefited from their Messer-era service. The report recommends criminal prosecution where statute of limitations permits, public memorialization, and formal UEE apology to affected communities.</p>
<p>Response is politically charged. Several implicated advisors resign before the report is officially released (a leak to the press is widely attributed to Senate staff who could not wait). The Senate formally apologizes to Tevarin and Garron II survivor communities — 230 years late. The apology is read into the record without debate. A vote on whether to applaud afterward fails to reach quorum.</p>`,
  },
  {
    id: "concord-of-ayr",
    slug: "concord-of-ayr",
    title: "Concord of Ayr: UEE–Xi'An Peace Framework",
    date: { year: 2950 },
    eraId: "modern-uee",
    tags: ["DIPLOMACY", "POLITICAL"],
    significance: "major",
    content: `<p>Centuries of cold war, proxy skirmishes, and border tensions between the UEE and Xi'An Empire reach a tentative moment of de-escalation with the signing of the <strong>Concord of Ayr</strong>. Negotiated over seven years in neutral Perry Line systems, the agreement establishes shared traffic protocols, mutual non-hostility zones, and — most controversially — limited cultural exchange provisions.</p>
<p>Xi'An negotiators, in a gesture that astonishes human diplomats, include a formal diplomatic acknowledgment of historical human territorial violations and express formal condolences for the civilian casualties of specific border incidents. Human diplomats respond in kind. Neither side trusts the other. Both recognize the alternative: a shooting war that would devastate both civilizations while handing the Vanduul a decisive strategic advantage either direction.</p>
<p>The Concord is celebrated cautiously in the UEE and with characteristic Xi'An restraint on their side. Independent analysts note that it contains no enforcement mechanism, no dispute resolution protocol, and no timeline for implementation of its cultural exchange provisions. A Xi'An diplomat, when asked for comment, replies: <em>"A good treaty requires no enforcement. A bad treaty requires only patience."</em></p>`,
  },
  {
    id: "vanduul-expansion-2951",
    slug: "vanduul-expansion-2951",
    title: "Vanduul Tactical Shift: Coordinated Expansion",
    date: { year: 2951 },
    eraId: "modern-uee",
    tags: ["MILITARY", "POLITICAL"],
    significance: "major",
    content: `<p>Intelligence reports confirm what frontier colonists have been reporting for years: Vanduul war parties are now operating in coordinated patterns that suggest confederation-level strategic direction, rather than the opportunistic raiding behavior of previous centuries. Military analysts classify this as a doctrinal shift — from resource harvesting to territorial consolidation.</p>
<p>The Senate passes the <strong>Security Expansion Act</strong>, the largest single military buildup since the Second Tevarin War: 340 new combat vessels commissioned, twelve frontier defense platforms approved, conscription incentives tripled. Defense industry stocks record their highest quarterly growth in history.</p>
<p>Citizens debate whether the buildup prevents violence or accelerates it. Frontier colony leaders petition for immediate military presence. Some academic analysts warn that Vanduul clan psychology may interpret large defensive buildups as provocation. Their papers are widely read and their funding quietly cut within the year.</p>`,
  },
  {
    id: "year-2954",
    slug: "year-2954-status",
    title: "The Empire at 2954",
    date: { year: 2954 },
    eraId: "modern-uee",
    tags: ["CIVILIZATION", "HISTORY"],
    significance: "standard",
    content: `<p>The United Empire of Earth in 2954 is a civilization in tension with itself. Economically, it represents the most prosperous period in human history — quantum travel connects over eighty systems, and the middle class of frontier worlds has never been larger. Politically, it remains fragile: the Messer legacy of centralized executive power means democratic accountability depends almost entirely on the character of whoever holds the Imperatorship.</p>
<p>Externally, the Vanduul threat is existential and unresolved. The Xi'An peace is fragile and untested under pressure. The Banu remain valuable trading partners whose internal politics are largely opaque to human intelligence. And somewhere in uncharted space, the ruins of civilizations destroyed by the Vanduul serve as a reminder of what is at stake — silent systems where intelligent life once broadcast its songs into the dark and was answered with fire.</p>
<p>The story is not finished. It is, in many ways, only beginning. What any given citizen makes of their place in this moment — their small portion of 879 years of human history in the stars — is entirely up to them.</p>`,
  },
];
