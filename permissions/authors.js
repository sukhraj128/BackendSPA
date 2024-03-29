const AccessControl = require('role-acl');
const ac = new AccessControl();

// Basic read permission for all users
ac.grant('user')
  .execute('read').on('author');

// Admin permissions: Only admins can read, update, and delete
ac.grant('admin')
  .execute('read').on('author')
  .execute('create').on('author')  // Assuming you want to include create permission explicitly
  .execute('update').on('author')
  .execute('delete').on('author');

// Exported functions to check permissions
exports.readAll = (requester) => ac.can(requester.role).execute('read').sync().on('authors');

exports.read = (requester) => ac.can(requester.role).execute('read').sync().on('author');

exports.create = (requester) => ac.can(requester.role).execute('create').sync().on('author'); 

exports.update = (requester) => ac.can(requester.role).execute('update').sync().on('author');

exports.delete = (requester) => ac.can(requester.role).execute('delete').sync().on('author');
