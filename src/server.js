const express = require('express');
const redis = require('redis');
const authe = require('./authe');
const token = authe.keygen();
console.log(authe.authenticate(token));


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
const Validator = require('jsonschema').Validator;
var validator = new Validator();
const schemaData = require('fs').readFileSync('Json-Schema.json');
const schema = JSON.parse(schemaData);
const hash = require('object-hash');

/* parsing incoming JSON request */
const bodyParser = require("body-parser"); // parse application/x-www-form-urlencoded
// const auth = require('auth');
app.use(bodyParser.urlencoded({ extended: false })); // parse application/json 
app.use(express.json());
app.use(bodyParser.json()); //express middleware 
app.use(express.json({ limit: "30mb", extended: true })); 
app.use(express.urlencoded({ limit: "30mb", extended: true }));


/* API endpoints */
app.post('/plans', async (req, res) => {
    console.log("POST: /plans");
    console.log(req.body);
    if(!authe.validateToken(req)){
        res.status(400).json({message:"wrong bearer token/format"});
        return;
    }
    const isValid = validator.validate(req.body, schema);
    if(isValid.errors.length<1){
        req.body = isValid.instance;
        const value = await client.hGetAll(req.body.objectId);
        if(value.objectId == req.body.objectId){
            res.setHeader("ETag", value.ETag).status(409).json({"message":"item already exists"});
            console.log("item already exists");
            return;
        }
        else{
            const ETag = hash(req.body);
            console.log(ETag);
            await client.hSet(req.body.objectId, "plan", JSON.stringify(req.body));
            await client.hSet(req.body.objectId, "ETag", ETag);
            await client.hSet(req.body.objectId, "objectId", req.body.objectId);
            res.setHeader("ETag", ETag).status(201).json({
                "message":"item added",
                "ETag" : ETag});
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
    if(!authe.validateToken(req)){
        res.status(400).json({message:"wrong bearer token/format"});
        return;
    }
    console.log(req.headers['if-none-match']);
    if(req.params.planId == null && req.params.planId == "" && req.params == {}){
        res.status(400).json({"message":"invalid plan ID"});
        console.log("invalid plan ID");
        return;
    }
    const value = await client.hGetAll(req.params.planId);
    if(value.objectId == req.params.planId){
        if(req.headers['if-none-match'] && value.ETag == req.headers['if-none-match']){
            res.setHeader("ETag", value.ETag).status(304).json({
                "message" : "plan unchanged",
                "plan" : JSON.parse(value.plan)
            });
            console.log("plan found unchanged:");
            console.log(JSON.parse(value.plan));
            return;
        }
        else{
            res.setHeader("ETag", value.ETag).status(200).json(JSON.parse(value.plan));
            console.log("plan found changed:");
            console.log(JSON.parse(value.plan));
            return;
        }
    }
    else{
        res.status(404).json({"message":"plan not found"});
        console.log("plan not found");
        return;
    }
});

app.patch('/plans/:planId', async (req, res) => {
    console.log("PATCH: plans/");
    console.log(req.params);
    if(!authe.validateToken(req)){
        res.status(400).json({message:"wrong bearer token/format"});
        return;
    }
    if(req.params.planId == null && req.params.planId == "" && req.params == {}){
        res.status(400).json({"message":"invalid plan ID"});
        console.log("invalid plan ID");
        return;
    }
    const ETag = hash(req.body);
    const value = await client.hGetAll(req.params.planId);
    if(value.objectId == req.params.planId){
        if(req.headers['if-match'] || value.ETag == req.headers['if-match']){
            res.setHeader("ETag", value.ETag).status(412).json(JSON.parse(value.plan));
            console.log("plan found unchanged:");
            console.log(JSON.parse(value.plan));
            return;
        }
        else{
            await client.hSet(req.body.objectId, "plan", JSON.stringify(req.body));
            await client.hSet(req.body.objectId, "ETag", ETag);
            res.setHeader("ETag", ETag).status(201).json(JSON.parse(value.plan));
        }
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
    if(!authe.validateToken(req)){
        res.status(400).json({message:"wrong bearer token/format"});
        return;
    }
    if(req.params.planId == null && req.params.planId == "" && req.params == {}){
        res.status(400).json({"message":"invalid plan ID"});
        return;
    }
    const value = await client.hGetAll(req.params.planId);
    if(value.objectId == req.params.planId){
        console.log("item found");
        console.log(JSON.parse(value.plan));
        const delResult = await client.del(req.params.planId);
        if(delResult){
            console.log("item deleted");
            res.status(200).json(JSON.parse(value.plan));
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

app.get('/getToken', async(req, res) => {
    const token = authe.keygen();
    // console.log(authe.authenticate(token));
    res.status(200).json({
        'message': 'SUCCESS!',
        'token' : token
    });
});

app.post('/validateToken', async(req, res) => {
    validity = authe.validateToken(req);
    if(validity){
        res.status(200).json({message: "TOKEN VALID!"});
        return;
    }
    else{
        res.status(400).json({message:"wrong bearer token/format"});
        return;
    }
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