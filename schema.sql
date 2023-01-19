create database coursedetails;
use courseDetails;

drop database courseDetails;
select * from user_data;

CREATE TABLE user_data(
	id int auto_increment,
    email varchar(30) NOT NULL unique,
    password varchar(250) NOT NULL,
    first_name varchar(30) NOT NULL,
    last_name varchar(30) NOT NULL,
    dept char(10) NOT NULL,
    type int NOT NULL,
    PRIMARY KEY(id)
);-- if student ---> 0 else if teacher 1


CREATE TABLE student(
    email varchar(30) NOT NULL,
    rollno char(10) NOT NULL UNIQUE,
    sem int unsigned NOT NULL,
	hasEnrolled bit NOT NULL default 0,
    FOREIGN KEY(email) REFERENCES user_data(email),
    PRIMARY KEY(email)
);

DELIMITER // 
CREATE PROCEDURE `AddUser`(IN `email1` VARCHAR(30), IN `password1` VARCHAR(250), IN `firstname` VARCHAR(30), IN `lastname` VARCHAR(30), IN `depart` CHAR(10), IN `studtype` INT, IN `rollno1` CHAR(10), IN `sem` INT) 
NOT DETERMINISTIC NO SQL SQL SECURITY DEFINER BEGIN 
IF studtype =0 THEN 
INSERT INTO `user_data`(`email`, `password`, `first_name`, `last_name`, `dept`, `type`) VALUES (email1,password1,firstname,lastname,depart,studtype); 
INSERT INTO `student`(`email`, `rollno`,`sem`) VALUES (email1,rollno1,sem); 
ELSE 
INSERT INTO `user_data`(`email`, `password`, `first_name`, `last_name`, `dept`, `type`) VALUES (email1,password1,firstname,lastname,depart,studtype); 
END IF; 
END;
//
DELIMITER ;

create table course_for_department(id int not null,department char(5) not null,PRIMARY KEY(id,department));
drop table courses_table;
drop table student_enrollment_details;
create table courses_table(
	id int auto_increment primary key,
	course_name varchar(40) not null,
	course_id char(10) not null default 'NA',
	about varchar(5000),
	credits int,
	fees float,
	handling_staff_email varchar(25),
    staff_type bit NOT NULL, -- if internal 0 else 1
    count int NOT NULL,
    currentCount int NOT NULL default 0,
	sem int,
	duration float,
    isactive int,
    course_year year,
	foreign key(handling_staff_email) references user_data(email),
    check(credits <=3 and credits >=1 and sem>=1 and sem<=9 and count>=0)
);

drop table student_enrollment_details;
drop table courses_table;
select * from student_enrollment_details;
select * from courses_table;
create table student_enrollment_details(
email varchar(30) not null,
id int not null,
sem int not null,
credits_earned int(3),
PRIMARY key(email,sem),
FOREIGN key(email) REFERENCES user_data(email),
FOREIGN key(id) references courses_table(id)
);

DELIMITER // 
CREATE PROCEDURE `enrollStudent`(IN `email1` VARCHAR(30), IN `courseid` VARCHAR(10), IN `sem1` INT) 
NOT DETERMINISTIC NO SQL SQL SECURITY DEFINER BEGIN 
DECLARE cid INT DEFAULT -1;
select id into cid from courses_table where course_id = courseid;
insert into student_enrollment_details(email,id,sem,credits_earned) values(email1,cid,sem1,0);
update courses_table set currentCount = currentCount + 1 where course_id = courseid;
update student set hasEnrolled = 1 where email = email1;
END;
//
DELIMITER ;

select * from courses_table;
select * from user_data;

create table forgetPassword(
	email varchar(30) primary key ,
    foreign key(email) references user_data(email),
    stamp datetime default current_timestamp
);

select * from forgetPassword;

select email from forgetPassword where timestampdiff(minute,stamp,current_timestamp)<15 and email = 'akashm.19cse@kongu.edu';

DELIMITER //
CREATE PROCEDURE `FORGOTPASSWORD`(IN `email1` VARCHAR(30)) 
NOT DETERMINISTIC NO SQL SQL SECURITY DEFINER BEGIN 
delete from forgetPassword where timestampdiff(minute,stamp,current_timestamp) >=15;
IF EXISTS (SELECT * FROM forgetPassword WHERE email = email1) THEN
    update forgetpassword set stamp = current_timestamp where email = email1;
ELSE
   insert into forgetpassword(email) values(email1);
END IF;
END;
// 
DELIMITER ;

select * from user_data;

select * from forgetpassword;

DELIMITER //
CREATE PROCEDURE `CHANGEPASSWORD`(IN `email1` VARCHAR(30),IN `password1` VARCHAR(250)) 
NOT DETERMINISTIC NO SQL SQL SECURITY DEFINER BEGIN 
update user_data set password = password1 where email = email1;
delete from forgetpassword where (email = email1) or (timestampdiff(minute,stamp,current_timestamp) > 15);
END;
// 
DELIMITER ;

select * from forgetpassword where email = 'akashm.19cse@kongu.edu' or timestampdiff(minute,stamp,current_timestamp) > 15;

select * from user_data;
update user_data set password = '8940427673' where email = 'akashm.19cse@kongu.edu';delete from forgetpassword where (email = 'akashm.19cse@kongu.edu') or (timestampdiff(minute,stamp,current_timestamp) > 15);

select email,sum(credits_earned) from student_enrollment_details where email = 'akashm.19cse@kongu.edu' group by email;

delete from forgetpassword where (timestampdiff(minute,stamp,current_timestamp) > 15);

select * from user_data;
select * from forgetpassword;

select * from student_enrollment_details;