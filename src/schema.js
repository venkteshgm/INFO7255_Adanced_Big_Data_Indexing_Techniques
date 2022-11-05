let schema = {}
const Validator = require('jsonschema').Validator;
var validator = new Validator();
const schemaData = require('fs').readFileSync('Json-Schema.json');
const jsonSchema = JSON.parse(schemaData);

schema.validator = function(reqBody){
    if(validator.validate(reqBody, jsonSchema).errors.length<1){
        return true;
    }
    else{
        return false;
    }
}

schema.hash = require('object-hash');

module.exports = schema;