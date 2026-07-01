import React, { useEffect, useState, useRef } from 'react';
import api from '../services/api';
import AdminLayout from './AdminLayout.jsx';

const emptyForm = {
  name: '', type: 'car', brand: '', model: '', year: '', pricePerDay: '',
  location: '', transmission: 'manual', fuelType: 'petrol', seats: 4,
  description: '', isAvailable: true, images: [],
};

export default function AdminVehicles() {
  const [vehicles,  setVehicles]  = useState([]);
  const [form,      setForm]      = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message,   setMessage]   = useState('');
  const fileRef = useRef();

  const load = async () => {
    const { data } = await api.get('/vehicles', { params: { limit: 100 } });
    setVehicles(data.vehicles);
  };

  useEffect(() => { load(); }, []);

  const uploadImages = async (files) => {
    if (!files.length) return;
    setUploading(true);
    setMessage('');
    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append('images', f));
      const { data } = await api.post('/upload/images', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm((prev) => ({ ...prev, images: [...prev.images, ...data.urls] }));
    } catch (err) {
      setMessage(err.response?.data?.message || 'Image upload failed');
    } finally { setUploading(false); }
  };

  const removeImage = (url) =>
    setForm((prev) => ({ ...prev, images: prev.images.filter((i) => i !== url) }));

  const submit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      if (editingId) await api.put(`/vehicles/${editingId}`, form);
      else           await api.post('/vehicles', form);
      setForm(emptyForm);
      setEditingId(null);
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Save failed');
    }
  };

  const edit = (v) => { setForm({ ...v }); setEditingId(v._id); window.scrollTo(0, 0); };

  const remove = async (id) => {
    if (!confirm('Delete this vehicle?')) return;
    await api.delete(`/vehicles/${id}`);
    load();
  };

  return (
    <AdminLayout>
      <h2>Manage Vehicles</h2>

      <form onSubmit={submit} className="admin-form">
        <input placeholder="Name" required value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          <option value="car">Car</option><option value="bike">Bike</option>
        </select>
        <input placeholder="Brand" required value={form.brand}
          onChange={(e) => setForm({ ...form, brand: e.target.value })} />
        <input placeholder="Model" value={form.model}
          onChange={(e) => setForm({ ...form, model: e.target.value })} />
        <input type="number" placeholder="Year" value={form.year}
          onChange={(e) => setForm({ ...form, year: e.target.value })} />
        <input type="number" placeholder="Price / day ($)" required value={form.pricePerDay}
          onChange={(e) => setForm({ ...form, pricePerDay: e.target.value })} />
        <input placeholder="Location" required value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })} />
        <select value={form.transmission} onChange={(e) => setForm({ ...form, transmission: e.target.value })}>
          <option value="manual">Manual</option><option value="automatic">Automatic</option>
        </select>
        <select value={form.fuelType} onChange={(e) => setForm({ ...form, fuelType: e.target.value })}>
          <option value="petrol">Petrol</option><option value="diesel">Diesel</option>
          <option value="electric">Electric</option><option value="hybrid">Hybrid</option>
        </select>
        <input type="number" placeholder="Seats" value={form.seats}
          onChange={(e) => setForm({ ...form, seats: e.target.value })} />
        <textarea placeholder="Description" value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <label>
          <input type="checkbox" checked={form.isAvailable}
            onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })} />
          Available
        </label>

        {/* Image upload */}
        <div className="image-upload-box" style={{ gridColumn: '1/-1' }}>
          <p><strong>Images</strong></p>
          <div className="image-previews">
            {form.images.map((url) => (
              <div key={url} className="img-preview-wrap">
                <img src={url} alt="" className="img-preview" />
                <button type="button" className="img-remove" onClick={() => removeImage(url)}>✕</button>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => fileRef.current.click()} disabled={uploading}>
            {uploading ? 'Uploading…' : '+ Add Images'}
          </button>
          <input type="file" multiple accept="image/*" ref={fileRef} style={{ display: 'none' }}
            onChange={(e) => uploadImages(e.target.files)} />
        </div>

        <button type="submit" className="btn-primary">{editingId ? 'Update' : 'Add'} Vehicle</button>
        {editingId && <button type="button" onClick={() => { setForm(emptyForm); setEditingId(null); }}>Cancel</button>}
      </form>
      {message && <p className="error">{message}</p>}

      <table className="table">
        <thead>
          <tr><th>Image</th><th>Name</th><th>Type</th><th>Price/day</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {vehicles.map((v) => (
            <tr key={v._id}>
              <td>{v.images?.[0] ? <img src={v.images[0]} alt="" style={{ width: 70, borderRadius: 4 }} /> : '—'}</td>
              <td>{v.name}</td><td>{v.type}</td><td>${v.pricePerDay}</td>
              <td>{v.isAvailable ? '✅' : '❌'}</td>
              <td>
                <button onClick={() => edit(v)}>Edit</button>
                <button onClick={() => remove(v._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminLayout>
  );
}
