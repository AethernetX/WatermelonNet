# WatermelonNet

## to set up

uncomment the second last line in the create_db.sql file and write your own password for the database
```
# CREATE USER IF NOT EXISTS 'melon_app'@'localhost' IDENTIFIED BY writeyourownpassword; 
```
you also need to create a .env file in the root directory. Make sure to write the following

```
DB_PASSWORD="[Put the same password you gave in the create db file]"
SESSION_SECRET="[Put a password for the session of your app]"

next in terminal make sure to open the mysql shell in the folder and run the following commands in the specified order.

```
SOURCE create_db.sql
SOURCE insert_data.sql

```

finally exit the mysql shell and run the following commands
```
npm install
node index.js
```

requirements
- need a login system
- need a user system
- user needs to be able to see their set up
- user can browse other users and their setup
- user can invest in stock and / or sell stock
- website can export data of users through an API
- website will use real world data to influence the rate of production



- A new user must be able to register
- The user must be able to login and logout
- There should be a home page with links to other pages
- There should be an about page
- There should be some search functionality with searches against the database
- The application must provide an API to access its data
- The application must access data from a publicly available API
- The application must store some data in a database (MySQL)
