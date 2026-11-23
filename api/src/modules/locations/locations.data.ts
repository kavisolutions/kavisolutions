/* Master list for surveyor base locations and coverage.
 *
 * Andhra Pradesh and Telangana list every district with a starter set of
 * cities/towns. Karnataka currently has Bengaluru only. Add new states or
 * towns here; the admin and survey frontends read this through
 * `GET /api/locations` so they cannot drift.
 */
export type LocationDistrict = { district: string; places: string[] };
export type LocationState = { state: string; districts: LocationDistrict[] };

export const SURVEY_LOCATIONS: LocationState[] = [
  {
    state: "Andhra Pradesh",
    districts: [
      { district: "Alluri Sitharama Raju", places: ["Paderu", "Araku Valley", "Chintapalli", "Rampachodavaram"] },
      { district: "Anakapalli", places: ["Anakapalli", "Narsipatnam", "Yelamanchili", "Chodavaram"] },
      { district: "Anantapur", places: ["Anantapur", "Guntakal", "Dharmavaram", "Tadipatri"] },
      { district: "Annamayya", places: ["Rayachoti", "Madanapalle", "Rajampet", "Pileru"] },
      { district: "Bapatla", places: ["Bapatla", "Chirala", "Repalle"] },
      { district: "Chittoor", places: ["Chittoor", "Punganur", "Nagari", "Kuppam"] },
      { district: "Dr. B.R. Ambedkar Konaseema", places: ["Amalapuram", "Razole", "Mummidivaram"] },
      { district: "East Godavari", places: ["Rajamahendravaram", "Kovvur", "Nidadavole", "Gokavaram"] },
      { district: "Eluru", places: ["Eluru", "Jangareddygudem", "Nuzvid"] },
      { district: "Guntur", places: ["Guntur", "Tenali", "Mangalagiri", "Sattenapalli", "Amaravati"] },
      { district: "Kakinada", places: ["Kakinada", "Pithapuram", "Samalkot", "Tuni"] },
      { district: "Krishna", places: ["Machilipatnam", "Gudivada", "Avanigadda"] },
      { district: "Kurnool", places: ["Kurnool", "Adoni", "Yemmiganur", "Dhone"] },
      { district: "Nandyal", places: ["Nandyal", "Allagadda", "Atmakur"] },
      { district: "NTR", places: ["Vijayawada", "Jaggayyapeta", "Nandigama"] },
      { district: "Palnadu", places: ["Narasaraopet", "Macherla", "Gurazala", "Sattenapalli"] },
      { district: "Parvathipuram Manyam", places: ["Parvathipuram", "Salur", "Palakonda"] },
      { district: "Prakasam", places: ["Ongole", "Markapur", "Kandukur"] },
      { district: "Sri Potti Sriramulu Nellore", places: ["Nellore", "Kavali", "Gudur"] },
      { district: "Sri Sathya Sai", places: ["Puttaparthi", "Hindupur", "Penukonda", "Madakasira"] },
      { district: "Srikakulam", places: ["Srikakulam", "Palasa", "Tekkali", "Amadalavalasa"] },
      { district: "Tirupati", places: ["Tirupati", "Srikalahasti", "Renigunta"] },
      { district: "Visakhapatnam", places: ["Visakhapatnam", "Gajuwaka", "Bheemunipatnam"] },
      { district: "Vizianagaram", places: ["Vizianagaram", "Bobbili", "Cheepurupalli"] },
      { district: "West Godavari", places: ["Bhimavaram", "Tadepalligudem", "Tanuku", "Narasapuram"] },
      { district: "YSR Kadapa", places: ["Kadapa", "Proddatur", "Pulivendula", "Badvel"] },
    ],
  },
  {
    state: "Telangana",
    districts: [
      { district: "Adilabad", places: ["Adilabad", "Bhainsa", "Utnoor"] },
      { district: "Bhadradri Kothagudem", places: ["Kothagudem", "Palwancha", "Yellandu"] },
      { district: "Hanumakonda", places: ["Hanumakonda", "Kazipet", "Parkal"] },
      { district: "Hyderabad", places: ["Hyderabad", "Secunderabad", "Charminar"] },
      { district: "Jagtial", places: ["Jagtial", "Koratla", "Metpally"] },
      { district: "Jangaon", places: ["Jangaon", "Ghanpur", "Station Ghanpur"] },
      { district: "Jayashankar Bhupalpally", places: ["Bhupalpally", "Chityal"] },
      { district: "Jogulamba Gadwal", places: ["Gadwal", "Alampur", "Ieeja"] },
      { district: "Kamareddy", places: ["Kamareddy", "Banswada", "Yellareddy"] },
      { district: "Karimnagar", places: ["Karimnagar", "Huzurabad", "Jammikunta"] },
      { district: "Khammam", places: ["Khammam", "Sathupally", "Madhira"] },
      { district: "Kumuram Bheem Asifabad", places: ["Asifabad", "Kagaznagar"] },
      { district: "Mahabubabad", places: ["Mahabubabad", "Thorrur", "Dornakal"] },
      { district: "Mahabubnagar", places: ["Mahabubnagar", "Jadcherla", "Devarakadra"] },
      { district: "Mancherial", places: ["Mancherial", "Bellampalli", "Chennur"] },
      { district: "Medak", places: ["Medak", "Toopran", "Narsapur"] },
      { district: "Medchal–Malkajgiri", places: ["Medchal", "Malkajgiri", "Kompally", "Shamirpet"] },
      { district: "Mulugu", places: ["Mulugu", "Eturnagaram"] },
      { district: "Nagarkurnool", places: ["Nagarkurnool", "Kollapur", "Achampet"] },
      { district: "Nalgonda", places: ["Nalgonda", "Miryalaguda", "Devarakonda"] },
      { district: "Narayanpet", places: ["Narayanpet", "Makthal", "Kosgi"] },
      { district: "Nirmal", places: ["Nirmal", "Bhainsa", "Khanapur"] },
      { district: "Nizamabad", places: ["Nizamabad", "Bodhan", "Armoor"] },
      { district: "Peddapalli", places: ["Peddapalli", "Ramagundam", "Godavarikhani"] },
      { district: "Rajanna Sircilla", places: ["Sircilla", "Vemulawada"] },
      { district: "Rangareddy", places: ["Shadnagar", "Ibrahimpatnam", "Shamshabad"] },
      { district: "Sangareddy", places: ["Sangareddy", "Patancheru", "Zaheerabad", "Narayankhed"] },
      { district: "Siddipet", places: ["Siddipet", "Gajwel", "Dubbak"] },
      { district: "Suryapet", places: ["Suryapet", "Kodad", "Huzurnagar"] },
      { district: "Vikarabad", places: ["Vikarabad", "Tandur", "Parigi"] },
      { district: "Wanaparthy", places: ["Wanaparthy", "Pebbair", "Kothakota"] },
      { district: "Warangal", places: ["Warangal", "Narsampet", "Parkal"] },
      { district: "Yadadri Bhuvanagiri", places: ["Bhongir", "Choutuppal", "Alair"] },
    ],
  },
  {
    state: "Karnataka",
    districts: [
      { district: "Bengaluru Urban", places: ["Bengaluru", "Whitefield", "Electronic City", "Yelahanka", "HSR Layout"] },
    ],
  },
];

export const locationLabel = (
  state: string,
  district: string,
  place: string,
): string => `${place}, ${district}, ${state}`;
