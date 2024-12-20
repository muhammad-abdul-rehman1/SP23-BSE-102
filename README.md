# E-commerce Platform

## Purpose
This project is a full-featured e-commerce platform built to provide user and admin functionalities, powered by Node.js and MongoDB.

## Features
- **User Role**: 
  - By default, users signing up are assigned the "user" role. 
  - Users can log in and access the product catalog, cart, and order functionality.
- **Admin Role**: 
  - The admin role is manually assigned in the MongoDB database (`authenticatorapp` → `user` collection).  
  - Admins have access to the admin panel for managing platform operations.

## Setup
1. Clone the repository.  
2. Run `npm install` to install all required Node.js dependencies.  
3. Ensure MongoDB is running and connected. The database `authenticatorapp` should contain the `user` collection.  
4. Assign roles in the database:
   - Default role for new users: `user`.
   - To access the admin panel, manually update the `role` field in the `user` collection to `admin`.

## Usage
1. **User Role**:
   - Log in to view the product catalog.
   - Add items to the cart and place orders.  
2. **Admin Role**:
   - After assigning the admin role in the database, access the admin panel to manage products and orders.

### Navigation
- **Navbar**:
  - Includes sections for Products, Cart, and Orders.

## Technologies
- **Backend**: Node.js, Express.js
- **Frontend**: JavaScript
- **Database**: MongoDB

## Notes
- Ensure proper user roles are set in the database for role-specific functionalities.
- Admin functionality is not available by default and must be manually configured.

---
