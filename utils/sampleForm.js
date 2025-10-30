const sampleForm = {
  title: "Health Assessment Form",
  description: "A comprehensive health assessment form with validation rules",
  questions: [
    {
      question: "Do you consume alcohol?",
      questionType: "Health",
      questionId: "health1",
      option_type: "radio",
      options: [
        { key: "Yes", val: "Yes" },
        { key: "No", val: "No" }
      ],
      validator_values: {
        max: "",
        min: "",
        maxDate: "",
        minDate: "",
        pattern: "",
        maxLength: "",
        minLength: "",
        maxPastDays: "",
        maxFutureDays: "",
        required: true
      },
      error_messages: {
        max: "",
        min: "",
        maxDate: "",
        minDate: "",
        pattern: "",
        required: "This field is mandatory",
        maxLength: "",
        minLength: "",
        maxPastDays: "",
        maxFutureDays: ""
      },
      validators: {
        max: { value: "", message: "" },
        min: { value: "", message: "" },
        email: "",
        maxDate: "",
        minDate: "",
        pattern: { value: "", message: "" },
        required: { value: true, message: "This field is mandatory" },
        maxLength: { value: "", message: "" },
        minLength: { value: "", message: "" },
        maxPastDays: ""
      },
      validator_options: ["required"],
      children: "Yes",
      parentQuestionId: "",
      order: 0
    },
    {
      question: "How many drinks do you consume per week?",
      questionType: "Health",
      questionId: "health2",
      option_type: "number",
      options: [],
      validator_values: {
        max: 50,
        min: 0,
        maxDate: "",
        minDate: "",
        pattern: "",
        maxLength: "",
        minLength: "",
        maxPastDays: "",
        maxFutureDays: "",
        required: true
      },
      error_messages: {
        max: "Please provide a value between 0 and 50",
        min: "Please provide a value between 0 and 50",
        maxDate: "",
        minDate: "",
        pattern: "",
        required: "This field is mandatory",
        maxLength: "",
        minLength: "",
        maxPastDays: "",
        maxFutureDays: ""
      },
      validators: {
        max: { value: 50, message: "Please provide a value between 0 and 50" },
        min: { value: 0, message: "Please provide a value between 0 and 50" },
        email: "",
        maxDate: "",
        minDate: "",
        pattern: { value: "", message: "" },
        required: { value: true, message: "This field is mandatory" },
        maxLength: { value: "", message: "" },
        minLength: { value: "", message: "" },
        maxPastDays: ""
      },
      validator_options: ["required", "max", "min"],
      children: "",
      parentQuestionId: "health1",
      order: 1
    },
    {
      question: "What is your email address?",
      questionType: "Contact",
      questionId: "contact1",
      option_type: "email",
      options: [],
      validator_values: {
        max: "",
        min: "",
        maxDate: "",
        minDate: "",
        pattern: "",
        maxLength: 100,
        minLength: 5,
        maxPastDays: "",
        maxFutureDays: "",
        required: true
      },
      error_messages: {
        max: "",
        min: "",
        maxDate: "",
        minDate: "",
        pattern: "",
        required: "Email is mandatory",
        maxLength: "Email cannot exceed 100 characters",
        minLength: "Email must be at least 5 characters",
        maxPastDays: "",
        maxFutureDays: ""
      },
      validators: {
        max: { value: "", message: "" },
        min: { value: "", message: "" },
        email: "email",
        maxDate: "",
        minDate: "",
        pattern: { value: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", message: "Please enter a valid email address" },
        required: { value: true, message: "Email is mandatory" },
        maxLength: { value: 100, message: "Email cannot exceed 100 characters" },
        minLength: { value: 5, message: "Email must be at least 5 characters" },
        maxPastDays: ""
      },
      validator_options: ["required", "email", "maxLength", "minLength", "pattern"],
      children: "",
      parentQuestionId: "",
      order: 2
    },
    {
      question: "Please describe your current health condition",
      questionType: "Health",
      questionId: "health3",
      option_type: "textarea",
      options: [],
      validator_values: {
        max: "",
        min: "",
        maxDate: "",
        minDate: "",
        pattern: "",
        maxLength: 500,
        minLength: 10,
        maxPastDays: "",
        maxFutureDays: "",
        required: false
      },
      error_messages: {
        max: "",
        min: "",
        maxDate: "",
        minDate: "",
        pattern: "",
        required: "",
        maxLength: "Description cannot exceed 500 characters",
        minLength: "Description must be at least 10 characters",
        maxPastDays: "",
        maxFutureDays: ""
      },
      validators: {
        max: { value: "", message: "" },
        min: { value: "", message: "" },
        email: "",
        maxDate: "",
        minDate: "",
        pattern: { value: "", message: "" },
        required: { value: false, message: "" },
        maxLength: { value: 500, message: "Description cannot exceed 500 characters" },
        minLength: { value: 10, message: "Description must be at least 10 characters" },
        maxPastDays: ""
      },
      validator_options: ["maxLength", "minLength"],
      children: "",
      parentQuestionId: "",
      order: 3
    }
  ]
};

module.exports = sampleForm;