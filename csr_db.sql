-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: csr_db
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
INSERT INTO `action_agegroup` VALUES (10,1),(15,1),(1,2),(2,2),(3,2),(4,2),(5,2),(6,2),(7,2),(8,2),(15,2),(3,3),(7,3),(15,3);
/*!40000 ALTER TABLE `action_agegroup` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `action_department`
--

DROP TABLE IF EXISTS `action_department`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `action_department` (
  `ActionTypeID` int NOT NULL,
  `DepartmentID` int NOT NULL,
  PRIMARY KEY (`ActionTypeID`,`DepartmentID`),
  KEY `action_dept_ibfk_2` (`DepartmentID`),
  CONSTRAINT `action_dept_ibfk_1` FOREIGN KEY (`ActionTypeID`) REFERENCES `action_type` (`ActionTypeID`) ON DELETE CASCADE,
  CONSTRAINT `action_dept_ibfk_2` FOREIGN KEY (`DepartmentID`) REFERENCES `department` (`DepartmentID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `action_department`
--

LOCK TABLES `action_department` WRITE;
/*!40000 ALTER TABLE `action_department` DISABLE KEYS */;
INSERT INTO `action_department` VALUES (15,1);
/*!40000 ALTER TABLE `action_department` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `action_type`
--

DROP TABLE IF EXISTS `action_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `action_type` (
  `ActionTypeID` int NOT NULL AUTO_INCREMENT,
  `ActionName` varchar(100) NOT NULL,
  `ScoreImpact` int NOT NULL,
  `Severity` int DEFAULT NULL,
  PRIMARY KEY (`ActionTypeID`),
  CONSTRAINT `action_type_chk_1` CHECK ((`Severity` between 1 and 5))
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `action_type`
--

LOCK TABLES `action_type` WRITE;
/*!40000 ALTER TABLE `action_type` DISABLE KEYS */;
INSERT INTO `action_type` VALUES (1,'Traffic Violation',-1,4),(2,'Timely Tax Payment',15,2),(3,'Community Service',20,1),(4,'Voting Participation',10,1),(5,'Illegal Parking',-5,2),(6,'Littering',-8,2),(7,'Blood Donation',25,1),(8,'Tree Plantation',2,1),(10,'New ActionTest',5,1),(11,'New ActionTest',5,1),(14,'new action',45,2),(15,'new action 1',-30,5);
/*!40000 ALTER TABLE `action_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `agegroup`
--

DROP TABLE IF EXISTS `agegroup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `agegroup` (
  `AgeGroupID` int NOT NULL AUTO_INCREMENT,
  `GroupName` varchar(50) NOT NULL,
  `MinAge` int NOT NULL,
  `MaxAge` int NOT NULL,
  PRIMARY KEY (`AgeGroupID`),
  CONSTRAINT `agegroup_chk_1` CHECK ((`MinAge` <= `MaxAge`))
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `agegroup`
--

LOCK TABLES `agegroup` WRITE;
/*!40000 ALTER TABLE `agegroup` DISABLE KEYS */;
INSERT INTO `agegroup` VALUES (1,'Teenager',12,17),(2,'Adult',18,64),(3,'Senior Citizen',65,120);
/*!40000 ALTER TABLE `agegroup` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `benefit`
--

DROP TABLE IF EXISTS `benefit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `benefit` (
  `BenefitID` int NOT NULL AUTO_INCREMENT,
  `BenefitName` varchar(100) NOT NULL,
  `MinScoreRequired` int NOT NULL,
  PRIMARY KEY (`BenefitID`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `benefit`
--

LOCK TABLES `benefit` WRITE;
/*!40000 ALTER TABLE `benefit` DISABLE KEYS */;
INSERT INTO `benefit` VALUES (1,'Priority Loan',8),(2,'Fast Govt Service',70),(3,'Public Recognition',90),(4,'Tax Rebate',85),(5,'Housing Priority',75),(6,'Medical Assistance',70),(7,'Education Scholarship',84),(8,'New Ben Test',100),(9,'New Ben Test',100);
/*!40000 ALTER TABLE `benefit` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `citizen`
--

DROP TABLE IF EXISTS `citizen`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `citizen` (
  `CitizenID` int NOT NULL AUTO_INCREMENT,
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
) ENGINE=InnoDB AUTO_INCREMENT=129 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `citizen`
--

LOCK TABLES `citizen` WRITE;
/*!40000 ALTER TABLE `citizen` DISABLE KEYS */;
INSERT INTO `citizen` VALUES (101,'123456789012','Rohan','Kumar','2005-11-29','Delhi','9998712300',85,2),(102,'234567890123','Aisha','Khan','2004-03-04','Mumbai','9953917192',45,2),(103,'333333333333','Suresh','Verma','1960-01-15','Delhi','9000000003',90,3),(104,'444444444444','Neha','Singh','2001-03-10','Pune','9000000004',78,2),(105,'555555555555','Kunal','Mehta','1998-07-21','Ahmedabad','9000000005',55,2),(106,'666666666666','Anita','Gupta','1975-09-09','Delhi','9000000006',88,2),(107,'777777777777','Rahul','Yadav','1992-11-30','Noida','9000000007',60,2),(108,'888888888888','Pooja','Nair','2000-12-25','Kochi','9000000008',82,2),(109,'999999999999','Vikas','Patel','1985-06-18','Surat','9000000009',72,2),(110,'101010101010','Sunita','Rao','1965-02-14','Bhopal','9000000010',91,3),(111,'121212121212','Arjun','Malik','2004-04-04','Jaipur','9000000011',68,2),(112,'131313131313','Meena','Joshi','1970-10-10','Indore','9000000012',76,2),(120,'222222222222','Aryan','Sharma','2010-05-10','Delhi','9000001001',70,1),(121,'222222222223','Riya','Kapoor','2009-09-15','Mumbai','9000001002',65,1),(122,'222222222224','Kabir','Mehta','2011-03-20','Pune','9000001003',60,1),(123,'123456789015','Rohan','Kashyap','2004-01-06','Delhi','7217638155',100,2),(124,'123456789016','user','1','2004-01-06','Delhi','9985998599',100,2),(125,'999999999998','Final','Test','2000-01-01','Test City','9999999999',100,2),(126,'123456789017','test','user','2002-02-05','mumbai','7894561230',100,2),(127,'123456789018','test','user','1993-08-11','Guj','9988776655',100,2),(128,'481561230231','test','user','1977-06-24','Delhi','1234567890',100,3);
/*!40000 ALTER TABLE `citizen` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `citizen_action_record`
--

DROP TABLE IF EXISTS `citizen_action_record`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `citizen_action_record` (
  `RecordID` int NOT NULL AUTO_INCREMENT,
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
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `citizen_action_record`
--

LOCK TABLES `citizen_action_record` WRITE;
/*!40000 ALTER TABLE `citizen_action_record` DISABLE KEYS */;
INSERT INTO `citizen_action_record` VALUES (1,101,2,2,'2025-01-01'),(2,102,1,1,'2025-01-02'),(3,103,3,3,'2025-01-03'),(4,104,4,4,'2025-01-04'),(5,105,5,1,'2025-01-05'),(6,106,7,4,'2025-01-06'),(7,107,6,3,'2025-01-07'),(8,108,8,5,'2025-01-08'),(9,109,5,1,'2025-01-09'),(10,110,3,3,'2025-01-10'),(20,120,3,3,'2025-02-01'),(21,121,4,4,'2025-02-02'),(22,122,7,4,'2025-02-03'),(23,101,5,1,'2025-02-04'),(24,102,6,3,'2025-02-05'),(25,102,1,1,'2026-03-11'),(26,102,1,1,'2026-03-11');
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
INSERT INTO `citizen_benefit` VALUES (101,1,'2025-02-01'),(101,2,'2025-02-01'),(103,3,'2025-02-02'),(104,5,'2025-02-02'),(106,2,'2025-02-03'),(108,1,'2025-02-04'),(109,7,'2025-02-13'),(110,3,'2025-02-06'),(120,2,'2025-02-10'),(121,5,'2025-02-11'),(122,6,'2025-02-12');
/*!40000 ALTER TABLE `citizen_benefit` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `complaint`
--

DROP TABLE IF EXISTS `complaint`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `complaint` (
  `ComplaintID` int NOT NULL AUTO_INCREMENT,
  `FiledByCitizenID` int NOT NULL,
  `AgainstCitizenID` int NOT NULL,
  `Description` text,
  `Status` varchar(30) DEFAULT NULL,
  `FiledDate` date DEFAULT NULL,
  `ResolutionNote` text,
  PRIMARY KEY (`ComplaintID`),
  KEY `FiledByCitizenID` (`FiledByCitizenID`),
  KEY `idx_complaint_against` (`AgainstCitizenID`),
  CONSTRAINT `complaint_ibfk_1` FOREIGN KEY (`FiledByCitizenID`) REFERENCES `citizen` (`CitizenID`),
  CONSTRAINT `complaint_ibfk_2` FOREIGN KEY (`AgainstCitizenID`) REFERENCES `citizen` (`CitizenID`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `complaint`
--

LOCK TABLES `complaint` WRITE;
/*!40000 ALTER TABLE `complaint` DISABLE KEYS */;
INSERT INTO `complaint` VALUES (1,101,102,'Reckless driving','Reviewed','2025-01-13',NULL),(2,103,104,'Illegal parking','Reviewed','2025-01-14',NULL),(3,104,105,'Littering','Reviewed','2025-01-15',NULL),(4,105,106,'Water wastage','Reviewed','2025-01-16',NULL),(5,106,107,'Traffic issue','Reviewed','2025-01-17',NULL),(6,107,108,'Noise pollution','Reviewed','2025-01-18',NULL),(20,120,102,'Noise Disturbance','Reviewed','2025-02-05',NULL),(21,121,105,'Public Littering','Reviewed','2025-02-06',NULL),(22,110,108,'Illegal Parking','Pending','2025-02-07',NULL),(23,101,102,'Noise Pollution','Pending','2026-03-11',NULL),(24,101,102,'Noise Pollution','Pending','2026-03-11',NULL),(25,127,126,'violation of tarffic\n','Resolved','2026-03-17','all things are done\n');
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
INSERT INTO `department` VALUES (5,'Education'),(4,'Health'),(3,'Municipal'),(2,'Tax'),(1,'Transport Updated');
/*!40000 ALTER TABLE `department` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `government_official`
--

DROP TABLE IF EXISTS `government_official`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `government_official` (
  `OfficialID` int NOT NULL AUTO_INCREMENT,
  `FirstName` varchar(50) DEFAULT NULL,
  `LastName` varchar(50) DEFAULT NULL,
  `Designation` varchar(50) DEFAULT NULL,
  `DepartmentID` int NOT NULL,
  `Email` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`OfficialID`),
  UNIQUE KEY `Email` (`Email`),
  KEY `DepartmentID` (`DepartmentID`),
  CONSTRAINT `government_official_ibfk_1` FOREIGN KEY (`DepartmentID`) REFERENCES `department` (`DepartmentID`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `government_official`
--

LOCK TABLES `government_official` WRITE;
/*!40000 ALTER TABLE `government_official` DISABLE KEYS */;
INSERT INTO `government_official` VALUES (1,'Amit','Sharma','Inspector',1,NULL),(2,'Neha','Verma','Officer',2,NULL),(3,'Rohit','Singh','Supervisor',3,NULL),(4,'Kavita','Gupta','Officer',4,NULL),(5,'Sanjay','Patel','Manager',5,NULL),(20,'Raj','Singh','Inspector',1,NULL),(21,'Test','Analyst','Senior Analyst',1,NULL),(22,'Log','Analyst','Senior Analyst',1,'loganalyst@gov.in'),(23,'Rohan','Kashyap','official',1,'rohankashyap@gmail.com'),(24,'gov','user','official',1,'gov@gmail.com');
/*!40000 ALTER TABLE `government_official` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `restriction`
--

DROP TABLE IF EXISTS `restriction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `restriction` (
  `RestrictionID` int NOT NULL AUTO_INCREMENT,
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
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restriction`
--

LOCK TABLES `restriction` WRITE;
/*!40000 ALTER TABLE `restriction` DISABLE KEYS */;
INSERT INTO `restriction` VALUES (1,102,1,'Driving Ban','2025-01-20','2025-02-20'),(2,105,3,'Fine Imposed','2025-01-21','2025-02-01'),(3,107,1,'Warning','2025-01-22','2025-02-01'),(4,109,2,'Tax Notice','2025-01-23','2025-02-23'),(20,108,3,'Fine Issued','2025-02-10','2025-03-10'),(21,111,1,'Driving Ban','2025-02-11','2025-03-11'),(22,102,1,'Driving Ban','2026-03-11','2025-12-01'),(23,102,1,'Driving Ban','2026-03-11','2025-12-01');
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
INSERT INTO `score_history` VALUES (1,101,70,85,'Tax payment','2025-01-01'),(2,102,75,65,'Traffic violation','2025-01-02'),(3,103,70,90,'Community service','2025-01-03'),(4,104,68,78,'Voting','2025-01-04'),(5,105,60,55,'Illegal parking','2025-01-05'),(6,106,80,88,'Blood donation','2025-01-06'),(7,107,65,60,'Noise issue','2025-01-07'),(8,108,72,82,'Tree plantation','2025-01-08'),(9,109,70,72,'Scheme participation','2025-01-09'),(10,110,85,91,'Public award','2025-01-10'),(20,120,60,70,'Community Service','2025-02-01'),(21,121,55,65,'Social Campaign','2025-02-02'),(22,122,50,60,'Volunteer Work','2025-02-03');
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

-- Dump completed on 2026-03-18  0:28:50
