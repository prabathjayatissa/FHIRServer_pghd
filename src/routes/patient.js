const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// In-memory storage (replace with proper database in production)
const patients = new Map();

// Create Patient
router.post('/', (req, res) => {
  const patient = {
    resourceType: 'Patient',
    id: uuidv4(),
    meta: {
      versionId: '1',
      lastUpdated: new Date().toISOString()
    },
    ...req.body
  };

  patients.set(patient.id, patient);
  res.status(201).json(patient);
});

// Read Patient
router.get('/:id', (req, res) => {
  const patient = patients.get(req.params.id);
  if (!patient) {
    return res.status(404).json({
      resourceType: 'OperationOutcome',
      issue: [{
        severity: 'error',
        code: 'not-found',
        diagnostics: 'Patient not found'
      }]
    });
  }
  res.json(patient);
});

// Search Patients
router.get('/', (req, res) => {
  const searchResults = {
    resourceType: 'Bundle',
    type: 'searchset',
    total: patients.size,
    entry: Array.from(patients.values()).map(patient => ({
      resource: patient
    }))
  };
  res.json(searchResults);
});

module.exports = router;