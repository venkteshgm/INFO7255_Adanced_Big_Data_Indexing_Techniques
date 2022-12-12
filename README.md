# INFO7255_Adanced_Big_Data_Indexing_Techniques
Serving as repo for demos/assignments for INFO7255_Adanced_Big_Data_Indexing_Techniques at Northeastern University

Instructions on how to use:  
  
Install redis on windows using the following steps:  
1. Install WSL(Windows Subsystem for Linux)  
2. Launch WSL  
3. Run "sudo apt-get install redis"  
4. Run "sudo service redis-server start". This should start Redis server in the background running on default port 
  
Install and run the NodeJS app:  
1.Download/Clone the repository  
2.navigate to the folder in cmd prompt/terminal  
3.make sure to have node and npm installed  
4.run "npm install" to install all dependencies mentioned in the package.json "dependencies" section and to setup node_modules folder  
5.run "npm start" to run the application on port 3000  


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
Kibana is just a browser based UI and is not necessary for the functioning of elasticsearch  
  
How to install Elasticsearch and Kibana(optional):  
1.In order to use this feature, download the latest versions of elasticsearch and kibana(optional)  
2.extract in directory and navigate to the extracted folders -> bin -> and execute the bat file if windows  
3.first run elasticsearch and let it setup. Once done, it should display password for "elastic" user  
4.if you didn't catch that, stop execution of elasticsearch.bat and run this in the same bin folder:  
  
elasticsearch-reset-password -u elastic  
  
This will reset the password for the user named "elastic" to an auto-generated value and prints it to the console. Copy that  
This password will be used by the node app and should be entered in the src/elastic.js file, line 7  
  
5.Replace the elasticsearch.yml file found in the config folder with the one present in this repos "other files" directory  
Or copy over the same settings  
  
6.Once the zipped Kibana folder is extracted, navigate to the config folder and replace the kibana.yml file with the one  
found in the "other files" folder of this repo  
7.Reset the password for kibana_system using the same command given above and paste it in the kibana.yml file  
8. Run kibana by navigating to the kibana folder - > bin folder -> kibana.bat  
