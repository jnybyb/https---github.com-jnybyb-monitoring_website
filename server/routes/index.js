const express = require('express');

const beneficiariesRouter = require('./beneficiaries');
const seedlingsRouter = require('./seedlings');
const cropStatusRouter = require('./cropStatus');
const farmPlotsRouter = require('./farmPlots');
const addressesRouter = require('./addresses');
const statisticsRouter = require('./statistics');

const router = express.Router();

// API base
router.use('/beneficiaries', beneficiariesRouter);
router.use('/seedlings', seedlingsRouter);
router.use('/crop-status', cropStatusRouter);
router.use('/farm-plots', farmPlotsRouter);
router.use('/addresses', addressesRouter);
router.use('/statistics', statisticsRouter);

module.exports = router;


