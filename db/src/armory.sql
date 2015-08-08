CREATE DATABASE IF NOT EXISTS armory;

USE armory;

CREATE TABLE IF NOT EXISTS users
	(
		id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
		email CHAR(200) NOT NULL,
		alias CHAR(23) NOT NULL,
		password_hashnsalt CHAR NOT NULL,
		gw2_token CHAR,
		gw2_token_active TINYINT(1)
	);

CREATE TABLE IF NOT EXISTS characters
	(
		cd ..
		
	);