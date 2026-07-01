const cloudinary = require('../config/cloudinary');

// POST /api/upload/images  — used by admin when adding/editing a vehicle
const uploadImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ message: 'No images uploaded' });

    const urls = req.files.map((f) => f.path); // Cloudinary returns URL in f.path
    res.json({ urls });
  } catch (err) { next(err); }
};

// DELETE /api/upload/image  — remove a specific image from Cloudinary
const deleteImage = async (req, res, next) => {
  try {
    const { publicId } = req.body;
    if (!publicId) return res.status(400).json({ message: 'publicId required' });
    await cloudinary.uploader.destroy(publicId);
    res.json({ message: 'Image deleted' });
  } catch (err) { next(err); }
};

module.exports = { uploadImages, deleteImage };
