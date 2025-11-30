const express = require('express');
const router = express.Router();
const assetController = require('../controllers/asset.controller');
const { assetValidation, commonValidation } = require('../validators');
const { handleValidationErrors } = require('../middleware/validator.middleware');

router.get('/', 
  commonValidation.pagination, 
  handleValidationErrors, 
  assetController.getAllAssets
);

router.get('/:id', 
  commonValidation.id, 
  handleValidationErrors, 
  assetController.getAssetById
);

router.post('/', 
  assetValidation.create, 
  handleValidationErrors, 
  assetController.createAsset
);

router.put('/:id', 
  assetValidation.update, 
  handleValidationErrors, 
  assetController.updateAsset
);

router.delete('/:id', 
  commonValidation.id, 
  handleValidationErrors, 
  assetController.deleteAsset
);

module.exports = router;
