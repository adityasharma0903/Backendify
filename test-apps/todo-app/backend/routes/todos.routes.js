import express from 'express';
import { query, body, param } from 'express-validator';
import { validateErrors } from '../middleware/validation.js';
import { ResponseHelper } from '../utils/helper.js';
import Todo from '../models/Todo.js';
import { Op } from 'sequelize';

const router = express.Router();

// GET ALL - With pagination
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    validateErrors
  ],
  async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const { count, rows } = await Todo.findAndCountAll({
        where: { isDeleted: false },
        limit,
        offset,
        order: [['createdAt', 'DESC']]
      });

      const pagination = {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit)
      };

      return ResponseHelper.paginated(res, rows, pagination, 'todos loaded successfully');
    } catch (error) {
      next(error);
    }
  }
);

// GET BY ID
router.get(
  '/:id',
  [param('id').isInt(), validateErrors],
  async (req, res, next) => {
    try {
      const item = await Todo.findOne({
        where: { id: req.params.id, isDeleted: false }
      });

      if (!item) {
        return ResponseHelper.notFound(res, 'Todo');
      }

      return ResponseHelper.success(res, item, 'Item retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
);

// CREATE
router.post(
  '/',
  async (req, res, next) => {
    try {
      const saved = await Todo.create(req.body);
      return ResponseHelper.success(res, saved, 'Todo created successfully', 201);
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        const errors = error.errors.map(e => e.message);
        return ResponseHelper.validationError(res, errors);
      }
      next(error);
    }
  }
);

// UPDATE
router.put(
  '/:id',
  [param('id').isInt(), validateErrors],
  async (req, res, next) => {
    try {
      const [updatedCount] = await Todo.update(
        req.body,
        { where: { id: req.params.id } }
      );

      if (updatedCount === 0) {
        return ResponseHelper.notFound(res, 'Todo');
      }

      const updated = await Todo.findByPk(req.params.id);
      return ResponseHelper.success(res, updated, 'Todo updated successfully');
    } catch (error) {
      next(error);
    }
  }
);

// DELETE (Soft Delete)
router.delete(
  '/:id',
  [param('id').isInt(), validateErrors],
  async (req, res, next) => {
    try {
      const [updatedCount] = await Todo.update(
        { isDeleted: true },
        { where: { id: req.params.id } }
      );

      if (updatedCount === 0) {
        return ResponseHelper.notFound(res, 'Todo');
      }

      return ResponseHelper.success(res, null, 'Todo deleted successfully');
    } catch (error) {
      next(error);
    }
  }
);

export default router;
