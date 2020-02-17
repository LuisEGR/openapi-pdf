let fs = require('fs');
var path = require('path');
const express = require('express')
const app = express();
const http = require('http').Server(app);
const handlebars = require('handlebars');

const port = 3052;



let templateHTML = fs.readFileSync('./template.html', {encoding: 'utf-8'});
let template2HTML = fs.readFileSync('./api.template.html', {encoding: 'utf-8'});

let template = handlebars.compile(templateHTML)
let template2 = handlebars.compile(template2HTML)

app.use('/', (req, res) => {
    // let pare = JSON.parse(fs.readFileSync('./fixtures/parsed.json'));
    let pare = JSON.parse(fs.readFileSync('./fixtures/petstore_parsed.json'));
    console.log("pare:", pare);

    let allHTML = template(pare);
    pare.apis.forEach((api) => {
        allHTML += template2(api);
    })
    res.send(allHTML);
});



http.listen(port, () => {
    console.log('listening on http://localhost:' + port);
})




