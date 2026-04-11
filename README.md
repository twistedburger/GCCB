# Global Campus Commute Buddy (GC²B)

# Project Description
GC²B is a community-focused application designed to help students safely and efficiently coordinate shared travel to campus events and activities. Users are able to create, explore, and join group communites using various transportation methods (carpooling, cycling, public transit, etc.).

# Key Project Goals 
- Enhancing student safety & participation
- Promote sustainability & track CO₂ savings

# Installation Guide

Step by step instructions to clone this repo and setup the dev enviroment on a local machine.

## Step 1 - Clone From Github

Navigate to the folder you would like to save the project in

In the windows explorer window, type `cmd` 

> Note: If using Mac, right click in finder and select "New Terminal at Folder"

in the new command line or terminal, enter the following command to clone the repo:

`git clone https://github.com/twistedburger/GCCB.git`

and then move into the new directory

`cd GCCB`

Keep this command line or terminal open.

## Step 2 - Download Node, NPM, and Install Packages

Go to https://nodejs.org/en/download and download the prebuild Node.js for your operating system.

![alt text](image-2.png)

Once downloaded, run the installer and accept all default settings.

After Node.js has been installed, in the same terminal you had open, install the required packages with the following command

`npm run install`

## Step 3 - Download and Install PostgreSQL

Go to the postgreSQL download page and select your preferred operating system:

> https://www.enterprisedb.com/downloads/postgres-postgresql-downloads

Once the download is complete, run the installer

Follow the instructions in the installer. Be sure to select all components on the `Select Components` page. Once the installer completes, select yes to `Launch Stack Builder at exit`

> Note: During installation, you may be asked to enter a password for your database. It is not recommended to use the same password as your computer, as you will need to store this password in plain text later. Since the database is hosted locally and will not be exposed to the internet, it is fine to leave the password blank.  
> If you have forgotten your password, this stack overflow article can help reset it: https://stackoverflow.com/questions/10845998/i-forgot-the-password-i-entered-during-postgresql-installation

## Step 4 - Install PostGIS for Geocoding

In the newly opened Stack Builder window, select the version of PostgreSQL that you installed, in the dropdown list:

![alt text](image.png)

Click next, and expand `Spatial Extensions` and check the `PostGIS` bundle. This is required for saving geocoded information to the database.

![alt text](image-1.png)

Continue through the following pages, leaving everything as the default selections. When prompted to install, start the installation process. Once the installer completes, close the window and click `Finish` in the Stack Builder window.

## Step 5 - Setup PostgreSQL Database

In the inital code package, you will also have been sent a .env file. Move this file into the `backend` directory found in the GCCB project folder. Once the .env has been added, ensure the `DB_PASSWORD` field matches the password you set in step 3. If you left the password blank, leave the .env password blank as well.

Run the database initialization command in the terminal you originally had open where you installed the packages in step 2 using the following command:

`npm run db:init`

> Note. During the installation of PostgreSQL, the pg Admin 4 application was also installed. This is a handy tool for managing the database. For more details on how to use pgAdmin 4, read this article: https://www.w3schools.com/postgresql/postgresql_pgadmin4.php 

## Step 6 - Start the Server Locally

Open a new instance of the terminal or command line in the `GCCB/backend` directory. 

Start in the same terminal or command line you had in step 2, and enter the following command to open a new instance:

`start cmd` 

> Note, on Mac, enter `Command (⌘) + T` to make a new instance

Navigate to the backend folder in the new instance:

`cd backend`

Start the server with the following command:

`npm run start`

This window will now have the server running and ready to listen. 

>To stop the server, close the terminal or enter:
`ctrl + c` or on Mac, enter `Control + c` to stop the server

## Step 7 - Start the Frontend Locally

Open a new instance of the terminal or command line in the `GCCB/frontend` directory. 

Start in the same terminal or command line you had in step 2, and enter the following command to open a new instance:

`start cmd` 

> Note, on Mac, enter `Command (⌘) + T` to make a new instance

Navigate to the backend folder in the new instance:

`cd frontend`

Start the server with the following command:

`npm run dev`

This window will now have the frontend running locally. 

>To stop the frontend, close the terminal or enter:
`ctrl + c` or on Mac, enter `Control + c` to stop the server

## Step 8 - Ready to Use

Now the application is running, and it can be accessed by searching the following in any browser: 

`http://localhost:5173/` 

To view the page in mobile view, open developer tools in your browser with `F12`. If this does not open the developer tools in your browser, do a quick search to find out how.

> Note, in Mac Chrome/Firefox/Edge, use `Cmd + Option + I`

> Note, in Mac Safari, use `Cmd + Option + C`

Click the laptop/mobile button and select the layout as shown in the following image. 

![alt text](image-5.png)

> Note, while any phone layout can be selected. Responsive allows the most felxibility when viewing

# Team Members
- Aaron Tsang
- Dylan Reimer
- Jamie Kim
- Claudia Le

# Future Features
- Badge/Gamification
- Chat features
- Notifications (upcoming trips)
- Web Hosting
- Set CO2 Savings Goals
- Add ability to ban or blacklist other users once chat is implemented
    - View list of blocked/blacklisted users to undo if needed
- Add profile view to view details about another use, and display their badges
- Add button, or other logic to confirm completion of route
- Add logic to ensure state of newly created events/routes is valid (i.e. not in the past, routes are before the event date)
- View all events without location (maybe a geotag for a specific SSO to get events within X radius of campus)
- Show things on the map with markers (i.e. display events in the map as little boxes)
- Display University Logo depending on the SSO partner that was used to login
- Responsiveness (i.e. show grids instead of one column for routes/events)
- Show some profile information in the sidebar
- Delete or cancel an event our route
- Auto generate route title based on event title (eg. bus to event)
- Share a route via link so someone can immediatley join
- Add user rating system

