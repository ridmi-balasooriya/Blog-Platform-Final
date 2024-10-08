# Blog Platform Project Documentation

## Introduction

This project is a blog platform that allows users to read articles, register and log in, write articles, update articles, add comments, and like articles. The platform is built using React.js for the frontend, Django for the backend, and PostgreSQL as the database. The application is deployed on AWS Elastic Beanstalk.

# Table of Contents

1. [Project Structure](#project-structure)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Deployment](#deployment)
5. [Usage](#usage)
6. [API Endpoints](#aPI-endpoints)
7. [Security](#security)
8. [Troubleshooting](#troubleshooting)
9. [Configuration for Local Development](#configuration-for-local-development)

## Project Structure

```
blog-platform/
├── blog_platform/  (backend)
│ ├── blog/
│ ├── blog_platform/
│ ├── manage.py
│ └── requirements.txt
├── blog_platform_front/  (frontend)
│ ├── public/
│ ├── src/
│ ├── package.json
│ └── webpack.config.js
├── Blog_Platform_Documentation.md
└── README.md

```
## Installation

### Prerequisites

-   Python 3.8+
-   Node.js 14+
-   PostgreSQL 12+
-   AWS Account

### Backend

1. Clone the repository:
   `git clone https://github.com/ridmi-balasooriya/Blog-Platform-Final.git`

2. Navigate to the backend directory
   `cd blog-platform/blog_platform`

3. Create a virtual environment and install dependencies:
   `python -m venv venv`
   `source venv/bin/activate`
   `pip install -r requirements.txt`

4. Set up the PostgreSQL database:
   `CREATE DATABASE blog_platform;`
   `CREATE USER blog_user WITH PASSWORD 'yourpassword';`
   `ALTER ROLE blog_user SET client_encoding TO 'utf8';`
   `ALTER ROLE blog_user SET default_transaction_isolation TO 'read committed';`
   `ALTER ROLE blog_user SET timezone TO 'UTC';`
   `GRANT ALL PRIVILEGES ON DATABASE blog_platform TO blog_user;`

5. Apply migrations:
   `python manage.py migrate`

6. Create a superuser:
   `python manage.py createsuperuser`

7. Run the server:
   `python manage.py runserver`

### Frontend

1. Navigate to the frontend directory
   `cd ../blog_platform_frontend`

2. Install dependencies:
   `npm install`

3. Start the development server:
   `npm start`

## Configuration

### Environment Variables

Create a .env file in the backend directory with the following content:

```
SECRET_KEY=your_secret_key
DEBUG=False

#Database Credentials Remote
DB_NAME=<DB_NAME>
DB_USER=<DB_USER>
DB_PASSWORD=<DB_PASSWORD>
DB_HOST=<DB_HOST>
DB_PORT=<DB_PORT>

#Database Credentials local
DB_HOST_LH=localhost
DB_PASSWORD_LH=<DB_PASSWORD_LH>

#Email Credentials
EMAIL_HOST_USER=<EMAIL_HOST_USER=>
EMAIL_HOST_PASSWORD=<EMAIL_HOST_PASSWORD>
EMAIL_PORT=<EMAIL_PORT>

#AWS Credentials
AWS_ACCESS_KEY_ID=<AWS_ACCESS_KEY_ID>
AWS_SECRET_ACCESS_KEY=<AWS_SECRET_ACCESS_KEY>
AWS_S3_REGION_NAME=<AWS_S3_REGION_NAME>
AWS_STORAGE_BUCKET_NAME=<AWS_STORAGE_BUCKET_NAME>
AWS_S3_CUSTOM_DOMAIN=f'{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com'
```

## Deployment

### AWS Elastic Beanstalk

1. Initialize Elastic Beanstalk application:
   `eb init -p python-3.8 blog-platform --region your-region`

2. Create an environment and deploy:
   `eb create blog-platform-env`
   `eb deploy`

3. Set environment variables in Elastic Beanstalk:

-   Go to the Elastic Beanstalk console.
-   Navigate to your environment.
-   Go to Configuration -> Software.
-   Add environment properties for your settings.

## Usage

1. Access the application:

-   Frontend: http://your-elastic-beanstalk-url/
-   Backend API: http://your-elastic-beanstalk-url/api/

2. Register a new user or log in with existing credentials.

3. Explore articles, write new articles, update existing ones, add comments, and like articles.

## Security

-   Authentication: Implemented using token-based authentication.
-   CORS: Configured to allow requests from specific origins.
-   HTTPS: Ensure HTTPS is enabled for secure communication.

## Troubleshooting

-   CORS Issues: Ensure CORS_ALLOWED_ORIGINS includes your frontend URL.
-   Database Errors: Verify database connection settings and credentials.
-   Deployment Issues: Check AWS Elastic Beanstalk logs for detailed error messages.

## Configuration for Local Development

For local development, ensure that the API_BASE_URL in your React application points to your local backend server. You can find this configuration in the config.jsx file:
`const API_BASE_URL = 'http://127.0.0.1:8000';`
`export default API_BASE_URL;`

Make sure to remove or comment out the production URL:
// Remove or comment out the production URL
// const API_BASE_URL = 'http://<backend-url>.elasticbeanstalk.com';

This change ensures that during local development, your frontend application communicates with your locally running Django backend.
