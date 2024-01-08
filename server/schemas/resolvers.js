const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    // Use the existing logic from user-controller.js for getting a single user
    me: async (_, args, context) => {
      if (context.user) {
        return User.findOne({ _id: context.user._id }).populate('savedBooks');
      }
      throw new Error('Not logged in');
    },
  },
  Mutation: {
    // Use logic from user-controller.js for user authentication and user creation
    login: async (_, { email, password }) => {
      //... (similar to async login in user-controller.js)
    },
    addUser: async (_, args) => {
      //... (similar to async createUser in user-controller.js)
    },
    saveBook: async (_, args, context) => {
      //... (similar to async saveBook in user-controller.js)
    },
    removeBook: async (_, { bookId }, context) => {
      //... (similar to async deleteBook in user-controller.js)
    },
  },
};

module.exports = resolvers;
