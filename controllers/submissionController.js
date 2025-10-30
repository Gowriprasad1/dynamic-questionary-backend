const Submission = require('../models/Submission');
const Form = require('../models/Form');
const { validationResult } = require('express-validator');

// Helper function copied from routes (no behavior change)
const validateFormData = (formData, form) => {
  const errors = [];
  form.questions.forEach(question => {
    const value = formData[question.questionId];
    if (question.validators.required?.value && (!value || value.toString().trim() === '')) {
      errors.push({ field: question.questionId, message: question.validators.required.message || `${question.question} is required` });
      return;
    }
    if (!value || value.toString().trim() === '') return;
    if (question.validators.maxLength?.value && value.toString().length > question.validators.maxLength.value) {
      errors.push({ field: question.questionId, message: question.validators.maxLength.message || `${question.question} is too long` });
    }
    if (question.validators.minLength?.value && value.toString().length < question.validators.minLength.value) {
      errors.push({ field: question.questionId, message: question.validators.minLength.message || `${question.question} is too short` });
    }
    if (question.validators.pattern?.value) {
      let patternValue = question.validators.pattern.value;
      if (patternValue.startsWith('/') && patternValue.lastIndexOf('/') > 0) {
        const lastSlashIndex = patternValue.lastIndexOf('/');
        const pattern = patternValue.substring(1, lastSlashIndex);
        const flags = patternValue.substring(lastSlashIndex + 1);
        patternValue = pattern + (flags ? `,${flags}` : '');
      }
      try {
        const regex = new RegExp(patternValue);
        if (!regex.test(value.toString())) {
          errors.push({ field: question.questionId, message: question.validators.pattern.message || `${question.question} format is invalid` });
        }
      } catch (error) {
        errors.push({ field: question.questionId, message: `Invalid pattern format for ${question.question}` });
      }
    }
    if (question.option_type === 'number') {
      const numValue = parseFloat(value);
      if (question.validators.max?.value && numValue > question.validators.max.value) {
        errors.push({ field: question.questionId, message: question.validators.max.message || `${question.question} is too large` });
      }
      if (question.validators.min?.value && numValue < question.validators.min.value) {
        errors.push({ field: question.questionId, message: question.validators.min.message || `${question.question} is too small` });
      }
    }
    if (question.validators.email && question.option_type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value.toString())) {
        errors.push({ field: question.questionId, message: question.error_messages?.email || `${question.question} must be a valid email` });
      }
    }
  });
  return errors;
};

async function submit(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const form = await Form.findById(req.body.formId);
    if (!form || !form.isActive) return res.status(404).json({ message: 'Form not found or inactive' });

    const validationErrors = validateFormData(req.body.data, form);
    if (validationErrors.length > 0) {
      return res.status(400).json({ message: 'Validation failed', errors: validationErrors });
    }

    const submission = new Submission({ formId: req.body.formId, data: req.body.data, ipAddress: req.ip, userAgent: req.get('User-Agent') });
    await submission.save();
    res.status(201).json({ message: 'Form submitted successfully', submissionId: submission._id });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting form', error: error.message });
  }
}

async function getByForm(req, res) {
  try {
    const submissions = await Submission.find({ formId: req.params.formId }).sort({ submittedAt: -1 });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching submissions', error: error.message });
  }
}

async function getById(req, res) {
  try {
    const submission = await Submission.findById(req.params.id).populate('formId');
    if (!submission) return res.status(404).json({ message: 'Submission not found' });
    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching submission', error: error.message });
  }
}

async function getAll(req, res) {
  try {
    const submissions = await Submission.find().populate('formId', 'title').sort({ submittedAt: -1 });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching submissions', error: error.message });
  }
}

module.exports = { submit, getByForm, getById, getAll };
