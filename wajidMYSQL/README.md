# WajidMYSQL

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.0.6.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

-- phpMyAdmin SQL Dump
-- version 4.9.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Feb 11, 2025 at 11:41 AM
-- Server version: 10.4.10-MariaDB
-- PHP Version: 7.3.12


SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";




/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- --------------------------------------------------------

-- **Database**: `angular-test`
---- Table structure for table `users` --
DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `mobile` varchar(20) NOT NULL,
  `address` text DEFAULT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `username` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `unique_email` (`email`),
  UNIQUE KEY `unique_mobile` (`mobile`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `unique_username` (`username`)
) ENGINE=MyISAM AUTO_INCREMENT=21 DEFAULT CHARSET=latin1;


---- Dumping data for table `users` --
INSERT INTO `users` (`id`, `name`, `email`, `password`, `mobile`, `address`, `photo`, `username`) VALUES
(18, 'wajid', 'wajid@gmail.com', '$2a$10$JfgphN.vy//WxKhCpddwbeB7XCtahU/clgct31c6eSwG4LlIaPqI.', '9865327410', 'New Delhi India', '1739268188782-arham.jpg', 'wajid'),
(19, 'sajid', 'sajid@gmail.com', '$2a$10$L9uK02ShCREW3E69jFd2OOkcGtp6iFGP3H3HNd6J.dU0VT/Ol2Mri', '65465365465', 'New Delhi India', NULL, 'sajid'),
(20, 'sachin', 'sachin@gmail.com', '$2a$10$3y8LiYJVcBCBsdaJBlxZSukA4aYagVp5LUwxPhWvuDPoBYubJ8M/y', '7896541230', 'New Delhi India', '1739271850841-arham.jpg', 'sachin');
COMMIT;

 


