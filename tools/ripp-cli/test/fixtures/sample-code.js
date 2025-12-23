/**
 * Sample code file for testing evidence builder
 */

class UserService {
  constructor(database) {
    this.db = database;
  }

  /**
   * Create a new user account
   * @param {Object} userData - User information
   * @returns {Promise<Object>} Created user
   */
  async createUser(userData) {
    // Validate input
    if (!userData.email || !userData.name) {
      throw new Error('Email and name are required');
    }

    // Check for duplicates
    const existing = await this.db.findUserByEmail(userData.email);
    if (existing) {
      throw new Error('User already exists');
    }

    // Create user
    const user = await this.db.insert('users', {
      email: userData.email,
      name: userData.name,
      created_at: new Date()
    });

    return user;
  }

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User object
   */
  async getUserById(userId) {
    const user = await this.db.findById('users', userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated user
   */
  async updateUser(userId, updates) {
    const user = await this.getUserById(userId);
    
    const updated = await this.db.update('users', userId, {
      ...updates,
      updated_at: new Date()
    });

    return updated;
  }

  /**
   * Delete user account
   * @param {string} userId - User ID
   */
  async deleteUser(userId) {
    await this.getUserById(userId); // Verify exists
    await this.db.delete('users', userId);
  }
}

module.exports = UserService;
