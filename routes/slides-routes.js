const express = require('express');
const { check } = require('express-validator');

const router = express.Router();

const slidesControllers = require('../controllers/slidesControllers');

router.get('/:sid', slidesControllers.getSlideById);

router.get('/', slidesControllers.getSlides);

router.post(
  '/new-slide', [
    check('title').not().isEmpty(),
    check('image').not().isEmpty(),
    check('type').not().isEmpty(),
    check('url').not().isEmpty(),
  ],
  slidesControllers.createSlide
);

router.patch(
  '/:sid', [check('title').not().isEmpty(), check('url').not().isEmpty()],
  slidesControllers.updateSlide
);

router.delete('/:sid', slidesControllers.deleteSlide);

module.exports = router;