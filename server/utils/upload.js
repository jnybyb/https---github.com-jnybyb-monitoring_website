const path = require('path');
const multer = require('multer');

const uploadsDir = path.join(__dirname, '..', 'uploads');

// Create multer storage configuration
const createStorage = (prefix) => {
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname || '');
      cb(null, `${prefix}-${unique}${ext}`);
    }
  });
};

// Create multer instances for different file types
const beneficiaryUpload = multer({ storage: createStorage('beneficiary') });
const cropUpload = multer({ storage: createStorage('crop') });

module.exports = {
  beneficiaryUpload: beneficiaryUpload.single('picture'),
  cropUpload: cropUpload.array('pictures', 10),
  uploadsDir
};
