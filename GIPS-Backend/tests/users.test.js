const request = require('supertest');
const express = require('express');
const userRoutes = require('../routes/userRoutes');
const pb = require('../utils/dbBase');

jest.mock('../utils/dbBase');

const app = express();
app.use(express.json());
app.use('/v1/users', userRoutes);

describe('User Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /v1/users', () => {
    it('should return a list of users', async () => {
      const mockUsers = [
        { id: '1', name: 'User1', email: 'user1@example.com' },
      ];
      pb.collection.mockReturnValue({
        getFullList: jest.fn().mockResolvedValue(mockUsers),
      });

      const res = await request(app).get('/v1/users');

      expect(res.status).toBe(200);
      expect(res.body.users).toEqual(mockUsers);
      expect(pb.collection().getFullList).toHaveBeenCalledTimes(1);
    });

    it('should return a 500 error if fetching users fails', async () => {
      pb.collection.mockReturnValue({
        getFullList: jest.fn().mockRejectedValue(new Error('DB error')),
      });

      const res = await request(app).get('/v1/users');

      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Failed to retrieve users');
    });
  });

  describe('POST /v1/users', () => {
    it('should create a new user', async () => {
      const mockUser = {
        id: '1',
        name: 'NewUser',
        email: 'newuser@example.com',
        role: 'admin',
      };
      pb.collection.mockReturnValue({
        create: jest.fn().mockResolvedValue(mockUser),
      });

      const res = await request(app).post('/v1/users').send({
        name: 'NewUser',
        email: 'newuser@example.com',
        role: 'admin',
        faculty_id: '1',
      });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('User created successfully');
      expect(res.body.user).toEqual(mockUser);
      expect(pb.collection().create).toHaveBeenCalledWith({
        name: 'NewUser',
        email: 'newuser@example.com',
        emailVisibility: true,
        role: 'admin',
        faculty_id: '1',
        password: 'Password123!',
        passwordConfirm: 'Password123!',
      });
    });

    it('should return a 500 error if user creation fails', async () => {
      pb.collection.mockReturnValue({
        create: jest.fn().mockRejectedValue(new Error('DB error')),
      });

      const res = await request(app)
        .post('/v1/users')
        .send({ name: 'NewUser', email: 'newuser@example.com', role: 'admin' });

      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Failed to create user');
    });
  });

  describe('GET /v1/users/:id', () => {
    it('should return the user by ID', async () => {
      const mockUser = { id: '1', name: 'User1', email: 'user1@example.com' };
      pb.collection.mockReturnValue({
        getOne: jest.fn().mockResolvedValue(mockUser),
      });

      const res = await request(app).get('/v1/users/1');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockUser);
      expect(pb.collection().getOne).toHaveBeenCalledWith('1');
    });

    it('should return 404 if the user is not found', async () => {
      pb.collection.mockReturnValue({
        getOne: jest.fn().mockResolvedValue(null),
      });

      const res = await request(app).get('/v1/users/1');

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('User not found');
    });

    it('should return 500 if fetching user fails', async () => {
      pb.collection.mockReturnValue({
        getOne: jest.fn().mockRejectedValue(new Error('DB error')),
      });

      const res = await request(app).get('/v1/users/1');

      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Failed to retrieve user');
    });
  });

  describe('PATCH /v1/users/:id', () => {
    it('should fetch the user, update it by ID, and return the updated user', async () => {
      const existingUser = {
        id: '1',
        name: 'OriginalUser',
        email: 'original@example.com',
        role: 'user',
        faculty_id: '123',
      };

      const updatedUser = {
        id: '1',
        name: 'UpdatedUser',
        email: 'updated@example.com',
        role: 'admin',
        faculty_id: '123',
      };

      pb.collection.mockReturnValue({
        getOne: jest.fn().mockResolvedValue(existingUser),
        update: jest.fn().mockResolvedValue(updatedUser),
      });

      const res = await request(app).patch('/v1/users/1').send({
        name: 'UpdatedUser',
        email: 'updated@example.com',
        role: 'admin',
      });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('User updated successfully');
      expect(res.body.user).toEqual(updatedUser);
      expect(pb.collection().getOne).toHaveBeenCalledWith('1');
      expect(pb.collection().update).toHaveBeenCalledWith('1', {
        id: '1',
        name: 'UpdatedUser',
        email: 'updated@example.com',
        role: 'admin',
        faculty_id: '123',
      });
    });

    it('should return a 500 error if fetching or updating the user fails', async () => {
      pb.collection.mockReturnValue({
        getOne: jest.fn().mockRejectedValue(new Error('DB error')),
      });

      const res = await request(app).patch('/v1/users/1').send({
        name: 'UpdatedUser',
        email: 'updated@example.com',
        role: 'admin',
      });

      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Failed to update user');
    });
  });

  describe('DELETE /v1/users/:id', () => {
    it('should delete the user by ID', async () => {
      pb.collection.mockReturnValue({
        delete: jest.fn().mockResolvedValue(true),
      });

      const res = await request(app).delete('/v1/users/1');

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('User deleted successfully');
      expect(pb.collection().delete).toHaveBeenCalledWith('1');
    });

    it('should return a 500 error if user deletion fails', async () => {
      pb.collection.mockReturnValue({
        delete: jest.fn().mockRejectedValue(new Error('DB error')),
      });

      const res = await request(app).delete('/v1/users/1');

      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Failed to delete user');
    });
  });

  describe('POST /v1/users/login', () => {
    it('should authenticate the user with valid credentials', async () => {
      const mockAuthData = {
        token: 'fake-token',
        record: { id: '1', name: 'User1', email: 'user1@example.com' },
      };
      pb.collection.mockReturnValue({
        authWithPassword: jest.fn().mockResolvedValue(mockAuthData),
      });

      const res = await request(app).post('/v1/users/login').send({
        identity: 'user1@example.com',
        password: 'Password123!',
      });

      expect(res.status).toBe(200);
      expect(res.body.token).toBe('fake-token');
      expect(pb.collection().authWithPassword).toHaveBeenCalledWith(
        'user1@example.com',
        'Password123!',
      );
    });

    it('should return a 401 error if authentication fails', async () => {
      pb.collection.mockReturnValue({
        authWithPassword: jest.fn().mockRejectedValue(new Error('Auth error')),
      });

      const res = await request(app).post('/v1/users/login').send({
        identity: 'user1@example.com',
        password: 'wrong-password',
      });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Authentication failed');
    });
  });

  describe('POST /v1/users/request-password-reset', () => {
    it('should send a password reset request successfully', async () => {
      pb.collection.mockReturnValue({
        requestPasswordReset: jest.fn().mockResolvedValue(),
      });

      const res = await request(app)
        .post('/v1/users/request-password-reset')
        .send({
          email: 'user1@example.com',
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Password reset request sent');
      expect(pb.collection().requestPasswordReset).toHaveBeenCalledWith(
        'user1@example.com',
      );
    });

    it('should return a 400 error if the password reset request fails', async () => {
      pb.collection.mockReturnValue({
        requestPasswordReset: jest
          .fn()
          .mockRejectedValue(new Error('Reset error')),
      });

      const res = await request(app)
        .post('/v1/users/request-password-reset')
        .send({
          email: 'invalid@example.com',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Password reset request failed');
    });
  });

  describe('POST /v1/users/confirm-password-reset', () => {
    it('should confirm the password reset successfully', async () => {
      pb.collection.mockReturnValue({
        confirmPasswordReset: jest.fn().mockResolvedValue(),
      });

      const res = await request(app)
        .post('/v1/users/confirm-password-reset')
        .send({
          token: 'valid-token',
          password: 'NewPassword123!',
          passwordConfirm: 'NewPassword123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Password reset successful');
    });

    it('should return a 400 error if password reset confirmation fails', async () => {
      pb.collection.mockReturnValue({
        confirmPasswordReset: jest
          .fn()
          .mockRejectedValue(new Error('Invalid token')),
      });

      const res = await request(app)
        .post('/v1/users/confirm-password-reset')
        .send({
          token: 'invalid-token',
          password: 'NewPassword123!',
          passwordConfirm: 'NewPassword123!',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Password reset confirmation failed');
    });
  });

  describe('PATCH /v1/users/:id', () => {
    it('should update the user by ID', async () => {
      const mockUser = {
        id: '1',
        name: 'UpdatedUser',
        email: 'updated@example.com',
      };
      pb.collection.mockReturnValue({
        getOne: jest.fn().mockResolvedValue(mockUser),
        update: jest.fn().mockResolvedValue(mockUser),
      });

      const res = await request(app).patch('/v1/users/1').send({
        name: 'UpdatedUser',
      });

      expect(res.status).toBe(200);
      expect(res.body.user).toEqual(mockUser);
      expect(pb.collection().update).toHaveBeenCalledWith('1', {
        ...mockUser,
        name: 'UpdatedUser',
      });
    });

    it('should return a 500 error if user update fails', async () => {
      pb.collection.mockReturnValue({
        getOne: jest.fn().mockResolvedValue({ id: '1', name: 'User' }),
        update: jest.fn().mockRejectedValue(new Error('Update error')),
      });

      const res = await request(app).patch('/v1/users/1').send({
        name: 'UpdatedUser',
      });

      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Failed to update user');
    });
  });

  describe('DELETE /v1/users/:id', () => {
    it('should delete the user by ID', async () => {
      pb.collection.mockReturnValue({
        delete: jest.fn().mockResolvedValue(),
      });

      const res = await request(app).delete('/v1/users/1');

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('User and associated record deleted successfully');
      expect(pb.collection().delete).toHaveBeenCalledWith('1');
    });

    it('should return a 500 error if user deletion fails', async () => {
      pb.collection.mockReturnValue({
        delete: jest.fn().mockRejectedValue(new Error('Delete error')),
      });

      const res = await request(app).delete('/v1/users/1');

      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Failed to delete user');
    });
  });
});
