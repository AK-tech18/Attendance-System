# 📚 Attendance System

A full-stack web application for managing student attendance with both **Frontend (React + Vite)** and **Backend (Node + Express + MySQL)**.

---

## 🚀 Features

### ⭐ Frontend (student-ui)
- Clean and responsive UI  
- Student login  
- Attendance view page  
- Class selection  
- Fetches real-time data from backend  
- Built using:
  - React  
  - Vite  
  - Tailwind CSS  
  - JavaScript  

### ⭐ Backend
- REST API for attendance management  
- Routes for:
  - Student login  
  - Marking attendance  
  - Viewing attendance  
- Built using:
  - Node.js  
  - Express.js  
  - MySQL  

---

## 🛠️ Tech Stack

| Layer      | Technology                 |
|------------|-----------------------------|
| Frontend   | React, Vite, Tailwind CSS   |
| Backend    | Node.js, Express.js         |
| Database   | MySQL                       |
| Tools      | Git, GitHub                 |

---

## 📂 Project Structure

Attendance-System/
│
├── backend/ # Node + Express + MySQL backend
│ ├── routes/
│ ├── controllers/
│ ├── db/
│ └── package.json
│
└── student-ui/ # React + Vite frontend
├── src/
├── public/
├── vite.config.js
└── package.json

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the repository
```bash
git clone https://github.com/AK-tech18/Attendance-System.git
cd Attendance-System
2️⃣ Setup Backend
cd backend
npm install
npm start
## reate a .env file inside backend:

PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASS=yourpassword
DB_NAME=attendance_db
JWT_SECRET=your_secret_here

 Make sure MySQL is running.
3️⃣ Setup Frontend
cd student-ui
npm install
npm run dev

🔑 Environment Variables (Backend)
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASS=yourpassword
DB_NAME=attendance_db
JWT_SECRET=your_secret_here

 👤 Author

Aditya Kaushal
GitHub: https://github.com/AK-tech18

Email: kaushals.aditya1@gmail.com

🤝 Contributing

Pull requests are welcome!

📜 License

This project is open-source and free to use.

---

# ✔ Your README is now ready  
If you want, I can also make:

✅ A more colorful README  
✅ One with badges (React, Express, MySQL, GitHub)  
✅ Add screenshots automatically  
✅ Add installation diagram / architecture diagram  

Just tell me — I’ll generate it for you.
