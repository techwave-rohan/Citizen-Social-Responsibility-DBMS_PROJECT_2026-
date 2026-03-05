CREATE DATABASE  IF NOT EXISTS `csr_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `csr_db`;
-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: csr_db
-- ------------------------------------------------------
-- Server version	8.0.43

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
-- Table structure for table `action_agegroup`
--

DROP TABLE IF EXISTS `action_agegroup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `action_agegroup` (
  `ActionTypeID` int NOT NULL,
  `AgeGroupID` int NOT NULL,
  PRIMARY KEY (`ActionTypeID`,`AgeGroupID`),
  KEY `AgeGroupID` (`AgeGroupID`),
  CONSTRAINT `action_agegroup_ibfk_1` FOREIGN KEY (`ActionTypeID`) REFERENCES `action_type` (`ActionTypeID`),
  CONSTRAINT `action_agegroup_ibfk_2` FOREIGN KEY (`AgeGroupID`) REFERENCES `agegroup` (`AgeGroupID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `action_agegroup`
--

LOCK TABLES `action_agegroup` WRITE;
/*!40000 ALTER TABLE `action_agegroup` DISABLE KEYS */;
INSERT INTO `action_agegroup` VALUES (1,2),(2,2),(3,2),(4,2),(5,2),(6,2),(7,2),(8,2),(9,2),(10,2),(11,2),(12,2),(13,2),(14,2),(15,2),(3,3);
/*!40000 ALTER TABLE `action_agegroup` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `action_type`
--

DROP TABLE IF EXISTS `action_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `action_type` (
  `ActionTypeID` int NOT NULL,
  `ActionName` varchar(100) NOT NULL,
  `ScoreImpact` int NOT NULL,
  `Severity` int DEFAULT NULL,
  PRIMARY KEY (`ActionTypeID`),
  CONSTRAINT `action_type_chk_1` CHECK ((`Severity` between 1 and 5))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `action_type`
--

LOCK TABLES `action_type` WRITE;
/*!40000 ALTER TABLE `action_type` DISABLE KEYS */;
INSERT INTO `action_type` VALUES (1,'traffic rule violation',-10,3),(2,'Timely tax payement',15,2),(3,'Community service',20,1),(4,'Voting Participation',10,1),(5,'Illegal Parking',-5,2),(6,'Littering',-8,2),(7,'Blood Donation',25,1),(8,'Public Complaint Filed',5,1),(9,'Noise Pollution',-7,2),(10,'Tree Plantation',20,1),(11,'Electricity Theft',-20,4),(12,'Water Wastage',-6,2),(13,'Govt Scheme Participation',15,1),(14,'Road Safety Campaign',10,1),(15,'Bribery Offense',-30,5);
/*!40000 ALTER TABLE `action_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `agegroup`
--

DROP TABLE IF EXISTS `agegroup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `agegroup` (
  `AgeGroupID` int NOT NULL,
  `GroupName` varchar(50) NOT NULL,
  `MinAge` int NOT NULL,
  `MaxAge` int NOT NULL,
  PRIMARY KEY (`AgeGroupID`),
  CONSTRAINT `agegroup_chk_1` CHECK ((`MinAge` <= `MaxAge`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `agegroup`
--

LOCK TABLES `agegroup` WRITE;
/*!40000 ALTER TABLE `agegroup` DISABLE KEYS */;
INSERT INTO `agegroup` VALUES (1,'Teenager',13,19),(2,'Adult',20,59),(3,'Senior Citizen',60,100);
/*!40000 ALTER TABLE `agegroup` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `benefit`
--

DROP TABLE IF EXISTS `benefit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `benefit` (
  `BenefitID` int NOT NULL,
  `BenefitName` varchar(100) NOT NULL,
  `MinScoreRequired` int NOT NULL,
  PRIMARY KEY (`BenefitID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `benefit`
--

LOCK TABLES `benefit` WRITE;
/*!40000 ALTER TABLE `benefit` DISABLE KEYS */;
INSERT INTO `benefit` VALUES (1,'Priority Loan Approval',80),(2,'Fast Government Services',70),(3,'Public Recognition',90),(4,'Tax Rebate',85),(5,'Housing Priority',75),(6,'Medical Assistance',70),(7,'Education Scholarship',80),(8,'Travel Concession',65),(9,'Startup Grant',90),(10,'Skill Training',60),(11,'Insurance Benefits',70),(12,'Utility Discount',65),(13,'Employment Preference',85),(14,'Award Certificate',90),(15,'Senior Citizen Perks',60);
/*!40000 ALTER TABLE `benefit` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `citizen`
--

DROP TABLE IF EXISTS `citizen`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `citizen` (
  `CitizenID` int NOT NULL,
  `AadhaarNumber` char(12) NOT NULL,
  `FirstName` varchar(50) DEFAULT NULL,
  `LastName` varchar(50) DEFAULT NULL,
  `DOB` date NOT NULL,
  `City` varchar(50) DEFAULT NULL,
  `ContactNo` varchar(15) DEFAULT NULL,
  `CurrentScore` int DEFAULT '0',
  `AgeGroupID` int NOT NULL,
  PRIMARY KEY (`CitizenID`),
  UNIQUE KEY `AadhaarNumber` (`AadhaarNumber`),
  KEY `AgeGroupID` (`AgeGroupID`),
  KEY `idx_citizen_city` (`City`),
  CONSTRAINT `citizen_ibfk_1` FOREIGN KEY (`AgeGroupID`) REFERENCES `agegroup` (`AgeGroupID`),
  CONSTRAINT `citizen_chk_1` CHECK ((`CurrentScore` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `citizen`
--

LOCK TABLES `citizen` WRITE;
/*!40000 ALTER TABLE `citizen` DISABLE KEYS */;
INSERT INTO `citizen` VALUES (101,'123456789012','Rohan','kashyap','2005-11-29','Delhi','9998712300',85,2),(102,'234567890123','xyz','abc','2004-03-04','Mumbai','9953917192',45,2),(103,'333333333333','Suresh','Verma','1960-01-15','Delhi','9000000003',90,3),(104,'444444444444','Neha','Singh','2001-03-10','Pune','9000000004',78,2),(105,'555555555555','Kunal','Mehta','1998-07-21','Ahmedabad','9000000005',55,2),(106,'666666666666','Anita','Gupta','1975-09-09','Delhi','9000000006',88,2),(107,'777777777777','Rahul','Yadav','1992-11-30','Noida','9000000007',60,2),(108,'888888888888','Pooja','Nair','2000-12-25','Kochi','9000000008',82,2),(109,'999999999999','Vikas','Patel','1985-06-18','Surat','9000000009',72,2),(110,'101010101010','Sunita','Rao','1965-02-14','Bhopal','9000000010',91,3),(111,'121212121212','Arjun','Malik','2004-04-04','Jaipur','9000000011',68,2),(112,'131313131313','Meena','Joshi','1970-10-10','Indore','9000000012',76,2),(113,'141414141414','Deepak','Chauhan','1990-01-01','Agra','9000000013',63,2),(114,'151515151515','Kavita','Iyer','1982-08-08','Chennai','9000000014',84,2),(115,'161616161616','Mohan','Das','1958-05-05','Trivandrum','9000000015',87,3);
/*!40000 ALTER TABLE `citizen` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `citizen_action_record`
--

DROP TABLE IF EXISTS `citizen_action_record`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `citizen_action_record` (
  `RecordID` int NOT NULL,
  `CitizenID` int NOT NULL,
  `ActionTypeID` int NOT NULL,
  `OfficialID` int NOT NULL,
  `ActionDate` date NOT NULL,
  PRIMARY KEY (`RecordID`),
  KEY `ActionTypeID` (`ActionTypeID`),
  KEY `OfficialID` (`OfficialID`),
  KEY `idx_actionrecord_citizen` (`CitizenID`),
  CONSTRAINT `citizen_action_record_ibfk_1` FOREIGN KEY (`CitizenID`) REFERENCES `citizen` (`CitizenID`),
  CONSTRAINT `citizen_action_record_ibfk_2` FOREIGN KEY (`ActionTypeID`) REFERENCES `action_type` (`ActionTypeID`),
  CONSTRAINT `citizen_action_record_ibfk_3` FOREIGN KEY (`OfficialID`) REFERENCES `government_official` (`OfficialID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `citizen_action_record`
--

LOCK TABLES `citizen_action_record` WRITE;
/*!40000 ALTER TABLE `citizen_action_record` DISABLE KEYS */;
INSERT INTO `citizen_action_record` VALUES (1,101,2,1,'2005-11-29'),(2,102,1,1,'2025-01-02'),(3,103,3,3,'2025-01-03'),(4,104,4,4,'2025-01-04'),(5,105,5,5,'2025-01-05'),(6,106,6,6,'2025-01-06'),(7,107,7,7,'2025-01-07'),(8,108,8,8,'2025-01-08'),(9,109,9,9,'2025-01-09'),(10,110,10,10,'2025-01-10'),(11,111,11,11,'2025-01-11'),(12,112,12,12,'2025-01-12'),(13,113,13,13,'2025-01-13'),(14,114,14,14,'2025-01-14'),(15,115,15,15,'2025-01-15');
/*!40000 ALTER TABLE `citizen_action_record` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `citizen_benefit`
--

DROP TABLE IF EXISTS `citizen_benefit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `citizen_benefit` (
  `CitizenID` int NOT NULL,
  `BenefitID` int NOT NULL,
  `GrantedDate` date DEFAULT NULL,
  PRIMARY KEY (`CitizenID`,`BenefitID`),
  KEY `BenefitID` (`BenefitID`),
  CONSTRAINT `citizen_benefit_ibfk_1` FOREIGN KEY (`CitizenID`) REFERENCES `citizen` (`CitizenID`),
  CONSTRAINT `citizen_benefit_ibfk_2` FOREIGN KEY (`BenefitID`) REFERENCES `benefit` (`BenefitID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `citizen_benefit`
--

LOCK TABLES `citizen_benefit` WRITE;
/*!40000 ALTER TABLE `citizen_benefit` DISABLE KEYS */;
INSERT INTO `citizen_benefit` VALUES (101,1,'2025-01-20'),(102,1,'2025-01-20'),(103,3,'2025-01-22'),(104,4,'2025-01-23'),(105,5,'2025-01-24'),(106,6,'2025-01-25'),(107,7,'2025-01-26'),(108,8,'2025-01-27'),(109,9,'2025-01-28'),(110,10,'2025-01-29'),(111,11,'2025-01-30'),(112,12,'2025-01-31'),(113,13,'2025-02-01'),(114,14,'2025-02-02'),(115,15,'2025-02-03');
/*!40000 ALTER TABLE `citizen_benefit` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `complaint`
--

DROP TABLE IF EXISTS `complaint`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `complaint` (
  `ComplaintID` int NOT NULL,
  `FiledByCitizenID` int NOT NULL,
  `AgainstCitizenID` int NOT NULL,
  `Description` text,
  `Status` varchar(30) DEFAULT NULL,
  `FiledDate` date DEFAULT NULL,
  PRIMARY KEY (`ComplaintID`),
  KEY `FiledByCitizenID` (`FiledByCitizenID`),
  KEY `idx_complaint_against` (`AgainstCitizenID`),
  CONSTRAINT `complaint_ibfk_1` FOREIGN KEY (`FiledByCitizenID`) REFERENCES `citizen` (`CitizenID`),
  CONSTRAINT `complaint_ibfk_2` FOREIGN KEY (`AgainstCitizenID`) REFERENCES `citizen` (`CitizenID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `complaint`
--

LOCK TABLES `complaint` WRITE;
/*!40000 ALTER TABLE `complaint` DISABLE KEYS */;
INSERT INTO `complaint` VALUES (1,101,102,'Reckless driving complaint','Reviewed','2025-01-13'),(3,103,104,'Illegal parking','Reviewed','2025-01-03'),(4,104,105,'Littering','Pending','2025-01-04'),(5,105,106,'Water wastage','Reviewed','2025-01-05'),(6,106,107,'Traffic issue','Pending','2025-01-06'),(7,107,108,'Noise','Reviewed','2025-01-07'),(8,108,109,'Illegal dumping','Pending','2025-01-08'),(9,109,110,'Power theft','Reviewed','2025-01-09'),(10,110,111,'Bribery','Pending','2025-01-10'),(11,111,112,'Parking','Reviewed','2025-01-11'),(12,112,113,'Pollution','Pending','2025-01-12'),(13,113,114,'Littering','Reviewed','2025-01-13'),(14,114,115,'Noise','Pending','2025-01-14'),(15,115,101,'Traffic','Reviewed','2025-01-15');
/*!40000 ALTER TABLE `complaint` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `department`
--

DROP TABLE IF EXISTS `department`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `department` (
  `DepartmentID` int NOT NULL,
  `DepartmentName` varchar(100) NOT NULL,
  PRIMARY KEY (`DepartmentID`),
  UNIQUE KEY `DepartmentName` (`DepartmentName`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `department`
--

LOCK TABLES `department` WRITE;
/*!40000 ALTER TABLE `department` DISABLE KEYS */;
INSERT INTO `department` VALUES (14,'Child Welfare Dept'),(5,'Education Department'),(10,'Electricity Board'),(11,'Environmental Dept'),(4,'Health Department'),(8,'Housing Board'),(2,'Income Tax Department'),(12,'Labour Department'),(3,'Municipal Corporation'),(6,'Police Department'),(1,'Traffic Department'),(7,'Transport Authority'),(15,'Urban Development'),(9,'Water Supply Board'),(13,'Women Welfare Dept');
/*!40000 ALTER TABLE `department` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `government_official`
--

DROP TABLE IF EXISTS `government_official`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `government_official` (
  `OfficialID` int NOT NULL,
  `FirstName` varchar(50) DEFAULT NULL,
  `LastName` varchar(50) DEFAULT NULL,
  `Designation` varchar(50) DEFAULT NULL,
  `DepartmentID` int NOT NULL,
  PRIMARY KEY (`OfficialID`),
  KEY `DepartmentID` (`DepartmentID`),
  CONSTRAINT `government_official_ibfk_1` FOREIGN KEY (`DepartmentID`) REFERENCES `department` (`DepartmentID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `government_official`
--

LOCK TABLES `government_official` WRITE;
/*!40000 ALTER TABLE `government_official` DISABLE KEYS */;
INSERT INTO `government_official` VALUES (1,'swastik','jaiswal','Inspector',1),(2,'Anita','Gupta','Officer',2),(3,'Sanjay','Patil','Clerk',3),(4,'Ritu','Kapoor','Officer',4),(5,'Amit','Bansal','Manager',5),(6,'Vivek','Sharma','Inspector',6),(7,'Neeraj','Khanna','Officer',7),(8,'Kiran','Joshi','Supervisor',8),(9,'Pankaj','Verma','Engineer',9),(10,'Seema','Arora','Engineer',10),(11,'Rakesh','Nair','Officer',11),(12,'Sunil','Mishra','Officer',12),(13,'Anjali','Reddy','Coordinator',13),(14,'Manoj','Singh','Inspector',14),(15,'Deepa','Kulkarni','Planner',15);
/*!40000 ALTER TABLE `government_official` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `restriction`
--

DROP TABLE IF EXISTS `restriction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `restriction` (
  `RestrictionID` int NOT NULL,
  `CitizenID` int NOT NULL,
  `DepartmentID` int NOT NULL,
  `RestrictionType` varchar(100) DEFAULT NULL,
  `StartDate` date DEFAULT NULL,
  `EndDate` date DEFAULT NULL,
  PRIMARY KEY (`RestrictionID`),
  KEY `CitizenID` (`CitizenID`),
  KEY `DepartmentID` (`DepartmentID`),
  CONSTRAINT `restriction_ibfk_1` FOREIGN KEY (`CitizenID`) REFERENCES `citizen` (`CitizenID`),
  CONSTRAINT `restriction_ibfk_2` FOREIGN KEY (`DepartmentID`) REFERENCES `department` (`DepartmentID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restriction`
--

LOCK TABLES `restriction` WRITE;
/*!40000 ALTER TABLE `restriction` DISABLE KEYS */;
INSERT INTO `restriction` VALUES (1,102,1,'Driving License Suspension','2025-01-15','2025-02-15'),(2,105,3,'Fine Imposed','2025-01-11','2025-01-20'),(3,107,6,'Warning Issued','2025-01-12','2025-01-19'),(4,109,2,'Tax Notice','2025-01-13','2025-02-13'),(5,111,1,'Driving Ban','2025-01-14','2025-02-14'),(6,113,3,'Community Service','2025-01-15','2025-02-15'),(7,115,4,'Medical Review','2025-01-16','2025-02-16'),(8,101,5,'Training Required','2025-01-17','2025-02-17');
/*!40000 ALTER TABLE `restriction` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `score_history`
--

DROP TABLE IF EXISTS `score_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `score_history` (
  `HistoryID` int NOT NULL,
  `CitizenID` int NOT NULL,
  `OldScore` int DEFAULT NULL,
  `NewScore` int DEFAULT NULL,
  `Reason` varchar(255) DEFAULT NULL,
  `ChangeDate` date DEFAULT NULL,
  PRIMARY KEY (`HistoryID`),
  KEY `idx_scorehistory_citizen` (`CitizenID`),
  CONSTRAINT `score_history_ibfk_1` FOREIGN KEY (`CitizenID`) REFERENCES `citizen` (`CitizenID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `score_history`
--

LOCK TABLES `score_history` WRITE;
/*!40000 ALTER TABLE `score_history` DISABLE KEYS */;
INSERT INTO `score_history` VALUES (1,101,70,85,'Timely tax payment','2025-01-10'),(2,102,75,65,'Traffic violation','2025-01-02'),(3,103,70,90,'Community service','2025-01-03'),(4,104,68,78,'Voting','2025-01-04'),(5,105,60,55,'Parking','2025-01-05'),(6,106,80,88,'Blood donation','2025-01-06'),(7,107,65,60,'Noise issue','2025-01-07'),(8,108,72,82,'Tree plantation','2025-01-08'),(9,109,70,72,'Scheme','2025-01-09'),(10,110,85,91,'Award','2025-01-10'),(11,111,75,68,'Violation','2025-01-11'),(12,112,70,76,'Service','2025-01-12'),(13,113,68,63,'Littering','2025-01-13'),(14,114,78,84,'Campaign','2025-01-14'),(15,115,80,87,'Donation','2025-01-15');
/*!40000 ALTER TABLE `score_history` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-06  4:15:51
