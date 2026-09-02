import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import './App.css';

function App() {
  const [incidents, setIncidents] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    raisedBy: '',
    description: '',
    severity: 'Low',
    knowledgeBase: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [agentQuestion, setAgentQuestion] = useState('');
  const [agentAnswer, setAgentAnswer] = useState('Ask about triage, status, or an incident.');

  const API_BASE = `${process.env.REACT_APP_API_BASE_URL || ''}/api/incidents`;
  const SOCKET_URL = process.env.REACT_APP_WS_URL || window.location.origin;

  // Fetch all incidents
  useEffect(() => {
    const loadIncidents = async () => {
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

    loadIncidents();
  }, [API_BASE]);

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socket.on('connect', () => setRealtimeConnected(true));
    socket.on('disconnect', () => setRealtimeConnected(false));
    socket.on('incident:created', (incident) => {
      setIncidents((current) => [incident, ...current.filter((item) => item._id !== incident._id)]);
    });
    socket.on('incident:updated', (incident) => {
      setIncidents((current) => current.map((item) => item._id === incident._id ? incident : item));
    });
    socket.on('incident:deleted', ({ id }) => {
      setIncidents((current) => current.filter((item) => item._id !== id));
    });

    return () => socket.disconnect();
  }, [SOCKET_URL]);

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
      setFormData({ title: '', raisedBy: '', description: '', severity: 'Low', knowledgeBase: '' });
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

  const visibleIncidents = incidents.filter((incident) => {
    const matchesStatus = statusFilter === 'All' || incident.status === statusFilter;
    const searchableText = `${incident.title} ${incident.description || ''}`.toLowerCase();
    return matchesStatus && searchableText.includes(searchTerm.toLowerCase());
  });

  const openCount = incidents.filter((incident) => incident.status === 'Open').length;
  const inProgressCount = incidents.filter((incident) => incident.status === 'In Progress').length;
  const resolvedCount = incidents.filter((incident) => incident.status === 'Resolved').length;
  const matchesIncident = (incident) => {
    const matchesStatus = statusFilter === 'All' || incident.status === statusFilter;
    const searchableText = `${incident.title} ${incident.description || ''} ${incident.knowledgeBase || ''}`.toLowerCase();
    return matchesStatus && searchableText.includes(searchTerm.toLowerCase());
  };
  const activeIncidents = incidents.filter((incident) => incident.status !== 'Resolved' && matchesIncident(incident));
  const resolvedIncidents = incidents.filter((incident) => incident.status === 'Resolved' && matchesIncident(incident));
  const incidentGroups = [
    { title: 'Active queue', count: activeIncidents.length, items: activeIncidents },
    { title: 'Resolved archive', count: resolvedIncidents.length, items: resolvedIncidents }
  ];

  const getAgentGuidance = () => {
    if (statusFilter === 'Resolved') return { title: 'Closeout checklist', body: 'Capture the fix, confirm monitoring is green, and link the knowledge-base note before closing the record.' };
    if (statusFilter === 'In Progress') return { title: 'Investigation mode', body: 'Record the current hypothesis, add evidence to the knowledge base, and update the status when the next action is clear.' };
    return { title: 'Triage assistant', body: 'Start with impact, scope, and the next safe action. High-severity incidents should be acknowledged quickly and documented as you investigate.' };
  };
  const agentGuidance = getAgentGuidance();
  const answerAgent = (question) => {
    const normalizedQuestion = question.toLowerCase();
    const highPriorityCount = incidents.filter((incident) => incident.severity === 'High' && incident.status !== 'Resolved').length;
    if (normalizedQuestion.includes('high') || normalizedQuestion.includes('urgent')) {
      return `${highPriorityCount} high-severity incident${highPriorityCount === 1 ? '' : 's'} need attention. Acknowledge impact, assign an owner, and record the first mitigation step in the knowledge base.`;
    }
    if (normalizedQuestion.includes('resolve') || normalizedQuestion.includes('close')) {
      return `To resolve an incident, choose Resolved, enter your name, add the reason for the status change, and confirm the recovery evidence in its knowledge-base note.`;
    }
    if (normalizedQuestion.includes('status') || normalizedQuestion.includes('progress')) {
      return `${openCount} open and ${inProgressCount} in progress. Move an incident to In Progress only after recording who is taking ownership and why.`;
    }
    if (normalizedQuestion.includes('knowledge') || normalizedQuestion.includes('runbook') || normalizedQuestion.includes('fix')) {
      return 'Use the knowledge-base note for the verified fix, useful commands, evidence, and prevention steps. Keep it short enough for the next responder to act on.';
    }
    return `There are ${incidents.length} incidents in the queue. Start with impact and scope, then document the next action. You can ask me about high priority, status, resolution, or the knowledge base.`;
  };
  const handleAgentQuestion = (event) => {
    event.preventDefault();
    setAgentAnswer(answerAgent(agentQuestion));
  };
  const handleAgentInput = (event) => {
    const question = event.target.value;
    setAgentQuestion(question);
    if (question.trim()) setAgentAnswer(answerAgent(question));
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="brand-mark">CO</div>
        <div>
          <p className="eyebrow">OPERATIONS CONTROL CENTER</p>
          <h1>CortexOps <span>Incident Management</span></h1>
        </div>
        <div className={`header-status ${realtimeConnected ? 'is-live' : ''}`}><span /> {realtimeConnected ? 'Live updates on' : 'Connecting live feed'}</div>
      </header>

      <div className="container">
        <section className="hero-row">
          <div>
            <p className="eyebrow accent">LIVE OVERVIEW / {new Date().toLocaleDateString()}</p>
            <h2>Keep every incident moving.</h2>
            <p className="hero-copy">A focused command center for your team to report, triage, and close operational risk.</p>
          </div>
          <div className="hero-note"><strong>24/7</strong><span>Operational visibility</span></div>
        </section>

        {error && <div className="error-message"><strong>Action needed</strong>{error}</div>}

        <section className="stats-grid" aria-label="Incident summary">
          <div className="stat-card stat-total"><span>Total incidents</span><strong>{incidents.length}</strong><small>All reported events</small></div>
          <div className="stat-card stat-open"><span>Open</span><strong>{openCount}</strong><small>Needs attention</small></div>
          <div className="stat-card stat-progress"><span>In progress</span><strong>{inProgressCount}</strong><small>Being investigated</small></div>
          <div className="stat-card stat-resolved"><span>Resolved</span><strong>{resolvedCount}</strong><small>Closed successfully</small></div>
        </section>

        <section className="workspace-grid">
        <div className="form-section">
          <div className="section-heading"><div><p className="eyebrow accent">NEW EVENT</p><h2>Report incident</h2></div><span className="step-count">01</span></div>
          <form onSubmit={handleCreateIncident}>
            <label><span>Incident title <b className="required-mark">*</b></span><input
              type="text"
              name="title"
              placeholder="Incident Title"
              value={formData.title}
              onChange={handleInputChange}
              required
            /></label>
            <label><span>Raised by <b className="required-mark">*</b></span><input
              type="text"
              name="raisedBy"
              placeholder="Your name"
              value={formData.raisedBy}
              onChange={handleInputChange}
              required
            /></label>
            <label>What happened?<textarea
              name="description"
              placeholder="Description (optional)"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
            /></label>
            <label>Knowledge base note<textarea
              name="knowledgeBase"
              placeholder="Runbook, fix, or prevention note"
              value={formData.knowledgeBase}
              onChange={handleInputChange}
              rows="3"
            /></label>
            <label><span>Severity <b className="required-mark">*</b></span><select
              name="severity"
              value={formData.severity}
              onChange={handleInputChange}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select></label>
            <button type="submit" className="btn-primary"><span>+</span> Create incident</button>
          </form>
        </div>

        <aside className="agent-panel">
          <div className="agent-avatar">AI</div>
          <p className="eyebrow accent">OPS GUIDE</p>
          <h2>{agentGuidance.title}</h2>
          <p>{agentGuidance.body}</p>
          <div className="agent-answer"><span>LIVE ANSWER</span><p>{agentAnswer}</p></div>
          <form className="agent-form" onSubmit={handleAgentQuestion}><input aria-label="Ask operations assistant" value={agentQuestion} onChange={handleAgentInput} placeholder="Ask the ops agent..." /><button type="submit" title="Ask operations agent">Ask</button></form>
          <div className="agent-steps"><span>01</span><span>Assess impact</span><span>02</span><span>Document evidence</span><span>03</span><span>Confirm recovery</span></div>
        </aside>

        <div className="incidents-section">
          <div className="section-heading list-heading"><div><p className="eyebrow accent">INCIDENT QUEUE</p><h2>Recent activity <span>{visibleIncidents.length}</span></h2></div><button className="refresh-button" onClick={() => window.location.reload()} title="Refresh incidents">↻ <span>Refresh</span></button></div>
          <div className="filters">
            <div className="search-wrap"><span>⌕</span><input aria-label="Search incidents" placeholder="Search incidents..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} /></div>
            <select aria-label="Filter by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option>All</option><option>Open</option><option>In Progress</option><option>Resolved</option></select>
          </div>
          {loading ? (
            <div className="empty-state"><span className="loading-dot" /> Loading incident queue...</div>
          ) : visibleIncidents.length === 0 ? (
            <div className="empty-state"><strong>{incidents.length ? 'No matching incidents' : 'No incidents reported yet'}</strong><span>Try another filter or create a new event.</span></div>
          ) : (
            <div className="queue-groups">
              {incidentGroups.map((group) => group.items.length > 0 && <section className="queue-group" key={group.title}>
                <div className="queue-group-heading"><h3>{group.title}</h3><span>{group.count}</span></div>
                <div className="incidents-grid">
              {group.items.map(incident => (
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
                      <textarea
                        name="knowledgeBase"
                        placeholder="Knowledge base note"
                        value={editingData.knowledgeBase || ''}
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
                      {editingData.status !== incident.status && <>
                        <label><span>Status changed by <b className="required-mark">*</b></span><input
                          type="text"
                          name="statusChangedBy"
                          placeholder="Name of person changing status"
                          value={editingData.statusChangedBy || ''}
                          onChange={handleEditChange}
                          required
                        /></label>
                        <label><span>Why change status? <b className="required-mark">*</b></span><textarea
                          name="statusChangeReason"
                          placeholder="Why is the status changing?"
                          value={editingData.statusChangeReason || ''}
                          onChange={handleEditChange}
                          rows="2"
                          required
                        /></label>
                      </>}
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
                      <div className="incident-owner"><span>Raised by</span><strong>{incident.raisedBy || 'Legacy record'}</strong></div>
                      {incident.knowledgeBase && <div className="knowledge-base"><span>KB</span><p>{incident.knowledgeBase}</p></div>}
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
                      {incident.statusChangedBy && <p className="status-audit">Status changed by <strong>{incident.statusChangedBy}</strong>: {incident.statusChangeReason}</p>}
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
              </section>)}
            </div>
          )}
        </div>
        </section>
      </div>
    </div>
  );
}

export default App;
