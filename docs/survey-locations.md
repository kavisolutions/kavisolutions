# Surveyor locations and coverage

## Current registered surveyors

As of 23 Nov 2026, the production registry has **2 profiles**, both in Bengaluru:

| Name | Location | Coverage |
| --- | --- | --- |
| Ashok | Bengaluru | not filled |
| Simma | Benguluru (typo) | not filled |

So the current *actual* surveyor base is **Bengaluru only**. The list below is
the **target coverage** the business wants to advertise and staff; it should not
be read as “surveyors already available in every place”.

## Main cities served

- Bengaluru
- Hyderabad
- Chennai (project city; no surveyor base listed yet)
- Guntur
- Vijayawada
- Amaravati

## Target surveyor coverage

### Andhra Pradesh — all 26 districts

| District | Main cities / towns |
| --- | --- |
| Alluri Sitharama Raju | Paderu, Araku Valley, Chintapalli, Rampachodavaram |
| Anakapalli | Anakapalli, Narsipatnam, Yelamanchili, Chodavaram |
| Anantapur | Anantapur, Guntakal, Dharmavaram, Tadipatri |
| Annamayya | Rayachoti, Madanapalle, Rajampet, Pileru |
| Bapatla | Bapatla, Chirala, Repalle |
| Chittoor | Chittoor, Punganur, Nagari, Kuppam |
| Dr. B.R. Ambedkar Konaseema | Amalapuram, Razole, Mummidivaram |
| East Godavari | Rajamahendravaram, Kovvur, Nidadavole, Gokavaram |
| Eluru | Eluru, Jangareddygudem, Nuzvid |
| Guntur | Guntur, Tenali, Mangalagiri, Sattenapalli, Amaravati |
| Kakinada | Kakinada, Pithapuram, Samalkot, Tuni |
| Krishna | Machilipatnam, Gudivada, Avanigadda |
| Kurnool | Kurnool, Adoni, Yemmiganur, Dhone |
| Nandyal | Nandyal, Allagadda, Atmakur |
| NTR | Vijayawada, Jaggayyapeta, Nandigama |
| Palnadu | Narasaraopet, Macherla, Gurazala, Sattenapalli |
| Parvathipuram Manyam | Parvathipuram, Salur, Palakonda |
| Prakasam | Ongole, Markapur, Kandukur |
| Sri Potti Sriramulu Nellore | Nellore, Kavali, Gudur |
| Sri Sathya Sai | Puttaparthi, Hindupur, Penukonda, Madakasira |
| Srikakulam | Srikakulam, Palasa, Tekkali, Amadalavalasa |
| Tirupati | Tirupati, Srikalahasti, Renigunta |
| Visakhapatnam | Visakhapatnam, Gajuwaka, Bheemunipatnam |
| Vizianagaram | Vizianagaram, Bobbili, Cheepurupalli |
| West Godavari | Bhimavaram, Tadepalligudem, Tanuku, Narasapuram |
| YSR Kadapa | Kadapa, Proddatur, Pulivendula, Badvel |

### Telangana — all 33 districts

| District | Main cities / towns |
| --- | --- |
| Adilabad | Adilabad, Bhainsa, Utnoor |
| Bhadradri Kothagudem | Kothagudem, Palwancha, Yellandu |
| Hanumakonda | Hanumakonda, Kazipet, Parkal |
| Hyderabad | Hyderabad, Secunderabad, Charminar |
| Jagtial | Jagtial, Koratla, Metpally |
| Jangaon | Jangaon, Ghanpur, Station Ghanpur |
| Jayashankar Bhupalpally | Bhupalpally, Chityal |
| Jogulamba Gadwal | Gadwal, Alampur, Ieeja |
| Kamareddy | Kamareddy, Banswada, Yellareddy |
| Karimnagar | Karimnagar, Huzurabad, Jammikunta |
| Khammam | Khammam, Sathupally, Madhira |
| Kumuram Bheem Asifabad | Asifabad, Kagaznagar |
| Mahabubabad | Mahabubabad, Thorrur, Dornakal |
| Mahabubnagar | Mahabubnagar, Jadcherla, Devarakadra |
| Mancherial | Mancherial, Bellampalli, Chennur |
| Medak | Medak, Toopran, Narsapur |
| Medchal–Malkajgiri | Medchal, Malkajgiri, Kompally, Shamirpet |
| Mulugu | Mulugu, Eturnagaram |
| Nagarkurnool | Nagarkurnool, Kollapur, Achampet |
| Nalgonda | Nalgonda, Miryalaguda, Devarakonda |
| Narayanpet | Narayanpet, Makthal, Kosgi |
| Nirmal | Nirmal, Bhainsa, Khanapur |
| Nizamabad | Nizamabad, Bodhan, Armoor |
| Peddapalli | Peddapalli, Ramagundam, Godavarikhani |
| Rajanna Sircilla | Sircilla, Vemulawada |
| Rangareddy | Shadnagar, Ibrahimpatnam, Shamshabad |
| Sangareddy | Sangareddy, Patancheru, Zaheerabad, Narayankhed |
| Siddipet | Siddipet, Gajwel, Dubbak |
| Suryapet | Suryapet, Kodad, Huzurnagar |
| Vikarabad | Vikarabad, Tandur, Parigi |
| Wanaparthy | Wanaparthy, Pebbair, Kothakota |
| Warangal | Warangal, Narsampet, Parkal |
| Yadadri Bhuvanagiri | Bhongir, Choutuppal, Alair |

### Karnataka — Bengaluru only

| District | Main cities / towns |
| --- | --- |
| Bengaluru Urban | Bengaluru, Whitefield, Electronic City, Yelahanka, HSR Layout |

## Data-entry design — implemented

The master hierarchy is:

```text
State
  District
    City / town
```

`GET /api/locations` is the single source of truth.

Admin and public registration now use searchable grouped dropdowns:

- Every surveyor-form dropdown has its own search box.
- Primary location: type a district/town, then select from the grouped list.
- Coverage: search, add multiple city/town chips; remove with the chip’s X.
- Location saves as `City, District, State`.
- Coverage saves as an array of the same labels.
- Existing free-text profiles remain editable through a “Current: …” option
  until a master value is selected.

Keep “surveyor base” separate from “service city”. Chennai and Amaravati can be
service cities before a surveyor base exists there.

To expand, add the district/town to
`api/src/modules/locations/locations.data.ts`; both frontends pick it up.
