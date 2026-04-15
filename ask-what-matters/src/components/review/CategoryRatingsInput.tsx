import type { CategoryInputRatings } from '@/api/types';
import { StarRating } from '@/components/ui/StarRating';

const FIELDS: { key: keyof CategoryInputRatings; label: string; help: string }[] = [
  { key: 'cleanliness', label: 'Cleanliness', help: 'Was the room and property clean?' },
  {
    key: 'staff_and_service',
    label: 'Staff & service',
    help: 'Were staff helpful and friendly?',
  },
  { key: 'amenities', label: 'Amenities', help: 'Did the amenities meet your expectations?' },
  {
    key: 'property_conditions',
    label: 'Property conditions & facilities',
    help: 'Was everything in good working order?',
  },
  {
    key: 'eco_friendliness',
    label: 'Eco-friendliness',
    help: 'Did the property show care for the environment?',
  },
];

export function CategoryRatingsInput({
  value,
  onChange,
}: {
  value: CategoryInputRatings;
  onChange: (next: CategoryInputRatings) => void;
}) {
  return (
    <div className="space-y-5">
      {FIELDS.map(({ key, label, help }) => (
        <div
          key={key}
          className="flex items-center justify-between gap-4 border-b border-divider pb-4 last:border-b-0"
        >
          <div>
            <div className="font-semibold text-navy">{label}</div>
            <div className="text-sm text-ink-muted">{help}</div>
          </div>
          <StarRating
            value={value[key]}
            onChange={(v) => onChange({ ...value, [key]: v })}
            size={28}
            label={label}
          />
        </div>
      ))}
    </div>
  );
}
