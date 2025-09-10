# Metier Customer Experience App

This is a full-stack application for managing customer orders, products, and admin tasks. It includes a Python backend and a React frontend, with support for fitment data, CSV imports, and more.

---

## 🔧 Project Structure

```
metier-cx-app/
├── backend/              # Python Flask API
│   ├── src/
│   ├── requirements.txt
│   └── static/           # Public assets (e.g., index.html)
│
├── frontend/             # React app (Git submodule removed)
│
├── docs/                 # Requirements, templates, internal docs
│   ├── metier_cx_app_requirements.pdf
│   ├── aliases_template.csv
│   ├── fitment_template.csv
│   └── products_template.csv
│
└── .env.example          # Sample environment variables
```

---

## 🚀 Getting Started

### Backend (Flask)

1. **Create a virtual environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

2. **Install dependencies**
   ```bash
   pip install -r backend/requirements.txt
   ```

3. **Run the backend server**
   ```bash
   python backend/src/main.py
   ```

---

### Frontend (React)

1. **Navigate to frontend folder**
   ```bash
   cd metier-cx-app/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the React dev server**
   ```bash
   npm start
   ```

---

## ⚙️ Environment Setup

Use the `.env.example` file to create your `.env`:

```bash
cp .env.example .env
```

Make sure to fill in any real API keys or DB URLs as needed.

---

## 📂 Docs

Documentation and data templates live in the `docs/` folder:

- `metier_cx_app_requirements.pdf`: Full requirements document
- CSV templates for importing aliases, fitments, and products

---

## ✅ To Do (Optional Enhancements)

- Add Docker support for easy deployment
- Create Postman collection for backend API testing
- Add CI/CD via GitHub Actions
- Write unit tests for key backend logic

---

## 📄 License

This project is licensed for internal use. For external distribution or commercial usage, contact the repository owner.
