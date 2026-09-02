import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [incidents, setIncidents] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'Low'
  });
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_BASE = `${process.env.REACT_APP_API_BASE_URL || ''}/api/incidents`;

  // Fetch all incidents
  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_BASE);
      const data = await response.json();
      setIncidents(data);
      setError('');
    } catch (err) {
      setError('Failed to fetch incidents');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle edit input change
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Create new incident
  const handleCreateIncident = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to create incident');

      const newIncident = await response.json();
      setIncidents([newIncident, ...incidents]);
      setFormData({ title: '', description: '', severity: 'Low' });
      setError('');
    } catch (err) {
      setError('Error creating incident: ' + err.message);
    }
  };

  // Start editing
  const handleStartEdit = (incident) => {
    setEditingId(incident._id);
    setEditingData({ ...incident });
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingData({});
  };

  // Update incident
  const handleUpdateIncident = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingData)
      });

      if (!response.ok) throw new Error('Failed to update incident');

      const updatedIncident = await response.json();
      setIncidents(incidents.map(inc => inc._id === id ? updatedIncident : inc));
      setEditingId(null);
      setEditingData({});
      setError('');
    } catch (err) {
      setError('Error updating incident: ' + err.message);
    }
  };

  // Delete incident
  const handleDeleteIncident = async (id) => {
    if (window.confirm('Are you sure you want to delete this incident?')) {
      try {
        const response = await fetch(`${API_BASE}/${id}`, {
          method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete incident');

        setIncidents(incidents.filter(inc => inc._id !== id));
        setError('');
      } catch (err) {
        setError('Error deleting incident: ' + err.message);
      }
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'High': return '#d32f2f';
      case 'Medium': return '#f57c00';
      case 'Low': return '#388e3c';
      default: return '#666';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return '#d32f2f';
      case 'In Progress': return '#f57c00';
      case 'Resolved': return '#388e3c';
      default: return '#666';
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚨 CortexOps Incident Management System</h1>
      </header>

      <div className="container">
        {error && <div className="error-message">{error}</div>}

        {/* Create Incident Form */}
        <div className="form-section">
          <h2>Report New Incident</h2>
          <form onSubmit={handleCreateIncident}>
            <input
              type="text"
              name="title"
              placeholder="Incident Title"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
            <textarea
              name="description"
              placeholder="Description (optional)"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
            />
            <select
              name="severity"
              value={formData.severity}
              onChange={handleInputChange}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
            <button type="submit" className="btn-primary">Create Incident</button>
          </form>
        </div>

        {/* Incidents List */}
        <div className="incidents-section">
          <h2>Incidents ({incidents.length})</h2>
          {loading ? (
            <p>Loading incidents...</p>
          ) : incidents.length === 0 ? (
            <p className="no-incidents">No incidents reported yet</p>
          ) : (
            <div className="incidents-grid">
              {incidents.map(incident => (
                <div key={incident._id} className="incident-card">
                  {editingId === incident._id ? (
                    // Edit Mode
                    <div className="edit-form">
                      <input
                        type="text"
                        name="title"
                        value={editingData.title}
                        onChange={handleEditChange}
                      />
                      <textarea
                        name="description"
                        value={editingData.description}
                        onChange={handleEditChange}
                        rows="2"
                      />
                      <select
                        name="severity"
                        value={editingData.severity}
                        onChange={handleEditChange}
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                      <select
                        name="status"
                        value={editingData.status}
                        onChange={handleEditChange}
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                      <div className="button-group">
                        <button
                          className="btn-success"
                          onClick={() => handleUpdateIncident(incident._id)}
                        >
                          Save
                        </button>
                        <button
                          className="btn-cancel"
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <>
                      <h3>{incident.title}</h3>
                      <p>{incident.description || 'No description'}</p>
                      <div className="incident-meta">
                        <span
                          className="badge severity"
                          style={{ backgroundColor: getSeverityColor(incident.severity) }}
                        >
                          {incident.severity} Severity
                        </span>
                        <span
                          className="badge status"
                          style={{ backgroundColor: getStatusColor(incident.status) }}
                        >
                          {incident.status}
                        </span>
                      </div>
                      <p className="date">
                        {new Date(incident.createdAt).toLocaleString()}
                      </p>
                      <div className="button-group">
                        <button
                          className="btn-edit"
                          onClick={() => handleStartEdit(incident)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDeleteIncident(incident._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
