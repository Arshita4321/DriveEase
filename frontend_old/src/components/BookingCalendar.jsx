import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import api from '../services/api';

export default function BookingCalendar({ vehicleId, onChange }) {
  const [startDate, setStartDate]   = useState(null);
  const [endDate,   setEndDate]     = useState(null);
  const [excluded,  setExcluded]    = useState([]);   // booked date ranges
  const [available, setAvailable]   = useState(null);
  const [checking,  setChecking]    = useState(false);

  // Fetch existing bookings to build excluded date ranges
  useEffect(() => {
    const load = async () => {
      try {
        // We use the availability endpoint per-day to build a rough excluded list.
        // A real implementation would have a dedicated endpoint returning booked ranges.
        // Here we just track selected range availability.
      } catch {}
    };
    load();
  }, [vehicleId]);

  const handleChange = async (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
    setAvailable(null);

    if (start && end) {
      setChecking(true);
      try {
        const { data } = await api.get(`/vehicles/${vehicleId}/availability`, {
          params: {
            startDate: start.toISOString(),
            endDate:   end.toISOString(),
          },
        });
        setAvailable(data.available);
        onChange({ startDate: start, endDate: end, available: data.available });
      } catch {
        setAvailable(false);
      } finally {
        setChecking(false);
      }
    } else {
      onChange({ startDate: start, endDate: end, available: null });
    }
  };

  return (
    <div className="booking-calendar">
      <DatePicker
        selected={startDate}
        onChange={handleChange}
        startDate={startDate}
        endDate={endDate}
        selectsRange
        inline
        minDate={new Date()}
        monthsShown={2}
      />
      {checking && <p className="cal-status checking">Checking availability…</p>}
      {!checking && available === true  && <p className="cal-status available">✅ Available for these dates</p>}
      {!checking && available === false && <p className="cal-status unavailable">❌ Not available — please pick different dates</p>}
    </div>
  );
}
