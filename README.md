# Blogging Platform API  

A **RESTful API** built with **Express.js** and **PostgreSQL** for managing users, posts, comments, and tags.  
This project supports authentication with JWT, role-based permissions (admin, author), and features like searching, filtering, tagging, and pagination.  

---

## 🚀 Features
- User registration & login with hashed passwords  
- JWT authentication & role-based access (admin, author)  
- Post CRUD (authors can only manage their own posts, admins can manage all)  
- Comments (any authenticated user can comment, only owners/admins can delete)  
- Tags (assign multiple tags to posts, filter by tag)  
- Filtering, search (title/content), and pagination  
- PostgreSQL database schema with SQL dump  
- Postman collection for testing all endpoints  

---

## 🛠️ Requirements
- Node.js (v18+)  
- PostgreSQL (v14+)  
- npm or yarn  

---

## 📂 Project Structure
```
- /config -> database connection
- /controllers -> request handlers
- /routes -> route definitions
- /middleware -> authentication & role checks
- /docs -> API documentation, Postman collection, DB dump
- index.js -> app entry point
```
---

## ⚙️ Setup & Installation
### 1. Clone the repository
```cmd
git clone https://github.com/faridibirov/blogging-api-expressjs.git
cd blogging-api-expressjs
```

### 2. Install dependencies
```cmd
npm install
```
### 3. Configure environment variables

Create a .env file in the root directory:
```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=blogging_platform
JWT_SECRET=supersecretkey
```
### 4. Setup database

Create a new PostgreSQL database:
```sql
CREATE DATABASE blogging_platform;
```

Import schema and sample data (optional):
```sql
psql -U postgres -d blogging_platform -f docs/blogging_platform.sql
```

### 5. Run the server

Development (with auto-restart):
```cmd
npm run dev
```

Production:
```cmd
npm start
```

Server should now be running at:
```link
👉 http://localhost:5000
```

##📬 Postman Collection

Import docs/BloggingPlatform.postman_collection.json into Postman.

Set up an Environment with variables:

baseUrl → http://localhost:5000/api

token → (empty initially)

First run the Login request. The token will automatically be stored.

Use the token for authorized requests (Posts, Comments, Tags).

🔑 Authentication & Roles

JWT authentication required for most endpoints

Roles:

admin → full access to everything

author → can manage only their own posts & comments

Public endpoints:

Register, Login, Get Posts (published only), Get Tags, Get Post by ID

📌 Endpoints
Auth
Register User

POST /api/users

Roles: Public

Body:

{
  "username": "john",
  "email": "john@example.com",
  "password": "123456",
  "role": "author"
}

Login

POST /api/login

Roles: Public

Body:

{
  "email": "john@example.com",
  "password": "123456"
}


Response:

{ "token": "JWT_TOKEN" }

Posts
Create Post

POST /api/posts

Roles: Authenticated (Author/Admin)

Requires: Bearer token

Body:

{
  "title": "My Post",
  "content": "This is my content",
  "status": "published",
  "tags": ["nodejs", "backend"]
}

Get All Posts

GET /api/posts

Roles: Public

Query params:

author=1

tag=nodejs

search=api

page=1&limit=5

Get Single Post

GET /api/posts/:id

Roles: Public

Note: Draft posts are only visible to the post owner or admins.

Update Post

PUT /api/posts/:id

Roles: Post owner or Admin

Delete Post

DELETE /api/posts/:id

Roles: Post owner or Admin

Comments
Create Comment

POST /api/comments

Roles: Any authenticated user

Body:

{
  "post_id": 1,
  "content": "Great post!"
}

Delete Comment

DELETE /api/comments/:id

Roles: Comment owner or Admin

Tags
Create Tag

POST /api/tags

Roles: Admin (or Author if allowed in your setup)

Body:

{ "name": "javascript" }

Get Tags

GET /api/tags

Roles: Public

📦 Database

Schema and example data included in:

docs/blogging_platform.sql


Import into PostgreSQL with:

psql -U postgres -d blogging_platform -f docs/blogging_platform.sql

📝 License

This project is for educational purposes only.
