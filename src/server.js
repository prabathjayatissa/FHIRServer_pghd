const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const patientRoutes = require('./routes/patient');
const observationRoutes = require('./routes/observation');
const deviceRoutes = require('./routes/device');
const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(bodyParser.json());

// UI Routes
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/ui/patients', async (req, res) => {
  const patients = Array.from(global.patients?.values() || []);
  res.render('patients', { patients });
});

app.get('/ui/observations', async (req, res) => {
  const observations = Array.from(global.observations?.values() || []);
  res.render('observations', { observations });
});

app.get('/ui/devices', async (req, res) => {
  const devices = Array.from(global.devices?.values() || []);
  res.render('devices', { devices });
});

// FHIR API Routes
app.get('/metadata', (req, res) => {
  res.json({
    resourceType: 'CapabilityStatement',
    status: 'active',
    date: new Date().toISOString(),
    kind: 'instance',
    fhirVersion: '4.0.1',
    format: ['json'],
    rest: [{
      mode: 'server',
      resource: [
        {
          type: 'Patient',
          interaction: [
            { code: 'read' },
            { code: 'create' },
            { code: 'search-type' }
          ]
        },
        {
          type: 'Observation',
          interaction: [
            { code: 'read' },
            { code: 'create' },
            { code: 'search-type' }
          ]
        },
        {
          type: 'Device',
          interaction: [
            { code: 'read' },
            { code: 'create' },
            { code: 'search-type' }
          ]
        }
      ]
    }]
  });
});

app.use('/Patient', patientRoutes);
app.use('/Observation', observationRoutes);
app.use('/Device', deviceRoutes);

app.listen(port, () => {
  console.log(`FHIR Server running on port ${port}`);
});
