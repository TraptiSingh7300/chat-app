# Full-Stack Real-Time Chat Application

A clean, responsive real-time chat application built using **React (Vite)** for the frontend and **Node.js + Express + Socket.io** for the backend. 

---

## 🚀 Setup & Execution Instructions

Ensure you have [Node.js](https://nodejs.org/) installed on your computer before proceeding.

### 🔌 1. Backend Server Setup

1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
Install the necessary dependencies:

Bash
npm install
Boot up the Express & Socket.io server:

Bash
node server.js
💡 The backend instance will immediately spin up and run on http://localhost:3001

💻 2. Frontend Client Setup
Open a new, separate terminal window and navigate to the frontend folder:

Bash
cd frontend
Install the frontend package modules:

Bash
npm install
Run the Vite local development engine:

Bash
npm run dev
🌐 The interface will automatically deploy locally. Open your browser to http://localhost:5173 to use the application.

🌐 Environment Variables Required
For local development, values are explicitly hardcoded for zero configuration friction. However, for a production environment, configure a .env file in the root directories with the following structure:

Backend .env

PORT=3001
ALLOWED_ORIGIN=http://localhost:5173

Frontend .env

VITE_API_URL=http://localhost:3001

🛠️ Design Decisions
Hybrid Architecture (REST + WebSockets): Used standard REST HTTP methods (GET and POST) to manage durable interactions like bootstrapping past chat history on load and writing new items to storage. Concurrently, an isolated Socket.io channel handles real-time delivery and broadcast streams for typing states and message synchronization.

In-Memory Data Store: Leveraged a simple in-memory array runtime architecture within the Node instance to cache chat records. This addresses the persistence requirement perfectly across browser reloads without running into complex database dependencies under the 24-hour evaluation deadline.

Vite Tooling: Selected Vite over standard Create-React-App to keep build speeds, component mounting, and server refresh loops extremely rapid.

Embedded Single-File Styles: Encapsulated layout definitions directly inside the root application logic as structured JSON variables. This bypasses structural complexities from cascading style sheets (CSS) or Tailwind compilation chains.

📋 Assumptions Made
Local Network Scope: Assumed the evaluation environment resides within a standard machine instance, meaning network routes are safely mapped straight to localhost parameters rather than dynamic external web proxies.

Volatile Storage: Assumed an application memory array is sufficient to satisfy data persistence needs for evaluation purposes, though this means the message archive resets whenever the backend node server is closed or restarted.

Public Domain Rooms: Assumed a single unified public chat lounge matches the criteria specified by the prompt rather than a private room routing matrix.

🌟 Implemented Bonus Features
Username-Based Login: Integrated a simple gateway step to identify users across active sockets.

Real-Time Typing Indicator: Uses low-latency events (typing, stop_typing) with an idle-timeout routine to show when another user is composing a message.
