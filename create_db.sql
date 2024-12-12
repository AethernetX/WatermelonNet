# create db
CREATE DATABASE IF NOT EXISTS melon_trade;
USE melon_trade;

# create the tables
CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT primary key NOT NULL, email VARCHAR(40), username VARCHAR(14), isAdmin BOOL DEFAULT FALSE, password VARCHAR(70), purse DECIMAL(5,2) unsigned DEFAULT 100, melons int unsigned DEFAULT 0, land int unsigned DEFAULT 100, cycles int unsigned DEFAULT 0);

CREATE TABLE IF NOT EXISTS items (id INT AUTO_INCREMENT primary key NOT NULL, name VARCHAR(40), growth DECIMAL DEFAULT 0, farm rate INT DEFAULT 0, price DECIMAL(5,2) unsigned DEFAULT 1);



# create the app user
CREATE USER IF NOT EXISTS 'melon_app'@'localhost' IDENTIFIED BY 'skibidi'; 
GRANT ALL PRIVILEGES ON melon_trade.* TO 'melon_app'@'localhost';