from lib import domain, example, formula, graph, heading, numworks, table, text, tip, topic, warning

NOTE = "Domein E wordt getoetst in het **schoolexamen**, niet in het centraal examen. Check je PTA welke onderdelen bij jouw school horen."

data = topic(
    "e-data", "Data en diagrammen",
    "Soorten data, centrum- en spreidingsmaten.",
    "E2.1", ["data", "gemiddelde", "mediaan", "modus", "boxplot", "kwartiel", "standaardafwijking", "spreiding", "histogram"],
    [
        text(NOTE),
        table(["soort data", "voorbeeld"], [
            ["kwalitatief nominaal", "kleur, merk (geen volgorde)"],
            ["kwalitatief ordinaal", "cijfer 1–5 voor tevredenheid (wel volgorde)"],
            ["kwantitatief discreet", "aantal kinderen (telbaar)"],
            ["kwantitatief continu", "lengte, tijd (meetbaar)"],
        ]),
        heading("Centrummaten"),
        formula("st-gemiddelde", r"\bar{x} = \frac{\sum x}{n}", "x gemiddelde is de som van x gedeeld door n",
                badge="se", caption="Gemiddelde", question="Formule voor het gemiddelde?"),
        text("**Mediaan**: het middelste getal als je alles op volgorde zet (bij een even aantal: het gemiddelde van de middelste twee). **Modus**: de waarde die het vaakst voorkomt."),
        tip("Bij een **scheve** verdeling of **uitschieters** geeft de mediaan een eerlijker beeld dan het gemiddelde."),
        heading("Spreidingsmaten"),
        table(["maat", "betekenis"], [
            ["spreidingsbreedte", "grootste − kleinste waarde"],
            [r"kwartielafstand ($Q_3 - Q_1$)", "breedte van de middelste 50 %"],
            [r"standaardafwijking ($\sigma$ of $s$)", "gemiddelde afstand tot het gemiddelde"],
        ]),
        text(r"Een **boxplot** tekent de vijf getallen: minimum, $Q_1$, mediaan, $Q_3$, maximum. De box bevat de middelste 50 % van de data."),
        numworks("Statistiek", [
            "Voer de waarden in de kolom $V1$ in (en eventueel de frequenties in $N1$).",
            "Ga naar het tabblad met de **Statistieken**: gemiddelde, standaardafwijking, kwartielen en mediaan staan er allemaal.",
            "Bij **Grafiek** kies je histogram of **Boxplot**.",
        ]),
    ],
)

kansen = topic(
    "e-kansen", "Kansrekening",
    "Kansregels, boomdiagram en verwachtingswaarde.",
    "E4.1", ["kans", "kansregels", "complement", "onafhankelijk", "voorwaardelijke kans", "verwachtingswaarde", "boomdiagram"],
    [
        text(NOTE),
        formula("kans-definitie", r"P(A) = \frac{\text{aantal gunstige uitkomsten}}{\text{aantal mogelijke uitkomsten}}", "P van A is aantal gunstige uitkomsten gedeeld door aantal mogelijke uitkomsten",
                badge="se", caption="Kans bij gelijke uitkomsten"),
        formula("kans-complement", r"P(\text{niet } A) = 1 - P(A)", "P van niet A is 1 min P van A",
                badge="se", caption="Complementregel: handig bij 'minstens één'",
                question="Complementregel: $P(\\text{niet } A) = ?$"),
        formula("kans-som", r"P(A \text{ of } B) = P(A) + P(B)", "P van A of B is P van A plus P van B",
                badge="se", caption="Somregel, als A en B elkaar uitsluiten"),
        formula("kans-product", r"P(A \text{ en } B) = P(A) \cdot P(B)", "P van A en B is P van A keer P van B",
                badge="se", caption="Productregel, als A en B onafhankelijk zijn",
                question="Productregel voor onafhankelijke gebeurtenissen?"),
        formula("kans-voorwaardelijk", r"P(A \mid B) = \frac{P(A \text{ en } B)}{P(B)}", "P van A gegeven B is P van A en B gedeeld door P van B",
                badge="se", caption="Voorwaardelijke kans"),
        text("In een **boomdiagram**: vermenigvuldig de kansen langs een tak, tel de kansen van verschillende takken op."),
        heading("Verwachtingswaarde"),
        formula("kans-ev", r"E(X) = \sum x \cdot P(X = x)", "E van X is de som van x keer P van X is x",
                badge="se", caption="Verwachtingswaarde van een toevalsvariabele",
                question="Formule voor de verwachtingswaarde $E(X)$?"),
        example("Voorbeeld", r"Bij een spel win je € 5 met kans $0,1$, € 1 met kans $0,3$ en niets met kans $0,6$. Meedoen kost € 1,50. Is het spel eerlijk?", [
            ("Bereken de verwachte opbrengst.", r"E(X) = 5 \cdot 0,1 + 1 \cdot 0,3 + 0 \cdot 0,6 = 0,8"),
            ("Vergelijk met de inzet: € 0,80 tegenover € 1,50.", None),
            ("Gemiddeld verlies je € 0,70 per spel, dus het spel is niet eerlijk.", None),
        ]),
    ],
)

binomiaal = topic(
    "e-binomiaal", "Binomiale verdeling",
    "Vaste kans, vast aantal herhalingen, aantal successen.",
    "E5.1", ["binomiaal", "binomiale verdeling", "succes", "verwachtingswaarde", "standaardafwijking", "binompdf", "binomcdf"],
    [
        text(NOTE),
        text(r"Gebruik de binomiale verdeling als: het aantal keer $n$ vastligt, elke keer dezelfde kans $p$ op succes heeft, en de keren **onafhankelijk** zijn. $X$ telt het aantal successen."),
        formula("bin-pmf", r"P(X = k) = \binom{n}{k} \cdot p^k \cdot (1 - p)^{\,n - k}", "P van X is k is n boven k keer p tot de k keer 1 min p tot de n min k",
                badge="se", caption="Kans op precies $k$ successen",
                question=r"Formule voor $P(X = k)$ bij een binomiale verdeling?"),
        formula("bin-ev", r"E(X) = n \cdot p", "E van X is n keer p",
                badge="se", caption="Verwachtingswaarde", question="Verwachtingswaarde bij een binomiale verdeling?"),
        formula("bin-sd", r"\sigma(X) = \sqrt{n \cdot p \cdot (1 - p)}", "sigma van X is de wortel van n keer p keer 1 min p",
                badge="se", caption="Standaardafwijking", question="Standaardafwijking bij een binomiale verdeling?"),
        graph("binomiaal"),
        numworks("Kansrekenen", [
            "Kies **Binomiale verdeling** en vul $n$ en $p$ in.",
            "Kies daarna het type kans: $P(X = k)$, $P(X \\leq k)$ of $P(a \\leq X \\leq b)$.",
            "In **Rekenen** kan het ook direct: `binompdf(k,n,p)` voor $P(X = k)$ en `binomcdf(k,n,p)` voor $P(X \\leq k)$.",
        ], note=r"'Minstens $k$' reken je als $1 - P(X \leq k - 1)$."),
        example("Voorbeeld", r"Een toets heeft 20 meerkeuzevragen met 4 opties. Je gokt alles. Wat is de kans op minstens 8 goed?", [
            (r"Hier is $n = 20$ en $p = 0,25$.", r"X \sim B(20;\, 0,25)"),
            ("Minstens 8 is het complement van hoogstens 7.", r"P(X \geq 8) = 1 - P(X \leq 7)"),
            ("Met de GR:", r"1 - \text{binomcdf}(7; 20; 0,25) \approx 0,102"),
            ("De kans is ongeveer 10 %.", None),
        ]),
    ],
)

normaal = topic(
    "e-normaal", "Normale verdeling",
    "Klokvorm, vuistregels en de GR.",
    "E5.2", ["normale verdeling", "vuistregels", "z-waarde", "normalcdf", "invnorm", "klokvorm", "standaardafwijking"],
    [
        text(NOTE),
        text(r"Een normale verdeling is symmetrisch en klokvormig rond het gemiddelde $\mu$, met standaardafwijking $\sigma$."),
        heading("De drie vuistregels"),
        table([r"interval", "deel van de data"], [
            [r"$\mu \pm \sigma$", "ongeveer 68 %"],
            [r"$\mu \pm 2\sigma$", "ongeveer 95 %"],
            [r"$\mu \pm 3\sigma$", "ongeveer 99,7 %"],
        ]),
        formula("nor-z", r"z = \frac{x - \mu}{\sigma}", "z is x min mu gedeeld door sigma",
                badge="se", caption=r"$z$-waarde: hoeveel standaardafwijkingen zit $x$ van het gemiddelde af?",
                question="Formule voor de $z$-waarde?"),
        graph("normaal"),
        numworks("Kansrekenen", [
            "Kies **Normale verdeling** en vul $\\mu$ en $\\sigma$ in.",
            "Kies het type kans, bijvoorbeeld $P(a \\leq X \\leq b)$.",
            "In **Rekenen**: `normcdf(a,μ,σ)` geeft $P(X \\leq a)$, `normcdfrange(a,b,μ,σ)` geeft $P(a \\leq X \\leq b)$ en `invnorm(p,μ,σ)` geeft de grenswaarde bij een kans.",
        ], note=r"Voor $P(X \geq a)$ reken je $1 - P(X \leq a)$."),
        example("Voorbeeld", r"De lengte van mannen is normaal verdeeld met $\mu = 181$ cm en $\sigma = 7$ cm. Hoeveel procent is langer dan 195 cm?", [
            ("Bereken de $z$-waarde.", r"z = \frac{195 - 181}{7} = 2"),
            (r"Vuistregel: buiten $\mu \pm 2\sigma$ ligt ongeveer 5 %, dus aan één kant de helft.", r"P(X > 195) \approx 2,5\pct"),
            ("Met de GR nauwkeuriger:", r"1 - \text{normcdf}(195; 181; 7) \approx 0,0228"),
        ]),
        heading("Steekproef van gemiddelden"),
        formula("nor-sqrtn", r"\sigma(\bar{X}) = \frac{\sigma}{\sqrt{n}}", "sigma van x gemiddelde is sigma gedeeld door wortel n",
                badge="se", caption=r"Wortel-$n$-wet: gemiddelden van steekproeven spreiden minder",
                question=r"Wat is de standaardafwijking van het steekproefgemiddelde?"),
    ],
)

toetsen = topic(
    "e-toetsen", "Steekproef, betrouwbaarheid en toetsen",
    "Betrouwbaarheidsintervallen en hypothesetoetsen.",
    "E6.1", ["steekproef", "betrouwbaarheidsinterval", "hypothese", "toetsen", "significant", "overschrijdingskans", "proportie"],
    [
        text(NOTE),
        text("Een steekproef moet **aselect** en **representatief** zijn, anders zeggen de uitkomsten niets over de populatie."),
        heading("95 %-betrouwbaarheidsinterval"),
        formula("bi-proportie", r"\hat{p} \pm 2 \cdot \sqrt{\frac{\hat{p}(1 - \hat{p})}{n}}", "p dakje plus of min 2 keer de wortel van p dakje keer 1 min p dakje gedeeld door n",
                badge="se", caption=r"Voor een proportie, met steekproefproportie $\hat{p}$",
                question="95 %-betrouwbaarheidsinterval voor een proportie?"),
        formula("bi-gemiddelde", r"\bar{x} \pm 2 \cdot \frac{s}{\sqrt{n}}", "x gemiddelde plus of min 2 keer s gedeeld door wortel n",
                badge="se", caption="Voor een gemiddelde",
                question="95 %-betrouwbaarheidsinterval voor een gemiddelde?"),
        text(r"Een groter interval betekent meer onzekerheid. Vier keer zo veel data ($n$) maakt het interval **twee** keer zo smal."),
        example("Voorbeeld", r"In een steekproef van 400 kiezers is 220 vóór. Geef een 95 %-betrouwbaarheidsinterval.", [
            ("Steekproefproportie:", r"\hat{p} = \frac{220}{400} = 0,55"),
            ("Bereken de marge.", r"2 \cdot \sqrt{\frac{0,55 \cdot 0,45}{400}} \approx 0,0497"),
            ("Interval:", r"0,55 \pm 0,05 \;\Rightarrow\; [0,50;\, 0,60]"),
            ("Omdat 0,50 net binnen het interval ligt, kun je niet concluderen dat een meerderheid vóór is.", None),
        ]),
        heading("Hypothesetoets"),
        text("Stappen: 1) stel $H_0$ en $H_1$ op, 2) kies het significantieniveau $\\alpha$ (meestal 0,05), 3) bereken de **overschrijdingskans** (de kans op dit resultaat of extremer, als $H_0$ waar is), 4) vergelijk met $\\alpha$ en trek een conclusie in de context."),
        table(["uitkomst", "conclusie"], [
            [r"kans $< \alpha$", r"verwerp $H_0$: het verschil is significant"],
            [r"kans $\geq \alpha$", r"verwerp $H_0$ niet: toeval kan het verklaren"],
        ]),
        warning("Bij een **tweezijdige** toets vergelijk je de overschrijdingskans met $\\frac{\\alpha}{2}$ (of verdubbel je de kans)."),
        tip(r"'$H_0$ niet verwerpen' betekent niet dat $H_0$ waar is: je hebt alleen te weinig bewijs voor het tegendeel."),
    ],
)

DOMAIN = domain("E", "E", "Statistiek en kansrekening", "chart.bar", "purple",
                [data, kansen, binomiaal, normaal, toetsen], school_exam_only=True)
