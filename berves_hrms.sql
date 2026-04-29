-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 25, 2026 at 12:26 AM
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
-- Database: `berves_hrms`
--

-- --------------------------------------------------------

--
-- Table structure for table `applicants`
--

CREATE TABLE `applicants` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `job_posting_id` bigint(20) UNSIGNED NOT NULL,
  `full_name` varchar(200) NOT NULL,
  `email` varchar(191) NOT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `cv_path` varchar(500) DEFAULT NULL,
  `cover_letter` text DEFAULT NULL,
  `status` enum('applied','shortlisted','interviewed','offered','rejected','hired') NOT NULL DEFAULT 'applied',
  `applied_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `appraisal_cycles`
--

CREATE TABLE `appraisal_cycles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(200) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` enum('upcoming','active','completed') NOT NULL DEFAULT 'upcoming',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `appraisal_kpi_scores`
--

CREATE TABLE `appraisal_kpi_scores` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `appraisal_id` bigint(20) UNSIGNED NOT NULL,
  `kpi_id` bigint(20) UNSIGNED NOT NULL,
  `target_value` decimal(10,2) NOT NULL,
  `actual_value` decimal(10,2) DEFAULT NULL,
  `score` decimal(5,2) DEFAULT NULL,
  `comments` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `attendance_records`
--

CREATE TABLE `attendance_records` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `employee_id` bigint(20) UNSIGNED NOT NULL,
  `site_id` bigint(20) UNSIGNED DEFAULT NULL,
  `shift_schedule_id` bigint(20) UNSIGNED DEFAULT NULL,
  `check_in_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `check_out_at` timestamp NULL DEFAULT NULL,
  `is_late` tinyint(1) NOT NULL DEFAULT 0,
  `check_in_lat` decimal(10,7) DEFAULT NULL,
  `check_in_lng` decimal(10,7) DEFAULT NULL,
  `check_out_lat` decimal(10,7) DEFAULT NULL,
  `check_out_lng` decimal(10,7) DEFAULT NULL,
  `is_within_geofence` tinyint(1) NOT NULL DEFAULT 0,
  `method` enum('mobile','web','biometric','manual') NOT NULL,
  `total_hours` decimal(5,2) DEFAULT NULL,
  `late_minutes` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `status` enum('present','late','absent','half_day') NOT NULL DEFAULT 'present',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `attendance_records`
--

INSERT INTO `attendance_records` (`id`, `employee_id`, `site_id`, `shift_schedule_id`, `check_in_at`, `check_out_at`, `is_late`, `check_in_lat`, `check_in_lng`, `check_out_lat`, `check_out_lng`, `is_within_geofence`, `method`, `total_hours`, `late_minutes`, `status`, `notes`, `created_at`, `updated_at`) VALUES
(1, 1, 1, NULL, '2026-04-21 05:36:58', '2026-04-21 05:36:58', 0, 6.6816000, -1.6221000, NULL, NULL, 0, 'web', -4.33, 0, 'present', NULL, '2026-04-21 01:17:10', '2026-04-21 05:36:58'),
(2, 1, 1, NULL, '2026-04-22 21:58:49', '2026-04-22 21:58:49', 0, 5.5545000, -0.1902000, NULL, NULL, 0, 'web', -21.31, 0, 'present', NULL, '2026-04-22 00:40:29', '2026-04-22 21:58:49'),
(3, 1, 1, NULL, '2026-04-22 21:59:19', NULL, 0, 5.6500000, -0.2500000, NULL, NULL, 0, 'web', NULL, 0, 'present', NULL, '2026-04-22 21:59:19', '2026-04-22 21:59:19');

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `model_type` varchar(150) DEFAULT NULL,
  `model_id` bigint(20) UNSIGNED DEFAULT NULL,
  `old_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_values`)),
  `new_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_values`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `model_type`, `model_id`, `old_values`, `new_values`, `ip_address`, `user_agent`, `created_at`) VALUES
(1, NULL, 'auth.login', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-21 01:09:23'),
(2, 1, 'auth.logout', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-21 01:10:42'),
(3, NULL, 'auth.login', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-21 01:11:14'),
(4, 2, 'auth.logout', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-21 01:12:08'),
(5, NULL, 'auth.login', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-21 01:12:19'),
(6, 3, 'auth.logout', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-21 01:13:57'),
(7, NULL, 'auth.login', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-21 01:14:05'),
(8, 4, 'auth.logout', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-21 01:15:49'),
(9, NULL, 'auth.login', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-21 01:15:59'),
(10, 1, 'leave.reviewed', 'App\\Models\\LeaveRequest', 1, '{\"id\":1,\"employee_id\":3,\"leave_type_id\":1,\"start_date\":\"2026-04-23T00:00:00.000000Z\",\"end_date\":\"2026-04-25T00:00:00.000000Z\",\"days_requested\":\"2.0\",\"reason\":null,\"status\":\"pending\",\"reviewed_by\":null,\"reviewed_at\":null,\"review_comment\":null,\"has_schedule_conflict\":false,\"created_at\":\"2026-04-21T01:13:27.000000Z\",\"updated_at\":\"2026-04-21T01:13:27.000000Z\"}', '{\"id\":1,\"employee_id\":3,\"leave_type_id\":1,\"start_date\":\"2026-04-23T00:00:00.000000Z\",\"end_date\":\"2026-04-25T00:00:00.000000Z\",\"days_requested\":\"2.0\",\"reason\":null,\"status\":\"approved\",\"reviewed_by\":1,\"reviewed_at\":\"2026-04-21T01:16:51.000000Z\",\"review_comment\":null,\"has_schedule_conflict\":false,\"created_at\":\"2026-04-21T01:13:27.000000Z\",\"updated_at\":\"2026-04-21T01:16:51.000000Z\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-21 01:16:51'),
(11, 1, 'attendance.check_in', 'App\\Models\\AttendanceRecord', 1, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-21 01:17:10'),
(12, 1, 'attendance.check_out', 'App\\Models\\AttendanceRecord', 1, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-21 05:36:58'),
(13, NULL, 'auth.login', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-21 06:06:36'),
(14, NULL, 'auth.login', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-21 07:43:01'),
(15, 1, 'auth.logout', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-21 08:14:09'),
(16, NULL, 'auth.login', NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-21 08:15:15'),
(17, 1, 'attendance.check_in', 'App\\Models\\AttendanceRecord', 2, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-22 00:40:29'),
(18, 1, 'attendance.check_out', 'App\\Models\\AttendanceRecord', 2, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-22 21:58:49'),
(19, 1, 'attendance.check_in', 'App\\Models\\AttendanceRecord', 3, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-22 21:59:19');

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cache`
--

INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES
('berves-hrms-cache-f1f70ec40aaa556905d4a030501c0ba4', 'i:1;', 1776942573),
('berves-hrms-cache-f1f70ec40aaa556905d4a030501c0ba4:timer', 'i:1776942573;', 1776942573);

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `certification_reminders`
--

CREATE TABLE `certification_reminders` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `enrollment_id` bigint(20) UNSIGNED NOT NULL,
  `reminder_type` enum('30_days','14_days','7_days','expired') NOT NULL,
  `sent_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `channel` enum('email','sms') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(200) NOT NULL,
  `manager_id` bigint(20) UNSIGNED DEFAULT NULL,
  `site_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`id`, `name`, `manager_id`, `site_id`, `created_at`, `updated_at`) VALUES
(1, 'Human Resources', NULL, NULL, '2026-04-21 01:08:51', '2026-04-21 01:08:51'),
(2, 'Engineering', NULL, NULL, '2026-04-21 01:08:51', '2026-04-21 01:08:51'),
(3, 'Operations', NULL, NULL, '2026-04-21 01:08:51', '2026-04-21 01:08:51'),
(4, 'Finance', NULL, NULL, '2026-04-21 01:08:51', '2026-04-21 01:08:51'),
(5, 'Health & Safety', NULL, NULL, '2026-04-21 01:08:51', '2026-04-21 01:08:51'),
(6, 'Information Technology', NULL, NULL, '2026-04-21 01:08:51', '2026-04-21 01:08:51'),
(7, 'Administration', NULL, NULL, '2026-04-21 01:08:51', '2026-04-21 01:08:51');

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `employee_number` varchar(50) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `other_names` varchar(100) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('male','female','other') DEFAULT NULL,
  `national_id` varchar(50) DEFAULT NULL,
  `tin_number` varchar(50) DEFAULT NULL,
  `ssnit_number` varchar(50) DEFAULT NULL,
  `phone` varchar(30) NOT NULL,
  `email` varchar(191) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `emergency_contact_name` varchar(200) DEFAULT NULL,
  `emergency_contact_phone` varchar(30) DEFAULT NULL,
  `department_id` bigint(20) UNSIGNED NOT NULL,
  `job_title_id` bigint(20) UNSIGNED NOT NULL,
  `site_id` bigint(20) UNSIGNED NOT NULL,
  `manager_id` bigint(20) UNSIGNED DEFAULT NULL,
  `employment_type` enum('permanent','contract','site_based') NOT NULL,
  `employment_status` enum('active','on_leave','terminated','suspended') NOT NULL DEFAULT 'active',
  `hire_date` date NOT NULL,
  `contract_end_date` date DEFAULT NULL,
  `probation_end_date` date DEFAULT NULL,
  `base_salary` decimal(15,2) NOT NULL,
  `bank_name` varchar(200) DEFAULT NULL,
  `bank_account` varchar(100) DEFAULT NULL,
  `bank_branch` varchar(200) DEFAULT NULL,
  `profile_photo` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`id`, `employee_number`, `first_name`, `last_name`, `other_names`, `date_of_birth`, `gender`, `national_id`, `tin_number`, `ssnit_number`, `phone`, `email`, `address`, `emergency_contact_name`, `emergency_contact_phone`, `department_id`, `job_title_id`, `site_id`, `manager_id`, `employment_type`, `employment_status`, `hire_date`, `contract_end_date`, `probation_end_date`, `base_salary`, `bank_name`, `bank_account`, `bank_branch`, `profile_photo`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'BEL-0001', 'System', 'Administrator', NULL, NULL, 'male', NULL, NULL, NULL, '+233200000001', 'admin@berves.com', NULL, NULL, NULL, 1, 1, 1, NULL, 'permanent', 'active', '2020-01-01', NULL, NULL, 8000.00, NULL, NULL, NULL, NULL, '2026-04-21 01:08:51', '2026-04-21 01:08:51', NULL),
(2, 'BEL-0002', 'Abena', 'Mensah', NULL, NULL, 'female', NULL, NULL, NULL, '+233200000002', 'hr@berves.com', NULL, NULL, NULL, 1, 1, 1, NULL, 'permanent', 'active', '2021-03-01', NULL, NULL, 5500.00, NULL, NULL, NULL, NULL, '2026-04-21 01:08:52', '2026-04-21 01:08:52', NULL),
(3, 'BEL-0003', 'Kofi', 'Asante', NULL, NULL, 'male', NULL, NULL, NULL, '+233200000003', 'payroll@berves.com', NULL, NULL, NULL, 4, 7, 1, NULL, 'permanent', 'active', '2022-06-01', NULL, NULL, 4800.00, NULL, NULL, NULL, NULL, '2026-04-21 01:08:52', '2026-04-21 01:08:52', NULL),
(4, 'BEL-0004', 'Kwame', 'Boateng', NULL, NULL, 'male', NULL, NULL, NULL, '+233200000004', 'employee@berves.com', NULL, NULL, NULL, 2, 3, 2, NULL, 'permanent', 'active', '2023-01-15', NULL, NULL, 6200.00, NULL, NULL, NULL, NULL, '2026-04-21 01:08:52', '2026-04-21 01:08:52', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `employee_allowances`
--

CREATE TABLE `employee_allowances` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `employee_id` bigint(20) UNSIGNED NOT NULL,
  `allowance_type` varchar(150) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `is_taxable` tinyint(1) NOT NULL DEFAULT 0,
  `effective_from` date NOT NULL,
  `effective_to` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `employee_appraisals`
--

CREATE TABLE `employee_appraisals` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `employee_id` bigint(20) UNSIGNED NOT NULL,
  `appraiser_id` bigint(20) UNSIGNED NOT NULL,
  `appraisal_cycle_id` bigint(20) UNSIGNED NOT NULL,
  `overall_score` decimal(5,2) DEFAULT NULL,
  `status` enum('draft','submitted','reviewed','finalised') NOT NULL DEFAULT 'draft',
  `employee_comment` text DEFAULT NULL,
  `appraiser_comment` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `employee_documents`
--

CREATE TABLE `employee_documents` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `employee_id` bigint(20) UNSIGNED NOT NULL,
  `document_type` varchar(150) NOT NULL,
  `document_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `issue_date` date DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `is_verified` tinyint(1) NOT NULL DEFAULT 0,
  `uploaded_by` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `employee_loans`
--

CREATE TABLE `employee_loans` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `employee_id` bigint(20) UNSIGNED NOT NULL,
  `principal` decimal(15,2) NOT NULL,
  `interest_rate` decimal(5,2) DEFAULT NULL,
  `monthly_deduction` decimal(12,2) NOT NULL,
  `balance_remaining` decimal(15,2) NOT NULL,
  `disbursed_on` date NOT NULL,
  `status` enum('active','settled','defaulted') NOT NULL DEFAULT 'active',
  `approved_by` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `employee_onboardings`
--

CREATE TABLE `employee_onboardings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `employee_id` bigint(20) UNSIGNED NOT NULL,
  `checklist_id` bigint(20) UNSIGNED NOT NULL,
  `status` enum('pending','completed','skipped') NOT NULL DEFAULT 'pending',
  `completed_at` timestamp NULL DEFAULT NULL,
  `safety_induction_done` tinyint(1) NOT NULL DEFAULT 0,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `incident_attachments`
--

CREATE TABLE `incident_attachments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `incident_id` bigint(20) UNSIGNED NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_type` varchar(50) NOT NULL,
  `uploaded_by` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `incident_reports`
--

CREATE TABLE `incident_reports` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `reported_by` bigint(20) UNSIGNED NOT NULL,
  `site_id` bigint(20) UNSIGNED NOT NULL,
  `incident_date` date NOT NULL,
  `incident_time` time DEFAULT NULL,
  `type` enum('near_miss','first_aid','medical_treatment','lost_time','fatality','property_damage') NOT NULL,
  `severity` enum('low','medium','high','critical') NOT NULL,
  `description` text NOT NULL,
  `injured_employee_id` bigint(20) UNSIGNED DEFAULT NULL,
  `injury_description` text DEFAULT NULL,
  `root_cause` text DEFAULT NULL,
  `corrective_actions` text DEFAULT NULL,
  `status` enum('reported','under_investigation','resolved','closed') NOT NULL DEFAULT 'reported',
  `investigated_by` bigint(20) UNSIGNED DEFAULT NULL,
  `closed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `interview_evaluations`
--

CREATE TABLE `interview_evaluations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `interview_schedule_id` bigint(20) UNSIGNED NOT NULL,
  `interviewer_id` bigint(20) UNSIGNED NOT NULL,
  `score` tinyint(3) UNSIGNED NOT NULL,
  `recommendation` enum('hire','reject','hold') NOT NULL,
  `comments` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `interview_schedules`
--

CREATE TABLE `interview_schedules` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `applicant_id` bigint(20) UNSIGNED NOT NULL,
  `scheduled_at` datetime NOT NULL,
  `location` varchar(300) DEFAULT NULL,
  `interview_type` enum('phone','in_person','panel','technical') NOT NULL,
  `interviewers` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`interviewers`)),
  `status` enum('scheduled','completed','cancelled','no_show') NOT NULL DEFAULT 'scheduled',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_postings`
--

CREATE TABLE `job_postings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `job_title_id` bigint(20) UNSIGNED NOT NULL,
  `department_id` bigint(20) UNSIGNED NOT NULL,
  `site_id` bigint(20) UNSIGNED DEFAULT NULL,
  `description` text NOT NULL,
  `requirements` text DEFAULT NULL,
  `employment_type` enum('permanent','contract','site_based') NOT NULL,
  `salary_min` decimal(15,2) DEFAULT NULL,
  `salary_max` decimal(15,2) DEFAULT NULL,
  `deadline` date NOT NULL,
  `status` enum('draft','open','closed','filled') NOT NULL DEFAULT 'draft',
  `posted_by` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_titles`
--

CREATE TABLE `job_titles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(200) NOT NULL,
  `grade` varchar(50) DEFAULT NULL,
  `department_id` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `job_titles`
--

INSERT INTO `job_titles` (`id`, `title`, `grade`, `department_id`) VALUES
(1, 'HR Manager', 'M3', NULL),
(2, 'HR Officer', 'S2', NULL),
(3, 'Senior Engineer', 'S4', NULL),
(4, 'Junior Engineer', 'S2', NULL),
(5, 'Site Supervisor', 'S3', NULL),
(6, 'Safety Officer', 'S2', NULL),
(7, 'Payroll Officer', 'S2', NULL),
(8, 'IT Administrator', 'S2', NULL),
(9, 'General Manager', 'M5', NULL),
(10, 'Finance Manager', 'M3', NULL),
(11, 'Operations Manager', 'M4', NULL),
(12, 'Machine Operator', 'T1', NULL),
(13, 'Driller', 'T2', NULL),
(14, 'Blaster', 'T3', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `kpi_definitions`
--

CREATE TABLE `kpi_definitions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `measurement_unit` varchar(100) NOT NULL,
  `department_id` bigint(20) UNSIGNED DEFAULT NULL,
  `weight` decimal(5,2) NOT NULL DEFAULT 10.00,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `leave_entitlements`
--

CREATE TABLE `leave_entitlements` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `employee_id` bigint(20) UNSIGNED NOT NULL,
  `leave_type_id` bigint(20) UNSIGNED NOT NULL,
  `year` year(4) NOT NULL,
  `entitled_days` decimal(5,1) NOT NULL,
  `used_days` decimal(5,1) NOT NULL DEFAULT 0.0,
  `carried_over` decimal(5,1) NOT NULL DEFAULT 0.0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `leave_policies`
--

CREATE TABLE `leave_policies` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `leave_type_id` bigint(20) UNSIGNED NOT NULL,
  `max_consecutive_days` int(10) UNSIGNED DEFAULT NULL,
  `min_service_months` int(10) UNSIGNED DEFAULT NULL,
  `allow_half_day` tinyint(1) NOT NULL DEFAULT 0,
  `effective_from` date NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `leave_requests`
--

CREATE TABLE `leave_requests` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `employee_id` bigint(20) UNSIGNED NOT NULL,
  `leave_type_id` bigint(20) UNSIGNED NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `days_requested` decimal(5,1) NOT NULL,
  `reason` text DEFAULT NULL,
  `status` enum('pending','approved','rejected','cancelled') NOT NULL DEFAULT 'pending',
  `reviewed_by` bigint(20) UNSIGNED DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `review_comment` text DEFAULT NULL,
  `has_schedule_conflict` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `leave_requests`
--

INSERT INTO `leave_requests` (`id`, `employee_id`, `leave_type_id`, `start_date`, `end_date`, `days_requested`, `reason`, `status`, `reviewed_by`, `reviewed_at`, `review_comment`, `has_schedule_conflict`, `created_at`, `updated_at`) VALUES
(1, 3, 1, '2026-04-23', '2026-04-25', 2.0, NULL, 'approved', 1, '2026-04-21 01:16:51', NULL, 0, '2026-04-21 01:13:27', '2026-04-21 01:16:51'),
(2, 1, 1, '2026-04-22', '2026-05-09', 13.0, 'SWSWS', 'pending', NULL, NULL, NULL, 0, '2026-04-21 05:40:45', '2026-04-21 05:40:45');

-- --------------------------------------------------------

--
-- Table structure for table `leave_types`
--

CREATE TABLE `leave_types` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(150) NOT NULL,
  `days_per_year` int(10) UNSIGNED NOT NULL,
  `is_paid` tinyint(1) NOT NULL DEFAULT 1,
  `requires_approval` tinyint(1) NOT NULL DEFAULT 1,
  `carry_over_days` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `notice_days` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `leave_types`
--

INSERT INTO `leave_types` (`id`, `name`, `days_per_year`, `is_paid`, `requires_approval`, `carry_over_days`, `notice_days`, `created_at`, `updated_at`) VALUES
(1, 'Annual Leave', 21, 1, 1, 5, 7, '2026-04-21 01:08:51', '2026-04-21 01:08:51'),
(2, 'Sick Leave', 14, 1, 0, 0, 0, '2026-04-21 01:08:51', '2026-04-21 01:08:51'),
(3, 'Maternity Leave', 84, 1, 1, 0, 30, '2026-04-21 01:08:51', '2026-04-21 01:08:51'),
(4, 'Paternity Leave', 5, 1, 1, 0, 7, '2026-04-21 01:08:51', '2026-04-21 01:08:51'),
(5, 'Compassionate Leave', 3, 1, 1, 0, 0, '2026-04-21 01:08:51', '2026-04-21 01:08:51'),
(6, 'Study Leave', 10, 0, 1, 0, 14, '2026-04-21 01:08:51', '2026-04-21 01:08:51');

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '2024_01_01_000001_create_sites_table', 1),
(2, '2024_01_01_000002_create_departments_table', 1),
(3, '2024_01_01_000003_create_job_titles_table', 1),
(4, '2024_01_01_000004_create_employees_table', 1),
(5, '2024_01_01_000005_create_users_table', 1),
(6, '2024_01_01_000006_create_employee_documents_table', 1),
(7, '2024_01_01_000007_create_employee_allowances_table', 1),
(8, '2024_01_01_000008_create_payroll_tables', 1),
(9, '2024_01_01_000009_create_attendance_tables', 1),
(10, '2024_01_01_000010_create_leave_tables', 1),
(11, '2024_01_01_000011_create_recruitment_tables', 1),
(12, '2024_01_01_000012_create_training_tables', 1),
(13, '2024_01_01_000013_create_performance_tables', 1),
(14, '2024_01_01_000014_create_safety_tables', 1),
(15, '2024_01_01_000015_create_settings_tables', 1),
(16, '2026_04_19_165000_create_personal_access_tokens_table', 1),
(17, '2026_04_19_175309_create_permission_tables', 2),
(18, '2026_04_21_005036_create_cache_table', 2),
(19, '2026_04_22_002837_create_notifications_table', 3),
(20, '2026_04_22_004633_add_is_late_to_attendance_records_table', 4),
(21, '2026_04_22_120000_refactor_off_day_requests_table', 5),
(22, '2026_04_22_200000_add_active_hours_to_overtime_policies_table', 6);

-- --------------------------------------------------------

--
-- Table structure for table `model_has_permissions`
--

CREATE TABLE `model_has_permissions` (
  `permission_id` bigint(20) UNSIGNED NOT NULL,
  `model_type` varchar(255) NOT NULL,
  `model_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `model_has_roles`
--

CREATE TABLE `model_has_roles` (
  `role_id` bigint(20) UNSIGNED NOT NULL,
  `model_type` varchar(255) NOT NULL,
  `model_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `type` varchar(255) NOT NULL,
  `channel` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `body` text NOT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `off_day_requests`
--

CREATE TABLE `off_day_requests` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `employee_id` bigint(20) UNSIGNED NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `days_count` smallint(5) UNSIGNED NOT NULL DEFAULT 1,
  `reason` text DEFAULT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `reviewed_by` bigint(20) UNSIGNED DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `has_schedule_conflict` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `off_day_requests`
--

INSERT INTO `off_day_requests` (`id`, `employee_id`, `start_date`, `end_date`, `days_count`, `reason`, `status`, `reviewed_by`, `reviewed_at`, `has_schedule_conflict`, `created_at`, `updated_at`) VALUES
(1, 1, '2026-04-24', '2026-04-24', 1, NULL, 'pending', NULL, NULL, 0, '2026-04-22 20:37:15', '2026-04-22 20:37:15'),
(2, 1, '2026-04-25', '2026-04-25', 1, NULL, 'pending', NULL, NULL, 0, '2026-04-22 20:37:15', '2026-04-22 20:37:15'),
(3, 1, '2026-04-26', '2026-04-26', 1, NULL, 'pending', NULL, NULL, 0, '2026-04-22 20:37:15', '2026-04-22 20:37:15'),
(4, 1, '2026-04-27', '2026-04-27', 1, NULL, 'pending', NULL, NULL, 0, '2026-04-22 20:37:15', '2026-04-22 20:37:15'),
(5, 1, '2026-04-28', '2026-04-28', 1, NULL, 'pending', NULL, NULL, 0, '2026-04-22 20:37:15', '2026-04-22 20:37:15'),
(6, 1, '2026-04-25', '2026-04-25', 1, 'hjoewhrfhonfgnwogno', 'approved', 1, '2026-04-22 21:31:31', 0, '2026-04-22 20:38:29', '2026-04-22 21:31:31'),
(7, 1, '2026-04-26', '2026-04-26', 1, 'hjoewhrfhonfgnwogno', 'pending', NULL, NULL, 0, '2026-04-22 20:38:29', '2026-04-22 20:38:29'),
(8, 1, '2026-04-27', '2026-04-27', 1, 'hjoewhrfhonfgnwogno', 'pending', NULL, NULL, 0, '2026-04-22 20:38:29', '2026-04-22 20:38:29');

-- --------------------------------------------------------

--
-- Table structure for table `onboarding_checklists`
--

CREATE TABLE `onboarding_checklists` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `category` varchar(100) NOT NULL,
  `is_mandatory` tinyint(1) NOT NULL DEFAULT 1,
  `due_days_after_hire` int(10) UNSIGNED NOT NULL DEFAULT 3
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `onboarding_checklists`
--

INSERT INTO `onboarding_checklists` (`id`, `name`, `category`, `is_mandatory`, `due_days_after_hire`) VALUES
(1, 'Sign Employment Contract', 'HR', 1, 1),
(2, 'Complete Personal Data Form', 'HR', 1, 1),
(3, 'Safety Induction Training', 'Safety', 1, 1),
(4, 'Worksite Orientation', 'Safety', 1, 2),
(5, 'IT Equipment Setup', 'IT', 0, 2),
(6, 'System Access & Login', 'IT', 1, 3),
(7, 'Bank Account Details Submission', 'HR', 1, 3),
(8, 'SSNIT Registration Verification', 'HR', 1, 5),
(9, 'Meet Your Team', 'Admin', 0, 3),
(10, 'Review Company Policies', 'HR', 1, 5);

-- --------------------------------------------------------

--
-- Table structure for table `overtime_policies`
--

CREATE TABLE `overtime_policies` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `day_type` enum('weekday','sunday','public_holiday') NOT NULL,
  `multiplier` decimal(4,2) NOT NULL DEFAULT 1.50,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `min_hours` decimal(4,1) NOT NULL DEFAULT 1.0,
  `max_hours` decimal(4,1) NOT NULL DEFAULT 12.0,
  `effective_from` date DEFAULT NULL,
  `updated_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `overtime_policies`
--

INSERT INTO `overtime_policies` (`id`, `day_type`, `multiplier`, `is_active`, `min_hours`, `max_hours`, `effective_from`, `updated_by`, `created_at`, `updated_at`) VALUES
(1, 'weekday', 1.50, 1, 1.0, 12.0, '2024-01-01', 1, '2026-04-21 01:08:51', '2026-04-23 05:45:50'),
(2, 'sunday', 2.00, 1, 1.0, 12.0, '2024-01-01', NULL, '2026-04-21 01:08:51', '2026-04-21 01:08:51'),
(3, 'public_holiday', 2.00, 1, 1.0, 12.0, '2024-01-01', NULL, '2026-04-21 01:08:51', '2026-04-21 01:08:51');

-- --------------------------------------------------------

--
-- Table structure for table `overtime_records`
--

CREATE TABLE `overtime_records` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `employee_id` bigint(20) UNSIGNED NOT NULL,
  `date` date NOT NULL,
  `day_type` enum('weekday','sunday','public_holiday') NOT NULL,
  `hours` decimal(5,2) NOT NULL,
  `rate_multiplier` decimal(4,2) NOT NULL,
  `hourly_rate` decimal(10,2) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `approved_by` bigint(20) UNSIGNED NOT NULL,
  `payroll_run_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payroll_allowance_lines`
--

CREATE TABLE `payroll_allowance_lines` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `payroll_run_id` bigint(20) UNSIGNED NOT NULL,
  `allowance_type` varchar(150) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `is_taxable` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payroll_periods`
--

CREATE TABLE `payroll_periods` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `period_name` varchar(100) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` enum('open','processing','approved','paid','closed') NOT NULL DEFAULT 'open',
  `processed_by` bigint(20) UNSIGNED DEFAULT NULL,
  `approved_by` bigint(20) UNSIGNED DEFAULT NULL,
  `processed_at` timestamp NULL DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payroll_runs`
--

CREATE TABLE `payroll_runs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `payroll_period_id` bigint(20) UNSIGNED NOT NULL,
  `employee_id` bigint(20) UNSIGNED NOT NULL,
  `basic_salary` decimal(15,2) NOT NULL,
  `total_allowances` decimal(15,2) NOT NULL DEFAULT 0.00,
  `overtime_pay` decimal(15,2) NOT NULL DEFAULT 0.00,
  `gross_pay` decimal(15,2) NOT NULL,
  `tax_deduction` decimal(15,2) NOT NULL DEFAULT 0.00,
  `ssnit_employee` decimal(15,2) NOT NULL DEFAULT 0.00,
  `ssnit_employer` decimal(15,2) NOT NULL DEFAULT 0.00,
  `loan_deduction` decimal(15,2) NOT NULL DEFAULT 0.00,
  `other_deductions` decimal(15,2) NOT NULL DEFAULT 0.00,
  `total_deductions` decimal(15,2) NOT NULL,
  `net_pay` decimal(15,2) NOT NULL,
  `payment_status` enum('pending','paid','failed') NOT NULL DEFAULT 'pending',
  `payment_date` date DEFAULT NULL,
  `payslip_path` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `guard_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(5, 'App\\Models\\User', 1, 'hrms-token', '855e6389c53b88c9b97b9052224e850ef8258610aa69948b30390e16c9788ffe', '[\"*\"]', '2026-04-21 06:04:57', NULL, '2026-04-21 01:15:58', '2026-04-21 06:04:57'),
(6, 'App\\Models\\User', 1, 'hrms-token', 'e8c235545efe7abb304ff41c0b1eb7a2e8b22b280f65409a356ce283d3f50e65', '[\"*\"]', '2026-04-21 07:42:18', NULL, '2026-04-21 06:06:36', '2026-04-21 07:42:18'),
(8, 'App\\Models\\User', 1, 'hrms-token', 'ea3fd97c80a26fb68d3136108051fa111be204dd0ec30693fecd04892d13bef8', '[\"*\"]', '2026-04-23 11:08:33', NULL, '2026-04-21 08:15:15', '2026-04-23 11:08:33');

-- --------------------------------------------------------

--
-- Table structure for table `public_holidays`
--

CREATE TABLE `public_holidays` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(200) NOT NULL,
  `date` date NOT NULL,
  `year` year(4) NOT NULL,
  `site_id` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `guard_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `role_has_permissions`
--

CREATE TABLE `role_has_permissions` (
  `permission_id` bigint(20) UNSIGNED NOT NULL,
  `role_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `safety_inspections`
--

CREATE TABLE `safety_inspections` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `site_id` bigint(20) UNSIGNED NOT NULL,
  `inspector_id` bigint(20) UNSIGNED NOT NULL,
  `inspection_date` date NOT NULL,
  `findings` text DEFAULT NULL,
  `risk_level` enum('low','medium','high') NOT NULL,
  `follow_up_required` tinyint(1) NOT NULL DEFAULT 0,
  `follow_up_date` date DEFAULT NULL,
  `status` enum('scheduled','completed','overdue') NOT NULL DEFAULT 'scheduled',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('Kp4mehSLdRt3yhIicgZmB0cXtJEY3Q6B1ge20O56', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoicFVRNFkxNmo1a3lJTjRwNUNnems2ZzVVRTUwNTdVOGxTZm10NG1ERSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1776732984),
('TaOUp3AXqNiCcNPJe5wN1LE4ehn2H5TRQyg1PYMM', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiTjlhVjJWWVdnYWMxVzdheW9sdkpKcWRxTW4wc0d0ZFlEYlZwaWM5MCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1776732989);

-- --------------------------------------------------------

--
-- Table structure for table `shift_schedules`
--

CREATE TABLE `shift_schedules` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `employee_id` bigint(20) UNSIGNED NOT NULL,
  `shift_template_id` bigint(20) UNSIGNED NOT NULL,
  `site_id` bigint(20) UNSIGNED NOT NULL,
  `schedule_date` date NOT NULL,
  `status` enum('scheduled','completed','absent','swapped') NOT NULL DEFAULT 'scheduled',
  `created_by` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `shift_templates`
--

CREATE TABLE `shift_templates` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `break_minutes` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `type` enum('day','night','custom') NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sites`
--

CREATE TABLE `sites` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(200) NOT NULL,
  `location` varchar(300) DEFAULT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `geo_fence_radius_m` int(10) UNSIGNED DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sites`
--

INSERT INTO `sites` (`id`, `name`, `location`, `latitude`, `longitude`, `geo_fence_radius_m`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Head Office', 'Kumasi, Ghana', 6.6884000, -1.6244000, 200, 1, '2026-04-21 01:08:51', '2026-04-21 01:08:51'),
(2, 'Mine Site Alpha', 'Obuasi, Ghana', 6.2038000, -1.6559000, 500, 1, '2026-04-21 01:08:51', '2026-04-21 01:08:51'),
(3, 'Mine Site Beta', 'Tarkwa, Ghana', 5.3008000, -1.9975000, 500, 1, '2026-04-21 01:08:51', '2026-04-21 01:08:51');

-- --------------------------------------------------------

--
-- Table structure for table `system_settings`
--

CREATE TABLE `system_settings` (
  `key` varchar(200) NOT NULL,
  `value` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `group` varchar(100) DEFAULT NULL,
  `updated_by` bigint(20) UNSIGNED DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `system_settings`
--

INSERT INTO `system_settings` (`key`, `value`, `description`, `group`, `updated_by`, `updated_at`) VALUES
('payroll_currency', 'GHS', 'Payroll currency', 'payroll', NULL, NULL),
('payroll_payment_day', '28', 'Day of month salaries are paid', 'payroll', NULL, NULL),
('payroll_processing_day', '25', 'Day of month payroll is processed', 'payroll', NULL, NULL),
('ssnit_employee_rate', '5.5', 'SSNIT employee contribution %', 'payroll', NULL, NULL),
('ssnit_employer_rate', '13', 'SSNIT employer contribution %', 'payroll', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `tax_configurations`
--

CREATE TABLE `tax_configurations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `bracket_name` varchar(100) NOT NULL,
  `min_amount` decimal(15,2) NOT NULL,
  `max_amount` decimal(15,2) DEFAULT NULL,
  `rate_percent` decimal(5,2) NOT NULL,
  `effective_from` date NOT NULL,
  `effective_to` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tax_configurations`
--

INSERT INTO `tax_configurations` (`id`, `bracket_name`, `min_amount`, `max_amount`, `rate_percent`, `effective_from`, `effective_to`, `created_at`, `updated_at`) VALUES
(1, 'Band 1', 0.00, 365.00, 0.00, '2024-01-01', NULL, '2026-04-21 01:08:51', '2026-04-21 01:08:51'),
(2, 'Band 2', 365.00, 1095.00, 5.00, '2024-01-01', NULL, '2026-04-21 01:08:51', '2026-04-21 01:08:51'),
(3, 'Band 3', 1095.00, 3295.00, 10.00, '2024-01-01', NULL, '2026-04-21 01:08:51', '2026-04-21 01:08:51'),
(4, 'Band 4', 3295.00, 16535.00, 17.50, '2024-01-01', NULL, '2026-04-21 01:08:51', '2026-04-21 01:08:51'),
(5, 'Band 5', 16535.00, 41535.00, 25.00, '2024-01-01', NULL, '2026-04-21 01:08:51', '2026-04-21 01:08:51'),
(6, 'Band 6', 41535.00, NULL, 30.00, '2024-01-01', NULL, '2026-04-21 01:08:51', '2026-04-21 01:08:51');

-- --------------------------------------------------------

--
-- Table structure for table `training_enrollments`
--

CREATE TABLE `training_enrollments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `employee_id` bigint(20) UNSIGNED NOT NULL,
  `training_program_id` bigint(20) UNSIGNED NOT NULL,
  `scheduled_date` date DEFAULT NULL,
  `completed_date` date DEFAULT NULL,
  `status` enum('enrolled','in_progress','completed','failed','expired') NOT NULL DEFAULT 'enrolled',
  `score` decimal(5,2) DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `certificate_path` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `training_programs`
--

CREATE TABLE `training_programs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `provider` varchar(200) DEFAULT NULL,
  `duration_hours` int(10) UNSIGNED DEFAULT NULL,
  `is_mandatory` tinyint(1) NOT NULL DEFAULT 0,
  `recurrence_months` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `employee_id` bigint(20) UNSIGNED DEFAULT NULL,
  `email` varchar(191) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','hr','manager','employee','payroll_officer') NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `last_login_at` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `employee_id`, `email`, `password`, `role`, `is_active`, `last_login_at`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 1, 'admin@berves.com', '$2y$12$SVwt83v7oCpMNKlL2cYu8.2a/cguEEafgkPGYGhntT8YlQZ8pLy.y', 'admin', 1, '2026-04-21 08:15:15', NULL, '2026-04-21 01:08:52', '2026-04-21 08:15:15'),
(2, 2, 'hr@berves.com', '$2y$12$RcrJ6yg/MytoEdRnnaR6ieJK/Q4T8Axn6o4G9d6oCzMf2NlW3MNl2', 'hr', 1, '2026-04-21 01:11:14', NULL, '2026-04-21 01:08:52', '2026-04-21 01:11:14'),
(3, 3, 'payroll@berves.com', '$2y$12$FSApPFzXz.Zw0qHCJJuWoOrVXZOKJrZCwgAVkhYU6.ypiHdua.CCG', 'payroll_officer', 1, '2026-04-21 01:12:19', NULL, '2026-04-21 01:08:52', '2026-04-21 01:12:19'),
(4, 4, 'employee@berves.com', '$2y$12$Xi/2I.a6F7KJ22DvOSqerOCI9npmoBRoD7005xpzsJl4DXzKYMzhG', 'employee', 1, '2026-04-21 01:14:05', NULL, '2026-04-21 01:08:52', '2026-04-21 01:14:05');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `applicants`
--
ALTER TABLE `applicants`
  ADD PRIMARY KEY (`id`),
  ADD KEY `applicants_job_posting_id_foreign` (`job_posting_id`);

--
-- Indexes for table `appraisal_cycles`
--
ALTER TABLE `appraisal_cycles`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `appraisal_kpi_scores`
--
ALTER TABLE `appraisal_kpi_scores`
  ADD PRIMARY KEY (`id`),
  ADD KEY `appraisal_kpi_scores_appraisal_id_foreign` (`appraisal_id`),
  ADD KEY `appraisal_kpi_scores_kpi_id_foreign` (`kpi_id`);

--
-- Indexes for table `attendance_records`
--
ALTER TABLE `attendance_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `attendance_records_site_id_foreign` (`site_id`),
  ADD KEY `attendance_records_shift_schedule_id_foreign` (`shift_schedule_id`),
  ADD KEY `attendance_records_employee_id_check_in_at_index` (`employee_id`,`check_in_at`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `audit_logs_model_type_model_id_index` (`model_type`,`model_id`),
  ADD KEY `audit_logs_user_id_index` (`user_id`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_expiration_index` (`expiration`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_locks_expiration_index` (`expiration`);

--
-- Indexes for table `certification_reminders`
--
ALTER TABLE `certification_reminders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `certification_reminders_enrollment_id_foreign` (`enrollment_id`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `departments_site_id_foreign` (`site_id`);

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `employees_employee_number_unique` (`employee_number`),
  ADD KEY `employees_job_title_id_foreign` (`job_title_id`),
  ADD KEY `employees_site_id_foreign` (`site_id`),
  ADD KEY `employees_manager_id_foreign` (`manager_id`),
  ADD KEY `employees_department_id_site_id_employment_status_index` (`department_id`,`site_id`,`employment_status`);

--
-- Indexes for table `employee_allowances`
--
ALTER TABLE `employee_allowances`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_allowances_employee_id_foreign` (`employee_id`);

--
-- Indexes for table `employee_appraisals`
--
ALTER TABLE `employee_appraisals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_appraisals_employee_id_foreign` (`employee_id`),
  ADD KEY `employee_appraisals_appraiser_id_foreign` (`appraiser_id`),
  ADD KEY `employee_appraisals_appraisal_cycle_id_foreign` (`appraisal_cycle_id`);

--
-- Indexes for table `employee_documents`
--
ALTER TABLE `employee_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_documents_employee_id_foreign` (`employee_id`),
  ADD KEY `employee_documents_uploaded_by_foreign` (`uploaded_by`),
  ADD KEY `employee_documents_expiry_date_index` (`expiry_date`);

--
-- Indexes for table `employee_loans`
--
ALTER TABLE `employee_loans`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_loans_employee_id_foreign` (`employee_id`),
  ADD KEY `employee_loans_approved_by_foreign` (`approved_by`);

--
-- Indexes for table `employee_onboardings`
--
ALTER TABLE `employee_onboardings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_onboardings_employee_id_foreign` (`employee_id`),
  ADD KEY `employee_onboardings_checklist_id_foreign` (`checklist_id`);

--
-- Indexes for table `incident_attachments`
--
ALTER TABLE `incident_attachments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `incident_attachments_incident_id_foreign` (`incident_id`),
  ADD KEY `incident_attachments_uploaded_by_foreign` (`uploaded_by`);

--
-- Indexes for table `incident_reports`
--
ALTER TABLE `incident_reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `incident_reports_reported_by_foreign` (`reported_by`),
  ADD KEY `incident_reports_site_id_foreign` (`site_id`),
  ADD KEY `incident_reports_injured_employee_id_foreign` (`injured_employee_id`),
  ADD KEY `incident_reports_investigated_by_foreign` (`investigated_by`);

--
-- Indexes for table `interview_evaluations`
--
ALTER TABLE `interview_evaluations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `interview_evaluations_interview_schedule_id_foreign` (`interview_schedule_id`),
  ADD KEY `interview_evaluations_interviewer_id_foreign` (`interviewer_id`);

--
-- Indexes for table `interview_schedules`
--
ALTER TABLE `interview_schedules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `interview_schedules_applicant_id_foreign` (`applicant_id`);

--
-- Indexes for table `job_postings`
--
ALTER TABLE `job_postings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `job_postings_job_title_id_foreign` (`job_title_id`),
  ADD KEY `job_postings_department_id_foreign` (`department_id`),
  ADD KEY `job_postings_site_id_foreign` (`site_id`),
  ADD KEY `job_postings_posted_by_foreign` (`posted_by`);

--
-- Indexes for table `job_titles`
--
ALTER TABLE `job_titles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `job_titles_department_id_foreign` (`department_id`);

--
-- Indexes for table `kpi_definitions`
--
ALTER TABLE `kpi_definitions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `kpi_definitions_department_id_foreign` (`department_id`);

--
-- Indexes for table `leave_entitlements`
--
ALTER TABLE `leave_entitlements`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `leave_entitlements_employee_id_leave_type_id_year_unique` (`employee_id`,`leave_type_id`,`year`),
  ADD KEY `leave_entitlements_leave_type_id_foreign` (`leave_type_id`);

--
-- Indexes for table `leave_policies`
--
ALTER TABLE `leave_policies`
  ADD PRIMARY KEY (`id`),
  ADD KEY `leave_policies_leave_type_id_foreign` (`leave_type_id`);

--
-- Indexes for table `leave_requests`
--
ALTER TABLE `leave_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `leave_requests_employee_id_foreign` (`employee_id`),
  ADD KEY `leave_requests_leave_type_id_foreign` (`leave_type_id`),
  ADD KEY `leave_requests_reviewed_by_foreign` (`reviewed_by`);

--
-- Indexes for table `leave_types`
--
ALTER TABLE `leave_types`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `model_has_permissions`
--
ALTER TABLE `model_has_permissions`
  ADD PRIMARY KEY (`permission_id`,`model_id`,`model_type`),
  ADD KEY `model_has_permissions_model_id_model_type_index` (`model_id`,`model_type`);

--
-- Indexes for table `model_has_roles`
--
ALTER TABLE `model_has_roles`
  ADD PRIMARY KEY (`role_id`,`model_id`,`model_type`),
  ADD KEY `model_has_roles_model_id_model_type_index` (`model_id`,`model_type`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notifications_user_id_read_at_index` (`user_id`,`read_at`);

--
-- Indexes for table `off_day_requests`
--
ALTER TABLE `off_day_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `off_day_requests_employee_id_foreign` (`employee_id`),
  ADD KEY `off_day_requests_reviewed_by_foreign` (`reviewed_by`);

--
-- Indexes for table `onboarding_checklists`
--
ALTER TABLE `onboarding_checklists`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `overtime_policies`
--
ALTER TABLE `overtime_policies`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `overtime_policies_day_type_unique` (`day_type`);

--
-- Indexes for table `overtime_records`
--
ALTER TABLE `overtime_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `overtime_records_employee_id_foreign` (`employee_id`),
  ADD KEY `overtime_records_approved_by_foreign` (`approved_by`),
  ADD KEY `overtime_records_payroll_run_id_foreign` (`payroll_run_id`);

--
-- Indexes for table `payroll_allowance_lines`
--
ALTER TABLE `payroll_allowance_lines`
  ADD PRIMARY KEY (`id`),
  ADD KEY `payroll_allowance_lines_payroll_run_id_foreign` (`payroll_run_id`);

--
-- Indexes for table `payroll_periods`
--
ALTER TABLE `payroll_periods`
  ADD PRIMARY KEY (`id`),
  ADD KEY `payroll_periods_processed_by_foreign` (`processed_by`),
  ADD KEY `payroll_periods_approved_by_foreign` (`approved_by`);

--
-- Indexes for table `payroll_runs`
--
ALTER TABLE `payroll_runs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `payroll_runs_payroll_period_id_employee_id_unique` (`payroll_period_id`,`employee_id`),
  ADD KEY `payroll_runs_employee_id_foreign` (`employee_id`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `permissions_name_guard_name_unique` (`name`,`guard_name`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`);

--
-- Indexes for table `public_holidays`
--
ALTER TABLE `public_holidays`
  ADD PRIMARY KEY (`id`),
  ADD KEY `public_holidays_site_id_foreign` (`site_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `roles_name_guard_name_unique` (`name`,`guard_name`);

--
-- Indexes for table `role_has_permissions`
--
ALTER TABLE `role_has_permissions`
  ADD PRIMARY KEY (`permission_id`,`role_id`),
  ADD KEY `role_has_permissions_role_id_foreign` (`role_id`);

--
-- Indexes for table `safety_inspections`
--
ALTER TABLE `safety_inspections`
  ADD PRIMARY KEY (`id`),
  ADD KEY `safety_inspections_site_id_foreign` (`site_id`),
  ADD KEY `safety_inspections_inspector_id_foreign` (`inspector_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `shift_schedules`
--
ALTER TABLE `shift_schedules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `shift_schedules_shift_template_id_foreign` (`shift_template_id`),
  ADD KEY `shift_schedules_site_id_foreign` (`site_id`),
  ADD KEY `shift_schedules_created_by_foreign` (`created_by`),
  ADD KEY `shift_schedules_employee_id_schedule_date_index` (`employee_id`,`schedule_date`);

--
-- Indexes for table `shift_templates`
--
ALTER TABLE `shift_templates`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sites`
--
ALTER TABLE `sites`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `tax_configurations`
--
ALTER TABLE `tax_configurations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `training_enrollments`
--
ALTER TABLE `training_enrollments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `training_enrollments_employee_id_foreign` (`employee_id`),
  ADD KEY `training_enrollments_training_program_id_foreign` (`training_program_id`),
  ADD KEY `training_enrollments_expiry_date_index` (`expiry_date`);

--
-- Indexes for table `training_programs`
--
ALTER TABLE `training_programs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD KEY `users_employee_id_foreign` (`employee_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `applicants`
--
ALTER TABLE `applicants`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `appraisal_cycles`
--
ALTER TABLE `appraisal_cycles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `appraisal_kpi_scores`
--
ALTER TABLE `appraisal_kpi_scores`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `attendance_records`
--
ALTER TABLE `attendance_records`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `certification_reminders`
--
ALTER TABLE `certification_reminders`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `employee_allowances`
--
ALTER TABLE `employee_allowances`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `employee_appraisals`
--
ALTER TABLE `employee_appraisals`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `employee_documents`
--
ALTER TABLE `employee_documents`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `employee_loans`
--
ALTER TABLE `employee_loans`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `employee_onboardings`
--
ALTER TABLE `employee_onboardings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `incident_attachments`
--
ALTER TABLE `incident_attachments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `incident_reports`
--
ALTER TABLE `incident_reports`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `interview_evaluations`
--
ALTER TABLE `interview_evaluations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `interview_schedules`
--
ALTER TABLE `interview_schedules`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `job_postings`
--
ALTER TABLE `job_postings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `job_titles`
--
ALTER TABLE `job_titles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `kpi_definitions`
--
ALTER TABLE `kpi_definitions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `leave_entitlements`
--
ALTER TABLE `leave_entitlements`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `leave_policies`
--
ALTER TABLE `leave_policies`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `leave_requests`
--
ALTER TABLE `leave_requests`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `leave_types`
--
ALTER TABLE `leave_types`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `off_day_requests`
--
ALTER TABLE `off_day_requests`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `onboarding_checklists`
--
ALTER TABLE `onboarding_checklists`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `overtime_policies`
--
ALTER TABLE `overtime_policies`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `overtime_records`
--
ALTER TABLE `overtime_records`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payroll_allowance_lines`
--
ALTER TABLE `payroll_allowance_lines`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payroll_periods`
--
ALTER TABLE `payroll_periods`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payroll_runs`
--
ALTER TABLE `payroll_runs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `public_holidays`
--
ALTER TABLE `public_holidays`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `safety_inspections`
--
ALTER TABLE `safety_inspections`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `shift_schedules`
--
ALTER TABLE `shift_schedules`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `shift_templates`
--
ALTER TABLE `shift_templates`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sites`
--
ALTER TABLE `sites`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `tax_configurations`
--
ALTER TABLE `tax_configurations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `training_enrollments`
--
ALTER TABLE `training_enrollments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `training_programs`
--
ALTER TABLE `training_programs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `applicants`
--
ALTER TABLE `applicants`
  ADD CONSTRAINT `applicants_job_posting_id_foreign` FOREIGN KEY (`job_posting_id`) REFERENCES `job_postings` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `appraisal_kpi_scores`
--
ALTER TABLE `appraisal_kpi_scores`
  ADD CONSTRAINT `appraisal_kpi_scores_appraisal_id_foreign` FOREIGN KEY (`appraisal_id`) REFERENCES `employee_appraisals` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `appraisal_kpi_scores_kpi_id_foreign` FOREIGN KEY (`kpi_id`) REFERENCES `kpi_definitions` (`id`);

--
-- Constraints for table `attendance_records`
--
ALTER TABLE `attendance_records`
  ADD CONSTRAINT `attendance_records_employee_id_foreign` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`),
  ADD CONSTRAINT `attendance_records_shift_schedule_id_foreign` FOREIGN KEY (`shift_schedule_id`) REFERENCES `shift_schedules` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `attendance_records_site_id_foreign` FOREIGN KEY (`site_id`) REFERENCES `sites` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `certification_reminders`
--
ALTER TABLE `certification_reminders`
  ADD CONSTRAINT `certification_reminders_enrollment_id_foreign` FOREIGN KEY (`enrollment_id`) REFERENCES `training_enrollments` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `departments`
--
ALTER TABLE `departments`
  ADD CONSTRAINT `departments_site_id_foreign` FOREIGN KEY (`site_id`) REFERENCES `sites` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `employees`
--
ALTER TABLE `employees`
  ADD CONSTRAINT `employees_department_id_foreign` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`),
  ADD CONSTRAINT `employees_job_title_id_foreign` FOREIGN KEY (`job_title_id`) REFERENCES `job_titles` (`id`),
  ADD CONSTRAINT `employees_manager_id_foreign` FOREIGN KEY (`manager_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `employees_site_id_foreign` FOREIGN KEY (`site_id`) REFERENCES `sites` (`id`);

--
-- Constraints for table `employee_allowances`
--
ALTER TABLE `employee_allowances`
  ADD CONSTRAINT `employee_allowances_employee_id_foreign` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `employee_appraisals`
--
ALTER TABLE `employee_appraisals`
  ADD CONSTRAINT `employee_appraisals_appraisal_cycle_id_foreign` FOREIGN KEY (`appraisal_cycle_id`) REFERENCES `appraisal_cycles` (`id`),
  ADD CONSTRAINT `employee_appraisals_appraiser_id_foreign` FOREIGN KEY (`appraiser_id`) REFERENCES `employees` (`id`),
  ADD CONSTRAINT `employee_appraisals_employee_id_foreign` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`);

--
-- Constraints for table `employee_documents`
--
ALTER TABLE `employee_documents`
  ADD CONSTRAINT `employee_documents_employee_id_foreign` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `employee_documents_uploaded_by_foreign` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `employee_loans`
--
ALTER TABLE `employee_loans`
  ADD CONSTRAINT `employee_loans_approved_by_foreign` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `employee_loans_employee_id_foreign` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`);

--
-- Constraints for table `employee_onboardings`
--
ALTER TABLE `employee_onboardings`
  ADD CONSTRAINT `employee_onboardings_checklist_id_foreign` FOREIGN KEY (`checklist_id`) REFERENCES `onboarding_checklists` (`id`),
  ADD CONSTRAINT `employee_onboardings_employee_id_foreign` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `incident_attachments`
--
ALTER TABLE `incident_attachments`
  ADD CONSTRAINT `incident_attachments_incident_id_foreign` FOREIGN KEY (`incident_id`) REFERENCES `incident_reports` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `incident_attachments_uploaded_by_foreign` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `incident_reports`
--
ALTER TABLE `incident_reports`
  ADD CONSTRAINT `incident_reports_injured_employee_id_foreign` FOREIGN KEY (`injured_employee_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `incident_reports_investigated_by_foreign` FOREIGN KEY (`investigated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `incident_reports_reported_by_foreign` FOREIGN KEY (`reported_by`) REFERENCES `employees` (`id`),
  ADD CONSTRAINT `incident_reports_site_id_foreign` FOREIGN KEY (`site_id`) REFERENCES `sites` (`id`);

--
-- Constraints for table `interview_evaluations`
--
ALTER TABLE `interview_evaluations`
  ADD CONSTRAINT `interview_evaluations_interview_schedule_id_foreign` FOREIGN KEY (`interview_schedule_id`) REFERENCES `interview_schedules` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `interview_evaluations_interviewer_id_foreign` FOREIGN KEY (`interviewer_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `interview_schedules`
--
ALTER TABLE `interview_schedules`
  ADD CONSTRAINT `interview_schedules_applicant_id_foreign` FOREIGN KEY (`applicant_id`) REFERENCES `applicants` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `job_postings`
--
ALTER TABLE `job_postings`
  ADD CONSTRAINT `job_postings_department_id_foreign` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`),
  ADD CONSTRAINT `job_postings_job_title_id_foreign` FOREIGN KEY (`job_title_id`) REFERENCES `job_titles` (`id`),
  ADD CONSTRAINT `job_postings_posted_by_foreign` FOREIGN KEY (`posted_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `job_postings_site_id_foreign` FOREIGN KEY (`site_id`) REFERENCES `sites` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `job_titles`
--
ALTER TABLE `job_titles`
  ADD CONSTRAINT `job_titles_department_id_foreign` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `kpi_definitions`
--
ALTER TABLE `kpi_definitions`
  ADD CONSTRAINT `kpi_definitions_department_id_foreign` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `leave_entitlements`
--
ALTER TABLE `leave_entitlements`
  ADD CONSTRAINT `leave_entitlements_employee_id_foreign` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `leave_entitlements_leave_type_id_foreign` FOREIGN KEY (`leave_type_id`) REFERENCES `leave_types` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `leave_policies`
--
ALTER TABLE `leave_policies`
  ADD CONSTRAINT `leave_policies_leave_type_id_foreign` FOREIGN KEY (`leave_type_id`) REFERENCES `leave_types` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `leave_requests`
--
ALTER TABLE `leave_requests`
  ADD CONSTRAINT `leave_requests_employee_id_foreign` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`),
  ADD CONSTRAINT `leave_requests_leave_type_id_foreign` FOREIGN KEY (`leave_type_id`) REFERENCES `leave_types` (`id`),
  ADD CONSTRAINT `leave_requests_reviewed_by_foreign` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `model_has_permissions`
--
ALTER TABLE `model_has_permissions`
  ADD CONSTRAINT `model_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `model_has_roles`
--
ALTER TABLE `model_has_roles`
  ADD CONSTRAINT `model_has_roles_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `off_day_requests`
--
ALTER TABLE `off_day_requests`
  ADD CONSTRAINT `off_day_requests_employee_id_foreign` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`),
  ADD CONSTRAINT `off_day_requests_reviewed_by_foreign` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `overtime_records`
--
ALTER TABLE `overtime_records`
  ADD CONSTRAINT `overtime_records_approved_by_foreign` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `overtime_records_employee_id_foreign` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`),
  ADD CONSTRAINT `overtime_records_payroll_run_id_foreign` FOREIGN KEY (`payroll_run_id`) REFERENCES `payroll_runs` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `payroll_allowance_lines`
--
ALTER TABLE `payroll_allowance_lines`
  ADD CONSTRAINT `payroll_allowance_lines_payroll_run_id_foreign` FOREIGN KEY (`payroll_run_id`) REFERENCES `payroll_runs` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `payroll_periods`
--
ALTER TABLE `payroll_periods`
  ADD CONSTRAINT `payroll_periods_approved_by_foreign` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `payroll_periods_processed_by_foreign` FOREIGN KEY (`processed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `payroll_runs`
--
ALTER TABLE `payroll_runs`
  ADD CONSTRAINT `payroll_runs_employee_id_foreign` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`),
  ADD CONSTRAINT `payroll_runs_payroll_period_id_foreign` FOREIGN KEY (`payroll_period_id`) REFERENCES `payroll_periods` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `public_holidays`
--
ALTER TABLE `public_holidays`
  ADD CONSTRAINT `public_holidays_site_id_foreign` FOREIGN KEY (`site_id`) REFERENCES `sites` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `role_has_permissions`
--
ALTER TABLE `role_has_permissions`
  ADD CONSTRAINT `role_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `role_has_permissions_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `safety_inspections`
--
ALTER TABLE `safety_inspections`
  ADD CONSTRAINT `safety_inspections_inspector_id_foreign` FOREIGN KEY (`inspector_id`) REFERENCES `employees` (`id`),
  ADD CONSTRAINT `safety_inspections_site_id_foreign` FOREIGN KEY (`site_id`) REFERENCES `sites` (`id`);

--
-- Constraints for table `shift_schedules`
--
ALTER TABLE `shift_schedules`
  ADD CONSTRAINT `shift_schedules_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `shift_schedules_employee_id_foreign` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`),
  ADD CONSTRAINT `shift_schedules_shift_template_id_foreign` FOREIGN KEY (`shift_template_id`) REFERENCES `shift_templates` (`id`),
  ADD CONSTRAINT `shift_schedules_site_id_foreign` FOREIGN KEY (`site_id`) REFERENCES `sites` (`id`);

--
-- Constraints for table `training_enrollments`
--
ALTER TABLE `training_enrollments`
  ADD CONSTRAINT `training_enrollments_employee_id_foreign` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`),
  ADD CONSTRAINT `training_enrollments_training_program_id_foreign` FOREIGN KEY (`training_program_id`) REFERENCES `training_programs` (`id`);

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_employee_id_foreign` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
