const AccessControl = require('role-acl');
const ac = new AccessControl();

// Basic read permission for all users
ac.grant('user')
  .execute('read').on('book');

// Admin permissions: Only admins can read, update, and delete
ac.grant('admin')
  .execute('read').on('book')
  .execute('create').on('book')  
  .execute('update').on('book')
  .execute('delete').on('book');

// Exported functions to check permissions
exports.readAll = (requester) => ac.can(requester.role).execute('read').sync().on('books');

exports.read = (requester) => ac.can(requester.role).execute('read').sync().on('book');

exports.create = (requester) => ac.can(requester.role).execute('create').sync().on('book'); 

exports.update = (requester) => ac.can(requester.role).execute('update').sync().on('book');

exports.delete = (requester) => ac.can(requester.role).execute('delete').sync().on('book');