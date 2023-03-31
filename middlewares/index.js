// for uploading files
const multer = require('multer');
const path = require('path')



// using multer to save the uploaded files in public directory
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public')
    },
    filename: function (req, file, cb) {
      const fileSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, `${file.fieldname}-${fileSuffix}${path.extname(file.originalname)}`)
    }
  })
  
  const upload = multer({
     storage: storage,
     limits: {
      fileSize: 15000000, // 150 KB for a 1080x1080 JPG 90
    },
    fileFilter: function(req, file, cb){
      const allowedExt = ['.img', '.jpg', '.jpeg', '.png'];
      // to extract the file extension
      const extension = path.extname(file.originalname);
      const [fileType] = file.mimetype.split('/');
      if (fileType === 'image' && allowedExt.includes(extension)) return cb(null, true);
      else return cb(new Error(`Invalid image type, ${file.fieldname}`), false);
    }
  });

  module.exports = {
    upload
  }