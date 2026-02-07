-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 07, 2026 at 12:04 AM
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
(301, 'Modern Arch', 'Algiers', 'Bab Ezzouar', 'uploads/agencies/a1.jpg', 'Modern architecture studio', NULL, 1),
(302, 'Urban Studio', 'Oran', 'City Center', 'uploads/agencies/a2.jpg', 'Urban specialists', NULL, 1),
(303, 'DesignPro', 'Constantine', 'Main Street', 'uploads/agencies/a3.jpg', 'Interior & exterior design', NULL, 1),
(304, 'ArchVision', 'Blida', 'Downtown', 'uploads/agencies/a4.jpg', 'Creative solutions', NULL, 1),
(305, 'BuildArt', 'Setif', 'Business District', 'uploads/agencies/a5.jpg', 'Construction experts', NULL, 1),
(306, 'SpaceLab', 'Annaba', 'Seaside', 'uploads/agencies/a6.jpg', 'Innovative designs', NULL, 1);

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
(201, 'Amine', 'Zeroual', NULL, NULL, 'Algiers', NULL, NULL, 5, NULL, NULL, 'Residential Design', 'graduate architect', 'AutoCAD,Revit', 'residential,commercial'),
(202, 'Rania', 'Touati', NULL, NULL, 'Oran', NULL, NULL, 3, NULL, NULL, 'Interior Design', 'intern', 'SketchUp,3ds Max', 'residential'),
(203, 'Karim', 'Belaid', NULL, NULL, 'Constantine', NULL, NULL, 8, NULL, NULL, 'Urban Planning', 'graduate architect', 'AutoCAD,GIS', 'institutional,urban'),
(204, 'Meriem', 'Saidi', NULL, NULL, 'Blida', NULL, NULL, 4, NULL, NULL, 'Commercial', 'graduate architect', 'Revit,Lumion', 'commercial'),
(205, 'Hassan', 'Mekki', NULL, NULL, 'Setif', NULL, NULL, 6, NULL, NULL, 'Residential', 'graduate architect', 'AutoCAD,SketchUp', 'residential'),
(206, 'Yasmine', 'Haddad', NULL, NULL, 'Annaba', NULL, NULL, 2, NULL, NULL, 'Interior', 'intern', '3ds Max', 'residential');

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
(101, 'Ali', 'Benali'),
(102, 'Sara', 'Khaled'),
(103, 'Yacine', 'Mansouri'),
(104, 'Lina', 'Bouzid'),
(105, 'Omar', 'Saadi'),
(106, 'Nadia', 'Cherif');

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `projects`
--

INSERT INTO `projects` (`id`, `request_id`, `client_id`, `agency_id`, `assigned_architect_id`, `project_name`, `description`, `status`, `progress_percentage`, `start_date`, `deadline`, `completed_date`, `budget`, `created_at`, `updated_at`) VALUES
(2, 1, 101, 301, 201, 'Villa Design', NULL, 'in_progress', 40, '2026-01-01', NULL, NULL, 3000000.00, '2026-02-06 23:00:26', '2026-02-06 23:00:26'),
(3, 2, 102, 302, 202, 'Office Interior', NULL, 'planning', 10, '2026-02-01', NULL, NULL, 500000.00, '2026-02-06 23:00:26', '2026-02-06 23:00:26'),
(4, 3, 103, 303, 203, 'House Renovation', NULL, 'review', 70, '2025-12-01', NULL, NULL, 1000000.00, '2026-02-06 23:00:26', '2026-02-06 23:00:26'),
(5, 4, 104, 304, 204, 'Shop Design', NULL, 'completed', 100, '2025-10-01', NULL, NULL, 400000.00, '2026-02-06 23:00:26', '2026-02-06 23:00:26'),
(6, 5, 105, 305, 205, 'Residential Building', NULL, 'in_progress', 30, '2026-01-15', NULL, NULL, 7000000.00, '2026-02-06 23:00:26', '2026-02-06 23:00:26'),
(7, 6, 106, 306, 206, 'Apartment Interior', NULL, 'planning', 5, '2026-02-05', NULL, NULL, 250000.00, '2026-02-06 23:00:26', '2026-02-06 23:00:26');

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

--
-- Dumping data for table `project_photos`
--

INSERT INTO `project_photos` (`id`, `project_id`, `photo_path`, `is_primary`, `display_order`, `uploaded_at`) VALUES
(7, 2, 'uploads/projects/p1.jpg', 1, 0, '2026-02-06 23:03:08'),
(8, 3, 'uploads/projects/p2.jpg', 1, 0, '2026-02-06 23:03:08'),
(9, 4, 'uploads/projects/p3.jpg', 1, 0, '2026-02-06 23:03:08'),
(10, 5, 'uploads/projects/p4.jpg', 1, 0, '2026-02-06 23:03:08'),
(11, 6, 'uploads/projects/p5.jpg', 1, 0, '2026-02-06 23:03:08'),
(12, 7, 'uploads/projects/p6.jpg', 1, 0, '2026-02-06 23:03:08');

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

--
-- Dumping data for table `project_requests`
--

INSERT INTO `project_requests` (`id`, `client_id`, `agency_id`, `project_name`, `project_type`, `service_type`, `project_location`, `status`, `min_budget`, `max_budget`, `preferred_timeline`, `style_preference`, `description`, `created_at`, `updated_at`) VALUES
(1, 101, 301, 'Villa Design', 'both', 'construction', 'Algiers', 'accepted', 2000000.00, 4000000.00, NULL, NULL, NULL, '2026-02-06 23:00:13', '2026-02-06 23:00:13'),
(2, 102, 302, 'Office Interior', 'interior', 'design_only', 'Oran', 'accepted', 300000.00, 800000.00, NULL, NULL, NULL, '2026-02-06 23:00:13', '2026-02-06 23:00:13'),
(3, 103, 303, 'House Renovation', 'both', 'renovation', 'Constantine', 'accepted', 500000.00, 1500000.00, NULL, NULL, NULL, '2026-02-06 23:00:13', '2026-02-06 23:00:13'),
(4, 104, 304, 'Shop Design', 'interior', 'design_only', 'Blida', 'accepted', 200000.00, 600000.00, NULL, NULL, NULL, '2026-02-06 23:00:13', '2026-02-06 23:00:13'),
(5, 105, 305, 'Residential Building', 'exterior', 'construction', 'Setif', 'accepted', 5000000.00, 9000000.00, NULL, NULL, NULL, '2026-02-06 23:00:13', '2026-02-06 23:00:13'),
(6, 106, 306, 'Apartment Interior', 'interior', 'design_only', 'Annaba', 'accepted', 150000.00, 400000.00, NULL, NULL, NULL, '2026-02-06 23:00:13', '2026-02-06 23:00:13');

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
-- Table structure for table `review_agency`
--

CREATE TABLE `review_agency` (
  `id` int(11) NOT NULL,
  `agency_id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL,
  `rating` int(11) NOT NULL,
  `review_text` text NOT NULL,
  `is_visible` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `review_project`
--

CREATE TABLE `review_project` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(101, 'client1@test.com', '$2y$10$XJx3FZJ4kG3P8rW9KZJz1uO6cHcYx7J3Vn1qFZ2GQkW7LrJ8TqP9S', 'client', '0555000001', 'uploads/users/c1.jpg', 1, '2026-02-06 22:59:21', '2026-02-06 22:59:21', NULL),
(102, 'client2@test.com', '$2y$10$XJx3FZJ4kG3P8rW9KZJz1uO6cHcYx7J3Vn1qFZ2GQkW7LrJ8TqP9S', 'client', '0555000002', 'uploads/users/c2.jpg', 1, '2026-02-06 22:59:21', '2026-02-06 22:59:21', NULL),
(103, 'client3@test.com', '$2y$10$XJx3FZJ4kG3P8rW9KZJz1uO6cHcYx7J3Vn1qFZ2GQkW7LrJ8TqP9S', 'client', '0555000003', 'uploads/users/c3.jpg', 1, '2026-02-06 22:59:21', '2026-02-06 22:59:21', NULL),
(104, 'client4@test.com', '$2y$10$XJx3FZJ4kG3P8rW9KZJz1uO6cHcYx7J3Vn1qFZ2GQkW7LrJ8TqP9S', 'client', '0555000004', 'uploads/users/c4.jpg', 1, '2026-02-06 22:59:21', '2026-02-06 22:59:21', NULL),
(105, 'client5@test.com', '$2y$10$XJx3FZJ4kG3P8rW9KZJz1uO6cHcYx7J3Vn1qFZ2GQkW7LrJ8TqP9S', 'client', '0555000005', 'uploads/users/c5.jpg', 1, '2026-02-06 22:59:21', '2026-02-06 22:59:21', NULL),
(106, 'client6@test.com', '$2y$10$XJx3FZJ4kG3P8rW9KZJz1uO6cHcYx7J3Vn1qFZ2GQkW7LrJ8TqP9S', 'client', '0555000006', 'uploads/users/c6.jpg', 1, '2026-02-06 22:59:21', '2026-02-06 22:59:21', NULL),
(201, 'arch1@test.com', '$2y$10$XJx3FZJ4kG3P8rW9KZJz1uO6cHcYx7J3Vn1qFZ2GQkW7LrJ8TqP9S', 'architect', '0666000001', 'uploads/users/a1.jpg', 1, '2026-02-06 22:59:21', '2026-02-06 22:59:21', NULL),
(202, 'arch2@test.com', '$2y$10$XJx3FZJ4kG3P8rW9KZJz1uO6cHcYx7J3Vn1qFZ2GQkW7LrJ8TqP9S', 'architect', '0666000002', 'uploads/users/a2.jpg', 1, '2026-02-06 22:59:21', '2026-02-06 22:59:21', NULL),
(203, 'arch3@test.com', '$2y$10$XJx3FZJ4kG3P8rW9KZJz1uO6cHcYx7J3Vn1qFZ2GQkW7LrJ8TqP9S', 'architect', '0666000003', 'uploads/users/a3.jpg', 1, '2026-02-06 22:59:21', '2026-02-06 22:59:21', NULL),
(204, 'arch4@test.com', '$2y$10$XJx3FZJ4kG3P8rW9KZJz1uO6cHcYx7J3Vn1qFZ2GQkW7LrJ8TqP9S', 'architect', '0666000004', 'uploads/users/a4.jpg', 1, '2026-02-06 22:59:21', '2026-02-06 22:59:21', NULL),
(205, 'arch5@test.com', '$2y$10$XJx3FZJ4kG3P8rW9KZJz1uO6cHcYx7J3Vn1qFZ2GQkW7LrJ8TqP9S', 'architect', '0666000005', 'uploads/users/a5.jpg', 1, '2026-02-06 22:59:21', '2026-02-06 22:59:21', NULL),
(206, 'arch6@test.com', '$2y$10$XJx3FZJ4kG3P8rW9KZJz1uO6cHcYx7J3Vn1qFZ2GQkW7LrJ8TqP9S', 'architect', '0666000006', 'uploads/users/a6.jpg', 1, '2026-02-06 22:59:21', '2026-02-06 22:59:21', NULL),
(301, 'agency1@test.com', '$2y$10$XJx3FZJ4kG3P8rW9KZJz1uO6cHcYx7J3Vn1qFZ2GQkW7LrJ8TqP9S', 'agency', '0777000001', 'uploads/users/g1.jpg', 1, '2026-02-06 22:59:21', '2026-02-06 22:59:21', NULL),
(302, 'agency2@test.com', '$2y$10$XJx3FZJ4kG3P8rW9KZJz1uO6cHcYx7J3Vn1qFZ2GQkW7LrJ8TqP9S', 'agency', '0777000002', 'uploads/users/g2.jpg', 1, '2026-02-06 22:59:21', '2026-02-06 22:59:21', NULL),
(303, 'agency3@test.com', '$2y$10$XJx3FZJ4kG3P8rW9KZJz1uO6cHcYx7J3Vn1qFZ2GQkW7LrJ8TqP9S', 'agency', '0777000003', 'uploads/users/g3.jpg', 1, '2026-02-06 22:59:21', '2026-02-06 22:59:21', NULL),
(304, 'agency4@test.com', '$2y$10$XJx3FZJ4kG3P8rW9KZJz1uO6cHcYx7J3Vn1qFZ2GQkW7LrJ8TqP9S', 'agency', '0777000004', 'uploads/users/g4.jpg', 1, '2026-02-06 22:59:21', '2026-02-06 22:59:21', NULL),
(305, 'agency5@test.com', '$2y$10$XJx3FZJ4kG3P8rW9KZJz1uO6cHcYx7J3Vn1qFZ2GQkW7LrJ8TqP9S', 'agency', '0777000005', 'uploads/users/g5.jpg', 1, '2026-02-06 22:59:21', '2026-02-06 22:59:21', NULL),
(306, 'agency6@test.com', '$2y$10$XJx3FZJ4kG3P8rW9KZJz1uO6cHcYx7J3Vn1qFZ2GQkW7LrJ8TqP9S', 'agency', '0777000006', 'uploads/users/g6.jpg', 1, '2026-02-06 22:59:21', '2026-02-06 22:59:21', NULL);

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
-- Indexes for table `review_agency`
--
ALTER TABLE `review_agency`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_agency_client` (`agency_id`,`client_id`),
  ADD KEY `idx_agency` (`agency_id`),
  ADD KEY `idx_client` (`client_id`);

--
-- Indexes for table `review_project`
--
ALTER TABLE `review_project`
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
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `project_milestones`
--
ALTER TABLE `project_milestones`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `project_photos`
--
ALTER TABLE `project_photos`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `project_requests`
--
ALTER TABLE `project_requests`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

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
-- AUTO_INCREMENT for table `review_agency`
--
ALTER TABLE `review_agency`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `review_project`
--
ALTER TABLE `review_project`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=307;

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
-- Constraints for table `review_project`
--
ALTER TABLE `review_project`
  ADD CONSTRAINT `review_project_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `review_project_ibfk_2` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `review_project_ibfk_3` FOREIGN KEY (`agency_id`) REFERENCES `agencies` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `review_project_ibfk_4` FOREIGN KEY (`architect_id`) REFERENCES `architects` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
