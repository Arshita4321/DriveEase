/**
 * Dynamic pricing calculator for DriveEase bookings.
 *
 * @param {Object} vehicle   – Mongoose Vehicle document
 * @param {Date}   startDate
 * @param {Date}   endDate
 * @param {Array}  addons    – [{ name, price, priceType }] (denormalized)
 * @returns {Object} pricing breakdown
 */
const MS_PER_DAY = 1000 * 60 * 60 * 24;

function calculatePricing(vehicle, startDate, endDate, addons = []) {
  const start = new Date(startDate);
  const end   = new Date(endDate);
  const totalDays = Math.max(1, Math.ceil((end - start) / MS_PER_DAY));

  const basePrice = vehicle.pricePerDay * totalDays;

  // ── Weekend surcharge ──────────────────────────────────────────────────────
  let weekendSurcharge = 0;
  if (vehicle.weekendSurcharge > 0) {
    let weekendDays = 0;
    const cursor = new Date(start);
    for (let i = 0; i < totalDays; i++) {
      const dow = cursor.getDay();
      if (dow === 0 || dow === 6) weekendDays++; // Sunday=0, Saturday=6
      cursor.setDate(cursor.getDate() + 1);
    }
    weekendSurcharge = weekendDays * vehicle.weekendSurcharge;
  }

  // ── Long-term discount ────────────────────────────────────────────────────
  let discountPercent = 0;
  if (totalDays >= 30 && vehicle.monthlyDiscount > 0)      discountPercent = vehicle.monthlyDiscount;
  else if (totalDays >= 7 && vehicle.weeklyDiscount > 0)    discountPercent = vehicle.weeklyDiscount;
  const discountAmount = Math.round(((basePrice + weekendSurcharge) * discountPercent) / 100);

  // ── Add-on total ──────────────────────────────────────────────────────────
  let addonTotal = 0;
  for (const a of addons) {
    addonTotal += a.priceType === 'per_day' ? a.price * totalDays : a.price;
  }

  const totalPrice = basePrice + weekendSurcharge - discountAmount + addonTotal;

  return {
    totalDays,
    basePrice,
    weekendSurcharge,
    discountAmount,
    discountPercent,
    addonTotal,
    totalPrice,
  };
}

module.exports = { calculatePricing, MS_PER_DAY };
