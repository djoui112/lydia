-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 05, 2026 at 09:29 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `mimaria`
--

-- --------------------------------------------------------

--
-- Table structure for table `agencies`
--

CREATE TABLE `agencies` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `city` varchar(100) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `cover_image` varchar(255) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `legal_document` varchar(255) DEFAULT NULL,
  `is_approved` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `agencies`
--

INSERT INTO `agencies` (`id`, `name`, `city`, `address`, `cover_image`, `bio`, `legal_document`, `is_approved`) VALUES
(28, 'Builda', '10 - Bouira', 'dar elala', NULL, 'the best agency you will meet', 'assets/uploads/documents/6980f30d457fe_AFRAH_ZEGHILET_G3.pdf', 0),
(29, 'My house dream', '11 - Tamanrasset', 'annaba - sidi djalel', NULL, 'a beginning agency that is working good hhhhhh', 'assets/uploads/documents/698351c9da555_OOP notes .pdf', 0);

-- --------------------------------------------------------

--
-- Table structure for table `agency_portfolio_items`
--

CREATE TABLE `agency_portfolio_items` (
  `id` int(10) UNSIGNED NOT NULL,
  `agency_id` int(10) UNSIGNED NOT NULL,
  `project_id` int(10) UNSIGNED DEFAULT NULL,
  `project_name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `project_type` enum('residential','commercial','institutional','urban','cultural','interior','exterior') DEFAULT NULL,
  `style_tags` text DEFAULT NULL,
  `completion_date` date DEFAULT NULL,
  `is_featured` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `agency_portfolio_photos`
--

CREATE TABLE `agency_portfolio_photos` (
  `id` int(10) UNSIGNED NOT NULL,
  `portfolio_item_id` int(10) UNSIGNED NOT NULL,
  `photo_path` varchar(255) NOT NULL,
  `is_primary` tinyint(1) DEFAULT 0,
  `display_order` int(11) DEFAULT 0,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `agency_team_members`
--

CREATE TABLE `agency_team_members` (
  `id` int(10) UNSIGNED NOT NULL,
  `agency_id` int(10) UNSIGNED NOT NULL,
  `architect_id` int(10) UNSIGNED NOT NULL,
  `application_id` int(10) UNSIGNED DEFAULT NULL,
  `role` varchar(100) DEFAULT NULL,
  `salary` decimal(10,2) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `architects`
--

CREATE TABLE `architects` (
  `id` int(10) UNSIGNED NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('male','female') DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `years_of_experience` int(11) DEFAULT NULL,
  `portfolio_url` varchar(255) DEFAULT NULL,
  `linkedin_url` varchar(255) DEFAULT NULL,
  `primary_expertise` varchar(255) DEFAULT NULL,
  `statement` enum('graduate architect','intern') DEFAULT NULL,
  `software_proficiency` varchar(255) DEFAULT NULL,
  `projects_worked_on` set('residential','commercial','institutional','urban','cultural') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `architects`
--

INSERT INTO `architects` (`id`, `first_name`, `last_name`, `date_of_birth`, `gender`, `city`, `address`, `bio`, `years_of_experience`, `portfolio_url`, `linkedin_url`, `primary_expertise`, `statement`, `software_proficiency`, `projects_worked_on`) VALUES
(18, 'zahra', 'hadid', '2005-06-06', 'female', '18 - Jijel', '7ay elmoudjahidine', 'good ingineer expertised in interior design', 5, '', '', 'interior design', NULL, NULL, NULL),
(26, 'tesnime', 'kahlessnane', '2004-06-09', 'female', '10 - Bouira', NULL, NULL, 4, '', '', 'interior design', NULL, NULL, NULL),
(27, 'hala', 'Minna', '2004-03-14', 'female', '19 - Sétif', 'setif elalma', 'a hard worker, desciplines, motivated exterior architect', 7, NULL, NULL, 'exterior design', NULL, NULL, NULL),
(30, 'ranim', 'hamguani', '2004-03-10', 'female', '11 - Tamanrasset', 'dfcvv bfgnbhmkjmfvdxv', 'dfcvv bfgnbhmkjmfvdxvdfcvv bfgnbhmkjmfvdxvdfcvv bfgnbhmkjmfvdxvdfcvv bfgnbhmkjmfvdxv', 7, NULL, NULL, 'exterior design', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `architect_applications`
--

CREATE TABLE `architect_applications` (
  `id` int(10) UNSIGNED NOT NULL,
  `architect_id` int(10) UNSIGNED NOT NULL,
  `agency_id` int(10) UNSIGNED NOT NULL,
  `project_types` text DEFAULT NULL,
  `motivation_letter` text NOT NULL,
  `status` enum('pending','accepted','rejected','withdrawn') DEFAULT 'pending',
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `reviewed_by` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `architect_education`
--

CREATE TABLE `architect_education` (
  `id` int(10) UNSIGNED NOT NULL,
  `architect_id` int(10) UNSIGNED NOT NULL,
  `university_name` varchar(255) NOT NULL,
  `degree` varchar(255) NOT NULL,
  `field_of_study` varchar(255) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `is_current` tinyint(1) DEFAULT 0,
  `display_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `architect_experience`
--

CREATE TABLE `architect_experience` (
  `id` int(10) UNSIGNED NOT NULL,
  `architect_id` int(10) UNSIGNED NOT NULL,
  `role` varchar(255) NOT NULL,
  `agency_id` int(10) UNSIGNED DEFAULT NULL,
  `agency_name` varchar(255) DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `is_current` tinyint(1) DEFAULT 0,
  `description` text DEFAULT NULL,
  `display_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `architect_portfolio_items`
--

CREATE TABLE `architect_portfolio_items` (
  `id` int(10) UNSIGNED NOT NULL,
  `architect_id` int(10) UNSIGNED NOT NULL,
  `project_id` int(10) UNSIGNED DEFAULT NULL,
  `project_name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `project_type` enum('residential','commercial','institutional','urban','cultural','interior','exterior') DEFAULT NULL,
  `style_tags` text DEFAULT NULL,
  `completion_date` date DEFAULT NULL,
  `is_featured` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `architect_portfolio_photos`
--

CREATE TABLE `architect_portfolio_photos` (
  `id` int(10) UNSIGNED NOT NULL,
  `portfolio_item_id` int(10) UNSIGNED NOT NULL,
  `photo_path` varchar(255) NOT NULL,
  `is_primary` tinyint(1) DEFAULT 0,
  `display_order` int(11) DEFAULT 0,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `clients`
--

CREATE TABLE `clients` (
  `id` int(10) UNSIGNED NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `clients`
--

INSERT INTO `clients` (`id`, `first_name`, `last_name`) VALUES
(17, '', '');

-- --------------------------------------------------------

--
-- Table structure for table `projects`
--

CREATE TABLE `projects` (
  `id` int(10) UNSIGNED NOT NULL,
  `request_id` int(10) UNSIGNED NOT NULL,
  `client_id` int(10) UNSIGNED NOT NULL,
  `agency_id` int(10) UNSIGNED NOT NULL,
  `assigned_architect_id` int(10) UNSIGNED DEFAULT NULL,
  `project_name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('planning','in_progress','review','completed','on_hold','cancelled') DEFAULT 'planning',
  `progress_percentage` int(11) DEFAULT 0,
  `start_date` date DEFAULT NULL,
  `deadline` date DEFAULT NULL,
  `completed_date` date DEFAULT NULL,
  `budget` decimal(15,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

-- --------------------------------------------------------

--
-- Table structure for table `project_milestones`
--

CREATE TABLE `project_milestones` (
  `id` int(10) UNSIGNED NOT NULL,
  `project_id` int(10) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `due_date` date NOT NULL,
  `due_time` time DEFAULT NULL,
  `is_completed` tinyint(1) DEFAULT 0,
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `project_photos`
--

CREATE TABLE `project_photos` (
  `id` int(10) UNSIGNED NOT NULL,
  `project_id` int(10) UNSIGNED NOT NULL,
  `photo_path` varchar(255) NOT NULL,
  `is_primary` tinyint(1) DEFAULT 0,
  `display_order` int(11) DEFAULT 0,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `project_requests`
--

CREATE TABLE `project_requests` (
  `id` int(10) UNSIGNED NOT NULL,
  `client_id` int(10) UNSIGNED NOT NULL,
  `agency_id` int(10) UNSIGNED NOT NULL,
  `project_name` varchar(255) NOT NULL,
  `project_type` enum('exterior','interior','both') NOT NULL,
  `service_type` enum('construction','renovation','design_only') NOT NULL,
  `project_location` varchar(255) DEFAULT NULL,
  `status` enum('pending','accepted','rejected','in_progress','completed','cancelled') DEFAULT 'pending',
  `min_budget` decimal(15,2) DEFAULT NULL,
  `max_budget` decimal(15,2) DEFAULT NULL,
  `preferred_timeline` varchar(100) DEFAULT NULL,
  `style_preference` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `project_request_exterior_details`
--

CREATE TABLE `project_request_exterior_details` (
  `id` int(10) UNSIGNED NOT NULL,
  `request_id` int(10) UNSIGNED NOT NULL,
  `property_type` enum('residential','commercial','landscape','institutional','other') DEFAULT NULL,
  `number_of_floors` int(11) DEFAULT NULL,
  `area` decimal(10,2) DEFAULT NULL,
  `style_preference` varchar(255) DEFAULT NULL,
  `material_preferences` text DEFAULT NULL,
  `special_requirements` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `project_request_interior_details`
--

CREATE TABLE `project_request_interior_details` (
  `id` int(10) UNSIGNED NOT NULL,
  `request_id` int(10) UNSIGNED NOT NULL,
  `interior_location` varchar(255) DEFAULT NULL,
  `property_type` enum('apartment','house','office','commercial','other') DEFAULT NULL,
  `number_of_rooms` int(11) DEFAULT NULL,
  `area` decimal(10,2) DEFAULT NULL,
  `style_preference` varchar(255) DEFAULT NULL,
  `color_scheme` varchar(255) DEFAULT NULL,
  `material_preferences` text DEFAULT NULL,
  `special_requirements` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `project_request_photos`
--

CREATE TABLE `project_request_photos` (
  `id` int(10) UNSIGNED NOT NULL,
  `request_id` int(10) UNSIGNED NOT NULL,
  `photo_path` varchar(255) NOT NULL,
  `photo_type` enum('reference','current_state','other') DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` int(10) UNSIGNED NOT NULL,
  `client_id` int(10) UNSIGNED NOT NULL,
  `project_id` int(10) UNSIGNED DEFAULT NULL,
  `agency_id` int(10) UNSIGNED DEFAULT NULL,
  `architect_id` int(10) UNSIGNED DEFAULT NULL,
  `rating` int(11) NOT NULL,
  `review_text` text NOT NULL,
  `is_verified` tinyint(1) DEFAULT 0,
  `is_visible` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(10) UNSIGNED NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `user_type` enum('client','architect','agency') NOT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_login` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password_hash`, `user_type`, `phone_number`, `profile_image`, `is_active`, `created_at`, `updated_at`, `last_login`) VALUES
(5, 'fatima.kader@gmail.com', '$2y$10$abcdefghijklmnopqrstuvwxyz123456', 'client', '+213555234567', 'profiles/fatima.jpg', 1, '2025-12-02 16:37:02', '2025-12-02 16:37:02', '2024-11-25 13:15:00'),
(6, 'youcef.mansouri@gmail.com', '$2y$10$abcdefghijklmnopqrstuvwxyz123456', 'client', '+213555345678', NULL, 1, '2025-12-02 16:37:02', '2025-12-02 16:37:02', '2024-11-28 08:00:00'),
(7, 'karim.meziane@gmail.com', '$2y$10$abcdefghijklmnopqrstuvwxyz123456', 'architect', '+213555456789', 'profiles/karim.jpg', 1, '2025-12-02 16:37:02', '2025-12-02 16:37:02', '2024-12-01 15:45:00'),
(8, 'samira.bouazza@gmail.com', '$2y$10$abcdefghijklmnopqrstuvwxyz123456', 'architect', '+213555567890', 'profiles/samira.jpg', 1, '2025-12-02 16:37:02', '2025-12-02 16:37:02', '2024-12-02 10:20:00'),
(9, 'riad.chergui@gmail.com', '$2y$10$abcdefghijklmnopqrstuvwxyz123456', 'architect', '+213555678901', NULL, 1, '2025-12-02 16:37:02', '2025-12-02 16:37:02', '2024-11-30 07:30:00'),
(10, 'contact@designplus.dz', '$2y$10$abcdefghijklmnopqrstuvwxyz123456', 'agency', '+213555789012', 'profiles/designplus.jpg', 1, '2025-12-02 16:37:02', '2025-12-02 16:37:02', '2024-12-02 14:00:00'),
(11, 'info@urbanarch.dz', '$2y$10$abcdefghijklmnopqrstuvwxyz123456', 'agency', '+213555890123', 'profiles/urbanarch.jpg', 1, '2025-12-02 16:37:02', '2025-12-02 16:37:02', '2024-12-01 12:30:00'),
(17, 'afrah.zeghilet@ensia.edu.dz', '$2y$10$rIui4RS5IFX42muL9JYG2OgF/qvkrvqfJ8RVGoI9RaVQrfHetrqkG', 'client', NULL, NULL, 1, '2026-01-29 11:18:28', '2026-02-02 14:26:33', '2026-02-02 14:26:00'),
(18, 'zahra2024@gmail.com', '$2y$10$4B8MAh16jmSX0/rVErNinOl/KclrIQFYMTmPK1YxoqSYToWGivfPW', 'architect', '0556789801', NULL, 1, '2026-01-29 12:49:04', '2026-02-02 14:30:36', '2026-02-02 14:29:57'),
(26, 'tesnimek@gmail.com', '$2y$10$hUCuqgVB9qkNqT5yN5TjDOBLCgB18UdP472OBgnXzyuLTfKxyr4mO', 'architect', '0778986777', NULL, 1, '2026-01-29 14:18:10', '2026-01-29 14:55:28', '2026-01-29 14:55:28'),
(27, 'hala2002@gmail.com', '$2y$10$Y.Uv8j3G9Zzelm6cFTpl.eQ7dfiZ.NSRIOgYhvoSK6b9/MPAcG5Km', 'architect', '0665879600', 'assets/uploads/profile_images/6980e9c274bb4_purple-heart_1f49c.png', 1, '2026-02-02 18:15:30', '2026-02-02 18:16:18', NULL),
(28, 'Builda@gmail.com', '$2y$10$I7omCFStMqcvmmyiJEwVXeDVegAqOhCg0j/6ZUKpjG98UUNwtdRDG', 'agency', '0665879600', 'assets/uploads/profile_images/6980f2f6f1de7_growing-heart_1f497.png', 1, '2026-02-02 18:54:47', '2026-02-02 18:55:09', NULL),
(29, 'myhouse@gmail.com', '$2y$10$2R6tyr0qtiIw8cpCDq8g4u1dcCV5ZR4HxsjUXWe8HIbz4hQ3KZwNi', 'agency', '0778986778', 'assets/uploads/profile_images/6983519f4d599_agency 2.jpg', 1, '2026-02-04 14:03:11', '2026-02-04 14:11:40', NULL),
(30, 'narinm@gmail.com', '$2y$10$FsNSXgcd5EcD7zgzrT7.tOhhm9BONzg.cl1F0bIUxfaaw6JIdJgSq', 'architect', '0665878900', 'assets/uploads/profile_images/698467aaf2774_House.jpg', 1, '2026-02-05 09:49:31', '2026-02-05 13:52:50', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `agencies`
--
ALTER TABLE `agencies`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_city` (`city`),
  ADD KEY `idx_is_approved` (`is_approved`);

--
-- Indexes for table `agency_portfolio_items`
--
ALTER TABLE `agency_portfolio_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `project_id` (`project_id`),
  ADD KEY `idx_agency` (`agency_id`);

--
-- Indexes for table `agency_portfolio_photos`
--
ALTER TABLE `agency_portfolio_photos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_portfolio_item` (`portfolio_item_id`);

--
-- Indexes for table `agency_team_members`
--
ALTER TABLE `agency_team_members`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_agency_architect` (`agency_id`,`architect_id`),
  ADD KEY `application_id` (`application_id`),
  ADD KEY `idx_agency` (`agency_id`),
  ADD KEY `idx_architect` (`architect_id`);

--
-- Indexes for table `architects`
--
ALTER TABLE `architects`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_city` (`city`);

--
-- Indexes for table `architect_applications`
--
ALTER TABLE `architect_applications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_architect` (`architect_id`),
  ADD KEY `idx_agency` (`agency_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `architect_education`
--
ALTER TABLE `architect_education`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_architect` (`architect_id`);

--
-- Indexes for table `architect_experience`
--
ALTER TABLE `architect_experience`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_architect` (`architect_id`),
  ADD KEY `idx_agency` (`agency_id`);

--
-- Indexes for table `architect_portfolio_items`
--
ALTER TABLE `architect_portfolio_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `project_id` (`project_id`),
  ADD KEY `idx_architect` (`architect_id`);

--
-- Indexes for table `architect_portfolio_photos`
--
ALTER TABLE `architect_portfolio_photos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_portfolio_item` (`portfolio_item_id`);

--
-- Indexes for table `clients`
--
ALTER TABLE `clients`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`),
  ADD KEY `request_id` (`request_id`),
  ADD KEY `idx_client` (`client_id`),
  ADD KEY `idx_agency` (`agency_id`),
  ADD KEY `idx_architect` (`assigned_architect_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `project_milestones`
--
ALTER TABLE `project_milestones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_project` (`project_id`);

--
-- Indexes for table `project_photos`
--
ALTER TABLE `project_photos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_project` (`project_id`);

--
-- Indexes for table `project_requests`
--
ALTER TABLE `project_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_client` (`client_id`),
  ADD KEY `idx_agency` (`agency_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `project_request_exterior_details`
--
ALTER TABLE `project_request_exterior_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `request_id` (`request_id`);

--
-- Indexes for table `project_request_interior_details`
--
ALTER TABLE `project_request_interior_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `request_id` (`request_id`);

--
-- Indexes for table `project_request_photos`
--
ALTER TABLE `project_request_photos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_request` (`request_id`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_client` (`client_id`),
  ADD KEY `idx_project` (`project_id`),
  ADD KEY `idx_agency` (`agency_id`),
  ADD KEY `idx_architect` (`architect_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_user_type` (`user_type`),
  ADD KEY `idx_email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `agency_portfolio_items`
--
ALTER TABLE `agency_portfolio_items`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `agency_portfolio_photos`
--
ALTER TABLE `agency_portfolio_photos`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `agency_team_members`
--
ALTER TABLE `agency_team_members`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `architect_applications`
--
ALTER TABLE `architect_applications`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `architect_education`
--
ALTER TABLE `architect_education`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `architect_experience`
--
ALTER TABLE `architect_experience`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `architect_portfolio_items`
--
ALTER TABLE `architect_portfolio_items`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `architect_portfolio_photos`
--
ALTER TABLE `architect_portfolio_photos`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `projects`
--
ALTER TABLE `projects`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `project_milestones`
--
ALTER TABLE `project_milestones`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `project_photos`
--
ALTER TABLE `project_photos`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `project_requests`
--
ALTER TABLE `project_requests`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `project_request_exterior_details`
--
ALTER TABLE `project_request_exterior_details`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `project_request_interior_details`
--
ALTER TABLE `project_request_interior_details`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `project_request_photos`
--
ALTER TABLE `project_request_photos`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `agencies`
--
ALTER TABLE `agencies`
  ADD CONSTRAINT `agencies_ibfk_1` FOREIGN KEY (`id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `agency_portfolio_items`
--
ALTER TABLE `agency_portfolio_items`
  ADD CONSTRAINT `agency_portfolio_items_ibfk_1` FOREIGN KEY (`agency_id`) REFERENCES `agencies` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `agency_portfolio_items_ibfk_2` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `agency_portfolio_photos`
--
ALTER TABLE `agency_portfolio_photos`
  ADD CONSTRAINT `agency_portfolio_photos_ibfk_1` FOREIGN KEY (`portfolio_item_id`) REFERENCES `agency_portfolio_items` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `agency_team_members`
--
ALTER TABLE `agency_team_members`
  ADD CONSTRAINT `agency_team_members_ibfk_1` FOREIGN KEY (`agency_id`) REFERENCES `agencies` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `agency_team_members_ibfk_2` FOREIGN KEY (`architect_id`) REFERENCES `architects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `agency_team_members_ibfk_3` FOREIGN KEY (`application_id`) REFERENCES `architect_applications` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `architects`
--
ALTER TABLE `architects`
  ADD CONSTRAINT `architects_ibfk_1` FOREIGN KEY (`id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `architect_applications`
--
ALTER TABLE `architect_applications`
  ADD CONSTRAINT `architect_applications_ibfk_1` FOREIGN KEY (`architect_id`) REFERENCES `architects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `architect_applications_ibfk_2` FOREIGN KEY (`agency_id`) REFERENCES `agencies` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `architect_education`
--
ALTER TABLE `architect_education`
  ADD CONSTRAINT `architect_education_ibfk_1` FOREIGN KEY (`architect_id`) REFERENCES `architects` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `architect_experience`
--
ALTER TABLE `architect_experience`
  ADD CONSTRAINT `architect_experience_ibfk_1` FOREIGN KEY (`architect_id`) REFERENCES `architects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `architect_experience_ibfk_2` FOREIGN KEY (`agency_id`) REFERENCES `agencies` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `architect_portfolio_items`
--
ALTER TABLE `architect_portfolio_items`
  ADD CONSTRAINT `architect_portfolio_items_ibfk_1` FOREIGN KEY (`architect_id`) REFERENCES `architects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `architect_portfolio_items_ibfk_2` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `architect_portfolio_photos`
--
ALTER TABLE `architect_portfolio_photos`
  ADD CONSTRAINT `architect_portfolio_photos_ibfk_1` FOREIGN KEY (`portfolio_item_id`) REFERENCES `architect_portfolio_items` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `clients`
--
ALTER TABLE `clients`
  ADD CONSTRAINT `clients_ibfk_1` FOREIGN KEY (`id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `projects`
--
ALTER TABLE `projects`
  ADD CONSTRAINT `projects_ibfk_1` FOREIGN KEY (`request_id`) REFERENCES `project_requests` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `projects_ibfk_2` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `projects_ibfk_3` FOREIGN KEY (`agency_id`) REFERENCES `agencies` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `projects_ibfk_4` FOREIGN KEY (`assigned_architect_id`) REFERENCES `architects` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `project_milestones`
--
ALTER TABLE `project_milestones`
  ADD CONSTRAINT `project_milestones_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `project_photos`
--
ALTER TABLE `project_photos`
  ADD CONSTRAINT `project_photos_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `project_requests`
--
ALTER TABLE `project_requests`
  ADD CONSTRAINT `project_requests_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `project_requests_ibfk_2` FOREIGN KEY (`agency_id`) REFERENCES `agencies` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `project_request_exterior_details`
--
ALTER TABLE `project_request_exterior_details`
  ADD CONSTRAINT `project_request_exterior_details_ibfk_1` FOREIGN KEY (`request_id`) REFERENCES `project_requests` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `project_request_interior_details`
--
ALTER TABLE `project_request_interior_details`
  ADD CONSTRAINT `project_request_interior_details_ibfk_1` FOREIGN KEY (`request_id`) REFERENCES `project_requests` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `project_request_photos`
--
ALTER TABLE `project_request_photos`
  ADD CONSTRAINT `project_request_photos_ibfk_1` FOREIGN KEY (`request_id`) REFERENCES `project_requests` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_3` FOREIGN KEY (`agency_id`) REFERENCES `agencies` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_4` FOREIGN KEY (`architect_id`) REFERENCES `architects` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
