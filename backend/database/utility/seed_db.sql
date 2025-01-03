USE `penpal_db`;

INSERT INTO `categories` (`name`, `description`) VALUES
('Basic', 'Basic stationery products'),
('Classic', 'Classic and premium quality pens');

INSERT INTO `products` (`product_id`, `product_description`, `product_price`, `stock_quantity`, `category_id`) 
VALUES
(1, 'A simple ballpoint pen', 4.99, 100, (SELECT `category_id` FROM `categories` WHERE `name` = 'Basic')),
(2, 'A classic pen, fit for all needs', 7.99, 50, (SELECT `category_id` FROM `categories` WHERE `name` = 'Classic')),
(3, 'A luxurious pen: the best gift for any occasion', 19.99, 30, (SELECT `category_id` FROM `categories` WHERE `name` = 'Classic'));