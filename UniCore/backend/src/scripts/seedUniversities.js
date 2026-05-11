/**
 * University Seeder — Seeds all Ghana universities into MongoDB
 * Run: node src/scripts/seedUniversities.js
 */
require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const University = require('../models/University');

const GHANA_UNIVERSITIES = [
  { shortName: 'UG',        name: 'University of Ghana',                                        location: 'Legon, Accra',  type: 'Public',    dbName: 'uni_ug' },
  { shortName: 'KNUST',     name: 'Kwame Nkrumah University of Science and Technology',          location: 'Kumasi',        type: 'Public',    dbName: 'uni_knust' },
  { shortName: 'UCC',       name: 'University of Cape Coast',                                   location: 'Cape Coast',    type: 'Public',    dbName: 'uni_ucc' },
  { shortName: 'UDS',       name: 'University for Development Studies',                         location: 'Tamale',        type: 'Public',    dbName: 'uni_uds' },
  { shortName: 'UEW',       name: 'University of Education, Winneba',                           location: 'Winneba',       type: 'Public',    dbName: 'uni_uew' },
  { shortName: 'UMaT',      name: 'University of Mines and Technology',                         location: 'Tarkwa',        type: 'Public',    dbName: 'uni_umat' },
  { shortName: 'UHAS',      name: 'University of Health and Allied Sciences',                   location: 'Ho',            type: 'Public',    dbName: 'uni_uhas' },
  { shortName: 'UENR',      name: 'University of Energy and Natural Resources',                 location: 'Sunyani',       type: 'Public',    dbName: 'uni_uenr' },
  { shortName: 'UPSA',      name: 'University of Professional Studies Accra',                   location: 'Accra',         type: 'Public',    dbName: 'uni_upsa' },
  { shortName: 'GIMPA',     name: 'Ghana Institute of Management & Public Administration',       location: 'Greenhill',     type: 'Public',    dbName: 'uni_gimpa' },
  { shortName: 'GCTU',      name: 'Ghana Communication Technology University',                  location: 'Accra',         type: 'Public',    dbName: 'uni_gctu' },
  { shortName: 'RMU',       name: 'Regional Maritime University',                               location: 'Tema',          type: 'Public',    dbName: 'uni_rmu' },
  { shortName: 'UAHS',      name: 'University of Allied Health Sciences',                       location: 'Ho',            type: 'Public',    dbName: 'uni_uahs' },
  { shortName: 'GIJ',       name: 'Ghana Institute of Journalism',                              location: 'Accra',         type: 'Public',    dbName: 'uni_gij' },
  { shortName: 'VVU',       name: 'Valley View University',                                     location: 'Oyibi',         type: 'Public',    dbName: 'uni_vvu' },
  { shortName: 'SDD-UBIDS', name: 'SD Dombo University of Business & Integrated Dev',           location: 'Navrongo',      type: 'Public',    dbName: 'uni_sdd_ubids' },
  { shortName: 'TTU',       name: 'Takoradi Technical University',                              location: 'Takoradi',      type: 'Technical', dbName: 'uni_ttu' },
  { shortName: 'ATU',       name: 'Accra Technical University',                                 location: 'Accra',         type: 'Technical', dbName: 'uni_atu' },
  { shortName: 'HTU',       name: 'Ho Technical University',                                    location: 'Ho',            type: 'Technical', dbName: 'uni_htu' },
  { shortName: 'KsTU',      name: 'Kumasi Technical University',                                location: 'Kumasi',        type: 'Technical', dbName: 'uni_kstu' },
  { shortName: 'BTU',       name: 'Bolgatanga Technical University',                            location: 'Bolgatanga',    type: 'Technical', dbName: 'uni_btu' },
  { shortName: 'WaTU',      name: 'Wa Technical University',                                    location: 'Wa',            type: 'Technical', dbName: 'uni_watu' },
  { shortName: 'CCTU',      name: 'Cape Coast Technical University',                            location: 'Cape Coast',    type: 'Technical', dbName: 'uni_cctu' },
  { shortName: 'KTU',       name: 'Koforidua Technical University',                             location: 'Koforidua',     type: 'Technical', dbName: 'uni_ktu' },
  { shortName: 'STU',       name: 'Sunyani Technical University',                               location: 'Sunyani',       type: 'Technical', dbName: 'uni_stu' },
  { shortName: 'TaTU',      name: 'Tamale Technical University',                                location: 'Tamale',        type: 'Technical', dbName: 'uni_tatu' },
  { shortName: 'BRECT',     name: 'Berekum College of Technology',                              location: 'Berekum',       type: 'Technical', dbName: 'uni_brect' },
  { shortName: 'KKTU',      name: 'Kete Krachi Technical University',                           location: 'Kete Krachi',   type: 'Technical', dbName: 'uni_kktu' },
  { shortName: 'KCHW',      name: 'Kintampo College of Health & Wellbeing',                     location: 'Kintampo',      type: 'Technical', dbName: 'uni_kchw' },
  { shortName: 'TNMTC',     name: 'Tamale Nursing & Midwifery Training College',                location: 'Tamale',        type: 'Technical', dbName: 'uni_tnmtc' },
  { shortName: 'SNTC',      name: 'Sunyani Nursing Training College',                           location: 'Sunyani',       type: 'Technical', dbName: 'uni_sntc' },
  { shortName: 'WNTC',      name: 'Wa Nursing Training College',                                location: 'Wa',            type: 'Technical', dbName: 'uni_wntc' },
  { shortName: 'HNTC',      name: 'Ho Nursing Training College',                                location: 'Ho',            type: 'Technical', dbName: 'uni_hntc' },
  { shortName: 'KNMTC',     name: 'Koforidua Nursing & Midwifery Training College',             location: 'Koforidua',     type: 'Technical', dbName: 'uni_knmtc' },
  { shortName: 'BFNTC',     name: 'Berekum Holy Family Nursing Training College',               location: 'Berekum',       type: 'Technical', dbName: 'uni_bfntc' },
  { shortName: 'Ashesi',    name: 'Ashesi University',                                          location: 'Berekuso',      type: 'Private',   dbName: 'uni_ashesi' },
  { shortName: 'Central',   name: 'Central University',                                         location: 'Miotso',        type: 'Private',   dbName: 'uni_central' },
  { shortName: 'Regent',    name: 'Regent University College of Science & Technology',           location: 'Dansoman',      type: 'Private',   dbName: 'uni_regent' },
  { shortName: 'KAAF',      name: 'KAAF University College',                                    location: 'Airport',       type: 'Private',   dbName: 'uni_kaaf' },
  { shortName: 'LUG',       name: 'Lancaster University Ghana',                                 location: 'Central Region',type: 'Private',   dbName: 'uni_lancaster' },
  { shortName: 'Radford',   name: 'Radford University College',                                 location: 'Abokobi',       type: 'Private',   dbName: 'uni_radford' },
  { shortName: 'Knutsford', name: 'Knutsford University College',                               location: 'Accra',         type: 'Private',   dbName: 'uni_knutsford' },
  { shortName: 'DLI',       name: 'Data Link University College',                               location: 'Tema',          type: 'Private',   dbName: 'uni_dli' },
  { shortName: 'FHUC',      name: 'Family Health University College',                           location: 'Teshie',        type: 'Private',   dbName: 'uni_fhuc' },
  { shortName: 'Webster',   name: 'Webster University Ghana',                                   location: 'East Legon',    type: 'Private',   dbName: 'uni_webster' },
  { shortName: 'Unity',     name: 'Unity University College',                                   location: 'Accra',         type: 'Private',   dbName: 'uni_unity' },
  { shortName: 'Dominion',  name: 'Dominion University College',                                location: 'Accra',         type: 'Private',   dbName: 'uni_dominion' },
  { shortName: 'ANUC',      name: 'All Nations University',                                     location: 'Koforidua',     type: 'Private',   dbName: 'uni_anuc' },
  { shortName: 'CSUC',      name: 'Christian Service University College',                       location: 'Kumasi',        type: 'Private',   dbName: 'uni_csuc' },
  { shortName: 'CUCG',      name: 'Catholic University College of Ghana',                       location: 'Sunyani',       type: 'Private',   dbName: 'uni_cucg' },
  { shortName: 'Mountcrest',name: 'Mountcrest University College',                              location: 'Kumasi',        type: 'Private',   dbName: 'uni_mountcrest' },
  { shortName: 'ABS',       name: 'Accra Business School',                                      location: 'Accra',         type: 'Private',   dbName: 'uni_abs' },
  { shortName: 'ACUC',      name: 'Academic City University College',                           location: 'Accra',         type: 'Private',   dbName: 'uni_acuc' },
  { shortName: 'GCUC',      name: 'Ghana Christian University College',                         location: 'Amrahia',       type: 'Private',   dbName: 'uni_gcuc' },
  { shortName: 'Zenith',    name: 'Zenith University College',                                  location: 'La',            type: 'Private',   dbName: 'uni_zenith' },
  { shortName: 'BlueCrest', name: 'BlueCrest University College',                               location: 'Accra',         type: 'Private',   dbName: 'uni_bluecrest' },
  { shortName: 'PU',        name: 'Pentecost University',                                       location: 'Sowutuom',      type: 'Private',   dbName: 'uni_pu' },
  { shortName: 'MUG',       name: 'Methodist University Ghana',                                 location: 'Tema',          type: 'Private',   dbName: 'uni_mug' },
  { shortName: 'PUCG',      name: 'Presbyterian University College',                            location: 'Abetifi',       type: 'Private',   dbName: 'uni_pucg' },
  { shortName: 'GH Media',  name: 'GH Media University College',                                location: 'Accra',         type: 'Private',   dbName: 'uni_ghmedia' },
  { shortName: 'Maranatha', name: 'Maranatha University College',                               location: 'Accra',         type: 'Private',   dbName: 'uni_maranatha' },
  { shortName: 'IUG',       name: 'Islamic University College Ghana',                           location: 'Accra',         type: 'Private',   dbName: 'uni_iug' },
  { shortName: 'WIUC',      name: 'Wisconsin International University College',                 location: 'Accra',         type: 'Private',   dbName: 'uni_wiuc' },
  { shortName: 'AIT',       name: 'Accra Institute of Technology',                              location: 'Accra',         type: 'Private',   dbName: 'uni_ait' },
  { shortName: 'SUC',       name: 'Spiritan University College',                                location: 'Nsoatre',       type: 'Private',   dbName: 'uni_suc' },
  { shortName: 'KUC',       name: 'Kings University College',                                   location: 'Accra',         type: 'Private',   dbName: 'uni_kuc' },
  { shortName: 'TTS',       name: 'Trinity Theological Seminary',                               location: 'Legon',         type: 'Private',   dbName: 'uni_tts' },
];

const run = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/edubridge';
  await mongoose.connect(mongoUri);
  console.log('✅ Connected to MongoDB');

  let created = 0, skipped = 0;
  for (const u of GHANA_UNIVERSITIES) {
    const exists = await University.findOne({ shortName: u.shortName });
    if (exists) {
      skipped++;
      continue;
    }
    await University.create({ ...u, isActive: true });
    console.log(`  ✅ Created: ${u.shortName} — ${u.name}`);
    created++;
  }

  console.log(`\n🎓 Done. Created: ${created}, Skipped (already exist): ${skipped}`);
  process.exit(0);
};

run().catch(err => {
  console.error('❌ Seeder error:', err);
  process.exit(1);
});
