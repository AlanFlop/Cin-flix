
CREATE DATABASE IF NOT EXISTS cinema_db;
USE cinema_db;


CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    movie_id VARCHAR(50) NOT NULL,
    movie_title VARCHAR(255) NOT NULL,
    movie_poster TEXT,
    date DATE NOT NULL,
    time VARCHAR(10) NOT NULL,
    quantity INT NOT NULL,
    price_per_ticket DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'confirmed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    movie_id VARCHAR(50) NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY (user_id, movie_id)
);


INSERT INTO users (username, email, password, is_admin) VALUES 
('demo', 'demo@example.com', '$2a$10$X7SfGvJmZ7HjwC0W2h7KsuV.U/.RWxW9YkZx4K9MjMKZ4LVFvCbJy', FALSE);


INSERT INTO bookings (user_id, movie_id, movie_title, movie_poster, date, time, quantity, price_per_ticket, total_price, status) VALUES
(1, 'tt0111161', 'The Shawshank Redemption', 'https://m.media-amazon.com/images/M/MV5BMDFkYTc0MGEtZmNhMC00ZDIzLWFmNTEtODM1ZmRlYWMwMWFmXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg', '2023-10-15', '19:00', 2, 12.50, 25.00, 'confirmed'),
(1, 'tt0468569', 'The Dark Knight', 'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg', '2023-09-20', '21:30', 1, 12.50, 12.50, 'cancelled');

