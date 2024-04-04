const joi = require('joi');

module.exports = {
  createUser: {
    body: {
      name: joi.string().min(1).max(100).required().label('Name'),
      email: joi.string().email().required().label('Email'),
      password: joi.string().min(6).max(32).required().label('Password'),
    },
  },

  updateUser: {
    body: {
      name: joi.string().min(1).max(100).required().label('Name'),
      email: joi.string().email().required().label('Email'),
    },
  },

  changePasswordSchema: joi.object({
    oldPassword: joi.string().required().label('Old Password'),
    newPassword: joi.string().min(6).max(32).required().label('New Password'),
    newPasswordConfirm: joi
      .string()
      .valid(joi.ref('newPassword'))
      .required()
      .label('Confirm Password')
      .messages({
        'any.only': 'New password and confirmation must match',
      }),
  }),
};
