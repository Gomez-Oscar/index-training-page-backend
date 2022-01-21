const express = require('express');
const { check } = require('express-validator');

const router = express.Router();

const recordingsControllers = require('../controllers/recordingsControllers');

router.get('/:rid', recordingsControllers.getRecordingById);

router.get('/', recordingsControllers.getRecordings);

router.post(
  '/new-recording', [
    check('title').not().isEmpty(),
    check('image').not().isEmpty(),
    check('type').not().isEmpty(),
    check('url').not().isEmpty(),
  ],
  recordingsControllers.createRecording
);

router.patch(
  '/:sid', [check('title').not().isEmpty(), check('url').not().isEmpty()],
  recordingsControllers.updateRecording
);

router.delete('/:sid', recordingsControllers.deleteRecording);

module.exports = router;