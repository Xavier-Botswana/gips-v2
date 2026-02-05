const pb = require('../utils/dbBase');

class ApplicationService {
  static async list(page, limit, filter, sort = '-created') {
    return pb.collection('applications').getList(page, limit, {
      expand: 'option_one,option_two,option_three,guest_id,semester_id',
      sort,
      filter,
    });
  }

  static async getByIdExpanded(id) {
    return pb.collection('applications').getOne(id, {
      expand: 'option_one,option_two,option_three,guest_id,semester_id',
    });
  }

  static async create(data) {
    return pb.collection('applications').create(data);
  }

  static async getById(id) {
    return pb.collection('applications').getOne(id);
  }

  static async update(id, data) {
    return pb.collection('applications').update(id, data);
  }

  static async delete(id) {
    return pb.collection('applications').delete(id);
  }
}

module.exports = ApplicationService;
