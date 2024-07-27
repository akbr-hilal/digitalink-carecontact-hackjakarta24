const multer = require('multer');

exports.uploadImage = (imageFile) => {
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, "uploads")
        },
        filename: (req, file, cb) => {
            cb(null, Date.now() + "-" + file.originalname.replace(/\s/g, ""))
        }
    })

    const fileFilter = (req, file, cb) => {
        if (file.fieldname === imageFile) {
            if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
                req.fileValidationError = {
                    message: "Only image files are allowed",
                };
                return cb(new Error("Only image files are allowed"), false);
            }
        }
        cb(null, true)
    }

    const sizeInMb = 10;
    const maxSize = sizeInMb * 1000 * 1000

    const upload = multer({
        storage,
        fileFilter,
        limits: {
            fileSize: maxSize,
        },
    }).single(imageFile)

    return (req, res, next) => {
        upload(req, res, function (err) {
            if (req.fileValidationError) {
                return res.status(400).send(req.fileValidationError)
            }

            if (err) {
                if (err.code === "LIMIT_FILE_SIZE") {
                    return res.status(400).send({
                        message: "Max file sized is 10 MB"
                    })
                }
                return res.status(400).send(err)
            }

            return next()
        })
    }
}

exports.uploadFiles = (fileField) => {
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, "uploads");
        },
        filename: (req, file, cb) => {
            cb(null, Date.now() + "-" + file.originalname.replace(/\s/g, ""));
        }
    });

    const fileFilter = (req, file, cb) => {
        const allowedImageExtensions = ['jpg', 'jpeg', 'png', 'gif'];
        const allowedDocumentExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx'];

        const extension = file.originalname.split('.').pop().toLowerCase();

        if (allowedImageExtensions.includes(extension) || allowedDocumentExtensions.includes(extension)) {
            cb(null, true);
        } else {
            req.fileValidationError = {
                message: "Only image or document files are allowed",
            };
            return cb(new Error("Only image or document files are allowed"), false);
        }
    };

    const sizeInMb = 10;
    const maxSize = sizeInMb * 1000 * 1000;

    const upload = multer({
        storage,
        fileFilter,
        limits: {
            fileSize: maxSize * 2, // Ganda dari batas ukuran karena Anda memiliki dua file
        },
    }).array(fileField, 2); // Menangani array dari dua file

    return (req, res, next) => {
        console.log("uploads: ",req.file);
        upload(req, res, function (err) {
            if (req.fileValidationError) {
                return res.status(400).send(req.fileValidationError);
            }

            if (err) {
                if (err.code === "LIMIT_FILE_SIZE") {
                    return res.status(400).send({
                        message: "Max total file size is 20 MB for both files"
                    });
                }
                return res.status(400).send(err);
            }

            return next();
        });
    };
};