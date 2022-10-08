const express = require('express');
const redis = require('redis');
// var validate = require('jsonschema').validate;
// const client = redis.createClient(port, host);


/* connecting to redis db */
const client = redis.createClient();
client.connect();
client.on('connect', function(){
    console.log('connected to redis db!');
});


/* creating Express app */
const port_no = 3000;
const app = express();


/* defining JSON schema for plans */
var Validator = require('jsonschema').Validator;
var validator = new Validator();
const schema = {
    "type": "object",
    "properties":{
        "objectID" : { "type" : "string"},
        "name" : { "type" : "string"},
        "cost" : { "type" : "integer"},
        "deductible" : { "type" : "integer"},
        "co-pay" : { "type" : "integer"},
    },
    required: ['objectID', 'name', 'cost'],
    additionalProperties: false
};

const hash = require('object-hash');

/* parsing incoming JSON request */
const bodyParser = require("body-parser"); // parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false })); // parse application/json 
app.use(express.json());
app.use(bodyParser.json()); //express middleware 
app.use(express.json({ limit: "30mb", extended: true })); 
app.use(express.urlencoded({ limit: "30mb", extended: true }));


/* API endpoints */
app.post('/plans', async (req, res) => {
    console.log("POST: /plans");
    console.log(req.body);
    // req.body = JSON.parse(req.body);
    const isValid = validator.validate(req.body, schema);
    if(isValid.errors.length<1){
        req.body = isValid.instance;
        const value = await client.hGetAll(req.body.objectID);
        if(value.objectID == req.body.objectID){
            res.status(409).json({"message":"item already exists"});
            console.log("item already exists");
            return;
        }
        else{
            const etag = hash(req.body);
            console.log(etag);
            for(const item in req.body){
                await client.hSet(req.body.objectID, item, req.body[item]);  
            }
            await client.hSet(req.body.objectID, "etag", etag);
            res.status(201).json({
                "message":"item added",
                "etag" : etag});
            console.log("item added");
            return;
        }
    }
    else{
        res.status(400).json({"message":"item isn't valid"});
        console.log("item isn't valid");
        return;
    }
});

app.get('/plans/:planId', async (req, res) => {
    console.log("GET: plans/");
    console.log(req.params);
    if(req.params.planId == null && req.params.planId == "" && req.params == {}){
        res.status(400).json({"message":"invalid plan ID"});
        console.log("invalid plan ID");
        return;
    }
    const value = await client.hGetAll(req.params.planId);
    if(value.objectID == req.params.planId){
        res.status(200).json(value);
        console.log("plan found:");
        console.log(value);
        return;
    }
    else{
        res.status(404).json({"message":"plan not found"});
        console.log("plan not found");
        return;
    }
});
app.get('/plans', async(req, res) => {
    console.log("GET: /plans. Invalid request");
    res.status(400).json({"message":"invalid plan ID"});
    console.log("invalid plan ID");
    return;
});

app.delete('/plans/:planId', async(req, res) => {
    console.log("DELETE: /plans");
    console.log(req.params);
    if(req.params.planId == null && req.params.planId == "" && req.params == {}){
        res.status(400).json({"message":"invalid plan ID"});
        return;
    }
    const value = await client.hGetAll(req.params.planId);
    if(value.objectID == req.params.planId){
        console.log("item found");
        console.log(value);
        const delResult = await client.del(req.params.planId);
        if(delResult){
            console.log("item deleted");
            res.status(200).json(value);
        }
        else{
            console.log("item not deleted");
            res.status(500).json({"message":"item not deleted"});
        }
        
        return;
    }
    else{
        res.status(404).json({"message":"plan not found"});
        console.log("plan not found");
        return;
    }
});

app.delete('/plans', async(req, res) => {
    console.log("DELETE: /plans. Invalid request");
    res.status(400).json({"message":"invalid plan ID"});
    return;
});

app.get('/', ( req, res) => {
    res.send('Application works!');
});

app.listen(port_no, () => {
    console.log('Application starting on port ', port_no);
});

client.set('framework', 'ReactJS');

client.exists('framework', function(err, reply){
    if(reply === 1)
        console.log('exists!');
    else
        console.log('doesnt exist');
});