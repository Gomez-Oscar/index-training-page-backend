const HttpError = require('../models/http-error');
const { validationResult } = require('express-validator');

const Recording = require('../models/recording');

const getRecordingById = async(req, res, next) => {
  const recordingId = req.params.rid;

  let recording;

  try {
    recording = await Recording.findById(recordingId);
  } catch (error) {
    return next(new HttpError('Could not find a recording', 500));
  }

  if (!recording) {
    return next(
      new HttpError('Could not find a recording for the provided ID', 404)
    );
  }

  res.status(200).json({ recording: recording.toObject({ getters: true }) });
};

const getRecordings = async(req, res, next) => {
  let recordings;

  try {
    recordings = await Recording.find({});
  } catch (error) {
    return next(new HttpError('Fetching recordings failed', 500));
  }

  res
    .status(200)
    .json({ recordings: recordings.map((r) => r.toObject({ getters: true })) });
};

const createRecording = async(req, res, next) => {
  const errors = validationResult(req); //verifica si hay errores de validación en el request

  if (!errors.isEmpty()) {
    // console.log(errors) mostrar mas info
    return next(
      new HttpError('Invalid inputs passed, please check your data', 422)
    );
  }

  const { title, image, type, url } = req.body;

  let existingRecording;
  try {
    existingRecording = await Recording.findOne({ url: url });
  } catch (err) {
    return next(new HttpError('Creating new Recording Failed', 500));
  }

  if (existingRecording) {
    return next(new HttpError('Recording already exists!', 422));
  }

  const createdRecording = new Recording({
    title,
    image,
    type,
    url,
  });

  try {
    await createdRecording.save();
  } catch (err) {
    return next(new HttpError('Creating Recording failed', 500));
  }

  res.status(201).json({ recording: createdRecording }); // 201 cuando se creo algo nuevo con exito
};

const updateRecording = async(req, res, next) => {
  const errors = validationResult(req); //verifica si hay errores de validación en el request object

  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data', 422)
    );
  }

  const { title, url } = req.body;
  const recordingId = req.params.sid;

  let recording;

  try {
    recording = await Recording.findById(recordingId);
  } catch (error) {
    return next(new HttpError('Could not update the recording', 500));
  }

  if (!recording) {
    return next(
      new HttpError('Could not find a recording for the provided ID', 404)
    );
  }

  recording.title = title;
  recording.url = url;

  try {
    await recording.save();
  } catch (error) {
    return next(new HttpError('Could not update the recording', 500));
  }

  res.status(200).json({ recording: recording.toObject({ getters: true }) });
};

const deleteRecording = async(req, res, next) => {
  const recordingId = req.params.sid;

  let recording,
    title = '';

  try {
    recording = await Recording.findById(recordingId);
  } catch (error) {
    return next(new HttpError('Could not delete the recording', 500));
  }

  if (!recording) {
    return next(
      new HttpError('Could not find a recording for the provided ID', 404)
    );
  }

  title = recording.title;

  try {
    await recording.remove();
  } catch (error) {
    return next(new HttpError('Could not delete the recording', 500));
  }

  res.status(200).json({ message: 'Recording ' + title + ' Was Deleted' });
};

exports.getRecordingById = getRecordingById;
exports.getRecordings = getRecordings;
exports.createRecording = createRecording;
exports.updateRecording = updateRecording;
exports.deleteRecording = deleteRecording;