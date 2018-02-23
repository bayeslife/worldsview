/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var Decision = require('../api/decision/decision.model');
var Thing = require('../api/thing/thing.model');
var User = require('../api/user/user.model');

Thing.find({}).remove(function() {
  Thing.create();
});

 Decision.find({}).remove(function() {
   Decision.create({
     name : 'When to exercise warrants',
     info : 'If you have been issued warrants you will want to choose when to exercise them.' ,
     modelDescription: 
     'Warrant must be exercised by a date (outflow), \nDividends are paid over time (inflow), \nWarrant price changes as dividends are paid (outflow reduces),\nDividends paid changes over time (inflow),\nStock price changes over time.(inflow if sold)'
   }, {
     name : 'When to allow access',
     info : ''
   });
 });

User.find({}).remove(function() {
  User.create({
    provider: 'local',
    name: 'Test User',
    email: 'test@test.com',
    password: 'test'
  }, {
    provider: 'local',
    role: 'admin',
    name: 'Admin',
    email: 'admin@admin.com',
    password: 'admin'
  }, function() {
      console.log('finished populating users');
    }
  );
});
