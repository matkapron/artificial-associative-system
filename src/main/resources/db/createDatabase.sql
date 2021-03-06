
# Create USER table
CREATE TABLE kapmat.USERS
(
  id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  login TEXT NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL
);
CREATE UNIQUE INDEX USERS_id_uindex ON kapmat.USERS (id);
CREATE UNIQUE INDEX USERS_login_uindex ON kapmat.USERS (login);

ALTER TABLE  `USERS` ENGINE = INNODB;

# Create SENTENCE table
CREATE TABLE kapmat.SENTENCES
(
  id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  text TEXT NOT NULL,
  language VARCHAR(5) NOT NULL
);
CREATE UNIQUE INDEX SENTENCES_id_uindex ON kapmat.SENTENCES (id);