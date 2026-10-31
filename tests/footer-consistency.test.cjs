const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const pages=['index.html','heardle/index.html','higher-or-lower/index.html','connections/index.html','masume/index.html','mikudle/index.html','timeline/index.html','cover-reveal/index.html'];
test('every game footer uses the shared wording',()=>{
 for(const page of pages){const footer=fs.readFileSync(page,'utf8').match(/<footer[\s\S]*?<\/footer>/)[0];assert.match(footer,/: fan-made .* \(c\) 2026 \| Not affiliated with Crypton Future Media or NicoNico \| /,page);}
});
