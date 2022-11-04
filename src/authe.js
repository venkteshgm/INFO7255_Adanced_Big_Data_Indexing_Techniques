let authorization = {}
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const auth = require('basic-auth');
var privKey = crypto.randomBytes(64).toString('hex');
authorization.keygen = function(){
    var rand = crypto.randomBytes(64).toString('hex');
    var token = jwt.sign({data:rand}, privKey,{ expiresIn: '1h'});
    return token
};
authorization.authenticate = function(token){
    var decoded = jwt.verify(token, privKey);
    try {
        var decoded = jwt.verify(token, privKey);
      } catch(err) {
        return false;
      }
      return true;
};
authorization.validateToken = function(req){
    try{
        this.authenticate(req.headers.authorization.split(" ")[1]);
    }catch(err){
        // console.log("wrong bearer token");
        // res.status(400).json({
        //     message:"wrong bearer token/format"
        // });
        // return;
        return false;
    }
    return true;
}

authorization.auth = auth;
module.exports = authorization;