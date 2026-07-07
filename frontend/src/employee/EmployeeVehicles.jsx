import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiAlertTriangle, FiCheckCircle, FiSearch, FiTruck, FiXCircle } from 'react-icons/fi';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Skeleton from '../components/ui/Skeleton';
import api from '../services/api';

const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="%234338CA"/><stop offset="1" stop-color="%2306B6D4"/></linearGradient></defs><rect width="100%" height="100%" fill="url(%23g)" opacity="0.15"/></svg>`
  );

export default function EmployeeVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState(''); // '', 'available', 'unavailable'
  const [maintModal, setMaintModal] = useState(null);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/employee/vehicles')
      .then(({ data }) => setVehicles(data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleToggle = async (vehicle) => {
    if (vehicle.isAvailable) {
      // Opening maintenance modal before marking unavailable
      setMaintModal(vehicle);
      setReason('');
    } else {
      // Marking as available — no reason needed
      try {
        await api.put(`/employee/vehicles/${vehicle._id}/toggle-availability`, { isAvailable: true });
        toast.success(`${vehicle.name} is now available`);
        load();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Could not update vehicle');
      }
    }
  };

  const confirmMaintenance = async () => {
    setSaving(true);
    try {
      await api.put(`/employee/vehicles/${maintModal._id}/toggle-availability`, {
        isAvailable: false,
        reason,
      });
      toast.success(`${maintModal.name} marked unavailable — maintenance request created`);
      setMaintModal(null);
      setReason('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update vehicle');
    } finally {
      setSaving(false);
    }
  };

  const filtered = vehicles.filter((v) => {
    const matchesSearch =
      !search ||
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.brand.toLowerCase().includes(search.toLowerCase()) ||
      v.location.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      !filter || (filter === 'available' ? v.isAvailable : !v.isAvailable);
    return matchesSearch && matchesFilter;
  });

  const availableCount = vehicles.filter((v) => v.isAvailable).length;

  return (
    <div>
      <div>
        <h1 className="font-display text-2xl font-bold text-primary-950 dark:text-white sm:text-3xl">
          Fleet Status
        </h1>
        <p className="mt-1 text-sm text-primary-500 dark:text-slate-400">
          {availableCount} of {vehicles.length} vehicles available
        </p>
      </div>

      {/* Filters */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, brand, or location…"
            className="w-full rounded-xl border border-primary-100 bg-white/80 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
        </div>
        <div className="flex gap-1.5">
          {['', 'available', 'unavailable'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                filter === f
                  ? 'bg-grad-primary text-white shadow-glow'
                  : 'bg-primary-50 text-primary-600 hover:bg-primary-100 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10'
              }`}
            >
              {f === '' ? 'All' : f === 'available' ? 'Available' : 'Unavailable'}
            </button>
          ))}
        </div>
      </div>

      {/* Vehicle grid */}
      <div className="mt-5">
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-52 rounded-2xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={FiTruck} title="No vehicles found" description="Try adjusting your filters." />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((v) => {
              const img = v.images?.[0] || PLACEHOLDER;
              return (
                <div key={v._id} className="card-surface group overflow-hidden rounded-2xl transition-shadow hover:shadow-lg">
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={img}
                      alt={v.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    <div className="absolute left-3 top-3 flex gap-1.5">
                      <Badge tone={v.isAvailable ? 'success' : 'danger'}>
                        {v.isAvailable ? 'Available' : 'Unavailable'}
                      </Badge>
                      <Badge tone="neutral" className="capitalize">{v.type}</Badge>
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <span className="rounded-lg bg-black/50 px-2 py-1 font-mono text-xs font-semibold text-white backdrop-blur-sm">
                        ₹{v.pricePerDay}/day
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-display font-semibold text-primary-950 dark:text-white">{v.name}</h3>
                    <p className="text-xs text-primary-400">{v.brand} · {v.location}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex gap-3 text-xs text-primary-500 dark:text-slate-400">
                        <span>{v.seats} seats</span>
                        <span className="capitalize">{v.transmission}</span>
                        <span className="capitalize">{v.fuelType}</span>
                      </div>
                      <button
                        onClick={() => handleToggle(v)}
                        className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                          v.isAvailable
                            ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20'
                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20'
                        }`}
                      >
                        {v.isAvailable ? (
                          <><FiXCircle size={12} /> Mark unavailable</>
                        ) : (
                          <><FiCheckCircle size={12} /> Mark available</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Maintenance modal */}
      <Modal
        open={!!maintModal}
        onClose={() => setMaintModal(null)}
        title={`Mark ${maintModal?.name} as unavailable`}
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl bg-orange-50 p-3 dark:bg-orange-500/10">
            <FiAlertTriangle size={18} className="mt-0.5 shrink-0 text-orange-500" />
            <p className="text-sm text-orange-700 dark:text-orange-300">
              This will remove the vehicle from the available fleet. Add a reason to create a maintenance request.
            </p>
          </div>
          <Input
            label="Reason (optional)"
            placeholder="e.g. Engine check, tire replacement…"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setMaintModal(null)}>Cancel</Button>
            <Button variant="danger" loading={saving} onClick={confirmMaintenance}>
              Mark unavailable
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
