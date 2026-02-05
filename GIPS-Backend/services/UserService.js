const pb = require('../utils/dbBase');

class UserService {
  static list(page = 1, limit = 20, filter = '') {
    return pb.collection('users').getList(page, limit, {
      ...(filter ? { filter } : {}),
      sort: '-created',
    });
  }

  static listAll() {
    // Use streaming for large datasets - returns async iterator
    return this.streamUsers();
  }

  static async *streamUsers(filter = '') {
    const perPage = 200;
    let page = 1;
    let totalPages = 1;

    while (page <= totalPages) {
      const res = await pb.collection('users').getList(page, perPage, {
        ...(filter ? { filter } : {}),
        sort: 'id',
      });

      for (const user of res.items || []) {
        yield user;
      }

      totalPages = res.totalPages || 1;
      page += 1;
    }
  }

  static getById(id) {
    return pb.collection('users').getOne(id);
  }

  static create(data) {
    return pb.collection('users').create(data);
  }

  static update(id, data) {
    return pb.collection('users').update(id, data);
  }

  static delete(id) {
    return pb.collection('users').delete(id);
  }
}

module.exports = UserService;
