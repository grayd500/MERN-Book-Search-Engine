// server/schemas/resolvers.js:
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
      const user = await User.findOne({ email });
    
      if (!user) {
        throw new Error('Incorrect credentials');
      }
    
      const correctPw = await user.isCorrectPassword(password);
    
      if (!correctPw) {
        throw new Error('Incorrect credentials');
      }
    
      const token = signToken(user);
    
      return { token, user };
    },
    
    addUser: async (_, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
    
      return { token, user };
    },
    
    saveBook: async (_, { input }, context) => {
      if (context.user) {
        return await User.findByIdAndUpdate(
          context.user._id,
          { $addToSet: { savedBooks: input } }, // use input instead of bookData
          { new: true, runValidators: true }
        ).populate('savedBooks');
      }
      throw new Error('You need to be logged in!');
    },
   

    removeBook: async (_, { bookId }, context) => {
      if (context.user) {
        return await User.findByIdAndUpdate(
          context.user._id,
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        ).populate('savedBooks');
      }
      throw new Error('You need to be logged in!');
    },
  },
};

module.exports = resolvers;
