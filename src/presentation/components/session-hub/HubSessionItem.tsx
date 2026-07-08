import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Session, isActive } from '@domain/session/Session';
import { useTheme } from '@presentation/theme';

// ── Constants ─────────────────────────────────────────────────────────────────

const TEAL_BORDER = '#b3f1de';
const TEAL_BORDER_ACCENT = '#3b491e';
const ACTIVE_BG = '#68a625';
const ACTIVE_PILL_BG = '#a7bd9f';
const TRASH_BG_ACCENT = '#395913';
const ACTIVE_META = '#e0f3ba';
const RIGHT_SLOT = 48; // both bin and chevron occupy the same width slot

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatMeta = (session: Session, active: boolean): string => {
  const count = session.exercises.length;
  const exercises = `${count} ${count === 1 ? 'exercise' : 'exercises'}`;

  if (active) {
    const mins = Math.floor((Date.now() - new Date(session.createdAt).getTime()) / 60000);
    const timeStr = mins < 1 ? 'just now' : mins === 1 ? '1 min ago' : `${mins} min ago`;
    return `Started ${timeStr} · ${exercises}`;
  }

  const date = new Date(session.finishedAt ?? session.createdAt).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const secs = session.finishedAt
    ? Math.floor((session.finishedAt.getTime() - session.createdAt.getTime()) / 1000)
    : null;
  const duration =
    secs !== null
      ? secs < 3600
        ? `${Math.floor(secs / 60)} min`
        : `${Math.floor(secs / 3600)}h ${Math.floor((secs % 3600) / 60)}m`
      : null;
  return [date, exercises, duration].filter(Boolean).join(' · ');
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface HubSessionItemProps {
  session: Session;
  isSelected: boolean;
  onSelect: () => void;
  onNavigate: () => void;
  onDelete: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export const HubSessionItem: React.FC<HubSessionItemProps> = ({
  session,
  isSelected,
  onSelect,
  onNavigate,
  onDelete,
}) => {
  const theme = useTheme();
  const active = isActive(session);

  const cardStyle = {
    backgroundColor: active ? ACTIVE_BG : theme.surface,
    borderWidth: isSelected ? 2 : 0.5,
    borderColor: isSelected ? TEAL_BORDER_ACCENT : active ? TEAL_BORDER : theme.border,
  };
  const pillStyle = {
    backgroundColor: active ? ACTIVE_PILL_BG : theme.border,
  };
  const pillLabelColor = active ? TEAL_BORDER_ACCENT : theme.textMuted;
  const labelColor = active ? '#FFFFFF' : theme.textPrimary;
  const metaColor = active ? ACTIVE_META : theme.textMuted;
  const chevronColor = active
    ? TEAL_BORDER_ACCENT
    : isSelected
      ? TEAL_BORDER_ACCENT
      : theme.textMuted;
  const trashBg = active ? TRASH_BG_ACCENT : theme.background;

  return (
    <Pressable
      style={({ pressed }) => [s.card, cardStyle, pressed && !isSelected && s.cardPressed]}
      onPress={onSelect}
    >
      {/* ── Row 1: pill + label (left) · bin slot (right, same width as chevron) ── */}
      <View style={s.row1}>
        <View style={s.topLeft}>
          <View style={[s.pill, pillStyle]}>
            {active && <View style={s.pillDot} />}
            <Text style={[s.pillLabel, { color: pillLabelColor }]}>
              {active ? 'In Progress' : 'Finished'}
            </Text>
          </View>
          <Text style={[s.label, { color: labelColor }]} numberOfLines={1}>
            {session.label ?? 'Session'}
          </Text>
        </View>

        {/* Right slot — always same width as chevron so they align perfectly */}
        <View style={s.rightSlot}>
          {isSelected && (
            <Pressable
              onPress={onDelete}
              style={[s.trashBtn, { backgroundColor: trashBg }]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={s.trash}>🗑</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* ── Row 2: meta (left) · chevron (right, same slot width as bin) ── */}
      <View style={s.row2}>
        <Text style={[s.meta, { color: metaColor }]} numberOfLines={1}>
          {formatMeta(session, active)}
        </Text>

        <Pressable
          onPress={onNavigate}
          style={s.chevronBtn}
          hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        >
          <Text style={[s.chevron, { color: chevronColor }]}>›</Text>
        </Pressable>
      </View>
    </Pressable>
  );
};

// ── Static styles (no dynamic values here) ────────────────────────────────────

const s = StyleSheet.create({
  card: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 0,
    marginBottom: 8,
  },
  cardPressed: {
    opacity: 0.75,
  },

  // Row 1
  row1: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  topLeft: {
    flex: 1,
    gap: 3,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  pillDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: TEAL_BORDER_ACCENT,
  },
  pillLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },

  // Right slot — fixed width matching chevron, used in both rows
  rightSlot: {
    width: RIGHT_SLOT,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 4,
    flexShrink: 0,
  },
  trashBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trash: {
    fontSize: 14,
  },

  // Row 2
  row2: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  meta: {
    flex: 1,
    fontSize: 11,
  },
  chevronBtn: {
    width: RIGHT_SLOT,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  chevron: {
    fontSize: 42,
  },
});
