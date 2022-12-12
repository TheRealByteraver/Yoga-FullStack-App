-- phpMyAdmin SQL Dump
-- version 4.7.1
-- https://www.phpmyadmin.net/
--
-- Host: sql11.freemysqlhosting.net
-- Generation Time: Sep 27, 2021 at 03:13 PM
-- Server version: 5.5.62-0ubuntu0.14.04.1
-- PHP Version: 7.0.33-0ubuntu0.16.04.16

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sql11440457`
--

-- --------------------------------------------------------

--
-- Table structure for table `Courses`
--

CREATE TABLE `Courses` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL DEFAULT '',
  `description` text NOT NULL,
  `estimatedTime` varchar(255) DEFAULT NULL,
  `materialsNeeded` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `userId` int(11) NOT NULL DEFAULT '-1'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `Courses`
--

INSERT INTO `Courses` (`id`, `title`, `description`, `estimatedTime`, `materialsNeeded`, `createdAt`, `updatedAt`, `userId`) VALUES
(1, 'Build a Basic Bookcase', 'High-end furniture projects are great to dream about. But unless you have a well-equipped shop and some serious woodworking experience to draw on, it can be difficult to turn the dream into a reality.\r\n\r\nNot every piece of furniture needs to be a museum showpiece, though. Often a simple design does the job just as well and the experience gained in completing it goes a long way toward making the next project even better.\r\n\r\nOur pine bookcase, for example, features simple construction and it\'s designed to be built with basic woodworking tools. Yet, the finished project is a worthy and useful addition to any room of the house. While it\'s meant to rest on the floor, you can convert the bookcase to a wall-mounted storage unit by leaving off the baseboard. You can secure the cabinet to the wall by screwing through the cabinet cleats into the wall studs.\r\n\r\nWe made the case out of materials available at most building-supply dealers and lumberyards, including 1/2 x 3/4-in. parting strip, 1 x 2, 1 x 4 and 1 x 10 common pine and 1/4-in.-thick lauan plywood. Assembly is quick and easy with glue and nails, and when you\'re done with construction you have the option of a painted or clear finish.\r\n\r\nAs for basic tools, you\'ll need a portable circular saw, hammer, block plane, combination square, tape measure, metal rule, two clamps, nail set and putty knife. Other supplies include glue, nails, sandpaper, wood filler and varnish or paint and shellac.\r\n\r\nThe specifications that follow will produce a bookcase with overall dimensions of 10 3/4 in. deep x 34 in. wide x 48 in. tall. While the depth of the case is directly tied to the 1 x 10 stock, you can vary the height, width and shelf spacing to suit your needs. Keep in mind, though, that extending the width of the cabinet may require the addition of central shelf supports.', '12 hours', '* 1/2 x 3/4 inch parting strip\r\n* 1 x 2 common pine\r\n* 1 x 4 common pine\r\n* 1 x 10 common pine\r\n* 1/4 inch thick lauan plywood\r\n* Finishing Nails\r\n* Sandpaper\r\n* Wood Glue\r\n* Wood Filler\r\n* Minwax Oil Based Polyurethane\r\n', '2021-08-10 15:11:24', '2021-08-10 15:11:24', 1),
(2, 'Learn How to Program in Pascal', 'In this course, you\'ll learn how to write code like a pro!', '6 hours', '* Notebook computer running Mac OS X or Windows\r\n* Text editor', '2021-08-10 15:11:24', '2021-08-10 15:11:24', 2),
(3, 'Learn How to Test Programs', 'In this course, you\'ll learn how to test programs.', NULL, NULL, '2021-08-10 15:11:24', '2021-08-10 15:11:24', 2),
(4, 'Debugging 101', 'An introduction to testing and debugging your code.', '4 hours', '* Notebook computer running Mac OS X or Windows\r\n* Text editor', '2021-08-10 15:11:24', '2021-08-10 15:11:24', 1),
(5, 'x86 Assembly language', 'An introduction to x86 assembly language', '40 hrs', 'laptop with dosbox installed', '2021-09-27 14:56:41', '2021-09-27 14:56:41', 4);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `Courses`
--
ALTER TABLE `Courses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `Courses`
--
ALTER TABLE `Courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
--
-- Constraints for dumped tables
--

--
-- Constraints for table `Courses`
--
ALTER TABLE `Courses`
  ADD CONSTRAINT `Courses_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
