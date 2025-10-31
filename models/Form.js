const mongoose = require('mongoose');

// Schema for options (for radio, select, checkbox)
const optionSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true
  },
  val: {
    type: String,
    required: true
  }
});

// Schema for validator values
const validatorValuesSchema = new mongoose.Schema({
  max: Number,
  min: Number,
  maxDate: String,
  minDate: String,
  pattern: String,
  maxLength: Number,
  minLength: Number,
  maxPastDays: String,
  maxFutureDays: String,
  required: Boolean
});

// Schema for error messages
const errorMessagesSchema = new mongoose.Schema({
  max: String,
  min: String,
  maxDate: String,
  minDate: String,
  pattern: String,
  required: String,
  maxLength: String,
  minLength: String,
  maxPastDays: String,
  maxFutureDays: String
});

// Schema for individual validators
const validatorSchema = new mongoose.Schema({
  value: mongoose.Schema.Types.Mixed,
  message: String
});

// Schema for validators object
const validatorsSchema = new mongoose.Schema({
  max: validatorSchema,
  min: validatorSchema,
  email: String,
  maxDate: String,
  minDate: String,
  pattern: validatorSchema,
  required: validatorSchema,
  maxLength: validatorSchema,
  minLength: validatorSchema,
  maxPastDays: String
}, { _id: false, strict: false });

// Define sub-question schema first (same structure as question but without nested subQuestions)
const subQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: false,
    trim: true
  },
  questionType: {
    type: String,
    required: false,
    trim: true
  },
  questionId: {
    type: String,
    required: false,
    trim: true
  },
  questionNumber: {
    type: String,
    required: false,
    trim: true
  },
  option_type: {
    type: String,
    required: false,
    enum: ['text', 'email', 'number', 'textarea', 'select', 'radio', 'checkbox', 'date', 'file']
  },
  options: [optionSchema],
  validator_values: {
    type: validatorValuesSchema,
    default: () => ({})
  },
  error_messages: {
    type: errorMessagesSchema,
    default: () => ({})
  },
  validators: {
    type: validatorsSchema,
    default: () => ({})
  },
  validator_options: {
    type: [String],
    default: []
  },
  triggerValue: {
    type: String,
    default: null,
    trim: true
  },
  order: {
    type: Number,
    default: 0
  }
  ,
  // Optional ordered list items associated with a sub-question
  listItems: {
    type: [String],
    default: []
  }
}, { _id: true });

// Enable nested child questions for sub-questions
subQuestionSchema.add({
  children: { type: String, default: null },
  subQuestions: { type: [/* recursive */] }
});

// After initial add, attach recursive reference
subQuestionSchema.path('subQuestions', [subQuestionSchema]);

// Define questionSchema with sub-questions
const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  questionType: {
    type: String,
    required: true,
    trim: true
  },
  questionId: {
    type: String,
    required: true,
    trim: true
  },
  questionNumber: {
    type: String,
    required: false,
    trim: true
  },
  option_type: {
    type: String,
    required: true,
    enum: ['text', 'email', 'number', 'textarea', 'select', 'radio', 'checkbox', 'date', 'file']
  },
  options: [optionSchema], // Array of {key, val} objects
  validator_values: validatorValuesSchema,
  error_messages: errorMessagesSchema,
  validators: validatorsSchema,
  validator_options: [String], // Array of validator names being used
  children: {
    type: String,
    default: null // Will contain the answer that triggers child questions (e.g., "yes")
  },
  subQuestions: {
    type: [subQuestionSchema],
    default: []
  },
  parentQuestionId: {
    type: String,
    default: null // Reference to parent question if this is a child question
  },
  // Optional ordered list items associated with this question
  listItems: {
    type: [String],
    default: []
  },
  order: {
    type: Number,
    default: 0
  }
});

const formSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  questions: [questionSchema], // Changed from fields to questions
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

formSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Form', formSchema);
