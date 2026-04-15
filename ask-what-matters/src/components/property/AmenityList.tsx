import { Check } from 'lucide-react';

export function AmenityList({ amenities }: { amenities: string[] }) {
  return (
    <ul className="grid grid-cols-2 gap-2">
      {amenities.map((a) => (
        <li key={a} className="flex items-center gap-2 text-sm text-navy">
          <Check size={16} className="text-positive" />
          {a}
        </li>
      ))}
    </ul>
  );
}
