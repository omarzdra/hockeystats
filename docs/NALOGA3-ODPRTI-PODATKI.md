# Naloga 3 – Odprti podatki in PC-Axis

## Namen

HockeyStats poleg profesionalnih NHL podatkov prikazuje širši javno dostopen
statistični kontekst športov na ledu. Modul prebere uradno statistično tabelo v
formatu PC-Axis, njene metapodatke pretvori v filtre in podatke vizualizira brez
hardcodanih statističnih vrednosti.

Modul je namenoma ločen od NHL in MoneyPuck podatkov. Vrednosti španske
kategorije športov na ledu se ne združujejo z NHL statistikami.

## Vir

- portal: European Data Portal – [data.europa.eu](https://data.europa.eu/data/datasets/https-datos-gob-es-catalogo-d00000000505003?locale=en);
- izdajatelj: Ministerio de Educación, Formación Profesional y Deportes;
- dataset: *Federated sports clubs and average number of licenses per federation,
  federated sports clubs and period*;
- originalni identifikator: `D00000000505003`;
- format distribucije: PC-Axis (`.px`);
- uporabljena izdaja tabele: leto objave 2025, podatkovna obdobja 2007–2024;
- [originalna distribucija](https://estadisticas.educacion.gob.es/DeporteJaxiPx/files/_px/es/px/federado/2024/l0/federado_03.px?nocab=1).

Originalna datoteka je shranjena v
`public/data/open-data/federated-sports-spain.px`. Njena deklarirana kodna stran
je `iso-8859-15`. Aplikacija jo zato prenese kot bajte in jo pred parsiranjem
dekodira z `TextDecoder('iso-8859-15')`.

## Zakaj je dataset relevanten

Tabela vsebuje kategorijo `Deportes de Hielo` (športi na ledu), zato dopolnjuje
HockeyStats s širšim statističnim kontekstom. Ta kategorija ne predstavlja samo
hokeja na ledu: vključuje širšo skupino športov na ledu. Uporabniški vmesnik to
omejitev jasno navede.

## PC-Axis

PC-Axis je statistični format, ki v isti datoteki hrani metapodatke in
večdimenzionalni podatkovni blok. Metapodatki opisujejo naslov, vir, opombe,
dimenzije ter dovoljene vrednosti. V tej tabeli so dimenzije federacija oziroma
športna kategorija, kazalnik in obdobje.

## Implementacija

Tok podatkov je:

```text
.px datoteka → fetch(ArrayBuffer) → ISO-8859-15 decode → Px.js parser
             → validacija dimenzij → filtriranje/izračuni → Chart.js
```

`src/features/open-data/utils/pcAxis.ts` uporablja paket `px` (Px.js). Adapter
prebere `TITLE`, `SOURCE`, `NOTE`, spremenljivke, njihove vrednosti in celoten
`DATA` blok. Dimenzij ne določa po položaju, temveč po njihovih imenih in
metapodatkih. Preveri tudi, ali je število opazovanj enako produktu velikosti
dimenzij.

`src/features/open-data/services/openDataService.ts` ob vsakem nalaganju strani
z `fetch()` prebere originalno `.px` datoteko. React stran prikaže loading ali
prijazno error stanje; prek gumba je mogoče neuspešen prenos ponoviti.

## Obdelava

- dropdown športnih kategorij nastane neposredno iz `VALUES("Federación")`;
- privzeta kategorija je `Deportes de Hielo`;
- dropdown kazalnikov nastane iz metapodatkov in trenutno vsebuje `Nº de clubs`
  ter `Nº medio de licencias`;
- obdobja se pretvorijo v leta in kronološko uredijo;
- numerične vrednosti se pretvorijo v JavaScript `number`;
- oznake manjkajočih vrednosti, na primer `..` in `-`, postanejo `null` in ne
  `NaN` ali nič;
- medletna sprememba se za zaporedni opazovanji izračuna kot
  `((current - previous) / previous) * 100`; kadar vrednost manjka ali je
  imenovalec nič, je rezultat nedostopen.

## Vizualizacija

Chart.js prek `react-chartjs-2` izriše:

1. črtni graf trenda izbrane kategorije in kazalnika skozi vsa obdobja;
2. vodoravni stolpčni graf primerjave sorodnih kategorij v zadnjem razpoložljivem
   letu. Kategorije se izberejo iz metapodatkov, njihove vrednosti pa vedno iz
   parsiranega podatkovnega bloka.

KPI kartice prikazujejo zadnjo razpoložljivo vrednost, leto, medletno spremembo
in vir. Vsi prikazi se posodobijo ob spremembi filtra.

V glavni navigaciji je tudi preklop `EN / ES`. Prevede besedila vmesnika,
Chart.js oznake, KPI-je, metriki in prikazna imena vseh športnih kategorij.
Originalne španske vrednosti iz PC-Axis metapodatkov ostanejo interni ključi,
zato menjava jezika ne spremeni filtriranja in ne sproži ponovnega parsiranja
datoteke.

## Dinamičnost

Grafi in KPI kartice niso izdelani iz hardcodanih številk. Ob odprtju poti
`/open-data` se lokalna kopija originalne `.px` datoteke ponovno prebere in
parsira. Hardcodana sta le pot do preverjene distribucije in semantično iskano
privzeto ime kategorije; seznam kategorij, metrik, let in vse vrednosti prihajajo
iz PC-Axis datoteke.

## Lokalno preverjanje

```bash
npm install
npm run dev
```

Odpri `http://localhost:5173/open-data`. Kakovostna preverjanja:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```
