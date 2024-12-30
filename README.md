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
```
next in terminal make sure to open the mysql shell in the folder

for windows:
```
mysql -u root -p
```

for linux:
```
sudo mysql
```

run the following commands in the specified order.

```
SOURCE create_db.sql
SOURCE insert_data.sql

```

finally exit the mysql shell and run the following commands
```
npm install
node index.js
```

if you want to run the app forever, you will first need to install forever yourself
```
npm install forever -g
```
you can run the following command (NOTE: the app will throw warnings if you run this command, these warnings can be ignored)
```
forever start index.js
```

Here are the following features it has
- login system
- user system
- user are able to be able to see their set up
- user can browse other users and their setup
- user can exchange their melons for money
- website can export data of users through an API
- website uses real world data to influence the rate of melons to money
