const pb = require('../utils/dbBase');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const {
  notificationSchema,
  updateNotificationSchema,
} = require('../helpers/validation_schema');
const { sendNotification } = require('./emailController');
const { sendSMS } = require('./smsController');
// Added
const emailService = require('../services/NewEmailService');
const smsService = require('../services/SMSService');

// Helper: Stream users in pages to avoid loading entire table into memory
const streamUsers = async ({ collection, filter, fields, onBatch }) => {
  const perPage = 200;
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const res = await pb.collection(collection).getList(page, perPage, {
      ...(filter ? { filter } : {}),
      ...(fields ? { fields } : {}),
      sort: 'id',
    });

    await onBatch(res.items || []);
    totalPages = res.totalPages || 1;
    page += 1;
  }
};

exports.getNotifications = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;

  const notifications = await pb
    .collection('notifications')
    .getList(page, limit, {
      sort: '-created',
    });

  res.status(200).json({
    status: 'success',
    results: notifications.items.length,
    currentPage: page,
    totalPages: notifications.totalPages,
    totalRecords: notifications.totalItems,
    notifications: notifications.items,
  });
});

/** New Create Notification ****************************************************/
exports.newCreateNotification = catchAsync(async (req, res, next) => {
  // Validate the request body
  const { error } = notificationSchema.validate(req.body);
  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  // Destructure required properties from the request
  const {
    communicationTopic,
    messageDescription,
    communicationChannel,
    audience,
    date,
  } = req.body;

  // Create a new notification in the PocketBase collection
  const newNotification = await pb.collection('notifications').create({
    communicationTopic,
    messageDescription,
    communicationChannel,
    audience,
    date,
    isRead: false,
  });

  // Keep track of any warnings from notification errors
  let warnings = [];

  // *** Handle Email Notifications ***
  if (communicationChannel === 'Email') {
    try {
      let filter;
      if (audience === 'Students') {
        filter = 'role = "student"';
      } else if (audience === 'All') {
        filter = '';
      } else {
        filter = `department = "${audience}"`;
      }

      const emails = [];
      await streamUsers({
        collection: 'users',
        filter,
        fields: 'email',
        onBatch: (users) => {
          users.forEach((user) => {
            if (user.email) emails.push(user.email);
          });
        },
      });

      // Construct mail options. Note: the 'to' field is an array of email addresses.
      const mailOptions = {
        bcc: emails,
        subject: communicationTopic,
        text: messageDescription,
      };

      // Send the email using the email service.
      try {
        await emailService.sendEmail(mailOptions);
      } catch (err) {
        warnings.push('Email notification failed.');
      }
    } catch (err) {
      warnings.push('Failed to fetch email audience.');
    }
  }

  // *** Handle SMS Notifications ***
  if (communicationChannel === 'SMS') {
    try {
      let collection = 'users';
      let filter = '';
      if (audience === 'Students') {
        collection = 'students';
      } else if (audience === 'All') {
        filter = '';
      } else {
        filter = `department = "${audience}"`;
      }

      const phoneNumbers = [];
      await streamUsers({
        collection,
        filter,
        fields: 'phoneNumber',
        onBatch: (users) => {
          users.forEach((user) => {
            if (user.phoneNumber) phoneNumbers.push(user.phoneNumber);
          });
        },
      });

      // Construct SMS data. The 'to' field is an array of phone numbers.
      const smsData = {
        body: messageDescription,
        to: phoneNumbers,
      };

      // Send the SMS using the SMS service.
      try {
        await smsService.sendSMS(smsData);
      } catch (err) {
        warnings.push('SMS notification failed.');
      }
    } catch (err) {
      warnings.push('Failed to fetch SMS audience.');
    }
  }

  // Build the response object. Even if some notifications fail, the notification is created.
  const response = {
    status: 'success',
    notification: newNotification,
  };

  if (warnings.length > 0) {
    response.warning = warnings.join(' ');
  }

  return res.status(201).json(response);
});
/** *********************** ****************************************************/

exports.createNotification = catchAsync(async (req, res, next) => {
  const { error } = notificationSchema.validate(req.body);

  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  const {
    communicationTopic,
    messageDescription,
    communicationChannel,
    audience,
    date,
  } = req.body;

  const newNotification = await pb.collection('notifications').create({
    communicationTopic,
    messageDescription,
    communicationChannel,
    audience,
    date,
    isRead: false,
  });

  if (communicationChannel === 'Email') {
    let filter;
    if (audience === 'Students') {
      filter = 'role = "student"';
    } else {
      filter = `department = "${audience}"`;
    }

    const emails = [];
    await streamUsers({
      collection: 'users',
      filter,
      fields: 'email',
      onBatch: (users) => {
        users.forEach((user) => {
          if (user.email) emails.push(user.email);
        });
      },
    });

    const mailOptions = {
      bcc: emails,
      subject: communicationTopic,
      text: messageDescription,
    };

    await sendNotification(mailOptions);
  }

  if (communicationChannel === 'SMS') {
    let collection = 'users';
    let filter = '';
    if (audience === 'Students') {
      collection = 'students';
    } else {
      filter = `department = "${audience}"`;
    }

    const phoneNumbers = [];
    await streamUsers({
      collection,
      filter,
      fields: 'phoneNumber',
      onBatch: (users) => {
        users.forEach((user) => {
          if (user.phoneNumber) phoneNumbers.push(user.phoneNumber);
        });
      },
    });

    const smsData = {
      body: messageDescription,
      to: phoneNumbers,
    };
    const mockReq = { body: smsData };
    await sendSMS(mockReq, res);
  }

  res.status(201).json({
    status: 'success',
    notification: {
      notification: newNotification,
    },
  });
});

exports.updateNotification = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const { error } = updateNotificationSchema.validate(req.body);
  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  const {
    communicationTopic,
    messageDescription,
    communicationChannel,
    audience,
    date,
  } = req.body;

  // Update the notification with the fields provided (assuming partial updates)
  const updatedNotification = await pb
    .collection('notifications')
    .update(id, {
      ...(communicationTopic && { communicationTopic }),
      ...(messageDescription && { messageDescription }),
      ...(communicationChannel && { communicationChannel }),
      ...(audience && { audience }),
      ...(date && { date }),
    });

  res.status(200).json({
    status: 'success',
    notification: {
      notification: updatedNotification,
    },
  });
});

exports.deleteNotification = catchAsync(async (req, res) => {
  const { id } = req.params;

  await pb.collection('notifications').delete(id);

  res.status(204).json({ message: 'Notification deleted' });
});
