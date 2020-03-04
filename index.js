let fs = require('fs');
var path = require('path');
const express = require('express')
const app = express();
const http = require('http').Server(app);
const handlebars = require('handlebars');
const resolve = require('json-refs').resolveRefs;
const parser = require('./parser');
const hljs = require('highlight.js');
const got = require('got');
const yaml = require('js-yaml');
const port = 3052;

// hljs.registerLanguage('json', require('highlight.js/lib/languages/json'));

handlebars.registerHelper('hljs', function(context, options){
    return hljs.highlightAuto(context).value;
    // return "<b class=\"blackkkkk\">"+context+"</b>";
})


let parseJson = (str) => {
    try{
        let obj = JSON.parse(str);
        return obj;
    } catch(e){
        console.error("parseJson:", e);
    }
}


let templateHTML = fs.readFileSync('./template.html', { encoding: 'utf-8' });
let template2HTML = fs.readFileSync('./api.template.html', { encoding: 'utf-8' });

let template = handlebars.compile(templateHTML)
let template2 = handlebars.compile(template2HTML)

app.use('/build', async (req, res) => {
    let u = req.query.l;
    let pare = await got(req.query.l).then((response) => {
        let api = {}
        if(u.indexOf('json') !== -1){
            api = parseJson(response.body);
        } else if(u.indexOf('yaml') !== -1) {
            api = yaml.safeLoad(response.body)
        }
        return api;
    })


    // pare = JSON.parse(fs.readFileSync('./fixtures/petstore.json'));
    // let pare = JSON.parse(fs.readFileSync('./fixtures/wigos.json'));

    resolve(pare).then((solved) => {
        fs.writeFileSync('solved.json', JSON.stringify(solved, null, 4));
        let spec = parser.parseOAS(solved.resolved);
        let allHTML = template(spec);
        spec.apis.forEach((api) => {
            allHTML += template2(api);
        })


        res.send(allHTML);
    })
});


app.use('/', express.static('./static'));



http.listen(port, () => {
})




