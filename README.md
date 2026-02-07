in this readme file keep everything just enhance the readability 
# 🏗️ MIMARIA - Design, Build, Network

**A Unified Platform for Architects, Agencies, and Clients**

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Architecture & Technology Stack](#architecture--technology-stack)
- [Functionalities by User Type](#functionalities-by-user-type)
  - [Client Interface](#client-interface)
  - [Architect Interface](#architect-interface)
  - [Agency Interface](#agency-interface)
- [Core Features & Interfaces](#core-features--interfaces)
- [Design Philosophy](#design-philosophy)
- [Installation & Setup](#installation-setup)
- [Team](#team)
- [License](#License)
- [Future enhancments](#Future-Enhancements)

---

## Project Overview

**Mimaria** is a sophisticated, full-stack web platform designed to bridge the gap between architects, design agencies, and clients seeking architectural services. The platform facilitates seamless collaboration, project management, and networking within the architecture and design industry.

Whether you're a client looking for the perfect design team, an architect managing multiple projects and collaborations, or an agency streamlining your operations—Mimaria provides an integrated solution tailored to your needs.

### Mission
To democratize access to architectural services and create meaningful connections between talented architects and agencies that need their expertise, while empowering clients to find and collaborate with the right design professionals.

---

##  Key Features

###  **Secure Authentication System**
- Multi-user role-based authentication (Client, Architect, Agency)
- Secure password hashing and session management
- Role-based access control (RBAC) for all endpoints
- Legal document verification for agency registration

### **Project Management**
- End-to-end project lifecycle management
- Dynamic milestone tracking and progress monitoring
- Real-time project status updates
- File upload and document management
- Detailed project portfolios and case studies

### **Team Collaboration**
- Agency team member management
- Architect application and hiring workflow
- Team performance tracking
- Member role assignment and management

### **Portfolio & Showcase**
- Professional portfolio management for architects
- Agency portfolio with project galleries
- Visual project previews and descriptions
- Project filtering and categorization

### **Smart Discovery**
- Browse and search available agencies
- Filter architects by expertise and experience
- Project request matching system
- Agency browsing with portfolio views

### **Responsive Design**
- Mobile-first approach
- Cross-browser compatibility
- Accessible UI/UX components
- Smooth animations and transitions

---

## Architecture & Technology Stack

### **Frontend**
- **HTML5** - Semantic structure
- **CSS3** - Modern styling with CSS variables and Grid/Flexbox
- **Vanilla JavaScript** - Dynamic interactions without dependencies
- **Responsive Design** - Mobile, tablet, and desktop optimization

### **Backend**
- **PHP 8+** - Server-side logic and API endpoints
- **RESTful API** - Standardized API design
- **MVC Architecture** - Clean separation of concerns
- **CORS Support** - Cross-origin request handling

### **Database**
- **MySQL** - Relational database management
- **PDO** - Prepared statements for secure queries
- **UTF-8 Encoding** - Multi-language support

### **Tools & Infrastructure**
- **XAMPP** - Local development environment
- **Session Management** - Secure cookie-based sessions
- **File Upload Handling** - Multipart form-data support

---

## Functionalities by User Type

### **CLIENT INTERFACE**

#### Overview
The client interface provides an intuitive platform for users seeking architectural services. Clients can post project requests, browse portfolios, manage ongoing projects, and communicate with architects and agencies.

#### Main Functionalities

1. **Project Request Creation**
   - Multi-step project request form
   - Project type selection (Residential, Commercial, Exterior, Interior, Both)
   - Detailed project description and specifications
   - Budget range specification
   - File upload for reference images and documents
   - Service type selection (Architecture, Interior Design, 3D Visualization, etc.)

2. **Project Management**
   - View all active and past projects
   - Real-time project status tracking
   - Timeline visualization
   - Progress percentage monitoring
   - Milestone tracking with due dates

3. **Browse & Search**
   - Search agencies by location, specialty, and ratings
   - View agency portfolios and completed projects
   - Read client reviews and testimonials

4. **Communication & Review**
   - Submit project reviews after completion
   - Rate architects and agencies
   - View saved reviews and ratings
   - Track application status

5. **Profile Management**
   - Create and update client profile
   - Upload profile picture
   - Manage contact information
   - View project history


---

### **ARCHITECT INTERFACE**

#### Overview
The architect interface empowers architects to manage their professional presence, build portfolios, track projects, and connect with agencies for collaboration opportunities.

#### Main Functionalities

1. **Portfolio Management**
   - Add and showcase completed projects
   - Upload project images and descriptions
   - Highlight project details and achievements
   - Update portfolio dynamically

2. **Experience Management**
   - Add work experience entries
   - Specify roles, agencies, and dates
   - Mark current work positions
   - Add detailed job descriptions
   - Manage employment history

3. **Project Tracking**
   - View all assigned projects
   - Track project progress and milestones
   - Update project status in real-time
   - Access project documentation
   - Monitor project timeline

4. **Agency Applications**
   - Browse available agencies
   - Submit applications with CV
   - View agency information and team structure
   - Join agencies as a team member

5. **Professional Profile**
   - Create comprehensive professional profile
   - Add professional qualifications
   - Specify areas of expertise
   - Upload profile picture and credentials
   - Manage contact information
   - Add years of experience


---

### **AGENCY INTERFACE**

#### Overview
The agency interface provides comprehensive tools for managing operations, team, projects, and client relationships. It's designed for administrative and operational efficiency.

#### Main Functionalities

1. **Dashboard & Analytics**
   - Key statistics display (total clients, architects, projects)
   - Interactive calendar with project deadlines
   - Project progress tracking
   - Salary overview and budget management
   - Visual analytics and performance metrics

2. **Project Management**
   - View all client requests and projects
   - Assign architects to projects
   - Set and manage project deadlines
   - Track project progress with milestones
   - Update project status
   - Manage project budgets
   - Archive completed projects

3. **Team Management**
   - Review architect applications
   - Accept or reject applications
   - View all team members
   - View member portfolios and experience

4. **Agency Profile Management**
   - Update agency information (name, bio, address, contact)
   - Upload profile and cover images
   - Manage agency location and service areas
   - Display agency contact information
   - Showcase agency achievements

5. **Portfolio & Showcase**
   - Manage agency portfolio
   - Showcase completed projects
   - Add project descriptions and images
   - Display testimonials and client feedback


---

## Core Features & Interfaces

## Design Philosophy

### **Custom Design - Built from Scratch**

The entire Mimaria interface was designed and built from scratch with **zero UI framework dependencies**. This provides:

- ✅ **Complete Design Control** - Every pixel is intentional
- ✅ **Lightweight Performance** - No framework overhead
- ✅ **Unique Identity** - Distinctive design language
- ✅ **Maximum Flexibility** - Easy customization
- ✅ **Pure CSS3** - Modern, standards-compliant

**Typography:**
- Primary Font: Aileron (elegant, modern)
- Secondary Font: Poppins (clean, readable)
- Responsive scaling with CSS variables


---

## Installation & Setup

### **Prerequisites**
- XAMPP (or PHP/MySQL stack)
- PHP 8.0+
- MySQL 5.7+
- Modern web browser

### **Step-by-Step Guide**

#### 1. Install XAMPP
- Download from https://www.apachefriends.org/
- Follow installation wizard
- Complete setup

#### 2. Clone Project

Clone repository
git clone https://github.com/ENSIA-AI/Mimaria.git

 Or extract ZIP to htdocs folder

#### 3. Create Database
 Open phpMyAdmin: http://localhost/phpmyadmin/
 Create new database: mimaria_db
 Charset: utf8mb4_unicode_ci
 
#### 4. Import Schema
 In phpMyAdmin:
 1. Select mimaria_db
 2. Import mimaria.sql

#### 5. Configure Database
$host = 'localhost';
$dbname = 'mimaria_db';
$username = 'root';
$password = '';

#### 6. Create Upload Folders

mkdir -p assets/uploads/{profiles,projects,documents}
chmod -R 755 assets/uploads

#### 7. Start Services
Open XAMPP Control Panel
Click "Start" for Apache
Click "Start" for MySQL

#### 8. Access Application
- Landing:  http://localhost/Mimaria/
- Client:   http://localhost/Mimaria/pages/client-interface.html
- Architect: http://localhost/Mimaria/pages/architect-interface.html
- Agency:   http://localhost/Mimaria/pages/agency-interface.html

## Security Features
- ✅ Password Hashing - Secure bcrypt encryption 
- ✅ Session Management - Secure, HTTP-only cookies 
- ✅ SQL Injection Prevention - PDO prepared statements 
- ✅ CSRF Protection - Session validation 
- ✅ File Upload Security - Type and size validation 
- ✅ Access Control - Role-based authorization 
- ✅ Error Handling - Secure error messages


## Team
### Group members :
-  -> Zeghilet Afrah
- -> Badri Lydia Ranim
- -> Hamgani Narimane
- -> Camilia Aziza Razane Saber
### the work each one did :
#### Design :
Zeghilet Afrah, Badri Lydia Ranim ,Hamgani Narimane
#### Frontend & backend :
##### Zeghilet Afrah:
- main page
- client interface
- architect interface
- login page
- sign up pages for architect, client  and agency + user registration & authentication 
- reset password
- edit profile for architect, client and agency

##### Badri Lydia Ranim
- agency interface (dahsboard, setting deadlines,managing members ...)
- project request and appliance request forms
- project request and appliance request preview
- project request management for architect , agency and client
- project template preview

##### Hamgani Narimane
- agency portfolio
- architect portfolio
- eductaion and experience forms and mnagement for architect
- all agencies page 
- all agency memebrs page
- all agency appliance request page
- all agency's project request page
- searching

### note:
For backend, generally each one of us focused on its pages but when errors staarted showing we worked on backend together like when each one finds a problem she tried to fix it in other oages so it is like a group work

##### Camilia Aziza Razane Saber
project template form for portfolios
contact us and reviews section in the main
client reviews

## License
This project is licensed under the MIT License.

## Future Enhancements
- Admin dashboard
- Real-time notifications
- Advanced search with AI
- Payment integration
- Mobile app
- PWA support
- Advanced analytics
- Dark mode
- Messaging system