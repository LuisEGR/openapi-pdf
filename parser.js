String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

function getPropertySecure(obj, ...args) {
    return args.reduce((obj, level) => obj && obj[level], obj) || {}
}


function parseOAS(oas) {
    let apis = [];
    Object.keys(oas.paths).forEach((endp) => {
        let parsd = parseApi(oas.paths, endp);
        apis = [...apis, ...parsd];
    });

    return {
        title: getPropertySecure(oas, 'info', 'title'),
        version: getPropertySecure(oas, 'info', 'version'),
        apis: apis
    }
}

function parseProperties(props, nestedDefinitions){
    props = props || {};
    let propsKeys = Object.keys(props);
    let parsed = [];
    nestedDefinitions = nestedDefinitions || [];
    propsKeys.forEach((property) => {
        let propObj = props[property];
        let propDef = {
            title: property,
            type: propObj.type,
            description: propObj.description
        };
        
        // console.log("property:", propObj);
        if(propObj.type == 'object'){
            propDef.type = propDef.title.capitalize()+'Obj';
            let propertyesNew = parseProperties(propObj.properties, nestedDefinitions).parsed;
            console.log("propertyesNew:", propertyesNew);
            let propObjDef = {
                title: propDef.type,
                nestedObj: true,
                properties: propertyesNew
            }
            nestedDefinitions.push(propObjDef);
            // parsed.push(propObjDef);
        }

        if(propObj.type == 'array'){
            propDef.type = 'Array['+ propDef.title.capitalize()+'Obj' + ']';
            let propertyesNew = parseProperties(propObj.items.properties, nestedDefinitions).parsed;
            console.log("propertyesNew:", propertyesNew);
            let propObjDef = {
                title: propDef.title.capitalize()+'Obj',
                properties: propertyesNew
            }
            nestedDefinitions.push(propObjDef);
            // parsed.push(propObjDef);
        }
        
        parsed.push(propDef);
    });
    console.log("nestedDefinitions:", JSON.stringify(nestedDefinitions, null, 2));
    return {
        parsed, 
        nestedDefinitions
    }
}

function parseSchema(schema){
    // console.log("schema:", schema);
    return {
        title: schema.title,
        type: schema.type,
        description: schema.description,
        properties: parseProperties(schema.properties)
    };

}

function getRequestExamples(api){
    let exArr = [];
    let examples = getPropertySecure(api, 'requestBody', 'content', 'application/json', 'examples');
    Object.keys(examples).forEach((ex) => {
        exArr.push({
            title: ex,
            json: JSON.stringify(examples[ex].value, null, 4)
        })
    });
    return exArr;
}

function getResponseExamples(api){
    let exArr = [];
    let examples = getPropertySecure(api, 'responses', '200', 'content', 'application/json', 'examples');
    Object.keys(examples).forEach((ex) => {
        exArr.push({
            title: ex,
            json: JSON.stringify(examples[ex].value, null, 4)
        })
    });
    return exArr;
}

function parseApi(apiRoot, endpoint) {
    api = apiRoot[endpoint];
    let methods = Object.keys(api);
    let apisParsed = [];
    console.log("methods:", methods);
    console.log("api:", api);

    methods.forEach((method) => {
        let singleApi = api[method];
        let bodySchema = getPropertySecure(singleApi, 'requestBody', 'content', 'application/json', 'schema');
        let bodyResponse = getPropertySecure(singleApi, 'responses', '200', 'content', 'application/json', 'schema');
        let requestExamples = getRequestExamples(singleApi);
        responseExamples = getResponseExamples(singleApi);
        // console.log("bodySchema:", bodySchema);
        let dest = {
            endpoint: endpoint,
            method: method,
            summary: singleApi.summary,
            operationId: api.operationId,
            description: singleApi.description,
            tags: singleApi.tags,
            requestSchema: parseSchema(bodySchema),
            responseSchema: parseSchema(bodyResponse),
            requestExamples: requestExamples,
            responseExamples: responseExamples
        }
        apisParsed.push(dest);
    });
    return apisParsed;
}

function parse() {

    let dest = {
        endpoint: apis[0],
        method: methods[0],
        description: api.description,
        operationId: api.operationId,
        // request: requestSchema,
        // response: responseSchema,
        requestExample: JSON.stringify(requestExample, null, 4),
        responseExamples: responseExamples
    }
}




module.exports = {
    parseApi,
    parseOAS
};