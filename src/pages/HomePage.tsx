import { useNavigate } from 'react-router-dom';
import { MapPin, FileDown, Send, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const features = [
  {
    icon: MapPin,
    title: 'Location-aware search',
    desc: 'Look up clinics and hospitals by name, state, city, or LGA. Enable location to automatically sort results by proximity.',
  },
  {
    icon: FileDown,
    title: 'Instant CSV export',
    desc: 'Download any filtered list as a spreadsheet — pick the columns you need. No login required.',
  },
  {
    icon: Send,
    title: 'Share with anyone',
    desc: 'Generate a shareable link or send a curated facility list by email in one click.',
  },
  {
    icon: BadgeCheck,
    title: 'Verified records',
    desc: 'All facility data is reviewed and kept up to date by a team of trusted administrators.',
  },
];

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 space-y-14 text-center">
      <div className="space-y-5">
        <span className="inline-block rounded-pill bg-brand-50 border border-brand-200 px-3 py-1 text-xs font-semibold text-brand-700 uppercase tracking-widest">
          Free · No login required to search
        </span>
        <h1 className="font-display font-bold text-4xl sm:text-5xl text-ink leading-tight">
          Nigeria's medical facility<br />
          <span className="text-brand-600">directory, simplified.</span>
        </h1>
        <p className="text-lg text-ink-muted max-w-2xl mx-auto">
          Instantly find clinics, hospitals, and specialist centres across Nigeria.
          Export results or share them — built for patients, health workers, and caregivers.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button variant="primary" size="lg" onClick={() => navigate('/search')}>
            <MapPin className="h-5 w-5" />
            Find a facility
          </Button>
          <Button variant="secondary" size="lg" onClick={() => navigate('/signup')}>
            Create free account
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-left">
        {features.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="rounded-card border border-surface-border bg-surface p-5 space-y-3 hover:border-brand-300 transition-colors"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 border border-brand-100">
              <Icon className="h-5 w-5 text-brand-600" />
            </div>
            <h3 className="font-semibold text-ink text-sm">{title}</h3>
            <p className="text-sm text-ink-muted leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
