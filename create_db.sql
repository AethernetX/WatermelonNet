# create db
CREATE DATABASE IF NOT EXISTS melon_trade;

# create the app user
CREATE USER IF NOT EXISTS 'melon_app'@'localhost' IDENTIFIED BY 'skibidi'; 
GRANT ALL PRIVILEGES ON melon_trade.* TO ' melon_app'@'localhost';