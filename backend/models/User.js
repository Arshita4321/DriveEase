const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    phone:    { type: String, default: '' },
    role:     { type: String, enum: ['user', 'admin'], default: 'user' },
    isBlocked:{ type: Boolean, default: false },
    avatar:   { type: String, default: '' },
    lastLogin:{ type: Date },

    // Wishlist — array of Vehicle refs
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' }],

    // Password reset
    passwordResetToken:   { type: String, select: false },
    passwordResetExpires: { type: Date,   select: false },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
