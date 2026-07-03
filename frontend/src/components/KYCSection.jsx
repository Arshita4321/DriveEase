import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiClock, FiFileText, FiShield, FiUploadCloud, FiX, FiXCircle } from 'react-icons/fi';
import api from '../services/api';
import Button from './ui/Button';
import Input from './ui/Input';

export default function KYCSection() {
  const [kyc, setKyc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ licenseNumber: '', licenseImage: null, idProofImage: null });
  const [preview, setPreview] = useState({ license: '', idProof: '' });
  const licRef = useRef(null);
  const idRef = useRef(null);

  const load = () => {
    setLoading(true);
    api.get('/users/kyc/status').then(({ data }) => setKyc(data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const onFile = (field, file) => {
    if (!file) return;
    setForm((f) => ({ ...f, [field]: file }));
    const reader = new FileReader();
    reader.onload = () => setPreview((p) => ({ ...p, [field === 'licenseImage' ? 'license' : 'idProof']: reader.result }));
    reader.readAsDataURL(file);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.licenseNumber) return toast.error('License number is required');
    if (!form.licenseImage || !form.idProofImage) return toast.error('Both documents are required');
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('licenseNumber', form.licenseNumber);
      fd.append('licenseImage', form.licenseImage);
      fd.append('idProofImage', form.idProofImage);
      await api.post('/users/kyc/submit', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('KYC submitted for verification');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit KYC');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="py-8 text-center text-sm text-primary-400">Loading…</p>;

  // ── Status banners ──────────────────────────────────────────────────────────
  if (kyc?.kycStatus === 'pending') {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <FiClock className="mb-3 text-4xl text-amber-400" />
        <h3 className="font-display text-lg font-semibold text-primary-950 dark:text-white">Verification In Progress</h3>
        <p className="mt-1.5 max-w-sm text-sm text-primary-500 dark:text-slate-400">
          Your documents have been submitted and are under review. You'll be notified once verified.
        </p>
        {kyc.licenseImage && (
          <div className="mt-5 flex gap-3">
            <div className="overflow-hidden rounded-xl border border-primary-100 dark:border-white/10">
              <img src={kyc.licenseImage} alt="License" className="h-28 w-40 object-cover" />
              <p className="bg-primary-50 py-1 text-center text-[10px] text-primary-500 dark:bg-white/5">License</p>
            </div>
            <div className="overflow-hidden rounded-xl border border-primary-100 dark:border-white/10">
              <img src={kyc.idProofImage} alt="ID Proof" className="h-28 w-40 object-cover" />
              <p className="bg-primary-50 py-1 text-center text-[10px] text-primary-500 dark:bg-white/5">ID Proof</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (kyc?.kycStatus === 'approved') {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <FiCheckCircle className="mb-3 text-4xl text-emerald-500" />
        <h3 className="font-display text-lg font-semibold text-primary-950 dark:text-white">KYC Verified</h3>
        <p className="mt-1.5 text-sm text-primary-500 dark:text-slate-400">Your documents have been verified. You're all set to book!</p>
        <div className="mt-5 flex gap-3">
          {kyc.licenseImage && <div className="overflow-hidden rounded-xl border border-primary-100 dark:border-white/10"><img src={kyc.licenseImage} alt="License" className="h-28 w-40 object-cover" /></div>}
          {kyc.idProofImage && <div className="overflow-hidden rounded-xl border border-primary-100 dark:border-white/10"><img src={kyc.idProofImage} alt="ID Proof" className="h-28 w-40 object-cover" /></div>}
        </div>
      </div>
    );
  }

  // ── Form (none or rejected) ──────────────────────────────────────────────────
  return (
    <div>
      {kyc?.kycStatus === 'rejected' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
          <p className="flex items-center gap-2 font-semibold"><FiXCircle /> KYC was rejected</p>
          <p className="mt-1">{kyc.kycNote || 'Please resubmit your documents.'}</p>
        </motion.div>
      )}

      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-grad-primary text-white"><FiShield size={18} /></span>
        <div>
          <h3 className="font-display font-semibold text-primary-950 dark:text-white">Document Verification</h3>
          <p className="text-xs text-primary-500 dark:text-slate-400">Upload your driving license and ID proof to start booking.</p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <Input
          label="Driving license number"
          icon={FiFileText}
          required
          value={form.licenseNumber}
          onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
          placeholder="e.g. DL-0420110012345"
        />

        <div className="grid grid-cols-2 gap-3">
          {[
            { key: 'licenseImage', label: 'License Photo', ref: licRef, preview: preview.license },
            { key: 'idProofImage',  label: 'ID Proof',     ref: idRef,  preview: preview.idProof },
          ].map((doc) => (
            <div key={doc.key}>
              <label className="mb-1.5 block text-sm font-medium text-primary-900 dark:text-slate-200">{doc.label}</label>
              <div
                onClick={() => doc.ref.current?.click()}
                className="relative flex h-32 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-primary-200 hover:border-primary-400 dark:border-white/10"
              >
                {doc.preview ? (
                  <>
                    <img src={doc.preview} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setPreview((p) => ({ ...p, [doc.key === 'licenseImage' ? 'license' : 'idProof']: '' })); setForm((f) => ({ ...f, [doc.key]: null })); }}
                      className="absolute right-1.5 top-1.5 rounded-full bg-black/50 p-1 text-white"
                    >
                      <FiX size={12} />
                    </button>
                  </>
                ) : (
                  <div className="text-center text-primary-400">
                    <FiUploadCloud className="mx-auto" size={22} />
                    <span className="mt-1 block text-[11px]">Click to upload</span>
                  </div>
                )}
                <input ref={doc.ref} type="file" accept="image/*" hidden onChange={(e) => onFile(doc.key, e.target.files?.[0])} />
              </div>
            </div>
          ))}
        </div>

        <Button type="submit" variant="primary" loading={submitting} className="w-full justify-center">
          Submit for verification
        </Button>
      </form>
    </div>
  );
}
