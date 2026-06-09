import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, ChevronLeft, Share2, Building2 } from 'lucide-react';
import { supabase }      from '@/lib/supabase';
import { RatingWidget }  from '@/components/hospital/RatingWidget';
import { Badge }         from '@/components/ui/Badge';
import { Button }        from '@/components/ui/Button';
import { Spinner }       from '@/components/ui/Spinner';
import { SharePanel }    from '@/components/share/SharePanel';
import { useAuth }       from '@/hooks/useAuth';
import { marked }        from 'marked';
import DOMPurify         from 'dompurify';
import type { Hospital, Review } from '@/types';

export function HospitalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [facility, setFacility]               = useState<Hospital | null>(null);
  const [reviews,  setReviews]                = useState<Review[]>([]);
  const [pageLoading, setPageLoading]         = useState(true);
  const [shareOpen, setShareOpen]             = useState(false);
  const [userRating, setUserRating]           = useState(0);
  const [reviewText, setReviewText]           = useState('');
  const [submitting, setSubmitting]           = useState(false);
  const [submitSuccess, setSubmitSuccess]     = useState(false);
  const [submitError, setSubmitError]         = useState<string | null>(null);

  const renderedDescription = useMemo(() => {
    if (!facility?.description) return '';
    const html = marked.parse(facility.description);
    return typeof html === 'string' ? DOMPurify.sanitize(html) : '';
  }, [facility?.description]);

  useEffect(() => {
    if (!id) return;
    setPageLoading(true);

    (async () => {
      const [{ data: facilityData }, { data: reviewData }] = await Promise.all([
        supabase.from('hospitals').select('*').eq('id', id).single(),
        supabase.from('reviews')
          .select('*')
          .eq('hospital_id', id)
          .eq('status', 'approved')
          .order('created_at', { ascending: false }),
      ]);
      setFacility(facilityData as Hospital | null);
      setReviews((reviewData ?? []) as Review[]);
      setPageLoading(false);
    })();
  }, [id]);

  async function submitReview() {
    if (!id || !user || userRating === 0) return;
    setSubmitting(true);
    setSubmitError(null);

    const { error } = await supabase.from('reviews').insert([{
      hospital_id: id,
      user_id:     user.id,
      rating:      userRating,
      body:        reviewText,
      status:      'pending',
    }]);

    if (error) {
      setSubmitError(error.message);
    } else {
      setReviewText('');
      setUserRating(0);
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 4000);
    }
    setSubmitting(false);
  }

  if (pageLoading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (!facility)   return <p className="text-center py-20 text-ink-muted">Facility not found.</p>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-8">

      <Link to="/search" className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink transition-colors">
        <ChevronLeft className="h-4 w-4" /> Back to results
      </Link>

      {/* Main card */}
      <div className="rounded-card border border-surface-border bg-surface p-6 space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="font-display font-bold text-2xl text-ink">{facility.name}</h1>
            <div className="flex items-center gap-2 flex-wrap">
              <RatingWidget value={facility.rating_avg} count={facility.rating_count} size="md" />
              <span className={`inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-xs font-semibold ${
                facility.ownership === 'public'
                  ? 'bg-brand-50 text-brand-700'
                  : 'bg-amber-50 text-amber-700'
              }`}>
                <Building2 className="h-3 w-3" />
                {facility.ownership === 'public' ? 'Government' : 'Private'}
              </span>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setShareOpen((v) => !v)}>
            <Share2 className="h-4 w-4" /> Share
          </Button>
        </div>

        {shareOpen && (
          <div className="border-t border-surface-border pt-4">
            <SharePanel filters={{ city: facility.city }} />
          </div>
        )}

        {/* Details */}
        <dl className="space-y-2.5 text-sm text-ink-muted">
          <div className="flex gap-2">
            <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-ink-faint" />
            <dd>{facility.address}, {facility.lga}, {facility.state}</dd>
          </div>
          <div className="flex gap-2">
            <Phone className="h-4 w-4 shrink-0 mt-0.5 text-ink-faint" />
            <dd><a href={`tel:${facility.phone}`} className="hover:text-brand-600 transition-colors">{facility.phone}</a></dd>
          </div>
          {facility.email && (
            <div className="flex gap-2">
              <Mail className="h-4 w-4 shrink-0 mt-0.5 text-ink-faint" />
              <dd><a href={`mailto:${facility.email}`} className="hover:text-brand-600 transition-colors">{facility.email}</a></dd>
            </div>
          )}
          {facility.visiting_hours && (
            <div className="flex gap-2">
              <Clock className="h-4 w-4 shrink-0 mt-0.5 text-ink-faint" />
              <dd>{facility.visiting_hours}</dd>
            </div>
          )}
        </dl>

        {/* Services */}
        {facility.specialties.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Services</p>
            <div className="flex flex-wrap gap-1.5">
              {facility.specialties.map((s) => <Badge key={s}>{s}</Badge>)}
            </div>
          </div>
        )}

        {/* Description */}
        {facility.description && (
          <div
            className="prose prose-sm max-w-none text-ink-muted border-t border-surface-border pt-4"
            dangerouslySetInnerHTML={{ __html: renderedDescription }}
          />
        )}
      </div>

      {/* Reviews section */}
      <section aria-labelledby="reviews-title">
        <h2 id="reviews-title" className="font-display font-semibold text-lg text-ink mb-4">
          Patient reviews
        </h2>

        {user ? (
          <div className="rounded-card border border-surface-border bg-surface p-4 mb-4 space-y-3">
            <p className="text-sm font-medium text-ink">Rate this facility</p>
            <RatingWidget interactive value={userRating} onChange={setUserRating} size="lg" />
            {userRating > 0 && (
              <textarea
                placeholder="Share your experience (optional)…"
                rows={3}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="w-full rounded-lg border border-surface-border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            )}
            {submitError   && <p className="text-sm text-danger">{submitError}</p>}
            {submitSuccess && <p className="text-sm text-success">Thanks — your review has been submitted for approval.</p>}
            {userRating === 0
              ? <p className="text-xs text-ink-muted">Tap a star above to begin your review.</p>
              : (
                <Button variant="primary" size="sm" loading={submitting} onClick={submitReview}>
                  Submit review
                </Button>
              )
            }
          </div>
        ) : (
          <p className="text-sm text-ink-muted mb-4">
            <Link to="/login" className="text-brand-600 hover:underline">Log in</Link> to leave a review.
          </p>
        )}

        {reviews.length === 0 ? (
          <p className="text-sm text-ink-faint">No reviews yet — be the first.</p>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-card border border-surface-border bg-surface p-4 space-y-1.5">
                <RatingWidget value={r.rating} size="sm" />
                {r.body && <p className="text-sm text-ink-muted">{r.body}</p>}
                <p className="text-xs text-ink-faint">
                  {new Date(r.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
