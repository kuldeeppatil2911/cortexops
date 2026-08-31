# Quick Start Guide - CortexOps

## 🚀 Get Running in 5 Minutes

### Step 1: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 2: Start Backend Server
```bash
npm run dev
```

You should see:
```
MongoDB Connected
Server running on port 5000
```

### Step 3: Install Frontend Dependencies (in a new terminal)
```bash
cd frontend
npm install
```

### Step 4: Start Frontend
```bash
npm start
```

The app will automatically open at `http://localhost:3000`

---

## ✨ Try It Out

1. **Create an Incident**
   - Type a title (e.g., "Server Down")
   - Add description (optional)
   - Select severity level
   - Click "Create Incident"

2. **View Incidents**
   - All incidents display in a grid
   - Most recent appear first

3. **Edit an Incident**
   - Click "Edit" on any incident
   - Change fields and click "Save"

4. **Delete an Incident**
   - Click "Delete"
   - Confirm deletion

---

## 🔧 If Something Goes Wrong

### Backend won't start
- Check `.env` file has `MONGO_URI`
- Verify port 5000 is free: `netstat -ano | findstr :5000` (Windows)
- Delete `node_modules` and run `npm install` again

### Frontend won't load
- Ensure backend is running first
- Clear browser cache (Ctrl+Shift+Delete)
- Check browser console for errors (F12)

### Can't connect to MongoDB
- Verify connection string in `.env`
- Check MongoDB Atlas cluster is running
- Ensure your IP is whitelisted in MongoDB Atlas

---

## 📁 File Structure Summary

```
cortexops/
├── backend/
│   ├── .env                 # Your MongoDB connection
│   ├── server.js            # Express app
│   ├── config/db.js         # Database connection
│   ├── model/Incident.js    # Data model
│   ├── routes/incidentRoutes.js  # API endpoints
│   └── package.json
│
├── frontend/
│   ├── src/App.js          # Main React component
│   ├── src/App.css         # Styling
│   └── package.json
│
└── README.md               # Full documentation
```

---

## 🎯 Key Features

✅ Create incidents with title, description, and severity  
✅ View all incidents in a clean grid layout  
✅ Edit incident details and status  
✅ Delete incidents with confirmation  
✅ Real-time UI updates  
✅ Color-coded severity and status  
✅ Fully responsive design  

---

## 📝 API Endpoints

All endpoints start with `http://localhost:5000/api/incidents/`

| Method | Endpoint | Action |
|--------|----------|--------|
| POST | / | Create incident |
| GET | / | Get all incidents |
| GET | /:id | Get single incident |
| PUT | /:id | Update incident |
| DELETE | /:id | Delete incident |

---

## 🎨 Color Scheme

**Severity:**
- 🟢 Low (Green)
- 🟠 Medium (Orange)
- 🔴 High (Red)

**Status:**
- 🔴 Open (Red)
- 🟠 In Progress (Orange)
- 🟢 Resolved (Green)

---

## 💡 Pro Tips

1. Always start the **backend first**, then frontend
2. Keep both terminals open to see logs
3. Use "Edit" to change status from Open → In Progress → Resolved
4. Each incident gets a unique MongoDB ID (`_id`)
5. Incidents are sorted by newest first

---

## 🆘 Need Help?

1. Check terminal output for error messages
2. Look at browser console (F12 → Console tab)
3. Verify .env file has correct MongoDB URI
4. Restart both backend and frontend
5. Read the full README.md for detailed docs

---

**You're all set! 🎉**
