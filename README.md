# 🚀 CortexOps Incident Management System

**A complete, production-ready full-stack incident management application built with Node.js/Express + React + MongoDB**

**STATUS: ✅ READY FOR DEPLOYMENT**  
**Local Status:** ✅ Running on localhost  
**Live Deployment:** 5 minutes away  

## ⚡ Quick Start

### Local Development (Already Running)
```bash
# Backend API
http://localhost:5000
http://localhost:5000/api/incidents

# Frontend UI
http://localhost:57826
```

### Deploy to Production
See **[COMPLETE-DEPLOYMENT-GUIDE.md](COMPLETE-DEPLOYMENT-GUIDE.md)** for live deployment in 5 minutes

### Key Deployment Command
```powershell
# Push to GitHub & deploy to Render.com
git push -u origin main
# Then follow 3-step Render deployment (see guide)
```

---

## ✨ Features

✅ **Create Incidents** - Report new incidents with title, description, and severity levels  
✅ **View All Incidents** - Display all incidents sorted by most recent  
✅ **Edit Incidents** - Update incident details and status  
✅ **Delete Incidents** - Remove incidents from the system  
✅ **Status Tracking** - Track incidents with Open, In Progress, and Resolved statuses  
✅ **Severity Levels** - Categorize by Low, Medium, and High severity  
✅ **Real-time Updates** - Instant UI updates on CRUD operations  

## Project Structure

```
cortexops/
├── backend/              # Node.js/Express server
│   ├── config/
│   │   └── db.js        # MongoDB connection
│   ├── model/
│   │   └── Incident.js  # Incident data model
│   ├── routes/
│   │   └── incidentRoutes.js  # API endpoints
│   ├── server.js         # Express server setup
│   ├── package.json      # Backend dependencies
│   └── .env             # Environment variables
│
└── frontend/             # React application
    ├── public/
    ├── src/
    │   ├── App.js       # Main React component
    │   ├── App.css      # Styling
    │   └── ...
    └── package.json     # Frontend dependencies
```

## Technology Stack

### Backend
- **Express.js** - REST API framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **CORS** - Cross-origin resource sharing
- **Dotenv** - Environment variable management

### Frontend
- **React 19** - UI library
- **React Hooks** - State management (useState, useEffect)
- **CSS3** - Styling with modern features

## Prerequisites

- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **MongoDB** - MongoDB Atlas account with connection string
- **Git** (optional)

## Installation & Setup

### 1. Backend Setup

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

The `.env` file is already configured with MongoDB connection:
```env
MONGO_URI=mongodb+srv://cortexops:kp29112004@cluster0.cglyv.mongodb.net/?appName=Cluster0
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

## Running the Application

### Start Backend Server

From the `backend` directory:

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The backend will run on **http://localhost:5000**

### Start Frontend Application

From the `frontend` directory:

```bash
npm start
```

The frontend will automatically open in your browser at **http://localhost:3000**

## API Endpoints

All endpoints are prefixed with `/api/incidents`

### Create Incident
- **POST** `/`
- Body:
  ```json
  {
    "title": "Database Connection Failed",
    "description": "Cannot connect to primary database",
    "severity": "High"
  }
  ```
- Response: Created incident object with `_id`, `status`, `createdAt`

### Get All Incidents
- **GET** `/`
- Response: Array of all incidents sorted by newest first

### Get Single Incident
- **GET** `/:id`
- Response: Specific incident details

### Update Incident
- **PUT** `/:id`
- Body:
  ```json
  {
    "title": "Updated Title",
    "description": "Updated description",
    "severity": "Medium",
    "status": "In Progress"
  }
  ```
- Response: Updated incident object

### Delete Incident
- **DELETE** `/:id`
- Response: Success message

## Usage

1. **Report an Incident**
   - Fill in the form with title, description, and severity
   - Click "Create Incident"

2. **View Incidents**
   - All incidents display in a grid layout
   - Shows title, description, severity, status, and timestamp

3. **Edit an Incident**
   - Click "Edit" button on any incident card
   - Modify the fields and click "Save"

4. **Delete an Incident**
   - Click "Delete" button
   - Confirm deletion when prompted

## Incident Schema

```javascript
{
  _id: ObjectId,
  title: String (required),
  description: String,
  severity: String (Low | Medium | High, default: Low),
  status: String (Open | In Progress | Resolved, default: Open),
  createdAt: Date (default: Date.now)
}
```

## Color Coding

### Severity Levels
- 🟢 **Low** - Green (#388e3c)
- 🟠 **Medium** - Orange (#f57c00)
- 🔴 **High** - Red (#d32f2f)

### Status
- 🔴 **Open** - Red (#d32f2f)
- 🟠 **In Progress** - Orange (#f57c00)
- 🟢 **Resolved** - Green (#388e3c)

## Troubleshooting

### Backend won't start
- Ensure MongoDB connection string is valid in `.env`
- Check if port 5000 is available
- Install dependencies: `npm install`

### Frontend won't connect to backend
- Verify backend is running on `http://localhost:5000`
- Check browser console for CORS errors
- Ensure frontend is running on `http://localhost:3000`

### Database connection issues
- Verify MongoDB Atlas credentials are correct
- Check internet connectivity
- Ensure IP whitelist includes your machine on MongoDB Atlas

## Development Scripts

### Backend
```bash
npm start      # Production mode
npm run dev    # Development mode with nodemon
```

### Frontend
```bash
npm start      # Start development server
npm run build  # Create production build
npm test       # Run tests
```

## Future Enhancements

- User authentication and authorization
- Incident assignment to team members
- Priority field and filtering
- Search functionality
- Incident categories/tags
- Notification system
- Analytics dashboard
- Export reports to CSV/PDF

## License

This project is open source and available under the MIT License.

## Support

For issues or questions, please check:
1. Backend error logs in terminal
2. Browser console for frontend errors
3. MongoDB Atlas cluster status
4. Network connectivity

---

**Happy incident tracking! 🚨**
