-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 07, 2026 at 07:31 PM
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
(13, 'Modern Arch', '01 - Adrar', 'Bab Ezzouar', 'assets/profile-image/g1.jpg', 'Modern architecture studio the best ever', NULL, 1),
(14, 'Urban Studio', 'Oran', 'Center', 'assets/profile-image/g2.jpg', 'Urban specialists', NULL, 1),
(15, 'DesignPro', 'Constantine', 'Main street', 'assets/profile-image/g3.jpg', 'Interior experts', NULL, 1),
(16, 'ArchVision', 'Blida', 'Downtown', 'assets/profile-image/g4.jpg', 'Creative designs', NULL, 1),
(17, 'BuildArt', 'Setif', 'Business area', 'assets/profile-image/g5.jpg', 'Construction agency', NULL, 1),
(18, 'SpaceLab', 'Annaba', 'Seaside', 'assets/profile-image/g6.jpg', 'Innovative studio', NULL, 1);

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

--
-- Dumping data for table `agency_portfolio_items`
--

INSERT INTO `agency_portfolio_items` (`id`, `agency_id`, `project_id`, `project_name`, `description`, `project_type`, `style_tags`, `completion_date`, `is_featured`, `created_at`, `updated_at`) VALUES
(1, 13, 1, 'Luxury Villa Project', 'High-end residential villa', 'residential', NULL, NULL, 1, '2026-02-07 00:29:00', '2026-02-07 00:29:00'),
(2, 14, 2, 'Corporate Office', 'Office interior project', 'commercial', NULL, NULL, 1, '2026-02-07 00:29:00', '2026-02-07 00:29:00'),
(3, 15, 3, 'Renovation Project', 'House renovation', 'residential', NULL, NULL, 0, '2026-02-07 00:29:00', '2026-02-07 00:29:00'),
(4, 16, 4, 'Retail Shop', 'Commercial shop design', 'commercial', NULL, NULL, 0, '2026-02-07 00:29:00', '2026-02-07 00:29:00'),
(5, 17, 5, 'Residential Complex', 'Multi-unit housing', 'residential', NULL, NULL, 1, '2026-02-07 00:29:00', '2026-02-07 00:29:00'),
(6, 18, 6, 'Apartment Design', 'Interior renovation', 'interior', NULL, NULL, 0, '2026-02-07 00:29:00', '2026-02-07 00:29:00'),
(7, 13, 7, 'Eco-Friendly Family Home', 'Sustainable modern residential design with solar integration', 'residential', 'Sustainable,Modern,Eco-friendly', NULL, 1, '2026-02-07 13:48:26', '2026-02-07 13:48:26'),
(8, 13, 8, 'Modern Commercial Office', 'Contemporary tech startup office renovation', 'commercial', 'Minimalist,Modern,Tech', NULL, 0, '2026-02-07 13:48:26', '2026-02-07 13:48:26'),
(9, 13, 9, 'Luxury Penthouse Interior', 'High-end smart home interior design', 'interior', 'Luxury,Modern,Smart Home', NULL, 1, '2026-02-07 13:48:26', '2026-02-07 13:48:26');

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

--
-- Dumping data for table `agency_portfolio_photos`
--

INSERT INTO `agency_portfolio_photos` (`id`, `portfolio_item_id`, `photo_path`, `is_primary`, `display_order`, `uploaded_at`) VALUES
(1, 1, 'assets/portfolio/g1.jpg', 1, 0, '2026-02-07 00:29:17'),
(2, 2, 'assets/portfolio/g2.jpg', 1, 0, '2026-02-07 00:29:17'),
(3, 3, 'assets/portfolio/g3.jpg', 1, 0, '2026-02-07 00:29:17'),
(4, 4, 'assets/portfolio/g4.jpg', 1, 0, '2026-02-07 00:29:17'),
(5, 5, 'assets/portfolio/g5.jpg', 1, 0, '2026-02-07 00:29:17'),
(6, 6, 'assets/portfolio/g6.jpg', 1, 0, '2026-02-07 00:29:17'),
(7, 7, 'assets/portfolio/g7.jpg', 1, 0, '2026-02-07 13:48:26'),
(8, 8, 'assets/portfolio/g8.jpg', 1, 0, '2026-02-07 13:48:26'),
(9, 9, 'assets/portfolio/g9.jpg', 1, 0, '2026-02-07 13:48:26');

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

--
-- Dumping data for table `agency_team_members`
--

INSERT INTO `agency_team_members` (`id`, `agency_id`, `architect_id`, `application_id`, `role`, `salary`, `start_date`, `end_date`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 13, 7, 1, 'Senior Architect', 120000.00, '2025-01-01', NULL, 1, '2026-02-07 00:28:22', '2026-02-07 00:28:22'),
(2, 15, 9, 3, 'Project Architect', 110000.00, '2025-03-01', NULL, 1, '2026-02-07 00:28:22', '2026-02-07 00:28:22'),
(3, 16, 10, 4, 'Architect', 90000.00, '2025-06-01', NULL, 1, '2026-02-07 00:28:22', '2026-02-07 00:28:22'),
(4, 18, 12, 6, 'Junior Architect', 60000.00, '2025-09-01', NULL, 1, '2026-02-07 00:28:22', '2026-02-07 00:28:22'),
(5, 17, 11, 5, NULL, NULL, '2026-02-07', NULL, 1, '2026-02-07 11:53:03', '2026-02-07 11:53:03'),
(6, 13, 13, 8, 'Project Architect', 115000.00, '2026-02-01', NULL, 1, '2026-02-07 13:48:26', '2026-02-07 13:48:26'),
(7, 13, 14, 9, 'Architect', 95000.00, '2026-02-01', NULL, 1, '2026-02-07 13:48:26', '2026-02-07 13:48:26'),
(8, 13, 15, 10, 'Junior Architect', 65000.00, '2026-02-01', NULL, 1, '2026-02-07 13:48:26', '2026-02-07 13:48:26');

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
(7, 'Amine', 'Zeroual', '2005-11-07', 'female', '10 - Bouira', 'biskra bab louad', 'a senior arhcitect with great experiences', 5, NULL, NULL, 'all design', 'graduate architect', NULL, NULL),
(8, 'Rania', 'Touati', NULL, NULL, 'Oran', NULL, NULL, 3, NULL, NULL, NULL, 'intern', NULL, NULL),
(9, 'Karim', 'Belaid', NULL, NULL, 'Constantine', NULL, NULL, 8, NULL, NULL, NULL, 'graduate architect', NULL, NULL),
(10, 'Meriem', 'Saidi', NULL, NULL, 'Blida', NULL, NULL, 4, NULL, NULL, NULL, 'graduate architect', NULL, NULL),
(11, 'Hassan', 'Mekki', NULL, NULL, 'Setif', NULL, NULL, 6, NULL, NULL, NULL, 'graduate architect', NULL, NULL),
(12, 'Yasmine', 'Haddad', NULL, NULL, 'Annaba', NULL, NULL, 2, NULL, NULL, NULL, 'intern', NULL, NULL),
(13, 'Leila', 'Bensalem', '1992-05-15', 'female', '16 - Alger', 'Hydra, Algiers', 'Experienced architect specializing in sustainable residential design with a focus on modern aesthetics', 7, NULL, NULL, 'Sustainable Architecture', 'graduate architect', 'AutoCAD, Revit, SketchUp', 'residential,commercial'),
(14, 'Mehdi', 'Amrani', '1995-08-22', 'male', '16 - Alger', 'El Biar, Algiers', 'Creative architect with expertise in commercial spaces and contemporary design solutions', 4, NULL, NULL, 'Commercial Design', 'graduate architect', 'AutoCAD, 3ds Max, Lumion', 'commercial,institutional'),
(15, 'Sonia', 'Khelifi', '1998-03-10', 'female', '16 - Alger', 'Dely Ibrahim, Algiers', 'Junior architect passionate about innovative interior solutions and smart home integration', 2, NULL, NULL, 'Interior Architecture', 'intern', 'Revit, SketchUp, Photoshop', 'residential,urban');

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

--
-- Dumping data for table `architect_applications`
--

INSERT INTO `architect_applications` (`id`, `architect_id`, `agency_id`, `project_types`, `motivation_letter`, `status`, `reviewed_at`, `reviewed_by`, `created_at`, `updated_at`) VALUES
(1, 7, 13, 'residential,commercial', 'I specialize in modern residential design.', 'accepted', '2026-02-07 11:33:01', 13, '2026-02-07 00:28:10', '2026-02-07 11:33:01'),
(2, 8, 14, 'interior', 'Interior design is my passion.', 'pending', NULL, NULL, '2026-02-07 00:28:10', '2026-02-07 00:28:10'),
(3, 9, 15, 'urban,institutional', 'Experienced in large scale projects.', 'accepted', NULL, NULL, '2026-02-07 00:28:10', '2026-02-07 00:28:10'),
(4, 10, 16, 'commercial', 'Looking to expand my commercial portfolio.', 'accepted', NULL, NULL, '2026-02-07 00:28:10', '2026-02-07 00:28:10'),
(5, 11, 17, 'residential', 'Focused on sustainable housing.', 'accepted', '2026-02-07 11:53:03', 17, '2026-02-07 00:28:10', '2026-02-07 11:53:03'),
(6, 12, 18, 'interior', 'Junior architect eager to learn.', 'accepted', NULL, NULL, '2026-02-07 00:28:10', '2026-02-07 00:28:10'),
(7, 7, 17, NULL, 'frthbythby kjgnvberh orpfi m-eir', 'pending', NULL, NULL, '2026-02-07 11:57:48', '2026-02-07 11:57:48'),
(8, 13, 13, 'residential,commercial', 'I am highly interested in joining Modern Arch due to your reputation for innovative sustainable design. With 7 years of experience in residential and commercial projects, I believe I can contribute significantly to your team and help deliver exceptional results to your clients.', 'accepted', '2026-02-07 13:48:26', 13, '2026-02-07 13:48:26', '2026-02-07 13:48:26'),
(9, 14, 13, 'commercial,institutional', 'Modern Arch\'s portfolio of contemporary commercial projects aligns perfectly with my expertise. I have successfully completed multiple retail and office spaces, and I am eager to bring my creative approach to your team to help expand your commercial project portfolio.', 'accepted', '2026-02-07 13:48:26', 13, '2026-02-07 13:48:26', '2026-02-07 13:48:26'),
(10, 15, 13, 'residential', 'As a junior architect passionate about modern interior design and smart home technology, I see Modern Arch as the ideal environment to grow my skills. I am dedicated, eager to learn, and ready to contribute fresh perspectives to your residential projects.', 'accepted', '2026-02-07 13:48:26', 13, '2026-02-07 13:48:26', '2026-02-07 13:48:26');

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

--
-- Dumping data for table `architect_education`
--

INSERT INTO `architect_education` (`id`, `architect_id`, `university_name`, `degree`, `field_of_study`, `start_date`, `end_date`, `is_current`, `display_order`, `created_at`, `updated_at`) VALUES
(1, 7, 'USTHB', 'Master', 'Architecture', '2015-09-01', '2020-06-30', 0, 1, '2026-02-07 00:40:33', '2026-02-07 00:40:33'),
(2, 8, 'University of Oran', 'Bachelor', 'Interior Architecture', '2018-09-01', '2022-06-30', 0, 1, '2026-02-07 00:40:33', '2026-02-07 00:40:33'),
(3, 9, 'Constantine University', 'Master', 'Urban Planning', '2012-09-01', '2017-06-30', 0, 1, '2026-02-07 00:40:33', '2026-02-07 00:40:33'),
(4, 10, 'Blida University', 'Master', 'Architecture', '2016-09-01', '2021-06-30', 0, 1, '2026-02-07 00:40:33', '2026-02-07 00:40:33'),
(5, 11, 'Setif University', 'Master', 'Sustainable Architecture', '2014-09-01', '2019-06-30', 0, 1, '2026-02-07 00:40:33', '2026-02-07 00:40:33'),
(6, 12, 'Annaba University', 'Bachelor', 'Architecture', '2021-09-01', NULL, 1, 1, '2026-02-07 00:40:33', '2026-02-07 00:40:33'),
(7, 7, 'Ensia high school', 'PHD', 'AI', '2021-08-01', NULL, 1, 2, '2026-02-07 11:26:37', '2026-02-07 11:26:51');

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

--
-- Dumping data for table `architect_experience`
--

INSERT INTO `architect_experience` (`id`, `architect_id`, `role`, `agency_id`, `agency_name`, `start_date`, `end_date`, `is_current`, `description`, `display_order`, `created_at`, `updated_at`) VALUES
(1, 7, 'Senior Architect', 13, 'Modern Arch', '2021-01-01', NULL, 1, 'Leading residential design projects.', 1, '2026-02-07 00:40:53', '2026-02-07 00:40:53'),
(2, 8, 'Junior Designer', 14, 'Urban Studio', '2023-01-01', NULL, 1, 'Assisting in interior design and 3D modeling.', 1, '2026-02-07 00:40:53', '2026-02-07 00:40:53'),
(3, 9, 'Architect', NULL, 'Freelance', '2017-07-01', '2020-12-31', 0, 'Worked on multiple urban projects.', 1, '2026-02-07 00:40:53', '2026-02-07 00:40:53'),
(4, 9, 'Project Architect', 15, 'DesignPro', '2021-01-01', NULL, 1, 'Managing large-scale housing projects.', 2, '2026-02-07 00:40:53', '2026-02-07 00:40:53'),
(5, 10, 'Architect', 16, 'ArchVision', '2022-01-01', NULL, 1, 'Commercial and retail design specialist.', 1, '2026-02-07 00:40:53', '2026-02-07 00:40:53'),
(6, 11, 'Site Architect', 17, 'BuildArt', '2020-05-01', NULL, 1, 'Supervising construction projects.', 1, '2026-02-07 00:40:53', '2026-02-07 00:40:53'),
(7, 12, 'Architecture Intern', 18, 'SpaceLab', '2024-06-01', NULL, 1, 'Supporting senior architects and preparing drawings.', 1, '2026-02-07 00:40:53', '2026-02-07 00:40:53');

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

--
-- Dumping data for table `architect_portfolio_items`
--

INSERT INTO `architect_portfolio_items` (`id`, `architect_id`, `project_id`, `project_name`, `description`, `project_type`, `style_tags`, `completion_date`, `is_featured`, `created_at`, `updated_at`) VALUES
(1, 7, 1, 'Modern Villa', 'Luxury villa project', 'residential', NULL, NULL, 1, '2026-02-07 00:28:39', '2026-02-07 00:28:39'),
(2, 8, 2, 'Office Design', 'Minimal office interior', 'interior', NULL, NULL, 0, '2026-02-07 00:28:39', '2026-02-07 00:28:39'),
(3, 9, 3, 'Urban Housing', 'City housing complex', 'urban', NULL, NULL, 1, '2026-02-07 00:28:39', '2026-02-07 00:28:39'),
(4, 10, 4, 'Retail Space', 'Modern shop design', 'commercial', NULL, NULL, 0, '2026-02-07 00:28:39', '2026-02-07 00:28:39'),
(5, 11, 5, 'Apartment Block', 'Residential building', 'residential', NULL, NULL, 1, '2026-02-07 00:28:39', '2026-02-07 00:28:39'),
(6, 12, 6, 'Studio Interior', 'Small apartment design', 'interior', NULL, NULL, 0, '2026-02-07 00:28:39', '2026-02-07 00:28:39'),
(7, 13, 7, 'Eco-Friendly Family Home', 'Sustainable residential design', 'residential', 'Sustainable,Modern', NULL, 1, '2026-02-07 13:48:26', '2026-02-07 13:48:26'),
(8, 14, 8, 'Modern Commercial Office', 'Tech startup office space', 'commercial', 'Minimalist,Contemporary', NULL, 1, '2026-02-07 13:48:26', '2026-02-07 13:48:26'),
(9, 15, 9, 'Luxury Penthouse Interior', 'High-end interior design', 'interior', 'Luxury,Smart Home', NULL, 1, '2026-02-07 13:48:26', '2026-02-07 13:48:26');

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

--
-- Dumping data for table `architect_portfolio_photos`
--

INSERT INTO `architect_portfolio_photos` (`id`, `portfolio_item_id`, `photo_path`, `is_primary`, `display_order`, `uploaded_at`) VALUES
(1, 1, 'assets/portfolio/a1.jpg', 1, 0, '2026-02-07 00:28:48'),
(2, 2, 'assets/portfolio/a2.jpg', 1, 0, '2026-02-07 00:28:48'),
(3, 3, 'assets/portfolio/a3.jpg', 1, 0, '2026-02-07 00:28:48'),
(4, 4, 'assets/portfolio/a4.jpg', 1, 0, '2026-02-07 00:28:48'),
(5, 5, 'assets/portfolio/a5.jpg', 1, 0, '2026-02-07 00:28:48'),
(6, 6, 'assets/portfolio/a6.jpg', 1, 0, '2026-02-07 00:28:48'),
(7, 7, 'assets/portfolio/a7.jpg', 1, 0, '2026-02-07 13:48:26'),
(8, 8, 'assets/portfolio/a8.jpg', 1, 0, '2026-02-07 13:48:26'),
(9, 9, 'assets/portfolio/a9.jpg', 1, 0, '2026-02-07 13:48:26');

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
(1, 'Ali', 'Benali'),
(2, 'Sara', 'Khaled'),
(3, 'Yacine', 'Mansouri'),
(4, 'Lina', 'Bouzid'),
(5, 'Omar', 'Saadi'),
(6, 'Nadia', 'Cherif');

-- --------------------------------------------------------

--
-- Table structure for table `password_resets`
--

CREATE TABLE `password_resets` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `code_hash` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `used` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(1, 1, 1, 13, 7, 'Villa Design', NULL, 'in_progress', 40, '2026-01-01', NULL, NULL, 3000000.00, '2026-02-07 00:22:55', '2026-02-07 11:34:10'),
(2, 2, 2, 14, 8, 'Office Interior', NULL, 'planning', 10, '2026-02-01', NULL, NULL, 500000.00, '2026-02-07 00:22:55', '2026-02-07 00:22:55'),
(3, 3, 3, 15, 9, 'House Renovation', NULL, 'review', 70, '2025-12-01', NULL, NULL, 1000000.00, '2026-02-07 00:22:55', '2026-02-07 00:22:55'),
(4, 4, 4, 16, 10, 'Shop Design', NULL, 'completed', 100, '2025-10-01', NULL, NULL, 400000.00, '2026-02-07 00:22:55', '2026-02-07 00:22:55'),
(5, 5, 5, 17, 11, 'Residential Building', NULL, 'in_progress', 30, '2026-01-15', NULL, NULL, 7000000.00, '2026-02-07 00:22:55', '2026-02-07 00:22:55'),
(6, 6, 6, 18, 12, 'Apartment Interior', NULL, 'planning', 5, '2026-02-05', NULL, NULL, 250000.00, '2026-02-07 00:22:55', '2026-02-07 00:22:55'),
(7, 8, 2, 13, 13, 'Eco-Friendly Family Home', 'Sustainable residential construction with modern design and eco-friendly features', 'in_progress', 25, '2026-02-15', '2027-04-15', NULL, 4200000.00, '2026-02-07 13:48:26', '2026-02-07 17:47:26'),
(8, 9, 3, 13, 14, 'Modern Commercial Office', 'Contemporary office space renovation for tech startup with open collaborative areas', 'planning', 5, '2026-03-01', '2026-08-30', NULL, 1500000.00, '2026-02-07 13:48:26', '2026-02-07 13:48:26'),
(9, 10, 5, 13, 15, 'Luxury Penthouse Interior', 'High-end interior design with smart home integration and custom luxury finishes', 'planning', 10, '2026-02-20', '2026-10-20', NULL, 2800000.00, '2026-02-07 13:48:26', '2026-02-07 13:48:26');

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

--
-- Dumping data for table `project_milestones`
--

INSERT INTO `project_milestones` (`id`, `project_id`, `title`, `description`, `due_date`, `due_time`, `is_completed`, `completed_at`, `created_at`, `updated_at`) VALUES
(1, 1, 'Initial Planning', 'Complete design drafts', '2026-02-20', '17:00:00', 0, NULL, '2026-02-07 00:44:48', '2026-02-07 00:44:48'),
(2, 1, 'Construction Start', 'Begin construction', '2026-03-01', '09:00:00', 0, NULL, '2026-02-07 00:44:48', '2026-02-07 00:44:48'),
(3, 2, 'Interior Design Draft', 'Prepare interior layouts', '2026-02-15', '17:00:00', 0, NULL, '2026-02-07 00:44:48', '2026-02-07 00:44:48'),
(4, 2, 'Client Approval', 'Get final approval from client', '2026-02-28', '17:00:00', 0, NULL, '2026-02-07 00:44:48', '2026-02-07 00:44:48'),
(5, 3, 'Renovation Planning', 'Complete renovation plan', '2026-02-10', '17:00:00', 0, NULL, '2026-02-07 00:44:48', '2026-02-07 00:44:48'),
(6, 3, 'Execution', 'Start renovation', '2026-02-20', '09:00:00', 0, NULL, '2026-02-07 00:44:48', '2026-02-07 00:44:48'),
(7, 4, 'Shop Layout', 'Finalize shop layout', '2025-10-15', '17:00:00', 1, NULL, '2026-02-07 00:44:48', '2026-02-07 00:44:48'),
(8, 4, 'Completion', 'Shop ready for opening', '2025-11-01', '09:00:00', 1, NULL, '2026-02-07 00:44:48', '2026-02-07 00:44:48'),
(9, 5, 'Foundation Work', 'Start building foundation', '2026-01-25', '09:00:00', 0, NULL, '2026-02-07 00:44:48', '2026-02-07 00:44:48'),
(10, 5, 'Roofing', 'Complete roofing work', '2026-03-01', '17:00:00', 0, NULL, '2026-02-07 00:44:48', '2026-02-07 00:44:48'),
(11, 6, 'Interior Draft', 'Prepare apartment interior plan', '2026-02-10', '17:00:00', 0, NULL, '2026-02-07 00:44:48', '2026-02-07 00:44:48'),
(12, 6, 'Finalization', 'Finalize interior details', '2026-02-20', '17:00:00', 0, NULL, '2026-02-07 00:44:48', '2026-02-07 00:44:48'),
(13, 7, 'Site Survey & Analysis', 'Complete site survey and environmental analysis', '2026-02-25', '17:00:00', 1, '2026-02-07 13:48:26', '2026-02-07 13:48:26', '2026-02-07 13:48:26'),
(14, 7, 'Design Development', 'Complete architectural and structural designs', '2026-03-15', '17:00:00', 0, NULL, '2026-02-07 13:48:26', '2026-02-07 13:48:26'),
(15, 7, 'Permits & Approvals', 'Obtain all necessary construction permits', '2026-03-30', '17:00:00', 0, NULL, '2026-02-07 13:48:26', '2026-02-07 13:48:26'),
(16, 7, 'Foundation Work', 'Complete foundation and underground utilities', '2026-05-15', '17:00:00', 0, NULL, '2026-02-07 13:48:26', '2026-02-07 13:48:26'),
(17, 8, 'Space Planning', 'Finalize office layout and space allocation', '2026-03-10', '17:00:00', 0, NULL, '2026-02-07 13:48:26', '2026-02-07 13:48:26'),
(18, 8, 'Demolition Work', 'Remove existing partitions and fixtures', '2026-03-20', '17:00:00', 0, NULL, '2026-02-07 13:48:26', '2026-02-07 13:48:26'),
(19, 8, 'MEP Installation', 'Install mechanical, electrical, and plumbing systems', '2026-05-15', '17:00:00', 0, NULL, '2026-02-07 13:48:26', '2026-02-07 13:48:26'),
(20, 8, 'Finishing Works', 'Complete flooring, painting, and fixtures', '2026-07-30', '17:00:00', 0, NULL, '2026-02-07 13:48:26', '2026-02-07 13:48:26'),
(21, 9, 'Design Concept', 'Present and approve interior design concepts', '2026-03-05', '17:00:00', 0, NULL, '2026-02-07 13:48:26', '2026-02-07 13:48:26'),
(22, 9, 'Custom Furniture Design', 'Design and order custom furniture pieces', '2026-04-15', '17:00:00', 0, NULL, '2026-02-07 13:48:26', '2026-02-07 13:48:26'),
(23, 9, 'Smart Home Integration', 'Install and configure smart home systems', '2026-07-20', '17:00:00', 0, NULL, '2026-02-07 13:48:26', '2026-02-07 13:48:26'),
(24, 9, 'Final Installation', 'Install all furniture and final touches', '2026-10-10', '17:00:00', 0, NULL, '2026-02-07 13:48:26', '2026-02-07 13:48:26');

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
(1, 1, 'assets/profile-image/p1.jpg', 1, 0, '2026-02-07 00:22:55'),
(2, 2, 'assets/profile-image/p2.jpg', 1, 0, '2026-02-07 00:22:55'),
(3, 3, 'assets/profile-image/p3.jpg', 1, 0, '2026-02-07 00:22:55'),
(4, 4, 'assets/profile-image/p4.jpg', 1, 0, '2026-02-07 00:22:55'),
(5, 5, 'assets/profile-image/p5.jpg', 1, 0, '2026-02-07 00:22:55'),
(6, 6, 'assets/profile-image/p6.jpg', 1, 0, '2026-02-07 00:22:55'),
(7, 7, 'assets/profile-image/p7.jpg', 1, 0, '2026-02-07 13:48:26'),
(8, 8, 'assets/profile-image/p8.jpg', 1, 0, '2026-02-07 13:48:26'),
(9, 9, 'assets/profile-image/p9.jpg', 1, 0, '2026-02-07 13:48:26');

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
(1, 1, 13, 'Villa Design', 'both', 'construction', 'Algiers', 'accepted', 2000000.00, 4000000.00, NULL, NULL, NULL, '2026-02-07 00:22:55', '2026-02-07 00:22:55'),
(2, 2, 14, 'Office Interior', 'interior', 'design_only', 'Oran', 'accepted', 300000.00, 800000.00, NULL, NULL, NULL, '2026-02-07 00:22:55', '2026-02-07 00:22:55'),
(3, 3, 15, 'House Renovation', 'both', 'renovation', 'Constantine', 'accepted', 500000.00, 1500000.00, NULL, NULL, NULL, '2026-02-07 00:22:55', '2026-02-07 00:22:55'),
(4, 4, 16, 'Shop Design', 'interior', 'design_only', 'Blida', 'accepted', 200000.00, 600000.00, NULL, NULL, NULL, '2026-02-07 00:22:55', '2026-02-07 00:22:55'),
(5, 5, 17, 'Residential Building', 'exterior', 'construction', 'Setif', 'accepted', 5000000.00, 9000000.00, NULL, NULL, NULL, '2026-02-07 00:22:55', '2026-02-07 00:22:55'),
(6, 6, 18, 'Apartment Interior', 'interior', 'design_only', 'Annaba', 'accepted', 150000.00, 400000.00, NULL, NULL, NULL, '2026-02-07 00:22:55', '2026-02-07 00:22:55'),
(7, 1, 17, 'afrah hiba Project', 'exterior', 'construction', 'ddlkdjlejce', 'pending', 56666666.00, 100000000.00, '7', '455gtyehtyu', 'Contact Phone: +213554616592\n\nSpecial Requirements: ihhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh\n\nEnvironmental Considerations: lojpoooooooooooooooo\n\nAdditional Notes: lkp\n\nContact Method: Email', '2026-02-07 11:49:34', '2026-02-07 11:49:34'),
(8, 2, 13, 'Eco-Friendly Family Home', 'both', 'construction', 'Bouzareah, Algiers', 'accepted', 3500000.00, 5000000.00, '14 months', 'Modern Sustainable', 'A family home with eco-friendly materials, solar panels, and rainwater collection system. Focus on natural light and energy efficiency.', '2026-02-07 13:48:26', '2026-02-07 13:48:26'),
(9, 3, 13, 'Modern Commercial Office', 'interior', 'renovation', 'Rouiba, Algiers', 'accepted', 1200000.00, 1800000.00, '6 months', 'Contemporary Minimalist', 'Office space renovation for a tech startup. Open floor plan, collaborative spaces, meeting rooms, and modern amenities.', '2026-02-07 13:48:26', '2026-02-07 13:48:26'),
(10, 5, 13, 'Luxury Penthouse Interior', 'interior', 'design_only', 'Hydra, Algiers', 'accepted', 2000000.00, 3500000.00, '8 months', 'Luxury Modern', 'High-end penthouse interior design with smart home integration, custom furniture, premium materials, and panoramic city views.', '2026-02-07 13:48:26', '2026-02-07 13:48:26'),
(11, 1, 16, 'Ali Benali Project', 'exterior', 'renovation', 'ddlkdjlejce', 'pending', 100000.00, 500000.00, '6 months', 'jin', 'Contact Phone: 0555000001\n\nSpecial Requirements: lini 09iuuh iyu uuhilou\n\nEnvironmental Considerations: oi uijhk\n\nAdditional Notes: kj h8\n\nContact Method: Email', '2026-02-07 17:44:12', '2026-02-07 17:44:12');

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

--
-- Dumping data for table `project_request_exterior_details`
--

INSERT INTO `project_request_exterior_details` (`id`, `request_id`, `property_type`, `number_of_floors`, `area`, `style_preference`, `material_preferences`, `special_requirements`, `created_at`) VALUES
(1, 1, 'residential', 2, 350.00, 'Modern', 'Concrete, Glass', 'Swimming pool', '2026-02-07 00:45:01'),
(2, 3, 'residential', 1, 120.00, 'Contemporary', 'Brick, Wood', 'Eco-friendly materials', '2026-02-07 00:45:01'),
(3, 5, 'residential', 5, 1500.00, 'Modern', 'Concrete, Glass', 'Parking space and garden', '2026-02-07 00:45:01'),
(4, 7, 'residential', 3, 3.00, NULL, NULL, 'ihhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh', '2026-02-07 11:49:34'),
(5, 8, 'residential', 2, 280.00, 'Modern Sustainable', 'Recycled concrete, Wood panels, Large glass windows', 'Solar panels, Rainwater harvesting, Green roof, Garden', '2026-02-07 13:48:26'),
(6, 11, 'residential', 4, 5.00, NULL, NULL, 'lini 09iuuh iyu uuhilou', '2026-02-07 17:44:12');

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

--
-- Dumping data for table `project_request_interior_details`
--

INSERT INTO `project_request_interior_details` (`id`, `request_id`, `interior_location`, `property_type`, `number_of_rooms`, `area`, `style_preference`, `color_scheme`, `material_preferences`, `special_requirements`, `created_at`) VALUES
(1, 1, 'Algiers', 'house', 5, 350.00, 'Modern', 'Neutral tones', 'Wood, Marble', 'Smart home integration', '2026-02-07 00:45:15'),
(2, 2, 'Oran', 'office', 10, 200.00, 'Minimalist', 'White and grey', 'Metal, Glass', 'Ergonomic workstations', '2026-02-07 00:45:15'),
(3, 4, 'Blida', 'commercial', 3, 120.00, 'Contemporary', 'Bright colors', 'Wood, Tile', 'Display shelves', '2026-02-07 00:45:15'),
(4, 6, 'Annaba', 'apartment', 2, 80.00, 'Modern', 'Pastel colors', 'Wood, Paint', 'Space-saving furniture', '2026-02-07 00:45:15'),
(5, 8, 'Bouzareah, Algiers', 'house', 6, 280.00, 'Modern Sustainable', 'Earth tones with natural wood', 'Bamboo, Recycled materials, Stone', 'Energy-efficient appliances, Smart home system', '2026-02-07 13:48:26'),
(6, 9, 'Rouiba, Algiers', 'office', 15, 450.00, 'Contemporary Minimalist', 'White, grey, and blue accents', 'Glass, Metal, Acoustic panels', 'Ergonomic furniture, Video conferencing rooms', '2026-02-07 13:48:26'),
(7, 10, 'Hydra, Algiers', 'apartment', 4, 320.00, 'Luxury Modern', 'Neutral with gold accents', 'Marble, Premium wood, Italian tiles', 'Home automation, Wine cellar, Walk-in closets', '2026-02-07 13:48:26');

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

--
-- Dumping data for table `project_request_photos`
--

INSERT INTO `project_request_photos` (`id`, `request_id`, `photo_path`, `photo_type`, `uploaded_at`) VALUES
(1, 1, 'assets/request-photos/r1.jpg', 'reference', '2026-02-07 00:45:43'),
(2, 2, 'assets/request-photos/r2.jpg', 'reference', '2026-02-07 00:45:43'),
(3, 3, 'assets/request-photos/r3.jpg', 'current_state', '2026-02-07 00:45:43'),
(4, 4, 'assets/request-photos/r4.jpg', 'reference', '2026-02-07 00:45:43'),
(5, 5, 'assets/request-photos/r5.jpg', 'current_state', '2026-02-07 00:45:43'),
(6, 6, 'assets/request-photos/r6.jpg', 'reference', '2026-02-07 00:45:43'),
(7, 8, 'assets/request-photos/r8_ref.jpg', 'reference', '2026-02-07 13:48:26'),
(8, 9, 'assets/request-photos/r9_current.jpg', 'current_state', '2026-02-07 13:48:26'),
(9, 10, 'assets/request-photos/r10_ref.jpg', 'reference', '2026-02-07 13:48:26');

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

--
-- Dumping data for table `review_project`
--

INSERT INTO `review_project` (`id`, `client_id`, `project_id`, `agency_id`, `architect_id`, `rating`, `review_text`, `is_verified`, `is_visible`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 13, 7, 5, 'Perfect execution of my villa.', 1, 1, '2026-02-07 00:29:32', '2026-02-07 00:29:32'),
(2, 2, 2, 14, 8, 4, 'Nice office design.', 1, 1, '2026-02-07 00:29:32', '2026-02-07 00:29:32'),
(3, 3, 3, 15, 9, 5, 'Great renovation work.', 1, 1, '2026-02-07 00:29:32', '2026-02-07 00:29:32'),
(4, 4, 4, 16, 10, 4, 'Good commercial design.', 1, 1, '2026-02-07 00:29:32', '2026-02-07 00:29:32'),
(5, 5, 5, 17, 11, 5, 'Very satisfied.', 1, 1, '2026-02-07 00:29:32', '2026-02-07 00:29:32'),
(6, 6, 6, 18, 12, 4, 'Clean and modern interior.', 1, 1, '2026-02-07 00:29:32', '2026-02-07 00:29:32'),
(7, 1, 1, 13, 7, 5, 'Perfect execution of my villa.', 1, 1, '2026-02-07 00:29:49', '2026-02-07 00:29:49'),
(8, 2, 2, 14, 8, 4, 'Nice office design.', 1, 1, '2026-02-07 00:29:49', '2026-02-07 00:29:49'),
(9, 3, 3, 15, 9, 5, 'Great renovation work.', 1, 1, '2026-02-07 00:29:49', '2026-02-07 00:29:49'),
(10, 4, 4, 16, 10, 4, 'Good commercial design.', 1, 1, '2026-02-07 00:29:49', '2026-02-07 00:29:49'),
(11, 5, 5, 17, 11, 5, 'Very satisfied.', 1, 1, '2026-02-07 00:29:49', '2026-02-07 00:29:49'),
(12, 6, 6, 18, 12, 4, 'Clean and modern interior.', 1, 1, '2026-02-07 00:29:49', '2026-02-07 00:29:49');

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
(1, 'client1@test.com', '$2y$10$5Ojosx.PW37G8V.e4xZ7o.GNeNDk8VMiJRmOncHvdWaz.F1aFdH6a', 'client', '0555000001', 'assets/profile-image/c1.jpg', 1, '2026-02-07 00:21:32', '2026-02-07 18:28:28', '2026-02-07 18:28:28'),
(2, 'client2@test.com', '$2y$10$5Ojosx.PW37G8V.e4xZ7o.GNeNDk8VMiJRmOncHvdWaz.F1aFdH6a', 'client', '0555000002', 'assets/profile-image/c2.jpg', 1, '2026-02-07 00:21:32', '2026-02-07 03:47:27', NULL),
(3, 'client3@test.com', '$2y$10$5Ojosx.PW37G8V.e4xZ7o.GNeNDk8VMiJRmOncHvdWaz.F1aFdH6a', 'client', '0555000003', 'assets/profile-image/c3.jpg', 1, '2026-02-07 00:21:32', '2026-02-07 03:47:27', NULL),
(4, 'client4@test.com', '$2y$10$5Ojosx.PW37G8V.e4xZ7o.GNeNDk8VMiJRmOncHvdWaz.F1aFdH6a', 'client', '0555000004', 'assets/profile-image/c4.jpg', 1, '2026-02-07 00:21:32', '2026-02-07 03:47:27', NULL),
(5, 'client5@test.com', '$2y$10$5Ojosx.PW37G8V.e4xZ7o.GNeNDk8VMiJRmOncHvdWaz.F1aFdH6a', 'client', '0555000005', 'assets/profile-image/c5.jpg', 1, '2026-02-07 00:21:32', '2026-02-07 03:47:27', NULL),
(6, 'client6@test.com', '$2y$10$5Ojosx.PW37G8V.e4xZ7o.GNeNDk8VMiJRmOncHvdWaz.F1aFdH6a', 'client', '0555000006', 'assets/profile-image/c6.jpg', 1, '2026-02-07 00:21:32', '2026-02-07 03:47:27', NULL),
(7, 'arch1@test.com', '$2y$10$5Ojosx.PW37G8V.e4xZ7o.GNeNDk8VMiJRmOncHvdWaz.F1aFdH6a', 'architect', '0666000001', 'assets/uploads/profile_images/ar1.jpg', 1, '2026-02-07 00:21:32', '2026-02-07 12:26:40', '2026-02-07 11:55:34'),
(8, 'arch2@test.com', '$2y$10$5Ojosx.PW37G8V.e4xZ7o.GNeNDk8VMiJRmOncHvdWaz.F1aFdH6a', 'architect', '0666000002', 'assets/uploads/profile_images/ar2.jpg', 1, '2026-02-07 00:21:32', '2026-02-07 12:26:47', NULL),
(9, 'arch3@test.com', '$2y$10$5Ojosx.PW37G8V.e4xZ7o.GNeNDk8VMiJRmOncHvdWaz.F1aFdH6a', 'architect', '0666000003', 'assets/uploads/profile_images/ar3.jpg', 1, '2026-02-07 00:21:32', '2026-02-07 12:26:52', NULL),
(10, 'arch4@test.com', '$2y$10$5Ojosx.PW37G8V.e4xZ7o.GNeNDk8VMiJRmOncHvdWaz.F1aFdH6a', 'architect', '0666000004', 'assets/uploads/profile_images/ar4.jpg', 1, '2026-02-07 00:21:32', '2026-02-07 12:26:56', NULL),
(11, 'arch5@test.com', '$2y$10$5Ojosx.PW37G8V.e4xZ7o.GNeNDk8VMiJRmOncHvdWaz.F1aFdH6a', 'architect', '0666000005', 'assets/uploads/profile_images/ar5.jpg', 1, '2026-02-07 00:21:32', '2026-02-07 12:27:01', NULL),
(12, 'arch6@test.com', '$2y$10$5Ojosx.PW37G8V.e4xZ7o.GNeNDk8VMiJRmOncHvdWaz.F1aFdH6a', 'architect', '0666000006', 'assets/uploads/profile_images/ar6.jpg', 1, '2026-02-07 00:21:32', '2026-02-07 12:27:06', NULL),
(13, 'agency1@test.com', '$2y$10$5Ojosx.PW37G8V.e4xZ7o.GNeNDk8VMiJRmOncHvdWaz.F1aFdH6a', 'agency', '0777000001', 'assets/uploads/profile_images/a1.jpg', 1, '2026-02-07 00:21:32', '2026-02-07 17:49:18', '2026-02-07 17:46:47'),
(14, 'agency2@test.com', '$2y$10$5Ojosx.PW37G8V.e4xZ7o.GNeNDk8VMiJRmOncHvdWaz.F1aFdH6a', 'agency', '0777000002', 'assets/uploads/profile_images/a2.jpg', 1, '2026-02-07 00:21:32', '2026-02-07 12:19:09', NULL),
(15, 'agency3@test.com', '$2y$10$5Ojosx.PW37G8V.e4xZ7o.GNeNDk8VMiJRmOncHvdWaz.F1aFdH6a', 'agency', '0777000003', 'assets/uploads/profile_images/a3.jpg', 1, '2026-02-07 00:21:32', '2026-02-07 12:19:16', NULL),
(16, 'agency4@test.com', '$2y$10$5Ojosx.PW37G8V.e4xZ7o.GNeNDk8VMiJRmOncHvdWaz.F1aFdH6a', 'agency', '0777000004', 'assets/uploads/profile_images/a4.jpg', 1, '2026-02-07 00:21:32', '2026-02-07 12:19:23', NULL),
(17, 'agency5@test.com', '$2y$10$5Ojosx.PW37G8V.e4xZ7o.GNeNDk8VMiJRmOncHvdWaz.F1aFdH6a', 'agency', '0777000005', 'assets/uploads/profile_images/a5.jpg', 1, '2026-02-07 00:21:32', '2026-02-07 12:20:01', '2026-02-07 11:52:05'),
(18, 'agency6@test.com', '$2y$10$5Ojosx.PW37G8V.e4xZ7o.GNeNDk8VMiJRmOncHvdWaz.F1aFdH6a', 'agency', '0777000006', 'assets/uploads/profile_images/a6.jpg', 1, '2026-02-07 00:21:32', '2026-02-07 12:20:09', NULL),
(19, 'arch7@test.com', '$2y$10$5Ojosx.PW37G8V.e4xZ7o.GNeNDk8VMiJRmOncHvdWaz.F1aFdH6a', 'architect', '0666000007', 'assets/uploads/profile_images/ar7.jpg', 1, '2026-02-07 13:48:26', '2026-02-07 13:48:26', NULL),
(20, 'arch8@test.com', '$2y$10$5Ojosx.PW37G8V.e4xZ7o.GNeNDk8VMiJRmOncHvdWaz.F1aFdH6a', 'architect', '0666000008', 'assets/uploads/profile_images/ar8.jpg', 1, '2026-02-07 13:48:26', '2026-02-07 13:48:26', NULL),
(21, 'arch9@test.com', '$2y$10$5Ojosx.PW37G8V.e4xZ7o.GNeNDk8VMiJRmOncHvdWaz.F1aFdH6a', 'architect', '0666000009', 'assets/uploads/profile_images/ar9.jpg', 1, '2026-02-07 13:48:26', '2026-02-07 13:48:26', NULL);

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
-- Indexes for table `password_resets`
--
ALTER TABLE `password_resets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_email` (`email`);

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
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `agency_portfolio_photos`
--
ALTER TABLE `agency_portfolio_photos`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `agency_team_members`
--
ALTER TABLE `agency_team_members`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `architect_applications`
--
ALTER TABLE `architect_applications`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `architect_education`
--
ALTER TABLE `architect_education`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `architect_experience`
--
ALTER TABLE `architect_experience`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `architect_portfolio_items`
--
ALTER TABLE `architect_portfolio_items`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `architect_portfolio_photos`
--
ALTER TABLE `architect_portfolio_photos`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `password_resets`
--
ALTER TABLE `password_resets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `projects`
--
ALTER TABLE `projects`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `project_milestones`
--
ALTER TABLE `project_milestones`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `project_photos`
--
ALTER TABLE `project_photos`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `project_requests`
--
ALTER TABLE `project_requests`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `project_request_exterior_details`
--
ALTER TABLE `project_request_exterior_details`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `project_request_interior_details`
--
ALTER TABLE `project_request_interior_details`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `project_request_photos`
--
ALTER TABLE `project_request_photos`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `review_agency`
--
ALTER TABLE `review_agency`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `review_project`
--
ALTER TABLE `review_project`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

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
