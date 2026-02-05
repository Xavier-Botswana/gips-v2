const pb = require('../utils/dbBase');
const { safeGetFirst } = require('../utils/dbHelpers');

class StudentService {
  static list(page, limit, filter, sort = '-created') {
    return pb.collection('students').getList(page, limit, {
      expand: 'course_id,semester_id',
      sort,
      filter,
    });
  }

  static async *streamStudents(filter = '') {
    const perPage = 200;
    let page = 1;
    let totalPages = 1;

    while (page <= totalPages) {
      const res = await pb.collection('students').getList(page, perPage, {
        expand: 'course_id,semester_id',
        sort: '-created',
        ...(filter ? { filter } : {}),
      });

      for (const student of res.items || []) {
        yield student;
      }

      totalPages = res.totalPages || 1;
      page += 1;
    }
  }

  static listAll() {
    // Use streaming for large datasets - returns async iterator
    return this.streamStudents();
  }

  static async getByUserId(userId) {
    return safeGetFirst(
      pb,
      'students',
      `user_id = "${String(userId).replace(/"/g, '\\"')}"`,
      {
        expand: 'course_id,semester_id',
      }
    );
  }

  static create(data) {
    return pb.collection('students').create(data);
  }

  static getById(id) {
    return pb.collection('students').getOne(id, { expand: 'course_id,semester_id' });
  }

  static update(id, data) {
    return pb.collection('students').update(id, data);
  }

  static delete(id) {
    return pb.collection('students').delete(id);
  }
}

module.exports = StudentService;
