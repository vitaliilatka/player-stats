// utils/uploadConfig.js
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

// Emulate __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure file storage
const storage = multer.diskStorage({
  // Directory where uploaded files will be saved
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },

  // Generate unique filenames
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "player-" + unique + path.extname(file.originalname));
  }
});

// Validate allowed file types
function fileFilter(req, file, cb) {
  const allowed = ["image/png", "image/jpeg", "image/jpg"];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file format"));
  }
}

export const upload = multer({ storage, fileFilter });
