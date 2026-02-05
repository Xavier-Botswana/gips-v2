const multer = require('multer');

const admissionLetterController = require('../controllers/admissionLetterController');
const authenticate = require('../middlewares/authenticate');
const checkRole = require('../middlewares/roleCheck');

const router = express.Router();

const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

router.get(
  '/by-course/:courseId',
  authenticate,
  checkRole(['admin', 'superAdmin', 'hod']),
  admissionLetterController.getAdmissionLetterByCourseId,
);

router.post(
  '/',
  authenticate,
  checkRole(['admin', 'superAdmin', 'hod']),
  upload.single('file'),
  admissionLetterController.createAdmissionLetter,
);

router.patch(
  '/:id',
  authenticate,
  checkRole(['admin', 'superAdmin', 'hod']),
  upload.single('file'),
  admissionLetterController.updateAdmissionLetter,
);

module.exports = router;
