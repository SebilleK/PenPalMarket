DROP DATABASE IF EXISTS `penpal_db`;
CREATE DATABASE IF NOT EXISTS `penpal_db`;
USE `penpal_db`;

CREATE TABLE `products` (
  `created_at` timestamp DEFAULT (now()),
  `product_id` integer UNIQUE PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `product_name` VARCHAR(200),
  `product_image_path` varchar(512),
  `product_description` varchar(1000),
  `product_price` decimal(8,2) NOT NULL,
  `stock_quantity` integer DEFAULT 0,
  `category_id` integer
);

CREATE TABLE `categories` (
  `category_id` integer PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` varchar(500)
);

CREATE TABLE `users` (
  `created_at` timestamp DEFAULT (now()),
  `user_id` integer UNIQUE PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `role` varchar(20) NOT NULL,
  `phone_number` varchar(20),
  `email` varchar(255) UNIQUE NOT NULL,
  `password` varchar(255) NOT NULL
);

CREATE TABLE `user_addresses` (
  `user_address_id` integer PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `user_id` integer NOT NULL,
  `address_line1` varchar(255) NOT NULL,
  `address_line2` varchar(255),
  `city` varchar(100) NOT NULL,
  `state` varchar(100),
  `country` varchar(100) NOT NULL,
  `postal_code` varchar(20) NOT NULL,
  `is_default` boolean DEFAULT false
);

CREATE TABLE `shopping_cart` (
  `created_at` timestamp DEFAULT (now()),
  `cart_id` integer PRIMARY KEY NOT NULL,
  `user_id` integer NOT NULL,
  `status` varchar(50) DEFAULT 'active'
);

CREATE TABLE `shopping_cart_items` (
  `created_at` timestamp DEFAULT (now()),
  `cart_items_id` integer PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `shopping_cart_id` integer NOT NULL,
  `product_id` integer NOT NULL,
  `quantity` integer NOT NULL DEFAULT 1
);

CREATE TABLE `orders` (
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `order_id` integer PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `user_id` integer NOT NULL,
  `cart_id` integer NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `shipping_address` integer NOT NULL,
  `billing_address` integer NOT NULL,
  `order_status` varchar(50) DEFAULT 'pending',
  `payment_status` varchar(50) DEFAULT 'pending',
  `paid_at` timestamp NULL,
  `payment_method` varchar(50)
);

CREATE TABLE `order_items` (
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `order_items_id` integer PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `order_id` integer NOT NULL,
  `product_id` integer NOT NULL,
  `quantity` integer NOT NULL,
  `price` decimal(10,2) NOT NULL
);

ALTER TABLE `products` ADD FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`);

ALTER TABLE `user_addresses` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

ALTER TABLE `shopping_cart` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

ALTER TABLE `shopping_cart_items` ADD FOREIGN KEY (`shopping_cart_id`) REFERENCES `shopping_cart` (`cart_id`);

ALTER TABLE `shopping_cart_items` ADD FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`);

ALTER TABLE `orders` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

ALTER TABLE `orders` ADD FOREIGN KEY (`cart_id`) REFERENCES `shopping_cart` (`cart_id`);

ALTER TABLE `orders` ADD FOREIGN KEY (`shipping_address`) REFERENCES `user_addresses` (`user_address_id`);

ALTER TABLE `orders` ADD FOREIGN KEY (`billing_address`) REFERENCES `user_addresses` (`user_address_id`);

ALTER TABLE `order_items` ADD FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`);

ALTER TABLE `order_items` ADD FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`);

USE `penpal_db`;

INSERT INTO `categories` (`name`, `description`) VALUES
('Basic', 'Basic stationery products'),
('Classic', 'Classic and premium quality pens');

INSERT INTO `products` (`product_id`, `product_name`, `product_description`, `product_price`, `stock_quantity`, `category_id`) 
VALUES
(1, 'Pen', 'A simple ballpoint pen', 4.99, 100, (SELECT `category_id` FROM `categories` WHERE `name` = 'Basic')),
(2, 'Classic Pen', 'A classic pen, fit for all needs', 7.99, 50, (SELECT `category_id` FROM `categories` WHERE `name` = 'Classic')),
(3, 'Premium Pen', 'A luxurious pen: the best gift for any occasion', 19.99, 30, (SELECT `category_id` FROM `categories` WHERE `name` = 'Classic'));


