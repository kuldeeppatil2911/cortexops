import React, { useState } from 'react';

const EMPTY_SERVICE = {
  name: '',
  description: '',
  environment: 'Production',
  endpoint: '',
  owner: '',
  status: 'Unknown',
  dependencies: ''
};

function ServiceStatus({ status }) {
  return <span className={`service-status service-${status.toLowerCase()}`}><i />{status}</span>;
}

export default function ServiceRegistry({ services, onCreate, onUpdate, onDelete }) {
  const [form, setForm] = useState(EMPTY_SERVICE);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const updateField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const reset = () => { setForm(EMPTY_SERVICE); setEditingId(null); setError(''); };
  const submit = async (event) => {
    event.preventDefault();
    try {
      const payload = { ...form, dependencies: form.dependencies.split(',').map((value) => value.trim()).filter(Boolean) };
      if (!payload.name || !payload.endpoint || !payload.owner) throw new Error('Name, endpoint, and owner are required.');
      if (editingId) await onUpdate(editingId, payload);
      else await onCreate(payload);
      reset();
    } catch (err) { setError(err.message); }
  };
  const edit = (service) => setForm({ ...service, dependencies: (service.dependencies || []).join(', ') });

  return <div className="service-registry">
    <section className="registry-summary"><div><p className="kicker">SERVICE CATALOG</p><h3>Know what CortexOps is watching.</h3><p>Register monitored services, owners, endpoints, and dependencies. Health checks will use this registry in the next phase.</p></div><div className="registry-count"><strong>{services.length}</strong><span>registered services</span></div></section>
    {error && <div className="error-banner"><strong>Unable to save service</strong><span>{error}</span></div>}
    <section className="panel service-form-panel"><div className="panel-title"><div><p className="kicker">{editingId ? 'EDIT SERVICE' : 'REGISTER SERVICE'}</p><h3>{editingId ? 'Update service record' : 'Add a monitored service'}</h3></div><span>Required fields marked <b className="required-mark">*</b></span></div><form className="service-form" onSubmit={submit}><label>Service name <b className="required-mark">*</b><input name="name" value={form.name} onChange={updateField} placeholder="Payment Service" required /></label><label>Owner <b className="required-mark">*</b><input name="owner" value={form.owner} onChange={updateField} placeholder="Platform Team" required /></label><label>Health endpoint <b className="required-mark">*</b><input name="endpoint" value={form.endpoint} onChange={updateField} placeholder="https://service.example.com/health" required /></label><label>Environment<select name="environment" value={form.environment} onChange={updateField}><option>Production</option><option>Staging</option><option>Development</option></select></label><label>Status<select name="status" value={form.status} onChange={updateField}><option>Unknown</option><option>Healthy</option><option>Degraded</option><option>Unhealthy</option></select></label><label>Dependencies<input name="dependencies" value={form.dependencies} onChange={updateField} placeholder="Redis, PostgreSQL" /></label><label className="wide-field">Description<textarea name="description" value={form.description} onChange={updateField} placeholder="What this service does" rows="2" /></label><div className="service-form-actions"><button className="primary-button" type="submit">{editingId ? 'Save changes' : 'Register service'} <b>→</b></button>{editingId && <button className="secondary-button" type="button" onClick={reset}>Cancel</button>}</div></form></section>
    <section className="panel registry-list"><div className="panel-title"><div><p className="kicker">REGISTERED SERVICES</p><h3>Service inventory</h3></div><span>{services.length} total</span></div>{services.length === 0 ? <div className="empty-state"><span className="empty-mark">+</span><strong>No services registered</strong><p>Add your first endpoint to prepare health monitoring.</p></div> : <div className="service-table">{services.map((service) => <article className="service-row" key={service._id}><div className="service-symbol">{service.name.slice(0, 2).toUpperCase()}</div><div className="service-main"><div><h4>{service.name}</h4><ServiceStatus status={service.status} /></div><p>{service.description || 'No description provided.'}</p><small>{service.environment} · Owner: {service.owner}</small></div><div className="service-endpoint"><span>HEALTH ENDPOINT</span><code>{service.endpoint}</code><small>Depends on: {(service.dependencies || []).join(', ') || 'No dependencies listed'}</small></div><div className="service-actions"><button onClick={() => { setEditingId(service._id); edit(service); }}>Edit</button><button className="danger-action" onClick={() => onDelete(service._id)}>Delete</button></div></article>)}</div>}</section>
  </div>;
}
