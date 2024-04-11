const usersService = require('./users-service');
const { errorResponder, errorTypes } = require('../../../core/errors');
const {
  EMAIL_ALREADY_TAKEN,
  INVALID_PASSWORD,
} = require('../../../core/errors');
const {
  changePasswordSchema,
} = require('../../components/users/users-validator');

/**
 * Handle get list of users request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getUsers(request, response, next) {
  try {
    const users = await usersService.getUsers();
    return response.status(200).json(users);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle get user detail request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getUser(request, response, next) {
  try {
    const user = await usersService.getUser(request.params.id);

    if (!user) {
      throw errorResponder(errorTypes.UNPROCESSABLE_ENTITY, 'Unknown user');
    }

    return response.status(200).json(user);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle create user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function createUser(request, response, next) {
  try {
    const name = request.body.name;
    const email = request.body.email;
    const password = request.body.password;
    const password_confirm = request.body.password_confirm;

    if (password !== password_confirm) {
      // const error = new Error('Password and confirmation do not match');
      // error.statusCode = 403;
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'Password and confirmation do not match'
      );
    }

    const emailTaken = await usersService.isEmailTaken(email);
    if (emailTaken) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
        'Email already taken'
      );
    }

    const success = await usersService.createUser(
      name,
      email,
      password,
      password_confirm
    );
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to create user'
      );
    }

    return response.status(200).json({ name, email });
  } catch (error) {
    if (error.type === errorTypes.INVALID_PASSWORD) {
      return response
        .status(403)
        .json({ error: 'Invalid Password confirmation' });
    }
    return next(error);
  }
}

/**
 * Handle update user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function updateUser(request, response, next) {
  try {
    const id = request.params.id;
    const name = request.body.name;
    const email = request.body.email;

    const emailTaken = await usersService.isEmailTaken(email);
    if (emailTaken) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
        'Email already taken'
      );
    }

    const success = await usersService.updateUser(id, name, email);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to update user'
      );
    }

    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle delete user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function deleteUser(request, response, next) {
  try {
    const id = request.params.id;

    const success = await usersService.deleteUser(id);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to delete user'
      );
    }

    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}

async function changePassword(request, response, next) {
  try {
    const id = request.params.id;
    const oldPassword = request.body.oldPassword;
    const newPassword = request.body.newPassword;
    const password_confirm = request.body.password_confirm;
    const changePasswordSchema = await usersService.changePasswordSchema(
      id,
      oldPassword,
      newPassword,
      password_confirm
    );

    return response.status(200).json({ message: 'Login Success' });
  } catch (error) {
    if (error.isJoi) {
      return next(
        errorResponder(errorTypes.INVALID_INPUT, error.details[0].message)
      );
    }
    return next(error);
  }
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
};
