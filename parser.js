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

function parseProperties(props, nestedDefinitions, requiredFields){
    props = props || {};
    let propsKeys = Object.keys(props);
    let parsed = [];
    nestedDefinitions = nestedDefinitions || [];
    propsKeys.forEach((property) => {
        let propObj = props[property];
        let reqf = requiredFields || [];
        let propDef = {
            title: property,
            type: propObj.type,
            description: propObj.description,
            required: reqf.indexOf(property) !== -1
        };
        
        if(propObj.type == 'object'){
            propDef.type = propDef.title.capitalize()+'Obj';
            let propertyesNew = parseProperties(propObj.properties, nestedDefinitions, propObj.required).parsed;
            let propObjDef = {
                title: propDef.type,
                nestedObj: true,
                properties: propertyesNew
            }
            nestedDefinitions.push(propObjDef);
            // parsed.push(propObjDef);
        }

        let noModel = ['string', 'integer', 'number'];
        if(propObj.type == 'array'){
            
            if(noModel.indexOf(propObj.items.type) !== -1){
                propDef.type = 'Array['+ propObj.items.type + ']';                
            } else {
                propDef.type = 'Array['+ propDef.title.capitalize()+'Item' + ']';
                let propertyesNew = parseProperties(propObj.items.properties, nestedDefinitions, propObj.items.required).parsed;
                let propObjDef = {
                    title: propDef.title.capitalize()+'Item',
                    properties: propertyesNew
                }
                nestedDefinitions.push(propObjDef);
            }
            // parsed.push(propObjDef);
        }
        
        parsed.push(propDef);
    });
    return {
        parsed, 
        nestedDefinitions
    }
}

function parseSchema(schema){

    if(schema.schema){
        if(schema.schema.type == 'array'){
            if(!schema.schema) return;
            return { 
                type: 'array, '+(schema.required?'Required':'Optional'),
                properties:  parseSchema(schema.schema.items).properties
            }
        } else {
            return parseSchema(schema.schema);
        }
    }

    if(!schema.type) return null;

    
    return {
        title: schema.title,
        type: schema.type,
        description: schema.description,
        properties: parseProperties(schema.properties, null, schema.required)
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
    let errorExamples = getPropertySecure(api, 'responses', '400', 'content', 'application/json', 'examples');

    Object.keys(examples).forEach((ex) => {
        exArr.push({
            title: '[HTTP 200] '+ ex,
            json: JSON.stringify(examples[ex].value, null, 4)
        })
    });

    Object.keys(errorExamples).forEach((ex) => {
        exArr.push({
            title: '[HTTP 400] '+ ex,
            json: JSON.stringify(errorExamples[ex].value, null, 4)
        })
    });

    
    return exArr;
}


// function getBodySchemaFromParameters(parameters){
//     if(!parameters) return null;
//     console.log('parameters :', parameters);
//     let bodyObj = parameters.find((p) => p.in == 'body');
//     if(!bodyObj) return null;
//     return parseSchema(bodyObj.schema);
// }

function parseApi(apiRoot, endpoint) {
    api = apiRoot[endpoint];
    let methods = Object.keys(api);
    let apisParsed = [];

    methods.forEach((method) => {
        let singleApi = api[method];
        // console.log('singleApi :', singleApi);
        let bodySchema = getPropertySecure(singleApi, 'requestBody', 'content', 'application/json', 'schema');
        let bodyResponse = getPropertySecure(singleApi, 'responses', '200', 'content', 'application/json', 'schema');

        const pathParams = singleApi.parameters.filter((p) => p.in == 'path');
        const queryParams = singleApi.parameters.filter((p) => p.in == 'query');
        const headerParams = singleApi.parameters.filter((p) => p.in == 'header');
        const formDataParams = singleApi.parameters.filter((p) => p.in == 'formData');

        // Swagger 2.0 support
        if(!bodySchema.type){
            const bodyParams = singleApi.parameters.filter((p) => p.in == 'body');
            if(bodyParams.length > 0){
                bodySchema = bodyParams[0];
            }            
        }

        // Swagger 2.0 support
        if(!bodyResponse.type){
            const responses = singleApi.responses;
            const response200 = responses['200'];
            if(response200){
                bodyResponse = response200;
            }
        }
        console.log('endpoint :', endpoint);

        // console.log('bodySchema :', JSON.stringify(bodySchema));
        // let parameters = getPropertySecure(singleApi, 'parameters');
        let requestExamples = getRequestExamples(singleApi);
        responseExamples = getResponseExamples(singleApi);
        let dest = {
            endpoint: endpoint,
            method: method,
            summary: singleApi.summary,
            depercated: singleApi.deprecated,
            operationId: singleApi.operationId,
            description: singleApi.description,
            tags: singleApi.tags,
            requestSchema: parseSchema(bodySchema), //|| getBodySchemaFromParameters(parameters),
            responseSchema: parseSchema(bodyResponse),
            requestExamples: requestExamples,
            responseExamples: responseExamples,
            pathParams,
            queryParams,
            headerParams,
            formDataParams
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