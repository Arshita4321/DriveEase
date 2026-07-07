require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');

const crypto = require('crypto');

const run = async () => {
  await connectDB();

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD || crypto.randomBytes(12).toString('hex');
  let admin = null;

  if (!adminEmail) {
    console.error('ADMIN_EMAIL is required in .env — skipping admin seed');
  } else {
    admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = await User.create({
        name: 'DriveEase Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
      });
      console.log(`Created admin user: ${adminEmail} / ${adminPassword}`);
    } else {
      console.log(`Admin already exists: ${adminEmail} (password unchanged)`);
    }
  }

  const count = await Vehicle.countDocuments();
  if (count === 0 && admin) {
    await Vehicle.insertMany([
      {
        name: 'Honda City',
        type: 'car',
        brand: 'Honda',
        model: 'City',
        year: 2023,
        pricePerDay: 45,
        location: 'Ludhiana',
        transmission: 'automatic',
        fuelType: 'petrol',
        fuelEfficiency: 17,
        seats: 5,
        description: 'Comfortable sedan, great for city drives.',
        images: ['https://images.unsplash.com/photo-1549924231-f129b911e442?w=900&h=600&fit=crop'],
        createdBy: admin._id,
      },
      {
        name: 'Royal Enfield Classic 350',
        type: 'bike',
        brand: 'Royal Enfield',
        model: 'Classic 350',
        year: 2022,
        pricePerDay: 18,
        location: 'Ludhiana',
        transmission: 'manual',
        fuelType: 'petrol',
        fuelEfficiency: 35,
        seats: 2,
        description: 'Iconic cruiser bike, perfect for long rides.',
        images: ['https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=900&h=600&fit=crop'],
        createdBy: admin._id,
      },
      {
        name: 'Tesla Model 3',
        type: 'car',
        brand: 'Tesla',
        model: 'Model 3',
        year: 2024,
        pricePerDay: 90,
        location: 'Delhi',
        transmission: 'automatic',
        fuelType: 'electric',
        fuelEfficiency: 6,
        seats: 5,
        description: 'Premium electric sedan with autopilot.',
        images: ['https://images.unsplash.com/photo-1560958089-b8a1958089?w=900&h=600&fit=crop'],
        createdBy: admin._id,
      },
    ]);
    console.log('Inserted sample vehicles');
  }

  console.log('Seeding complete');
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
