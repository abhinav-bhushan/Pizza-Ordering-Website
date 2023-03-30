create table user_login(user_id SERIAL,username VARCHAR(255) NOT NULL PRIMARY KEY,password VARCHAR(255) NOT NULL,mobile bigint,email VARCHAR(255) NOT NULL);
create table pizza(pizza_id SERIAL PRIMARY KEY,pizza VARCHAR,price int,type VARCHAR,topping VARCHAR,size VARCHAR,FOREIGN KEY(size) references size(size));
create table orders_table(username VARCHAR NOT NULL,pizza_id int NOT NULL,topping_id int NOT NULL,FOREIGN KEY(username) references user_login(username),FOREIGN KEY(pizza_id) references pizza(pizza_id),FOREIGN KEY(topping_id) references topping_id(topping_id),FOREIGN KEY(size) references size(size));
create table topping_id(topping_id SERIAL PRIMARY KEY,topping VARCHAR)
create table size(size VARCHAR PRIMARY KEY);

select * from pizza;

insert into topping_id values(1,'cheese and fresh vegetables',50);
insert into topping_id values(2,'paneer,cheese and fresh vegetables',60);
insert into topping_id values(3,'fresh vegetables and cheese',50);
insert into topping_id values(4,'chicken barbeques loaded',70);

insert into topping_id values(5,'chicken pieces loaded',70);
insert into topping_id values(6,'cheese and corn',40);
insert into topping_id values(7,'bone less chicken loaded',80);
insert into topping_id values(8,'mac and cheese',70);
insert into topping_id values(9,'chicken and mutton loaded',40);

select * from user_login inner join orders_table;

 select u.username,sum(p.price)+sum(t.topping_price) as total_price from user_login u inner join orders_table o on u.username=o.username inner join topping_id t on o.topping_id=t.topping_id inner join pizza p on p.pizza_id=o.pizza_id where u.username='Abhinav' group by u.username;








