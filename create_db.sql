# create db
CREATE DATABASE IF NOT EXISTS melon_trade;
USE melon_trade;

# create the tables
CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT primary key NOT NULL, email VARCHAR(40), username VARCHAR(14), isAdmin BOOL DEFAULT FALSE, password VARCHAR(70));

# create the app user
CREATE USER IF NOT EXISTS 'melon_app'@'localhost' IDENTIFIED BY 'skibidi'; 
GRANT ALL PRIVILEGES ON melon_trade.* TO 'melon_app'@'localhost';