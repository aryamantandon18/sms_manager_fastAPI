CREATE TABLE sms_metrics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    country VARCHAR(255) NOT NULL,
    operator VARCHAR(255) NOT NULL,
    sent INT NOT NULL,
    success INT NOT NULL,
    failure INT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX country_operator_idx (country, operator)
);