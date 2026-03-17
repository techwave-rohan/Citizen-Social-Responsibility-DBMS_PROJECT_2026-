-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: csr_auth
-- ------------------------------------------------------
-- Server version	9.4.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_roles` (
  `user_id` int NOT NULL,
  `role` enum('admin','official','citizen','analyst') NOT NULL,
  PRIMARY KEY (`user_id`,`role`),
  KEY `idx_user_roles_uid` (`user_id`),
  CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users_auth` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
INSERT INTO `user_roles` VALUES (1,'citizen'),(2,'citizen'),(3,'admin'),(4,'admin'),(6,'analyst'),(7,'analyst'),(8,'admin'),(9,'official'),(10,'citizen'),(11,'official'),(12,'admin'),(13,'admin'),(14,'citizen');
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users_auth`
--

DROP TABLE IF EXISTS `users_auth`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users_auth` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `status` enum('active','inactive','suspended') DEFAULT 'active',
  `last_login` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `failed_attempts` int DEFAULT '0',
  `lockout_until` bigint DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users_auth`
--

LOCK TABLES `users_auth` WRITE;
/*!40000 ALTER TABLE `users_auth` DISABLE KEYS */;
INSERT INTO `users_auth` VALUES (1,'999999999998','$2b$12$1tlPwD6mFfd5DZ/hgcxndearcGZZORaJ7kuFZXH3cHYg.H.CQ8MZq','active','2026-03-16 16:22:05',0,0,'2026-03-16 16:22:05'),(2,'123456789017','$2b$12$oCk96a7E3p9ggl2GxQ62wegFyUIrCSOWODdCR9cjycc0NJO9QkfEa','active','2026-03-16 16:25:21',0,0,'2026-03-16 16:25:21'),(3,'superadmin@gov.in','$2b$12$rvpLk5UKCoXYFQkOpWPYeu3a534N8mmSY.4lBtdWS7MAgGmZuwcqK','active','2026-03-16 16:57:30',0,0,'2026-03-16 16:57:30'),(4,'rohan@gamil.com','$2b$12$OW.zlQ9ElUd/sF7jWGWas.JrC.TBZKWbF4kS6TylBTUnTIjP9XROW','active','2026-03-16 17:03:10',0,0,'2026-03-16 17:03:10'),(6,'analyst2@gov.in','$2b$12$QQV.G/c08vYMu5f4EMaraOota.c0by1LjQrj4H6NKVHmBNovcdalG','active','2026-03-16 17:16:17',0,0,'2026-03-16 17:16:17'),(7,'loganalyst@gov.in','$2b$12$4OLTMUEfkvczatpITrnQauaatrChp486mo7gSza2XQKfKPhDoTMkO','active','2026-03-16 17:21:00',0,0,'2026-03-16 17:21:00'),(8,'rohankashyap783@gmail.com','$2b$12$ZcfoFAMd7JKDobTPW2NSUeu7FBG8WYJxIRfY9XZfKyphtHcO0E2lG','active','2026-03-16 18:28:39',0,0,'2026-03-16 18:28:39'),(9,'rohankashyap@gmail.com','$2b$12$xKWZMJFd5InLWJSGbpQO1OzayucnhWjmDEr8Pdi71yoGCPaKicToe','active','2026-03-16 18:30:05',0,0,'2026-03-16 18:30:05'),(10,'123456789018','$2b$12$iPrKONwXIbTn9lbvKzgk1.o6Fty8RYQunhz0y5QE2nqwvOd.QSK.G','active','2026-03-16 18:32:47',0,0,'2026-03-16 18:32:47'),(11,'gov@gmail.com','$2b$12$F4q0rJGH1gZjA4ugjz5Gu.z2dM.s/bEZnyu6iUkAv3/aHdkF6dChW','active','2026-03-17 07:43:29',0,0,'2026-03-17 07:43:29'),(12,'admin@gmail.com','$2b$12$WyaAcsQufIqB40Ow6Ty9oeWGztsmhBGfFzQ.DM4.99Lpj/Wk0UTIW','active','2026-03-17 07:50:57',0,0,'2026-03-17 07:50:57'),(13,'admin1@gmail.com','$2b$12$zb/b9qMS8Vs1Ml0tWE/nneLHs3VYHqSlqOP8kPFDv6KXe0zLKDZCy','active','2026-03-17 08:12:22',0,0,'2026-03-17 08:12:22'),(14,'481561230231','$2b$12$iBmqjdQgC8gtEsz0Df90ZO10xEXz6hNcKgNz2BEDo.Vm2SmEWcKqy','active','2026-03-17 15:20:04',0,0,'2026-03-17 15:20:04');
/*!40000 ALTER TABLE `users_auth` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-18  0:29:49
