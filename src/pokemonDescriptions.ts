// Canonical Gen-1 (Kanto) Pokédex flavour text for all 151 species.
//
// EN is locale-neutral, adapted from the official Pokédex entries
// (Red/Blue/Yellow/FireRed/LeafGreen era).
// PL is a faithful, natural Polish rendering that keeps the tone and nuance
// of the source without adding Poland-specific notes.
//
// Keyed by national Pokédex number. PokedexView reads from here directly.

export const POKEMON_DESCRIPTIONS: Record<number, { pl: string; en: string }> = {
  1: {
    pl: "Bulbasaur spędza czas drzemiąc w słońcu. Na jego plecach rośnie tajemnicze nasiono, które rozszerza się i czerpie energię z promieni słonecznych.",
    en: "Bulbasaur can be seen napping in bright sunlight. There is a seed on its back. By soaking up the sun's rays, the seed grows progressively larger.",
  },
  2: {
    pl: "Gdy pąk na plecach Ivysaura zaczyna pęcznieć, Pokémon traci zdolność stania na tylnych łapach. Oznacza to, że wkrótce rozkwitnie w Venusaur.",
    en: "When the bud on its back starts swelling, Ivysaur loses the ability to stand on its hind legs. This is a sign that it will soon bloom into Venusaur.",
  },
  3: {
    pl: "Venusaur posiada olbrzymi kwiat, którego zapach koi emocje ludzi i Pokémonów. Kwiat ten rozkwita najpełniej, gdy absorbuje światło słoneczne.",
    en: "Venusaur has a giant flower whose sweet aroma calms the emotions of people and Pokémon. The flower blooms most beautifully when it absorbs sunlight.",
  },
  4: {
    pl: "Płomień na końcu ogona Charmandera wskazuje jego siłę życiową i emocje. Kiedy cieszy się, płomień faluje, a gdy jest wściekły - gwałtownie bucha.",
    en: "The flame on the tip of Charmander's tail indicates its life force and emotions. When it is happy, the flame waves; when it is angry, it blazes fiercely.",
  },
  5: {
    pl: "Charmeleon ma niezwykle wojowniczą naturę. W ferworze walki niszczy wrogów ostrymi pazurami, a z jego pyska buchają potężne płomienie.",
    en: "Charmeleon has an incredibly hot-headed nature. In the heat of battle, it shreds foes with sharp claws while breathing out powerful tongues of flame.",
  },
  6: {
    pl: "Charizard lata wysoko w poszukiwaniu silnych rywali. Ogień, którym dysponuje, jest tak gorący, że bez trudu topi najtwardsze odłamy skalne.",
    en: "Charizard flies high in search of strong opponents. The fire it breathes is so hot that it easily melts the hardest rocks.",
  },
  7: {
    pl: "Squirtle potrafi schować się w swojej skorupie, a następnie tryskać wodą pod ogromnym ciśnieniem. Skorupa chroni go przed wszelkimi atakami.",
    en: "Squirtle can hide inside its shell, then spray high-pressure water. The shell protects it from various attacks.",
  },
  8: {
    pl: "Wartortle jest symbolem długowieczności. Puszysty ogon pokryty gęstym futrem staje się ciemniejszy i bardziej okazały wraz z upływem wieków.",
    en: "Wartortle is a symbol of longevity. Its fluffy fur-covered tail grows darker and more magnificent as the centuries pass.",
  },
  9: {
    pl: "Blastoise posiada na skorupie dwa potężne działa wodne, które potrafią przebić stal. Używa ich do precyzyjnych strzałów na odległość kilkudziesięciu metrów.",
    en: "Blastoise has two powerful water cannons on its shell that can pierce steel. It uses them for precise shots from great distances.",
  },
  10: {
    pl: "Caterpie pokryty jest zieloną skórą, która idealnie maskuje go w liściach. Wydziela silny zapach z czerwonego czułka, aby odstraszyć wrogów.",
    en: "Caterpie is covered in a green skin that perfectly camouflages it in leaves. It releases a strong odor from its red antenna to repel foes.",
  },
  11: {
    pl: "Metapod tkwi nieruchomo w twardej jak stal kokonie, przygotowując się do ewolucji. Wewnątrz skorupy jego ciało jest miękkie i podatne na zranienia.",
    en: "Metapod stands completely still inside its hard, steel-like cocoon as it prepares to evolve. Inside the shell, its body is soft and vulnerable.",
  },
  12: {
    pl: "Butterfree uwielbia nektar z najpiękniejszych kwiatów. Potrafi dostrzec je z ogromnych odległości, a jego skrzydła pokryte są mieniącym się pyłkiem.",
    en: "Butterfree loves the nectar of beautiful flowers. It can spot them from great distances, and its wings are covered in glittering powder.",
  },
  13: {
    pl: "Weedle często spotyka się w lasach i na łąkach. Na głowie nosi ostre, jadowite żądło, którym broni się przed napastnikami.",
    en: "Often found in forests and grasslands, Weedle has a sharp, venomous stinger on its head that it uses to defend itself.",
  },
  14: {
    pl: "Kakuna jest niemal całkowicie pozbawiony zdolności ruchu. Potrafi jedynie utwardzać swoją skorupę, aby chronić się przed drapieżnikami.",
    en: "Almost incapable of moving, Kakuna can only harden its shell to protect itself from predators while it waits to evolve.",
  },
  15: {
    pl: "Beedrill lata z ogromną prędkością i atakuje, używając wielkich jadowitych żądeł na przednich odnóżach oraz ogonie.",
    en: "Beedrill flies at high speed and attacks using the large venomous stingers on its forelegs and tail.",
  },
  16: {
    pl: "Pidgey to powszechny widok w lasach i zagajnikach. Trzepocząc skrzydłami tuż nad ziemią, wzbija oślepiające tumany piasku.",
    en: "A common sight in forests and woods, Pidgey flaps its wings at ground level to kick up blinding sand.",
  },
  17: {
    pl: "Pidgeotto zaciekle strzeże swojego rozległego terytorium. Każdego intruza przegania gwałtownymi dziobnięciami.",
    en: "Very protective of its sprawling territorial area, Pidgeotto will fiercely peck at any intruder.",
  },
  18: {
    pl: "Pidgeot poluje, sunąc z dużą prędkością tuż nad taflą wody, by porwać nieostrożną zdobycz, taką jak Magikarp.",
    en: "When hunting, Pidgeot skims the surface of water at high speed to pick off unwary prey such as Magikarp.",
  },
  19: {
    pl: "Rattata gryzie wszystko, co napotka podczas ataku. Mały i bardzo szybki, jest częstym widokiem w wielu miejscach.",
    en: "Rattata bites anything when it attacks. Small and very quick, it is a common sight in many places.",
  },
  20: {
    pl: "Raticate utrzymuje równowagę dzięki długim wąsom. Podobno traci zwinność, gdy zostaną one przycięte.",
    en: "Raticate uses its whiskers to maintain its balance. It apparently slows down if they are cut off.",
  },
  21: {
    pl: "Spearow żywi się owadami na trawiastych terenach. Aby utrzymać się w powietrzu, musi bardzo szybko trzepotać krótkimi skrzydłami.",
    en: "Spearow eats bugs in grassy areas. It has to flap its short wings at high speed to stay airborne.",
  },
  22: {
    pl: "Fearow dzięki wielkim, okazałym skrzydłom potrafi przebywać w powietrzu cały dzień, ani razu nie lądując dla odpoczynku.",
    en: "With its huge and magnificent wings, Fearow can stay aloft without ever having to land for rest.",
  },
  23: {
    pl: "Ekans porusza się cicho i niepostrzeżenie. W całości połyka jaja Pidgey i Spearow.",
    en: "Ekans moves silently and stealthily. It eats the eggs of Pidgey and Spearow whole.",
  },
  24: {
    pl: "Mówi się, że groźne, ostrzegawcze wzory na brzuchu Arboka różnią się w zależności od regionu, w którym żyje.",
    en: "It is rumored that the ferocious warning markings on Arbok's belly differ from area to area.",
  },
  25: {
    pl: "Pikachu magazynuje energię elektryczną w czerwonych policzkach. Kiedy uwalnia skumulowany prąd, potrafi porazić wroga potężnym wyładowaniem.",
    en: "Pikachu stores electricity in its red cheeks. When it releases this energy, it can shock enemies with huge electrical discharges.",
  },
  26: {
    pl: "Jeśli Raichu zgromadzi zbyt wiele prądu, staje się agresywny. Aby tego uniknąć, odprowadza nadmiar ładunków w ziemię za pomocą długiego ogona.",
    en: "If Raichu stores too much electricity, it becomes aggressive. To prevent this, it discharges excess power into the ground using its long tail.",
  },
  27: {
    pl: "Sandshrew kopie głębokie nory na suchych terenach z dala od wody. Wychodzi na powierzchnię tylko po to, by zdobyć pożywienie.",
    en: "Sandshrew burrows deep underground in arid locations far from water. It only emerges to hunt for food.",
  },
  28: {
    pl: "W obliczu zagrożenia Sandslash zwija się w kolczastą kulę. Skulony potrafi toczyć się, aby zaatakować lub uciec.",
    en: "Sandslash curls up into a spiny ball when threatened. It can roll while curled up to attack or escape.",
  },
  29: {
    pl: "Choć niewielki, Nidoran♀ bywa groźny dzięki jadowitym kolcom. Samica ma mniejsze rogi niż samiec.",
    en: "Although small, Nidoran's venomous barbs make it dangerous. The female has smaller horns than the male.",
  },
  30: {
    pl: "Rogi Nidoriny rosną powoli. W walce woli ataki fizyczne, takie jak drapanie i gryzienie.",
    en: "Nidorina's horn develops slowly. It prefers physical attacks such as clawing and biting.",
  },
  31: {
    pl: "Twarde łuski zapewniają Nidoqueen mocną ochronę. Swoją potężną masą ciała wykonuje druzgocące ataki.",
    en: "Nidoqueen's hard scales provide strong protection. It uses its hefty bulk to execute powerful moves.",
  },
  32: {
    pl: "Nidoran♂ stawia uszy, by wyczuć niebezpieczeństwo. Im większe rogi, tym silniejszy jad, który wydziela.",
    en: "Nidoran stiffens its ears to sense danger. The larger its horns, the more powerful its secreted venom.",
  },
  33: {
    pl: "Nidorino to agresywny Pokémon, który szybko przechodzi do ataku. Róg na jego głowie wydziela silny jad.",
    en: "Nidorino is an aggressive Pokémon that is quick to attack. The horn on its head secretes a powerful venom.",
  },
  34: {
    pl: "Nidoking w walce używa potężnego ogona, by miażdżyć przeciwnika, oplatać go, a w końcu łamać jego kości.",
    en: "Nidoking uses its powerful tail in battle to smash, constrict, then break the prey's bones.",
  },
  35: {
    pl: "Magiczny i uroczy wygląd Clefairy zjednuje mu wielu wielbicieli. Jest rzadki i spotykany tylko w nielicznych miejscach.",
    en: "Clefairy's magical and cute appeal has many admirers. It is rare and found only in certain areas.",
  },
  36: {
    pl: "Clefable to płochliwy wróżkowaty Pokémon, którego rzadko się widuje. Ucieka i kryje się, gdy tylko wyczuje ludzi.",
    en: "Clefable is a timid fairy Pokémon that is rarely seen. It will run and hide the moment it senses people.",
  },
  37: {
    pl: "W chwili narodzin Vulpix ma tylko jeden ogon. Wraz z wiekiem ogon rozdziela się na końcu na kolejne.",
    en: "At the time of birth, Vulpix has just one tail. The tail splits from its tip as it grows older.",
  },
  38: {
    pl: "Ninetales jest bardzo mądry i mściwy. Mówi się, że chwycenie jednego z dziewięciu ogonów może ściągnąć tysiącletnią klątwę.",
    en: "Ninetales is very smart and very vengeful. Grabbing one of its many tails could result in a 1000-year curse.",
  },
  39: {
    pl: "Gdy rywal spojrzy w duże oczy Jigglypuffa, ten zaczyna śpiewać tajemniczą, kojącą kołysankę, która bez wyjątków usypia każdego przeciwnika.",
    en: "If an opponent looks into Jigglypuff's large eyes, it begins to sing a soothing lullaby that always puts everyone to sleep.",
  },
  40: {
    pl: "Ciało Wigglytuffa jest miękkie i sprężyste. Rozzłoszczony nabiera powietrza i nadyma się do ogromnych rozmiarów.",
    en: "Wigglytuff's body is soft and rubbery. When angered, it will suck in air and inflate itself to an enormous size.",
  },
  41: {
    pl: "Zubat tworzy kolonie w miejscach pozbawionych światła. Do namierzania i zbliżania się do celu używa fal ultradźwiękowych.",
    en: "Zubat forms colonies in perpetually dark places. It uses ultrasonic waves to identify and approach its targets.",
  },
  42: {
    pl: "Gdy Golbat dopadnie ofiarę, nie przestaje wysysać jej energii nawet wtedy, gdy zrobi się tak ciężki, że nie może latać.",
    en: "Once it strikes, Golbat will not stop draining energy from its victim even if it gets too heavy to fly.",
  },
  43: {
    pl: "W dzień Oddish kryje twarz w ziemi. Nocą wędruje, rozsiewając nasiona wzdłuż swojej drogi.",
    en: "During the day, Oddish keeps its face buried in the ground. At night, it wanders around sowing its seeds.",
  },
  44: {
    pl: "Płyn sączący się z pyska Glooma nie jest śliną. To nektar, którym Pokémon wabi swoją zdobycz.",
    en: "The fluid that oozes from Gloom's mouth isn't drool. It is a nectar that is used to attract prey.",
  },
  45: {
    pl: "Im większe płatki Vileplume, tym więcej toksycznego pyłku zawierają. Wielka głowa jest ciężka i trudno ją utrzymać.",
    en: "The larger its petals, the more toxic pollen Vileplume contains. Its big head is heavy and hard to hold up.",
  },
  46: {
    pl: "Paras kopie, by wysysać korzenie drzew. Grzyby na jego grzbiecie rosną, czerpiąc składniki odżywcze z owadziego żywiciela.",
    en: "Paras burrows to suck tree roots. The mushrooms on its back grow by drawing nutrients from the bug host.",
  },
  47: {
    pl: "Parasect to para żywiciela i pasożyta, w której grzyb przejął kontrolę nad owadem. Preferuje wilgotne miejsca.",
    en: "Parasect is a host-parasite pair in which the parasitic mushroom has taken over the bug host. It prefers damp places.",
  },
  48: {
    pl: "Venonat żyje w cieniu wysokich drzew, gdzie żywi się owadami. Nocą zwabia go światło.",
    en: "Venonat lives in the shadows of tall trees where it eats insects. It is attracted by light at night.",
  },
  49: {
    pl: "Pyłkowate łuski pokrywające skrzydła Venomotha mają różne barwy, które wskazują na rodzaj posiadanej trucizny.",
    en: "The dust-like scales covering Venomoth's wings are color-coded to indicate the kinds of poison it carries.",
  },
  50: {
    pl: "Diglett żyje około metra pod ziemią, gdzie żywi się korzeniami roślin. Czasem pojawia się na powierzchni.",
    en: "Diglett lives about a yard underground where it feeds on plant roots. It sometimes appears aboveground.",
  },
  51: {
    pl: "Dugtrio to trojaczki Diglett. Wywołuje potężne trzęsienia ziemi, kopiąc tunele na ogromnych głębokościach.",
    en: "Dugtrio is a team of Diglett triplets. It triggers huge earthquakes by burrowing deep underground.",
  },
  52: {
    pl: "Meowth uwielbia wszystko, co się świeci, a zwłaszcza okrągłe monety. W nocy przemierza ulice miast w poszukiwaniu porzuconego bilonu.",
    en: "Meowth loves shiny objects, especially round coins. It roams city streets at night in search of lost coins.",
  },
  53: {
    pl: "Choć futro Persiana ma wielu wielbicieli, trudno go trzymać jako pupila ze względu na kapryśną złośliwość.",
    en: "Although its fur has many admirers, Persian is tough to raise as a pet because of its fickle meanness.",
  },
  54: {
    pl: "Psyduck jest wiecznie dręczony przez silne bóle głowy. Kiedy ból staje się ekstremalny, Pokémon zaczyna nieświadomie kontrolować moc psychiczną.",
    en: "Psyduck is constantly tormented by strong headaches. When the pain becomes extreme, it begins to use psychic powers unconsciously.",
  },
  55: {
    pl: "Golducka często widuje się, jak elegancko pływa przy brzegach jezior. Bywa mylony z legendarnym wodnym stworem.",
    en: "Golduck is often seen swimming elegantly by lake shores. It is often mistaken for a legendary water monster.",
  },
  56: {
    pl: "Mankey wpada w gniew w mgnieniu oka. W jednej chwili bywa potulny, by w następnej rzucić się w szał.",
    en: "Mankey is extremely quick to anger. It could be docile one moment, then thrashing away the next instant.",
  },
  57: {
    pl: "Primeape jest zawsze rozwścieczony i niezwykle uparty. Nie przerwie pogoni za zdobyczą, dopóki jej nie dopadnie.",
    en: "Primeape is always furious and tenacious to boot. It will not stop chasing its quarry until it is caught.",
  },
  58: {
    pl: "Growlithe zaciekle strzeże swojego terytorium. Szczeka i gryzie, by przegnać intruzów z zajmowanego obszaru.",
    en: "Very protective of its territory, Growlithe will bark and bite to repel intruders from its space.",
  },
  59: {
    pl: "Arcanine od dawna budzi podziw swoim pięknem. Biega tak zwinnie, jakby unosił się na skrzydłach.",
    en: "Arcanine has been admired since the past for its beauty. It runs agilely as if on wings.",
  },
  60: {
    pl: "Świeżo wykształcone nogi nie pozwalają Poliwagowi biegać. Wydaje się, że woli pływanie od prób stania.",
    en: "Poliwag's newly grown legs prevent it from running. It appears to prefer swimming over trying to stand.",
  },
  61: {
    pl: "Poliwhirl potrafi żyć w wodzie i poza nią. Na lądzie poci się, by utrzymać ciało wilgotnym i śliskim.",
    en: "Poliwhirl is capable of living in or out of water. When out of water, it sweats to keep its body slimy.",
  },
  62: {
    pl: "Poliwrath to wprawny pływak, biegły zarówno w kraulu, jak i w stylu klasycznym. Z łatwością wyprzedza najlepszych ludzkich pływaków.",
    en: "Poliwrath is an adept swimmer at both the front crawl and breaststroke. It easily overtakes the best human swimmers.",
  },
  63: {
    pl: "Dzięki zdolności czytania w myślach Abra wyczuwa nadchodzące niebezpieczeństwo i teleportuje się w bezpieczne miejsce.",
    en: "Using its ability to read minds, Abra will sense impending danger and teleport itself to safety.",
  },
  64: {
    pl: "Kadabra emituje z ciała szczególne fale alfa, które samą bliskością wywołują bóle głowy.",
    en: "Kadabra emits special alpha waves from its body that induce headaches just by being close by.",
  },
  65: {
    pl: "Mózg Alakazama przewyższa superkomputer. Mówi się, że jego iloraz inteligencji sięga 5000.",
    en: "Alakazam's brain can outperform a supercomputer. Its intelligence quotient is said to be 5,000.",
  },
  66: {
    pl: "Machop uwielbia rozbudowywać swoje mięśnie. Trenuje wszelkie style sztuk walki, by stawać się jeszcze silniejszy.",
    en: "Machop loves to build its muscles. It trains in all styles of martial arts to become even stronger.",
  },
  67: {
    pl: "Ciało Machoke'a jest tak potężne, że musi nosić pas oszczędzający siłę, by móc kontrolować swoje ruchy.",
    en: "Machoke's muscular body is so powerful it must wear a power-save belt to regulate its motions.",
  },
  68: {
    pl: "Dzięki potężnym mięśniom Machamp zadaje ciosy tak silne, że potrafi posłać przeciwnika daleko za horyzont.",
    en: "Using its heavy muscles, Machamp throws punches so powerful they can send the victim clear over the horizon.",
  },
  69: {
    pl: "Bellsprout to Pokémon o długiej, łodygowatej szyi. Wypluwa płyn, który rozpuszcza zdobycz, by ją wchłonąć.",
    en: "Bellsprout is a long, stalk-necked Pokémon. It spits a fluid that dissolves prey, melting it for absorption.",
  },
  70: {
    pl: "Weepinbell wypluwa jadowity pył, by unieruchomić wroga, a następnie dobija go strumieniem kwasu.",
    en: "Weepinbell spits out poison powder to immobilize the enemy, then finishes it with a spray of acid.",
  },
  71: {
    pl: "Mówi się, że Victreebel żyje w olbrzymich koloniach w głębi dżungli, lecz nikt, kto tam dotarł, nie powrócił.",
    en: "Victreebel is said to live in huge colonies deep in jungles, although no one has ever returned from there.",
  },
  72: {
    pl: "Tentacool dryfuje w płytkich morzach. Wędkarze, którzy przypadkiem go złowią, często obrywają parzącym kwasem.",
    en: "Tentacool drifts in shallow seas. Anglers who hook it by accident are often punished by its stinging acid.",
  },
  73: {
    pl: "Macki Tentacruela zwykle są krótkie. Na polowaniu wydłuża je, by oplątać i unieruchomić zdobycz.",
    en: "Tentacruel's tentacles are normally kept short. On hunts, they are extended to ensnare and immobilize prey.",
  },
  74: {
    pl: "Geodude'a spotyka się na polach i w górach. Biorąc go za głaz, ludzie często na niego nadeptują lub się o niego potykają.",
    en: "Found in fields and mountains, Geodude is often mistaken for a boulder, so people step or trip on it.",
  },
  75: {
    pl: "Graveler przemieszcza się, tocząc się po zboczach. Pokonuje każdą przeszkodę, nie zwalniając ani nie zmieniając kierunku.",
    en: "Graveler moves by rolling down slopes. It rolls over any obstacle without slowing or changing direction.",
  },
  76: {
    pl: "Skalne ciało Golema jest niezwykle twarde. Z łatwością wytrzymuje wybuchy dynamitu bez najmniejszego uszczerbku.",
    en: "Golem's boulder-like body is extremely hard. It can easily withstand dynamite blasts without damage.",
  },
  77: {
    pl: "Kopyta Ponyty są dziesięciokrotnie twardsze od diamentów. W mgnieniu oka potrafi stratować wszystko na płasko.",
    en: "Ponyta's hooves are ten times harder than diamonds. It can trample anything completely flat in moments.",
  },
  78: {
    pl: "Bardzo rywalizujący Rapidash goni wszystko, co porusza się szybko, w nadziei na wyścig.",
    en: "Very competitive, Rapidash will chase anything that moves fast in the hopes of racing it.",
  },
  79: {
    pl: "Slowpoke jest niewiarygodnie powolny i gapowaty. Z powodu opieszałego umysłu ból odczuwa dopiero po pięciu sekundach.",
    en: "Slowpoke is incredibly slow and dopey. It takes five seconds for it to feel pain due to its slow brain.",
  },
  80: {
    pl: "Mówi się, że Shellder przyczepiony do ogona Slowbro żywi się resztkami pozostawionymi przez żywiciela.",
    en: "The Shellder latched onto Slowbro's tail is said to feed on the host's leftover scraps.",
  },
  81: {
    pl: "Magnemite utrzymuje się w powietrzu dzięki antygrawitacji. Pojawia się znienacka i razi falami elektryczności.",
    en: "Magnemite uses anti-gravity to stay suspended. It appears without warning and uses electric moves like Thunder Wave.",
  },
  82: {
    pl: "Magneton powstaje z kilku połączonych Magnemite. Często pojawia się, gdy na Słońcu wybuchają plamy słoneczne.",
    en: "Magneton is formed by several Magnemite linked together. They frequently appear when sunspots flare up.",
  },
  83: {
    pl: "Łodyga, którą trzyma Farfetch'd, jest jego bronią. Posługuje się nią niczym mieczem, by ciąć najróżniejsze rzeczy.",
    en: "The plant stalk Farfetch'd holds is its weapon. The stalk is used like a sword to cut all sorts of things.",
  },
  84: {
    pl: "Doduo nadrabia kiepskie zdolności lotu szybkim biegiem. Pozostawia za sobą olbrzymie ślady stóp.",
    en: "Doduo is a bird that makes up for its poor flying with fast foot speed. It leaves giant footprints.",
  },
  85: {
    pl: "Dodrio dzięki trzem głowom realizuje złożone plany. Gdy dwie głowy śpią, jedna zawsze czuwa.",
    en: "Dodrio uses its three brains to execute complex plans. While two heads sleep, one remains awake.",
  },
  86: {
    pl: "Wystający róg na głowie Seela jest bardzo twardy. Pokémon używa go do przebijania grubego lodu.",
    en: "The protruding horn on Seel's head is very hard. It is used for bashing through thick ice.",
  },
  87: {
    pl: "Dewgong gromadzi w ciele energię cieplną. Pływa równym tempem nawet w przejmująco zimnych wodach.",
    en: "Dewgong stores thermal energy in its body. It swims at a steady pace even in intensely cold waters.",
  },
  88: {
    pl: "Grimer pojawia się w zanieczyszczonych miejscach. Żyje, wchłaniając skażony muł wypompowywany z fabryk.",
    en: "Grimer appears in filthy areas. It thrives by sucking up the polluted sludge pumped out of factories.",
  },
  89: {
    pl: "Muk pokryty jest cuchnącą, ohydną mazią. Jest tak toksyczny, że nawet jego ślady zawierają truciznę.",
    en: "Muk is thickly covered with a filthy, vile sludge. It is so toxic that even its footprints contain poison.",
  },
  90: {
    pl: "Twarda skorupa Shelldera odbija każdy rodzaj ataku. Pokémon jest bezbronny tylko wtedy, gdy skorupa jest otwarta.",
    en: "Shellder's hard shell repels any kind of attack. It is vulnerable only when its shell is open.",
  },
  91: {
    pl: "Zaatakowany Cloyster wystrzeliwuje rogi szybkimi salwami. Jego wnętrza nikt jeszcze nie widział.",
    en: "When attacked, Cloyster launches its horns in quick volleys. Its innards have never been seen.",
  },
  92: {
    pl: "Gastly składa się niemal całkowicie z gazu. Potrafi osaczyć nawet najsilniejszego przeciwnika, wprowadzając go w stan głębokiego snu.",
    en: "Gastly consists almost entirely of gas. It can surround even the strongest opponents, putting them into a deep sleep.",
  },
  93: {
    pl: "Ze względu na zdolność przenikania przez mury sądzi się, że Haunter pochodzi z innego wymiaru.",
    en: "Because of its ability to slip through walls, Haunter is said to come from another dimension.",
  },
  94: {
    pl: "Gengar lubi ukrywać się w cieniu ludzi i kraść ich ciepło. Gdy poczujesz nagły dreszcz w ciemnym pokoju, to znak, że Gengar stoi tuż za Tobą.",
    en: "Gengar likes to hide in people's shadows and steal their warmth. A sudden chill in a dark room means Gengar is right behind you.",
  },
  95: {
    pl: "W miarę wzrostu kamienne fragmenty ciała Onixa twardnieją, stając się podobne do czarnego diamentu.",
    en: "As it grows, the stone portions of Onix's body harden to become similar to a black diamond.",
  },
  96: {
    pl: "Drowzee usypia wrogów, a następnie pożera ich sny. Czasem choruje, gdy zje zbyt wiele złych snów.",
    en: "Drowzee puts enemies to sleep, then eats their dreams. It occasionally gets sick from eating bad dreams.",
  },
  97: {
    pl: "Gdy Hypno utkwi wzrok w przeciwniku, atakuje mieszanką mocy psychicznych, takich jak hipnoza i zamęt.",
    en: "When Hypno locks eyes with an enemy, it uses a mix of psychic moves such as Hypnosis and Confusion.",
  },
  98: {
    pl: "Szczypce Krabby'ego są nie tylko bronią, lecz i narzędziem do rozrywania pokarmu. Odrastają, gdy zostaną oderwane.",
    en: "Krabby's pincers are not only weapons but tools for breaking apart food. They regrow if torn off.",
  },
  99: {
    pl: "Wielkie szczypce Kinglera mają moc 10 000 koni mechanicznych. Są jednak tak ogromne, że trudno nimi poruszać.",
    en: "Kingler's large pincer has 10,000-horsepower strength. However, being so big, it is unwieldy to move.",
  },
  100: {
    pl: "Voltorba najczęściej spotyka się w elektrowniach. Łatwo pomylić go z Poké Ballem, przez co poraził już wiele osób.",
    en: "Usually found in power plants, Voltorb is easily mistaken for a Poké Ball, and it has zapped many people.",
  },
  101: {
    pl: "Electrode gromadzi energię elektryczną pod bardzo wysokim ciśnieniem. Często wybucha przy najmniejszej prowokacji.",
    en: "Electrode stores electric energy under very high pressure. It often explodes with little or no provocation.",
  },
  102: {
    pl: "Exeggcute bywa mylony z jajami. Zaniepokojone okazy szybko się skupiają i atakują rojem.",
    en: "Often mistaken for eggs, Exeggcute will quickly gather and attack in a swarm when disturbed.",
  },
  103: {
    pl: "Według legendy w rzadkich przypadkach jedna z głów Exeggutora odpada i dalej żyje jako Exeggcute.",
    en: "Legend says that on rare occasions one of Exeggutor's heads drops off and continues on as an Exeggcute.",
  },
  104: {
    pl: "Ponieważ Cubone nigdy nie zdejmuje hełmu z czaszki, nikt nie widział jeszcze prawdziwej twarzy tego Pokémona.",
    en: "Because it never removes its skull helmet, no one has ever seen Cubone's real face.",
  },
  105: {
    pl: "Kość, którą trzyma Marowak, jest jego główną bronią. Rzuca nią zręcznie niczym bumerangiem, by powalać cele.",
    en: "The bone Marowak holds is its key weapon. It throws the bone skillfully like a boomerang to KO targets.",
  },
  106: {
    pl: "Gdy się spieszy, nogi Hitmonlee stopniowo się wydłużają. Biegnie płynnie, stawiając wyjątkowo długie kroki.",
    en: "When in a hurry, Hitmonlee's legs lengthen progressively. It runs smoothly with extra-long, loping strides.",
  },
  107: {
    pl: "Pozornie nic nie robiąc, Hitmonchan wyprowadza ciosy w błyskawicznych salwach, niemożliwych do dostrzeżenia.",
    en: "While apparently doing nothing, Hitmonchan fires punches in lightning-fast volleys impossible to see.",
  },
  108: {
    pl: "Język Lickitunga można wysunąć niczym u kameleona. Po liźnięciu wroga pozostawia mrowiące uczucie.",
    en: "Lickitung's tongue can be extended like a chameleon's. It leaves a tingling sensation when it licks enemies.",
  },
  109: {
    pl: "Ponieważ Koffing magazynuje w ciele kilka rodzajów toksycznych gazów, jest skłonny do wybuchania bez ostrzeżenia.",
    en: "Because it stores several kinds of toxic gases in its body, Koffing is prone to exploding without warning.",
  },
  110: {
    pl: "Tam, gdzie spotykają się dwa rodzaje trujących gazów, dwa Koffing mogą po latach połączyć się w Weezinga.",
    en: "Where two kinds of poison gases meet, two Koffing can fuse into a Weezing over many years.",
  },
  111: {
    pl: "Masywne kości Rhyhorna są tysiąc razy twardsze od ludzkich. Pokémon ten z łatwością odrzuca ciężarówkę.",
    en: "Rhyhorn's massive bones are 1,000 times harder than human bones. It can easily knock a trailer flying.",
  },
  112: {
    pl: "Chroniony pancerną skórą Rhydon potrafi żyć nawet w stopionej lawie o temperaturze 3600 stopni.",
    en: "Protected by an armor-like hide, Rhydon is capable of living in molten lava of 3,600 degrees.",
  },
  113: {
    pl: "Chansey to rzadki i nieuchwytny Pokémon. Mówi się, że przynosi szczęście tym, którym uda się go zdobyć.",
    en: "Chansey is a rare and elusive Pokémon said to bring happiness to those who manage to get it.",
  },
  114: {
    pl: "Całe ciało Tangeli oplecione jest szerokimi pnączami przypominającymi wodorosty. Pnącza falują, gdy Pokémon idzie.",
    en: "Tangela's whole body is swathed with wide vines similar to seaweed. The vines shake as it walks.",
  },
  115: {
    pl: "Młode Kangaskhana rzadko opuszcza ochronną torbę matki, dopóki nie skończy trzech lat.",
    en: "The infant rarely ventures out of its mother's protective pouch until it is three years old.",
  },
  116: {
    pl: "Horsea potrafi strącać latające owady precyzyjnymi strumieniami atramentu wystrzeliwanymi znad powierzchni wody.",
    en: "Horsea is known to shoot down flying bugs with precise blasts of ink from the surface of the water.",
  },
  117: {
    pl: "Seadra potrafi pływać tyłem, energicznie machając skrzydłopodobnymi płetwami piersiowymi i krępym ogonem.",
    en: "Seadra is capable of swimming backwards by rapidly flapping its wing-like pectoral fins and stout tail.",
  },
  118: {
    pl: "Płetwa ogonowa Goldeena faluje niczym elegancka balowa suknia, co zyskało mu przydomek Królowej Wód.",
    en: "Goldeen's tail fin billows like an elegant ballroom dress, giving it the nickname the Water Queen.",
  },
  119: {
    pl: "W jesiennym okresie tarła Seakingi widać, jak energicznie płyną w górę rzek i strumieni.",
    en: "In the autumn spawning season, Seaking can be seen swimming powerfully up rivers and creeks.",
  },
  120: {
    pl: "Staryu to zagadkowy Pokémon, który bez trudu odtwarza każdą kończynę utraconą w walce.",
    en: "Staryu is an enigmatic Pokémon that can effortlessly regenerate any appendage it loses in battle.",
  },
  121: {
    pl: "Centralny rdzeń Starmie lśni siedmioma barwami tęczy. Niektórzy cenią ten rdzeń niczym klejnot.",
    en: "Starmie's central core glows with the seven colors of the rainbow. Some people value the core as a gem.",
  },
  122: {
    pl: "Gdy ktoś przerwie Mr. Mime'owi pokaz pantomimy, Pokémon spoliczkuje natręta swoimi szerokimi dłońmi.",
    en: "If interrupted while it is miming, Mr. Mime will slap the offender around with its broad hands.",
  },
  123: {
    pl: "Dzięki niczym u ninja zwinności i prędkości Scyther potrafi stworzyć złudzenie, że jest go więcej niż jeden.",
    en: "With ninja-like agility and speed, Scyther can create the illusion that there is more than one of it.",
  },
  124: {
    pl: "Jynx kołysze biodrami, gdy idzie. Potrafi sprawić, że ludzie zaczynają tańczyć w rytm jej ruchów.",
    en: "Jynx sways its hips as it walks. It can cause people to dance in unison with it.",
  },
  125: {
    pl: "Electabuzza zwykle spotyka się przy elektrowniach. Gdy nadchodzi burza, gromadzi się i staje na baczność.",
    en: "Normally found near power plants, Electabuzz congregates and stands at attention when a storm arrives.",
  },
  126: {
    pl: "Ciało Magmara zawsze płonie pomarańczowym blaskiem. Żyje w kraterach czynnych wulkanów.",
    en: "Magmar's body always burns with an orange glow. It lives in the craters of active volcanoes.",
  },
  127: {
    pl: "Jeśli Pinsirowi nie uda się zmiażdżyć ofiary w szczypcach, rozhuśta ją i mocno odrzuca.",
    en: "If it fails to crush the victim in its pincers, Pinsir will swing it around and toss it hard.",
  },
  128: {
    pl: "Gdy Tauros obierze sobie cel, szarżuje z furią, smagając własne ciało długimi ogonami.",
    en: "When it targets an enemy, Tauros charges furiously while whipping its body with its long tails.",
  },
  129: {
    pl: "W zamierzchłej przeszłości Magikarp był nieco silniejszy niż żałośnie słabe okazy, które istnieją dzisiaj.",
    en: "In the distant past, Magikarp was somewhat stronger than the horribly weak descendants that exist today.",
  },
  130: {
    pl: "Gyaradosa rzadko widuje się na wolności. Ogromny i okrutny, w szale potrafi zrównać z ziemią całe miasta.",
    en: "Rarely seen in the wild, Gyarados is huge and vicious, and is capable of destroying entire cities in a rage.",
  },
  131: {
    pl: "Lapras został niemal wytępiony przez nadmierne polowania. Potrafi przewozić ludzi przez wodę na grzbiecie.",
    en: "Lapras has been overhunted almost to extinction. It can ferry people across the water on its back.",
  },
  132: {
    pl: "Ditto potrafi skopiować kod genetyczny przeciwnika i w mgnieniu oka przeobrazić się w jego dokładną kopię.",
    en: "Ditto can copy an enemy's genetic code to instantly transform itself into a duplicate of that enemy.",
  },
  133: {
    pl: "Eevee posiada bardzo niestabilny kod genetyczny, co pozwala mu na ewolucję w wiele różnych form w zależności od otoczenia i kamieni ewolucyjnych.",
    en: "Eevee has an extremely unstable genetic makeup, which allows it to evolve into many different forms depending on its surroundings and stones.",
  },
  134: {
    pl: "Vaporeon żyje blisko wody. Jego długi ogon zakończony jest płetwą, którą często bierze się za ogon syreny.",
    en: "Vaporeon lives close to water. Its long tail is ridged with a fin that is often mistaken for a mermaid's.",
  },
  135: {
    pl: "Jolteon gromadzi w atmosferze jony ujemne, by wystrzeliwać błyskawice o napięciu 10 000 woltów.",
    en: "Jolteon accumulates negative ions in the atmosphere to blast out 10,000-volt lightning bolts.",
  },
  136: {
    pl: "Gdy Flareon magazynuje w ciele energię cieplną, jego temperatura może przekroczyć 1600 stopni.",
    en: "When storing thermal energy in its body, Flareon's temperature can soar to over 1,600 degrees.",
  },
  137: {
    pl: "Porygon to Pokémon złożony wyłącznie z kodu programu. Potrafi swobodnie poruszać się w cyberprzestrzeni.",
    en: "Porygon is a Pokémon that consists entirely of programming code. It can move freely in cyberspace.",
  },
  138: {
    pl: "Choć Omanyte wymarł dawno temu, w rzadkich przypadkach można go genetycznie wskrzesić ze skamielin.",
    en: "Although long extinct, Omanyte can in rare cases be genetically resurrected from fossils.",
  },
  139: {
    pl: "Omastar to prehistoryczny Pokémon, który wyginął, gdy ciężka skorupa uniemożliwiła mu chwytanie zdobyczy.",
    en: "Omastar is a prehistoric Pokémon that died out when its heavy shell made it impossible to catch prey.",
  },
  140: {
    pl: "Kabuto został wskrzeszony ze skamieliny znalezionej tam, gdzie eony temu znajdowało się dno oceanu.",
    en: "Kabuto was resurrected from a fossil found in what was once the ocean floor eons ago.",
  },
  141: {
    pl: "Smukła sylwetka Kabutopsa jest idealna do pływania. Tnie zdobycz pazurami i wysysa płyny z jej ciała.",
    en: "Kabutops' sleek shape is perfect for swimming. It slashes prey with its claws and drains the body fluids.",
  },
  142: {
    pl: "Aerodactyl to drapieżny, prehistoryczny Pokémon, który celuje w gardło wroga piłokształtnymi, ząbkowanymi kłami.",
    en: "Aerodactyl is a ferocious, prehistoric Pokémon that goes for the enemy's throat with its serrated, saw-like fangs.",
  },
  143: {
    pl: "Snorlax jest niezwykle łagodnym Pokémonem, którego dzień składa się wyłącznie z jedzenia i spania. Potrafi zjeść 400 kg pożywienia na raz.",
    en: "Snorlax is an extremely peaceful Pokémon whose day consists entirely of eating and sleeping. It can eat up to 400 kg of food at once.",
  },
  144: {
    pl: "Articuno to legendarny ptasi Pokémon, który podobno ukazuje się skazanym na zgubę ludziom zagubionym w lodowych górach.",
    en: "Articuno is a legendary bird Pokémon said to appear to doomed people who are lost in icy mountains.",
  },
  145: {
    pl: "Zapdos to legendarny ptasi Pokémon, który podobno wyłania się z chmur, ciskając ogromnymi błyskawicami.",
    en: "Zapdos is a legendary bird Pokémon said to appear from clouds while dropping enormous lightning bolts.",
  },
  146: {
    pl: "Moltres znany jest jako legendarny ptak ognia. Każde uderzenie jego skrzydeł rozsiewa olśniewający rozbłysk płomieni.",
    en: "Moltres is known as the legendary bird of fire. Every flap of its wings creates a dazzling flash of flames.",
  },
  147: {
    pl: "Dratiniego długo uważano za mitycznego Pokémona, aż do niedawnego odkrycia niewielkiej kolonii żyjącej pod wodą.",
    en: "Dratini was long considered a mythical Pokémon until a small colony was found living underwater.",
  },
  148: {
    pl: "Dragonair to mistyczny Pokémon roztaczający łagodną aurę. Posiada zdolność zmieniania warunków pogodowych.",
    en: "Dragonair is a mystical Pokémon that exudes a gentle aura. It has the ability to change the weather.",
  },
  149: {
    pl: "Dragonite to niezwykle rzadko spotykany morski Pokémon. Mówi się, że jego inteligencja dorównuje ludzkiej.",
    en: "Dragonite is an extremely rarely seen marine Pokémon. Its intelligence is said to match that of humans.",
  },
  150: {
    pl: "Mewtwo został stworzony w tajnym laboratorium z DNA Mew. Uważa się go za jednego z najbardziej bezwzględnych i potężnych Pokémonów na świecie.",
    en: "Mewtwo was created in a secret laboratory from Mew's DNA. It is considered one of the most ruthless and powerful Pokémon in the world.",
  },
  151: {
    pl: "Mew jest tak rzadki, że wielu ekspertów wciąż uważa go za miraż. Na całym świecie widziało go zaledwie kilka osób.",
    en: "Mew is so rare that many experts still consider it a mirage. Only a few people worldwide have ever seen it.",
  },
};
