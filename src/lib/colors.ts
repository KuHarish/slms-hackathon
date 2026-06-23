/**
 * colors.ts — Centralized Color Token Reference
 *
 * This file documents the design system color palette for the ATLAS app.
 * All colors are driven by CSS variables defined in index.css and mapped to
 * Tailwind tokens in tailwind.config.ts.
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  USAGE RULES                                                            │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │  bg-primary / text-primary         → Main action buttons, active states │
 * │  bg-secondary / text-secondary     → Secondary actions, alt buttons     │
 * │  bg-accent / text-accent           → Highlights, badges, tokens, links  │
 * │  bg-card / text-card-foreground    → Cards, panels, surfaces            │
 * │  bg-background / text-foreground   → Page background and body text      │
 * │  text-muted-foreground             → Subtext, placeholders, hints       │
 * │  border-border                     → Input borders, card borders        │
 * │  bg-destructive / text-destructive → Danger, errors, delete actions     │
 * │  bg-success / text-success         → Confirmations, available status    │
 * │  bg-warning / text-warning         → Cautions, due soon                 │
 * │  bg-info / text-info               → Informational states               │
 * │  text-gold / bg-gold               → Brand accent (gold/reward tokens)  │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  BUTTON COMPONENT CLASSES (from index.css @layer components)            │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │  .btn-primary       → Main CTA (navy in light / gold in dark)           │
 * │  .btn-secondary     → Alt action (gold in light / dark navy in dark)    │
 * │  .btn-outline       → Tertiary, transparent with primary border         │
 * │  .btn-accent        → Gold gradient (used for feature highlights)       │
 * │  .btn-danger        → Destructive action (red)                          │
 * │  .btn-danger-outline → Soft red outline style                           │
 * │  .btn-success       → Approve/confirm (green)                           │
 * │  .btn-ghost         → Minimal, hover-only bg                            │
 * │  .btn-icon          → Icon-only square button                           │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  CARD / CONTAINER CLASSES (from index.css @layer components)            │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │  .card              → Standard card (bg-card, border, shadow-card)      │
 * │  .card-muted        → Subdued card (bg-muted)                           │
 * │  .card-interactive  → card + hover lift animate                         │
 * │  .panel             → Page-level section panel with padding p-6         │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  BADGE CLASSES (from index.css @layer components)                       │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │  .badge-success     → Green — returned, available                       │
 * │  .badge-danger      → Red — overdue, rejected                           │
 * │  .badge-warning     → Amber — due soon, pending                         │
 * │  .badge-info        → Blue — informational                              │
 * │  .badge-accent      → Gold — featured, highlighted                      │
 * │  .badge-muted       → Grey — neutral, inactive                          │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  FORM CLASSES (from index.css @layer components)                        │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │  .form-input        → Standard text input                               │
 * │  .form-label        → Label above input                                 │
 * └─────────────────────────────────────────────────────────────────────────┘
 */

// ── Semantic color map for use in dynamic className generation ─────────────
// Use these when you need to pick a color class programmatically in JS/TSX.
// e.g.  const color = STATUS_COLORS[record.status];
//       <span className={color.badge}>...</span>

export const STATUS_COLORS = {
  returned: {
    badge:  'badge-success',
    icon:   'text-success',
    bg:     'bg-success/10',
  },
  active: {
    badge:  'badge-accent',
    icon:   'text-accent',
    bg:     'bg-accent/10',
  },
  overdue: {
    badge:  'badge-danger',
    icon:   'text-destructive',
    bg:     'bg-destructive/10',
  },
  pending: {
    badge:  'badge-warning',
    icon:   'text-warning',
    bg:     'bg-warning/10',
  },
  approved: {
    badge:  'badge-success',
    icon:   'text-success',
    bg:     'bg-success/10',
  },
  rejected: {
    badge:  'badge-danger',
    icon:   'text-destructive',
    bg:     'bg-destructive/10',
  },
} as const;

export type StatusKey = keyof typeof STATUS_COLORS;

// ── Role colors ────────────────────────────────────────────────────────────
export const ROLE_COLORS = {
  admin: 'badge-accent',
  user:  'badge-muted',
} as const;

// ── Notification type colors ───────────────────────────────────────────────
export const NOTIFICATION_COLORS = {
  error:   { bg: 'bg-destructive/10', text: 'text-destructive' },
  warning: { bg: 'bg-warning/10',     text: 'text-warning'     },
  success: { bg: 'bg-success/10',     text: 'text-success'     },
  info:    { bg: 'bg-info/10',        text: 'text-info'        },
} as const;

export type NotificationType = keyof typeof NOTIFICATION_COLORS;
