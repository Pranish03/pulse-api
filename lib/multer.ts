import multer from "multer";

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const isImageMime = file.mimetype.startsWith("image/");
    const isImageExt = /\.(jpg|jpeg|png|gif|webp)$/i.test(file.originalname);

    if (!isImageMime && !isImageExt) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});
