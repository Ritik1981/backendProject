import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/temp") // it simply means where to temporarily stire files of users to upload on cloudinary i.e., destination to store file
    },
    filename: function(req,file, cb) { // cb-> callback
        cb(null, file.originalname) // file property is given by multer

    }
})

export const upload = multer({
    storage: storage // storage, es6 feature
})