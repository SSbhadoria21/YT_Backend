import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) { 
        cb(null, "public/temp") // specify the destination folder for uploaded files
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname) // set the filename as fieldname-uniqueSuffix //change use any suffix on file name later on
    }
})

export const upload = multer({storage:storage})