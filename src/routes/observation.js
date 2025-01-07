const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// In-memory storage (replace with proper database in production)
const observations = new Map();

// Create Observation
router.post('/', (req, res) => {
  const observation = {
    resourceType: 'Observation',
    id: uuidv4(),
    meta: {
      versionId: '1',
      lastUpdated: new Date().toISOString()
    },
    status: 'final',
    category: [{
      coding: [{
        system: 'http://terminology.hl7.org/CodeSystem/observation-category',
        code: 'vital-signs',
        display: 'Vital Signs'
      }]
    }],
    ...req.body
  };

  observations.set(observation.id, observation);
  res.status(201).json(observation);
});

// Read Observation
router.get('/:id', (req, res) => {
  const observation = observations.get(req.params.id);
  if (!observation) {
    return res.status(404).json({
      resourceType: 'OperationOutcome',
      issue: [{
        severity: 'error',
        code: 'not-found',
        diagnostics: 'Observation not found'
      }]
    });
  }
  res.json(observation);
});

// Search Observations
router.get('/', (req, res) => {
  const patientId = req.query.patient;
  let results = Array.from(observations.values());
  
  if (patientId) {
    results = results.filter(obs => 
      obs.subject && obs.subject.reference === `Patient/${patientId}`
    );
  }

  const searchResults = {
    resourceType: 'Bundle',
    type: 'searchset',
    total: results.length,
    entry: results.map(obs => ({
      resource: obs
    }))
  };
  res.json(searchResults);
});

module.exports = router;