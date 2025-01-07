const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// In-memory storage (replace with proper database in production)
const devices = new Map();

// Create Device
router.post('/', (req, res) => {
  const device = {
    resourceType: 'Device',
    id: uuidv4(),
    meta: {
      versionId: '1',
      lastUpdated: new Date().toISOString()
    },
    status: 'active',
    ...req.body
  };

  devices.set(device.id, device);
  res.status(201).json(device);
});

// Read Device
router.get('/:id', (req, res) => {
  const device = devices.get(req.params.id);
  if (!device) {
    return res.status(404).json({
      resourceType: 'OperationOutcome',
      issue: [{
        severity: 'error',
        code: 'not-found',
        diagnostics: 'Device not found'
      }]
    });
  }
  res.json(device);
});

// Search Devices
router.get('/', (req, res) => {
  const patientId = req.query.patient;
  let results = Array.from(devices.values());
  
  if (patientId) {
    results = results.filter(device => 
      device.patient && device.patient.reference === `Patient/${patientId}`
    );
  }

  const searchResults = {
    resourceType: 'Bundle',
    type: 'searchset',
    total: results.length,
    entry: results.map(device => ({
      resource: device
    }))
  };
  res.json(searchResults);
});

module.exports = router;