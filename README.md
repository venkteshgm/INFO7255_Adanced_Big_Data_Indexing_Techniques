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

ElasticSearch is used to form mapping between plans and their nested objects  
In order to use this feature, download the latest versions of elasticsearch and kibana(optional)  
extract in directory and navigate to the extracted folders -> bin -> and execute the bat file if windows  
first run elasticsearch and let it setup. Once done, it should display password for "elastic" user  
if you didn't catch that, stop execution of elasticsearch.bat and run this in the same bin folder:  
  
elasticsearch-reset-password -u elastic  
  
This will reset the password for the user named "elastic" to an auto-generated value and prints it to the console. Copy that  
This password will be used by the node app and should be entered in the src/elastic.js file, line 7

Replace the elasticsearch.yml file found in the config folder with the one present in this repos "other files" directory  
Or copy over the same settings  

Once the zipped Kibana folder is extracted, navigate to the config folder and replace the kibana.yml file with the one  
found in the "other files" folder of this repo  
Reset the password for kibana_system using the same command given above and paste it in the kibana.yml file  
