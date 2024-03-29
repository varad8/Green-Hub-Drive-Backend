-- phpMyAdmin SQL Dump
-- version 5.0.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 29, 2024 at 09:01 AM
-- Server version: 10.4.14-MariaDB
-- PHP Version: 7.4.9

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `greenhubdrive`
--

-- --------------------------------------------------------

--
-- Table structure for table `booking`
--

CREATE TABLE `booking` (
  `id` int(11) NOT NULL,
  `userId` varchar(36) NOT NULL,
  `evid` varchar(36) NOT NULL,
  `stationId` varchar(36) NOT NULL,
  `bookingSlot` varchar(255) NOT NULL,
  `timeForBooked` varchar(255) NOT NULL,
  `totalHoursEvBooking` varchar(255) NOT NULL,
  `bookedForDate` varchar(36) NOT NULL,
  `currentTimestamp` bigint(20) NOT NULL,
  `totalPayable` decimal(10,2) NOT NULL,
  `bookingStatus` varchar(50) NOT NULL,
  `remark` text DEFAULT NULL,
  `visitingStatus` varchar(50) NOT NULL,
  `visitingTimeStamp` bigint(20) DEFAULT NULL,
  `paymentDetails` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`paymentDetails`)),
  `bookingRefId` varchar(36) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `booking`
--

INSERT INTO `booking` (`id`, `userId`, `evid`, `stationId`, `bookingSlot`, `timeForBooked`, `totalHoursEvBooking`, `bookedForDate`, `currentTimestamp`, `totalPayable`, `bookingStatus`, `remark`, `visitingStatus`, `visitingTimeStamp`, `paymentDetails`, `bookingRefId`) VALUES
(13, '265d4040-64e3-4093-aa5e-e85e150ec7c8', 'EV-5552', '12045b9a-3755-4f57-b60c-2a00d051c850', 'slot-a', '11:50', '2', '2024-03-09', 1709904070257, '200.00', 'booked', 'booked', 'Not Visited', NULL, '{\"transactionid\":\"pay_NjsL3YvK9g9TiJ\",\"paymentType\":\"netbanking\",\"paymentStatus\":true,\"amount\":200,\"createdDate\":1709904058}', 'order_NjsKqsXUPnO1m4'),
(14, 'd5d80fdf-5f0f-4ff3-9b6e-54f3c681bfe9', 'EV-5552', '12045b9a-3755-4f57-b60c-2a00d051c850', 'slot-a', '15:00', '2', '2024-03-24', 1711183886726, '200.00', 'booked', 'booked', 'Not Visited', NULL, '{\"transactionid\":\"pay_NpjkuEoRNSFVce\",\"paymentType\":\"netbanking\",\"paymentStatus\":true,\"amount\":200,\"createdDate\":1711183873}', 'order_NpjkWM6VptpH1P'),
(15, 'd5d80fdf-5f0f-4ff3-9b6e-54f3c681bfe9', 'EV-5552', '12045b9a-3755-4f57-b60c-2a00d051c850', 'slot-a', '17:29', '2', '2024-03-24', 1711184334429, '200.00', 'booked', 'booked', 'Not Visited', NULL, '{\"transactionid\":\"pay_NpjsoANUp72jf7\",\"paymentType\":\"netbanking\",\"paymentStatus\":true,\"amount\":200,\"createdDate\":1711184321}', 'order_Npjsf540YuKnuB'),
(16, 'd5d80fdf-5f0f-4ff3-9b6e-54f3c681bfe9', 'EV-9288', '9d0121ac-2518-4068-845f-e95b929f99c4', 'slot-c', '16:37', '2', '2024-03-24', 1711184899272, '230.00', 'booked', 'booked', 'Not Visited', NULL, '{\"transactionid\":\"pay_Npk2mUdVNoeCLm\",\"paymentType\":\"netbanking\",\"paymentStatus\":true,\"amount\":230,\"createdDate\":1711184888}', 'order_Npk2ee5YI3vjfi'),
(17, 'd5d80fdf-5f0f-4ff3-9b6e-54f3c681bfe9', 'EV-9288', '9d0121ac-2518-4068-845f-e95b929f99c4', 'slot-a', '12:52', '2', '2024-03-29', 1711690130580, '230.00', 'Visited', 'booked', 'Visited', NULL, '{\"transactionid\":\"pay_Ns3VgkREhBsB3M\",\"paymentType\":\"netbanking\",\"paymentStatus\":true,\"amount\":230,\"createdDate\":1711690121}', 'order_Ns3Qu5mX8xcWqR');

-- --------------------------------------------------------

--
-- Table structure for table `ev_profile`
--

CREATE TABLE `ev_profile` (
  `id` int(11) NOT NULL,
  `evid` varchar(36) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `location` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`location`)),
  `coordinates` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`coordinates`)),
  `address` varchar(255) DEFAULT NULL,
  `rate` decimal(10,2) DEFAULT NULL,
  `evTimings` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`evTimings`)),
  `imageUrl` varchar(255) DEFAULT NULL,
  `profile` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`profile`)),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `accountType` varchar(50) DEFAULT NULL,
  `userid` varchar(36) NOT NULL,
  `accountStatus` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`accountStatus`))
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `ev_profile`
--

INSERT INTO `ev_profile` (`id`, `evid`, `title`, `description`, `location`, `coordinates`, `address`, `rate`, `evTimings`, `imageUrl`, `profile`, `updatedAt`, `accountType`, `userid`, `accountStatus`) VALUES
(17, 'EV-5552', 'goEgo Charging Station', 'The Power Hub of Integrated EV Charging Solutions\nDelivering a safe and seamless charging experience through a comprehensive range of EV charging solutions.', '{\"city\":\"Pune\",\"state\":\"Maharashtra\"}', '{\"latitude\":\"18.5561415\",\"longitude\":\"73.703995\"}', 'WESTEND MALL, Harmony Society, Ward No. 8, Wireless Colony, Aundh, Pune, Maharashtra 411007', '100.00', '{\"Monday\":{\"openingTime\":\"08:00\",\"closingTime\":\"20:00\"},\"Tuesday\":{\"openingTime\":\"09:00\",\"closingTime\":\"20:00\"},\"Wednesday\":{\"openingTime\":\"08:30\",\"closingTime\":\"20:30\"},\"Thursday\":{\"openingTime\":\"09:30\",\"closingTime\":\"20:30\"},\"Friday\":{\"openingTime\":\"08:00\",\"closingTime\":\"20:00\"},\"Saturday\":{\"openingTime\":\"09:00\",\"closingTime\":\"20:00\"},\"Sunday\":{\"openingTime\":\"09:00\",\"closingTime\":\"20:00\"}}', '1709900017107_AdobeStock_585977851.jpg', '{\"firstname\":\"Shiv\",\"lastName\":\"\",\"dob\":\"1998-03-02\",\"mobile\":\"8525653265\",\"email\":\"ev@gmail.com\",\"profilepic\":\"1709900009285_user.png\",\"dateofjoining\":\"2024-03-08T12:03:49.531Z\",\"lastname\":\"Patil\"}', '2024-03-08 15:20:47', 'EV Admin', '12045b9a-3755-4f57-b60c-2a00d051c850', '{\"status\":\"ACTIVE\",\"approvedBy\":\"Green Hub Drive\",\"updatedAt\":\"2024-03-08 20:50:47\",\"adminID\":\"AD-6642\",\"remark\":\"Approved\"}'),
(18, 'EV-7887', 'Electric Vehicle Charging Station', 'An EV charging station is a dedicated spot where electric vehicles can be charged. It typically consists of one or more charging points with connectors compatible with EVs. Charging stations can vary in power output and may offer different charging speeds to accommodate various types of electric vehicles.', '{\"city\":\"Pune\",\"state\":\"Maharashtra\"}', '{\"latitude\":\"18.5111388\",\"longitude\":\"73.7207381\"}', 'Electric Vehicle Charging Station, GaneshKripa Society, Ramkrishna Paramhans Nagar, Kothrud, Pune, Maharashtra 411038', '110.00', '{\"Monday\":{\"openingTime\":\"08:00\",\"closingTime\":\"20:00\"},\"Tuesday\":{\"openingTime\":\"09:00\",\"closingTime\":\"20:00\"},\"Wednesday\":{\"openingTime\":\"08:30\",\"closingTime\":\"20:30\"},\"Thursday\":{\"openingTime\":\"09:30\",\"closingTime\":\"20:30\"},\"Friday\":{\"openingTime\":\"08:00\",\"closingTime\":\"20:00\"},\"Saturday\":{\"openingTime\":\"09:00\",\"closingTime\":\"20:00\"},\"Sunday\":{\"openingTime\":\"09:00\",\"closingTime\":\"20:00\"}}', '1709901687799_editors_images_1665045694755-EV-Station-PluZ-2-660x400@2x.jpg', '{\"firstname\":\"Tina\",\"lastName\":\"\",\"dob\":\"1999-02-06\",\"mobile\":\"6289521256\",\"email\":\"ev1@gmail.com\",\"profilepic\":\"1709901673376_evstation.png\",\"dateofjoining\":\"2024-03-08T12:37:13.803Z\",\"lastname\":\"Dubey\"}', '2024-03-08 12:43:27', 'EV Admin', '266c1f96-4885-46c8-b1f8-356ac5256825', '{\"status\":\"ACTIVE\",\"approvedBy\":\"Green Hub Drive\",\"updatedAt\":\"2024-03-08 18:12:15\",\"adminID\":\"AD-6642\",\"remark\":\"Approved\"}'),
(19, 'EV-9608', 'EV DOCK Charging Station', 'The Power Hub of Integrated EV Charging Solutions Delivering a safe and seamless charging experience', '{\"city\":\"Pune\",\"state\":\"Maharashtra\"}', '{\"latitude\":\"18.556748\",\"longitude\":\"73.9078041\"}', '101, Sakore Nagar Rd, Sakore Nagar, Viman Nagar, Pune, Maharashtra 411014', '90.00', '{\"Monday\":{\"openingTime\":\"08:00\",\"closingTime\":\"20:00\"},\"Tuesday\":{\"openingTime\":\"09:00\",\"closingTime\":\"20:00\"},\"Wednesday\":{\"openingTime\":\"09:00\",\"closingTime\":\"20:30\"},\"Thursday\":{\"openingTime\":\"09:30\",\"closingTime\":\"20:30\"},\"Friday\":{\"openingTime\":\"08:00\",\"closingTime\":\"20:00\"},\"Saturday\":{\"openingTime\":\"09:00\",\"closingTime\":\"20:00\"},\"Sunday\":{\"openingTime\":\"09:00\",\"closingTime\":\"20:00\"}}', '1709902026668_pexels-photo-9800006.jpeg', '{\"firstname\":\"Nitin\",\"lastName\":\"\",\"dob\":\"2000-02-06\",\"mobile\":\"7896963256\",\"email\":\"ev2@gmail.com\",\"profilepic\":\"1709901997678_profile.png\",\"dateofjoining\":\"2024-03-08T12:45:50.439Z\",\"lastname\":\"Chaughule\"}', '2024-03-08 12:51:10', 'EV Admin', '9797c594-8320-40ae-90cf-0ee428f44567', '{\"status\":\"ACTIVE\",\"approvedBy\":\"Green Hub Drive\",\"updatedAt\":\"2024-03-08 18:21:10\",\"adminID\":\"AD-6642\",\"remark\":\"Approved\"}'),
(20, 'EV-9288', 'Jio-bp pulse Charging Station', 'The Power Hub of Integrated EV Charging Solutions Delivering a safe and seamless charging experience', '{\"city\":\"Mumbai\",\"state\":\"Maharashtra\"}', '{\"latitude\":\"19.0697841\",\"longitude\":\"72.787537\"}', 'C57, Infront Of Cbi Office, G Block BKC, Bandra East, Maharashtra 400051', '115.00', '{\"Monday\":{\"openingTime\":\"08:00\",\"closingTime\":\"20:00\"},\"Tuesday\":{\"openingTime\":\"09:00\",\"closingTime\":\"20:00\"},\"Wednesday\":{\"openingTime\":\"08:30\",\"closingTime\":\"20:30\"},\"Thursday\":{\"openingTime\":\"09:30\",\"closingTime\":\"20:30\"},\"Friday\":{\"openingTime\":\"08:00\",\"closingTime\":\"20:00\"},\"Saturday\":{\"openingTime\":\"09:00\",\"closingTime\":\"20:00\"},\"Sunday\":{\"openingTime\":\"09:00\",\"closingTime\":\"20:00\"}}', '1709902487377_Untitled-design-2023-06-21T142313.086.jpg', '{\"firstname\":\"Shubham\",\"lastName\":\"\",\"dob\":\"1980-06-06\",\"mobile\":\"9825369652\",\"email\":\"ev3@gmail.com\",\"profilepic\":\"1709902464922_evstation.png\",\"dateofjoining\":\"2024-03-08T12:52:34.901Z\",\"lastname\":\"Salvi\"}', '2024-03-08 13:06:19', 'EV Admin', '9d0121ac-2518-4068-845f-e95b929f99c4', '{\"status\":\"ACTIVE\",\"approvedBy\":\"Green Hub Drive\",\"updatedAt\":\"2024-03-08 18:26:16\",\"adminID\":\"AD-6642\",\"remark\":\"Approved\"}'),
(21, 'EV-3751', NULL, NULL, '{\"city\":\"Pune\",\"state\":\"Maharashtra\"}', '{\"latitude\":0,\"longitude\":0}', NULL, NULL, '{\"Monday\":{\"openingTime\":\"08:00\",\"closingTime\":\"20:00\"},\"Tuesday\":{\"openingTime\":\"09:00\",\"closingTime\":\"20:00\"},\"Wednesday\":{\"openingTime\":\"08:30\",\"closingTime\":\"20:30\"},\"Thursday\":{\"openingTime\":\"09:30\",\"closingTime\":\"20:30\"},\"Friday\":{\"openingTime\":\"08:00\",\"closingTime\":\"20:00\"},\"Saturday\":{\"openingTime\":\"09:00\",\"closingTime\":\"20:00\"},\"Sunday\":{\"openingTime\":\"09:00\",\"closingTime\":\"20:00\"}}', NULL, '{\"firstname\":\"\",\"lastName\":\"\",\"dob\":\"\",\"mobile\":\"\",\"email\":\"ev5@gmail.com\",\"profilepic\":\"\",\"dateofjoining\":\"2024-03-23T07:57:01.869Z\"}', '2024-03-23 07:57:01', 'EV Admin', 'f4d79d0b-9e91-4c94-ac1d-bdb232856d17', '{\"approvedBy\":\"\",\"updatedAt\":\"\",\"adminID\":\"\",\"status\":\"NOT ACTIVE\",\"remark\":\"not approved\"}');

-- --------------------------------------------------------

--
-- Table structure for table `ev_registration`
--

CREATE TABLE `ev_registration` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `userid` varchar(36) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `ev_registration`
--

INSERT INTO `ev_registration` (`id`, `email`, `password`, `userid`) VALUES
(20, 'ev@gmail.com', '$2b$10$QVK0rZUqHfBK0tObBE7JbeHeziEfrw0YAi0lryFit.7WA/W7Wodnq', '12045b9a-3755-4f57-b60c-2a00d051c850'),
(21, 'ev1@gmail.com', '$2b$10$JdaA41MaFTTfJ/uqzq4EseNuFbNYr74/3ruN8M7oyhetWzlr6M7kq', '266c1f96-4885-46c8-b1f8-356ac5256825'),
(22, 'ev2@gmail.com', '$2b$10$J5R1G76kaYYRGaZhbToTF.zbTX8ZAj3jUdUa2v4wBl4bIiV0b.LCO', '9797c594-8320-40ae-90cf-0ee428f44567'),
(23, 'ev3@gmail.com', '$2b$10$rLvjznnOFtXcCF8L0DcD1ePnH0GI3gAcXjLr8Wbgi0zL5oiDMgp/e', '9d0121ac-2518-4068-845f-e95b929f99c4'),
(24, 'ev5@gmail.com', '$2b$10$9so1bgUzcGXk7rYRqMii5.QxdifIkfE.gNu9ZpcmpfZZv0/mWbPbK', 'f4d79d0b-9e91-4c94-ac1d-bdb232856d17');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `userid` varchar(36) NOT NULL,
  `stationuserid` varchar(36) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `notificationTitle` varchar(255) DEFAULT NULL,
  `notificationMessage` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `userid`, `stationuserid`, `createdAt`, `updatedAt`, `notificationTitle`, `notificationMessage`) VALUES
(10, 'd5d80fdf-5f0f-4ff3-9b6e-54f3c681bfe9', '9d0121ac-2518-4068-845f-e95b929f99c4', '2024-03-29 05:56:02', '2024-03-29 05:59:11', 'Visited Today', 'Hi Varad Nikharage,your refill of ev done'),
(11, 'd5d80fdf-5f0f-4ff3-9b6e-54f3c681bfe9', '9d0121ac-2518-4068-845f-e95b929f99c4', '2024-03-29 05:59:59', '2024-03-29 05:59:59', 'Visit again', 'Visit again to our ev');

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `rating`
--

CREATE TABLE `rating` (
  `ratingId` int(11) NOT NULL,
  `stationId` varchar(255) NOT NULL,
  `userId` varchar(255) NOT NULL,
  `rating` int(11) NOT NULL,
  `feedbackMsg` text DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `orderid` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `rating`
--

INSERT INTO `rating` (`ratingId`, `stationId`, `userId`, `rating`, `feedbackMsg`, `createdAt`, `orderid`) VALUES
(4, '9d0121ac-2518-4068-845f-e95b929f99c4', 'd5d80fdf-5f0f-4ff3-9b6e-54f3c681bfe9', 5, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.', '2024-03-29 06:01:08', 'order_Ns3Qu5mX8xcWqR');

-- --------------------------------------------------------

--
-- Table structure for table `superadmin_profile`
--

CREATE TABLE `superadmin_profile` (
  `id` int(11) NOT NULL,
  `adminId` varchar(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `firstName` varchar(255) DEFAULT NULL,
  `lastName` varchar(255) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `registeredAs` varchar(255) DEFAULT NULL,
  `mobileNo` varchar(20) DEFAULT NULL,
  `accountType` varchar(50) DEFAULT NULL,
  `profilepic` varchar(255) DEFAULT NULL,
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `dateOfCreation` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `superadmin_profile`
--

INSERT INTO `superadmin_profile` (`id`, `adminId`, `email`, `firstName`, `lastName`, `dob`, `address`, `registeredAs`, `mobileNo`, `accountType`, `profilepic`, `updatedAt`, `dateOfCreation`) VALUES
(3, 'AD-6642', 'greenhub@drive.com', 'Green Hub', 'Drive', '2002-08-08', 'At post kothrud pune', 'Owner', '1234567890', 'Owner', '1709901704658_logo.png', '2024-03-08 12:41:44', '2024-03-07 11:27:34');

-- --------------------------------------------------------

--
-- Table structure for table `superadmin_registration`
--

CREATE TABLE `superadmin_registration` (
  `id` int(11) NOT NULL,
  `adminId` varchar(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `dateOfCreation` timestamp NOT NULL DEFAULT current_timestamp(),
  `createdBy` varchar(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `superadmin_registration`
--

INSERT INTO `superadmin_registration` (`id`, `adminId`, `email`, `password`, `dateOfCreation`, `createdBy`) VALUES
(3, 'AD-6642', 'greenhub@drive.com', '$2b$10$nllIHvlluki8BVZtERizyObuQ4zhfG.d8HVCr4Orspj3OYaNtGAqq', '2024-03-07 06:35:11', 'Developer');

-- --------------------------------------------------------

--
-- Table structure for table `user_profile`
--

CREATE TABLE `user_profile` (
  `id` int(11) NOT NULL,
  `firstname` varchar(255) DEFAULT NULL,
  `lastname` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `updatedDate` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `createdDate` timestamp NOT NULL DEFAULT current_timestamp(),
  `address` varchar(255) DEFAULT NULL,
  `profilepic` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `state` varchar(255) DEFAULT NULL,
  `userid` varchar(36) NOT NULL,
  `accountType` varchar(50) DEFAULT NULL,
  `gender` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `user_profile`
--

INSERT INTO `user_profile` (`id`, `firstname`, `lastname`, `email`, `mobile`, `dob`, `updatedDate`, `createdDate`, `address`, `profilepic`, `city`, `state`, `userid`, `accountType`, `gender`) VALUES
(1, 'Varad', 'Nikharage', 'varadnikharage201@gmail.com', '1234567890', '2002-08-08', '2024-03-29 05:21:56', '2024-02-26 14:22:12', '123 Main St, City', '1711689716815_chatbot.png', 'Bengaluru', 'Karnataka', 'd5d80fdf-5f0f-4ff3-9b6e-54f3c681bfe9', 'user', 'male'),
(10, 'Abc', 'Xyz', 'abc@gmail.com', '1234567890', '2002-02-26', '2024-03-08 12:35:39', '2024-02-29 13:32:01', 'At post karwanchiwadi ratnagiri', '1709901339652_user.png', 'Mumbai', 'Maharashtra', '265d4040-64e3-4093-aa5e-e85e150ec7c8', 'user', 'male');

-- --------------------------------------------------------

--
-- Table structure for table `user_registration`
--

CREATE TABLE `user_registration` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `userid` varchar(36) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `user_registration`
--

INSERT INTO `user_registration` (`id`, `email`, `password`, `userid`) VALUES
(1, 'varadnikharage201@gmail.com', '$2b$10$TT71KdIsCJqp.JffDE8wc.o.dTKvxegc3TLbZFF.B3PzwfOGQCKke', 'd5d80fdf-5f0f-4ff3-9b6e-54f3c681bfe9'),
(10, 'abc@gmail.com', '$2b$10$MG2Q/MByqULotKzzByKHeOj60w/HVWO614zEGIAgYVrzHKw0Rol.G', '265d4040-64e3-4093-aa5e-e85e150ec7c8'),
(11, 'new@gmail.com', '$2b$10$J4RQQeEHgxRKQ9Wzj0s25.6RRKeOvOMbpkH7672zntCpDddZCqbxm', 'c5a30b91-4fc1-4c1a-984d-9fe984422770');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `booking`
--
ALTER TABLE `booking`
  ADD PRIMARY KEY (`id`),
  ADD KEY `stationId` (`stationId`);

--
-- Indexes for table `ev_profile`
--
ALTER TABLE `ev_profile`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `userid` (`userid`);

--
-- Indexes for table `ev_registration`
--
ALTER TABLE `ev_registration`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `userid` (`userid`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `rating`
--
ALTER TABLE `rating`
  ADD PRIMARY KEY (`ratingId`),
  ADD KEY `stationId` (`stationId`),
  ADD KEY `userId` (`userId`);

--
-- Indexes for table `superadmin_profile`
--
ALTER TABLE `superadmin_profile`
  ADD PRIMARY KEY (`id`),
  ADD KEY `adminId` (`adminId`);

--
-- Indexes for table `superadmin_registration`
--
ALTER TABLE `superadmin_registration`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `adminId` (`adminId`);

--
-- Indexes for table `user_profile`
--
ALTER TABLE `user_profile`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `userid` (`userid`),
  ADD KEY `email_2` (`email`);

--
-- Indexes for table `user_registration`
--
ALTER TABLE `user_registration`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `userid` (`userid`),
  ADD KEY `userid_2` (`userid`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `booking`
--
ALTER TABLE `booking`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `ev_profile`
--
ALTER TABLE `ev_profile`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `ev_registration`
--
ALTER TABLE `ev_registration`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `rating`
--
ALTER TABLE `rating`
  MODIFY `ratingId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `superadmin_profile`
--
ALTER TABLE `superadmin_profile`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `superadmin_registration`
--
ALTER TABLE `superadmin_registration`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `user_profile`
--
ALTER TABLE `user_profile`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `user_registration`
--
ALTER TABLE `user_registration`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `booking`
--
ALTER TABLE `booking`
  ADD CONSTRAINT `booking_ibfk_1` FOREIGN KEY (`stationId`) REFERENCES `ev_registration` (`userid`);

--
-- Constraints for table `ev_profile`
--
ALTER TABLE `ev_profile`
  ADD CONSTRAINT `ev_profile_ibfk_1` FOREIGN KEY (`userid`) REFERENCES `ev_registration` (`userid`);

--
-- Constraints for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD CONSTRAINT `password_reset_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user_registration` (`id`);

--
-- Constraints for table `rating`
--
ALTER TABLE `rating`
  ADD CONSTRAINT `rating_ibfk_1` FOREIGN KEY (`stationId`) REFERENCES `ev_registration` (`userid`),
  ADD CONSTRAINT `rating_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `user_registration` (`userid`);

--
-- Constraints for table `superadmin_profile`
--
ALTER TABLE `superadmin_profile`
  ADD CONSTRAINT `superadmin_profile_ibfk_1` FOREIGN KEY (`adminId`) REFERENCES `superadmin_registration` (`adminId`);

--
-- Constraints for table `user_profile`
--
ALTER TABLE `user_profile`
  ADD CONSTRAINT `user_profile_ibfk_1` FOREIGN KEY (`userid`) REFERENCES `user_registration` (`userid`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
