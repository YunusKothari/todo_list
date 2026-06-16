const Todo = require('../models/todo');

exports.getTodos = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  Todo.findAndCountAll({
    order: [['created_at', 'DESC']],
    limit,
    offset
  })
    .then(({ count, rows }) => {
      const totalPages = Math.ceil(count / limit);
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Todos fetched successfully',
        data: rows,
        pagination: {
          page,
          limit,
          total: count,
          totalPages
        }
      });
    })
    .catch(err => {
      res.status(500).json({
        success: false,
        statusCode: 500,
        message: 'Internal server error',
        errors: [{ msg: err.message }]
      });
      next(err);
    });
};

exports.createTodo = (req, res, next) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: 'Validation failed',
      errors: [{ field: 'title', msg: 'Title is required' }]
    });
  }

  Todo.create({ title })
    .then(newTodo => {
      res.status(201).json({
        success: true,
        statusCode: 201,
        message: 'Todo created successfully',
        data: newTodo
      });
    })
    .catch(err => {
      res.status(500).json({
        success: false,
        statusCode: 500,
        message: 'Internal server error',
        errors: [{ msg: err.message }]
      });
      next(err);
    });
};

exports.updateTodo = (req, res, next) => {
  const { id } = req.params;
  const { title, completed } = req.body;

  if (title === undefined && completed === undefined) {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: 'Validation failed',
      errors: [{ msg: 'Title or completed status must be provided' }]
    });
  }

  Todo.findByPk(id)
    .then(todo => {
      if (!todo) {
        res.status(404).json({
          success: false,
          statusCode: 404,
          message: 'Todo not found',
          errors: []
        });
        return null;
      }

      if (title !== undefined) todo.title = title;
      if (completed !== undefined) todo.completed = completed;
      return todo.save();
    })
    .then(savedTodo => {
      if (savedTodo) {
        res.status(200).json({
          success: true,
          statusCode: 200,
          message: 'Todo updated successfully',
          data: savedTodo
        });
      }
    })
    .catch(err => {
      res.status(500).json({
        success: false,
        statusCode: 500,
        message: 'Internal server error',
        errors: [{ msg: err.message }]
      });
      next(err);
    });
};

exports.deleteTodo = (req, res, next) => {
  const { id } = req.params;

  Todo.destroy({ where: { id } })
    .then(deletedCount => {
      if (deletedCount === 0) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          message: 'Todo not found',
          errors: []
        });
      }
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Todo deleted successfully',
        data: null
      });
    })
    .catch(err => {
      res.status(500).json({
        success: false,
        statusCode: 500,
        message: 'Internal server error',
        errors: [{ msg: err.message }]
      });
      next(err);
    });
};
