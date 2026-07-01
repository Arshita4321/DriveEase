const Vehicle = require('../models/Vehicle');

// Simple rule-based assistant: no external API key required.
// Swap this out for an LLM API call if desired (e.g. Anthropic/OpenAI) by
// replacing the matching logic below with a call to that provider.
const chat = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: 'message is required' });

    const text = message.toLowerCase();
    let reply =
      "I'm not sure about that yet. You can ask me about pricing, availability, booking steps, or vehicle types.";

    if (/price|cost|rate|how much/.test(text)) {
      const cheapest = await Vehicle.find({ isAvailable: true }).sort({ pricePerDay: 1 }).limit(1);
      reply = cheapest.length
        ? `Prices vary by vehicle. Our cheapest available option right now is ${cheapest[0].name} at ₹${cheapest[0].pricePerDay}/day. Use the Search & Filter page to compare by price.`
        : 'Prices vary by vehicle type, brand, and location. Check the listings page for exact pricing.';
    } else if (/available|availability|free|book.*date/.test(text)) {
      reply =
        'You can check real-time availability by opening any vehicle page and selecting your start and end dates — the system will instantly tell you if it is free for that period.';
    } else if (/how.*book|booking step|how do i rent|reserve/.test(text)) {
      reply =
        'To book: 1) Browse or search for a vehicle, 2) Open its detail page, 3) Pick your rental dates, 4) Confirm booking, 5) Complete payment if required. You can view your bookings under "My Bookings".';
    } else if (/cancel/.test(text)) {
      reply =
        'You can cancel a pending or confirmed booking from the "My Bookings" page as long as it has not yet been completed.';
    } else if (/car|bike|type/.test(text)) {
      reply =
        'We offer both cars and bikes. Use the type filter on the vehicle listing page to switch between them.';
    } else if (/review|rating/.test(text)) {
      reply =
        'After your rental is completed, you can leave a rating and review on the vehicle detail page to help other renters.';
    } else if (/hello|hi|hey/.test(text)) {
      reply = "Hi! I'm the DriveEase assistant. Ask me about pricing, availability, or how to book.";
    }

    res.json({ reply });
  } catch (err) {
    next(err);
  }
};

module.exports = { chat };
