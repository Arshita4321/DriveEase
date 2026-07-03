import { useEffect, useState } from 'react';
import { FiCheck } from 'react-icons/fi';
import api from '../services/api';

export default function AddonSelector({ vehicleType, selectedIds, onChange, totalDays }) {
  const [addons, setAddons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/addons', { params: { type: vehicleType } })
      .then(({ data }) => setAddons(data))
      .catch(() => setAddons([]))
      .finally(() => setLoading(false));
  }, [vehicleType]);

  const toggle = (addon) => {
    const isSelected = selectedIds.includes(addon._id);
    if (isSelected) {
      onChange(selectedIds.filter((id) => id !== addon._id));
    } else {
      onChange([...selectedIds, addon._id]);
    }
  };

  if (loading) return null;
  if (addons.length === 0) return null;

  return (
    <div className="mt-4">
      <p className="mb-2 text-xs font-medium text-primary-500 dark:text-slate-400">Optional add-ons</p>
      <div className="space-y-2">
        {addons.map((a) => {
          const isSelected = selectedIds.includes(a._id);
          const cost = a.priceType === 'per_day' ? a.price * (totalDays || 1) : a.price;
          return (
            <button
              key={a._id}
              type="button"
              onClick={() => toggle(a)}
              className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-left transition-all ${
                isSelected
                  ? 'border-primary-400 bg-primary-50 dark:border-primary-500 dark:bg-primary-500/10'
                  : 'border-primary-100 hover:border-primary-200 dark:border-white/10 dark:hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                  isSelected ? 'border-primary-500 bg-primary-500 text-white' : 'border-primary-200 dark:border-white/20'
                }`}>
                  {isSelected && <FiCheck size={12} />}
                </span>
                <div>
                  <p className="text-sm font-medium text-primary-900 dark:text-white">{a.name}</p>
                  {a.description && <p className="text-xs text-primary-400">{a.description}</p>}
                </div>
              </div>
              <span className="font-mono text-xs font-semibold text-primary-700 dark:text-primary-300">
                ₹{cost}{a.priceType === 'per_day' ? ` (${totalDays || 1}d)` : ''}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
