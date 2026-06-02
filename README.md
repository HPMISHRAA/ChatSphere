# ChatSphere 💬

ChatSphere is a modern, responsive, and fully-featured real-time messaging application. Built on the MERN stack with Socket.IO, it supports instant 1-on-1 conversations, group chats, and real-time active user presence.

This project was built to fulfill the requirements of a rigorous full-stack internship assignment, emphasizing clean architecture, real-time data flow, and a polished user interface.

## 🚀 Key Features

* **Real-Time Messaging:** Instant delivery using Socket.IO without page refreshes.
* **Group & 1-on-1 Chats:** Create rooms, add/remove members, and chat privately.
* **Active User Presence:** Real-time synchronization of "Online" and "Last Seen" status for all users.
* **Dynamic Member Count:** Group chat member counts update instantly across all clients when users join or leave.
* **Message Persistence:** All chats, users, and messages are permanently stored in MongoDB Atlas.
* **Typing Indicators:** See exactly when someone is currently typing a message to you.
* **Smart Notifications:** Real-time notification badges for unread messages while you are navigating other chats.
* **Responsive UI & Dark Mode:** A stunning, mobile-friendly interface built with Tailwind CSS, featuring seamless dark/light theme toggling.

## 💻 Tech Stack

**Frontend:**
* React.js
* Redux Toolkit (State Management)
* Tailwind CSS (Styling)
* Socket.IO-Client
* Axios

**Backend:**
* Node.js & Express.js
* MongoDB (Atlas Cloud) & Mongoose (ODM)
* Socket.IO (WebSockets)
* JSON Web Tokens (JWT) & bcryptjs (Authentication)

## 🛠️ Installation & Setup

Follow these steps to run the project locally on your machine.

### 1. Clone the repository
```bash
git clone https://github.com/HPMISHRAA/ChatSphere.git
cd ChatSphere
```

### 2. Backend Setup
Navigate to the server directory and install dependencies:
```bash
cd server
npm install
```

Create a `.env` file in the `server` directory and add the following:
```env
PORT=8000
MONGO_URL=your_mongodb_connection_string
SECRET=your_jwt_secret_key
BASE_URL=http://localhost:3000
```
Start the backend server:
```bash
npm start
```

### 3. Frontend Setup
Open a new terminal window, navigate to the client directory, and install dependencies:
```bash
cd clients
npm install
```

Create a `.env` file in the `clients` directory and add the following:
```env
REACT_APP_SERVER_URL=http://localhost:8000
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```
Start the frontend development server:
```bash
npm start
```

The application will now be running on `http://localhost:3000`.

## 📂 Project Structure

- `server/`: Contains the Express REST API, MongoDB connection logic, and Socket.IO real-time event handlers.
- `clients/src/`: Contains the React frontend, Redux state slices, API wrappers, and UI components.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📝 License

This project is licensed under the MIT License.
