ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY '1234';
FLUSH PRIVILEGES;

-- 애플리케이션 전용 사용자 'todo_user' 생성
CREATE USER 'todo_user'@'%' IDENTIFIED BY 'todo_password';

-- 'todolist' 데이터베이스에 대한 모든 권한을 'todo_user'에게 부여
GRANT ALL PRIVILEGES ON `todolist`.* TO 'todo_user'@'%';
