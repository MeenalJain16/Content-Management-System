
<h2>Real-time Collaborative Web Content management System</h2>

Installation Guidelines:

If you don't have Node installed, then download Node 4.2.3 from the link: https://nodejs.org/en/download/ 

The easiest way to get started with this project is:


1. Go to location where the directory is located from node command prompt.

   E.g. cd myproject
   
   
2. Install NPM Dependencies using:

   npm install
   
3. Run the application using:

   node server.js

Other Dependencies:

The database used in this project is MySQL Workbench. So, you need to create a table and update connection details in config/passport.js. Also, redis-server 2.4.2 must be running at the server in order to provide collaborative environment.
   


