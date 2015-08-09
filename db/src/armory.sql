CREATE DATABASE IF NOT EXISTS armory;

USE armory;

# note this might not be needed with sequelize ORM.

CREATE TABLE IF NOT EXISTS users
	(
		id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
		email CHAR(200) NOT NULL,
		alias CHAR(23) NOT NULL,
		password_hashnsalt VARCHAR(1000) NOT NULL,
		gw2_token VARCHAR(1000),
		gw2_token_active TINYINT(1)
	);

CREATE TABLE IF NOT EXISTS characters
	(
		name CHAR NOT NULL PRIMARY KEY,
		user_id INT NOT NULL,
		CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users(id)
	);