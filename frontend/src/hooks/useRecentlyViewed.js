import { useEffect, useState } from 'react';

const STORAGE_KEY = 'driveease_recently_viewed';
const MAX_ITEMS = 10;

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeStorage(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

export function useRecentlyViewed() {
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    setRecent(readStorage());
  }, []);

  const addVehicle = (vehicle) => {
    if (!vehicle || !vehicle._id) return;
    setRecent((prev) => {
      const filtered = prev.filter((v) => v._id !== vehicle._id);
      const next = [{
        _id: vehicle._id,
        name: vehicle.name,
        images: vehicle.images,
        pricePerDay: vehicle.pricePerDay,
        type: vehicle.type,
        location: vehicle.location,
        brand: vehicle.brand,
        year: vehicle.year,
        isAvailable: vehicle.isAvailable,
        averageRating: vehicle.averageRating,
        numReviews: vehicle.numReviews,
        seats: vehicle.seats,
        transmission: vehicle.transmission,
        fuelType: vehicle.fuelType,
      }, ...filtered].slice(0, MAX_ITEMS);
      writeStorage(next);
      return next;
    });
  };

  const clearRecent = () => {
    setRecent([]);
    writeStorage([]);
  };

  return { recent, addVehicle, clearRecent };
}
