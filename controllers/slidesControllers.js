const HttpError = require('../models/http-error');
const { validationResult } = require('express-validator');
const Slide = require('../models/slide');

const getSlideById = async(req, res, next) => {
  const slideId = req.params.sid;

  let slide;
  try {
    slide = await Slide.findById(slideId);
  } catch (error) {
    return next(new HttpError('Could not find a slide', 500));
  }

  if (!slide) {
    return next(
      new HttpError('Could not find a slide for the provided ID', 404)
    );
  }

  res.status(200).json({ slide: slide.toObject({ getters: true }) });
};

const getSlides = async(req, res, next) => {
  let slides;
  try {
    slides = await Slide.find({});
  } catch (error) {
    return next(new HttpError('Fetching slides failed', 500));
  }

  res
    .status(200)
    .json({ slides: slides.map((slide) => slide.toObject({ getters: true })) });
};

const createSlide = async(req, res, next) => {
  const errors = validationResult(req); //verifica si hay errores de validación en el request

  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data', 422)
    );
  }

  const { title, image, type, url } = req.body;

  let existingSlide;
  try {
    existingSlide = await Slide.findOne({ url: url });
  } catch (err) {
    return next(new HttpError('Creating new Slide Failed', 500));
  }

  if (existingSlide) {
    return next(new HttpError('Slide already exists!', 422));
  }

  const createdSlide = new Slide({ title, image, type, url });

  try {
    await createdSlide.save();
  } catch (err) {
    return next(new HttpError('Creating slide failed', 500));
  }

  res.status(201).json({ slide: createdSlide }); // 201 cuando se creo algo nuevo con exito
};

const updateSlide = async(req, res, next) => {
  const errors = validationResult(req); //verifica si hay errores de validación en el request object

  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data', 422)
    );
  }

  const { title, url } = req.body;
  const slideId = req.params.sid;

  let slide;
  try {
    slide = await Slide.findById(slideId);
  } catch (error) {
    return next(new HttpError('Could not update the slide', 500));
  }

  if (!slide)
    return next(
      new HttpError('Could not find a slide for the provided ID', 404)
    );

  slide.title = title;
  slide.url = url;

  try {
    await slide.save();
  } catch (error) {
    return next(new HttpError('Could not update the slide', 500));
  }

  res.status(200).json({ slide: slide.toObject({ getters: true }) });
};

const deleteSlide = async(req, res, next) => {
  const slideId = req.params.sid;

  let slide,
    title = '';
  try {
    slide = await Slide.findById(slideId);
  } catch (error) {
    return next(new HttpError('Could not delete the slide', 500));
  }

  if (!slide)
    return next(
      new HttpError('Could not find a slide for the provided ID', 404)
    );

  title = slide.title;

  try {
    await slide.remove();
  } catch (error) {
    return next(new HttpError('Could not delete the slide', 500));
  }

  res.status(200).json({ message: 'Slide ' + title + ' Was Deleted' });
};

exports.getSlideById = getSlideById;
exports.getSlides = getSlides;
exports.createSlide = createSlide;
exports.updateSlide = updateSlide;
exports.deleteSlide = deleteSlide;