# create db
CREATE DATABASE IF NOT EXISTS melon_trade;
USE melon_trade;

# create the tables

-- -----------------------------------------------------
-- Table users
-- -----------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT primary key NOT NULL,
    email VARCHAR(40), 
    username VARCHAR(14),
    isAdmin BOOL DEFAULT FALSE, 
    password VARCHAR(70),
    purse DECIMAL(20,2) unsigned DEFAULT 100,
    melons int unsigned DEFAULT 0,
    land int unsigned DEFAULT 100,
    cycles int unsigned DEFAULT 0);

-- -----------------------------------------------------
-- Table items
-- -----------------------------------------------------

CREATE TABLE IF NOT EXISTS items (
    id INT AUTO_INCREMENT primary key NOT NULL, 
    name VARCHAR(40), 
    growth_rate DECIMAL(5,2) DEFAULT 0, 
    price DECIMAL(10,2) unsigned DEFAULT 1);

-- -----------------------------------------------------
-- Table machines
-- -----------------------------------------------------

CREATE TABLE IF NOT EXISTS machines (
    id int auto_increment primary key not null, 
    name varchar(40), 
    farm_rate int default 0, 
    fuel int default 1, 
    price decimal(10,2) unsigned default 1);

-- -----------------------------------------------------
-- Table items_users
-- -----------------------------------------------------

CREATE TABLE IF NOT EXISTS items_users (
    id INT AUTO_INCREMENT primary key NOT NULL,
    user_id INT, 
    item_id INT);

-- -----------------------------------------------------
-- Table machines_users
-- -----------------------------------------------------

CREATE TABLE IF NOT EXISTS machines_users (    
    id INT AUTO_INCREMENT primary key NOT NULL,
    user_id INT, 
    machine_id INT);

# create the app user
# CREATE USER IF NOT EXISTS 'melon_app'@'localhost' IDENTIFIED BY writeyourownpassword; 
GRANT ALL PRIVILEGES ON melon_trade.* TO 'melon_app'@'localhost';