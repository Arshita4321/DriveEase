import React, { useEffect, useState } from 'react';
import { FiEye, FiEyeOff, FiTrash2, FiStar } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';
import Rating from '../components/ui/Rating';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState(null);

  const load = () => {
    setLoading(true);
    api.get('/reviews').then(({ data }) => setReviews(data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const toggleVisibility = async (r) => {
    try {
      const { data } = await api.put(`/reviews/${r._id}/toggle-visibility`);
      setReviews((rs) => rs.map((x) => (x._id === r._id ? data : x)));
      toast.success(data.isHidden ? 'Review hidden' : 'Review visible');
    } catch {
      toast.error('Could not update review');
    }
  };

  const remove = async () => {
    try {
      await api.delete(`/reviews/${toDelete._id}`);
      setReviews((rs) => rs.filter((x) => x._id !== toDelete._id));
      toast.success('Review deleted');
    } catch {
      toast.error('Could not delete review');
    } finally {
      setToDelete(null);
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-primary-950 dark:text-white sm:text-3xl">Reviews</h1>
      <p className="mt-1 text-sm text-primary-500 dark:text-slate-400">{reviews.length} reviews across all vehicles</p>

      <div className="mt-5 space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)
        ) : reviews.length === 0 ? (
          <EmptyState icon={FiStar} title="No reviews yet" />
        ) : (
          reviews.map((r) => (
            <div key={r._id} className="card-surface flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-primary-900 dark:text-white">{r.user?.name}</span>
                  <span className="text-xs text-primary-400">on {r.vehicle?.name}</span>
                  {r.isHidden && <Badge tone="warning">Hidden</Badge>}
                </div>
                <Rating value={r.rating} showValue={false} size={13} />
                {r.comment && <p className="mt-1.5 text-sm text-primary-600 dark:text-slate-300">{r.comment}</p>}
              </div>
              <div className="flex shrink-0 gap-1.5">
                <button onClick={() => toggleVisibility(r)} className="rounded-lg p-2 text-primary-500 hover:bg-primary-100 dark:hover:bg-white/10">
                  {r.isHidden ? <FiEye size={15} /> : <FiEyeOff size={15} />}
                </button>
                <button onClick={() => setToDelete(r)} className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">
                  <FiTrash2 size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal open={!!toDelete} onClose={() => setToDelete(null)} title="Delete review?">
        <p className="text-sm text-primary-600 dark:text-slate-300">This review will be permanently removed and the vehicle's rating recalculated.</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setToDelete(null)}>Cancel</Button>
          <Button variant="danger" onClick={remove}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
