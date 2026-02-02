# Full-Stack Weather Insights Application

A lightweight weather dashboard built using **Vanilla Java** for the backend and **React** for the frontend, demonstrating a modular "No-Build" architecture.

## 🌟 Architectural Features
- **Modular Frontend:** React components are decoupled into independent files (`/components`) and managed via global scope—proving clean code principles without a complex build tool like Vite.
- **Vanilla Java Backend:** A custom HTTP server built using `com.sun.net.httpserver` to handle API routing and static asset delivery.
- **Dynamic UI:** Powered by **Tailwind CSS** and **Google Fonts (Inter)** for a modern, responsive user experience.

## 🛠️ Tech Stack
- **Backend:** Java 17+
- **Frontend:** React 18 (CDN), Tailwind CSS, Babel
- **API:** Open-Meteo (Geocoding & Forecast)

## 🚀 How to Run
1. Clone the repository.
2. Open the project in **IntelliJ IDEA**.
3. Run `WeatherServer.java`.
4. Visit `http://localhost:8000` in your browser.

## 📂 Project Highlights
The project illustrates how to manage **state**, **props**, and **asynchronous API calls** in React while handling **HTTP requests** and **file I/O** in Java.

## 📂 Project Structure
```text
WeatherApp/ (Root)
├── .gitignore
├── README.md
├── backend/
│   └── src/
│       └── WeatherServer.java
└── frontend/
    ├── components/
    │   ├── Header.js
    │   ├── SearchBar.js
    │   └── WeatherResult.js
    ├── index.html
    ├── style.css
    └── app.js


 

    

 

