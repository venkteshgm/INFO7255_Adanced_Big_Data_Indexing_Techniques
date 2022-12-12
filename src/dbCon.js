let db = {}

const redis = require('redis');
const hash = require('object-hash');


const client = redis.createClient();
client.connect();
client.on('connect', function(){
    console.log('connected to redis db!');
});


db.findEntry = async function(key){
    const value =  await client.hGetAll(key);
    if(value.objectId == key){
        return value;
    }
    else{
        return false;
    }
};

db.findPlanFromReq = async function(params){
    const value =  await this.findEntry(params.planId);
    if(value.objectId == body.objectId){
        return value;
    }
    else{
        return false;
    }
}

db.addPlanFromReq = async function(body){
    const ETag = hash(body);
    await client.hSet(body.objectId, "plan", JSON.stringify(body));
    await client.hSet(body.objectId, "ETag", ETag);
    await client.hSet(body.objectId, "objectId", body.objectId);
    return await this.findEntry(body.objectId);
};

db.deletePlan = async function(params){
    if(await client.del(params.planId)){
        return true;
    }
    else{
        return false;
    }
}

module.exports = db;