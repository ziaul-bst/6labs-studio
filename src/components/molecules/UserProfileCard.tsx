/**
 * UserProfileCard — Avatar + username + spender tag + stat card rows with icons.
 * Figma: User Profile section inside Session Side Panel.
 *
 * @figmaComponent  User Profile
 * @figmaNode       366:22194
 * @figmaFile       i9fxQ6pXrgRITEzopoXpWL
 * @figmaUrl        https://www.figma.com/design/i9fxQ6pXrgRITEzopoXpWL/6labs?node-id=366-22194
 */

import { UserProfileIcon as UserProfileSectionIcon } from '../icons/section'
import type { UserProfile } from '../../lib/types/radiologist'

interface UserProfileCardProps {
  profile: UserProfile
  className?: string
}

/** Stat card icons — exported from Figma via Desktop Bridge */
const STAT_ICONS: Record<string, JSX.Element> = {
  location: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 1C10.209 1 12 2.919 12 5.286C12 7.653 8 13 8 13S4 7.653 4 5.286C4 2.919 5.791 1 8 1ZM8 3.571C7.116 3.571 6.4 4.339 6.4 5.286C6.401 6.233 7.116 7 8 7C8.884 7 9.599 6.233 9.6 5.286C9.6 4.339 8.884 3.571 8 3.571Z" fill="#67C3BB"/>
      <ellipse cx="8" cy="14" rx="3.5" ry="1" fill="#67C3BB"/>
    </svg>
  ),
  radar: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M14.06 4.504C14.83 5.838 15.14 7.389 14.94 8.916C14.74 10.444 14.04 11.862 12.95 12.951C11.86 14.041 10.44 14.74 8.914 14.941C7.387 15.142 5.836 14.834 4.501 14.064C3.167 13.293 2.125 12.104 1.535 10.681C0.946 9.258 0.842 7.68 1.241 6.192C1.64 4.704 2.518 3.389 3.74 2.451C4.963 1.513 6.46 1.005 8 1.005" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 1.005V7.003" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="8" cy="8" r="1" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  clock: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 1.5C11.59 1.5 14.5 4.41 14.5 8C14.5 11.59 11.59 14.5 8 14.5C4.41 14.5 1.5 11.59 1.5 8C1.5 4.41 4.41 1.5 8 1.5Z" stroke="currentColor"/>
      <path d="M7.5 4V8C7.5 8.276 7.724 8.5 8 8.5H11" stroke="currentColor" strokeLinecap="round"/>
    </svg>
  ),
  gamepad: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M5.33 6.33V8.67" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
      <path d="M4.17 7.5H6.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
      <circle cx="11.33" cy="7" r="0.67" fill="currentColor"/>
      <circle cx="10" cy="8.33" r="0.67" fill="currentColor"/>
      <path d="M1.33 6.5C1.33 5.12 2.45 4 3.83 4H12.17C13.55 4 14.67 5.12 14.67 6.5C14.67 9 13.17 12.5 11.67 12.5C10.67 12.5 10.17 11.5 8.67 11.5S6.67 12.5 5.67 12.5C4.17 12.5 2.67 9 1.33 6.5Z" stroke="currentColor" strokeWidth="1"/>
    </svg>
  ),
  leagues: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M12.915 0.667C12.915 6.344 10.695 10.405 7.947 10.405C5.196 10.405 2.98 6.344 2.98 0.667H12.915Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3.247 2.225H12.691" stroke="currentColor" strokeLinecap="round"/>
      <path d="M7.947 10.405V13.333" stroke="currentColor" strokeLinecap="round"/>
      <path d="M5.28 13.333H10.614" stroke="currentColor" strokeLinecap="round"/>
    </svg>
  ),
  dollar: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor"/>
      <path d="M5.33 9.83C5.33 10.85 6.53 11.67 8 11.67C9.47 11.67 10.67 10.85 10.67 9.83C10.67 8.46 9.67 7.77 8 7.77C6.67 7.77 5.33 7.77 5.33 6.17C5.33 5.15 6.53 4.33 8 4.33C9.47 4.33 10.67 5.15 10.67 6.17" stroke="currentColor" strokeLinecap="round"/>
      <path d="M8 3.33V12.67" stroke="currentColor" strokeLinecap="round"/>
    </svg>
  ),
}

function LockedOverlay() {
  return (
    <div
      className="absolute bottom-[10px] left-[6px] right-[7px] flex items-center justify-between h-[23px] px-xxs py-[1px] overflow-hidden rounded-s z-[3]"
      style={{ backdropFilter: 'blur(10px)', backgroundColor: 'rgba(255,255,255,0.2)' }}
    >
      <div className="flex items-center gap-xxs flex-1">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
          <path d="M12.757 7.168C12.595 6.995 12.398 6.909 12.166 6.909H11.889V5.136C11.889 4.004 11.507 3.031 10.743 2.219C9.979 1.406 9.065 1 8 1C6.935 1 6.021 1.406 5.257 2.219C4.493 3.031 4.111 4.004 4.111 5.136V6.909H3.833C3.602 6.909 3.405 6.995 3.243 7.168C3.081 7.34 3 7.549 3 7.796V13.114C3 13.36 3.081 13.569 3.243 13.742C3.405 13.914 3.602 14 3.833 14H12.167C12.398 14 12.595 13.914 12.757 13.742C12.919 13.569 13 13.36 13 13.114V7.796C13 7.549 12.919 7.34 12.757 7.168Z" fill="currentColor" />
        </svg>
        <span className="font-display font-semibold text-xs leading-[1.5] flex-1 min-w-0" style={{ color: '#353D57' }}>
          Locked
        </span>
        <span
          className="shrink-0 px-xxs py-[1px] rounded-xs text-center whitespace-nowrap"
          style={{ border: '1px solid var(--brand)', color: 'var(--brand)', fontSize: '10px', fontWeight: 600, letterSpacing: '0.6px' }}
        >
          PRO
        </span>
      </div>
    </div>
  )
}

function ProfileStatCard({ icon, label, value, locked }: { icon?: string; label: string; value: string; locked?: boolean }) {
  const iconEl = icon ? STAT_ICONS[icon] : null

  return (
    <div
      className="flex flex-col gap-xxs flex-1 min-w-0 p-s rounded-xl relative overflow-hidden isolate"
      style={{ backgroundColor: 'var(--bg-page)', border: '1px solid var(--bg-subtle)' }}
    >
      {/* Label row with icon */}
      <div className="flex items-center gap-xxs z-[2]">
        {iconEl && <span className="shrink-0 text-text-tertiary">{iconEl}</span>}
        <span className="font-body text-xs leading-[1.5]" style={{ color: '#686E81' }}>
          {label}
        </span>
      </div>
      {/* Value */}
      <div className="flex items-center gap-xxs w-full z-[1]">
        <span className="font-display font-semibold text-s leading-[1.5] flex-1 min-w-0" style={{ color: '#353D57' }}>
          {value}
        </span>
      </div>
      {locked && <LockedOverlay />}
    </div>
  )
}

export function UserProfileCard({ profile, className }: UserProfileCardProps) {
  return (
    <div className={['flex flex-col gap-s', className].filter(Boolean).join(' ')}>
      {/* Title — Figma: user+add icon (exported from Apparatus) + "User Profile" 16px Bricolage Semibold base-700 */}
      <div className="flex items-center gap-xs">
        <UserProfileSectionIcon size={16} className="shrink-0" />
        <span className="font-display font-semibold whitespace-nowrap" style={{ fontSize: '16px', color: '#353D57', lineHeight: '1.5' }}>
          User Profile
        </span>
      </div>

      {/* Avatar row — Figma: Stat Card with 40px User Profile Icon + username + spender tag */}
      <div
        className="flex items-center gap-xs w-full p-s rounded-xl"
        style={{ backgroundColor: 'var(--bg-page)', border: '1px solid var(--bg-subtle)' }}
      >
        {/* 40px avatar — Figma: User Profile Icon, Logged In=False */}
        <div
          className="w-[40px] h-[40px] rounded-round shrink-0 flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.2)' }}
        >
          {profile.avatarSrc ? (
            <img src={profile.avatarSrc} alt={profile.username} className="w-full h-full object-cover" />
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 24C18.627 24 24 18.627 24 12C24 5.373 18.627 0 12 0C5.373 0 0 5.373 0 12C0 18.627 5.373 24 12 24Z" fill="white" fillOpacity="0.2"/>
              <path d="M12 0.5C18.351 0.5 23.5 5.649 23.5 12C23.5 18.351 18.351 23.5 12 23.5C5.649 23.5 0.5 18.351 0.5 12C0.5 5.649 5.649 0.5 12 0.5Z" stroke="white" strokeOpacity="0.2" strokeMiterlimit="10"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M12 14C16.014 14 19.565 15.973 21.743 19C19.565 22.027 16.014 24 12 24C7.986 24 4.435 22.027 2.257 19C4.435 15.973 7.986 14 12 14Z" fill="#4F566C"/>
              <circle cx="12" cy="9" r="4.5" fill="#4F566C"/>
            </svg>
          )}
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <span className="font-body text-s leading-[1.5] truncate" style={{ color: '#686E81' }}>
            {profile.username}
          </span>
          {profile.isAgent && (
            <span className="font-display text-2xs font-semibold uppercase tracking-[0.06em]" style={{ color: 'var(--brand)' }}>
              AI Agent
            </span>
          )}
        </div>
        {/* Agents surface their persona here (bot glyph + persona); humans keep the spender tag. */}
        {profile.persona ? (
          <span
            className="shrink-0 inline-flex items-center gap-xxs font-display font-semibold text-2xs px-xs py-xxxs rounded-round whitespace-nowrap"
            style={{ backgroundColor: 'var(--bg-tint-light)', color: 'var(--brand)' }}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="shrink-0">
              <rect x="3" y="5.5" width="10" height="7.5" rx="2" stroke="currentColor" strokeWidth="1.3" />
              <path d="M8 3.5V5.5M8 3.5a1 1 0 100-2 1 1 0 000 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              <circle cx="6" cy="9" r="0.9" fill="currentColor" />
              <circle cx="10" cy="9" r="0.9" fill="currentColor" />
              <path d="M1.5 8.5v2M14.5 8.5v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            {profile.persona}
          </span>
        ) : profile.spenderTag ? (
          <span
            className="shrink-0 font-display font-semibold text-2xs px-xs py-xxxs rounded-round whitespace-nowrap"
            style={{ backgroundColor: 'rgba(255,183,0,0.15)', color: '#D4A017' }}
          >
            {profile.spenderTag}
          </span>
        ) : null}
      </div>

      {/* Stat card rows — from profile.stats */}
      {profile.stats?.map((row, rowIdx) => (
        <div key={rowIdx} className="flex gap-s w-full">
          {row.map((stat, statIdx) => (
            <ProfileStatCard
              key={statIdx}
              icon={stat.icon}
              label={stat.label}
              value={stat.value}
              locked={stat.locked}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
