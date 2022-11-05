# INFO7255_Adanced_Big_Data_Indexing_Techniques
Serving as repo for demos/assignments for INFO7255_Adanced_Big_Data_Indexing_Techniques at Northeastern University

Instructions on how to use:  
Download/Clone the repository  
navigate to the folder in cmd prompt/terminal  
make sure to have node and npm installed  
run "npm install" to install all dependencies mentioned in the package.json "dependencies" section and to setup node_modules folder  
run "npm start" to run the application on port 3000  


There are 6 endpoints specified at present:  
GET: http://localhost:3000/getToken -> returns a RS256 bearer token that expires in 1hr  
  
POST: http://localhost:3000/validateToken -> informs validity of bearer token  
  
POST: http://localhost:3000/plans -> this accepts a medical insurance plan whose schema is specified in the src/server.js file  
If an object with the same ObjectID exists within the redis server, or if there is incorrect schema, no object is created in the DB  
  
GET: http://localhost:3000/plans/ -> this returns medical plan object of ObjectID specified in the request URL after plans/ if exists in the DB  
  
DELETE: http://localhost:3000/plans/ -> this deletes a medical plan object of ObjectID specified in the request URL after plans/ if exists in the DB  
  
PATCH: http://localhost:3000/plans/ -> this updates medical plan object of ObjectID specified in the request URL after plans/ if  
  -> plan exists in db  
  -> header has If-Match attribute  
  -> header If-Match ETag matches ETag of object  
  -> plan in request body is different from plan in db  