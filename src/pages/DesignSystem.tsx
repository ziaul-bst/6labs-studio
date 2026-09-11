/**
 * DesignSystem — Visual design system reference for 6labs Studio.
 * Shows all Apparatus tokens, component states, and usage examples.
 * Organized by Atomic Design methodology with anatomy toggle.
 *
 * Source: studio/src/pages/DesignSystem.tsx
 * Synced: 2026-04-04
 */

import { useState } from 'react'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Checkbox from '../components/ui/Checkbox'
import Toggle from '../components/ui/Toggle'
import InputFieldConsole from '../components/ui/InputFieldConsole'
import { EventTag } from '../components/atoms/EventTag'
import { SidebarLabel } from '../components/atoms/SidebarLabel'
import { SidebarNavItem } from '../components/molecules/SidebarNavItem'
import { SidebarTaskItem } from '../components/molecules/SidebarTaskItem'
import { SidebarProfile } from '../components/molecules/SidebarProfile'
import { GameSelector } from '../components/molecules/GameSelector'
import { AgentTabItem } from '../components/molecules/AgentTabItem'
import { VideoCard } from '../components/molecules/VideoCard'
import { VideoCardList } from '../components/molecules/VideoCardList'
import { VideosEmptyState } from '../components/molecules/VideosEmptyState'
import { PopupModal } from '../components/molecules/PopupModal'
import { SelectDropdown } from '../components/molecules/SelectDropdown'
import { SuggestionCard } from '../components/molecules/SuggestionCard'
import { AgentPageHeader } from '../components/molecules/AgentPageHeader'
import { HomeIcon } from '../components/icons/HomeIcon'
import { RadiologistIcon } from '../components/icons/RadiologistIcon'
import { OracleIcon } from '../components/icons/OracleIcon'
import { ForecasterIcon } from '../components/icons/ForecasterIcon'
import { CoachIcon } from '../components/icons/CoachIcon'
import { GuardianIcon } from '../components/icons/GuardianIcon'
import { BaristaIcon } from '../components/icons/BaristaIcon'
import { UploadIcon } from '../components/icons/UploadIcon'
import { ConnectorIcon } from '../components/icons/ConnectorIcon'
import { ChevronIcon } from '../components/icons/ChevronIcon'
import { FilterIcon } from '../components/icons/FilterIcon'
import { CalendarIcon } from '../components/icons/CalendarIcon'
import { ClockIcon } from '../components/icons/ClockIcon'
import { CloseIcon } from '../components/icons/CloseIcon'
import { CheckIcon } from '../components/icons/CheckIcon'
import { ProgressBar } from '../components/atoms/ProgressBar'
import { UploadTag } from '../components/atoms/UploadTag'
import { ContextUploader } from '../components/molecules/ContextUploader'
import { ContextUploaderMini } from '../components/molecules/ContextUploaderMini'
import { ContextFileCard } from '../components/molecules/ContextFileCard'
import { DescriptionBox } from '../components/atoms/DescriptionBox'
import { ConnectorCard } from '../components/molecules/ConnectorCard'
import { ConnectorDetailView } from '../components/organisms/ConnectorDetailView'
import { FilterDialog } from '../components/organisms/FilterDialog'
import { FilterTag } from '../components/atoms/FilterTag'
import { RangeSlider } from '../components/atoms/RangeSlider'
import { AppsFlyerIcon } from '../components/icons/connectors/AppsFlyerIcon'

// ─── Types ────────────────────────────────────────────────────────────────────
type Category = 'foundations' | 'atoms' | 'molecules' | 'organisms'

interface SidebarEntry {
  id: string
  label: string
  category: Category
}

// ─── Sidebar navigation map ──────────────────────────────────────────────────
const SIDEBAR_ENTRIES: SidebarEntry[] = [
  // Foundations (tokens)
  { id: 'colors',        label: 'Color Tokens',        category: 'foundations' },
  { id: 'typography',    label: 'Typography',           category: 'foundations' },
  { id: 'spacing',       label: 'Spacing Scale',        category: 'foundations' },
  { id: 'shadows-radii', label: 'Shadows & Radii',     category: 'foundations' },
  { id: 'icons',         label: 'Icons',                category: 'foundations' },
  { id: 'dark-mode',     label: 'Dark Mode Mapping',    category: 'foundations' },
  // Atoms
  { id: 'button',        label: 'Button',               category: 'atoms' },
  { id: 'input',         label: 'Input',                category: 'atoms' },
  { id: 'checkbox',      label: 'Checkbox',             category: 'atoms' },
  { id: 'toggle',        label: 'Toggle',               category: 'atoms' },
  { id: 'event-tag',     label: 'EventTag',             category: 'atoms' },
  { id: 'sidebar-label', label: 'SidebarLabel',         category: 'atoms' },
  { id: 'progress-bar',  label: 'ProgressBar',          category: 'atoms' },
  { id: 'upload-tag',    label: 'UploadTag',            category: 'atoms' },
  // Molecules
  { id: 'sidebar-nav',   label: 'SidebarNavItem',       category: 'molecules' },
  { id: 'sidebar-task',  label: 'SidebarTaskItem',      category: 'molecules' },
  { id: 'sidebar-profile', label: 'SidebarProfile',     category: 'molecules' },
  { id: 'game-selector', label: 'GameSelector',         category: 'molecules' },
  { id: 'game-dropdown', label: 'GameSelectorDropdown', category: 'molecules' },
  { id: 'language-selector', label: 'LanguageSelector', category: 'molecules' },
  { id: 'agent-tab',     label: 'AgentTabItem',         category: 'molecules' },
  { id: 'video-card',    label: 'VideoCard',            category: 'molecules' },
  { id: 'video-card-list', label: 'VideoCardList',      category: 'molecules' },
  { id: 'videos-empty-state', label: 'VideosEmptyState', category: 'molecules' },
  { id: 'popup-modal',   label: 'PopupModal',           category: 'molecules' },
  { id: 'select-dropdown', label: 'SelectDropdown',     category: 'molecules' },
  { id: 'input-console',   label: 'InputFieldConsole',  category: 'molecules' },
  { id: 'suggestion-card', label: 'SuggestionCard',     category: 'molecules' },
  { id: 'agent-page-header', label: 'AgentPageHeader',  category: 'molecules' },
  { id: 'context-uploader',    label: 'ContextUploader',    category: 'molecules' },
  { id: 'context-uploader-mini', label: 'ContextUploaderMini', category: 'molecules' },
  { id: 'context-file-card',   label: 'ContextFileCard',    category: 'molecules' },
  { id: 'description-box',     label: 'DescriptionBox',     category: 'atoms' },
  { id: 'connector-card',      label: 'ConnectorCard',      category: 'molecules' },
  // Organisms
  { id: 'sidebar-organism', label: 'Sidebar',           category: 'organisms' },
  { id: 'hero-section',  label: 'HeroSection',          category: 'organisms' },
  { id: 'videos-container', label: 'VideosContainer',   category: 'organisms' },
  { id: 'oracle-agent-view', label: 'OracleAgentView',  category: 'organisms' },
  { id: 'radiologist-agent-view', label: 'RadiologistAgentView', category: 'organisms' },
  { id: 'context-uploads-view', label: 'ContextUploadsView', category: 'organisms' },
  { id: 'context-connectors-view', label: 'ContextConnectorsView', category: 'organisms' },
  { id: 'connector-detail-view', label: 'ConnectorDetailView', category: 'organisms' },
  { id: 'filter-dialog', label: 'FilterDialog', category: 'organisms' },
  // Atoms — filter
  { id: 'filter-tag', label: 'FilterTag', category: 'atoms' },
  { id: 'range-slider', label: 'RangeSlider', category: 'atoms' },
]

const CATEGORY_LABELS: Record<Category, string> = {
  foundations: 'Foundations',
  atoms: 'Atoms',
  molecules: 'Molecules',
  organisms: 'Organisms',
}

const CATEGORY_DESCRIPTIONS: Record<Category, string> = {
  foundations: 'Design tokens — color, type, spacing, elevation',
  atoms: 'Smallest UI building blocks',
  molecules: 'Composed from multiple atoms',
  organisms: 'Complex, self-contained UI regions',
}

// ─── Anatomy data: Figma tokens & variables per component ─────────────────────
type AnatomyEntry = {
  property: string
  token: string
  variable: string
  value: string
}

const ANATOMY: Record<string, AnatomyEntry[]> = {
  colors: [
    { property: 'Brand/500',       token: '--brand',        variable: 'Brand Blue/500 (8a8916d8…)', value: '#1770EF' },
    { property: 'Brand/600',       token: '--brand-pressed', variable: 'Brand Blue/600 (9d8a3571…)', value: '#0D5ED4' },
    { property: 'Brand/400',       token: '--brand-hover',  variable: 'Brand Blue/400 (fa855e11…)', value: '#4D8FF5' },
    { property: 'Base/900',        token: 'text-base-900',  variable: 'Base/Base - 900 (60221769…)', value: '#030D2D' },
    { property: 'Base/600',        token: 'text-base-600',  variable: 'Base/Base - 600 (0a2933ab…)', value: '#4F566C' },
    { property: 'Base/100',        token: 'text-base-100',  variable: 'Base/Base - 100 (82f2b096…)', value: '#CDCFD5' },
    { property: 'Base/50',         token: 'text-base-50',   variable: 'Base/Base - 50 (53dee2fa…)', value: '#E6E7EA' },
    { property: 'White',           token: 'bg-bg-elements', variable: 'Neutral/White (3edd2c47…)', value: '#FFFFFF' },
    { property: 'Surface',         token: 'bg-bg-page',     variable: 'Neutral/Surface (bcdcb8da…)', value: '#F1F1F1' },
    { property: 'Error',           token: '--error',        variable: 'Status/Error (38b180f4…)', value: '#C9392A' },
    { property: 'Success',         token: '--success',      variable: 'Status/Success (c053dc86…)', value: '#16A34A' },
    { property: 'Warning',         token: '--warning',      variable: 'Status/Warning (737cf720…)', value: '#FFB700' },
  ],
  typography: [
    { property: 'Display Font',    token: 'font-display',   variable: 'DisplayFont', value: 'Bricolage Grotesque' },
    { property: 'Body Font',       token: 'font-body',      variable: 'BodyFont', value: 'Inter' },
    { property: 'Size / 4XL',      token: 'text-4xl',       variable: 'size/4xl', value: '36px' },
    { property: 'Size / 2XL',      token: 'text-2xl',       variable: 'size/2xl', value: '24px' },
    { property: 'Size / L',        token: 'text-l',         variable: 'size/l', value: '20px' },
    { property: 'Size / M',        token: 'text-m',         variable: 'size/m', value: '16px' },
    { property: 'Size / S',        token: 'text-s',         variable: 'size/s', value: '14px' },
    { property: 'Size / XS',       token: 'text-xs',        variable: 'size/xs', value: '12px' },
    { property: 'Size / 2XS',      token: 'text-2xs',       variable: 'size/2xs', value: '11px' },
  ],
  spacing: [
    { property: 'xxxs', token: 'gap-xxxs / p-xxxs',  variable: 'space/xxxs', value: '2px' },
    { property: 'xxs',  token: 'gap-xxs / p-xxs',    variable: 'space/xxs',  value: '4px' },
    { property: 'xs',   token: 'gap-xs / p-xs',      variable: 'space/xs',   value: '8px' },
    { property: 's',    token: 'gap-s / p-s',         variable: 'space/s',    value: '12px' },
    { property: 'm',    token: 'gap-m / p-m',         variable: 'space/m',    value: '16px' },
    { property: 'l',    token: 'gap-l / p-l',         variable: 'space/l',    value: '20px' },
    { property: 'xl',   token: 'gap-xl / p-xl',       variable: 'space/xl',   value: '24px' },
    { property: 'xxl',  token: 'gap-xxl / p-xxl',     variable: 'space/xxl',  value: '32px' },
    { property: 'xxxl', token: 'gap-xxxl / p-xxxl',   variable: 'space/xxxl', value: '40px' },
  ],
  'shadows-radii': [
    { property: 'Shadow SM',       token: 'shadow-sm',     variable: 'elevation/sm',    value: '0 1px 2px rgba(0,0,0,0.06)' },
    { property: 'Shadow Normal',   token: 'shadow-normal', variable: 'elevation/normal', value: '0 2px 8px rgba(0,0,0,0.08)' },
    { property: 'Shadow Big',      token: 'shadow-big',    variable: 'elevation/big',    value: '0 8px 24px rgba(0,0,0,0.12)' },
    { property: 'Radius XS',       token: 'rounded-xs',    variable: 'radius/xs',  value: '4px' },
    { property: 'Radius S',        token: 'rounded-s',     variable: 'radius/s',   value: '6px' },
    { property: 'Radius M',        token: 'rounded-m',     variable: 'radius/m',   value: '8px' },
    { property: 'Radius XL',       token: 'rounded-xl',    variable: 'radius/xl',  value: '12px' },
    { property: 'Radius 2XL',      token: 'rounded-2xl',   variable: 'radius/2xl', value: '16px' },
    { property: 'Radius Round',    token: 'rounded-round', variable: 'radius/round', value: '999px' },
  ],
  icons: [
    { property: 'Icon Color (default)', token: 'text-text-secondary',  variable: 'Text/Secondary (0a2933ab…)', value: '#4F566C' },
    { property: 'Icon Color (active)',   token: 'text-brand',          variable: 'Brand Blue/500 (8a8916d8…)', value: '#1770EF' },
    { property: 'Icon Size (default)',   token: '24px',                variable: 'size/icon-md',  value: '24px' },
    { property: 'Icon Size (small)',     token: '16px',                variable: 'size/icon-sm',  value: '16px' },
  ],
  'dark-mode': [
    { property: 'Background/Page BG',  token: 'bg-bg-page',       variable: '9cf5e54d… (Light: Surface, Dark: Base-910)', value: '#F1F1F1 → #1A2236' },
    { property: 'Background/Card',     token: 'bg-bg-elements',   variable: '2910233d… (Light: White, Dark: Base-925)',   value: '#FFFFFF → #111827' },
    { property: 'Text/Primary',        token: 'text-text-primary', variable: 'Text/Primary → Base-900 / White',           value: '#030D2D → #FFFFFF' },
    { property: 'Text/Secondary',      token: 'text-text-secondary', variable: 'Text/Secondary → Base-600 / Base-300',   value: '#4F566C → #9A9EAB' },
    { property: 'Border/Default',      token: 'border-border-default', variable: 'Border/Default → Base-100 / White-12', value: '#CDCFD5 → rgba(255,255,255,0.12)' },
  ],
  button: [
    { property: 'Primary BG',          token: 'bg-brand',                variable: 'Brand Blue/500 (8a8916d8…)',   value: '#1770EF' },
    { property: 'Primary BG (hover)',   token: 'bg-brand-hover',          variable: 'Brand Blue/400 (fa855e11…)',   value: '#4D8FF5' },
    { property: 'Primary BG (pressed)', token: 'bg-brand-pressed',       variable: 'Brand Blue/600 (9d8a3571…)',   value: '#0D5ED4' },
    { property: 'Primary Text',         token: 'text-white',             variable: 'Neutral/White (3edd2c47…)',    value: '#FFFFFF' },
    { property: 'Secondary BG',         token: 'bg-bg-subtle',           variable: 'Background/Subtle (389caeb1…)', value: '#E6E7EA' },
    { property: 'Outline Border',       token: 'border-border-default',  variable: 'Border/Default (82f2b096…)',   value: '#CDCFD5' },
    { property: 'Danger BG',            token: 'bg-error',               variable: 'Status/Error (38b180f4…)',     value: '#C9392A' },
    { property: 'Font',                 token: 'font-display',           variable: 'DisplayFont',                  value: 'Bricolage Grotesque' },
    { property: 'Border Radius',        token: 'rounded-m',              variable: 'radius/m',                     value: '8px' },
    { property: 'Padding (md)',         token: 'px-m py-xs',             variable: 'space/m, space/xs',             value: '16px 8px' },
    { property: 'Figma Component',      token: 'Button set',             variable: 'Key: d4ae660adb35…',           value: 'Apparatus/Button' },
  ],
  input: [
    { property: 'Border (default)',     token: 'border-border-default',  variable: 'Border/Default (82f2b096…)',   value: '#CDCFD5' },
    { property: 'Border (focus)',       token: 'border-border-focus',    variable: 'Brand Blue/500 (8a8916d8…)',   value: '#1770EF' },
    { property: 'Border (error)',       token: 'border-error',           variable: 'Status/Error (38b180f4…)',     value: '#C9392A' },
    { property: 'BG',                   token: 'bg-bg-elements',         variable: 'Neutral/White (3edd2c47…)',    value: '#FFFFFF' },
    { property: 'Text',                 token: 'text-text-primary',      variable: 'Base/Base - 900 (60221769…)',  value: '#030D2D' },
    { property: 'Placeholder',          token: 'text-text-placeholder',  variable: 'Base/Base - 300 (dc95cee5…)',  value: '#9A9EAB' },
    { property: 'Label',               token: 'text-text-tertiary',     variable: 'Base/Base - 400 (188d3920…)',  value: '#818696' },
    { property: 'Font',                 token: 'font-body',              variable: 'BodyFont',                     value: 'Inter' },
    { property: 'Radius',              token: 'rounded-s',              variable: 'radius/s',                     value: '6px' },
    { property: 'Padding (md)',         token: 'px-s h-10',              variable: 'space/s',                      value: '12px, h 40px' },
  ],
  checkbox: [
    { property: 'Border (unchecked)',   token: 'border-border-default',  variable: 'Border/Default (82f2b096…)',   value: '#CDCFD5' },
    { property: 'Fill (checked)',       token: 'bg-brand',               variable: 'Brand Blue/500 (8a8916d8…)',   value: '#1770EF' },
    { property: 'Checkmark',           token: 'text-white',             variable: 'Neutral/White (3edd2c47…)',    value: '#FFFFFF' },
    { property: 'Label',               token: 'text-text-primary',      variable: 'Base/Base - 900 (60221769…)',  value: '#030D2D' },
    { property: 'Size (md)',            token: 'w-[18px] h-[18px]',     variable: '—',                            value: '18px' },
    { property: 'Size (sm)',            token: 'w-[14px] h-[14px]',     variable: '—',                            value: '14px' },
    { property: 'Radius',              token: 'rounded-[4px]',          variable: 'radius/xs',                    value: '4px' },
  ],
  toggle: [
    { property: 'Track (off)',          token: 'bg-bg-subtle',           variable: 'Background/Subtle (389caeb1…)', value: '#E6E7EA' },
    { property: 'Track (on)',           token: 'bg-brand',               variable: 'Brand Blue/500 (8a8916d8…)',   value: '#1770EF' },
    { property: 'Thumb',               token: 'bg-white',               variable: 'Neutral/White (3edd2c47…)',    value: '#FFFFFF' },
    { property: 'Label',               token: 'text-text-primary',      variable: 'Base/Base - 900 (60221769…)',  value: '#030D2D' },
    { property: 'Track Radius',         token: 'rounded-round',          variable: 'radius/round',                value: '999px' },
    { property: 'Track Size',           token: 'w-[36px] h-[20px]',     variable: '—',                            value: '36×20px' },
  ],
  'event-tag': [
    { property: 'BG',                   token: 'bg-bg-subtle',           variable: 'Background/Subtle → Base/50', value: '#E6E7EA' },
    { property: 'Text',                 token: 'text-text-secondary',    variable: 'Base/Base - 600 (0a2933ab…)', value: '#4F566C' },
    { property: 'Font',                 token: 'font-body text-2xs',     variable: 'BodyFont, size/2xs',          value: 'Inter 11px' },
    { property: 'Padding',              token: 'px-xs py-xxxs',          variable: 'space/xs, space/xxxs',        value: '8px 2px' },
    { property: 'Radius',              token: 'rounded-round',          variable: 'radius/round',                value: '999px' },
  ],
  'sidebar-label': [
    { property: 'Text (muted)',         token: 'text-text-tertiary',     variable: 'Base/Base - 400 (188d3920…)', value: '#818696' },
    { property: 'Text (outlined)',      token: 'text-text-secondary',    variable: 'Base/Base - 600 (0a2933ab…)', value: '#4F566C' },
    { property: 'Border (outlined)',    token: 'border-border-default',  variable: 'Border/Default (82f2b096…)',  value: '#CDCFD5' },
    { property: 'Font',                 token: 'font-display text-2xs',  variable: 'DisplayFont, size/2xs',       value: 'Bricolage 11px' },
  ],
  'sidebar-nav': [
    { property: 'BG (active)',          token: 'bg-bg-tint',             variable: 'Brand Blue/Tint (d1a9b4c4…)', value: 'rgba(23,112,239,0.14)' },
    { property: 'BG (hover)',           token: 'bg-bg-tint-light',       variable: 'Brand Blue/Tint Light (c19e1b61…)', value: 'rgba(23,112,239,0.07)' },
    { property: 'Text (active)',        token: 'text-brand',             variable: 'Brand Blue/500 (8a8916d8…)', value: '#1770EF' },
    { property: 'Text (default)',       token: 'text-text-secondary',    variable: 'Base/Base - 600 (0a2933ab…)', value: '#4F566C' },
    { property: 'Text (disabled)',      token: 'text-text-placeholder',  variable: 'Base/Base - 300 (dc95cee5…)', value: '#9A9EAB' },
    { property: 'Icon Size',            token: '20px',                   variable: 'size/icon-md',                value: '20px' },
    { property: 'Padding',              token: 'px-m py-xs',             variable: 'space/m, space/xs',           value: '16px 8px' },
  ],
  'sidebar-task': [
    { property: 'BG',                   token: 'bg-bg-elements',         variable: 'Neutral/White (3edd2c47…)',   value: '#FFFFFF' },
    { property: 'BG (hover)',           token: 'bg-bg-subtle',           variable: 'Background/Subtle (389caeb1…)', value: '#E6E7EA' },
    { property: 'Text',                 token: 'text-text-primary',      variable: 'Base/Base - 900 (60221769…)', value: '#030D2D' },
    { property: 'Font',                 token: 'font-body text-s',       variable: 'BodyFont, size/s',            value: 'Inter 14px' },
    { property: 'Padding',              token: 'px-m py-xs',             variable: 'space/m, space/xs',           value: '16px 8px' },
  ],
  'sidebar-profile': [
    { property: 'Avatar BG',            token: 'bg-brand',               variable: 'Brand Blue/500 (8a8916d8…)', value: '#1770EF' },
    { property: 'Name',                 token: 'text-text-primary',      variable: 'Base/Base - 900 (60221769…)', value: '#030D2D' },
    { property: 'Language Badge',        token: 'text-text-tertiary',     variable: 'Base/Base - 400 (188d3920…)', value: '#818696' },
    { property: 'Font (name)',           token: 'font-display text-s',    variable: 'DisplayFont, size/s',         value: 'Bricolage 14px' },
  ],
  'agent-tab': [
    { property: 'BG (active)',          token: 'var(--bg-highlighted)',   variable: 'Background/Highlighted',     value: '#1770EF' },
    { property: 'BG (default)',         token: 'transparent',            variable: '—',                          value: 'transparent' },
    { property: 'BG (hover)',           token: 'var(--bg-tint)',         variable: 'Background/Highlighted Tint', value: 'rgba(23,112,239,0.14)' },
    { property: 'Text (active)',        token: 'var(--text-on-brand)',   variable: 'Text & Icon/OnBrand',        value: '#FFFFFF' },
    { property: 'Text (default)',       token: 'var(--text-secondary)',  variable: 'Text & Icon/Secondary',      value: '#4F566C' },
    { property: 'Text (hover)',         token: 'var(--text-primary)',    variable: 'Text & Icon/Primary',        value: '#030D2D' },
    { property: 'Radius',              token: 'rounded-m',              variable: 'radius/m',                   value: '8px' },
    { property: 'Padding',              token: 'px-s py-xs',             variable: 'space/s, space/xs',          value: '12px 8px' },
  ],
  'video-card': [
    { property: 'Card BG',              token: 'bg-bg-elements',         variable: 'Neutral/White (3edd2c47…)',  value: '#FFFFFF' },
    { property: 'Card Border',          token: 'border-border-subtle',   variable: 'Border/Subtle',              value: '#E6E7EA' },
    { property: 'Card Radius',          token: 'rounded-2xl',            variable: 'radius/2xl',                 value: '16px' },
    { property: 'Card Shadow',          token: 'shadow-sm',              variable: 'elevation/sm',               value: '0 1px 2px rgba(0,0,0,0.06)' },
    { property: 'Title',                token: 'font-display text-s',    variable: 'DisplayFont, size/s',        value: 'Bricolage 14px' },
    { property: 'Meta Text',            token: 'text-text-tertiary',     variable: 'Base/Base - 400 (188d3920…)', value: '#818696' },
    { property: 'Padding',              token: 'p-m',                    variable: 'space/m',                    value: '16px' },
  ],
  'popup-modal': [
    { property: 'Overlay',              token: 'bg-black/50',            variable: 'Translucents Dark/Black-50 (59650bbd…)', value: 'rgba(0,0,0,0.5)' },
    { property: 'Panel BG',             token: 'bg-bg-elements',         variable: 'Neutral/White (3edd2c47…)',  value: '#FFFFFF' },
    { property: 'Panel Radius',         token: 'rounded-2xl',            variable: 'radius/2xl',                 value: '16px' },
    { property: 'Panel Shadow',         token: 'shadow-big',             variable: 'elevation/big',              value: '0 8px 24px rgba(0,0,0,0.12)' },
    { property: 'Title Font',           token: 'font-display text-l',    variable: 'DisplayFont, size/l',        value: 'Bricolage 20px' },
    { property: 'Body Text',            token: 'text-text-secondary',    variable: 'Base/Base - 600 (0a2933ab…)', value: '#4F566C' },
    { property: 'Padding',              token: 'p-xl',                   variable: 'space/xl',                   value: '24px' },
  ],
  'select-dropdown': [
    { property: 'Panel BG',             token: 'bg-bg-elements',         variable: 'Neutral/White (3edd2c47…)',  value: '#FFFFFF' },
    { property: 'Panel Border',         token: 'border-border-default',  variable: 'Border/Default (82f2b096…)', value: '#CDCFD5' },
    { property: 'Panel Radius',         token: 'rounded-xl',             variable: 'radius/xl',                  value: '12px' },
    { property: 'Item (selected)',       token: 'bg-bg-tint-light',       variable: 'Brand Blue/Tint Light (c19e1b61…)', value: 'rgba(23,112,239,0.07)' },
    { property: 'Item Text',            token: 'text-text-primary',      variable: 'Base/Base - 900 (60221769…)', value: '#030D2D' },
    { property: 'Header Text',          token: 'text-text-tertiary',     variable: 'Base/Base - 400 (188d3920…)', value: '#818696' },
    { property: 'Item Padding',         token: 'px-s py-xxs',            variable: 'space/s, space/xxs',         value: '12px 4px' },
  ],
  'input-console': [
    { property: 'BG',                   token: '.input-console',           variable: 'Background/Elements (Neutral/White)', value: '#FFFFFF' },
    { property: 'Border (default)',     token: '.input-console',           variable: 'Border/Default (82f2b096…)',   value: '#CDCFD5' },
    { property: 'Border (hover/focus)', token: ':hover / :focus-within',   variable: 'Brand Blue/500 (8a8916d8…)',   value: '#1770EF' },
    { property: 'Radius',              token: '.input-console',           variable: 'radius/container',              value: '20px' },
    { property: 'Padding (default)',    token: '.input-console',           variable: 'space/m',                      value: '16px' },
    { property: 'Padding (mini)',       token: '.input-console-mini',      variable: 'space/m space/l',               value: '16px 20px' },
    { property: 'Gap',                  token: '.input-console',           variable: 'space/s',                      value: '12px' },
    { property: 'Text (input)',         token: '.input-console-textarea',  variable: 'BodyFont, size/m',             value: 'Inter 16px' },
    { property: 'Placeholder',          token: '::placeholder',            variable: 'Base/Base - 300 (dc95cee5…)',  value: '#9A9EAB' },
    { property: 'Platform Label',       token: '.input-console-platform-label', variable: 'DisplayFont, size/xs',   value: 'Bricolage 12px 600' },
    { property: 'Platform Border',      token: '.input-console-platform',  variable: 'Border/Subtle (E6E7EA)',       value: '#E6E7EA 1.5px' },
    { property: 'Send (inactive)',      token: '.input-console-send-inactive', variable: 'Base/Base - 300 (dc95cee5…)', value: '#9A9EAB 50%' },
    { property: 'Send (active)',        token: '.input-console-send-active',   variable: 'Brand Blue/500 (8a8916d8…)', value: '#1770EF 100%' },
    { property: 'Send Radius',          token: 'rounded-round',            variable: 'radius/round',                 value: '9999px' },
  ],
  'sidebar-organism': [
    { property: 'BG',                   token: 'bg-bg-elements',         variable: 'Neutral/White (3edd2c47…)',  value: '#FFFFFF' },
    { property: 'Border Right',         token: 'border-border-subtle',   variable: 'Border/Subtle',              value: '#E6E7EA' },
    { property: 'Width',                token: 'w-[300px]',              variable: '—',                          value: '300px' },
    { property: 'Padding',              token: 'p-m',                    variable: 'space/m',                    value: '16px' },
    { property: 'Gap',                  token: 'gap-xxs',                variable: 'space/xxs',                  value: '4px' },
  ],
  'hero-section': [
    { property: 'Heading',              token: 'font-display text-4xl',  variable: 'DisplayFont, size/4xl',      value: 'Bricolage 36px' },
    { property: 'Heading Color',        token: 'text-text-primary',      variable: 'Base/Base - 900 (60221769…)', value: '#030D2D' },
    { property: 'Subtitle',             token: 'text-text-secondary',    variable: 'Base/Base - 600 (0a2933ab…)', value: '#4F566C' },
    { property: 'Section Padding',      token: 'py-xxl px-xxl',          variable: 'space/xxl',                  value: '32px' },
  ],
  'videos-container': [
    { property: 'Grid Gap',             token: 'gap-[12px]',             variable: 'space/s',                    value: '12px' },
    { property: 'BG',                   token: 'bg-bg-page',             variable: 'Background/Page BG (9cf5e54d…)', value: '#F1F1F1' },
    { property: 'Padding',              token: 'p-xl',                   variable: 'space/xl',                   value: '24px' },
  ],
}

// ─── Section wrapper ───────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-l">
      <div className="flex items-center gap-m">
        <h2 className="font-display text-l font-semibold text-text-primary whitespace-nowrap">{title}</h2>
        <div className="flex-1 h-[1px] bg-border-subtle" />
      </div>
      <div>{children}</div>
    </section>
  )
}

// ─── Anatomy panel ────────────────────────────────────────────────────────────
function AnatomyPanel({ sectionId }: { sectionId: string }) {
  const entries = ANATOMY[sectionId]
  if (!entries) return <p className="font-body text-xs text-text-tertiary italic">No anatomy data for this section.</p>
  return (
    <div className="bg-bg-elements border border-border-subtle rounded-xl overflow-hidden">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-border-subtle bg-bg-page">
            <th className="font-display text-2xs font-semibold text-text-tertiary uppercase tracking-[1px] px-m py-xs">Property</th>
            <th className="font-display text-2xs font-semibold text-text-tertiary uppercase tracking-[1px] px-m py-xs">Tailwind Token</th>
            <th className="font-display text-2xs font-semibold text-text-tertiary uppercase tracking-[1px] px-m py-xs">Figma Variable</th>
            <th className="font-display text-2xs font-semibold text-text-tertiary uppercase tracking-[1px] px-m py-xs">Value</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e, i) => (
            <tr key={i} className="border-b border-border-subtle last:border-b-0 hover:bg-bg-page/50 transition-colors">
              <td className="font-body text-xs text-text-primary px-m py-xs">{e.property}</td>
              <td className="font-code text-2xs text-brand px-m py-xs">{e.token}</td>
              <td className="font-code text-2xs text-text-secondary px-m py-xs">{e.variable}</td>
              <td className="font-code text-2xs text-text-tertiary px-m py-xs">{e.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Token swatch ──────────────────────────────────────────────────────────────
function ColorSwatch({ name, hex, token, usage }: { name: string; hex: string; token: string; usage?: string }) {
  const isLight = hex === '#FFFFFF' || hex === '#F5F5F5' || hex === '#F1F1F1'
  return (
    <div className="flex flex-col gap-xs">
      <div
        className={`w-full h-[60px] rounded-xl border ${isLight ? 'border-border-subtle' : 'border-transparent'}`}
        style={{ backgroundColor: hex }}
      />
      <div className="flex flex-col gap-[2px]">
        <p className="font-display text-xs font-semibold text-text-primary">{name}</p>
        <p className="font-code text-2xs text-text-secondary">{hex}</p>
        <p className="font-body text-2xs text-text-tertiary">{token}</p>
        {usage && <p className="font-body text-2xs text-text-tertiary italic">{usage}</p>}
      </div>
    </div>
  )
}

// ─── Type specimen ─────────────────────────────────────────────────────────────
function TypeSpec({
  label,
  className,
  sample = 'The quick brown fox',
}: {
  label: string
  className: string
  sample?: string
}) {
  return (
    <div className="flex items-baseline gap-m">
      <span className="font-body text-2xs text-text-tertiary w-[160px] shrink-0">{label}</span>
      <span className={className}>{sample}</span>
    </div>
  )
}

// ─── PopupModal demos ─────────────────────────────────────────────────────────
function ModalDemos() {
  const [open, setOpen] = useState<string | null>(null)
  return (
    <div className="flex flex-col gap-s">
      <p className="font-display text-xs font-semibold text-text-tertiary uppercase tracking-[1.5px]">PopupModal — Variations</p>
      <div className="flex flex-wrap gap-s">
        <Button variant="outline" size="md" onClick={() => setOpen('simple')}>Simple confirm</Button>
        <Button variant="outline" size="md" onClick={() => setOpen('body')}>With body text</Button>
        <Button variant="outline" size="md" onClick={() => setOpen('content')}>With content slot</Button>
        <Button variant="outline" size="md" onClick={() => setOpen('wide')}>Wide (lg)</Button>
        <Button variant="outline" size="md" onClick={() => setOpen('danger')}>Danger action</Button>
      </div>

      <PopupModal
        isOpen={open === 'simple'}
        onClose={() => setOpen(null)}
        title="Delete Connector"
        primaryLabel="Delete"
        primaryVariant="danger"
        secondaryLabel="Cancel"
      />
      <PopupModal
        isOpen={open === 'body'}
        onClose={() => setOpen(null)}
        title="Share Feedback"
        body="What didn't you like about this response?"
        primaryLabel="Submit feedback"
      />
      <PopupModal
        isOpen={open === 'content'}
        onClose={() => setOpen(null)}
        title="Share Feedback"
        body="What didn't you like about this response?"
        primaryLabel="Submit feedback"
      >
        <div className="flex flex-wrap gap-xs">
          {['Inaccurate', 'Too long', 'Off topic', 'Missing context', 'Unhelpful', 'Other'].map(tag => (
            <button
              key={tag}
              className="px-s py-xxs rounded-round border border-border-default font-body text-xs text-text-secondary hover:border-border-focus hover:text-text-brand transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      </PopupModal>
      <PopupModal
        isOpen={open === 'wide'}
        onClose={() => setOpen(null)}
        title="Schedule a task"
        size="lg"
        primaryLabel="Save task"
      >
        <div className="flex flex-col gap-m">
          <div className="flex flex-col gap-xxs">
            <label className="font-body text-2xs text-text-tertiary">Task name</label>
            <input
              type="text"
              placeholder="Enter task name..."
              className="w-full h-10 px-s rounded-s border border-border-default font-body text-s text-text-primary placeholder:text-text-placeholder focus:outline-none focus:border-border-focus"
            />
          </div>
          <div className="flex flex-col gap-xxs">
            <label className="font-body text-2xs text-text-tertiary">Description</label>
            <textarea
              rows={3}
              placeholder="Add a description..."
              className="w-full px-s py-xs rounded-s border border-border-default font-body text-s text-text-primary placeholder:text-text-placeholder focus:outline-none focus:border-border-focus"
            />
          </div>
        </div>
      </PopupModal>
      <PopupModal
        isOpen={open === 'danger'}
        onClose={() => setOpen(null)}
        title="Delete Session"
        body="This action cannot be undone. The session and all associated data will be permanently removed."
        primaryLabel="Delete session"
        primaryVariant="danger"
        secondaryLabel="Keep session"
      />
    </div>
  )
}

// ─── Checkbox / Radio / Toggle interactive demos ──────────────────────────────
function FormControlDemos() {
  const [checks, setChecks] = useState({ a: false, b: true, c: false, d: true })
  const [radios, setRadios] = useState('opt1')
  const [toggles, setToggles] = useState({ t1: false, t2: true, t3: false })

  return (
    <div className="flex flex-col gap-xl">
      {/* Checkbox */}
      <div className="flex flex-col gap-s">
        <p className="font-display text-xs font-semibold text-text-tertiary uppercase tracking-[1.5px]">Checkbox — States</p>
        <div className="flex flex-wrap gap-xl items-start">
          <Checkbox label="Unchecked" checked={checks.a} onChange={() => setChecks(p => ({ ...p, a: !p.a }))} />
          <Checkbox label="Checked" checked={checks.b} onChange={() => setChecks(p => ({ ...p, b: !p.b }))} />
          <Checkbox label="Indeterminate" checked={checks.c} indeterminate onChange={() => setChecks(p => ({ ...p, c: !p.c }))} />
          <Checkbox label="Disabled checked" checked disabled />
          <Checkbox label="Disabled unchecked" checked={false} disabled />
        </div>
      </div>

      {/* Checkbox sizes */}
      <div className="flex flex-col gap-s">
        <p className="font-display text-xs font-semibold text-text-tertiary uppercase tracking-[1.5px]">Checkbox — Sizes</p>
        <div className="flex flex-wrap gap-xl items-center">
          <Checkbox label="Medium (default)" checked={checks.d} onChange={() => setChecks(p => ({ ...p, d: !p.d }))} />
          <Checkbox label="Small" size="sm" checked={checks.d} onChange={() => setChecks(p => ({ ...p, d: !p.d }))} />
        </div>
      </div>

      {/* Radio */}
      <div className="flex flex-col gap-s">
        <p className="font-display text-xs font-semibold text-text-tertiary uppercase tracking-[1.5px]">Radio Button</p>
        <div className="flex flex-wrap gap-xl items-start">
          <Checkbox radio name="demo-radio" label="Option 1" checked={radios === 'opt1'} onChange={() => setRadios('opt1')} />
          <Checkbox radio name="demo-radio" label="Option 2" checked={radios === 'opt2'} onChange={() => setRadios('opt2')} />
          <Checkbox radio name="demo-radio" label="Option 3" checked={radios === 'opt3'} onChange={() => setRadios('opt3')} />
          <Checkbox radio label="Disabled" checked disabled />
        </div>
      </div>

      {/* Radio sizes */}
      <div className="flex flex-col gap-s">
        <p className="font-display text-xs font-semibold text-text-tertiary uppercase tracking-[1.5px]">Radio — Sizes</p>
        <div className="flex flex-wrap gap-xl items-center">
          <Checkbox radio label="Medium" checked />
          <Checkbox radio label="Small" size="sm" checked />
        </div>
      </div>

      {/* Toggle */}
      <div className="flex flex-col gap-s">
        <p className="font-display text-xs font-semibold text-text-tertiary uppercase tracking-[1.5px]">Toggle — States</p>
        <div className="flex flex-wrap gap-xl items-start">
          <Toggle label="Off" checked={toggles.t1} onChange={() => setToggles(p => ({ ...p, t1: !p.t1 }))} />
          <Toggle label="On" checked={toggles.t2} onChange={() => setToggles(p => ({ ...p, t2: !p.t2 }))} />
          <Toggle label="Label left" labelPosition="left" checked={toggles.t3} onChange={() => setToggles(p => ({ ...p, t3: !p.t3 }))} />
          <Toggle label="Disabled off" checked={false} disabled />
          <Toggle label="Disabled on" checked disabled />
        </div>
      </div>
    </div>
  )
}

// ─── Sidebar Navigation ──────────────────────────────────────────────────────
function DSSidebar({
  activeId,
  onNavigate,
}: {
  activeId: string
  onNavigate: (id: string) => void
}) {
  const categories: Category[] = ['foundations', 'atoms', 'molecules', 'organisms']

  return (
    <nav className="flex flex-col gap-l">
      {categories.map(cat => {
        const items = SIDEBAR_ENTRIES.filter(e => e.category === cat)
        return (
          <div key={cat} className="flex flex-col gap-xxs">
            <div className="flex flex-col gap-xxxs px-s mb-xxs">
              <p className="font-display text-2xs font-semibold text-text-tertiary uppercase tracking-[1.5px]">
                {CATEGORY_LABELS[cat]}
              </p>
              <p className="font-body text-2xs text-text-placeholder leading-tight">
                {CATEGORY_DESCRIPTIONS[cat]}
              </p>
            </div>
            {items.map(entry => {
              const isActive = activeId === entry.id
              return (
                <button
                  key={entry.id}
                  onClick={() => onNavigate(entry.id)}
                  className={`
                    text-left px-s py-xxs rounded-m transition-colors font-body text-xs
                    ${isActive
                      ? 'bg-bg-tint text-brand font-semibold'
                      : 'text-text-secondary hover:bg-bg-tint-light hover:text-text-primary'
                    }
                  `}
                >
                  {entry.label}
                </button>
              )
            })}
          </div>
        )
      })}
    </nav>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION CONTENT RENDERER
// ═══════════════════════════════════════════════════════════════════════════════
function SectionContent({ activeId, showAnatomy }: { activeId: string; showAnatomy: boolean }) {
  switch (activeId) {

    case 'colors':
      return (
        <Section title="Color Tokens">
          <div className="flex flex-col gap-xl">
            {showAnatomy && <AnatomyPanel sectionId="colors" />}
            <div>
              <p className="font-display text-xs font-semibold text-text-tertiary uppercase tracking-[1.5px] mb-s">Brand Blue</p>
              <div className="grid grid-cols-6 gap-m">
                <ColorSwatch name="Brand/600" hex="#0D5ED4" token="--brand-pressed" usage="CTA pressed" />
                <ColorSwatch name="Brand/500" hex="#1770EF" token="--brand" usage="Primary CTA, active" />
                <ColorSwatch name="Brand/400" hex="#4D8FF5" token="--brand-hover" usage="Hover state" />
                <ColorSwatch name="Brand Tint" hex="rgba(23,112,239,0.14)" token="--bg-tint" usage="Active nav bg" />
                <ColorSwatch name="Tint Light" hex="rgba(23,112,239,0.07)" token="--bg-tint-light" usage="Hover tint" />
                <ColorSwatch name="Tint Dark" hex="rgba(23,112,239,0.40)" token="--bg-tint-dark" usage="Selected dark" />
              </div>
            </div>
            <div>
              <p className="font-display text-xs font-semibold text-text-tertiary uppercase tracking-[1.5px] mb-s">Base Scale</p>
              <div className="grid grid-cols-7 gap-m">
                <ColorSwatch name="Base/900" hex="#030D2D" token="text-base-900" usage="Headings" />
                <ColorSwatch name="Base/800" hex="#1C2542" token="text-base-800" />
                <ColorSwatch name="Base/700" hex="#353D57" token="text-base-700" />
                <ColorSwatch name="Base/600" hex="#4F566C" token="text-base-600" usage="Secondary" />
                <ColorSwatch name="Base/400" hex="#818696" token="text-base-400" usage="Tertiary" />
                <ColorSwatch name="Base/100" hex="#CDCFD5" token="text-base-100" usage="Borders" />
                <ColorSwatch name="Base/50" hex="#E6E7EA" token="text-base-50" usage="Tag bg" />
              </div>
            </div>
            <div>
              <p className="font-display text-xs font-semibold text-text-tertiary uppercase tracking-[1.5px] mb-s">Semantic Backgrounds</p>
              <div className="grid grid-cols-5 gap-m">
                <ColorSwatch name="Page BG" hex="#F1F1F1" token="bg-bg-page" usage="Page background" />
                <ColorSwatch name="Card/Elements" hex="#FFFFFF" token="bg-bg-elements" usage="Cards, sidebar" />
                <ColorSwatch name="Subtle" hex="#E6E7EA" token="bg-bg-subtle" usage="Hover bg, tags" />
                <ColorSwatch name="Highlighted" hex="#1770EF" token="bg-brand" usage="Active tab" />
                <ColorSwatch name="Surface Pale" hex="#F5F5F5" token="bg-page-pale" usage="Alt page bg" />
              </div>
            </div>
            <div>
              <p className="font-display text-xs font-semibold text-text-tertiary uppercase tracking-[1.5px] mb-s">Status</p>
              <div className="grid grid-cols-6 gap-m">
                <ColorSwatch name="Error" hex="#C9392A" token="--error" />
                <ColorSwatch name="Warning" hex="#FFB700" token="--warning" />
                <ColorSwatch name="Success" hex="#16A34A" token="--success" />
                <ColorSwatch name="Notice" hex="#67C3BB" token="--notice" />
                <ColorSwatch name="Purple" hex="#7B4CFF" token="--purple" usage="AI / premium" />
                <ColorSwatch name="Pink" hex="#C20568" token="--pink" usage="Hot accent" />
              </div>
            </div>
          </div>
        </Section>
      )

    case 'typography':
      return (
        <Section title="Typography">
          <div className="flex flex-col gap-l">
            {showAnatomy && <AnatomyPanel sectionId="typography" />}
            <div className="flex flex-col gap-s bg-bg-elements rounded-2xl p-xl border border-border-subtle">
              <TypeSpec label="Title/4XL ExtraBold" className="font-display text-4xl font-extrabold text-text-primary leading-[1.2]" sample="Get to know your game" />
              <TypeSpec label="Title/2XL Medium" className="font-display text-2xl font-medium text-text-primary leading-[1.2]" sample="Session Analysis Dashboard" />
              <TypeSpec label="Title/L Medium" className="font-display text-l font-medium text-text-primary leading-[1.5]" sample="Core Agents" />
              <TypeSpec label="Title/M Semibold" className="font-display text-m font-semibold text-text-primary leading-[1.5]" sample="Session #2847" />
              <TypeSpec label="Title/S Semibold" className="font-display text-s font-semibold text-text-primary leading-[1.5]" sample="Free Fire — Action" />
              <TypeSpec label="Title/XS Semibold" className="font-display text-xs font-semibold text-text-tertiary leading-[1.5]" sample="CORE AGENTS" />
              <div className="h-[1px] bg-border-subtle my-xs" />
              <TypeSpec label="Body/L Regular" className="font-body text-m font-normal text-text-primary leading-[1.5]" sample="Search for actions, objects and events in your game..." />
              <TypeSpec label="Body/M Regular" className="font-body text-s font-normal text-text-secondary leading-[1.5]" sample="Competitive ranked match with strategic gameplay." />
              <TypeSpec label="Body/S Regular" className="font-body text-xs font-normal text-text-secondary leading-[1.5]" sample="10/11/25 · 4:05 duration" />
              <TypeSpec label="Body/XS Medium" className="font-body text-2xs font-medium text-text-primary tracking-[0.2px] leading-[16px]" sample="items looted · game crashed" />
              <div className="h-[1px] bg-border-subtle my-xs" />
              <TypeSpec label="Label/Medium (UPPERCASE)" className="font-display text-2xs font-medium uppercase tracking-[1.5px] text-text-secondary" sample="COMING SOON · PERSONAL AGENT" />
              <TypeSpec label="Button/Large" className="font-display text-s font-semibold text-brand" sample="Radiologist · Show more" />
            </div>
          </div>
        </Section>
      )

    case 'spacing':
      return (
        <Section title="Spacing Scale">
          <div className="flex flex-col gap-l">
            {showAnatomy && <AnatomyPanel sectionId="spacing" />}
            <div className="flex flex-wrap gap-m items-end">
              {[
                { name: 'xxxs', px: 2 }, { name: 'xxs', px: 4 }, { name: 'xs', px: 8 },
                { name: 's', px: 12 }, { name: 'm', px: 16 }, { name: 'l', px: 20 },
                { name: 'xl', px: 24 }, { name: 'xxl', px: 32 }, { name: 'xxxl', px: 40 },
                { name: 'xxl2', px: 48 }, { name: 'xxl3', px: 64 },
              ].map(({ name, px }) => (
                <div key={name} className="flex flex-col gap-xs items-center">
                  <div className="bg-brand rounded-[2px]" style={{ width: px, height: px }} />
                  <p className="font-code text-2xs text-text-tertiary">{name}</p>
                  <p className="font-code text-2xs text-text-secondary">{px}px</p>
                </div>
              ))}
            </div>
          </div>
        </Section>
      )

    case 'shadows-radii':
      return (
        <Section title="Shadows & Border Radius">
          <div className="flex flex-col gap-l">
            {showAnatomy && <AnatomyPanel sectionId="shadows-radii" />}
            <div className="grid grid-cols-2 gap-xl">
              <div className="flex flex-col gap-s">
                <p className="font-display text-xs font-semibold text-text-tertiary uppercase tracking-[1.5px] mb-xs">Shadows</p>
                <div className="flex flex-col gap-m">
                  {[
                    { name: 'shadow-sm', cls: 'shadow-sm' }, { name: 'shadow-normal', cls: 'shadow-normal' },
                    { name: 'shadow-big', cls: 'shadow-big' }, { name: 'shadow-button', cls: 'shadow-button' },
                  ].map(({ name, cls }) => (
                    <div key={name} className={`bg-bg-elements rounded-xl p-m ${cls}`}>
                      <p className="font-code text-xs text-text-secondary">{name}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-s">
                <p className="font-display text-xs font-semibold text-text-tertiary uppercase tracking-[1.5px] mb-xs">Border Radius</p>
                <div className="flex flex-wrap gap-m items-start">
                  {[
                    { name: 'xs (4px)', cls: 'rounded-xs' }, { name: 's (6px)', cls: 'rounded-s' },
                    { name: 'm (8px)', cls: 'rounded-m' }, { name: 'xl (12px)', cls: 'rounded-xl' },
                    { name: '2xl (16px)', cls: 'rounded-2xl' }, { name: '3xl (20px)', cls: 'rounded-3xl' },
                    { name: 'round', cls: 'rounded-round' },
                  ].map(({ name, cls }) => (
                    <div key={name} className="flex flex-col gap-xs items-center">
                      <div className={`w-12 h-12 bg-brand/20 border-2 border-brand ${cls}`} />
                      <p className="font-code text-2xs text-text-tertiary text-center">{name}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Section>
      )

    case 'icons':
      return (
        <Section title="Icons">
          <div className="flex flex-col gap-l">
            {showAnatomy && <AnatomyPanel sectionId="icons" />}
            <div className="flex flex-wrap gap-xl bg-bg-elements rounded-2xl p-xl border border-border-subtle">
              {[
                { name: 'Home', icon: <HomeIcon size={24} /> }, { name: 'Barista', icon: <BaristaIcon size={24} /> },
                { name: 'Radiologist', icon: <RadiologistIcon size={24} /> }, { name: 'Oracle', icon: <OracleIcon size={24} /> },
                { name: 'Forecaster', icon: <ForecasterIcon size={24} /> }, { name: 'Upload', icon: <UploadIcon size={24} /> },
                { name: 'Connector', icon: <ConnectorIcon size={24} /> },
                { name: 'Chevron →', icon: <ChevronIcon direction="right" size={24} /> },
                { name: 'Chevron ↓', icon: <ChevronIcon direction="down" size={24} /> },
                { name: 'Filter', icon: <FilterIcon size={24} /> }, { name: 'Calendar', icon: <CalendarIcon size={24} /> },
                { name: 'Clock', icon: <ClockIcon size={24} /> }, { name: 'Close', icon: <CloseIcon size={24} /> },
                { name: 'Check', icon: <CheckIcon size={24} /> },
              ].map(({ name, icon }) => (
                <div key={name} className="flex flex-col gap-xs items-center">
                  <div className="w-10 h-10 flex items-center justify-center text-text-secondary">{icon}</div>
                  <p className="font-body text-2xs text-text-tertiary">{name}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>
      )

    case 'dark-mode':
      return (
        <Section title="Dark Mode Token Mapping">
          <div className="flex flex-col gap-l">
            {showAnatomy && <AnatomyPanel sectionId="dark-mode" />}
            <div className="grid grid-cols-2 gap-xl">
              <div className="flex flex-col gap-m bg-base-950 rounded-2xl p-xl border border-base-800">
                <p className="font-display text-xs font-semibold text-white uppercase tracking-[1.5px]">Dark Mode Preview</p>
                <div className="flex flex-col gap-s">
                  <div className="bg-base-925 rounded-xl p-m border border-base-800">
                    <p className="font-display text-s font-semibold text-white">Card Background → #111827</p>
                    <p className="font-body text-xs text-[#9A9EAB] mt-xxs">Secondary text → #9A9EAB</p>
                  </div>
                  <div className="bg-base-910 rounded-xl p-m">
                    <p className="font-display text-s font-semibold text-white">Elevated → #1A2236</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-s bg-bg-elements rounded-2xl p-xl border border-border-subtle">
                <p className="font-display text-xs font-semibold text-text-tertiary uppercase tracking-[1.5px] mb-xs">Token → Light / Dark</p>
                {[
                  { token: 'Background/Page BG', light: '#F1F1F1', dark: '#1A2236' },
                  { token: 'Background/Card', light: '#FFFFFF', dark: '#111827' },
                  { token: 'Text/Primary', light: '#030D2D', dark: '#FFFFFF' },
                  { token: 'Text/Secondary', light: '#4F566C', dark: '#9A9EAB' },
                  { token: 'Border/Default', light: '#CDCFD5', dark: 'rgba(255,255,255,0.12)' },
                ].map(({ token, light, dark }) => (
                  <div key={token} className="flex items-center justify-between gap-m">
                    <p className="font-body text-2xs text-text-secondary">{token}</p>
                    <div className="flex gap-s items-center">
                      <div className="flex items-center gap-xxs">
                        <div className="w-4 h-4 rounded-[3px] border border-border-subtle" style={{ backgroundColor: light }} />
                        <span className="font-code text-2xs text-text-tertiary">{light}</span>
                      </div>
                      <span className="text-text-placeholder text-2xs">/</span>
                      <div className="flex items-center gap-xxs">
                        <div className="w-4 h-4 rounded-[3px] border border-base-700" style={{ backgroundColor: dark }} />
                        <span className="font-code text-2xs text-text-tertiary">{dark}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>
      )

    case 'button':
      return (
        <Section title="Button">
          <div className="flex flex-col gap-l">
            {showAnatomy && <AnatomyPanel sectionId="button" />}
            <div className="bg-bg-elements rounded-2xl p-xl border border-border-subtle flex flex-col gap-l">
              <div className="flex flex-col gap-s">
                <p className="font-display text-xs font-semibold text-text-tertiary uppercase tracking-[1.5px]">Variants (Medium)</p>
                <div className="flex flex-wrap gap-s items-center">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="tertiary">Tertiary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="blueish">Blueish</Button>
                  <Button variant="translucent">Translucent</Button>
                  <Button variant="transparent">Transparent</Button>
                  <Button variant="danger">Danger</Button>
                  <Button variant="link">Link</Button>
                </div>
              </div>
              <div className="flex flex-col gap-s">
                <p className="font-display text-xs font-semibold text-text-tertiary uppercase tracking-[1.5px]">Sizes</p>
                <div className="flex flex-wrap gap-s items-center">
                  <Button variant="primary" size="sm">Small</Button>
                  <Button variant="primary" size="md">Medium</Button>
                  <Button variant="primary" size="lg">Large</Button>
                  <Button variant="primary" size="xl">XLarge</Button>
                </div>
              </div>
              <div className="flex flex-col gap-s">
                <p className="font-display text-xs font-semibold text-text-tertiary uppercase tracking-[1.5px]">Disabled</p>
                <div className="flex flex-wrap gap-s items-center">
                  <Button variant="primary" disabled>Primary Disabled</Button>
                  <Button variant="secondary" disabled>Secondary Disabled</Button>
                  <Button variant="outline" disabled>Outline Disabled</Button>
                </div>
              </div>
              <div className="flex flex-col gap-s">
                <p className="font-display text-xs font-semibold text-text-tertiary uppercase tracking-[1.5px]">Pill Shape</p>
                <div className="flex flex-wrap gap-s items-center">
                  <Button variant="primary" pill>Primary Pill</Button>
                  <Button variant="outline" pill>Outline Pill</Button>
                  <Button variant="tertiary" pill>Tertiary Pill</Button>
                </div>
              </div>
            </div>
          </div>
        </Section>
      )

    case 'input':
      return (
        <Section title="Input">
          <div className="flex flex-col gap-l">
            {showAnatomy && <AnatomyPanel sectionId="input" />}
            <div className="bg-bg-elements rounded-2xl p-xl border border-border-subtle flex flex-col gap-l">
              <div className="flex flex-col gap-s">
                <p className="font-display text-xs font-semibold text-text-tertiary uppercase tracking-[1.5px]">Sizes</p>
                <div className="grid grid-cols-2 gap-m max-w-[600px]">
                  <Input size="sm" label="Small" placeholder="Placeholder..." />
                  <Input size="md" label="Medium" placeholder="Placeholder..." />
                  <Input size="lg" label="Large" placeholder="Placeholder..." />
                  <Input size="xl" label="X-Large" placeholder="Placeholder..." />
                </div>
              </div>
              <div className="flex flex-col gap-s">
                <p className="font-display text-xs font-semibold text-text-tertiary uppercase tracking-[1.5px]">States</p>
                <div className="grid grid-cols-2 gap-m max-w-[600px]">
                  <Input label="Default" placeholder="Enter text..." />
                  <Input label="Filled" defaultValue="Filled value" />
                  <Input label="Error" placeholder="Enter text..." error message="This field is required" />
                  <Input label="Disabled" placeholder="Can't edit" disabled />
                </div>
              </div>
              <div className="flex flex-col gap-s">
                <p className="font-display text-xs font-semibold text-text-tertiary uppercase tracking-[1.5px]">With Icons</p>
                <div className="grid grid-cols-2 gap-m max-w-[600px]">
                  <Input label="Left icon" placeholder="Search..." leftIcon={<FilterIcon size={16} />} />
                  <Input label="Right icon" placeholder="Select date..." rightIcon={<CalendarIcon size={16} />} />
                  <Input label="Both icons" placeholder="Search sessions..." leftIcon={<FilterIcon size={16} />} rightIcon={<CloseIcon size={16} />} />
                  <Input label="Error with icon" placeholder="Enter email..." leftIcon={<ConnectorIcon size={16} />} error message="Invalid email address" />
                </div>
              </div>
            </div>
          </div>
        </Section>
      )

    case 'checkbox':
      return (
        <Section title="Checkbox & Radio">
          <div className="flex flex-col gap-l">
            {showAnatomy && <AnatomyPanel sectionId="checkbox" />}
            <div className="bg-bg-elements rounded-2xl p-xl border border-border-subtle">
              <FormControlDemos />
            </div>
          </div>
        </Section>
      )

    case 'toggle':
      return (
        <Section title="Toggle">
          <div className="flex flex-col gap-l">
            {showAnatomy && <AnatomyPanel sectionId="toggle" />}
            <div className="bg-bg-elements rounded-2xl p-xl border border-border-subtle">
              <p className="font-display text-xs font-semibold text-text-tertiary uppercase tracking-[1.5px] mb-s">Toggle — Standalone Demo</p>
              <div className="flex flex-wrap gap-xl items-start">
                <Toggle label="Default off" checked={false} onChange={() => {}} />
                <Toggle label="Default on" checked onChange={() => {}} />
                <Toggle label="Disabled" disabled checked={false} />
              </div>
            </div>
          </div>
        </Section>
      )

    case 'event-tag':
      return (
        <Section title="EventTag">
          <div className="flex flex-col gap-l">
            {showAnatomy && <AnatomyPanel sectionId="event-tag" />}
            <div className="flex flex-wrap gap-xs">
              <EventTag label="items looted" />
              <EventTag label="game crashed" />
              <EventTag label="+1" />
              <EventTag label="booyah" />
              <EventTag label="ranked match" />
            </div>
          </div>
        </Section>
      )

    case 'sidebar-label':
      return (
        <Section title="SidebarLabel">
          <div className="flex flex-col gap-l">
            {showAnatomy && <AnatomyPanel sectionId="sidebar-label" />}
            <div className="flex flex-wrap gap-xs items-center">
              <SidebarLabel label="PERSONAL AGENT" variant="muted" />
              <SidebarLabel label="COMING SOON" variant="outlined" />
              <SidebarLabel label="ACTION" variant="default" />
              <SidebarLabel label="ACTION" variant="subtle-focus" />
            </div>
          </div>
        </Section>
      )

    case 'sidebar-nav':
      return (
        <Section title="SidebarNavItem">
          <div className="flex flex-col gap-l">
            {showAnatomy && <AnatomyPanel sectionId="sidebar-nav" />}
            <div className="w-[280px] bg-bg-elements border border-border-subtle rounded-2xl overflow-hidden">
              <SidebarNavItem label="Home" icon={<HomeIcon />} active />
              <SidebarNavItem label="Barista" icon={<BaristaIcon />} badge="PERSONAL AGENT" badgeVariant="muted" />
              <SidebarNavItem label="Radiologist" icon={<RadiologistIcon />} />
              <SidebarNavItem label="Oracle" icon={<OracleIcon />} />
              <SidebarNavItem label="Forecaster" icon={<ForecasterIcon />} badge="COMING SOON" badgeVariant="outlined" disabled />
              <SidebarNavItem label="Coach" icon={<CoachIcon />} />
              <SidebarNavItem label="Guardian" icon={<GuardianIcon />} />
              <SidebarNavItem label="Uploads" icon={<UploadIcon />} />
            </div>
          </div>
        </Section>
      )

    case 'sidebar-task':
      return (
        <Section title="SidebarTaskItem">
          <div className="flex flex-col gap-l">
            {showAnatomy && <AnatomyPanel sectionId="sidebar-task" />}
            <div className="w-[280px] bg-bg-elements border border-border-subtle rounded-2xl overflow-hidden">
              <SidebarTaskItem query="Show me players who got booyah" />
              <SidebarTaskItem query="Where are players getting stuck or confused?" state="loading" />
              <SidebarTaskItem query="Show me players with the best squad win rate" state="complete" />
              <SidebarTaskItem query="Show me players who played the most matches" active />
            </div>
          </div>
        </Section>
      )

    case 'sidebar-profile':
      return (
        <Section title="SidebarProfile">
          <div className="flex flex-col gap-l">
            {showAnatomy && <AnatomyPanel sectionId="sidebar-profile" />}
            <div className="w-[280px] bg-bg-elements border border-border-subtle rounded-2xl p-s">
              <SidebarProfile name="Jonh Wick" initials="JW" language="EN" />
            </div>
          </div>
        </Section>
      )

    case 'game-selector':
      return (
        <Section title="GameSelector">
          <div className="flex flex-col gap-l">
            {showAnatomy && <AnatomyPanel sectionId="game-selector" />}
            <div className="flex flex-wrap gap-m items-start">
              <div className="flex flex-col gap-xs">
                <p className="font-body text-2xs text-text-tertiary">Default (sidebar card)</p>
                <div className="w-[256px]">
                  <GameSelector name="Free Fire" genre="Action" variant="default" />
                </div>
              </div>
              <div className="flex flex-col gap-xs">
                <p className="font-body text-2xs text-text-tertiary">List (dropdown item — hover for tint bg)</p>
                <div className="w-[256px]">
                  <GameSelector name="Maple Story" genre="Action" variant="list" />
                </div>
              </div>
            </div>
          </div>
        </Section>
      )

    case 'game-dropdown':
      return (
        <Section title="GameSelectorDropdown">
          <div className="flex flex-col gap-l">
            {showAnatomy && <AnatomyPanel sectionId="game-dropdown" />}
            <p className="font-body text-xs text-text-tertiary">
              Dropdown overlay showing available games. Opens below the game card in the sidebar.
            </p>
            <div className="w-[280px] bg-bg-elements border border-border-subtle rounded-2xl overflow-visible relative" style={{ minHeight: 360 }}>
              <div className="px-s pt-s">
                <GameSelector name="Free Fire" genre="Action" variant="default" />
              </div>
              <div className="px-s pt-xxs">
                <div className="flex flex-col bg-bg-elements border border-border-subtle rounded-xl shadow-normal overflow-hidden">
                  <div className="flex flex-col py-xxs">
                    <div className="px-xxs"><GameSelector name="MCOC" genre="Action" variant="list" /></div>
                    <div className="px-xxs"><GameSelector name="Maple Story" genre="Action" variant="list" /></div>
                    <div className="px-xxs"><GameSelector name="Superhotter" genre="Shooter" variant="list" /></div>
                    <div className="px-xxs"><GameSelector name="Pirates of the Sea" genre="RPG" variant="list" /></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Section>
      )

    case 'language-selector':
      return (
        <Section title="LanguageSelector">
          <div className="flex flex-col gap-l">
            {showAnatomy && <AnatomyPanel sectionId="language-selector" />}
            <p className="font-body text-xs text-text-tertiary">
              Language selector overlay. Opens to the right of the sidebar footer on profile click.
            </p>
            <div className="flex gap-l items-end">
              <div className="w-[280px] bg-bg-elements border border-border-subtle rounded-2xl p-s">
                <SidebarProfile name="Jonh Wick" initials="JW" language="EN" />
              </div>
              <div className="flex flex-col bg-bg-elements border border-border-subtle rounded-xl shadow-normal overflow-hidden min-w-[200px]">
                <div className="px-m pt-m pb-xs">
                  <p className="font-display text-2xs font-medium uppercase tracking-[1.5px] text-text-tertiary leading-normal">Select Language</p>
                </div>
                <div className="flex flex-col py-xxs">
                  <button className="flex items-center gap-xs px-m py-xs bg-bg-tint-light w-full text-left">
                    <span className="text-[18px] leading-none shrink-0">🇬🇧</span>
                    <span className="flex-1 font-body text-s font-normal text-text-primary leading-[1.5]">EN - English</span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-brand"><path d="M3.5 8.5L6.5 11.5L12.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </button>
                  <button className="flex items-center gap-xs px-m py-xs hover:bg-bg-subtle w-full text-left">
                    <span className="text-[18px] leading-none shrink-0">🇯🇵</span>
                    <span className="flex-1 font-body text-s font-normal text-text-primary leading-[1.5]">JP - 日本語</span>
                  </button>
                  <button className="flex items-center gap-xs px-m py-xs hover:bg-bg-subtle w-full text-left">
                    <span className="text-[18px] leading-none shrink-0">🇰🇷</span>
                    <span className="flex-1 font-body text-s font-normal text-text-primary leading-[1.5]">KR - 한국어</span>
                  </button>
                  <button className="flex items-center gap-xs px-m py-xs hover:bg-bg-subtle w-full text-left">
                    <span className="text-[18px] leading-none shrink-0">🇨🇳</span>
                    <span className="flex-1 font-body text-s font-normal text-text-primary leading-[1.5]">CN - 中文</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Section>
      )

    case 'agent-tab':
      return (
        <Section title="AgentTabItem">
          <div className="flex flex-col gap-l">
            {showAnatomy && <AnatomyPanel sectionId="agent-tab" />}
            {/* All 3 Figma states rendered statically */}
            <div className="flex flex-col gap-m">
              <div className="flex gap-xs items-center">
                <AgentTabItem label="Home" icon={<RadiologistIcon />} state="active" />
                <AgentTabItem label="Home" icon={<RadiologistIcon />} state="default" />
                <AgentTabItem label="Home" icon={<RadiologistIcon />} state="hover" />
              </div>
              {/* In-context usage */}
              <div className="inline-flex gap-xxs p-xxs bg-bg-elements border border-border-default rounded-xl">
                <AgentTabItem label="Radiologist" icon={<RadiologistIcon />} active />
                <AgentTabItem label="Oracle" icon={<OracleIcon />} />
                <AgentTabItem label="Forecaster" icon={<ForecasterIcon />} />
              </div>
            </div>
          </div>
        </Section>
      )

    case 'video-card':
      return (
        <Section title="VideoCard">
          <div className="flex flex-col gap-l">
            {showAnatomy && <AnatomyPanel sectionId="video-card" />}
            <div className="grid grid-cols-3 gap-[12px] max-w-[900px]">
              <VideoCard sessionId="Session #2847" date="10/11/25" duration="4:05" description="Competitive ranked match with strategic gameplay. Player focused on objective-based play." tags={['items looted', 'game crashed', '+1']} />
              <VideoCard sessionId="Session #2846" date="10/11/25" duration="3:22" description="Solo ranked match. High kill count with aggressive early-game strategy." tags={['booyah', 'top 3']} />
              <VideoCard sessionId="Session #2845" date="10/10/25" duration="5:47" description="Squad match with full team coordination. Defensive strategy with zone control." tags={['squad win', 'zone damage', '+2']} />
            </div>
          </div>
        </Section>
      )

    case 'video-card-list':
      return (
        <Section title="VideoCardList">
          <div className="flex flex-col gap-l max-w-[900px]">
            {showAnatomy && <AnatomyPanel sectionId="video-card-list" />}
            <div className="flex flex-col gap-s">
              <VideoCardList sessionId="Session #2847" date="10/11/25" duration="4:05" description="Competitive ranked match with strategic gameplay. Player focused on objective-based play with moderate combat. Strong team coordination observed throughout the session." tags={['items looted', 'game crashed', '+1']} />
              <VideoCardList sessionId="Session #2846" date="10/11/25" duration="3:22" description="Solo ranked match. High kill count with aggressive early-game strategy." tags={['booyah', 'top 3']} />
            </div>
          </div>
        </Section>
      )

    case 'videos-empty-state':
      return (
        <Section title="VideosEmptyState">
          <div className="flex flex-col gap-l">
            {showAnatomy && <AnatomyPanel sectionId="videos-empty-state" />}
            <div className="bg-bg-page rounded-2xl p-xl border border-border-subtle">
              <VideosEmptyState />
            </div>
          </div>
        </Section>
      )

    case 'popup-modal':
      return (
        <Section title="PopupModal">
          <div className="flex flex-col gap-l">
            {showAnatomy && <AnatomyPanel sectionId="popup-modal" />}
            <ModalDemos />
          </div>
        </Section>
      )

    case 'select-dropdown':
      return (
        <Section title="SelectDropdown">
          <div className="flex flex-col gap-l">
            {showAnatomy && <AnatomyPanel sectionId="select-dropdown" />}
            <div className="flex flex-wrap gap-l items-start">
              <div className="flex flex-col gap-xs">
                <p className="font-body text-2xs text-text-tertiary">Standard (title + category)</p>
                <SelectDropdown title="SELECT LANGUAGE" value="en" onChange={() => {}} groups={[{ header: 'Suggested', items: [{ value: 'en', label: 'EN - English', icon: '🇬🇧' }, { value: 'jp', label: 'JP - 日本語', icon: '🇯🇵' }, { value: 'kr', label: 'KR - 한국어', icon: '🇰🇷' }, { value: 'cn', label: 'CN - 中文', icon: '🇨🇳' }] }]} />
              </div>
              <div className="flex flex-col gap-xs">
                <p className="font-body text-2xs text-text-tertiary">Flat list (no title)</p>
                <SelectDropdown value="oracle" onChange={() => {}} groups={[{ items: [{ value: 'radiologist', label: 'Radiologist' }, { value: 'oracle', label: 'Oracle' }, { value: 'forecaster', label: 'Forecaster', disabled: true }, { value: 'barista', label: 'Barista' }] }]} />
              </div>
              <div className="flex flex-col gap-xs">
                <p className="font-body text-2xs text-text-tertiary">Multi-group</p>
                <SelectDropdown title="SELECT VIEW" value="ranked" onChange={() => {}} groups={[{ header: 'Match type', items: [{ value: 'ranked', label: 'Ranked' }, { value: 'casual', label: 'Casual' }] }, { header: 'Duration', items: [{ value: 'short', label: 'Under 3 min' }, { value: 'medium', label: '3–7 min' }, { value: 'long', label: '7+ min' }] }]} />
              </div>
            </div>
          </div>
        </Section>
      )

    case 'input-console':
      return (
        <Section title="InputFieldConsole">
          <div className="flex flex-col gap-l">
            {showAnatomy && <AnatomyPanel sectionId="input-console" />}
            <div className="flex flex-col gap-l max-w-[800px]">
              <div className="flex flex-col gap-s">
                <p className="font-display text-xs font-semibold text-text-tertiary uppercase tracking-[1.5px]">Default Type</p>
                <InputFieldConsole
                  value=""
                  onChange={() => {}}
                  placeholder="Search for actions, objects and events in your game..."


                />
              </div>
              <div className="flex flex-col gap-s">
                <p className="font-display text-xs font-semibold text-text-tertiary uppercase tracking-[1.5px]">Mini Type</p>
                <InputFieldConsole
                  type="mini"
                  value=""
                  onChange={() => {}}
                  placeholder="Search for actions, objects and events in your game..."


                />
              </div>
              <div className="flex flex-col gap-s">
                <p className="font-display text-xs font-semibold text-text-tertiary uppercase tracking-[1.5px]">Active State (with value)</p>
                <InputFieldConsole
                  value="Show me the top 10 events from last week"
                  onChange={() => {}}


                />
              </div>
              <div className="flex flex-col gap-s">
                <p className="font-display text-xs font-semibold text-text-tertiary uppercase tracking-[1.5px]">Mini Active (with value)</p>
                <InputFieldConsole
                  type="mini"
                  value="Show me the top 10 events from last week"
                  onChange={() => {}}


                />
              </div>
            </div>
          </div>
        </Section>
      )

    case 'sidebar-organism':
      return (
        <Section title="Sidebar (Organism)">
          <div className="flex flex-col gap-l">
            {showAnatomy && <AnatomyPanel sectionId="sidebar-organism" />}
            <p className="font-body text-xs text-text-tertiary">
              The Sidebar organism composes SidebarNavItem, SidebarTaskItem, and SidebarProfile molecules into a full navigation panel.
            </p>
            <div className="w-[280px] bg-bg-elements border border-border-subtle rounded-2xl overflow-hidden flex flex-col">
              <div className="p-m border-b border-border-subtle">
                <div className="flex items-center gap-xs">
                  <div className="w-8 h-8 rounded-[6px] bg-brand flex items-center justify-center">
                    <span className="font-display text-xs font-bold text-white">6</span>
                  </div>
                  <span className="font-display text-s font-semibold text-text-primary">6labs Studio</span>
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-xxs p-xs">
                <SidebarNavItem label="Home" icon={<HomeIcon />} active />
                <SidebarNavItem label="Barista" icon={<BaristaIcon />} badge="PERSONAL AGENT" badgeVariant="muted" />
                <SidebarNavItem label="Radiologist" icon={<RadiologistIcon />} />
              </div>
              <div className="border-t border-border-subtle p-s">
                <SidebarProfile name="Jonh Wick" initials="JW" language="EN" />
              </div>
            </div>
          </div>
        </Section>
      )

    case 'hero-section':
      return (
        <Section title="HeroSection (Organism)">
          <div className="flex flex-col gap-l">
            {showAnatomy && <AnatomyPanel sectionId="hero-section" />}
            <p className="font-body text-xs text-text-tertiary">
              The HeroSection organism is the top-of-page banner with heading, subtitle, and agent tab bar.
            </p>
            <div className="bg-bg-elements rounded-2xl p-xl border border-border-subtle flex flex-col gap-m">
              <h1 className="font-display text-4xl font-extrabold text-text-primary leading-[1.2]">Get to know your game</h1>
              <p className="font-body text-s text-text-secondary max-w-[500px]">
                Search for actions, objects and events in your game to deeply understand how players play.
              </p>
              <div className="inline-flex gap-xxs p-xxs bg-bg-page border border-border-default rounded-xl">
                <AgentTabItem label="Radiologist" icon={<RadiologistIcon />} active />
                <AgentTabItem label="Oracle" icon={<OracleIcon />} />
                <AgentTabItem label="Forecaster" icon={<ForecasterIcon />} />
              </div>
            </div>
          </div>
        </Section>
      )

    case 'videos-container':
      return (
        <Section title="VideosContainer (Organism)">
          <div className="flex flex-col gap-l">
            {showAnatomy && <AnatomyPanel sectionId="videos-container" />}
            <p className="font-body text-xs text-text-tertiary">
              The VideosContainer organism renders a grid of VideoCard molecules with filtering and layout controls.
            </p>
            <div className="bg-bg-page rounded-2xl p-xl border border-border-subtle">
              <div className="grid grid-cols-3 gap-[12px]">
                <VideoCard sessionId="Session #2847" date="10/11/25" duration="4:05" description="Competitive ranked match with strategic gameplay." tags={['items looted', 'game crashed']} />
                <VideoCard sessionId="Session #2846" date="10/11/25" duration="3:22" description="Solo ranked match. High kill count." tags={['booyah']} />
              </div>
            </div>
          </div>
        </Section>
      )

    case 'suggestion-card':
      return (
        <Section title="SuggestionCard">
          <div className="flex flex-col gap-l">
            <p className="font-body text-xs text-text-tertiary">
              Clickable prompt suggestion tile used on the Oracle agent page. Anatomy: bulb icon + suggestion text.
            </p>
            <div className="grid grid-cols-2 grid-rows-[72px_72px] gap-s max-w-[800px]">
              <SuggestionCard text="Show the top five most intense close-range fights." />
              <SuggestionCard text="Summarize the player's rotations: drop spot, key moves, final zone path." />
              <SuggestionCard text="List all loot and upgrade moments and gloo wall usage." />
              <SuggestionCard text="Where did the player lose the most HP, and what caused it?" />
            </div>
          </div>
        </Section>
      )

    case 'agent-page-header':
      return (
        <Section title="AgentPageHeader">
          <div className="flex flex-col gap-l">
            <p className="font-body text-xs text-text-tertiary">
              Large agent identity block: 72px gradient icon + title (32px) + description. Used at the top of dedicated agent pages.
            </p>
            <div className="max-w-[800px] flex flex-col gap-xl">
              <AgentPageHeader
                title="Oracle"
                description="Ask complex questions about player behavior across sessions and cohorts"
                iconGradient="radial-gradient(circle at 60% 55%, #05C290 0%, #0E99BF 50%, #1770EF 100%)"
                icon={<OracleIcon size={40} />}
              />
              <AgentPageHeader
                title="Radiologist"
                description="Examine gameplay moment-by-moment with video-backed evidence"
                iconGradient="linear-gradient(180deg, #7B4CFF 0%, #B44CFF 100%)"
                icon={<RadiologistIcon size={40} />}
              />
            </div>
          </div>
        </Section>
      )

    case 'context-uploader':
      return (
        <Section title="ContextUploader">
          <div className="flex flex-col gap-l">
            <p className="font-body text-xs text-text-tertiary">
              Full-size drag-and-drop uploader. Dashed border, upload icon, file type pills, MAX 30MB label. Used in the empty state of the Uploads page.
            </p>
            <div className="max-w-[600px]">
              <ContextUploader onFilesSelected={() => {}} />
            </div>
          </div>
        </Section>
      )

    case 'context-uploader-mini':
      return (
        <Section title="ContextUploaderMini">
          <div className="flex flex-col gap-l">
            <p className="font-body text-xs text-text-tertiary">
              Compact "Add more files" bar. Used when files are already uploaded. Dashed border, plus icon left, file types + MAX 30MB right.
            </p>
            <div className="max-w-[600px]">
              <ContextUploaderMini onFilesSelected={() => {}} />
            </div>
          </div>
        </Section>
      )

    case 'context-file-card':
      return (
        <Section title="ContextFileCard">
          <div className="flex flex-col gap-l">
            <p className="font-body text-xs text-text-tertiary">
              File row with icon (48x48), name, size, date, progress bar (8px), upload tag (with icon), and delete button. Includes inline description textarea + Skip/Save buttons. Two states: uploading (with progress) and uploaded.
            </p>
            <div className="max-w-[600px] flex flex-col gap-s">
              <ContextFileCard
                fileName="game-ui.png"
                fileSize="126.0 KB"
                fileDate="Mar 9, 2026"
                fileType="image"
                progress={60}
                status="uploading"
              />
              <ContextFileCard
                fileName="balance-sheet.csv"
                fileSize="2.4 MB"
                fileDate="Mar 9, 2026"
                fileType="document"
                progress={100}
                status="uploaded"
              />
            </div>
          </div>
        </Section>
      )

    case 'description-box':
      return (
        <Section title="DescriptionBox (Atom)">
          <div className="flex flex-col gap-l">
            <p className="font-body text-xs text-text-tertiary">
              Apparatus multi-line text area. 5 states: Default (placeholder), Hover (brand border), Filled (text + subtle border), Focused (brand border + text), Disabled (dark tint bg). No buttons — pure input atom.
            </p>
            <div className="max-w-[400px] flex flex-col gap-m">
              <DescriptionBox placeholder="Default state" className="h-[48px]" />
              <DescriptionBox placeholder="Filled state" value="Some description text" className="h-[48px]" onChange={() => {}} />
              <DescriptionBox placeholder="Disabled state" value="Disabled State" disabled className="h-[48px]" />
            </div>
          </div>
        </Section>
      )

    case 'connector-card':
      return (
        <Section title="ConnectorCard">
          <div className="flex flex-col gap-l">
            <p className="font-body text-xs text-text-tertiary">
              Integration card: 48px brand icon + connector name + description. Hover: border highlights, shadow lifts, slight translateY.
            </p>
            <div className="grid grid-cols-2 gap-m max-w-[600px]">
              <ConnectorCard
                icon={<AppsFlyerIcon />}
                name="AppsFlyer"
                description="Connect attribution data and campaign performance metrics."
              />
              <ConnectorCard
                icon={<AppsFlyerIcon />}
                name="AppsFlyer"
                description="Connected state example."
                connected
              />
            </div>
          </div>
        </Section>
      )

    case 'progress-bar':
      return (
        <Section title="ProgressBar">
          <div className="flex flex-col gap-l">
            <p className="font-body text-xs text-text-tertiary">
              Thin 4px progress indicator. Brand blue fill on subtle bg. Animated width transition.
            </p>
            <div className="max-w-[400px] flex flex-col gap-m">
              <ProgressBar value={0} />
              <ProgressBar value={30} />
              <ProgressBar value={60} />
              <ProgressBar value={100} />
            </div>
          </div>
        </Section>
      )

    case 'upload-tag':
      return (
        <Section title="UploadTag">
          <div className="flex flex-col gap-l">
            <p className="font-body text-xs text-text-tertiary">
              Status badge: "UPLOADING" (brand tint) and "UPLOADED" (success tint). Display semibold 10px uppercase.
            </p>
            <div className="flex gap-m">
              <UploadTag status="uploading" />
              <UploadTag status="uploaded" />
            </div>
          </div>
        </Section>
      )

    case 'context-uploads-view':
      return (
        <Section title="ContextUploadsView (Organism)">
          <div className="flex flex-col gap-l">
            <p className="font-body text-xs text-text-tertiary">
              Full Uploads page: AgentPageHeader + empty state (intro copy + full uploader) → uploading state (mini uploader + file cards + progress) → uploaded state (description box + skip/save). State machine driven by file upload lifecycle.
            </p>
          </div>
        </Section>
      )

    case 'context-connectors-view':
      return (
        <Section title="ContextConnectorsView (Organism)">
          <div className="flex flex-col gap-l">
            <p className="font-body text-xs text-text-tertiary">
              Connectors page: AgentPageHeader + 2-column top row (AppsFlyer, Jira) + 3-column bottom row (Slack, Discord, Facebook Ads). Each card is a ConnectorCard with brand icon, name, and description.
            </p>
          </div>
        </Section>
      )

    case 'connector-detail-view':
      return (
        <Section title="ConnectorDetailView (Organism)">
          <div className="flex flex-col gap-l">
            <p className="font-body text-xs text-text-tertiary">
              Connector detail page: breadcrumb nav + header (brand icon 72px, name, tags, connect button) + About section + What You Get (checkmark list) + How To Connect (numbered step cards). Opens from ConnectorCard click.
            </p>
            <ConnectorDetailView
              connector={{
                id: 'appsflyer',
                icon: <AppsFlyerIcon size={40} />,
                name: 'AppsFlyer',
                tags: [{ label: 'MCP', variant: 'neutral' }, { label: 'UA Observer', variant: 'brand' }],
                iconTint: 'rgba(194, 5, 104, 0.07)',
                about: 'AppsFlyer is the leading mobile attribution and marketing analytics platform. By connecting AppsFlyer to 6labs, the UA Observer agent gains direct access to your attribution data.',
                benefits: [
                  'Detect ad fraud with video-level evidence',
                  'Cross-reference attribution data with real player behavior',
                  'Protect ad spend by identifying low-quality traffic sources',
                  'Get automated fraud reports pushed to your preferred channels',
                ],
                steps: [
                  '6labs connects to AppsFlyer via MCP (Model Context Protocol)',
                  "No API keys needed — authenticate directly through AppsFlyer's MCP server",
                  'Your apps are detected automatically after authentication',
                  'Configure data pull frequency to match your reporting cadence',
                ],
              }}
            />
          </div>
        </Section>
      )

    case 'oracle-agent-view':
      return (
        <Section title="OracleAgentView (Organism)">
          <div className="flex flex-col gap-l">
            <p className="font-body text-xs text-text-tertiary">
              Dedicated Oracle agent page content: AgentPageHeader + InputFieldConsole + suggested prompts grid (2x2).
            </p>
          </div>
        </Section>
      )

    case 'radiologist-agent-view':
      return (
        <Section title="RadiologistAgentView (Organism)">
          <div className="flex flex-col gap-l">
            <p className="font-body text-xs text-text-tertiary">
              Dedicated Radiologist agent page content: AgentPageHeader + InputFieldConsole + VideosContainer gallery.
            </p>
          </div>
        </Section>
      )

    case 'filter-tag':
      return (
        <Section title="FilterTag (Atom)">
          <div className="flex flex-col gap-l">
            <p className="font-body text-xs text-text-tertiary">
              Selectable pill tag for filter sections. Default state has a subtle border; selected state uses brand tint background + brand text color.
            </p>
            <div className="flex flex-wrap gap-s">
              <FilterTag label="Winner" />
              <FilterTag label="Top 3" selected />
              <FilterTag label="Top 10" />
              <FilterTag label="Bottom 50%" />
              <FilterTag label="Loser" />
            </div>
          </div>
        </Section>
      )

    case 'range-slider':
      return (
        <Section title="RangeSlider (Atom)">
          <div className="flex flex-col gap-l">
            <p className="font-body text-xs text-text-tertiary">
              Dual-handle range slider with min/max labels. Drag handles to adjust range. Brand-colored fill between handles.
            </p>
            <div style={{ maxWidth: 400 }}>
              <RangeSlider min={1} max={60} valueLow={1} valueHigh={60} unit="min" />
            </div>
          </div>
        </Section>
      )

    case 'filter-dialog':
      return <FilterDialogSection />

    default:
      return null
  }
}

// ─── FilterDialog section with interactive demo ─────────────────────────────
function FilterDialogSection() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Section title="FilterDialog (Organism)">
      <div className="flex flex-col gap-l">
        <p className="font-body text-xs text-text-tertiary">
          Full-screen modal filter panel with category sidebar (6 categories), dynamic content area, and action footer (Clear all, Selected count, Cancel, Apply). Currently implements Match Context filters: Game Mode checkboxes, Map checkboxes, Match Duration range slider, Placement tags, Match Played tags, Shop During Gameplay toggle.
        </p>

        <div className="flex flex-col gap-s">
          <span className="font-display text-xs font-semibold text-text-primary">Sub-components</span>
          <ul className="font-body text-xs text-text-secondary list-disc pl-l leading-relaxed">
            <li>Button (tertiary: Clear all, Cancel · primary: Apply)</li>
            <li>Checkbox (sm, filter-checkbox override for 12px control + 10px label)</li>
            <li>Toggle (Shop During Gameplay)</li>
            <li>FilterTag (Placement, Match Played)</li>
            <li>RangeSlider (Match Duration)</li>
          </ul>
        </div>

        <Button variant="primary" size="lg" onClick={() => setIsOpen(true)}>
          Open Filter Dialog
        </Button>

        <FilterDialog
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onApply={(filters) => {
            console.log('Applied filters:', filters)
            setIsOpen(false)
          }}
          initialFilters={{
            gameModes: ['Battle Royale'],
            maps: ['Bermuda'],
            placements: ['Top 3'],
            matchPlayed: ['More than 1'],
          }}
        />
      </div>
    </Section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════════════════════
export function DesignSystem() {
  const [activeId, setActiveId] = useState('colors')
  const [showAnatomy, setShowAnatomy] = useState(false)

  const activeEntry = SIDEBAR_ENTRIES.find(e => e.id === activeId)
  const categoryLabel = activeEntry ? CATEGORY_LABELS[activeEntry.category] : ''

  return (
    <div className="min-h-screen bg-bg-page flex flex-col">
      {/* Top nav */}
      <header className="sticky top-0 z-50 bg-bg-elements border-b border-border-subtle px-xxl py-s flex items-center justify-between">
        <div className="flex items-center gap-xs">
          <div className="w-8 h-8 rounded-[6px] bg-brand flex items-center justify-center">
            <span className="font-display text-xs font-bold text-white">6</span>
          </div>
          <span className="font-display text-s font-semibold text-text-primary">Design System</span>
          <span className="font-body text-xs text-text-tertiary">Apparatus Library · 6labs Studio</span>
        </div>
        <a href="/" className="font-display text-xs font-semibold text-brand hover:text-brand-hover transition-colors cursor-pointer">
          ← Back to Studio
        </a>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="sticky top-[57px] h-[calc(100vh-57px)] w-[240px] shrink-0 bg-bg-elements border-r border-border-subtle overflow-y-auto py-l px-xs">
          <DSSidebar activeId={activeId} onNavigate={setActiveId} />
        </aside>

        {/* Main content — shows only the active section */}
        <main className="flex-1 min-w-0 px-xxl py-xxl max-w-[1080px]">
          {/* Content header: breadcrumb + anatomy toggle */}
          <div className="flex items-center justify-between mb-l">
            <div className="flex items-center gap-xxs">
              <span className="font-body text-2xs text-text-placeholder">{categoryLabel}</span>
              <span className="font-body text-2xs text-text-placeholder">/</span>
              <span className="font-body text-2xs text-text-secondary font-medium">{activeEntry?.label}</span>
            </div>
            <div className="flex items-center gap-xs">
              <span className="font-body text-xs text-text-secondary">Anatomy</span>
              <Toggle
                checked={showAnatomy}
                onChange={() => setShowAnatomy(v => !v)}
              />
            </div>
          </div>

          <SectionContent activeId={activeId} showAnatomy={showAnatomy} />
        </main>
      </div>
    </div>
  )
}
