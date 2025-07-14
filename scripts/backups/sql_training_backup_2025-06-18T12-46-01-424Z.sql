-- SQL Training Database Backup
-- Created: 2025-06-18T12:46:01.477Z
-- Database: sql_training
-- Host: localhost
-- 
-- This backup contains the complete database structure and data
-- Use restore-database.js to restore this backup
--
-- Statistics at time of backup:

-- Table	Rows	Size (MB)
-- cart_items	17	0.05
-- categories	29	0.05
-- orders	37	0.08
-- order_items	54	0.05
-- products	143	0.11
-- reviews	15	0.05
-- users	80	0.08
-- 

/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.8.2-MariaDB, for Linux (x86_64)
--
-- Host: localhost    Database: sql_training
-- ------------------------------------------------------
-- Server version	11.8.2-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `added_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_product` (`user_id`,`product_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `cart_items_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `cart_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `cart_items` (`id`, `user_id`, `product_id`, `quantity`, `added_at`) VALUES (1,1,4,1,'2025-06-11 10:18:02'),
(2,1,8,2,'2025-06-11 10:18:02'),
(3,2,2,1,'2025-06-11 10:18:02'),
(4,3,13,1,'2025-06-11 10:18:02'),
(5,3,15,1,'2025-06-11 10:18:02'),
(6,14,24,3,'2025-06-18 12:33:04'),
(7,17,29,5,'2025-06-18 12:33:04'),
(8,28,44,3,'2025-06-18 12:33:05'),
(9,32,52,5,'2025-06-18 12:33:05'),
(10,42,68,3,'2025-06-18 12:33:06'),
(11,45,73,5,'2025-06-18 12:33:06'),
(12,51,83,3,'2025-06-18 12:33:17'),
(18,65,105,3,'2025-06-18 12:33:34'),
(19,71,112,5,'2025-06-18 12:33:34'),
(20,77,122,3,'2025-06-18 12:35:04'),
(21,83,131,3,'2025-06-18 12:37:11'),
(22,89,139,3,'2025-06-18 12:40:11');
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `parent_id` (`parent_id`),
  CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `categories` (`id`, `name`, `description`, `parent_id`, `created_at`) VALUES (1,'Electronics','Electronic devices and accessories',NULL,'2025-06-11 10:18:02'),
(2,'Clothing','Apparel and fashion items',NULL,'2025-06-11 10:18:02'),
(3,'Books','Physical and digital books',NULL,'2025-06-11 10:18:02'),
(4,'Home & Garden','Home improvement and garden supplies',NULL,'2025-06-11 10:18:02'),
(5,'Sports & Outdoors','Sporting goods and outdoor equipment',NULL,'2025-06-11 10:18:02'),
(6,'Laptops','Portable computers',1,'2025-06-11 10:18:02'),
(7,'Smartphones','Mobile phones',1,'2025-06-11 10:18:02'),
(8,'Mens Clothing','Clothing for men',2,'2025-06-11 10:18:02'),
(9,'Womens Clothing','Clothing for women',2,'2025-06-11 10:18:02'),
(10,'Fiction','Fiction books',3,'2025-06-11 10:18:02'),
(11,'Non-Fiction','Non-fiction books',3,'2025-06-11 10:18:02'),
(12,'Test Category 1750249984318','A test category for automation testing',NULL,'2025-06-18 12:33:04'),
(13,'Product Category 1750249984325','Category for product testing',NULL,'2025-06-18 12:33:04'),
(16,'Test Category','Test category: Test Category',NULL,'2025-06-18 12:33:04'),
(18,'Test Category 1750249985171','A test category for automation testing',NULL,'2025-06-18 12:33:05'),
(19,'Product Category 1750249985194','Category for product testing',NULL,'2025-06-18 12:33:05'),
(24,'Test Category 1750249986145','A test category for automation testing',NULL,'2025-06-18 12:33:06'),
(25,'Product Category 1750249986151','Category for product testing',NULL,'2025-06-18 12:33:06'),
(30,'Test Category 1750249997059','A test category for automation testing',NULL,'2025-06-18 12:33:17'),
(31,'Product Category 1750249997089','Category for product testing',NULL,'2025-06-18 12:33:17'),
(36,'Test Category 1750250014419','A test category for automation testing',NULL,'2025-06-18 12:33:34'),
(37,'Product Category 1750250014432','Category for product testing',NULL,'2025-06-18 12:33:34'),
(42,'Test Category 1750250089053','A test category for automation testing',NULL,'2025-06-18 12:34:49'),
(43,'Product Category 1750250089057','Category for product testing',NULL,'2025-06-18 12:34:49'),
(47,'Test Category Direct','Direct test',NULL,'2025-06-18 12:39:41'),
(48,'Test Electronics 1750250399294','Test category: Test Electronics 1750250399294',NULL,'2025-06-18 12:39:59'),
(49,'Test Books 1750250399294','Test category: Test Books 1750250399294',NULL,'2025-06-18 12:39:59'),
(50,'Test Electronics 1750250411651','Test category: Test Electronics 1750250411651',NULL,'2025-06-18 12:40:11'),
(51,'Test Books 1750250411651','Test category: Test Books 1750250411651',NULL,'2025-06-18 12:40:11');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `discount_amount` decimal(10,2) DEFAULT 0.00,
  `tax_amount` decimal(10,2) DEFAULT 0.00,
  `total_price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_order` (`order_id`),
  KEY `idx_product` (`product_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `quantity`, `unit_price`, `discount_amount`, `tax_amount`, `total_price`) VALUES (1,1,1,1,1299.99,0.00,0.00,1299.99),
(2,1,10,1,24.99,0.00,0.00,24.99),
(3,2,6,1,59.99,0.00,0.00,59.99),
(4,2,7,1,19.99,0.00,0.00,19.99),
(5,3,16,1,34.99,0.00,0.00,34.99),
(6,3,17,1,199.99,0.00,0.00,199.99),
(7,4,3,1,999.99,0.00,0.00,999.99),
(8,5,9,2,49.99,0.00,0.00,99.98),
(9,5,11,2,19.99,0.00,0.00,39.98),
(10,5,14,1,29.99,0.00,0.00,29.99),
(11,7,10,1,24.99,0.00,0.00,24.99),
(12,7,11,1,19.99,0.00,0.00,19.99),
(13,7,12,1,49.99,0.00,0.00,49.99),
(14,8,21,1,99.99,0.00,0.00,99.99),
(15,9,25,1,99.99,0.00,0.00,99.99),
(16,11,30,1,99.99,0.00,0.00,99.99),
(17,10,28,2,10.00,0.00,0.00,20.00),
(18,10,32,1,25.50,0.00,0.00,25.50),
(19,12,31,50,25.00,0.00,0.00,1250.00),
(20,12,36,10,15.00,0.00,0.00,150.00),
(21,13,41,1,99.99,0.00,0.00,99.99),
(22,14,48,1,99.99,0.00,0.00,99.99),
(23,15,50,50,25.00,0.00,0.00,1250.00),
(24,16,54,1,99.99,0.00,0.00,99.99),
(25,15,53,10,15.00,0.00,0.00,150.00),
(26,17,61,1,99.99,0.00,0.00,99.99),
(27,18,66,1,99.99,0.00,0.00,99.99),
(28,19,63,2,10.00,0.00,0.00,20.00),
(29,19,69,1,25.50,0.00,0.00,25.50),
(30,20,72,50,25.00,0.00,0.00,1250.00),
(31,20,75,10,15.00,0.00,0.00,150.00),
(32,21,77,1,99.99,0.00,0.00,99.99),
(33,22,85,1,99.99,0.00,0.00,99.99),
(34,23,90,1,99.99,0.00,0.00,99.99),
(35,24,84,2,10.00,0.00,0.00,20.00),
(36,24,91,1,25.50,0.00,0.00,25.50),
(37,25,92,50,25.00,0.00,0.00,1250.00),
(38,25,95,10,15.00,0.00,0.00,150.00),
(39,26,97,1,99.99,0.00,0.00,99.99),
(40,27,101,1,99.99,0.00,0.00,99.99),
(41,29,110,1,99.99,0.00,0.00,99.99),
(42,28,104,2,10.00,0.00,0.00,20.00),
(43,30,114,1,99.99,0.00,0.00,99.99),
(44,28,107,1,25.50,0.00,0.00,25.50),
(45,31,113,50,25.00,0.00,0.00,1250.00),
(46,31,116,10,15.00,0.00,0.00,150.00),
(47,32,124,2,10.00,0.00,0.00,20.00),
(48,32,128,1,25.50,0.00,0.00,25.50),
(49,33,130,1,99.99,0.00,0.00,99.99),
(50,34,132,1,99.99,0.00,0.00,99.99),
(51,35,140,1,99.99,0.00,0.00,99.99),
(52,36,137,2,10.00,0.00,0.00,20.00),
(53,36,141,1,25.50,0.00,0.00,25.50),
(54,37,143,1,99.99,0.00,0.00,99.99);
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_number` varchar(50) NOT NULL,
  `user_id` int(11) NOT NULL,
  `status` enum('pending','processing','shipped','delivered','cancelled') DEFAULT 'pending',
  `total_amount` decimal(10,2) NOT NULL,
  `shipping_address` text DEFAULT NULL,
  `billing_address` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `shipped_at` datetime DEFAULT NULL,
  `delivered_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`),
  KEY `idx_user` (`user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created` (`created_at`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `orders` (`id`, `order_number`, `user_id`, `status`, `total_amount`, `shipping_address`, `billing_address`, `notes`, `created_at`, `updated_at`, `shipped_at`, `delivered_at`) VALUES (1,'ORD-2024-001',1,'delivered',1324.98,'123 Main St, City, State 12345','123 Main St, City, State 12345',NULL,'2025-06-11 10:18:02','2025-06-11 10:18:02','2025-06-09 10:18:02','2025-06-10 10:18:02'),
(2,'ORD-2024-002',2,'shipped',79.98,'456 Oak Ave, Town, State 23456','456 Oak Ave, Town, State 23456',NULL,'2025-06-11 10:18:02','2025-06-11 10:18:02','2025-06-10 10:18:02',NULL),
(3,'ORD-2024-003',1,'processing',234.97,'123 Main St, City, State 12345','123 Main St, City, State 12345',NULL,'2025-06-11 10:18:02','2025-06-11 10:18:02',NULL,NULL),
(4,'ORD-2024-004',3,'pending',999.99,'789 Pine Rd, Village, State 34567','789 Pine Rd, Village, State 34567',NULL,'2025-06-11 10:18:02','2025-06-11 10:18:02',NULL,NULL),
(5,'ORD-2024-005',4,'delivered',169.97,'321 Elm St, Metro, State 45678','321 Elm St, Metro, State 45678',NULL,'2025-06-11 10:18:02','2025-06-11 10:18:02','2025-06-09 10:18:02','2025-06-10 10:18:02'),
(6,'ORD-2024-006',2,'cancelled',49.99,'456 Oak Ave, Town, State 23456','456 Oak Ave, Town, State 23456',NULL,'2025-06-11 10:18:02','2025-06-11 10:18:02',NULL,NULL),
(7,'ORD-2024-007',5,'pending',89.98,'654 Maple Dr, Suburb, State 56789','654 Maple Dr, Suburb, State 56789',NULL,'2025-06-11 10:18:02','2025-06-11 10:18:02',NULL,NULL),
(8,'ORD-1750249984398-107',12,'processing',99.99,'123 Test Street, Test City',NULL,'Test order','2025-06-18 12:33:04','2025-06-18 12:33:04',NULL,NULL),
(9,'ORD-1750249984425-598',15,'processing',99.99,'123 Test Street, Test City',NULL,'Test order','2025-06-18 12:33:04','2025-06-18 12:33:04',NULL,NULL),
(10,'ORD-1750249984460-18',20,'pending',45.50,'123 Test St, Test City, TC 12345','456 Bill Ave, Bill City, BC 67890','Test order for automation','2025-06-18 12:33:04','2025-06-18 12:33:04',NULL,NULL),
(11,'ORD-1750249984460-100',22,'pending',99.99,'123 Test Street, Test City, TC 12345','456 Billing Ave, Bill City, BC 67890','Test order created by automation','2025-06-18 12:33:04','2025-06-18 12:33:04',NULL,NULL),
(12,'ORD-1750249984485-141',19,'pending',1400.00,'789 Bulk Order St, Warehouse District, WD 54321',NULL,'Large quantity order for business','2025-06-18 12:33:04','2025-06-18 12:33:04',NULL,NULL),
(13,'ORD-1750249985309-600',26,'processing',99.99,'123 Test Street, Test City',NULL,'Test order','2025-06-18 12:33:05','2025-06-18 12:33:05',NULL,NULL),
(14,'ORD-1750249985349-222',30,'processing',99.99,'123 Test Street, Test City',NULL,'Test order','2025-06-18 12:33:05','2025-06-18 12:33:05',NULL,NULL),
(15,'ORD-1750249985387-921',31,'pending',1400.00,'789 Bulk Order St, Warehouse District, WD 54321',NULL,'Large quantity order for business','2025-06-18 12:33:05','2025-06-18 12:33:05',NULL,NULL),
(16,'ORD-1750249985394-492',34,'pending',99.99,'123 Test Street, Test City, TC 12345','456 Billing Ave, Bill City, BC 67890','Test order created by automation','2025-06-18 12:33:05','2025-06-18 12:33:05',NULL,NULL),
(17,'ORD-1750249986233-54',38,'processing',99.99,'123 Test Street, Test City',NULL,'Test order','2025-06-18 12:33:06','2025-06-18 12:33:06',NULL,NULL),
(18,'ORD-1750249986253-689',41,'processing',99.99,'123 Test Street, Test City',NULL,'Test order','2025-06-18 12:33:06','2025-06-18 12:33:06',NULL,NULL),
(19,'ORD-1750249986259-976',39,'pending',45.50,'123 Test St, Test City, TC 12345','456 Bill Ave, Bill City, BC 67890','Test order for automation','2025-06-18 12:33:06','2025-06-18 12:33:06',NULL,NULL),
(20,'ORD-1750249986283-106',44,'pending',1400.00,'789 Bulk Order St, Warehouse District, WD 54321',NULL,'Large quantity order for business','2025-06-18 12:33:06','2025-06-18 12:33:06',NULL,NULL),
(21,'ORD-1750249986315-987',46,'pending',99.99,'123 Test Street, Test City, TC 12345','456 Billing Ave, Bill City, BC 67890','Test order created by automation','2025-06-18 12:33:06','2025-06-18 12:33:06',NULL,NULL),
(22,'ORD-1750249997184-465',52,'processing',99.99,'123 Test Street, Test City',NULL,'Test order','2025-06-18 12:33:17','2025-06-18 12:33:17',NULL,NULL),
(23,'ORD-1750249997190-943',55,'processing',99.99,'123 Test Street, Test City',NULL,'Test order','2025-06-18 12:33:17','2025-06-18 12:33:17',NULL,NULL),
(24,'ORD-1750249997196-602',53,'pending',45.50,'123 Test St, Test City, TC 12345','456 Bill Ave, Bill City, BC 67890','Test order for automation','2025-06-18 12:33:17','2025-06-18 12:33:17',NULL,NULL),
(25,'ORD-1750249997213-751',57,'pending',1400.00,'789 Bulk Order St, Warehouse District, WD 54321',NULL,'Large quantity order for business','2025-06-18 12:33:17','2025-06-18 12:33:17',NULL,NULL),
(26,'ORD-1750249997788-422',60,'pending',99.99,'123 Test Street, Test City, TC 12345','456 Billing Ave, Bill City, BC 67890','Test order created by automation','2025-06-18 12:33:17','2025-06-18 12:33:17',NULL,NULL),
(27,'ORD-1750250014503-321',64,'processing',99.99,'123 Test Street, Test City',NULL,'Test order','2025-06-18 12:33:34','2025-06-18 12:33:34',NULL,NULL),
(28,'ORD-1750250014530-411',66,'pending',45.50,'123 Test St, Test City, TC 12345','456 Bill Ave, Bill City, BC 67890','Test order for automation','2025-06-18 12:33:34','2025-06-18 12:33:34',NULL,NULL),
(29,'ORD-1750250014536-665',68,'processing',99.99,'123 Test Street, Test City',NULL,'Test order','2025-06-18 12:33:34','2025-06-18 12:33:34',NULL,NULL),
(30,'ORD-1750250014547-208',72,'pending',99.99,'123 Test Street, Test City, TC 12345','456 Billing Ave, Bill City, BC 67890','Test order created by automation','2025-06-18 12:33:34','2025-06-18 12:33:34',NULL,NULL),
(31,'ORD-1750250014561-38',70,'pending',1400.00,'789 Bulk Order St, Warehouse District, WD 54321',NULL,'Large quantity order for business','2025-06-18 12:33:34','2025-06-18 12:33:34',NULL,NULL),
(32,'ORD-1750250104324-553',78,'pending',45.50,'123 Test St, Test City, TC 12345','456 Bill Ave, Bill City, BC 67890','Test order for automation','2025-06-18 12:35:04','2025-06-18 12:35:04',NULL,NULL),
(33,'ORD-1750250220810-316',82,'processing',99.99,'123 Test Street, Test City',NULL,'Test order','2025-06-18 12:37:00','2025-06-18 12:37:00',NULL,NULL),
(34,'ORD-1750250242166-440',84,'processing',99.99,'123 Test Street, Test City',NULL,'Test order','2025-06-18 12:37:22','2025-06-18 12:37:22',NULL,NULL),
(35,'ORD-1750250411703-634',88,'processing',99.99,'123 Test Street, Test City',NULL,'Test order','2025-06-18 12:40:11','2025-06-18 12:40:11',NULL,NULL),
(36,'ORD-1750250411708-686',85,'pending',45.50,'123 Test St, Test City, TC 12345','456 Bill Ave, Bill City, BC 67890','Test order for automation','2025-06-18 12:40:11','2025-06-18 12:40:11',NULL,NULL),
(37,'ORD-1750250411735-157',90,'processing',99.99,'123 Test Street, Test City',NULL,'Test order','2025-06-18 12:40:11','2025-06-18 12:40:11',NULL,NULL);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sku` varchar(50) NOT NULL,
  `name` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `cost` decimal(10,2) DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `stock_quantity` int(11) DEFAULT 0,
  `reorder_level` int(11) DEFAULT 10,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `sku` (`sku`),
  KEY `idx_sku` (`sku`),
  KEY `idx_name` (`name`),
  KEY `idx_category` (`category_id`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=144 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `products` (`id`, `sku`, `name`, `description`, `price`, `cost`, `category_id`, `stock_quantity`, `reorder_level`, `is_active`, `created_at`, `updated_at`) VALUES (1,'LAP001','Dell XPS 13','Ultra-thin laptop with Intel i7',1299.99,900.00,6,15,5,1,'2025-06-11 10:18:02','2025-06-11 10:18:02'),
(2,'LAP002','MacBook Pro 14','Apple M3 Pro chip laptop',1999.99,1400.00,6,10,3,1,'2025-06-11 10:18:02','2025-06-11 10:18:02'),
(3,'PHN001','iPhone 15','Latest Apple smartphone',999.99,700.00,7,25,10,1,'2025-06-11 10:18:02','2025-06-11 10:18:02'),
(4,'PHN002','Samsung Galaxy S24','Android flagship phone',899.99,600.00,7,20,8,1,'2025-06-11 10:18:02','2025-06-11 10:18:02'),
(5,'PHN003','Google Pixel 8','Google AI-powered phone',699.99,500.00,7,18,7,1,'2025-06-11 10:18:02','2025-06-11 10:18:02'),
(6,'MCL001','Classic Fit Jeans','Comfortable denim jeans',59.99,25.00,8,50,20,1,'2025-06-11 10:18:02','2025-06-11 10:18:02'),
(7,'MCL002','Cotton T-Shirt','Basic cotton t-shirt',19.99,8.00,8,100,40,1,'2025-06-11 10:18:02','2025-06-11 10:18:02'),
(8,'WCL001','Summer Dress','Floral print summer dress',79.99,35.00,9,30,15,1,'2025-06-11 10:18:02','2025-06-11 10:18:02'),
(9,'WCL002','Yoga Pants','Stretchy workout pants',49.99,20.00,9,45,20,1,'2025-06-11 10:18:02','2025-06-11 10:18:02'),
(10,'BKF001','The Great Adventure','Bestselling fiction novel',24.99,10.00,10,60,25,1,'2025-06-11 10:18:02','2025-06-11 10:18:02'),
(11,'BKF002','Mystery at Midnight','Thrilling mystery novel',19.99,8.00,10,40,15,1,'2025-06-11 10:18:02','2025-06-11 10:18:02'),
(12,'BKN001','SQL Mastery','Complete guide to SQL',49.99,20.00,11,35,10,1,'2025-06-11 10:18:02','2025-06-11 10:18:02'),
(13,'BKN002','Test Automation Guide','Learn test automation',39.99,15.00,11,25,10,1,'2025-06-11 10:18:02','2025-06-11 10:18:02'),
(14,'HOM001','Smart LED Bulb','WiFi connected light bulb',29.99,12.00,4,80,30,1,'2025-06-11 10:18:02','2025-06-11 10:18:02'),
(15,'HOM002','Garden Hose 50ft','Durable garden hose',39.99,18.00,4,25,10,1,'2025-06-11 10:18:02','2025-06-11 10:18:02'),
(16,'SPT001','Yoga Mat','Non-slip exercise mat',34.99,15.00,5,40,15,1,'2025-06-11 10:18:02','2025-06-11 10:18:02'),
(17,'SPT002','Dumbbells Set','5-25 lb adjustable weights',199.99,120.00,5,15,5,1,'2025-06-11 10:18:02','2025-06-11 10:18:02'),
(18,'SPT003','Running Shoes','Professional running shoes',129.99,70.00,5,35,12,1,'2025-06-11 10:18:02','2025-06-11 10:18:02'),
(19,'TEST-SKU-1750249984348','Test Product 1750249984348','A test product for automation testing',99.99,50.00,13,100,10,1,'2025-06-18 12:33:04','2025-06-18 12:33:04'),
(20,'DUPLICATE-SKU-1750249984348','First Product 1750249984348',NULL,50.00,NULL,NULL,0,10,1,'2025-06-18 12:33:04','2025-06-18 12:33:04'),
(21,'SKU-1750249984380-558','Product 1750249984380','Test product: Product 1750249984380',99.99,59.99,NULL,100,10,1,'2025-06-18 12:33:04','2025-06-18 12:33:04'),
(22,'SKU-1750249984397-769','Special Searchable Item','Test product: Special Searchable Item',50.00,30.00,NULL,100,10,1,'2025-06-18 12:33:04','2025-06-18 12:33:04'),
(23,'SKU-1750249984401-413','Laptop','Test product: Laptop',999.99,599.99,NULL,100,10,1,'2025-06-18 12:33:04','2025-06-18 12:33:04'),
(24,'SKU-1750249984402-144','Product 1750249984402','Test product: Product 1750249984402',99.99,59.99,NULL,100,10,1,'2025-06-18 12:33:04','2025-06-18 12:33:04'),
(25,'SKU-1750249984407-385','Product 1750249984407','Test product: Product 1750249984407',99.99,59.99,NULL,100,10,1,'2025-06-18 12:33:04','2025-06-18 12:33:04'),
(26,'SKU-1750249984413-559','Regular Product','Test product: Regular Product',30.00,18.00,NULL,100,10,1,'2025-06-18 12:33:04','2025-06-18 12:33:04'),
(27,'SKU-1750249984415-25','JavaScript Guide','Test product: JavaScript Guide',29.99,17.99,NULL,100,10,1,'2025-06-18 12:33:04','2025-06-18 12:33:04'),
(28,'SKU-1750249984420-532','Product 1','Test product: Product 1',10.00,6.00,NULL,100,10,1,'2025-06-18 12:33:04','2025-06-18 12:33:04'),
(29,'SKU-1750249984422-504','Concurrent Test Product','Test product: Concurrent Test Product',30.00,18.00,NULL,100,10,1,'2025-06-18 12:33:04','2025-06-18 12:33:04'),
(30,'SKU-1750249984440-605','Product 1750249984440','Test product: Product 1750249984440',99.99,59.99,NULL,100,10,1,'2025-06-18 12:33:04','2025-06-18 12:33:04'),
(31,'SKU-1750249984439-508','High Stock Item','Test product: High Stock Item',25.00,15.00,16,100,10,1,'2025-06-18 12:33:04','2025-06-18 12:33:04'),
(32,'SKU-1750249984439-675','Product 2','Test product: Product 2',25.50,15.30,NULL,100,10,1,'2025-06-18 12:33:04','2025-06-18 12:33:04'),
(33,'SKU-1750249984438-535','Laptop','Test product: Laptop',999.99,599.99,NULL,100,10,1,'2025-06-18 12:33:04','2025-06-18 12:33:04'),
(34,'SKU-1750249984447-673','Reviewed Product','Test product: Reviewed Product',149.99,89.99,NULL,100,10,1,'2025-06-18 12:33:04','2025-06-18 12:33:04'),
(35,'SKU-1750249984454-345','Mouse','Test product: Mouse',29.99,17.99,NULL,100,10,1,'2025-06-18 12:33:04','2025-06-18 12:33:04'),
(36,'SKU-1750249984453-125','Low Stock Item','Test product: Low Stock Item',15.00,9.00,16,100,10,1,'2025-06-18 12:33:04','2025-06-18 12:33:04'),
(37,'SKU-1750249984474-836','Keyboard','Test product: Keyboard',79.99,47.99,NULL,100,10,1,'2025-06-18 12:33:04','2025-06-18 12:33:04'),
(38,'SKU-1750249984496-508','Product 1750249984496','Test product: Product 1750249984496',99.99,59.99,NULL,100,10,1,'2025-06-18 12:33:04','2025-06-18 12:33:04'),
(39,'TEST-SKU-1750249985206','Test Product 1750249985206','A test product for automation testing',99.99,50.00,19,100,10,1,'2025-06-18 12:33:05','2025-06-18 12:33:05'),
(40,'DUPLICATE-SKU-1750249985269','First Product 1750249985269',NULL,50.00,NULL,NULL,0,10,1,'2025-06-18 12:33:05','2025-06-18 12:33:05'),
(41,'SKU-1750249985294-862','Product 1750249985294','Test product: Product 1750249985294',99.99,59.99,NULL,100,10,1,'2025-06-18 12:33:05','2025-06-18 12:33:05'),
(42,'SKU-1750249985308-909','Product 1','Test product: Product 1',10.00,6.00,NULL,100,10,1,'2025-06-18 12:33:05','2025-06-18 12:33:05'),
(43,'SKU-1750249985313-409','Laptop','Test product: Laptop',999.99,599.99,NULL,100,10,1,'2025-06-18 12:33:05','2025-06-18 12:33:05'),
(44,'SKU-1750249985323-527','Product 1750249985323','Test product: Product 1750249985323',99.99,59.99,NULL,100,10,1,'2025-06-18 12:33:05','2025-06-18 12:33:05'),
(45,'SKU-1750249985323-82','Product 2','Test product: Product 2',25.50,15.30,NULL,100,10,1,'2025-06-18 12:33:05','2025-06-18 12:33:05'),
(46,'SKU-1750249985324-128','Special Searchable Item','Test product: Special Searchable Item',50.00,30.00,NULL,100,10,1,'2025-06-18 12:33:05','2025-06-18 12:33:05'),
(47,'SKU-1750249985327-515','JavaScript Guide','Test product: JavaScript Guide',29.99,17.99,NULL,100,10,1,'2025-06-18 12:33:05','2025-06-18 12:33:05'),
(48,'SKU-1750249985334-367','Product 1750249985334','Test product: Product 1750249985334',99.99,59.99,NULL,100,10,1,'2025-06-18 12:33:05','2025-06-18 12:33:05'),
(49,'SKU-1750249985340-936','Regular Product','Test product: Regular Product',30.00,18.00,NULL,100,10,1,'2025-06-18 12:33:05','2025-06-18 12:33:05'),
(50,'SKU-1750249985360-244','High Stock Item','Test product: High Stock Item',25.00,15.00,NULL,100,10,1,'2025-06-18 12:33:05','2025-06-18 12:33:05'),
(51,'SKU-1750249985364-249','Reviewed Product','Test product: Reviewed Product',149.99,89.99,NULL,100,10,1,'2025-06-18 12:33:05','2025-06-18 12:33:05'),
(52,'SKU-1750249985366-151','Concurrent Test Product','Test product: Concurrent Test Product',30.00,18.00,NULL,100,10,1,'2025-06-18 12:33:05','2025-06-18 12:33:05'),
(53,'SKU-1750249985372-829','Low Stock Item','Test product: Low Stock Item',15.00,9.00,NULL,100,10,1,'2025-06-18 12:33:05','2025-06-18 12:33:05'),
(54,'SKU-1750249985379-759','Product 1750249985379','Test product: Product 1750249985379',99.99,59.99,NULL,100,10,1,'2025-06-18 12:33:05','2025-06-18 12:33:05'),
(55,'SKU-1750249985419-560','Product 1750249985419','Test product: Product 1750249985419',99.99,59.99,NULL,100,10,1,'2025-06-18 12:33:05','2025-06-18 12:33:05'),
(56,'SKU-1750249986027-6','Laptop','Test product: Laptop',999.99,599.99,NULL,100,10,1,'2025-06-18 12:33:06','2025-06-18 12:33:06'),
(57,'SKU-1750249986039-743','Mouse','Test product: Mouse',29.99,17.99,NULL,100,10,1,'2025-06-18 12:33:06','2025-06-18 12:33:06'),
(58,'SKU-1750249986053-456','Keyboard','Test product: Keyboard',79.99,47.99,NULL,100,10,1,'2025-06-18 12:33:06','2025-06-18 12:33:06'),
(59,'TEST-SKU-1750249986166','Test Product 1750249986166','A test product for automation testing',99.99,50.00,25,100,10,1,'2025-06-18 12:33:06','2025-06-18 12:33:06'),
(60,'DUPLICATE-SKU-1750249986190','First Product 1750249986190',NULL,50.00,NULL,NULL,0,10,1,'2025-06-18 12:33:06','2025-06-18 12:33:06'),
(61,'SKU-1750249986219-394','Product 1750249986219','Test product: Product 1750249986219',99.99,59.99,NULL,100,10,1,'2025-06-18 12:33:06','2025-06-18 12:33:06'),
(62,'SKU-1750249986226-174','Special Searchable Item','Test product: Special Searchable Item',50.00,30.00,NULL,100,10,1,'2025-06-18 12:33:06','2025-06-18 12:33:06'),
(63,'SKU-1750249986231-510','Product 1','Test product: Product 1',10.00,6.00,NULL,100,10,1,'2025-06-18 12:33:06','2025-06-18 12:33:06'),
(64,'SKU-1750249986235-246','Laptop','Test product: Laptop',999.99,599.99,NULL,100,10,1,'2025-06-18 12:33:06','2025-06-18 12:33:06'),
(65,'SKU-1750249986237-309','Regular Product','Test product: Regular Product',30.00,18.00,NULL,100,10,1,'2025-06-18 12:33:06','2025-06-18 12:33:06'),
(66,'SKU-1750249986237-127','Product 1750249986237','Test product: Product 1750249986237',99.99,59.99,NULL,100,10,1,'2025-06-18 12:33:06','2025-06-18 12:33:06'),
(67,'SKU-1750249986240-463','Reviewed Product','Test product: Reviewed Product',149.99,89.99,NULL,100,10,1,'2025-06-18 12:33:06','2025-06-18 12:33:06'),
(68,'SKU-1750249986244-871','Product 1750249986244','Test product: Product 1750249986244',99.99,59.99,NULL,100,10,1,'2025-06-18 12:33:06','2025-06-18 12:33:06'),
(69,'SKU-1750249986244-612','Product 2','Test product: Product 2',25.50,15.30,NULL,100,10,1,'2025-06-18 12:33:06','2025-06-18 12:33:06'),
(70,'SKU-1750249986247-747','Laptop','Test product: Laptop',999.99,599.99,NULL,100,10,1,'2025-06-18 12:33:06','2025-06-18 12:33:06'),
(71,'SKU-1750249986252-791','JavaScript Guide','Test product: JavaScript Guide',29.99,17.99,NULL,100,10,1,'2025-06-18 12:33:06','2025-06-18 12:33:06'),
(72,'SKU-1750249986254-942','High Stock Item','Test product: High Stock Item',25.00,15.00,NULL,100,10,1,'2025-06-18 12:33:06','2025-06-18 12:33:06'),
(73,'SKU-1750249986256-123','Concurrent Test Product','Test product: Concurrent Test Product',30.00,18.00,NULL,100,10,1,'2025-06-18 12:33:06','2025-06-18 12:33:06'),
(74,'SKU-1750249986262-615','Mouse','Test product: Mouse',29.99,17.99,NULL,100,10,1,'2025-06-18 12:33:06','2025-06-18 12:33:06'),
(75,'SKU-1750249986269-411','Low Stock Item','Test product: Low Stock Item',15.00,9.00,NULL,100,10,1,'2025-06-18 12:33:06','2025-06-18 12:33:06'),
(76,'SKU-1750249986275-203','Keyboard','Test product: Keyboard',79.99,47.99,NULL,100,10,1,'2025-06-18 12:33:06','2025-06-18 12:33:06'),
(77,'SKU-1750249986300-130','Product 1750249986300','Test product: Product 1750249986300',99.99,59.99,NULL,100,10,1,'2025-06-18 12:33:06','2025-06-18 12:33:06'),
(78,'SKU-1750249986336-491','Product 1750249986336','Test product: Product 1750249986336',99.99,59.99,NULL,100,10,1,'2025-06-18 12:33:06','2025-06-18 12:33:06'),
(79,'TEST-SKU-1750249997103','Test Product 1750249997103','A test product for automation testing',99.99,50.00,31,100,10,1,'2025-06-18 12:33:17','2025-06-18 12:33:17'),
(80,'DUPLICATE-SKU-1750249997127','First Product 1750249997127',NULL,50.00,NULL,NULL,0,10,1,'2025-06-18 12:33:17','2025-06-18 12:33:17'),
(81,'SKU-1750249997154-164','Special Searchable Item','Test product: Special Searchable Item',50.00,30.00,NULL,100,10,1,'2025-06-18 12:33:17','2025-06-18 12:33:17'),
(82,'SKU-1750249997156-741','Laptop','Test product: Laptop',999.99,599.99,NULL,100,10,1,'2025-06-18 12:33:17','2025-06-18 12:33:17'),
(83,'SKU-1750249997156-245','Product 1750249997156','Test product: Product 1750249997156',99.99,59.99,NULL,100,10,1,'2025-06-18 12:33:17','2025-06-18 12:33:17'),
(84,'SKU-1750249997163-835','Product 1','Test product: Product 1',10.00,6.00,NULL,100,10,1,'2025-06-18 12:33:17','2025-06-18 12:33:17'),
(85,'SKU-1750249997163-384','Product 1750249997163','Test product: Product 1750249997163',99.99,59.99,NULL,100,10,1,'2025-06-18 12:33:17','2025-06-18 12:33:17'),
(86,'SKU-1750249997165-880','JavaScript Guide','Test product: JavaScript Guide',29.99,17.99,NULL,100,10,1,'2025-06-18 12:33:17','2025-06-18 12:33:17'),
(87,'SKU-1750249997165-638','Regular Product','Test product: Regular Product',30.00,18.00,NULL,100,10,1,'2025-06-18 12:33:17','2025-06-18 12:33:17'),
(88,'SKU-1750249997171-475','Concurrent Test Product','Test product: Concurrent Test Product',30.00,18.00,NULL,100,10,1,'2025-06-18 12:33:17','2025-06-18 12:33:17'),
(89,'SKU-1750249997172-700','Reviewed Product','Test product: Reviewed Product',149.99,89.99,NULL,100,10,1,'2025-06-18 12:33:17','2025-06-18 12:33:17'),
(90,'SKU-1750249997173-663','Product 1750249997173','Test product: Product 1750249997173',99.99,59.99,NULL,100,10,1,'2025-06-18 12:33:17','2025-06-18 12:33:17'),
(91,'SKU-1750249997181-151','Product 2','Test product: Product 2',25.50,15.30,NULL,100,10,1,'2025-06-18 12:33:17','2025-06-18 12:33:17'),
(92,'SKU-1750249997186-912','High Stock Item','Test product: High Stock Item',25.00,15.00,NULL,100,10,1,'2025-06-18 12:33:17','2025-06-18 12:33:17'),
(93,'SKU-1750249997186-888','Laptop','Test product: Laptop',999.99,599.99,NULL,100,10,1,'2025-06-18 12:33:17','2025-06-18 12:33:17'),
(94,'SKU-1750249997199-678','Mouse','Test product: Mouse',29.99,17.99,NULL,100,10,1,'2025-06-18 12:33:17','2025-06-18 12:33:17'),
(95,'SKU-1750249997199-490','Low Stock Item','Test product: Low Stock Item',15.00,9.00,NULL,100,10,1,'2025-06-18 12:33:17','2025-06-18 12:33:17'),
(96,'SKU-1750249997212-350','Keyboard','Test product: Keyboard',79.99,47.99,NULL,100,10,1,'2025-06-18 12:33:17','2025-06-18 12:33:17'),
(97,'SKU-1750249997777-364','Product 1750249997777','Test product: Product 1750249997777',99.99,59.99,NULL,100,10,1,'2025-06-18 12:33:17','2025-06-18 12:33:17'),
(98,'SKU-1750249997809-707','Product 1750249997809','Test product: Product 1750249997809',99.99,59.99,NULL,100,10,1,'2025-06-18 12:33:17','2025-06-18 12:33:17'),
(99,'TEST-SKU-1750250014451','Test Product 1750250014451','A test product for automation testing',99.99,50.00,37,100,10,1,'2025-06-18 12:33:34','2025-06-18 12:33:34'),
(100,'DUPLICATE-SKU-1750250014478','First Product 1750250014478',NULL,50.00,NULL,NULL,0,10,1,'2025-06-18 12:33:34','2025-06-18 12:33:34'),
(101,'SKU-1750250014488-941','Product 1750250014488','Test product: Product 1750250014488',99.99,59.99,NULL,100,10,1,'2025-06-18 12:33:34','2025-06-18 12:33:34'),
(102,'SKU-1750250014495-167','Special Searchable Item','Test product: Special Searchable Item',50.00,30.00,NULL,100,10,1,'2025-06-18 12:33:34','2025-06-18 12:33:34'),
(103,'SKU-1750250014500-816','Laptop','Test product: Laptop',999.99,599.99,NULL,100,10,1,'2025-06-18 12:33:34','2025-06-18 12:33:34'),
(104,'SKU-1750250014501-500','Product 1','Test product: Product 1',10.00,6.00,NULL,100,10,1,'2025-06-18 12:33:34','2025-06-18 12:33:34'),
(105,'SKU-1750250014501-776','Product 1750250014501','Test product: Product 1750250014501',99.99,59.99,NULL,100,10,1,'2025-06-18 12:33:34','2025-06-18 12:33:34'),
(106,'SKU-1750250014506-56','Regular Product','Test product: Regular Product',30.00,18.00,NULL,100,10,1,'2025-06-18 12:33:34','2025-06-18 12:33:34'),
(107,'SKU-1750250014512-219','Product 2','Test product: Product 2',25.50,15.30,NULL,100,10,1,'2025-06-18 12:33:34','2025-06-18 12:33:34'),
(108,'SKU-1750250014513-856','JavaScript Guide','Test product: JavaScript Guide',29.99,17.99,NULL,100,10,1,'2025-06-18 12:33:34','2025-06-18 12:33:34'),
(109,'SKU-1750250014516-664','Reviewed Product','Test product: Reviewed Product',149.99,89.99,NULL,100,10,1,'2025-06-18 12:33:34','2025-06-18 12:33:34'),
(110,'SKU-1750250014519-742','Product 1750250014519','Test product: Product 1750250014519',99.99,59.99,NULL,100,10,1,'2025-06-18 12:33:34','2025-06-18 12:33:34'),
(111,'SKU-1750250014522-451','Laptop','Test product: Laptop',999.99,599.99,NULL,100,10,1,'2025-06-18 12:33:34','2025-06-18 12:33:34'),
(112,'SKU-1750250014526-58','Concurrent Test Product','Test product: Concurrent Test Product',30.00,18.00,NULL,100,10,1,'2025-06-18 12:33:34','2025-06-18 12:33:34'),
(113,'SKU-1750250014531-755','High Stock Item','Test product: High Stock Item',25.00,15.00,NULL,100,10,1,'2025-06-18 12:33:34','2025-06-18 12:33:34'),
(114,'SKU-1750250014532-398','Product 1750250014532','Test product: Product 1750250014532',99.99,59.99,NULL,100,10,1,'2025-06-18 12:33:34','2025-06-18 12:33:34'),
(115,'SKU-1750250014538-847','Mouse','Test product: Mouse',29.99,17.99,NULL,100,10,1,'2025-06-18 12:33:34','2025-06-18 12:33:34'),
(116,'SKU-1750250014545-899','Low Stock Item','Test product: Low Stock Item',15.00,9.00,NULL,100,10,1,'2025-06-18 12:33:34','2025-06-18 12:33:34'),
(117,'SKU-1750250014550-287','Keyboard','Test product: Keyboard',79.99,47.99,NULL,100,10,1,'2025-06-18 12:33:34','2025-06-18 12:33:34'),
(118,'SKU-1750250014574-274','Product 1750250014574','Test product: Product 1750250014574',99.99,59.99,NULL,100,10,1,'2025-06-18 12:33:34','2025-06-18 12:33:34'),
(119,'TEST-SKU-1750250089087','Test Product 1750250089087','A test product for automation testing',99.99,50.00,43,100,10,1,'2025-06-18 12:34:49','2025-06-18 12:34:49'),
(120,'DUPLICATE-SKU-1750250089080','First Product 1750250089080',NULL,50.00,NULL,NULL,0,10,1,'2025-06-18 12:34:49','2025-06-18 12:34:49'),
(121,'SKU-1750250104268-937','Laptop','Test product: Laptop',999.99,599.99,NULL,100,10,1,'2025-06-18 12:35:04','2025-06-18 12:35:04'),
(122,'SKU-1750250104284-582','Product 1750250104284','Test product: Product 1750250104284',99.99,59.99,NULL,100,10,1,'2025-06-18 12:35:04','2025-06-18 12:35:04'),
(123,'SKU-1750250104285-431','JavaScript Guide','Test product: JavaScript Guide',29.99,17.99,NULL,100,10,1,'2025-06-18 12:35:04','2025-06-18 12:35:04'),
(124,'SKU-1750250104292-17','Product 1','Test product: Product 1',10.00,6.00,NULL,100,10,1,'2025-06-18 12:35:04','2025-06-18 12:35:04'),
(125,'SKU-1750250104285-970','Special Searchable Item','Test product: Special Searchable Item',50.00,30.00,NULL,100,10,1,'2025-06-18 12:35:04','2025-06-18 12:35:04'),
(126,'SKU-1750250104295-394','Product 1750250104295','Test product: Product 1750250104295',99.99,59.99,NULL,100,10,1,'2025-06-18 12:35:04','2025-06-18 12:35:04'),
(127,'SKU-1750250104295-464','Product 1750250104295','Test product: Product 1750250104295',99.99,59.99,NULL,100,10,1,'2025-06-18 12:35:04','2025-06-18 12:35:04'),
(128,'SKU-1750250104310-120','Product 2','Test product: Product 2',25.50,15.30,NULL,100,10,1,'2025-06-18 12:35:04','2025-06-18 12:35:04'),
(129,'SKU-1750250104313-605','Regular Product','Test product: Regular Product',30.00,18.00,NULL,100,10,1,'2025-06-18 12:35:04','2025-06-18 12:35:04'),
(130,'SKU-1750250220798-309','Product 1750250220798','Test product: Product 1750250220798',99.99,59.99,NULL,100,10,1,'2025-06-18 12:37:00','2025-06-18 12:37:00'),
(131,'SKU-1750250231422-728','Product 1750250231422','Test product: Product 1750250231422',99.99,59.99,NULL,100,10,1,'2025-06-18 12:37:11','2025-06-18 12:37:11'),
(132,'SKU-1750250242153-711','Product 1750250242153','Test product: Product 1750250242153',99.99,59.99,NULL,100,10,1,'2025-06-18 12:37:22','2025-06-18 12:37:22'),
(133,'SKU-1750250399325-612','Laptop','Test product: Laptop',999.99,599.99,48,100,10,1,'2025-06-18 12:39:59','2025-06-18 12:39:59'),
(134,'SKU-1750250399338-295','JavaScript Guide','Test product: JavaScript Guide',29.99,17.99,49,100,10,1,'2025-06-18 12:39:59','2025-06-18 12:39:59'),
(135,'SKU-1750250411659-406','Special Searchable Item','Test product: Special Searchable Item',50.00,30.00,NULL,100,10,1,'2025-06-18 12:40:11','2025-06-18 12:40:11'),
(136,'SKU-1750250411684-981','Regular Product','Test product: Regular Product',30.00,18.00,NULL,100,10,1,'2025-06-18 12:40:11','2025-06-18 12:40:11'),
(137,'SKU-1750250411684-473','Product 1','Test product: Product 1',10.00,6.00,NULL,100,10,1,'2025-06-18 12:40:11','2025-06-18 12:40:11'),
(138,'SKU-1750250411689-23','Laptop','Test product: Laptop',999.99,599.99,50,100,10,1,'2025-06-18 12:40:11','2025-06-18 12:40:11'),
(139,'SKU-1750250411690-65','Product 1750250411690','Test product: Product 1750250411690',99.99,59.99,NULL,100,10,1,'2025-06-18 12:40:11','2025-06-18 12:40:11'),
(140,'SKU-1750250411690-219','Product 1750250411690','Test product: Product 1750250411690',99.99,59.99,NULL,100,10,1,'2025-06-18 12:40:11','2025-06-18 12:40:11'),
(141,'SKU-1750250411695-762','Product 2','Test product: Product 2',25.50,15.30,NULL,100,10,1,'2025-06-18 12:40:11','2025-06-18 12:40:11'),
(142,'SKU-1750250411701-977','JavaScript Guide','Test product: JavaScript Guide',29.99,17.99,51,100,10,1,'2025-06-18 12:40:11','2025-06-18 12:40:11'),
(143,'SKU-1750250411718-245','Product 1750250411718','Test product: Product 1750250411718',99.99,59.99,NULL,100,10,1,'2025-06-18 12:40:11','2025-06-18 12:40:11');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `rating` int(11) NOT NULL CHECK (`rating` >= 1 and `rating` <= 5),
  `title` varchar(200) DEFAULT NULL,
  `comment` text DEFAULT NULL,
  `is_verified_purchase` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_product` (`user_id`,`product_id`),
  KEY `idx_product_rating` (`product_id`,`rating`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `reviews` (`id`, `product_id`, `user_id`, `rating`, `title`, `comment`, `is_verified_purchase`, `created_at`, `updated_at`) VALUES (1,1,1,5,'Excellent laptop!','Fast, lightweight, and great battery life.',1,'2025-06-11 10:18:02','2025-06-11 10:18:02'),
(2,1,2,4,'Good but pricey','Great performance but expensive.',0,'2025-06-11 10:18:02','2025-06-11 10:18:02'),
(3,3,4,5,'Best phone ever','Amazing camera and battery life.',1,'2025-06-11 10:18:02','2025-06-11 10:18:02'),
(4,6,2,5,'Perfect fit','Comfortable and looks great.',1,'2025-06-11 10:18:02','2025-06-11 10:18:02'),
(5,10,1,4,'Good read','Engaging story, well written.',1,'2025-06-11 10:18:02','2025-06-11 10:18:02'),
(6,12,3,5,'Must-have for developers','Comprehensive SQL guide.',0,'2025-06-11 10:18:02','2025-06-11 10:18:02'),
(7,16,5,3,'Decent quality','Good for beginners, not for professionals.',1,'2025-06-11 10:18:02','2025-06-11 10:18:02'),
(8,34,16,5,'Excellent!','Love this product',0,'2025-06-18 12:33:04','2025-06-18 12:33:04'),
(9,34,21,4,'Good quality','Works as expected',0,'2025-06-18 12:33:04','2025-06-18 12:33:04'),
(10,34,23,3,'Average','Could be better',0,'2025-06-18 12:33:04','2025-06-18 12:33:04'),
(11,38,22,3,'Valid rating test','This should work fine',0,'2025-06-18 12:33:04','2025-06-18 12:33:04'),
(12,55,34,3,'Valid rating test','This should work fine',0,'2025-06-18 12:33:05','2025-06-18 12:33:05'),
(13,78,46,3,'Valid rating test','This should work fine',0,'2025-06-18 12:33:06','2025-06-18 12:33:06'),
(14,98,60,3,'Valid rating test','This should work fine',0,'2025-06-18 12:33:17','2025-06-18 12:33:17'),
(15,118,72,3,'Valid rating test','This should work fine',0,'2025-06-18 12:33:34','2025-06-18 12:33:34');
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `first_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_active` tinyint(1) DEFAULT 1,
  `last_login` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=91 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `first_name`, `last_name`, `phone`, `created_at`, `updated_at`, `is_active`, `last_login`) VALUES (1,'johndoe','john.doe@email.com','hash123','John','Doe','555-0101','2025-06-11 10:18:02','2025-06-11 10:18:02',1,'2025-05-13 10:18:02'),
(2,'janesmith','jane.smith@email.com','hash456','Jane','Smith','555-0102','2025-06-11 10:18:02','2025-06-11 10:18:02',1,'2025-06-09 10:18:02'),
(3,'bobwilson','bob.wilson@email.com','hash789','Bob','Wilson','555-0103','2025-06-11 10:18:02','2025-06-11 10:18:02',1,'2025-05-29 10:18:02'),
(4,'alicebrown','alice.brown@email.com','hash012','Alice','Brown','555-0104','2025-06-11 10:18:02','2025-06-11 10:18:02',1,'2025-05-14 10:18:02'),
(5,'charlieclark','charlie.clark@email.com','hash345','Charlie','Clark','555-0105','2025-06-11 10:18:02','2025-06-11 10:18:02',1,'2025-05-30 10:18:02'),
(6,'testuser1','test1@example.com','hash111','Test','User1','555-0201','2025-06-11 10:18:02','2025-06-11 10:18:02',1,NULL),
(7,'testuser2','test2@example.com','hash222','Test','User2','555-0202','2025-06-11 10:18:02','2025-06-11 10:18:02',1,NULL),
(8,'testuser3','test3@example.com','hash333','Test','User3','555-0203','2025-06-11 10:18:02','2025-06-11 10:18:02',1,NULL),
(9,'testuser_1750249984300','test_1750249984300@example.com','hashed_password_123','Test','User','+1234567890','2025-06-18 12:33:04','2025-06-18 12:33:04',1,NULL),
(10,'duplicate_test_1750249984348','unique1_1750249984348@example.com','hashed_password',NULL,NULL,NULL,'2025-06-18 12:33:04','2025-06-18 12:33:04',1,NULL),
(11,'updatetest_1750249984359','update_1750249984359@example.com','hashed_password','Updated','NewName','+1987654321','2025-06-18 12:33:04','2025-06-18 12:33:04',1,NULL),
(12,'testuser_1750249984362','test_1750249984362@example.com','hashed_password','Test','User',NULL,'2025-06-18 12:33:04','2025-06-18 12:33:04',1,NULL),
(14,'testuser_1750249984384','test_1750249984384@example.com','hashed_password','Test','User',NULL,'2025-06-18 12:33:04','2025-06-18 12:33:04',1,NULL),
(15,'testuser_1750249984393','test_1750249984393@example.com','hashed_password','Test','User',NULL,'2025-06-18 12:33:04','2025-06-18 12:33:04',1,NULL),
(16,'testuser_reviewer1','test_reviewer1@example.com','hashed_password','Test','User','+1234567890','2025-06-18 12:33:04','2025-06-18 12:33:04',1,NULL),
(17,'testuser_1750249984406','test_1750249984406@example.com','hashed_password','Test','User','+1234567890','2025-06-18 12:33:04','2025-06-18 12:33:04',1,NULL),
(18,'testuser_1750249984405','test_1750249984405@example.com','hashed_password','Test','User','+1234567890','2025-06-18 12:33:04','2025-06-18 12:33:04',1,NULL),
(19,'testuser_1750249984402','test_1750249984402@example.com','hashed_password','Test','User','+1234567890','2025-06-18 12:33:04','2025-06-18 12:33:04',1,NULL),
(20,'testuser_1750249984398','test_1750249984398@example.com','hashed_password','Test','User',NULL,'2025-06-18 12:33:04','2025-06-18 12:33:04',1,NULL),
(21,'testuser_reviewer2','test_reviewer2@example.com','hashed_password','Test','User','+1234567890','2025-06-18 12:33:04','2025-06-18 12:33:04',1,NULL),
(22,'testuser_1750249984420','test_1750249984420@example.com','hashed_password','Test','User','+1234567890','2025-06-18 12:33:04','2025-06-18 12:33:04',1,NULL),
(23,'testuser_reviewer3','test_reviewer3@example.com','hashed_password','Test','User','+1234567890','2025-06-18 12:33:04','2025-06-18 12:33:04',1,NULL),
(24,'testuser_1750249984436','test_1750249984436@example.com','hashed_password','Test','User','+1234567890','2025-06-18 12:33:04','2025-06-18 12:33:04',1,NULL),
(25,'duplicate_test_1750249985267','unique1_1750249985267@example.com','hashed_password',NULL,NULL,NULL,'2025-06-18 12:33:05','2025-06-18 12:33:05',1,NULL),
(26,'testuser_1750249985282','test_1750249985282@example.com','hashed_password','Test','User',NULL,'2025-06-18 12:33:05','2025-06-18 12:33:05',1,NULL),
(27,'updatetest_1750249985285','update_1750249985285@example.com','hashed_password','Updated','NewName','+1987654321','2025-06-18 12:33:05','2025-06-18 12:33:05',1,NULL),
(28,'testuser_1750249985303','test_1750249985303@example.com','hashed_password','Test','User',NULL,'2025-06-18 12:33:05','2025-06-18 12:33:05',1,NULL),
(30,'testuser_1750249985320','test_1750249985320@example.com','hashed_password','Test','User',NULL,'2025-06-18 12:33:05','2025-06-18 12:33:05',1,NULL),
(31,'testuser_1750249985334','test_1750249985334@example.com','hashed_password','Test','User','+1234567890','2025-06-18 12:33:05','2025-06-18 12:33:05',1,NULL),
(32,'testuser_1750249985350','test_1750249985350@example.com','hashed_password','Test','User','+1234567890','2025-06-18 12:33:05','2025-06-18 12:33:05',1,NULL),
(33,'testuser_1750249985359','test_1750249985359@example.com','hashed_password','Test','User','+1234567890','2025-06-18 12:33:05','2025-06-18 12:33:05',1,NULL),
(34,'testuser_1750249985367','test_1750249985367@example.com','hashed_password','Test','User','+1234567890','2025-06-18 12:33:05','2025-06-18 12:33:05',1,NULL),
(35,'testuser_1750249985996','test_1750249985996@example.com','hashed_password','Test','User','+1234567890','2025-06-18 12:33:06','2025-06-18 12:33:06',1,NULL),
(36,'duplicate_test_1750249986176','unique1_1750249986176@example.com','hashed_password',NULL,NULL,NULL,'2025-06-18 12:33:06','2025-06-18 12:33:06',1,NULL),
(37,'updatetest_1750249986194','update_1750249986194@example.com','hashed_password','Updated','NewName','+1987654321','2025-06-18 12:33:06','2025-06-18 12:33:06',1,NULL),
(38,'testuser_1750249986207','test_1750249986207@example.com','hashed_password','Test','User',NULL,'2025-06-18 12:33:06','2025-06-18 12:33:06',1,NULL),
(39,'testuser_1750249986216','test_1750249986216@example.com','hashed_password','Test','User',NULL,'2025-06-18 12:33:06','2025-06-18 12:33:06',1,NULL),
(41,'testuser_1750249986224','test_1750249986224@example.com','hashed_password','Test','User',NULL,'2025-06-18 12:33:06','2025-06-18 12:33:06',1,NULL),
(42,'testuser_1750249986226','test_1750249986226@example.com','hashed_password','Test','User',NULL,'2025-06-18 12:33:06','2025-06-18 12:33:06',1,NULL),
(43,'testuser_1750249986230','test_1750249986230@example.com','hashed_password','Test','User','+1234567890','2025-06-18 12:33:06','2025-06-18 12:33:06',1,NULL),
(44,'testuser_1750249986238','test_1750249986238@example.com','hashed_password','Test','User','+1234567890','2025-06-18 12:33:06','2025-06-18 12:33:06',1,NULL),
(45,'testuser_1750249986242','test_1750249986242@example.com','hashed_password','Test','User','+1234567890','2025-06-18 12:33:06','2025-06-18 12:33:06',1,NULL),
(46,'testuser_1750249986289','test_1750249986289@example.com','hashed_password','Test','User','+1234567890','2025-06-18 12:33:06','2025-06-18 12:33:06',1,NULL),
(47,'testuser_1750249986290','test_1750249986290@example.com','hashed_password','Test','User','+1234567890','2025-06-18 12:33:06','2025-06-18 12:33:06',1,NULL),
(48,'testuser_1750249997071','test_1750249997071@example.com','hashed_password_123','Test','User','+1234567890','2025-06-18 12:33:17','2025-06-18 12:33:17',1,NULL),
(49,'duplicate_test_1750249997118','unique1_1750249997118@example.com','hashed_password',NULL,NULL,NULL,'2025-06-18 12:33:17','2025-06-18 12:33:17',1,NULL),
(50,'updatetest_1750249997134','update_1750249997134@example.com','hashed_password','Updated','NewName','+1987654321','2025-06-18 12:33:17','2025-06-18 12:33:17',1,NULL),
(51,'testuser_1750249997144','test_1750249997144@example.com','hashed_password','Test','User',NULL,'2025-06-18 12:33:17','2025-06-18 12:33:17',1,NULL),
(52,'testuser_1750249997145','test_1750249997145@example.com','hashed_password','Test','User',NULL,'2025-06-18 12:33:17','2025-06-18 12:33:17',1,NULL),
(53,'testuser_1750249997147','test_1750249997147@example.com','hashed_password','Test','User',NULL,'2025-06-18 12:33:17','2025-06-18 12:33:17',1,NULL),
(55,'testuser_1750249997162','test_1750249997162@example.com','hashed_password','Test','User',NULL,'2025-06-18 12:33:17','2025-06-18 12:33:17',1,NULL),
(56,'testuser_1750249997164','test_1750249997164@example.com','hashed_password','Test','User','+1234567890','2025-06-18 12:33:17','2025-06-18 12:33:17',1,NULL),
(57,'testuser_1750249997165','test_1750249997165@example.com','hashed_password','Test','User','+1234567890','2025-06-18 12:33:17','2025-06-18 12:33:17',1,NULL),
(59,'testuser_1750249997190','test_1750249997190@example.com','hashed_password','Test','User','+1234567890','2025-06-18 12:33:17','2025-06-18 12:33:17',1,NULL),
(60,'testuser_1750249997755','test_1750249997755@example.com','hashed_password','Test','User','+1234567890','2025-06-18 12:33:17','2025-06-18 12:33:17',1,NULL),
(61,'testuser_1750250014444','test_1750250014444@example.com','hashed_password_123','Test','User','+1234567890','2025-06-18 12:33:34','2025-06-18 12:33:34',1,NULL),
(62,'duplicate_test_1750250014468','unique1_1750250014468@example.com','hashed_password',NULL,NULL,NULL,'2025-06-18 12:33:34','2025-06-18 12:33:34',1,NULL),
(63,'updatetest_1750250014472','update_1750250014472@example.com','hashed_password','Updated','NewName','+1987654321','2025-06-18 12:33:34','2025-06-18 12:33:34',1,NULL),
(64,'testuser_1750250014472','test_1750250014472@example.com','hashed_password','Test','User',NULL,'2025-06-18 12:33:34','2025-06-18 12:33:34',1,NULL),
(65,'testuser_1750250014482','test_1750250014482@example.com','hashed_password','Test','User',NULL,'2025-06-18 12:33:34','2025-06-18 12:33:34',1,NULL),
(66,'testuser_1750250014487','test_1750250014487@example.com','hashed_password','Test','User',NULL,'2025-06-18 12:33:34','2025-06-18 12:33:34',1,NULL),
(68,'testuser_1750250014503','test_1750250014503@example.com','hashed_password','Test','User',NULL,'2025-06-18 12:33:34','2025-06-18 12:33:34',1,NULL),
(69,'testuser_1750250014504','test_1750250014504@example.com','hashed_password','Test','User','+1234567890','2025-06-18 12:33:34','2025-06-18 12:33:34',1,NULL),
(70,'testuser_1750250014510','test_1750250014510@example.com','hashed_password','Test','User','+1234567890','2025-06-18 12:33:34','2025-06-18 12:33:34',1,NULL),
(71,'testuser_1750250014512','test_1750250014512@example.com','hashed_password','Test','User','+1234567890','2025-06-18 12:33:34','2025-06-18 12:33:34',1,NULL),
(72,'testuser_1750250014517','test_1750250014517@example.com','hashed_password','Test','User','+1234567890','2025-06-18 12:33:34','2025-06-18 12:33:34',1,NULL),
(73,'testuser_1750250014528','test_1750250014528@example.com','hashed_password','Test','User','+1234567890','2025-06-18 12:33:34','2025-06-18 12:33:34',1,NULL),
(74,'testuser_1750250089058','test_1750250089058@example.com','hashed_password_123','Test','User','+1234567890','2025-06-18 12:34:49','2025-06-18 12:34:49',1,NULL),
(75,'duplicate_test_1750250089065','unique1_1750250089065@example.com','hashed_password',NULL,NULL,NULL,'2025-06-18 12:34:49','2025-06-18 12:34:49',1,NULL),
(76,'updatetest_1750250104252','update_1750250104252@example.com','hashed_password','Updated','NewName','+1987654321','2025-06-18 12:35:04','2025-06-18 12:35:04',1,NULL),
(77,'testuser_1750250104252','test_1750250104252@example.com','hashed_password','Test','User',NULL,'2025-06-18 12:35:04','2025-06-18 12:35:04',1,NULL),
(78,'testuser_1750250104254','test_1750250104254@example.com','hashed_password','Test','User',NULL,'2025-06-18 12:35:04','2025-06-18 12:35:04',1,NULL),
(82,'testuser_1750250220776','test_1750250220776@example.com','hashed_password','Test','User',NULL,'2025-06-18 12:37:00','2025-06-18 12:37:00',1,NULL),
(83,'testuser_1750250231399','test_1750250231399@example.com','hashed_password','Test','User',NULL,'2025-06-18 12:37:11','2025-06-18 12:37:11',1,NULL),
(84,'testuser_1750250242130','test_1750250242130@example.com','hashed_password','Test','User',NULL,'2025-06-18 12:37:22','2025-06-18 12:37:22',1,NULL),
(85,'testuser_1750250411652','test_1750250411652@example.com','hashed_password','Test','User',NULL,'2025-06-18 12:40:11','2025-06-18 12:40:11',1,NULL),
(87,'updatetest_1750250411661','update_1750250411661@example.com','hashed_password','Updated','NewName','+1987654321','2025-06-18 12:40:11','2025-06-18 12:40:11',1,NULL),
(88,'testuser_1750250411665','test_1750250411665@example.com','hashed_password','Test','User',NULL,'2025-06-18 12:40:11','2025-06-18 12:40:11',1,NULL),
(89,'testuser_1750250411667','test_1750250411667@example.com','hashed_password','Test','User',NULL,'2025-06-18 12:40:11','2025-06-18 12:40:11',1,NULL),
(90,'testuser_1750250411685','test_1750250411685@example.com','hashed_password','Test','User',NULL,'2025-06-18 12:40:11','2025-06-18 12:40:11',1,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Dumping routines for database 'sql_training'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2025-06-18 14:46:01
