Prerequisites:

1) Since making AJAX requests are asynchronous you need to know a little about the working of Javascript.
Its asynchronous so you need to learn about promises
2) You need to install NODE JS to run this prototype. I suggest you install node and run the prototype,
 so that you can see the working of this app and the backend. 
3) We must use some templating engine to serve files as you are using only HTML, CSS and JS for front end.
 So, since I knew ejs I just made a starter files for the project so that you and your team can understand
 how to use it.
4) Run the below scripts in your local mysql db to get started:

create database courseDetails;
create table users (id int auto_increment primary key, user_name varchar(30), password varchar(60), email varchar(60) unique, type bit);

These two commands must be run before you start the app else you would get an error

the .then() and .catch() is what are called a promises, you can learn it here https://www.youtube.com/watch?v=DHvZLI7Db8E

STEPS TO RUN THE PROJECT:

1) First you should have installed NODE JS to run the project, so make sure that you install 
 it here: https://nodejs.org/en/download/.
 Install the LTS version and the .msi file.
2) Then you need to go to folder where you have unzipped the project and open the cmd and run the command: npm i,
 to install all the dependencies for the project.
 Here: https://www.codegrepper.com/code-examples/shell/how+to+install+all+the+dependencies+in+package.json
3) Then you have to take a look at the environment variable in the folder Config>.env file. Head there and 
 change the db settings. You may have to change only the DB_PASSWORD as you possibly may have another password than mine.
 If you are not using root user then you can also change the DB_USER too.
4) Then install nodemon and run the project. Here: https://www.youtube.com/watch?v=4N0d8HhU5DE
5) Once you have started the app visit: https://localhost:3000/

FOLDERS:

This section is about the folders

1) The cert folder has the temporary SSL certificate, we dont want to tweak it until we deploy.
2) The Config folder has configuration for .env and session configuration.
3) The node_modules folder is where all the dependencies reside. npm i command is used to install dependencies.
4) The public folder has some static assets like static css, js files and images which can be used in the html 
 files for usage.
5) The Routes folder has a universal route handling file route.js. 
( This is concerning the backend so I dont you changing it witout knowing about it )
6) The Services folder has some functions which are used for DB Services and middlewares.
7) The Utilities folder has some functions to generate a hash for storing passwords.
8) The views folders has all the ejs files that are served when we request for it.
9) The index.js file is the entry point for this app so removing it would make this entire project unusable.
10) The package.json has the meta regarding the packages downloaded for this project, deleting this also would 
 make the project obselete.

A WORD OF WARNING, WHILE SHARING THE NODE PROJECTS YOU SHOULD NOT SEND THE node_modules FOLDER WITH IT.