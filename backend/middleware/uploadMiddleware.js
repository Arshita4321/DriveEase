const multer     = require('multer');
const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');

// ─── Helper: upload a buffer to Cloudinary via upload_stream ─────────────────
const uploadToCloudinary = (buffer, options) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    // Convert buffer → readable stream and pipe into Cloudinary
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });

// ─── Custom Multer storage engine for Cloudinary v2 ──────────────────────────
const makeCloudinaryStorage = (getOptions) => ({
  _handleFile(req, file, cb) {
    // Collect the incoming file chunks into a buffer
    const chunks = [];
    file.stream.on('data', (chunk) => chunks.push(chunk));
    file.stream.on('error', cb);
    file.stream.on('end', async () => {
      try {
        const buffer  = Buffer.concat(chunks);
        const options = await getOptions(req, file);
        const result  = await uploadToCloudinary(buffer, options);
        cb(null, {
          fieldname:    file.fieldname,
          originalname: file.originalname,
          encoding:     file.encoding,
          mimetype:     file.mimetype,
          path:         result.secure_url,   // full HTTPS URL
          size:         result.bytes,
          filename:     result.public_id,    // Cloudinary public_id (for deletion)
        });
      } catch (err) {
        cb(err);
      }
    });
  },
  _removeFile(_req, file, cb) {
    cloudinary.uploader.destroy(file.filename).then(() => cb()).catch(cb);
  },
});

// ─── Vehicle images storage ───────────────────────────────────────────────────
const vehicleStorage = makeCloudinaryStorage(async (_req, _file) => ({
  folder:         'driveease/vehicles',
  allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  transformation: [{ width: 900, height: 600, crop: 'fill', quality: 'auto' }],
  public_id:      `vehicle_${Date.now()}`,
}));

// ─── Avatar storage ───────────────────────────────────────────────────────────
const avatarStorage = makeCloudinaryStorage(async (req, _file) => ({
  folder:         'driveease/avatars',
  allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  transformation: [{ width: 200, height: 200, crop: 'fill', quality: 'auto' }],
  public_id:      `avatar_${req.user._id}`,
}));

// ─── KYC document storage ───────────────────────────────────────────────────
const kycStorage = makeCloudinaryStorage(async (req, _file) => ({
  folder:         'driveease/kyc',
  allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  transformation: [{ width: 1000, height: 700, crop: 'limit', quality: 'auto' }],
  public_id:      `kyc_${req.user._id}_${Date.now()}`,
}));

// ─── Damage report photo storage ─────────────────────────────────────────────
const damageStorage = makeCloudinaryStorage(async (_req, _file) => ({
  folder:         'driveease/damage',
  allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  transformation: [{ width: 1000, height: 700, crop: 'limit', quality: 'auto' }],
  public_id:      `damage_${Date.now()}`,
}));

// ─── File filter: images only ─────────────────────────────────────────────────
const imageFilter = (_req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Only image files are allowed'), false);
};

// ─── Exported middleware ──────────────────────────────────────────────────────
const uploadVehicleImages = multer({
  storage:   vehicleStorage,
  fileFilter: imageFilter,
  limits:    { fileSize: 5 * 1024 * 1024 }, // 5 MB per file
}).array('images', 8);

const uploadAvatar = multer({
  storage:   avatarStorage,
  fileFilter: imageFilter,
  limits:    { fileSize: 2 * 1024 * 1024 }, // 2 MB
}).single('avatar');

const uploadKycDocs = multer({
  storage:   kycStorage,
  fileFilter: imageFilter,
  limits:    { fileSize: 5 * 1024 * 1024 },
}).fields([
  { name: 'licenseImage', maxCount: 1 },
  { name: 'idProofImage',  maxCount: 1 },
]);

const uploadDamagePhotos = multer({
  storage:   damageStorage,
  fileFilter: imageFilter,
  limits:    { fileSize: 5 * 1024 * 1024 },
}).array('photos', 6);

module.exports = { uploadVehicleImages, uploadAvatar, uploadKycDocs, uploadDamagePhotos };
