/**
 * Deterministic hotel image lookup.
 * Maps an egPropertyId to Unsplash hotel images using a consistent hash,
 * so each property always gets the same photo regardless of order.
 */

const HERO_POOL = [
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1528114039593-4366cc08227d?w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1601381718415-a05fb0a261f3?w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1563911302283-d2bc129e7570?w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1551882547-ff40c63fe2fa?w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1495365200479-c4ed1d35e1aa?w=1600&auto=format&fit=crop",
];

export const GALLERY_IMAGES = [
  "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&auto=format&fit=crop",
];

/** Simple string hash → consistent index into HERO_POOL */
function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = ((h << 5) - h + id.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % HERO_POOL.length;
}

export function heroImageUrl(egPropertyId: string): string {
  return HERO_POOL[hashId(egPropertyId)];
}
