import multer from "multer";
import { randomUUID } from "crypto";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    const extension = path.extname(file.originalname);

    const filename = `${randomUUID()}${extension}`;

    cb(null, filename);
  },
});

export const upload = multer({ storage });
