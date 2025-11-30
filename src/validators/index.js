const { body, param, query } = require('express-validator');

/**
 * Validation rules for Assets
 */
const assetValidation = {
  create: [
    body('category_id').isInt({ min: 1 }).withMessage('Valid category_id is required'),
    body('location_id').isInt({ min: 1 }).withMessage('Valid location_id is required'),
    body('supplier_id').optional().isInt({ min: 1 }).withMessage('Invalid supplier_id'),
    body('asset_tag').trim().notEmpty().withMessage('Asset tag is required')
      .isLength({ max: 50 }).withMessage('Asset tag must be 50 characters or less'),
    body('serial_number').optional().trim().isLength({ max: 100 }),
    body('name').trim().notEmpty().withMessage('Name is required')
      .isLength({ max: 200 }).withMessage('Name must be 200 characters or less'),
    body('brand').optional().trim().isLength({ max: 100 }),
    body('model').optional().trim().isLength({ max: 100 }),
    body('acquisition_date').isISO8601().withMessage('Valid acquisition date is required'),
    body('acquisition_value').isFloat({ min: 0 }).withMessage('Acquisition value must be positive'),
    body('useful_life_months').optional().isInt({ min: 1 }).withMessage('Useful life must be positive'),
    body('residual_value').optional().isFloat({ min: 0 }).withMessage('Residual value must be positive'),
    body('status').isIn(['active', 'stored', 'disposed', 'stolen', 'under_repair'])
      .withMessage('Invalid status'),
    body('condition').isIn(['new', 'good', 'fair', 'poor', 'broken'])
      .withMessage('Invalid condition'),
    body('specs').optional().isObject().withMessage('Specs must be a valid JSON object'),
    body('notes').optional().trim(),
    body('created_by').isInt({ min: 1 }).withMessage('Valid created_by user is required')
  ],
  
  update: [
    param('id').isInt({ min: 1 }).withMessage('Valid asset ID is required'),
    body('category_id').optional().isInt({ min: 1 }),
    body('location_id').optional().isInt({ min: 1 }),
    body('supplier_id').optional().isInt({ min: 1 }),
    body('asset_tag').optional().trim().isLength({ max: 50 }),
    body('serial_number').optional().trim().isLength({ max: 100 }),
    body('name').optional().trim().isLength({ max: 200 }),
    body('brand').optional().trim().isLength({ max: 100 }),
    body('model').optional().trim().isLength({ max: 100 }),
    body('acquisition_date').optional().isISO8601(),
    body('acquisition_value').optional().isFloat({ min: 0 }),
    body('useful_life_months').optional().isInt({ min: 1 }),
    body('residual_value').optional().isFloat({ min: 0 }),
    body('status').optional().isIn(['active', 'stored', 'disposed', 'stolen', 'under_repair']),
    body('condition').optional().isIn(['new', 'good', 'fair', 'poor', 'broken']),
    body('specs').optional().isObject(),
    body('notes').optional().trim(),
    body('updated_by').isInt({ min: 1 }).withMessage('Valid updated_by user is required')
  ]
};

/**
 * Validation rules for Users
 */
const userValidation = {
  create: [
    body('full_name').trim().notEmpty().withMessage('Full name is required')
      .isLength({ max: 150 }).withMessage('Full name must be 150 characters or less'),
    body('email').trim().isEmail().withMessage('Valid email is required')
      .normalizeEmail(),
    body('employee_id').optional().trim().isLength({ max: 50 }),
    body('department').trim().notEmpty().withMessage('Department is required')
      .isLength({ max: 100 }),
    body('job_title').trim().notEmpty().withMessage('Job title is required')
      .isLength({ max: 100 }),
    body('created_by').optional().isInt({ min: 1 })
  ],
  
  update: [
    param('id').isInt({ min: 1 }).withMessage('Valid user ID is required'),
    body('full_name').optional().trim().isLength({ max: 150 }),
    body('email').optional().trim().isEmail().normalizeEmail(),
    body('employee_id').optional().trim().isLength({ max: 50 }),
    body('department').optional().trim().isLength({ max: 100 }),
    body('job_title').optional().trim().isLength({ max: 100 }),
    body('active').optional().isBoolean(),
    body('updated_by').optional().isInt({ min: 1 })
  ]
};

/**
 * Validation rules for Assignments
 */
const assignmentValidation = {
  create: [
    body('asset_id').isInt({ min: 1 }).withMessage('Valid asset_id is required'),
    body('user_id').isInt({ min: 1 }).withMessage('Valid user_id is required'),
    body('assigned_date').isISO8601().withMessage('Valid assigned date is required'),
    body('expected_return_date').optional().isISO8601().withMessage('Invalid expected return date'),
    body('notes').optional().trim(),
    body('created_by').isInt({ min: 1 }).withMessage('Valid created_by user is required')
  ],
  
  update: [
    param('id').isInt({ min: 1 }).withMessage('Valid assignment ID is required'),
    body('asset_id').optional().isInt({ min: 1 }),
    body('user_id').optional().isInt({ min: 1 }),
    body('assigned_date').optional().isISO8601(),
    body('expected_return_date').optional().isISO8601(),
    body('return_date').optional().isISO8601(),
    body('status').optional().isIn(['active', 'returned']),
    body('notes').optional().trim(),
    body('updated_by').isInt({ min: 1 }).withMessage('Valid updated_by user is required')
  ]
};

/**
 * Validation rules for Maintenance Orders
 */
const maintenanceValidation = {
  create: [
    body('asset_id').isInt({ min: 1 }).withMessage('Valid asset_id is required'),
    body('type').isIn(['preventive', 'corrective', 'upgrade']).withMessage('Invalid type'),
    body('status').optional().isIn(['scheduled', 'in_progress', 'completed', 'cancelled']),
    body('planned_date').isISO8601().withMessage('Valid planned date is required'),
    body('start_date').optional().isISO8601(),
    body('end_date').optional().isISO8601(),
    body('cost_parts').optional().isFloat({ min: 0 }),
    body('cost_labor').optional().isFloat({ min: 0 }),
    body('technician_id').optional().isInt({ min: 1 }),
    body('notes').optional().trim(),
    body('created_by').isInt({ min: 1 }).withMessage('Valid created_by user is required')
  ],
  
  update: [
    param('id').isInt({ min: 1 }).withMessage('Valid maintenance order ID is required'),
    body('asset_id').optional().isInt({ min: 1 }),
    body('type').optional().isIn(['preventive', 'corrective', 'upgrade']),
    body('status').optional().isIn(['scheduled', 'in_progress', 'completed', 'cancelled']),
    body('planned_date').optional().isISO8601(),
    body('start_date').optional().isISO8601(),
    body('end_date').optional().isISO8601(),
    body('cost_parts').optional().isFloat({ min: 0 }),
    body('cost_labor').optional().isFloat({ min: 0 }),
    body('technician_id').optional().isInt({ min: 1 }),
    body('notes').optional().trim(),
    body('updated_by').isInt({ min: 1 }).withMessage('Valid updated_by user is required')
  ]
};

/**
 * Common validation rules
 */
const commonValidation = {
  id: [
    param('id').isInt({ min: 1 }).withMessage('Valid ID is required')
  ],
  
  pagination: [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ]
};

module.exports = {
  assetValidation,
  userValidation,
  assignmentValidation,
  maintenanceValidation,
  commonValidation
};
