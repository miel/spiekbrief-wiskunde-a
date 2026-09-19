from lib import domain, example, formula, graph, heading, numworks, table, text, tip, topic, warning

lineair = topic(
    "c1-lineair", "Lineaire functies",
    "Rechte lijnen: richtingscoëfficiënt en startwaarde.",
    "C1.1", ["lineair", "rechte lijn", "richtingscoefficient", "rc", "helling", "eerstegraads", "startwaarde"],
    [
        formula("lin-formule", r"f(x) = ax + b", "f van x is a x plus b",
                caption=r"$a$ = richtingscoëfficiënt (rc), $b$ = startwaarde",
                question="Standaardvorm van een lineaire functie?"),
        formula("lin-rc", r"a = \frac{\Delta y}{\Delta x} = \frac{y_2 - y_1}{x_2 - x_1}", "a is delta y gedeeld door delta x, is y 2 min y 1 gedeeld door x 2 min x 1",
                caption="Richtingscoëfficiënt uit twee punten",
                question="Hoe bereken je de rc uit twee punten?"),
        text(r"Een verband is lineair als de toename per stap **constant** is. In een tabel met gelijke stappen in $x$ zijn de verschillen in $y$ dan steeds hetzelfde."),
        graph("lineair"),
        example("Voorbeeld", r"Een lijn gaat door $(2, 7)$ en $(6, 19)$. Stel de formule op.", [
            ("Bereken eerst de rc.", r"a = \frac{19 - 7}{6 - 2} = \frac{12}{4} = 3"),
            (r"Vul een punt in $y = 3x + b$.", r"7 = 3 \cdot 2 + b \;\Rightarrow\; b = 1"),
            ("De formule is:", r"y = 3x + 1"),
        ]),
    ],
)

kwadratisch = topic(
    "c1-kwadratisch", "Tweedegraadsfuncties",
    "Parabolen: dal of berg, en de top.",
    "C1.1", ["kwadratisch", "parabool", "tweedegraads", "top", "dalparabool", "bergparabool"],
    [
        formula("kw-formule", r"f(x) = ax^2 + bx + c", "f van x is a x kwadraat plus b x plus c",
                caption=r"$a > 0$: dalparabool ⌣, $a < 0$: bergparabool ⌢"),
        formula("kw-top", r"x_{\text{top}} = \frac{-b}{2a}", "x van de top is min b gedeeld door 2 a",
                badge="extra", caption="x-coördinaat van de top",
                question="Wat is de $x$-coördinaat van de top van $f(x) = ax^2 + bx + c$?"),
        text(r"Bij wiskunde A hoef je de $abc$-formule niet te kennen. Los kwadratische vergelijkingen op met de GR, of bereken de top met de afgeleide: $f'(x) = 0$."),
        graph("kwadratisch"),
        tip("De parabool is symmetrisch in de verticale lijn door de top. Twee punten met dezelfde $y$-waarde liggen dus even ver van de top."),
    ],
)

macht = topic(
    "c1-macht", "Machtsfuncties",
    "Functies van de vorm $y = a \\cdot x^n$ en evenredigheid.",
    "C1.1", ["machtsfunctie", "evenredig", "omgekeerd evenredig", "wortelfunctie", "hyperbool"],
    [
        formula("mf-formule", r"f(x) = a \cdot x^n", "f van x is a keer x tot de n",
                caption=r"Machtsfunctie, $n$ mag ook een breuk of negatief zijn"),
        formula("mf-evenredig", r"y = a \cdot x", "y is a keer x",
                caption="(Recht) evenredig: samen groter, samen kleiner",
                question="Welke formule hoort bij recht evenredig?"),
        formula("mf-omgekeerd", r"y = \frac{a}{x} \quad\text{dus}\quad x \cdot y = a", "y is a gedeeld door x, dus x keer y is a",
                caption="Omgekeerd evenredig: product is constant",
                question="Welke formule hoort bij omgekeerd evenredig?"),
        text(r"Bij omgekeerd evenredig geldt: wordt $x$ twee keer zo groot, dan wordt $y$ twee keer zo klein. De $x$-as en de $y$-as zijn asymptoten."),
        graph("macht"),
        graph("omgekeerd-evenredig"),
        text(r"**Evenredig met een macht**: $y = a \cdot x^n$. Wordt $x$ $k$ keer zo groot, dan wordt $y$ $k^n$ keer zo groot."),
    ],
)

exponentieel = topic(
    "c1-exponentieel", "Exponentiële functies",
    "Groeifactor, beginwaarde, halverings- en verdubbelingstijd.",
    "C1.1", ["exponentieel", "groeifactor", "beginwaarde", "halveringstijd", "verdubbelingstijd", "groei", "e-macht", "afname"],
    [
        formula("exp-formule", r"f(x) = b \cdot g^x", "f van x is b keer g tot de x",
                caption=r"$b$ = beginwaarde (bij $x = 0$), $g$ = groeifactor per tijdseenheid",
                question="Standaardvorm van een exponentiële functie?"),
        table(["groeifactor", "betekenis"], [
            ["$g > 1$", "groei"],
            ["$g = 1$", "constant"],
            ["$0 < g < 1$", "afname"],
        ]),
        formula("exp-groeifactor", r"g = 1 + \frac{p}{100}", "g is 1 plus p gedeeld door 100",
                caption=r"Groeipercentage $p\pct$ per tijdseenheid",
                question=r"Groeifactor bij $p\pct$ groei per tijdseenheid?"),
        formula("exp-omrekenen", r"g_{\text{nieuw}} = g^{\,t}", "g nieuw is g tot de t",
                caption=r"Groeifactor per $t$ oude tijdseenheden (bijv. per jaar uit per maand: $t = 12$)",
                question="Hoe reken je een groeifactor om naar een andere tijdseenheid?"),
        formula("exp-halvering", r"g^{T} = 0,5 \;\Leftrightarrow\; T = \glog{g}(0,5)", "g tot de T is 0,5, dus T is g-log 0,5",
                caption="Halveringstijd", question="Hoe bereken je de halveringstijd bij groeifactor $g$?"),
        formula("exp-verdubbeling", r"g^{T} = 2 \;\Leftrightarrow\; T = \glog{g}(2)", "g tot de T is 2, dus T is g-log 2",
                caption="Verdubbelingstijd", question="Hoe bereken je de verdubbelingstijd bij groeifactor $g$?"),
        formula("exp-e", r"f(x) = b \cdot e^{kx} \quad\text{met}\quad g = e^{k}", "f van x is b keer e tot de k x, met g is e tot de k",
                caption=r"De $e$-macht: $e \approx 2,718$", question=r"Wat is de groeifactor van $b \cdot e^{kx}$?"),
        graph("exponentieel"),
        example("Voorbeeld", r"Een populatie groeit met $12\pct$ per jaar. Er zijn nu 800 dieren. Na hoeveel jaar zijn het er 2000?", [
            (r"Groeifactor per jaar: $g = 1,12$. Formule:", r"N(t) = 800 \cdot 1,12^{\,t}"),
            ("Stel de vergelijking op.", r"800 \cdot 1,12^{\,t} = 2000"),
            ("Deel door 800.", r"1,12^{\,t} = 2,5"),
            ("Neem de logaritme.", r"t = \glog{1,12}(2,5) = \frac{\ln(2,5)}{\ln(1,12)} \approx 8,1"),
            ("Na ongeveer 8,1 jaar, dus in het 9e jaar.", None),
        ]),
        numworks("Functies", [
            "Voer in bij **Uitdrukkingen**: `f(x)=800*1.12^x` en `g(x)=2000`.",
            "Ga naar **Grafiek** en stel het venster in (bijv. $0 \\leq x \\leq 20$).",
            "**Bereken** → **Snijpunt** geeft $x \\approx 8,1$.",
        ], note="Let op: de NumWorks gebruikt een **punt** als decimaalteken."),
        warning("Schrijf bij een GR-antwoord altijd op wát je hebt ingevoerd (formules, venster, welke optie). Anders krijg je geen punten."),
    ],
)

logaritme = topic(
    "c1-logaritme", "Logaritmen",
    "De logaritme als omgekeerde van de exponent, met de rekenregels van de formulelijst.",
    "C2.3", ["logaritme", "log", "ln", "grondtal", "rekenregels", "formulelijst", "natuurlijke logaritme"],
    [
        formula("log-definitie", r"\glog{g}(a) = x \;\Leftrightarrow\; g^x = a", "g-log a is x, dus g tot de x is a",
                caption="Definitie van de logaritme", condition=r"$g > 0$, $g \neq 1$, $a > 0$",
                question=r"Wat betekent $\glog{g}(a) = x$?"),
        text(r"$\log(x)$ zonder grondtal betekent $\glog{10}(x)$. De **natuurlijke logaritme** $\ln(x)$ heeft grondtal $e$."),
        formula("log-basis", r"\glog{g}(1) = 0 \qquad \glog{g}(g) = 1 \qquad \glog{g}(g^x) = x", "g-log 1 is 0, g-log g is 1, g-log van g tot de x is x",
                caption="Handig om te onthouden"),
        heading("Rekenregels (staan op de formulelijst)"),
        formula("log-som", r"\glog{g}(a) + \glog{g}(b) = \glog{g}(a \cdot b)", "g-log a plus g-log b is g-log a keer b",
                badge="formulelijst", caption="Somregel", condition=r"$g > 0$, $g \neq 1$, $a > 0$, $b > 0$"),
        formula("log-verschil", r"\glog{g}(a) - \glog{g}(b) = \glog{g}\left(\frac{a}{b}\right)", "g-log a min g-log b is g-log a gedeeld door b",
                badge="formulelijst", caption="Verschilregel", condition=r"$g > 0$, $g \neq 1$, $a > 0$, $b > 0$"),
        formula("log-macht", r"\glog{g}(a^p) = p \cdot \glog{g}(a)", "g-log van a tot de p is p keer g-log a",
                badge="formulelijst", caption="Machtregel", condition=r"$g > 0$, $g \neq 1$, $a > 0$"),
        formula("log-grondtal", r"\glog{g}(a) = \frac{\glog{p}(a)}{\glog{p}(g)} = \frac{\ln(a)}{\ln(g)}", "g-log a is p-log a gedeeld door p-log g, is ln a gedeeld door ln g",
                badge="formulelijst", caption="Grondtal veranderen (zo reken je het uit op de GR)",
                condition=r"$g > 0$, $g \neq 1$, $a > 0$, $p > 0$, $p \neq 1$"),
        graph("logaritme"),
        example("Voorbeeld", r"Los op: $3 \cdot 2^{x} = 96$.", [
            ("Deel door 3.", r"2^{x} = 32"),
            ("Herken de macht, of gebruik de logaritme.", r"x = \glog{2}(32) = \frac{\ln(32)}{\ln(2)} = 5"),
        ]),
        numworks("Rekenen", [
            "Toets `log(x,a)` voor $\\glog{a}(x)$: het grondtal komt **achteraan**.",
            "Of gebruik `ln(x)/ln(a)`.",
        ], note=r"Let op de volgorde: `log(32,2)` is $\glog{2}(32) = 5$."),
        heading("Logaritmische schaalverdeling"),
        text("Op een logaritmische as staat elke stap voor een **factor** (bijv. 10 keer zo groot). Exponentiële groei wordt dan een rechte lijn."),
        graph("logschaal"),
    ],
)

sinus = topic(
    "c1-sinus", "Sinusfunctie",
    "Periodieke verschijnselen: evenwichtsstand, amplitude en periode.",
    "C1.1", ["sinus", "periodiek", "amplitude", "periode", "evenwichtsstand", "sinusoide", "golf"],
    [
        formula("sin-formule", r"f(x) = a + b \cdot \sin\left(c(x - d)\right)", "f van x is a plus b keer sinus van c keer x min d",
                caption="Algemene sinusfunctie", question="Algemene vorm van een sinusfunctie?"),
        table(["", "betekenis"], [
            ["$a$", "evenwichtsstand (middenlijn)"],
            ["$b$", "amplitude (afstand tot de evenwichtsstand)"],
            ["$c$", r"bepaalt de periode: $\frac{2\pi}{c}$"],
            ["$d$", "horizontale verschuiving"],
        ]),
        formula("sin-periode", r"\text{periode} = \frac{2\pi}{c}", "periode is 2 pi gedeeld door c",
                caption="Periode", question="Hoe bereken je de periode van $a + b\\sin(c(x - d))$?"),
        formula("sin-maxmin", r"\text{max} = a + b \qquad \text{min} = a - b", "maximum is a plus b, minimum is a min b",
                caption="Maximum en minimum", question="Max en min van $a + b\\sin(\\ldots)$?"),
        graph("sinus"),
        warning("Zet je rekenmachine op **radialen** (Instellingen → Hoekmaat → Radialen). In de formules van wiskunde A staat de hoek bijna altijd in radialen."),
        example("Voorbeeld", r"De waterstand is $h(t) = 120 + 80 \sin\left(\frac{2\pi}{12,4}(t - 3)\right)$ cm. Bepaal de periode, de hoogste stand en het eerste tijdstip daarvan.", [
            (r"Hier is $c = \frac{2\pi}{12,4}$, dus:", r"\text{periode} = \frac{2\pi}{c} = 12,4 \text{ uur}"),
            ("Hoogste stand:", r"120 + 80 = 200 \text{ cm}"),
            (r"De sinus is maximaal een kwart periode na $t = d = 3$:", r"t = 3 + \frac{12,4}{4} = 6,1 \text{ uur}"),
        ]),
    ],
)

transformaties = topic(
    "c2-transformaties", "Verschuiven en herschalen",
    "Wat er met de formule gebeurt als je de grafiek verschuift of uitrekt.",
    "C2.5", ["transformaties", "verschuiven", "herschalen", "translatie", "vermenigvuldigen", "grafiek"],
    [
        table(["wat je doet met de grafiek", "wat er in de formule verandert"], [
            [r"$p$ naar rechts", r"$x$ wordt $x - p$"],
            [r"$q$ omhoog", r"$+\,q$ erachter"],
            [r"$a$ keer uitrekken t.o.v. de $x$-as (verticaal)", r"vermenigvuldig de hele formule met $a$"],
            [r"$c$ keer uitrekken t.o.v. de $y$-as (horizontaal)", r"$x$ wordt $\frac{x}{c}$"],
        ]),
        formula("tr-algemeen", r"y = a \cdot f\left(\frac{x - p}{c}\right) + q", "y is a keer f van x min p gedeeld door c, plus q",
                caption="Alles bij elkaar", question="Hoe ziet de formule eruit na verschuiven en herschalen?"),
        graph("transformaties"),
        tip(r"Let op het minteken: $f(x - 3)$ verschuift **naar rechts**, niet naar links."),
    ],
)

vergelijkingen = topic(
    "c2-vergelijkingen", "Vergelijkingen en ongelijkheden oplossen",
    "Algebraïsch waar het kan, met de GR waar het moet.",
    "C2.7", ["vergelijking", "ongelijkheid", "oplossen", "snijpunt", "gr", "numeriek", "grafisch"],
    [
        text("Bij wiskunde A mag je vergelijkingen bijna altijd met de **GR** oplossen. Alleen als er 'herleid' of 'los algebraïsch op' staat, moet het met de hand."),
        heading("Met de GR"),
        text(r"Los $f(x) = g(x)$ op door beide als functie in te voeren en het **snijpunt** te zoeken. Voor een ongelijkheid $f(x) < g(x)$: kijk links of rechts van het snijpunt welke grafiek lager ligt, en schrijf het antwoord als interval."),
        numworks("Functies", [
            "Voer beide kanten in als `f(x)` en `g(x)`.",
            "Stel bij **Grafiek** een venster in waarin het snijpunt zichtbaar is.",
            "**Bereken** → **Snijpunt**.",
        ], note="Of gebruik de app **Vergelijking**: typ de vergelijking en kies eventueel zelf een zoekinterval."),
        heading("Oplossen door herleiden"),
        formula("vgl-product", r"A \cdot B = A \cdot C \;\Leftrightarrow\; B = C", "A keer B is A keer C, dus B is C",
                caption=r"Delen door $A$ mag alleen als $A \neq 0$", condition=r"$A \neq 0$"),
        formula("vgl-breuk", r"\frac{A}{B} = C \;\Leftrightarrow\; A = B \cdot C", "A over B is C, dus A is B keer C",
                caption="Breuk wegwerken"),
        text(r"Exponentiële en logaritmische vergelijkingen los je op met $g^x = a \Leftrightarrow x = \glog{g}(a)$; zie **Formules herleiden**."),
        heading("Interpoleren en extrapoleren"),
        formula("vgl-interpoleren", r"y \approx y_1 + \frac{x - x_1}{x_2 - x_1} \cdot (y_2 - y_1)", "y is ongeveer y 1 plus x min x 1 gedeeld door x 2 min x 1, keer y 2 min y 1",
                caption="Lineair interpoleren tussen twee tabelwaarden",
                question="Hoe schat je lineair een waarde tussen twee punten in?"),
        text("**Interpoleren** = schatten *tussen* bekende waarden, **extrapoleren** = *buiten* het bereik doortrekken. Extrapoleren is riskant: het model hoeft daar niet meer te kloppen."),
    ],
)

samengesteld = topic(
    "c2-samengesteld", "Functies combineren",
    "Optellen, aftrekken, vermenigvuldigen, delen en samenstellen.",
    "C2.10", ["somfunctie", "verschilfunctie", "productfunctie", "quotient", "samenstellen", "kettingfunctie"],
    [
        table(["combinatie", "formule", "grafiek"], [
            ["som", "$f(x) + g(x)$", "tel de $y$-waarden op"],
            ["verschil", "$f(x) - g(x)$", "trek de $y$-waarden af"],
            ["product", r"$f(x) \cdot g(x)$", "vermenigvuldig de $y$-waarden"],
            ["quotiënt", r"$\frac{f(x)}{g(x)}$", "deel de $y$-waarden"],
            ["samenstellen", "$g(f(x))$", "eerst $f$, dan $g$"],
        ]),
        text(r"Bij het **schetsen** van een somgrafiek: kijk naar een paar handige $x$-waarden en tel daar de $y$-waarden op. Waar $g(x) = 0$ is, geldt $(f + g)(x) = f(x)$."),
        example("Voorbeeld", r"Gegeven $f(x) = 2x$ en $g(x) = x^2 + 1$. Bereken $g(f(3))$ en $f(g(3))$.", [
            (r"Eerst $f(3) = 6$, daarna $g(6)$:", r"g(f(3)) = 6^2 + 1 = 37"),
            (r"Eerst $g(3) = 10$, daarna $f(10)$:", r"f(g(3)) = 2 \cdot 10 = 20"),
            ("De volgorde maakt dus uit.", None),
        ]),
        heading("Kwalitatief redeneren"),
        text(r"Bij een formule met meerdere variabelen, zoals $R = \frac{k \cdot A}{d^2}$: kijk per variabele wat er gebeurt als die groter wordt en de rest gelijk blijft. Staat de variabele in de **teller**, dan wordt $R$ groter; in de **noemer** kleiner."),
    ],
)

DOMAIN = domain("C", "C", "Verbanden", "function", "green",
                [lineair, kwadratisch, macht, exponentieel, logaritme, sinus, transformaties, vergelijkingen, samengesteld])
