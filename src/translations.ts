// i18n dictionary for POKÉ: THE FLOOR.
// English is the SOURCE design language (written first in every pair).
// Polish (and any future language) is a translation layer; a missing
// translation falls back to the English source.

export type Language = "en" | "pl";
export const SOURCE_LANGUAGE: Language = "en";

type Phrase = { en: string; pl?: string };

// --- Simple phrases (EN source first, PL translation second) ---
const dict = {
  // Header & Navigation
  logiBtn: { en: "LOGS", pl: "LOGI" },
  grajTab: { en: "Play", pl: "Graj" },
  pokedexTab: { en: "Pokédex", pl: "Pokédex" },
  pomocTab: { en: "Help", pl: "Pomoc" },
  navPlay: { en: "Play", pl: "Graj" },
  navMap: { en: "Play", pl: "Graj" },
  navPokedex: { en: "Pokédex", pl: "Pokédex" },
  navHelp: { en: "Help", pl: "Pomoc" },
  // Header tooltips
  tipBackToMenu: { en: "Back to the board", pl: "Powrót do planszy" },
  tipSwitchLang: { en: "Switch language", pl: "Zmień język" },
  tipBattleHistory: { en: "Battle history", pl: "Historia walk" },
  tipResetGame: { en: "Reset game", pl: "Resetuj grę" },
  // Homescreen
  startBtn: { en: "START ADVENTURE", pl: "ROZPOCZNIJ PRZYGODĘ" },
  rulesTitle: { en: "GAMEPLAY RULES:", pl: "ZASADY ROZGRYWKI:" },
  subTitle: { en: "Can you claim every tile and name all 151 Pokémon of Kanto?", pl: "Czy zajmiesz każde pole i rozpoznasz wszystkie 151 Pokémonów Kanto?" },
  rule1: { en: "You start on the tile in the bottom-left corner of the board.", pl: "Zaczynasz na polu w lewym dolnym rogu planszy." },
  rule2: { en: "Select an adjacent territory to launch an attack.", pl: "Wybierasz przylegające terytorium do ataku." },
  rule3: { en: "Battle live against a 45-second countdown timer.", pl: "Walczycie na żywo z czasem 45 sekund." },
  rule4: { en: "Typing the correct name pauses the clock.", pl: "Wpisanie poprawnej nazwy wstrzymuje zegar." },
  rule5: { en: "The PASS button inflicts a 5-second penalty.", pl: "Przycisk PAS odejmuje 5 sekund kary." },
  // Intro screen (design 01)
  introRegionLabel: { en: "KANTO REGION · GEN I", pl: "REGION KANTO · GEN I" },
  introRange: { en: "1–151", pl: "1–151" },
  introEyebrow: { en: "GAME SHOW · KANTO", pl: "TELETURNIEJ · KANTO" },
  introTitleSecondary: { en: "POKÉMON EDITION", pl: "POKÉMON EDITION" },
  introCardsTitle: { en: "JUST REMEMBER THIS", pl: "ZAPAMIĘTAJ TYLKO TO" },
  introCardsCount: { en: "3/3", pl: "3/3" },
  introCardTimerValue: { en: "45", pl: "45" },
  introCardTimerUnit: { en: "SEC", pl: "SEK" },
  introCardTimerLabel: { en: "PER ROUND", pl: "NA RUNDĘ" },
  introCardTimerDesc: { en: "Beat the clock.", pl: "Zdąż na czas." },
  introCardLangValue: { en: "EN", pl: "EN" },
  introCardLangUnit: { en: "ENG", pl: "ANG" },
  introCardLangLabel: { en: "IN ENGLISH", pl: "PO ANGIELSKU" },
  introCardLangDesc: { en: "Like \"Ponyta\".", pl: "Np. „Ponyta\"." },
  introCardPenaltyValue: { en: "-5", pl: "-5" },
  introCardPenaltyUnit: { en: "PASS", pl: "PAS" },
  introCardPenaltyLabel: { en: "PENALTY", pl: "KARA" },
  introCardPenaltyDesc: { en: "Skipping costs time.", pl: "Pas kosztuje czas." },
  introFullRulesLink: { en: "Full rules list", pl: "Pełna lista zasad" },
  introHelpInline: { en: "HELP", pl: "POMOC" },
  introHelpBtnSecondary: { en: "HELP & RULES", pl: "POMOC I ZASADY" },
  nameEntryRegister: { en: "TRAINER REGISTRATION", pl: "REJESTRACJA TRENERA" },
  nameEntryTitle: { en: "What's your name?", pl: "Jak cię zwać?" },
  nameEntrySub: { en: "It shows on your player tile and on the duel screen.", pl: "Nazwa pojawi się na Twoim kafelku gracza i na ekranie pojedynku." },
  nameEntryPlaceholder: { en: "e.g. ASH", pl: "np. ASH" },
  nameEntryPreviewFallback: { en: "ASH", pl: "ASH" },
  nameEntryPickPartner: { en: "Choose your partner", pl: "Wybierz partnera" },
  nameEntryHelper: { en: "Max 12 characters · you can change it later", pl: "Maks. 12 znaków · nazwę zmienisz później" },
  nameEntryLimitReached: { en: "Character limit reached", pl: "Osiągnięto limit znaków" },
  nameEntryErrorEmpty: { en: "↑ Enter a name to set off", pl: "↑ Wpisz nazwę, żeby ruszyć w drogę" },
  nameEntryConfirm: { en: "Enter the board", pl: "Wejdź na planszę" },
  typeElectric: { en: "ELECTRIC", pl: "ELEKTRYCZNY" },
  // Board banner (design 02)
  boardConquestTitle: { en: "KANTO CONQUEST", pl: "PODBÓJ KANTO" },
  boardRoundLabel: { en: "R.", pl: "R." },
  boardOwnFieldsCounterLabel: { en: "YOUR FIELDS", pl: "TWOICH PÓL" },
  boardTargetsLabel: { en: "TARGETS", pl: "CELÓW" },
  boardLegendMy: { en: "MINE", pl: "MOJE" },
  boardLegendAvailable: { en: "OPEN", pl: "DOSTĘPNE" },
  boardLegendLocked: { en: "LOCKED", pl: "ZABLOKOWANE" },
  // VS challenge (design 06)
  vsHeaderMetaLeft: { en: "DUEL · FIELD", pl: "POJEDYNEK · POLE" },
  vsHeaderMetaSub: { en: "TERRITORY CONTROL", pl: "OPANOWANIE OBSZARU" },
  vsPlayerLabel: { en: "YOU", pl: "TY" },
  vsVsLabel: { en: "VS", pl: "VS" },
  vsRivalStatsTitle: { en: "RIVAL STATS", pl: "STATY RYWALA" },
  vsPoolLabel: { en: "POKÉMON", pl: "POKÉMONÓW" },
  vsLevelLabel: { en: "LEVEL", pl: "POZIOM" },
  vsPreferredTypesLabel: { en: "PREFERRED TYPES", pl: "PREFEROWANE TYPY" },
  vsNotice: { en: "Winning seizes your rival's field. Every correctly named Pokémon lands in your Pokédex.", pl: "Wygrana przejmuje pole rywala. Każdy poprawnie nazwany Pokémon trafi do twojego Pokédexu." },
  // Duel (designs 07 / 07a / 07c)
  duelYourTurnPill: { en: "YOUR TURN", pl: "TWOJA TURA" },
  duelHurryPill: { en: "HURRY UP", pl: "POŚPIESZ SIĘ" },
  duelPasFlashPill: { en: "PASS", pl: "PAS" },
  duelRecognizeTitle: { en: "IDENTIFY THE POKÉMON", pl: "ROZPOZNAJ POKÉMONA" },
  duelRecognizeHintPrefix: { en: "Type or say the Pokémon's English name, e.g.", pl: "Wpisz lub wymów nazwę Pokémona po angielsku, np." },
  // Pokémon detail card (design 09)
  cardTopBackToList: { en: "POKÉDEX", pl: "POKÉDEX" },
  cardBackToPokedex: { en: "BACK TO POKÉDEX", pl: "POWRÓT DO POKÉDEXU" },
  cardEntryLabel: { en: "ENTRY", pl: "WPIS" },
  cardCategoryPlaceholder: { en: "KANTO POKÉMON", pl: "POKÉMON KANTO" },
  cardHeight: { en: "HEIGHT", pl: "WZROST" },
  cardWeight: { en: "WEIGHT", pl: "WAGA" },
  cardGen: { en: "GEN", pl: "GEN" },
  cardGenI: { en: "I", pl: "I" },
  // Help (design 05)
  helpCardTitle: { en: "HOW TO PLAY?", pl: "JAK GRAĆ?" },
  helpCardSubtitle: { en: "3 quick chapters", pl: "3 krótkie rozdziały" },
  helpAboutPill: { en: "ABOUT", pl: "O GRZE" },
  helpAboutBody: { en: "A trivia showdown inspired by the TV game show The Floor — fought tile by tile across Kanto, Pokémon #001–151.", pl: "Quizowy pojedynek w stylu teleturnieju The Floor — toczony pole po polu w regionie Kanto, Pokémony #001–151." },
  helpChapter1Chip: { en: "ENG", pl: "ENG" },
  helpChapter1Title: { en: "OFFICIAL NAMING", pl: "OFICJALNE NAZEWNICTWO" },
  helpChapter1Demo: { en: "Fire Dragon → Charizard", pl: "Ognisty Smok → Charizard" },
  helpChapter2Chip: { en: "SPEECH-TO-TEXT", pl: "SPEECH-TO-TEXT" },
  helpChapter2Title: { en: "SPEECH RECOGNITION", pl: "ROZPOZNAWANIE MOWY" },
  helpChapter2DemoLabel: { en: "LISTENING...", pl: "SŁUCHAM..." },
  helpChapter2DemoText: { en: "♪ ♪  pi-ka-chu", pl: "♪ ♪  pi-ka-chu" },
  helpChapter3Chip: { en: "LIMIT", pl: "LIMIT" },
  helpChapter3Title: { en: "ROUND TIME LIMIT", pl: "LIMIT RUNDY" },
  // Time-Up screen (design 08)
  loseKoBadge: { en: "K.O.", pl: "K.O." },
  loseReportTitle: { en: "DUEL REPORT", pl: "RAPORT POJEDYNKU" },
  loseReportVs: { en: "VS", pl: "VS" },
  loseStatHit: { en: "HITS", pl: "TRAFIONE" },
  loseStatPass: { en: "PASSES", pl: "PASY" },
  loseStatAccuracy: { en: "ACCURACY", pl: "CELNOŚĆ" },
  loseStuckOnLabel: { en: "Stuck on", pl: "Utknąłeś na" },
  loseCoachTipPill: { en: "● TRAINER TIP", pl: "● PORADA TRENERA" },
  loseBackBtn: { en: "TRY AGAIN", pl: "SPRÓBUJ JESZCZE RAZ" },
  loseRetryBtn: { en: "BACK TO BOARD", pl: "WRÓĆ NA PLANSZĘ" },
  loseResetLink: { en: "Reset the whole game", pl: "Zresetuj całą rozgrywkę" },
  loseResetLinkParen: { en: "progress lost", pl: "utrata postępu" },
  // Victory screen (design 10)
  winFieldBadge: { en: "+ FIELD", pl: "+ POLE" },
  winTitleBig: { en: "VICTORY!", pl: "ZWYCIĘSTWO!" },
  winFieldNumber: { en: "field", pl: "pole" },
  winFieldDesc: { en: "You defeated {opponent} and seize {field} #{id}. Your territory grows!", pl: "Pokonałeś {opponent} i przejmujesz {field} #{id}. Twoje terytorium rośnie!" },
  winReportTitle: { en: "DUEL REPORT", pl: "RAPORT POJEDYNKU" },
  winStatRemaining: { en: "LEFT", pl: "ZOSTAŁO" },
  winNewInDexTitle: { en: "NEW IN POKÉDEX", pl: "NOWE W POKÉDEXIE" },
  winBackBtn: { en: "BACK TO GAME", pl: "WRÓĆ DO GRY" },
  winSeeDexBtn: { en: "OPEN POKÉDEX", pl: "ZOBACZ POKÉDEX" },
  // Reset confirm (design 08a)
  resetIrreversiblePill: { en: "IRREVERSIBLE", pl: "NIEODWRACALNE" },
  resetTitle2: { en: "RESET THE GAME?", pl: "ZRESETOWAĆ ROZGRYWKĘ?" },
  resetSubDesc: { en: "You will lose every captured field. This action cannot be undone.", pl: "Stracisz wszystkie zdobyte pola. Tej akcji nie da się cofnąć." },
  resetStatusFields: { en: "FIELDS", pl: "POLA" },
  resetStatusPokedex: { en: "POKÉDEX", pl: "POKÉDEX" },
  resetYesAll: { en: "YES, RESET EVERYTHING", pl: "TAK, ZRESETUJ WSZYSTKO" },
  resetCancel: { en: "CANCEL", pl: "ANULUJ" },
  // Battle History (design 03)
  histHeaderTitle: { en: "BATTLE HISTORY", pl: "HISTORIA WALK" },
  histHeaderSub: { en: "KANTO LEAGUE · JOURNAL", pl: "LIGA KANTO · DZIENNIK" },
  histTabGoals: { en: "GOALS", pl: "CELE" },
  histTabDuels: { en: "DUELS", pl: "POJEDYNKI" },
  histGoal1Title: { en: "Begin your journey", pl: "Rozpoczęcie wyprawy" },
  histGoal1Sub: { en: "Bottom-left corner · field #18", pl: "Dolny lewy róg planszy · pole #18" },
  histGoal2Title: { en: "Defeat Kanto players and seize their fields", pl: "Pokonaj graczy Kanto i przejmij ich pola" },
  histGoal2Sub: { en: "Next goal: ", pl: "Następny cel: " },
  histGoal3Title: { en: "Classify all 151 Pokémon", pl: "Sklasyfikuj wszystkie 151 Pokémonów" },
  histGoal3Sub: { en: "Progress: ", pl: "Postęp: " },
  histStatusCompleted: { en: "COMPLETED", pl: "UKOŃCZONO" },
  histStatusInProgress: { en: "IN PROGRESS", pl: "W TRAKCIE" },
  histStatusLocked: { en: "LOCKED", pl: "ZABLOKOWANE" },
  histStatusFinal: { en: "FINAL", pl: "FINAŁ" },
  histPolLabel: { en: "FIELDS", pl: "PÓL" },
  histBottomConquered: { en: "CONQUERED", pl: "PODBITE" },
  histBottomCaught: { en: "CAUGHT", pl: "ZŁAPANE" },
  histBottomTime: { en: "PLAY TIME", pl: "CZAS GRY" },
  histReturnBtn: { en: "BACK TO ADVENTURE", pl: "POWRÓT DO PRZYGODY" },
  histEmptyDuels: { en: "No duels logged yet. Challenge a rival to start the chronicle.", pl: "Brak zapisanych pojedynków. Wyzwij rywala by zacząć kronikę." },
  // Pokédex empty state (design 04a)
  dexEmptyTitle: { en: "POKÉDEX IS EMPTY", pl: "POKÉDEX JEST PUSTY" },
  dexEmptyBody: { en: "Every correctly named Pokémon lands here. Play your first duel to start the collection.", pl: "Każdy poprawnie nazwany Pokémon trafia tutaj. Zagraj pierwszy pojedynek, by zacząć kolekcję." },
  dexEmptyCta: { en: "PLAY YOUR FIRST DUEL", pl: "ZAGRAJ PIERWSZY POJEDYNEK" },
  dexEmptyHint: { en: "TIP · NAMES IN ENGLISH", pl: "WSKAZÓWKA · NAZWY PO ANGIELSKU" },
  // Tutorial overlay (design 11)
  tutFirstTimePill: { en: "FIRST TIME? LET'S WALK.", pl: "PIERWSZY RAZ? PROWADŹMY." },
  tutStep1Title: { en: "YOUR PROGRESS", pl: "TWÓJ POSTĘP" },
  tutStep1Body: { en: "Here you'll see how many of 25 fields are already yours.", pl: "Tu zobaczysz, ile pól z 25 już należy do Ciebie." },
  tutStep2Title: { en: "ATTACK A NEIGHBOR", pl: "ATAKUJ SĄSIADA" },
  tutStep2Body: { en: "Fields with a pulsing red badge can be challenged to a duel.", pl: "Pola z pulsującą czerwoną odznaką możesz wyzwać na pojedynek." },
  tutStep3Title: { en: "POKÉDEX & HELP", pl: "POKÉDEX I POMOC" },
  tutStep3Body: { en: "Reach them from the bottom bar once you close this tutorial.", pl: "Wrócisz do nich z dolnego paska, gdy zamkniesz tutorial." },
  tutStartBtn: { en: "BEGIN", pl: "ZACZNIJ" },
  // Board View (Graj) & Map Tiles
  boardTitle: { en: "KANTO REGION CONQUEST", pl: "PODBÓJ REGIONU KANTO" },
  boardSubTitle: { en: "Select an adjacent territory to attack!", pl: "Wybierz sąsiednie terytorium do ataku!" },
  boardBannerTitle: { en: "KANTO REGION CONQUEST", pl: "PODBÓJ REGIONU KANTO" },
  boardBannerSub: { en: "Select an adjacent territory to attack!", pl: "Wybierz sąsiednie terytorium do ataku!" },
  statsBoard: { en: "BOARD:", pl: "PLANSZA:" },
  statsRegions: { en: "25 regions", pl: "25 regionów" },
  statsOwnFields: { en: "YOUR FIELDS:", pl: "TWOJE POLA:" },
  playerTileLabel: { en: "YOU", pl: "TY" },
  legendMy: { en: "MY", pl: "MOJE" },
  legendOpponent: { en: "RIVAL", pl: "RYWAL" },
  legendLocked: { en: "LOCKED", pl: "ZABLOKOWANE" },
  legendAvailable: { en: "Available", pl: "Dostępne" },
  // Bot model
  botLabel: { en: "Player", pl: "Gracz" },
  botTooltipRegion: { en: "Region", pl: "Region" },
  botTooltipLeader: { en: "Leader", pl: "Lider" },
  botTooltipYourTerritory: { en: "Your territory", pl: "Twoje terytorium" },
  botPoolSizeLabel: { en: "POKÉMON IN POOL", pl: "POKÉMONÓW W PULI" },
  // Trivia / Duel View
  categoryLabel: { en: "OPPONENT", pl: "PRZECIWNIK" },
  inputPlaceholder: { en: "Who's that Pokémon?", pl: "Kim jest ten Pokémon?" },
  passBtn: { en: "PASS", pl: "PASUJ" },
  passPenalty: { en: "-5 SEC", pl: "-5 SEK" },
  speakBtn: { en: "TALK", pl: "MÓW" },
  sendBtn: { en: "SUBMIT", pl: "WYŚLIJ" },
  opponentThinking: { en: "Opponent is answering...", pl: "Przeciwnik odpowiada..." },
  yourTimeLabel: { en: "YOUR TIME", pl: "TWÓJ CZAS" },
  opponentTimeLabel: { en: "OPPONENT", pl: "PRZECIWNIK" },
  // Game Over Screen
  gameOverTitle: { en: "TIME'S UP!", pl: "TWÓJ CZAS MINĄŁ!" },
  gameOverSub: { en: "Your territory was conquered", pl: "Twoje terytorium zostało przejęte" },
  gameOverDesc: { en: "Your Pokémon succumbed to time pressure. The challenge issued by the opponent proved too demanding!", pl: "Twoje Pokémony uległy pod presją czasu. Wyzwanie rzucone przez przeciwnika okazało się zbyt wymagające!" },
  gameOverDescVs: { en: "The challenge from {opponent} proved too demanding. Your territories remain, but this field stays open.", pl: "Wyzwanie rzucone przez {opponent} okazało się zbyt wymagające. Twoje terytoria zostają, ale to pole pozostaje wolne." },
  quickTipTitle: { en: "Quick tip:", pl: "Szybka rada:" },
  quickTipDesc: { en: "Remember, names must be entered in English (e.g., squirtle, jigglypuff). Each pass costs a 5-second penalty, so pass wisely!", pl: "Pamiętaj, że nazwy wpisujemy w języku angielskim (np. squirtle, jigglypuff). Każde pominięcie to 5 sekund kary, więc pasuj rozważnie!" },
  tryAgainBtn: { en: "TRY AGAIN", pl: "SPRÓBUJ PONOWNIE" },
  restartGameBtn: { en: "RESTART GAME", pl: "ZACZNIJ OD NOWA" },
  restartBtn: { en: "Play Again", pl: "Zagraj ponownie" },
  returnMapBtn: { en: "BACK TO MAP", pl: "WRÓĆ NA MAPĘ" },
  returnToMapBtn: { en: "BACK TO MAP", pl: "WRÓĆ NA MAPĘ" },
  // Pokédex View
  pokedexProgress: { en: "YOUR PROGRESS", pl: "TWÓJ POSTĘP" },
  pokedexDiscovered: { en: "DISCOVERED", pl: "ODKRYTE" },
  pokedexUnknown: { en: "UNKNOWN", pl: "NIEZNANE" },
  statusSeen: { en: "SEEN", pl: "WIDZIANY" },
  statusCaught: { en: "CAUGHT", pl: "ZŁAPANY" },
  metricSeen: { en: "SEEN", pl: "WIDZIANE" },
  metricCaught: { en: "CAUGHT", pl: "ZŁAPANE" },
  searchPlaceholder: { en: "Search by name or ID number...", pl: "Wyszukaj po nazwie lub numerze ID..." },
  filterAll: { en: "ALL", pl: "WSZYSTKIE" },
  backToPokedexBtn: { en: "BACK TO POKÉDEX", pl: "POWRÓT DO POKÉDEXU" },
  lockedAlt: { en: "Locked", pl: "Zablokowany" },

  // Supplemental premium keys for full bilingual status
  historyTitle: { en: "KANTO BATTLE HISTORY", pl: "HISTORIA WALK KANTO" },
  logHeader: { en: "KANTO LEAGUE BATTLE HISTORY", pl: "HISTORIA WALK LIGI KANTO" },
  logReturnBtn: { en: "RETURN TO ADVENTURE", pl: "POWRÓT DO PRZYGODY" },
  emptyLogs: { en: "No logged events", pl: "Brak zapisanych wydarzeń" },
  backToAdventure: { en: "Back to Adventure", pl: "Powrót do przygody" },
  resetTitle: { en: "RESET GAME?", pl: "ZRESETOWAĆ GRĘ?" },
  resetDesc: { en: "Are you sure you want to reset the entire board? You will lose Ash's captured territories, but your unlocked Pokédex will remain intact!", pl: "Czy na pewno chcesz zresetować całą planszę? Stracisz zajęte przez Asha terytoria, ale Twój odblokowany Pokédex zostanie nienaruszony!" },
  resetConfirmBtn: { en: "Yes, reset the board", pl: "Tak, zresetuj planszę" },
  cancelBtn: { en: "Cancel", pl: "Anuluj" },
  winTitle: { en: "EXCELLENT DUEL!", pl: "WYŚMIENITY POJEDYNEK!" },
  winDesc: { en: "You successfully defeated opponent", pl: "Pomyślnie pokonałeś przeciwnika" },
  winLandBadge: { en: "+ LAND", pl: "+ POLE" },
  statsTitle: { en: "STATS SUMMARY:", pl: "PODSUMOWANIE STATYSTYK:" },
  statsPokemons: { en: "Pokémon:", pl: "Pokémony:" },
  statsCorrect: { en: "Correct", pl: "Prawidłowo" },
  statsPassed: { en: "Passed:", pl: "Pominięcia:" },
  statsPassedTimes: { en: "times", pl: "razy" },
  statsRemainingTime: { en: "Time Remaining:", pl: "Pozostały Czas:" },
  statsBotConquered: { en: "Defeated Player:", pl: "Pokonany Gracz:" },
  returnToBoardBtn: { en: "BACK TO BOARD (SAFELY)", pl: "WRÓĆ NA PLANSZĘ (BEZPIECZNIE)" },
  nextStepWarning: { en: "* Upon returning to the board, other players can launch attacks!", pl: "* Po powrocie na planszę, inni gracze mogą zaatakować Twoje terytoria!" },
  fullConquestLabel: { en: "FULL KANTO CONQUEST!", pl: "PEŁNY PODBÓJ KANTO!" },
  championTitle: { en: "FULL KANTO CONQUEST!", pl: "PEŁNY PODBÓJ KANTO!" },
  championSub: { en: "YOU BECOME THE FLOOR LEAGUE CHAMPION!", pl: "ZOSTAŁEŚ MISTRZEM LIGI THE FLOOR!" },
  championDesc: { en: "You defeated all opponents and controlled all 25 territories! You are a true Pokémon Master!", pl: "Zwyciężyłeś wszystkich przeciwników i opanowałeś wszystkie 25 terytoriów! Jesteś prawdziwym Pokémon Master!" },
  allRegions: { en: "All regions:", pl: "Wszystkie regiony:" },
  regionsConquered: { en: "25 / 25 CONQUERED", pl: "25 / 25 OPANOWANE" },
  pokedexCollection: { en: "Pokédex Collection:", pl: "Kolekcja Pokédex:" },
  conquestResetBtn: { en: "START NEXT CONQUEST", pl: "ZACZNIJ KOLEJNY PODBÓJ" },
  guideTip1: { en: "Answer with the official English name — the one on the cards, in the games and in the anime. Descriptions and made-up names don't count.", pl: "Odpowiadaj oficjalną angielską nazwą — tą z kart, gier i anime. Opisy i wymyślone nazwy się nie liczą." },
  guideTip2: { en: "Tap the mic and just say the name. Accents are fine, and case, spaces and punctuation never matter — \"Mr. Mime\" and \"farfetchd\" both land.", pl: "Dotknij mikrofonu i po prostu wymów nazwę. Rozumiemy też polską wymowę — „Pikaczu\" zamiast Pikachu czy „Czarizard\" zamiast Charizard również zaliczymy." },
  guideTip3: { en: "Your clock ticks while it's your turn. Name the Pokémon and both the clock and the turn pass to your rival. Miss, and you keep burning time.", pl: "Twój zegar tyka, gdy trwa Twoja tura. Trafisz nazwę — zegar i tura przechodzą na rywala. Spudłujesz — dalej tracisz czas." },
  guideOk: { en: "Got it — let's play!", pl: "Jasne, gramy!" },
  easy: { en: "Easy", pl: "Łatwy" },
  medium: { en: "Medium", pl: "Średni" },
  hard: { en: "Hard", pl: "Trudny" },
  difficultyLabel: { en: "Difficulty:", pl: "Poziom:" },
  challengeTitle: { en: "TERRITORY CONQUEST", pl: "OPANOWANIE OBSZARU" },
  challengeOpponent: { en: "Opponent on this tile:", pl: "Przeciwnik na tym polu:" },
  areaControl: { en: "Territory Conquest", pl: "Opanowanie obszaru" },
  fieldOpponent: { en: "Opponent in this field:", pl: "Przeciwnik w tym polu:" },
  challengeCategory: { en: "Opponent's pool:", pl: "Pula przeciwnika:" },
  challengeType: { en: "Pool:", pl: "Pula:" },
  challengeFightBtn: { en: "CHALLENGE TO DUEL!", pl: "WYZWIJ NA POJEDYNEK!" },
  challengeCancelBtn: { en: "Back to Board (Cancel)", pl: "Wróć na planszę (Anuluj)" },
  pokedexTitle: { en: "KANTO POKÉDEX", pl: "POKÉDEX KANTO" },
  pokedexClose: { en: "Close", pl: "Zamknij" },
  caught: { en: "Caught", pl: "Złapany" },
  identified: { en: "Identified", pl: "Zidentyfikowany" },
  pokedexSearchNone: { en: "No Pokémon found matching the search criteria.", pl: "Brak Pokémonów spełniających kryteria wyszukiwania." },
  pokedexDatabaseTitle: { en: "Kanto database description:", pl: "Opis z bazy danych Kanto:" },
  pokedexPokemonCategory: { en: "First Generation (Kanto)", pl: "Pierwsza Generacja (Kanto)" },
  speechNotAvailable: { en: "Speech recognition not available in this browser.", pl: "Głos niedostępny w tej przeglądarce." },
  speechNotHeard: { en: "Not understood. Try speaking louder.", pl: "Nie zrozumiano. Spróbuj mówić głośniej." },
  speechHeard: { en: "Heard", pl: "Usłyszano" },
  speechCorrect: { en: "Correct if wrong.", pl: "Popraw jeśli źle." },
  speechWrong: { en: "Invalid name. Try again or click 'Pass'!", pl: "Niewłaściwa nazwa. Spróbuj ponownie lub kliknij 'Pasuj'!" },
  speechPrompt: { en: "Type the English name, e.g.", pl: "Wpisz angielską nazwę, np." },
  speechListening: { en: "LISTENING…", pl: "SŁUCHAM…" },
  speechStillListening: { en: "Listening… say the Pokémon name", pl: "Słucham… powiedz nazwę Pokémona" },
  voiceReport: { en: "Identify the Pokémon", pl: "Rozpoznaj Pokémona" },
  thinkingReport: { en: "Opponent thinking...", pl: "Przeciwnik Myśli..." },
  opponentTurnReport: { en: "Opponent's clock is ticking...", pl: "Zegar przeciwnika odlicza cenny czas..." },
  restTimeReport: { en: "Your moment of rest", pl: "Twoja chwila wytchnienia" },
  defenseModeTitle: { en: "QUICK DEFENSIVE DUEL!", pl: "SZYBKI POJEDYNEK OBRONNY!" },
  defenseModeSubtitle: { en: "attacks your territory!", pl: "atakuje Twoje terytorium!" },
  defenseDesc1: { en: "The opponent will seize this tile", pl: "Przeciwnik przejmie to pole" },
  defenseDesc2: { en: "if your time runs out. Defend your territory!", pl: "jeśli Twój czas się skończy. Broń terytorium!" },
  defenseBtn: { en: "DEFEND YOUR REGION", pl: "BRÓŃ SWOJEGO REGIONU" },
  quickSpurt: { en: "QUICK!", pl: "SZYBKO!" },
  passNotification: { en: "PASS!", pl: "PAS!" },

  // Log Templates ({name}, {cellId}, {attacker}, {defender}, {winner})
  logInit1: { en: "Start your journey from the bottom-left corner of the board!", pl: "Rozpocznij wyprawę z lewego dolnego rogu planszy!" },
  logInit2: { en: "Defeat the other Kanto players and conquer their territories!", pl: "Pokonaj pozostałych graczy Kanto i przejmij ich terytoria!" },
  logReset1: { en: "New game started! Ready to conquer Kanto.", pl: "Nowa gra rozpoczęta! Czas na podbój Kanto." },
  logReset2: { en: "Charge into battle to seize the entire board!", pl: "Ruszaj do boju, aby zdobyć całą planszę!" },
  logVictory: { en: "Victory! You conquered the territory belonging to {name}!", pl: "Zwycięstwo! Przejąłeś terytorium należące do {name}!" },
  logDefeat: { en: "Defeat! {name} defended successfully, and your time ran out. The Pokémon caught you by surprise!", pl: "Porażka! {name} obronił się, a Twój czas się skończył. Pokémony Cię zaskoczyły!" },
  logFieldLost: { en: "{name} seized your field #{cellId}. Win it back when you're ready!", pl: "{name} przejął Twoje pole #{cellId}. Odzyskaj je, gdy będziesz gotów!" },
  logWarnAttack: { en: "WARNING! {name} challenges your territory! You must defend!", pl: "UWAGA! {name} wyzywa Twoje terytorium! Musisz się bronić!" },
  logAiFight: { en: "AI Battle: {attacker} attacked {defender}. {winner} won and conquered the territory!", pl: "Walka AI: {attacker} zaatakował {defender}. Zwyciężył {winner} i przejął terytorium!" },
} satisfies Record<string, Phrase>;

// --- Count-dependent phrases. {n} is the count. ---
// EN forms: one / other. PL forms: one / few / many (CLDR Polish rule).
const plurals = {
  targets: {
    en: { one: "{n} TARGET", other: "{n} TARGETS" },
    pl: { one: "{n} CEL", few: "{n} CELE", many: "{n} CELÓW" },
  },
  availableFields: {
    en: { one: "{n} available field", other: "{n} available fields" },
    pl: { one: "{n} dostępne pole", few: "{n} dostępne pola", many: "{n} dostępnych pól" },
  },
  // The number is rendered separately (colored badge), so these omit {n}.
  pokemonNoun: {
    en: { one: "Pokémon", other: "Pokémon" },
    pl: { one: "Pokémon", few: "Pokémony", many: "Pokémonów" },
  },
  // Noun only — the count is rendered separately (e.g. "12/151 entries").
  dexEntries: {
    en: { one: "entry", other: "entries" },
    pl: { one: "wpis", few: "wpisy", many: "wpisów" },
  },
} satisfies Record<string, Partial<Record<Language, Record<string, string>>>>;

export type DictKey = keyof typeof dict;
export type PluralKey = keyof typeof plurals;

// Polish plural category: 1 → one; n%10 in 2..4 (but not n%100 in 12..14) → few; else many.
function plKind(n: number): "one" | "few" | "many" {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (n === 1) return "one";
  if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) return "few";
  return "many";
}

function enKind(n: number): "one" | "other" {
  return n === 1 ? "one" : "other";
}

export function interpolate(template: string, vars: Record<string, string | number>): string {
  let out = template;
  for (const [k, v] of Object.entries(vars)) {
    out = out.split(`{${k}}`).join(String(v));
  }
  return out;
}

// Build a flat key → string map for the given language, with EN as fallback.
export function resolveT(lang: Language): Record<DictKey, string> {
  const out = {} as Record<DictKey, string>;
  (Object.keys(dict) as DictKey[]).forEach((k) => {
    const phrase = dict[k] as Phrase;
    out[k] = phrase[lang] ?? phrase[SOURCE_LANGUAGE];
  });
  return out;
}

// Returns { t, tp } for a language. `t` is the flat lookup used everywhere;
// `tp(key, n, vars)` resolves count-dependent phrases.
export function createTranslator(lang: Language) {
  const t = resolveT(lang);

  const tp = (key: PluralKey, n: number, vars: Record<string, string | number> = {}) => {
    const forms = (plurals[key][lang] ?? plurals[key][SOURCE_LANGUAGE]) as Record<string, string>;
    const kind = lang === "pl" ? plKind(n) : enKind(n);
    const template = forms[kind] ?? forms.other ?? forms.many ?? Object.values(forms)[0];
    return interpolate(template, { n, ...vars });
  };

  return { t, tp };
}
