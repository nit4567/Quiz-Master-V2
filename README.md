
# 📘 Quiz Master – Online Assessment Platform

### 👨‍💻 Developed by: **Nitish Rishi**

🎓 Dual Degree Student, Agricultural and Food Engineering – IIT Kharagpur
📚 Online Data Science Program – IIT Madras
📧 [22f3000645@ds.study.iitm.ac.in](mailto:22f3000645@ds.study.iitm.ac.in)

---

## 🧠 Overview

**Quiz Master** is a full-stack quiz management platform for students and administrators. It supports secure login, course-wise quiz management, and detailed performance analytics. Built with scalability and usability in mind, it offers both a smooth user experience and robust backend architecture.

🎥 **Demo Video**: [Watch here](https://drive.google.com/file/d/19T0Zkb0U4acLIP2Kh9wY6ynpZZu-20M_/view?usp=sharing)
📄 Project Report: [View detailed report](https://docs.google.com/document/d/1nHEgetal6wyZPFINP_F7zGIE9BOkXBgbBg3ykr1YO9M/edit?usp=sharing)

---

## 🚀 Features

* 🔐 JWT-based secure login with role-based access (admin/student)
* 🧩 Structured curriculum with subjects and chapters
* 📝 Interactive MCQ quizzes with scoring
* 📊 Real-time feedback and analytics with Chart.js
* 📤 Background task handling (reporting, emails) using Celery + Redis
* 🌐 Responsive Vue.js frontend for a smooth experience

---

## 🛠️ Project Setup

Follow these steps to set up the project locally.

### 1. 🔧 Clone the Repository

```bash
git clone <repo-url>
cd quiz-master
```

### 2. 🐍 Set Up Virtual Environment

```bash
python3 -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
```

### 3. 📦 Install Dependencies

```bash
pip install -r requirements.txt
```


### 4. ▶️ Run the Flask App

```bash
flask run
```

The app will be available at `http://127.0.0.1:5000/`

---

### 5. 🟢 Run Redis Server

Make sure Redis is installed and running.

```bash
redis-server
```

### 6. 📬 Start Celery Worker

```bash
celery -A app.celery worker --loglevel=info
```

### 7. 📩 Start Celery Beat (For Scheduled Tasks)

```bash
celery -A app.celery beat --loglevel=info
```

---

## 🧩 Tech Stack

| Layer           | Technology                           |
| --------------- | ------------------------------------ |
| Backend         | Flask, Flask-RESTful, Flask-Security |
| Frontend        | Vue.js (CDN-based)                   |
| Database        | SQLite, SQLAlchemy ORM               |
| Caching         | Redis                                |
| Background Jobs | Celery                               |
| Visualization   | Chart.js                             |
| Emailing        | Flask-Mail (SMTP via Gmail)          |

---

## 🗃️ Database Design Highlights

* Users & Roles (RBAC)
* Subject-Chapter-Quiz hierarchy
* Quiz → Questions (MCQs)
* Score tracking (correct/incorrect, time)
* Extensible schema for analytics

---

This project showcases:

* 🔁 End-to-end full-stack web development
* 🔒 Secure JWT authentication & RBAC
* ⚙️ REST API architecture
* 📉 Frontend data visualization
* ⏱️ Async processing (Celery + Redis)
* 📬 Email integration and real-time notifications

---

## 🔗 Contact

📧 Email: [22f3000645@ds.study.iitm.ac.in](mailto:22f3000645@ds.study.iitm.ac.in)
🌐 https://www.linkedin.com/in/nitish-rishi-2b9b84251/ 

