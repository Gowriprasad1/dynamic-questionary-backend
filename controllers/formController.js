const Form = require('../models/Form');
const { validationResult } = require('express-validator');

// Helpers copied from routes (no behavior change)
const generateValidatorsObject = (question) => {
  const validators = {};
  const validatorTypes = ['required', 'max', 'min', 'maxLength', 'minLength', 'pattern', 'email', 'maxDate', 'minDate', 'maxPastDays', 'maxFutureDays'];
  validatorTypes.forEach(validatorType => {
    if (question.validator_options && question.validator_options.includes(validatorType)) {
      const value = question.validator_values && question.validator_values[validatorType];
      const message = question.error_messages && question.error_messages[validatorType];
      if (['max', 'min', 'pattern', 'required', 'maxLength', 'minLength'].includes(validatorType)) {
        validators[validatorType] = { value: value || '', message: message || '' };
      } else {
        validators[validatorType] = value || '';
      }
    } else {
      if (['max', 'min', 'pattern', 'required', 'maxLength', 'minLength'].includes(validatorType)) {
        validators[validatorType] = { value: '', message: '' };
      } else {
        validators[validatorType] = '';
      }
    }
  });
  return validators;
};

const reorderQuestionNumbers = (questions, newQuestionNumber, skipIndex = -1) => {
  if (!newQuestionNumber || newQuestionNumber.trim() === '') return questions;
  const newNum = parseInt(newQuestionNumber);
  if (isNaN(newNum)) return questions;
  const updateChildQuestionNumbers = (subQuestions, oldParentNum, newParentNum) => {
    if (!subQuestions || subQuestions.length === 0) return subQuestions;
    return subQuestions.map(subQ => {
      if (subQ.questionNumber) {
        const match = subQ.questionNumber.match(/^(\d+)([a-z]+)$/i);
        if (match) {
          const letterSuffix = match[2];
          return { ...subQ, questionNumber: `${newParentNum}${letterSuffix}` };
        }
      }
      return subQ;
    });
  };
  return questions.map((q, index) => {
    if (index === skipIndex) return q;
    if (q.questionNumber && /^\d+$/.test(q.questionNumber.trim())) {
      const currentNum = parseInt(q.questionNumber);
      if (!isNaN(currentNum) && currentNum >= newNum) {
        const newParentNum = currentNum + 1;
        return { ...q, questionNumber: String(newParentNum), subQuestions: updateChildQuestionNumbers(q.subQuestions, currentNum, newParentNum) };
      }
    }
    return q;
  });
};

async function getAll(req, res) {
  try {
    const forms = await Form.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(forms);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching forms', error: error.message });
  }
}

async function getById(req, res) {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) return res.status(404).json({ message: 'Form not found' });
    res.json(form);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching form', error: error.message });
  }
}

// Recursively clean and attach validators for sub-questions
const cleanSubQuestion = (subQ) => ({
  question: subQ.question,
  questionType: subQ.questionType,
  questionId: subQ.questionId,
  questionNumber: subQ.questionNumber || '',
  option_type: subQ.option_type,
  options: (subQ.options || []).map(opt => ({ key: opt.key, val: opt.val })),
  validator_values: subQ.validator_values || {},
  error_messages: subQ.error_messages || {},
  validators: generateValidatorsObject(subQ),
  validator_options: subQ.validator_options || [],
  triggerValue: subQ.triggerValue || '',
  children: subQ.children || '',
  listItems: Array.isArray(subQ.listItems) ? subQ.listItems : [],
  order: subQ.order || 0,
  subQuestions: Array.isArray(subQ.subQuestions) ? subQ.subQuestions.map(cleanSubQuestion) : []
});

async function create(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    let processedQuestions = [];
    for (let i = 0; i < req.body.questions.length; i++) {
      const question = req.body.questions[i];
      if (question.questionNumber && /^\d+$/.test(question.questionNumber.trim())) {
        processedQuestions = reorderQuestionNumbers(processedQuestions, question.questionNumber);
      }
      const cleanedQuestion = {
        question: question.question,
        questionType: question.questionType,
        questionId: question.questionId,
        questionNumber: question.questionNumber || '',
        option_type: question.option_type,
        options: (question.options || []).map(opt => ({ key: opt.key, val: opt.val })),
        validator_values: question.validator_values || {},
        error_messages: question.error_messages || {},
        validators: generateValidatorsObject(question),
        validator_options: question.validator_options || [],
        children: question.children || '',
        parentQuestionId: question.parentQuestionId || '',
        listItems: Array.isArray(question.listItems) ? question.listItems : [],
        order: i,
        subQuestions: Array.isArray(question.subQuestions) ? question.subQuestions.map(cleanSubQuestion) : []
      };
      processedQuestions.push(cleanedQuestion);
    }

    const formData = { ...req.body, questions: processedQuestions };
    const form = new Form(formData);
    await form.save();
    res.status(201).json(form);
  } catch (error) {
    res.status(500).json({ message: 'Error creating form', error: error.message });
  }
}

async function update(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const cleanObject = (obj) => { if (!obj) return obj; const cleaned = { ...obj }; delete cleaned._id; return cleaned; };

    let processedQuestions = [];
    if (req.body.questions && Array.isArray(req.body.questions)) {
      for (let i = 0; i < req.body.questions.length; i++) {
        const question = req.body.questions[i];
        if (question.questionNumber && /^\d+$/.test(question.questionNumber.trim())) {
          processedQuestions = reorderQuestionNumbers(processedQuestions, question.questionNumber, i);
        }
        const cleanedQuestion = {
          question: question.question,
          questionType: question.questionType,
          questionId: question.questionId,
          questionNumber: question.questionNumber || '',
          option_type: question.option_type,
          options: (question.options || []).map(opt => ({ key: opt.key, val: opt.val })),
          validator_values: cleanObject(question.validator_values),
          error_messages: cleanObject(question.error_messages),
          validators: generateValidatorsObject(question),
          validator_options: question.validator_options || [],
          children: question.children || '',
          parentQuestionId: question.parentQuestionId || '',
          listItems: Array.isArray(question.listItems) ? question.listItems : [],
          order: question.order || 0,
          subQuestions: Array.isArray(question.subQuestions) ? question.subQuestions.map(cleanSubQuestion) : []
        };
        processedQuestions.push(cleanedQuestion);
      }
    }

    const updateData = { title: req.body.title, description: req.body.description, questions: processedQuestions };
    const form = await Form.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!form) return res.status(404).json({ message: 'Form not found' });
    res.json(form);
  } catch (error) {
    console.error('Error updating form:', error);
    res.status(500).json({ message: 'Error updating form', error: error.message });
  }
}

async function addQuestion(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const form = await Form.findById(req.params.id);
    if (!form) return res.status(404).json({ message: 'Form not found' });

    if (req.body.questionNumber && /^\d+$/.test(req.body.questionNumber.trim())) {
      form.questions = reorderQuestionNumbers(form.questions, req.body.questionNumber);
    }

    const newQuestion = {
      ...req.body,
      validators: generateValidatorsObject(req.body),
      subQuestions: req.body.subQuestions?.map(subQ => ({ ...subQ, validators: generateValidatorsObject(subQ) })) || [],
      listItems: Array.isArray(req.body.listItems) ? req.body.listItems : [],
      order: form.questions.length
    };

    form.questions.push(newQuestion);
    await form.save();
    res.status(201).json(form);
  } catch (error) {
    res.status(500).json({ message: 'Error adding question', error: error.message });
  }
}

async function remove(req, res) {
  try {
    const form = await Form.findByIdAndDelete(req.params.id);
    if (!form) return res.status(404).json({ message: 'Form not found' });
    res.json({ message: 'Form deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting form', error: error.message });
  }
}

async function createSample(req, res) {
  try {
    const sampleForm = require('../utils/sampleForm');
    const form = new Form(sampleForm);
    await form.save();
    res.status(201).json(form);
  } catch (error) {
    res.status(500).json({ message: 'Error creating sample form', error: error.message });
  }
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  addQuestion,
  remove,
  createSample,
};
