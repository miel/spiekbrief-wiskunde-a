from lib import domain, formula, heading, numworks, table, text, tip, topic, warning

formulelijst = topic(
    "tips-formulelijst", "De formulelijst in het examen",
    "Precies de formules die op bladzijde 2 van het examen staan (syllabus bijlage 5).",
    "Bijlage 5", ["formulelijst", "formuleblad", "bijlage 5", "differentieren", "logaritmen"],
    [
        text("Deze lijst krijg je **bij het examen**. Alles wat in de app oranje is (‘Paraat kennen’), staat er níét op."),
        heading("Differentiëren"),
        formula("fl-som", r"s(x) = f(x) + g(x) \;\Rightarrow\; s'(x) = f'(x) + g'(x)", "somregel", badge="formulelijst", caption="somregel"),
        formula("fl-verschil", r"v(x) = f(x) - g(x) \;\Rightarrow\; v'(x) = f'(x) - g'(x)", "verschilregel", badge="formulelijst", caption="verschilregel"),
        formula("fl-product", r"p(x) = f(x) \cdot g(x) \;\Rightarrow\; p'(x) = f'(x) \cdot g(x) + f(x) \cdot g'(x)", "productregel", badge="formulelijst", caption="productregel"),
        formula("fl-quotient", r"q(x) = \frac{f(x)}{g(x)} \;\Rightarrow\; q'(x) = \frac{f'(x) \cdot g(x) - f(x) \cdot g'(x)}{\left(g(x)\right)^2}", "quotientregel", badge="formulelijst", caption="quotiëntregel"),
        formula("fl-ketting", r"k(x) = f(g(x)) \;\Rightarrow\; k'(x) = f'(g(x)) \cdot g'(x)", "kettingregel", badge="formulelijst",
                caption=r"kettingregel, ook $\frac{dk}{dx} = \frac{df}{dg} \cdot \frac{dg}{dx}$"),
        heading("Logaritmen"),
        formula("fl-log-som", r"\glog{g}(a) + \glog{g}(b) = \glog{g}(a \cdot b)", "g-log a plus g-log b is g-log a keer b",
                badge="formulelijst", condition=r"$g > 0$, $g \neq 1$, $a > 0$, $b > 0$"),
        formula("fl-log-verschil", r"\glog{g}(a) - \glog{g}(b) = \glog{g}\left(\frac{a}{b}\right)", "g-log a min g-log b is g-log a gedeeld door b",
                badge="formulelijst", condition=r"$g > 0$, $g \neq 1$, $a > 0$, $b > 0$"),
        formula("fl-log-macht", r"\glog{g}(a^p) = p \cdot \glog{g}(a)", "g-log van a tot de p is p keer g-log a",
                badge="formulelijst", condition=r"$g > 0$, $g \neq 1$, $a > 0$"),
        formula("fl-log-grondtal", r"\glog{g}(a) = \frac{\glog{p}(a)}{\glog{p}(g)}", "g-log a is p-log a gedeeld door p-log g",
                badge="formulelijst", condition=r"$g > 0$, $g \neq 1$, $a > 0$, $p > 0$, $p \neq 1$"),
    ],
)

werkwoorden = topic(
    "tips-werkwoorden", "Examenwerkwoorden",
    "Wat moet je opschrijven bij ‘bereken’, ‘bepaal’, ‘toon aan’ … (syllabus bijlage 2).",
    "Bijlage 2", ["examenwerkwoorden", "bereken", "bepaal", "aantonen", "onderzoek", "schets", "teken", "herleid"],
    [
        table(["werkwoord", "wat wordt verwacht"], [
            ["berekenen", "het gevraagde uitrekenen; uit je uitwerking moet blijken welke stappen je hebt gezet"],
            ["bepalen", "het gevraagde vaststellen en/of uitrekenen; stappen laten zien (mag met de GR)"],
            ["aantonen, laten zien dat", "een redenering, bepaling of berekening waaruit blijkt dat het klopt; een voorbeeld is niet genoeg"],
            ["afleiden", "met een redenering of berekening laten zien dat de formule volgt"],
            ["beredeneren, uitleggen", "de denkstappen opschrijven"],
            ["onderzoeken of", "redeneren of rekenen én afsluiten met een conclusie"],
            ["oplossen", "de waarden bepalen die aan de (on)gelijkheid voldoen, met stappen"],
            ["herleiden", "stap voor stap herschrijven, zonder speciale opties van de GR"],
            ["schetsen", "een grafiek met de karakteristieke eigenschappen"],
            ["tekenen", "nauwkeurig, met assenstelsel en schaalverdeling"],
            ["noemen, geven wat/welke", "alleen het eindantwoord; toelichting hoeft niet"],
        ]),
        tip("‘Algebraïsch’ en ‘exact’ gelden alleen bij wiskunde B. Bij wiskunde A mag je dus in principe altijd de GR gebruiken — behalve bij ‘herleiden’."),
        warning("Schrijf bij GR-gebruik altijd op wát je invoerde: de formules, het venster en welke optie (snijpunt, maximum …). Alleen een antwoord levert vaak geen punten op."),
    ],
)

afronden = topic(
    "tips-afronden", "Afronden en nauwkeurigheid",
    "Hoe nauwkeurig moet je antwoord zijn? (syllabus § 2.1.2)",
    "2.1.2", ["afronden", "nauwkeurigheid", "decimalen", "tussenantwoord", "eenheid"],
    [
        text("Staat er geen nauwkeurigheid bij, dan leid je die af uit de context. Kies ook een passende eenheid."),
        warning("Rond **tussenantwoorden niet af**: reken door met de waarde op je GR. Anders wijkt je eindantwoord af."),
        table(["context", "logisch antwoord"], [
            ["aantal mensen", "heel getal"],
            ["geld", "2 decimalen"],
            ["percentage", "1 decimaal, tenzij anders gevraagd"],
            ["gegevens met 3 cijfers", "antwoord in ongeveer 3 cijfers"],
        ]),
        tip("Bij ‘hoeveel hele dagen/stuks’ moet je soms **naar boven** afronden (je hebt 8,1 dag nodig, dus 9 dagen), en soms naar beneden (met dit budget passen er 8,7 stuks in, dus 8)."),
    ],
)

numworks_tips = topic(
    "tips-numworks", "NumWorks: instellingen en examenstand",
    "Klaarmaken voor het examen en veelgebruikte apps.",
    "ICT", ["numworks", "examenstand", "rekenmachine", "radialen", "instellingen", "gr"],
    [
        heading("Vooraf instellen"),
        numworks("Instellingen", [
            "**Hoekmaat** → **Radialen** (nodig bij sinusmodellen).",
            "**Resultaatformaat** → **Decimaal**, met het aantal cijfers dat je fijn vindt.",
            "Decimaalteken op de NumWorks is een **punt**; de komma scheidt argumenten.",
        ]),
        heading("Examenstand (NL)"),
        numworks("Instellingen", [
            "**Examenstand** → **Activeer de NL examenstand** → bevestigen.",
            "Het lampje bovenop knippert oranje: zo ziet de surveillant dat de stand aan staat.",
            "Uitzetten kan alleen door de rekenmachine op een computer aan te sluiten.",
        ], note="In de NL examenstand zijn **Python** en **Elementen** uitgeschakeld, worden er geen exacte resultaten getoond en kun je geen eenheden gebruiken. Al je ingevoerde gegevens worden gewist, dus activeer de stand ruim vóór het examen en oefen daarna verder."),
        heading("Welke app waarvoor?"),
        table(["app", "waarvoor"], [
            ["Rekenen", "gewone berekeningen, `diff(`, `binomial(`, `log(x,a)`"],
            ["Functies", "grafiek, tabel, snijpunt, top, nulpunt, raaklijn"],
            ["Vergelijking", "vergelijkingen numeriek oplossen"],
            ["Rijen", "directe en recursieve formules, tabel en somrij"],
            ["Statistiek", "gemiddelde, standaardafwijking, boxplot, histogram"],
            ["Kansrekenen", "binomiale en normale verdeling"],
            ["Regressie", "trendlijn bij een puntenwolk"],
        ]),
        warning("Deze app mag je **niet** gebruiken tijdens het examen: alleen je rekenmachine en de formulelijst zijn toegestaan."),
    ],
)

DOMAIN = domain("tips", "Tips", "Examentips", "graduationcap", "teal",
                [formulelijst, werkwoorden, afronden, numworks_tips])
