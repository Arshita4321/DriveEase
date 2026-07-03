require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');

const run = async () => {
  await connectDB();

  const adminEmail = 'admin@driveease.com';
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      name: 'DriveEase Admin',
      email: adminEmail,
      password: 'Admin@123',
      role: 'admin',
    });
    console.log('Created admin user: admin@driveease.com / Admin@123');
  } else {
    // Reset admin password so the default credentials always work
    admin.password = 'Admin@123';
    admin.role = 'admin';
    await admin.save();
    console.log('Reset admin user: admin@driveease.com / Admin@123');
  }

  const count = await Vehicle.countDocuments();
  if (count === 0) {
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
        seats: 5,
        description: 'Comfortable sedan, great for city drives.',
        images: [],
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
        seats: 2,
        description: 'Iconic cruiser bike, perfect for long rides.',
        images: [],
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
        seats: 5,
        description: 'Premium electric sedan with autopilot.',
        images: [],
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
