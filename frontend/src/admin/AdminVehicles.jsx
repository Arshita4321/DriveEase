import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiEdit2, FiPlus, FiSearch, FiTrash2, FiTruck, FiUploadCloud, FiX } from 'react-icons/fi';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Select from '../components/ui/Select';
import Skeleton from '../components/ui/Skeleton';
import useDebounce from '../hooks/useDebounce';
import api from '../services/api';

const emptyForm = {
  name: '', type: 'car', brand: '', model: '', year: '', pricePerDay: '',
  location: '', transmission: 'manual', fuelType: 'petrol', seats: 4,
  fuelEfficiency: 15, description: '', images: [], isAvailable: true,
  weekendSurcharge: 0, weeklyDiscount: 0, monthlyDiscount: 0,
};

export default function AdminVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search, 400);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const load = () => {
    setLoading(true);
    api
      .get('/vehicles', { params: { search: debounced, limit: 100 } })
      .then(({ data }) => setVehicles(data.vehicles || []))
      .finally(() => setLoading(false));
  };

  useEffect(load, [debounced]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (v) => {
    setEditing(v);
    setForm({ ...emptyForm, ...v });
    setModalOpen(true);
  };

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append('images', f));
      const { data } = await api.post('/upload/images', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm((f) => ({ ...f, images: [...f.images, ...data.urls] }));
      toast.success('Images uploaded');
    } catch (err) {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, year: Number(form.year) || undefined, pricePerDay: Number(form.pricePerDay), seats: Number(form.seats) };
    try {
      if (editing) {
        const { data } = await api.put(`/vehicles/${editing._id}`, payload);
        setVehicles((vs) => vs.map((v) => (v._id === editing._id ? data : v)));
        toast.success('Vehicle updated');
      } else {
        const { data } = await api.post('/vehicles', payload);
        setVehicles((vs) => [data, ...vs]);
        toast.success('Vehicle added');
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save vehicle');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    try {
      await api.delete(`/vehicles/${toDelete._id}`);
      setVehicles((vs) => vs.filter((v) => v._id !== toDelete._id));
      toast.success('Vehicle deleted');
    } catch {
      toast.error('Could not delete vehicle');
    } finally {
      setToDelete(null);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary-950 dark:text-white sm:text-3xl">Vehicles</h1>
          <p className="mt-1 text-sm text-primary-500 dark:text-slate-400">{vehicles.length} vehicles listed</p>
        </div>
        <Button variant="primary" icon={FiPlus} onClick={openCreate}>Add vehicle</Button>
      </div>

      <div className="relative mt-5 max-w-sm">
        <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search vehicles…"
          className="w-full rounded-xl border border-primary-100 bg-white/80 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 dark:border-white/10 dark:bg-white/5 dark:text-white"
        />
      </div>

      <div className="card-surface mt-5 overflow-x-auto rounded-2xl">
        {loading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14" />)}
          </div>
        ) : vehicles.length === 0 ? (
          <EmptyState icon={FiTruck} title="No vehicles yet" description="Add your first vehicle to get started." action={<Button onClick={openCreate}>Add vehicle</Button>} />
        ) : (
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-primary-100 text-left text-xs uppercase tracking-wide text-primary-400 dark:border-white/10 dark:text-slate-500">
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Price/day</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v._id} className="border-b border-primary-50 last:border-0 hover:bg-primary-50/50 dark:border-white/5 dark:hover:bg-white/[0.03]">
                  <td className="flex items-center gap-3 px-4 py-3">
                    <img src={v.images?.[0]} className="h-10 w-14 rounded-lg object-cover bg-primary-100" onError={(e) => (e.target.style.visibility = 'hidden')} />
                    <div>
                      <p className="font-medium text-primary-900 dark:text-white">{v.name}</p>
                      <p className="text-xs text-primary-400">{v.brand}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize text-primary-600 dark:text-slate-300">{v.type}</td>
                  <td className="px-4 py-3 font-mono text-primary-900 dark:text-white">₹{v.pricePerDay}</td>
                  <td className="px-4 py-3 text-primary-600 dark:text-slate-300">{v.location}</td>
                  <td className="px-4 py-3">
                    <Badge tone={v.isAvailable ? 'success' : 'danger'}>{v.isAvailable ? 'Available' : 'Booked'}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1.5">
                      <button onClick={() => openEdit(v)} className="rounded-lg p-2 text-primary-500 hover:bg-primary-100 dark:hover:bg-white/10"><FiEdit2 size={14} /></button>
                      <button onClick={() => setToDelete(v)} className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"><FiTrash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit vehicle' : 'Add vehicle'} maxWidth="max-w-2xl">
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Select label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="car">Car</option>
              <option value="bike">Bike</option>
            </Select>
            <Input label="Brand" required value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
            <Input label="Model" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
            <Input label="Year" type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
            <Input label="Price / day (₹)" type="number" required value={form.pricePerDay} onChange={(e) => setForm({ ...form, pricePerDay: e.target.value })} />
            <Input label="Location" required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            <Input label="Seats" type="number" value={form.seats} onChange={(e) => setForm({ ...form, seats: e.target.value })} />
            <Select label="Transmission" value={form.transmission} onChange={(e) => setForm({ ...form, transmission: e.target.value })}>
              <option value="manual">Manual</option>
              <option value="automatic">Automatic</option>
            </Select>
            <Select label="Fuel type" value={form.fuelType} onChange={(e) => setForm({ ...form, fuelType: e.target.value })}>
              <option value="petrol">Petrol</option>
              <option value="diesel">Diesel</option>
              <option value="electric">Electric</option>
              <option value="hybrid">Hybrid</option>
            </Select>
            <Input label="Fuel efficiency (kmpl or km/kWh)" type="number" value={form.fuelEfficiency} onChange={(e) => setForm({ ...form, fuelEfficiency: Number(e.target.value) || 0 })} />
          </div>

          {/* Dynamic pricing */}
          <div className="rounded-xl bg-primary-50 p-3 dark:bg-white/5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary-400">Dynamic pricing (optional)</p>
            <div className="grid grid-cols-3 gap-3">
              <Input label="Weekend surcharge (₹/day)" type="number" value={form.weekendSurcharge} onChange={(e) => setForm({ ...form, weekendSurcharge: Number(e.target.value) || 0 })} />
              <Input label="Weekly discount (%7+d)" type="number" value={form.weeklyDiscount} onChange={(e) => setForm({ ...form, weeklyDiscount: Number(e.target.value) || 0 })} />
              <Input label="Monthly discount (%30+d)" type="number" value={form.monthlyDiscount} onChange={(e) => setForm({ ...form, monthlyDiscount: Number(e.target.value) || 0 })} />
            </div>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-primary-900 dark:text-slate-200">Description</span>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-xl border border-primary-100 bg-white/80 px-3.5 py-2.5 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </label>

          <div>
            <span className="mb-1.5 block text-sm font-medium text-primary-900 dark:text-slate-200">Images</span>
            <div className="flex flex-wrap gap-2">
              {form.images.map((img, i) => (
                <div key={i} className="relative h-16 w-20 overflow-hidden rounded-lg">
                  <img src={img} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }))}
                    className="absolute right-0.5 top-0.5 rounded-full bg-black/50 p-0.5 text-white"
                  >
                    <FiX size={11} />
                  </button>
                </div>
              ))}
              <label className="flex h-16 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-primary-200 text-primary-400 hover:border-primary-400 dark:border-white/10">
                {uploading ? <span className="text-[10px]">Uploading…</span> : <><FiUploadCloud size={16} /><span className="text-[10px]">Upload</span></>}
                <input type="file" multiple accept="image/*" hidden onChange={handleUpload} disabled={uploading} />
              </label>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-primary-700 dark:text-slate-300">
            <input type="checkbox" checked={form.isAvailable} onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })} className="h-4 w-4 rounded accent-primary-600" />
            Available for booking
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" loading={saving}>{editing ? 'Save changes' : 'Add vehicle'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!toDelete} onClose={() => setToDelete(null)} title="Delete vehicle?">
        <p className="text-sm text-primary-600 dark:text-slate-300">
          This will permanently remove <strong>{toDelete?.name}</strong> from your listings.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setToDelete(null)}>Cancel</Button>
          <Button variant="danger" onClick={remove}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
