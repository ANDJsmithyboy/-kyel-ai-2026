/**
 * Gaboma AI · L'Antre · page.tsx · Server Component
 * SmartANDJ AI Technologies
 * Page de paramètres — shell UI uniquement, zéro API.
 */

import Link from 'next/link';
import SettingsSection from '@/components/settings/SettingsSection';
import SettingsRow from '@/components/settings/SettingsRow';
import SettingsToggle from '@/components/settings/SettingsToggle';
import UpsellCard from '@/components/settings/UpsellCard';
import { IconAurata, IconNkyel, IconWandana, IconOnyxGris, IconBlackPanther, IconBluePanther } from '@/components/icons';

/* ── Placeholder icons (20px thin) ─────────────────────── */
const Icon = ({ d }: { d: string }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d={d} stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const UserIcon = () => <Icon d="M10 11C12.2 11 14 9.2 14 7C14 4.8 12.2 3 10 3C7.8 3 6 4.8 6 7C6 9.2 7.8 11 10 11ZM10 11C6 11 3 13.5 3 16.5V17H17V16.5C17 13.5 14 11 10 11Z" />;
const CreditIcon = () => <Icon d="M2 7H18M4 4H16C17.1 4 18 4.9 18 6V14C18 15.1 17.1 16 16 16H4C2.9 16 2 15.1 2 14V6C2 4.9 2.9 4 4 4Z" />;
const ZapIcon = () => <Icon d="M11 2L4 11H10L9 18L16 9H10L11 2Z" />;
const PuzzleIcon = () => <Icon d="M14 6V4C14 3.4 13.6 3 13 3H7C6.4 3 6 3.4 6 4V6M4 8H16C16.6 8 17 8.4 17 9V16C17 16.6 16.6 17 16 17H4C3.4 17 3 16.6 3 16V9C3 8.4 3.4 8 4 8Z" />;
const MoonIcon = () => <Icon d="M17 11.5C16 13.5 14 15 11.5 15C7.9 15 5 12.1 5 8.5C5 6 6.5 4 8.5 3C4.5 4 2 7.5 2 11.5C2 16 5.5 19 10 19C14 19 17.5 16.5 17 11.5Z" />;
const TextIcon = () => <Icon d="M5 5H15M5 10H12M5 15H9" />;
const MicIcon = () => <Icon d="M10 2V12M10 12C8.3 12 7 10.7 7 9V5M10 12C11.7 12 13 10.7 13 9V5M6 15C7 16.3 8.4 17 10 17C11.6 17 13 16.3 14 15M10 17V19" />;
const PhoneIcon = () => <Icon d="M7 2H13C14.1 2 15 2.9 15 4V16C15 17.1 14.1 18 13 18H7C5.9 18 5 17.1 5 16V4C5 2.9 5.9 2 7 2ZM10 15H10.01" />;
const EyeSlashIcon = () => <Icon d="M3 3L17 17M10 6C12.8 6 15.2 7.6 16.5 10C16 11 15.3 11.9 14.5 12.5M10 14C7.2 14 4.8 12.4 3.5 10C4.2 8.7 5.2 7.6 6.5 6.9" />;
const LockIcon = () => <Icon d="M6 10V7C6 4.8 7.8 3 10 3C12.2 3 14 4.8 14 7V10M5 10H15C15.6 10 16 10.4 16 11V17C16 17.6 15.6 18 15 18H5C4.4 18 4 17.6 4 17V11C4 10.4 4.4 10 5 10Z" />;
const ScaleIcon = () => <Icon d="M10 3V17M3 7L10 3L17 7M3 7L3 10C3 11.7 6.1 13 10 13M17 7V10C17 11.7 13.9 13 10 13" />;
const LinkIcon = () => <Icon d="M8 12L12 8M7 10L5 12C3.9 13.1 3.9 14.9 5 16C6.1 17.1 7.9 17.1 9 16L11 14M13 10L15 8C16.1 6.9 16.1 5.1 15 4C13.9 2.9 12.1 2.9 11 4L9 6" />;
const SendIcon = () => <Icon d="M3 10L19 3L12 19L10 12L3 10Z" />;
const ChatIcon = () => <Icon d="M3 5C3 3.9 3.9 3 5 3H15C16.1 3 17 3.9 17 5V12C17 13.1 16.1 14 15 14H8L4 17V14H5H3V5Z" />;
const GlobeIcon = () => <Icon d="M10 2C5.6 2 2 5.6 2 10C2 14.4 5.6 18 10 18C14.4 18 18 14.4 18 10C18 5.6 14.4 2 10 2ZM2 10H18M10 2C7.5 2 5.5 5.6 5.5 10C5.5 14.4 7.5 18 10 18M10 2C12.5 2 14.5 5.6 14.5 10C14.5 14.4 12.5 18 10 18" />;
const BriefIcon = () => <Icon d="M3 7H17C17.6 7 18 7.4 18 8V16C18 16.6 17.6 17 17 17H3C2.4 17 2 16.6 2 16V8C2 7.4 2.4 7 3 7ZM7 7V5C7 4.4 7.4 4 8 4H12C12.6 4 13 4.4 13 5V7" />;
const SignOutIcon = () => <Icon d="M9 17H5C3.9 17 3 16.1 3 15V5C3 3.9 3.9 3 5 3H9M16 14L19 11L16 8M8 11H19" />;
const TrashIcon = () => <Icon d="M4 6H16M7 6V4H13V6M9 9V14M11 9V14M5 6L6 17H14L15 6" />;
const InfoIcon = () => <Icon d="M10 2C5.6 2 2 5.6 2 10C2 14.4 5.6 18 10 18C14.4 18 18 14.4 18 10C18 5.6 14.4 2 10 2ZM10 14V10M10 7H10.01" />;
const ChevronLeftIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ── Dummy user (server-side) ──────────────────────────── */
const user = {
  email: 'jean.moussavou@smartandj.com',
  name: 'Jean Moussavou',
  tier: 'FREE' as const,
};

const TIER_LABELS: Record<string, string> = {
  FREE: 'AURATA',
  NYEL: 'ÑKYEL',
  WANDANA: 'WANDANA',
  ONYX: 'ONYXGRIS',
  BLACK_PANTHER: 'BLACK PANTHER',
  BLUE_PANTHER: 'BLUE PANTHER',
};

const getTierIcon = (tier: string) => {
  const props = { width: 20, height: 20 };
  switch (tier) {
    case 'FREE': return <IconAurata {...props} />;
    case 'NYEL': return <IconNkyel {...props} />;
    case 'WANDANA': return <IconWandana {...props} />;
    case 'ONYX': return <IconOnyxGris {...props} />;
    case 'BLACK_PANTHER': return <IconBlackPanther {...props} />;
    case 'BLUE_PANTHER': return <IconBluePanther {...props} />;
    default: return <UserIcon />;
  }
};

export default function AntrePage() {
  return (
    <main className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* TOPBAR */}
      <header className="flex h-[52px] items-center justify-between px-4">
        <Link href="/chat" style={{ color: 'var(--text-secondary)' }}>
          <ChevronLeftIcon />
        </Link>
        <span
          className="text-[17px] font-semibold"
          style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
        >
          L&apos;Antre
        </span>
        <span style={{ color: 'var(--text-secondary)' }}>
          <InfoIcon />
        </span>
      </header>

      <div className="mx-auto max-w-2xl space-y-2 px-4 pb-8">
        {/* Email + tier */}
        <SettingsSection>
          <SettingsRow
            icon={<div style={{ color: 'var(--accent)' }}>{getTierIcon(user.tier)}</div>}
            label={user.email.length > 28 ? user.email.slice(0, 28) + '...' : user.email}
            action="badge"
            badgeText={TIER_LABELS[user.tier] || user.tier}
            isLast
          />
        </SettingsSection>

        {/* Upsell si FREE */}
        {user.tier === 'FREE' && <UpsellCard />}

        {/* COMPTE */}
        <SettingsSection title="COMPTE">
          <SettingsRow icon={<UserIcon />} label="Profil Citoyen" action="arrow" href="/settings/profile" />
          <SettingsRow icon={<CreditIcon />} label="Pacte de Chasse" sublabel="Abonnement & factures" action="arrow" href="/settings/billing" isLast />
        </SettingsSection>

        {/* FORCE */}
        <SettingsSection title="FORCE">
          <SettingsRow icon={<ZapIcon />} label="Choisir ta Force" sublabel="5 disponibles" action="arrow" href="/settings/tiers" />
          <SettingsRow icon={<PuzzleIcon />} label="Extensions de Traque" sublabel="2 activées" action="arrow" href="/settings/extensions" isLast />
        </SettingsSection>

        {/* EXPÉRIENCE */}
        <SettingsSection title="EXPÉRIENCE">
          <SettingsRow icon={<MoonIcon />} label="Mode de Forêt" sublabel="Noir oled" action="arrow" href="/settings/theme" />
          <SettingsRow icon={<TextIcon />} label="Style de Texte" sublabel="Par défaut" action="arrow" href="/settings/text" />
          <SettingsRow icon={<MicIcon />} label="Écho (Voix)" action="arrow" href="/settings/voice" />
          <SettingsRow icon={<PhoneIcon />} label="Retour haptique" action="none">
            <SettingsToggle defaultChecked={true} />
          </SettingsRow>
          <SettingsRow icon={<EyeSlashIcon />} label="Mode Ombre" action="none" isLast>
            <SettingsToggle defaultChecked={false} />
          </SettingsRow>
        </SettingsSection>

        {/* SOUVERAINETÉ */}
        <SettingsSection title="SOUVERAINETÉ">
          <SettingsRow icon={<LockIcon />} label="Coffre-Fort Souverain" action="none">
            <SettingsToggle defaultChecked={true} />
          </SettingsRow>
          <SettingsRow icon={<ScaleIcon />} label="Pacte Politique" action="badge" badgeText="CONFORME" />
          <SettingsRow icon={<LinkIcon />} label="Liens partagés" action="arrow" href="/settings/links" isLast />
        </SettingsSection>

        {/* REJOINDRE LA MEUTE */}
        <SettingsSection title="REJOINDRE LA MEUTE">
          <SettingsRow icon={<SendIcon />} label="Telegram" action="arrow" href="https://t.me/gabomaai" />
          <SettingsRow icon={<ChatIcon />} label="WhatsApp" action="arrow" href="https://wa.me/gabomaai" />
          <SettingsRow icon={<GlobeIcon />} label="X / Twitter" action="arrow" href="https://x.com/gabomaai" />
          <SettingsRow icon={<BriefIcon />} label="LinkedIn" action="arrow" href="https://linkedin.com/company/smartandj" isLast />
        </SettingsSection>

        {/* DANGER */}
        <div className="mt-4">
          <SettingsRow
            icon={<SignOutIcon />}
            label="Se déconnecter"
            labelColor="var(--color-error)"
          />
          <SettingsRow
            icon={<TrashIcon />}
            label="Supprimer le compte"
            sublabel="Action irréversible"
            labelColor="rgba(224,88,75,0.6)"
            isLast
          />
        </div>

        {/* FOOTER */}
        <p
          className="py-6 text-center text-[11px] tracking-wide"
          style={{ color: 'var(--text-tertiary)' }}
        >
          BY ANDJ • SMARTANDJ AI TECH
        </p>
      </div>
    </main>
  );
}
