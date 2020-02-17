const oap = require('./parser');
const fs = require('fs');


let os = fs.readFileSync('fixtures/petstore.json', {encoding: 'utf-8'});
let oas = JSON.parse(os);
test('Gets the root information', () => {
    let data = oap.parseOAS(oas);

    expect(data).toHaveProperty('title');
    expect(data).toHaveProperty('version');
    expect(data).toHaveProperty('apis');

})

test('Parsing api', () => {
    let data = oap.parseOAS(oas);
    console.log("data:", JSON.stringify(data, null, 2));
    // let api = oas.apis[0];
    // let apiParsed = oap.parseApi(api);
    // console.log("apiParsed:", JSON.stringify(apiParsed, null, 2));
    fs.writeFileSync('./fixtures/petstore_parsed.json', JSON.stringify(data, null, 2))

})
// test('adds 1 + 2 to equal 3', () => {
//   expect(sum()).toBe(3);
// });