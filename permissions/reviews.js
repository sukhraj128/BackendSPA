const AccessControl = require('role-acl');
const ac = new AccessControl();

// Allow any user to read reviews without ownership check
ac.grant('user').execute('read').on('review');
ac.grant('user').execute('create').on('review');
// User permissions for their own reviews
ac.grant('user').condition({Fn: 'EQUALS', args: {'requester': '$.owner'}}).execute('update').on('review');
ac.grant('user').condition({Fn: 'EQUALS', args: {'requester': '$.owner'}}).execute('delete').on('review');

// Admin permissions for any review
ac.grant('admin').execute('read').on('review');
ac.grant('admin').execute('create').on('review');
ac.grant('admin').execute('update').on('review');
ac.grant('admin').execute('delete').on('review');

// Helper functions to check permissions
exports.read = (requester) => ac.can(requester.role).execute('read').sync().on('review');
exports.update = (requester, data) => ac.can(requester.role).context({requester: requester.ID, owner: data.UserID}).execute('update').sync().on('review');
exports.create = (requester) => ac.can(requester.role).execute('create').sync().on('review');
exports.delete = (requester, data) => ac.can(requester.role).context({requester: requester.ID, owner: data.UserID}).execute('delete').sync().on('review');