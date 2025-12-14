# Sweet Shop Management System

A production ready full stack Sweet Shop Management System built with **Next.js App Router, Prisma, SQLite**, and **Tailwind CSS**, featuring **role based access control**, a modern **glassmorphism UI**, and a complete **Admin Panel** for managing users, sweets, and orders.

The application is deployed on Vercel and follows clean architecture, secure authentication practices, and scalable backend design.

---

## 📌 Project Overview

The Sweet Shop Management System allows users to browse and purchase sweets, while administrators manage inventory, users, and orders through a dedicated admin interface.

Authentication is handled using **JWT stored in cookies**, and authorization is strictly enforced at **both UI and API levels**.

The UI follows a consistent **pink purple gradient glassmorphism theme** across the Dashboard, Profile, Admin Panel, and modals to provide a modern and cohesive user experience.

---

## ✨ Features
### User Features

- Browse sweets with **name, category, price, and available stock**
- Select quantity and purchase sweets
- Purchase confirmation modal with **price breakdown**
- **Stock validation** before order placement
- Toast notifications for success and error states
- Orders persisted permanently in the database
- Profile page displaying **name, email, and role** with styled glass UI

### Admin Features

- Dedicated **Admin Panel** accessible only to admins
- Tab based navigation:
  - Users
  - Sweets
  - Orders
- Pagination with **10 records per page**
- Circular next and previous pagination buttons always visible
- Admin UI matches Profile styling (glassmorphism + gradient background)
- Tables rendered directly on background without cards
- Add, update, and delete sweets
- Edit and delete modals with validation and toast notifications
- Admin only APIs protected using `requireAuth` and `requireAdmin`
- Orders table includes:
  - userName
  - userEmail
  - userRole
  - sweetName
  - sweetCategory
  - pricePerUnit
  - quantity
  - totalPrice
  - createdAt

---

---

## 🖼️ Screenshots

### Register Page
<img width="1365" height="633" alt="image" src="https://github.com/user-attachments/assets/08c6a0d2-d77f-4083-8ce9-4cddad63025f" />

### Login Page
<img width="1365" height="630" alt="image" src="https://github.com/user-attachments/assets/8a20ae6e-45e1-42aa-89d2-911744eb40d8" />

### User Dashboard
<img width="1364" height="634" alt="image" src="https://github.com/user-attachments/assets/9e6f604b-c09a-4d74-9fc7-03e28893a70e" />

### Admin Dashboard
<img width="1350" height="632" alt="image" src="https://github.com/user-attachments/assets/fe55cee0-6e01-47d1-8138-a3cea58e84e3" />

### Admin Dashboard ( Page of Sweet Addition )
<img width="1352" height="633" alt="image" src="https://github.com/user-attachments/assets/024e9774-642c-4e49-b96f-1b679748f26d" />

### Admin Dashboard ( Page of Sweet Updation )
<img width="1350" height="629" alt="image" src="https://github.com/user-attachments/assets/e93430b8-d8be-4020-9442-43077e9069c7" />

### Admin Dashboard ( Page of Sweet Deletion )
<img width="1351" height="632" alt="image" src="https://github.com/user-attachments/assets/09bd285d-f2cb-4226-a4ef-b47d54e2e1ef" />

### Admin Panel – Orders
<img width="1348" height="632" alt="image" src="https://github.com/user-attachments/assets/8e8161c7-843a-481a-a994-dca9e838bee3" />

### Admin Panel – Sweet
<img width="1362" height="630" alt="image" src="https://github.com/user-attachments/assets/82094a6c-9c33-48fc-a561-18e04cbd6c67" />

### Admin Panel – Users
<img width="1365" height="633" alt="image" src="https://github.com/user-attachments/assets/954fc89f-cb5d-4ade-b2ba-c5968f87e57f" />

### Profile ( User + Admin )
<img width="1351" height="633" alt="image" src="https://github.com/user-attachments/assets/1dbc7028-7e89-4c76-a3a0-6f66fce9a5b3" />

### Dark Theme - Orders ( User )
<img width="1365" height="632" alt="image" src="https://github.com/user-attachments/assets/dcd36a15-22f4-468e-ad6d-7bb5c67a603f" />


---


## 🧰 Tech Stack
### Frontend

- Next.js App Router
- React
- Tailwind CSS
- Lucide Icons
  
### Backend
- Next.js API Routes
- Prisma ORM

### Database
- SQLite

### Authentication
- JWT based authentication
- Tokens stored securely in cookies

### Deployment
- Vercel

---

## 📁 Folder Structure

```
src/
├── app/
│   ├── api/
│   │   ├── admin/
│   │   │   ├── users/route.ts
│   │   │   ├── orders/route.ts
│   │   │   └── sweets/[id]/route.ts
│   │   ├── sweets/
│   │   │   ├── route.ts
│   │   │   └── [id]/purchase/route.ts
│   │   └── me/route.ts
│   ├── admin/page.tsx
│   ├── dashboard/page.tsx
│   ├── orders/page.tsx
│   ├── profile/page.tsx
│   └── login/page.tsx
│
├── components/
│   ├── Sidebar.tsx
│   ├── Navbar.tsx
│   ├── SweetCard.tsx
│   ├── admin/
│   │   ├── AddSweetModal.tsx
│   │   ├── EditSweetModal.tsx
│   │   └── DeleteSweetModal.tsx
│
├── lib/
│   ├── api.ts
│   ├── db.ts
│   └── jwt.ts
│
├── middleware/
│   ├── auth.middleware.ts
│   └── admin.middleware.ts
│
├── services/
│   └── sweet.service.ts
│
├── types/
│   ├── sweet.ts
│   └── user.ts
│
├── prisma/
│   └── schema.prisma
│
└── styles/
    └── globals.css

```

---

## 🗄️ Database Schema

### User

- id
- name
- email
- password
- role
- createdAt

### Sweet

- id
- name
- category
- price
- quantity
- createdAt

### Order

- id
- userId
- sweetId
- userName
- userEmail
- userRole
- sweetName
- sweetCategory
- pricePerUnit
- quantity
- totalPrice
- createdAt

---

## 🌐 API Endpoints

### Public
- `GET /api/sweets`
- `POST /api/sweets/:id/purchase`

### Auth Protected
- `GET /api/me`

### Admin Protected

- `POST /api/admin/sweets`
- `PUT /api/admin/sweets/:id`
- `DELETE /api/admin/sweets/:id`
- `GET /api/admin/users`
- `GET /api/admin/orders`

---

## 🔐 Authentication Flow

- User logs in and receives a JWT
- JWT is stored securely in cookies
- `requireAuth` validates the token from the request
- `requireAdmin` checks admin role from decoded JWT payload
- Both API routes and UI components enforce role based access

---

## ⚙️ Local Setup Instructions
### Clone the repository
```
git clone <repository-url>
cd sweet-shop
```

### Install dependencies
```
npm install
```

### Setup Prisma
```
npx prisma generate
npx prisma db push
```

### Start development server
```
npm run dev
```

---

## 🔑 Environment Variables

Create a `.env` file in the root directory:
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="your_jwt_secret"
```

---

## 🚀 Deployment to Vercel

- Push the project to GitHub
- Import the repository in Vercel
- Add environment variables:
  - DATABASE_URL
  - JWT_SECRET
- Deploy

Prisma with SQLite works seamlessly on Vercel for this setup.

---

## 🧪 Bug Fixes Completed

- Fixed duplicate card updates caused by object reference reuse
- Resolved Admin Panel disappearance on `/orders` route using token safety checks
- Properly handled foreign key delete constraints
- Fixed modal state desynchronization issues
- Standardized toast notification behavior
- Isolated pagination state to prevent cross tab conflicts

---

## 📌 Status

✅ Feature complete<br>
✅ Production ready<br>
✅ Secure and scalable<br>
✅ Deployed on Vercel<br>

---
