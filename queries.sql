select rollno, concat(first_name, ' ', last_name) as name, courses_table.credits from student_enrollment_details 
inner join student on student_enrollment_details.email = student.email 
inner join user_data on student.email = user_data.email 
left join courses_table on courses_table.id = student_enrollment_details.id and courses_table.course_id = '123123';

call enrollStudent('akash@kongu.edu','19CST042',5);

insert into courses_table(course_name,course_id,about,credits,fees,handling_staff_email,sem,duration,isActive,count,currentCount,staff_type) 
values('C and C++ and DSA','NA','This course is about teaching c and c++ with DSA',3,333,'Teacher1@kongu.edu',1,100,1,3);

select * from student_enrollment_details;
select * from student;

update student set hasEnrolled = 0 where email = 'akashm.19cse@kongu.edu';

select rollno, concat(first_name, ' ', last_name) as name, courses_table.credits from student_enrollment_details 
          inner join student on student_enrollment_details.email = student.email 
          inner join user_data on student.email = user_data.email 
          inner join courses_table on courses_table.id = student_enrollment_details.id and courses_table.course_id = '18CST002';
          
select * from courses_table where isactive = 1;

select course_name, course_id, about, credits from courses_table where isactive = 1;

select course_name,course_id,about,credits,fees,handling_staff_email as staff, count,sem, duration from courses_table;