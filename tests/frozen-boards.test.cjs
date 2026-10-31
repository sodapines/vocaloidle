const {test}=require('node:test');
const assert=require('node:assert/strict');
const C=require('../connections/core.js');
const songs=require('../data/songs.json');
const connections=require('../connections/manifests.json');
const grid=require('../masume/manifests.json');
test('every frozen Connections board hydrates',()=>{for(const [day,entry] of Object.entries(connections))assert.ok(C.hydrateManifest(entry,songs),day);});
test('frozen Grid boards are complete 4x4 layouts',()=>{for(const [day,entry] of Object.entries(grid)){assert.equal(entry.rows.length,4,day);assert.equal(entry.cols.length,4,day);}});
