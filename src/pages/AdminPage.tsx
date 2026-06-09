import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Plus, ShieldAlert, Hospital as HospitalIcon, Star, FileText, Trash2, Check, EyeOff } from 'lucide-react';
import { useAuth }         from '@/hooks/useAuth';
import { AdminEntryForm }  from '@/components/admin/AdminEntryForm';
import { Button }          from '@/components/ui/Button';
import { Spinner }         from '@/components/ui/Spinner';
import { supabase }        from '@/lib/supabase';
import type { Hospital as HospitalType, Review } from '@/types';
import type { HospitalFormData } from '@/lib/validation';

type AdminTab = 'hospitals' | 'reviews' | 'submissions';

export function AdminPage() {
  const { isAdmin, loading } = useAuth();
  const [tab, setTab] = useState<AdminTab>('hospitals');
  const [showForm, setShowForm] = useState(false);
  const [hospitals, setHospitals] = useState<HospitalType[]>([]);
  const [pendingReviews, setPendingReviews] = useState<Review[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    loadAdminData();
  }, [isAdmin]);

  async function loadAdminData() {
    setLoadingData(true);
    const [{ data: hospitalData }, { data: reviewData }] = await Promise.all([
      supabase.from('hospitals').select('*').order('name'),
      supabase.from('reviews')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false }),
    ]);

    setHospitals((hospitalData ?? []) as HospitalType[]);
    setPendingReviews((reviewData ?? []) as Review[]);
    setLoadingData(false);
  }

  async function handleCreate(data: HospitalFormData) {
    const { error } = await supabase.from('hospitals').insert([data]);
    if (!error) {
      setShowForm(false);
      await loadAdminData();
    } else {
      alert(`Error: ${error.message}`);
    }
  }

  async function handleDeleteHospital(hospitalId: string) {
    if (!confirm('Delete this hospital entry?')) return;
    const { error } = await supabase.from('hospitals').delete().eq('id', hospitalId);
    if (error) {
      alert(`Error: ${error.message}`);
    } else {
      setHospitals((prev) => prev.filter((item) => item.id !== hospitalId));
    }
  }

  async function handleModerateReview(reviewId: string, status: 'approved' | 'hidden') {
    const { error } = await supabase.from('reviews').update({ status }).eq('id', reviewId);
    if (error) {
      alert(`Error: ${error.message}`);
    } else {
      setPendingReviews((prev) => prev.filter((review) => review.id !== reviewId));
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (!isAdmin) return <Navigate to="/" replace />;

  const tabs: { key: AdminTab; label: string; icon: React.ReactNode }[] = [
    { key: 'hospitals',    label: 'Hospitals',    icon: <HospitalIcon className="h-4 w-4" /> },
    { key: 'reviews',      label: 'Reviews',      icon: <Star className="h-4 w-4" /> },
    { key: 'submissions',  label: 'Submissions',  icon: <FileText className="h-4 w-4" /> },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-brand-600" />
            Admin Dashboard
          </h1>
          <p className="text-sm text-ink-muted mt-1">Manage hospital entries, reviews, and user submissions.</p>
        </div>
        <Button variant="primary" size="md" onClick={() => setShowForm((v) => !v)}>
          <Plus className="h-4 w-4" />
          {showForm ? 'Cancel' : 'New hospital'}
        </Button>
      </div>

      {/* New hospital form */}
      {showForm && (
        <div className="rounded-card border border-surface-border bg-surface p-6">
          <h2 className="font-semibold text-ink mb-4">Create hospital entry</h2>
          <AdminEntryForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-surface-border">
        {tabs.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === key
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            {icon}{label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="rounded-card border border-surface-border bg-surface p-6">
        {tab === 'hospitals' && (
          <div className="space-y-4">
            {loadingData ? (
              <div className="flex justify-center py-10"><Spinner /></div>
            ) : hospitals.length === 0 ? (
              <p className="text-sm text-ink-muted">No hospitals found. Use the form above to add new entries.</p>
            ) : (
              <div className="space-y-3">
                {hospitals.map((hospital) => (
                  <div key={hospital.id} className="rounded-card border border-surface-border bg-white p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-ink">{hospital.name}</p>
                      <p className="text-sm text-ink-faint">{hospital.city}, {hospital.state} · {hospital.ownership}</p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteHospital(hospital.id)}>
                        <Trash2 className="h-4 w-4" /> Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'reviews' && (
          <div className="space-y-4">
            {loadingData ? (
              <div className="flex justify-center py-10"><Spinner /></div>
            ) : pendingReviews.length === 0 ? (
              <p className="text-sm text-ink-muted">No pending reviews. Approved reviews will appear on hospital pages.</p>
            ) : (
              <div className="space-y-3">
                {pendingReviews.map((review) => (
                  <div key={review.id} className="rounded-card border border-surface-border bg-white p-4 space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-semibold text-ink">Review for {review.hospital_id}</p>
                      <span className="rounded-full bg-surface-muted px-2 py-1 text-xs text-ink-faint">{review.rating} stars</span>
                    </div>
                    {review.body && <p className="text-sm text-ink-muted">{review.body}</p>}
                    <div className="flex gap-2 flex-wrap">
                      <Button variant="secondary" size="sm" onClick={() => handleModerateReview(review.id, 'approved')}>
                        <Check className="h-4 w-4" /> Approve
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleModerateReview(review.id, 'hidden')}>
                        <EyeOff className="h-4 w-4" /> Hide
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'submissions' && (
          <div>
            <p className="text-sm text-ink-muted">
              Community-submitted hospital suggestions are not yet stored in this version.
              Build a submissions table and connect it here to complete the workflow.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
