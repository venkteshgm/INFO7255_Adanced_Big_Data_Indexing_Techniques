const express = require('express');
const redis = require('redis');
const authe = require('./authe');
const schema = require('./schema');




/* creating Express app */
const port_no = 3000;
const app = express();

// const elasticS = require('./elastic');
// elasticS.search();

/* parsing incoming JSON request */
const bodyParser = require("body-parser"); // parse application/x-www-form-urlencoded
const db = require('./dbCon');
app.use(bodyParser.urlencoded({ extended: false })); // parse application/json 
app.use(express.json());
app.use(bodyParser.json()); //express middleware 
app.use(express.json({ limit: "30mb", extended: true })); 
app.use(express.urlencoded({ limit: "30mb", extended: true }));

const elastic = require('./elastic');


/* API endpoints */
app.post('/plans', async (req, res) => {
    console.log("POST: /plans");
    // console.log(req.body);
    if(!authe.validateToken(req)){
        res.status(400).json({message:"wrong bearer token/format"});
        return;
    }
    if(schema.validator(req.body)){
        const value = await db.findEntry(req.body.objectId);
        if(value){
            res.setHeader("ETag", value.ETag).status(409).json({"message":"item already exists"});
            console.log("item already exists");
            return;
        }
        else{
            const ETag = (await db.addPlanFromReq(req.body)).ETag;
            await elastic.enter(req.body, req.body.objectId, null, "plan");
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
    const value = await db.findEntry(req.params.planId);
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
    if(!schema.validator(req.body)){
        res.status(400).json({"message":"item isn't valid"});
        console.log("item isn't valid");
        return;
    }
    const value = await db.findEntry(req.params.planId);
    if(value.objectId == req.params.planId){
        const ETag = value.ETag;
        if((!req.headers['if-match'] || ETag != req.headers['if-match']) || (schema.hash(req.body) == ETag)){
            res.setHeader("ETag", ETag).status(412).json(JSON.parse(value.plan));
            console.log("get updated ETag/plan received is unmodified");
            console.log(JSON.parse(value.plan));
            return;
        }
        else{
            const value = await db.addPlanFromReq(req.body);
            await elastic.deleteNested(req.params.planId, "plan");
            await elastic.enter(req.body, req.params.planId, null, "plan");
            // console.log(value);
            res.setHeader("ETag", value.ETag).status(201).json(JSON.parse(value.plan));
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
    const value = await db.findEntry(req.params.planId);
    if(value.objectId == req.params.planId){
        console.log("item found");
        console.log(JSON.parse(value.plan));
        if(db.deletePlan(req.params)){
            await elastic.deleteNested(req.params.planId, "plan");
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

app.get('/', async ( req, res) => {
    await elastic.deleteNested('12xvxc345ssdsds-508',"plan");
    res.send('Application works!');
    // elastic.client.deleteByQuery({
    //     'index' :'my-index',
    //     'q' : JSON.stringify({match_all:{}})});
        // 'q' : '{match_all:{}}'});
});

app.listen(port_no, () => {
    console.log('Application starting on port ', port_no);
});
