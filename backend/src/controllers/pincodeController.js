const { Parser } = require('json2csv');
const Pincode = require('../models/pincode');
const SearchLog = require('../models/SearchLog');
const AlertThreshold = require('../models/AlertThreshold');

const normalizeQueryValue = (value) => {
  if (Array.isArray(value)) {
    value = value[0];
  }
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim();
};

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildRegexFilter = (value) => {
  const normalized = normalizeQueryValue(value);
  if (!normalized) return null;
  return new RegExp(`^${escapeRegExp(normalized)}$`, 'i');
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const toRadians = (degrees) => degrees * (Math.PI / 180);
  const earthRadiusKm = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};

const calculateDeliveryTime = (sourcePin, destPin, distance) => {
  if (!sourcePin || !destPin || isNaN(distance)) {
    return {
      estimatedDays: 0,
      minDays: 0,
      maxDays: 0,
      serviceType: 'Unknown',
      factors: {
        sameState: false,
        sameRegion: false,
        distance: 0
      }
    };
  }

  const sameState = sourcePin.state === destPin.state;
  const sameRegion = sourcePin.regionName === destPin.regionName;
  const sameDistrict = sourcePin.district === destPin.district;

  let estimatedDays, minDays, maxDays, serviceType;

  if (sameDistrict) {
    estimatedDays = 1;
    minDays = 1;
    maxDays = 1;
    serviceType = 'Local Delivery';
  } else if (sameState) {
    estimatedDays = 2;
    minDays = 1;
    maxDays = 3;
    serviceType = 'Regional Delivery';
  } else if (sameRegion) {
    estimatedDays = 3;
    minDays = 2;
    maxDays = 4;
    serviceType = 'Regional Delivery';
  } else {
    estimatedDays = 4;
    minDays = 3;
    maxDays = 7;
    serviceType = 'National Delivery';
  }

  return {
    estimatedDays,
    minDays,
    maxDays,
    serviceType,
    factors: {
      sameState,
      sameRegion,
      distance: Math.round(distance * 100) / 100
    }
  };
};

const getStates = async (req, res) => {
  try {
    const states = await Pincode.distinct('state');
    res.json(states.sort());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDistrictsByState = async (req, res) => {
  try {
    const state = req.params.state;
    const normalizedState = normalizeQueryValue(state);
    const query = {};
    const stateFilter = buildRegexFilter(normalizedState);
    if (stateFilter) query.state = stateFilter;
    const districts = await Pincode.distinct('district', query);
    const filtered = districts.filter(d => d && d.trim() !== '');
    res.json(filtered.sort());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTaluksByDistrict = async (req, res) => {
  try {
    const state = req.params.state;
    const district = req.params.district;
    const normalizedState = normalizeQueryValue(state);
    const normalizedDistrict = normalizeQueryValue(district);
    const query = {};
    const stateFilter = buildRegexFilter(normalizedState);
    const districtFilter = buildRegexFilter(normalizedDistrict);
    if (stateFilter) query.state = stateFilter;
    if (districtFilter) query.district = districtFilter;
    const taluks = await Pincode.distinct('taluk', query);
    const filtered = taluks.filter(t => t && t.trim() !== '');
    res.json(filtered.sort());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPincodes = async (req, res) => {
  try {
    const {
      state,
      district,
      taluk,
      page = 1,
      limit = 20,
      officeType,
      circle,
      region,
      fromDate,
      toDate
    } = req.query;
    const query = {};

    const stateFilter = buildRegexFilter(state);
    const districtFilter = buildRegexFilter(district);
    const talukFilter = buildRegexFilter(taluk);
    const officeTypeFilter = buildRegexFilter(officeType);
    const circleFilter = buildRegexFilter(circle);
    const regionFilter = buildRegexFilter(region);

    if (stateFilter) query.state = stateFilter;
    if (districtFilter) query.district = districtFilter;
    if (talukFilter) query.taluk = talukFilter;
    if (officeTypeFilter) query.officeType = officeTypeFilter;
    if (circleFilter) query.circleName = circleFilter;
    if (regionFilter) query.regionName = regionFilter;
    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = new Date(fromDate);
      if (toDate) query.createdAt.$lte = new Date(toDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [data, total] = await Promise.all([
      Pincode.find(query).skip(skip).limit(parseInt(limit)).sort({ pincode: 1 }),
      Pincode.countDocuments(query)
    ]);

    res.json({
      success: true,
      data,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const searchPincodes = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json([]);
    }

    const regex = new RegExp(q, 'i');
    const results = await Pincode.find({
      $or: [
        { officeName: regex },
        { pincode: regex },
        { taluk: regex },
        { district: regex },
        { state: regex }
      ]
    })
      .limit(15)
      .select('pincode officeName taluk district state officeType deliveryStatus');

    await SearchLog.create({
      searchTerm: q,
      pincode: results.length === 1 ? results[0].pincode : null,
      ip: req.ip,
      userAgent: req.headers['user-agent'] || null
    });

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPincodeDetail = async (req, res) => {
  try {
    const pincodeData = await Pincode.findOne({ pincode: req.params.pincode });
    if (!pincodeData) {
      return res.status(404).json({ message: 'PIN Code not found' });
    }
    res.json(pincodeData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStats = async (req, res) => {
  try {
    const [totalPincodes, states, deliveryOffices, nonDeliveryOffices] = await Promise.all([
      Pincode.countDocuments(),
      Pincode.distinct('state').then(list => list.length),
      Pincode.countDocuments({ deliveryStatus: 'Delivery' }),
      Pincode.countDocuments({ deliveryStatus: 'Non-Delivery' })
    ]);

    res.json({ success: true, totalPincodes, totalStates: states, deliveryOffices, nonDeliveryOffices });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStateDistribution = async (req, res) => {
  try {
    const distribution = await Pincode.aggregate([
      { $group: { _id: '$state', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { state: '$_id', count: 1, _id: 0 } }
    ]);
    res.json(distribution);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDeliveryDistribution = async (req, res) => {
  try {
    const [delivery, nonDelivery, headOffice, subOffice, branchOffice] = await Promise.all([
      Pincode.countDocuments({ deliveryStatus: 'Delivery' }),
      Pincode.countDocuments({ deliveryStatus: 'Non-Delivery' }),
      Pincode.countDocuments({ officeType: 'Head Office' }),
      Pincode.countDocuments({ officeType: 'Sub Office' }),
      Pincode.countDocuments({ officeType: 'Branch Office' })
    ]);
    res.json({ success: true, delivery, nonDelivery, headOffice, subOffice, branchOffice });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSearchAnalytics = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;
    const rangeQuery = {};
    if (fromDate) rangeQuery.$gte = new Date(fromDate);
    if (toDate) rangeQuery.$lte = new Date(toDate);
    const match = {};
    if (Object.keys(rangeQuery).length) match.createdAt = rangeQuery;

    const topTerms = await SearchLog.aggregate([
      { $match: match },
      { $group: { _id: '$searchTerm', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { term: '$_id', count: 1, _id: 0 } }
    ]);

    const topPincodes = await SearchLog.aggregate([
      { $match: { ...match, pincode: { $exists: true, $ne: null } } },
      { $group: { _id: '$pincode', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { pincode: '$_id', count: 1, _id: 0 } }
    ]);

    res.json({ success: true, topTerms, topPincodes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getHeatmapData = async (req, res) => {
  try {
    const distribution = await Pincode.aggregate([
      { $group: { _id: '$state', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { state: '$_id', count: 1, _id: 0 } }
    ]);
    res.json({ success: true, heatmap: distribution });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMonthlyGrowth = async (req, res) => {
  try {
    const { months = 12 } = req.query;
    const pipeline = [
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $project: { year: '$_id.year', month: '$_id.month', count: 1, _id: 0 } }
    ];

    const allMonths = await Pincode.aggregate(pipeline);
    res.json({ success: true, monthlyGrowth: allMonths });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTopDistricts = async (req, res) => {
  try {
    const districts = await Pincode.aggregate([
      { $group: { _id: { state: '$state', district: '$district' }, pincodeCount: { $sum: 1 }, deliveryOffices: { $sum: { $cond: [{ $eq: ['$deliveryStatus', 'Delivery'] }, 1, 0] } } } },
      { $sort: { pincodeCount: -1, deliveryOffices: -1 } },
      { $limit: 20 },
      { $project: { state: '$_id.state', district: '$_id.district', pincodeCount: 1, deliveryOffices: 1, _id: 0 } }
    ]);
    res.json({ success: true, districts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCircleDistribution = async (req, res) => {
  try {
    const distribution = await Pincode.aggregate([
      { $group: { _id: '$circleName', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { circle: '$_id', count: 1, _id: 0 } }
    ]);
    res.json({ success: true, distribution });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRealTimeStats = async (req, res) => {
  try {
    const [stats, latestSearches] = await Promise.all([
      Pincode.countDocuments(),
      SearchLog.find().sort({ createdAt: -1 }).limit(10).select('searchTerm pincode createdAt')
    ]);
    res.json({ success: true, totalPincodes: stats, latestSearches });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOfficeTypeBreakdown = async (req, res) => {
  try {
    const breakdown = await Pincode.aggregate([
      { $group: { _id: '$officeType', count: { $sum: 1 } } },
      { $project: { officeType: '$_id', count: 1, _id: 0 } }
    ]);
    res.json({ success: true, breakdown });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOfficeTypeDistribution = getOfficeTypeBreakdown;

const getDivisionStats = async (req, res) => {
  try {
    const stats = await Pincode.aggregate([
      {
        $group: {
          _id: '$divisionName',
          totalPincodes: { $sum: 1 },
          deliveryOffices: { $sum: { $cond: [{ $eq: ['$deliveryStatus', 'Delivery'] }, 1, 0] } },
          nonDeliveryOffices: { $sum: { $cond: [{ $eq: ['$deliveryStatus', 'Non-Delivery'] }, 1, 0] } },
          states: { $addToSet: '$state' },
          districts: { $addToSet: '$district' }
        }
      },
      {
        $addFields: {
          stateCount: { $size: '$states' },
          districtCount: { $size: '$districts' }
        }
      },
      {
        $sort: { totalPincodes: -1 }
      },
      {
        $project: {
          division: '$_id',
          totalPincodes: 1,
          deliveryOffices: 1,
          nonDeliveryOffices: 1,
          stateCount: 1,
          districtCount: 1,
          _id: 0
        }
      }
    ]);
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRegionCoverage = async (req, res) => {
  try {
    const coverage = await Pincode.aggregate([
      {
        $group: {
          _id: '$regionName',
          totalOffices: { $sum: 1 },
          states: { $addToSet: '$state' },
          districts: { $addToSet: '$district' },
          deliveryOffices: { $sum: { $cond: [{ $eq: ['$deliveryStatus', 'Delivery'] }, 1, 0] } }
        }
      },
      {
        $addFields: {
          stateCount: { $size: '$states' },
          districtCount: { $size: '$districts' },
          deliveryPercentage: {
            $round: [{ $multiply: [{ $divide: ['$deliveryOffices', '$totalOffices'] }, 100] }, 2]
          }
        }
      },
      {
        $sort: { totalOffices: -1 }
      },
      {
        $project: {
          region: '$_id',
          totalOffices: 1,
          deliveryOffices: 1,
          deliveryPercentage: 1,
          stateCount: 1,
          districtCount: 1,
          _id: 0
        }
      }
    ]);
    res.json({ success: true, data: coverage });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getNearbyPincodes = async (req, res) => {
  try {
    const { lat, lng, radius = 10 } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusKm = parseFloat(radius);
    if (isNaN(latitude) || isNaN(longitude) || isNaN(radiusKm)) {
      return res.status(400).json({ message: 'Invalid coordinates or radius' });
    }
    const nearbyPincodes = await Pincode.aggregate([
      { $match: { latitude: { $exists: true, $ne: null }, longitude: { $exists: true, $ne: null } } },
      {
        $addFields: {
          distance: {
            $multiply: [
              6371,
              {
                $acos: {
                  $add: [
                    {
                      $multiply: [
                        { $sin: { $multiply: [{ $divide: [latitude, 180] }, Math.PI] } },
                        { $sin: { $multiply: [{ $divide: ['$latitude', 180] }, Math.PI] } }
                      ]
                    },
                    {
                      $multiply: [
                        { $cos: { $multiply: [{ $divide: [latitude, 180] }, Math.PI] } },
                        { $cos: { $multiply: [{ $divide: ['$latitude', 180] }, Math.PI] } },
                        {
                          $cos: {
                            $multiply: [
                              { $subtract: [{ $divide: [longitude, 180] }, { $divide: ['$longitude', 180] }] },
                              Math.PI
                            ]
                          }
                        }
                      ]
                    }
                  ]
                }
              }
            ]
          }
        }
      },
      { $match: { distance: { $lte: radiusKm } } },
      { $sort: { distance: 1 } },
      { $limit: 50 },
      {
        $project: {
          pincode: 1,
          officeName: 1,
          officeType: 1,
          deliveryStatus: 1,
          taluk: 1,
          district: 1,
          state: 1,
          latitude: 1,
          longitude: 1,
          distance: { $round: ['$distance', 2] }
        }
      }
    ]);
    res.json({ success: true, data: nearbyPincodes, center: { lat: latitude, lng: longitude }, radius: radiusKm, count: nearbyPincodes.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const autocompletePincodes = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    if (!q || q.length < 1) {
      return res.json([]);
    }
    const suggestions = await Pincode.find({ pincode: { $regex: `^${q}`, $options: 'i' } })
      .limit(parseInt(limit))
      .select('pincode officeName district state')
      .sort({ pincode: 1 });
    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const bulkSearchPincodes = async (req, res) => {
  try {
    const { pincodes } = req.body;
    if (!pincodes || !Array.isArray(pincodes) || pincodes.length === 0) {
      return res.status(400).json({ message: 'PIN codes array is required' });
    }
    if (pincodes.length > 50) {
      return res.status(400).json({ message: 'Maximum 50 PIN codes allowed at once' });
    }
    const results = await Pincode.find({ pincode: { $in: pincodes } }).select('pincode officeName officeType deliveryStatus taluk district state divisionName regionName circleName latitude longitude');
    const resultMap = {};
    results.forEach(pin => {
      resultMap[pin.pincode] = pin;
    });
    const orderedResults = pincodes.map(pincode => ({ pincode, found: !!resultMap[pincode], data: resultMap[pincode] || null }));
    res.json({ success: true, totalRequested: pincodes.length, totalFound: results.length, results: orderedResults });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addressAutofill = async (req, res) => {
  try {
    const pincodeData = await Pincode.findOne({ pincode: req.params.pincode }).select('pincode officeName taluk district state divisionName regionName circleName country');
    if (!pincodeData) {
      return res.status(404).json({ message: 'PIN Code not found' });
    }
    res.json({
      success: true,
      address: {
        pincode: pincodeData.pincode,
        postOffice: pincodeData.officeName,
        taluk: pincodeData.taluk,
        district: pincodeData.district,
        state: pincodeData.state,
        division: pincodeData.divisionName,
        region: pincodeData.regionName,
        circle: pincodeData.circleName,
        country: pincodeData.country
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDeliveryEstimate = async (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) {
      return res.status(400).json({ message: 'Both source and destination PIN codes are required' });
    }
    const [sourcePin, destPin] = await Promise.all([
      Pincode.findOne({ pincode: from }).select('latitude longitude state district regionName'),
      Pincode.findOne({ pincode: to }).select('latitude longitude state district regionName')
    ]);
    if (!sourcePin || !destPin) {
      return res.status(404).json({ message: 'One or both PIN codes not found' });
    }
    const distance = calculateDistance(sourcePin.latitude, sourcePin.longitude, destPin.latitude, destPin.longitude);
    const estimate = calculateDeliveryTime(sourcePin, destPin, distance);
    res.json({ success: true, source: { pincode: from, state: sourcePin.state, district: sourcePin.district, region: sourcePin.regionName }, destination: { pincode: to, state: destPin.state, district: destPin.district, region: destPin.regionName }, distance: Math.round(distance * 100) / 100, estimate });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMapData = async (req, res) => {
  try {
    const { state, district, taluk } = req.query;
    const query = {};
    const stateFilter = buildRegexFilter(state);
    const districtFilter = buildRegexFilter(district);
    const talukFilter = buildRegexFilter(taluk);
    if (stateFilter) query.state = stateFilter;
    if (districtFilter) query.district = districtFilter;
    if (talukFilter) query.taluk = talukFilter;
    const pincodes = await Pincode.find(query).select('pincode officeName officeType deliveryStatus taluk district state latitude longitude').sort({ pincode: 1 });
    const mapData = pincodes.map(pin => ({ id: pin._id, pincode: pin.pincode, officeName: pin.officeName, officeType: pin.officeType, deliveryStatus: pin.deliveryStatus, taluk: pin.taluk, district: pin.district, state: pin.state, position: { lat: pin.latitude || 0, lng: pin.longitude || 0 } }));
    res.json({ success: true, count: mapData.length, data: mapData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const comparePincodes = async (req, res) => {
  try {
    const { pincodes } = req.body;
    if (!pincodes || !Array.isArray(pincodes) || pincodes.length < 2 || pincodes.length > 5) {
      return res.status(400).json({ message: 'Please provide 2-5 PIN codes for comparison' });
    }
    const results = await Pincode.find({ pincode: { $in: pincodes } }).select('pincode officeName officeType deliveryStatus taluk district state divisionName regionName circleName latitude longitude');
    const comparison = pincodes.map(pincode => {
      const data = results.find(r => r.pincode === pincode);
      return { pincode, found: !!data, data: data || null };
    });
    res.json({ success: true, totalRequested: pincodes.length, totalFound: results.length, comparison });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const printLabelData = async (req, res) => {
  try {
    const pincodeData = await Pincode.findOne({ pincode: req.params.pincode });
    if (!pincodeData) {
      return res.status(404).json({ message: 'PIN Code not found' });
    }
    const qrData = `PIN:${pincodeData.pincode}|PO:${pincodeData.officeName}|DIST:${pincodeData.district}|STATE:${pincodeData.state}`;
    const labelData = {
      pincode: pincodeData.pincode,
      officeName: pincodeData.officeName,
      officeType: pincodeData.officeType,
      deliveryStatus: pincodeData.deliveryStatus,
      address: {
        taluk: pincodeData.taluk,
        district: pincodeData.district,
        state: pincodeData.state,
        division: pincodeData.divisionName,
        region: pincodeData.regionName,
        circle: pincodeData.circleName,
        country: pincodeData.country
      },
      qrCode: qrData,
      printDate: new Date().toISOString(),
      coordinates: { latitude: pincodeData.latitude, longitude: pincodeData.longitude }
    };
    res.json({ success: true, labelData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const exportCsv = async (req, res) => {
  try {
    const { state, district, taluk } = req.query;
    const query = {};
    const stateFilter = buildRegexFilter(state);
    const districtFilter = buildRegexFilter(district);
    const talukFilter = buildRegexFilter(taluk);
    if (stateFilter) query.state = stateFilter;
    if (districtFilter) query.district = districtFilter;
    if (talukFilter) query.taluk = talukFilter;

    const pincodes = await Pincode.find(query)
      .select('pincode officeName officeType deliveryStatus taluk district state divisionName regionName circleName country latitude longitude')
      .sort({ pincode: 1 })
      .lean();

    const fields = [
      { label: 'PIN Code', value: 'pincode' },
      { label: 'Office Name', value: 'officeName' },
      { label: 'Office Type', value: 'officeType' },
      { label: 'Delivery Status', value: 'deliveryStatus' },
      { label: 'Taluk', value: 'taluk' },
      { label: 'District', value: 'district' },
      { label: 'State', value: 'state' },
      { label: 'Division', value: 'divisionName' },
      { label: 'Region', value: 'regionName' },
      { label: 'Circle', value: 'circleName' },
      { label: 'Country', value: 'country' },
      { label: 'Latitude', value: 'latitude' },
      { label: 'Longitude', value: 'longitude' }
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(pincodes);
    res.header('Content-Type', 'text/csv');
    res.attachment('pincodes_export.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getThresholds = async (req, res) => {
  try {
    const thresholds = await AlertThreshold.find();
    res.json({ success: true, thresholds });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const upsertThreshold = async (req, res) => {
  try {
    const { key, thresholdType, value, active } = req.body;
    const threshold = await AlertThreshold.findOneAndUpdate(
      { key },
      { thresholdType, value, active },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json({ success: true, threshold });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const runAlerts = async () => {
  try {
    const thresholds = await AlertThreshold.find({ active: true });
    const currentCount = await Pincode.countDocuments();
    for (const threshold of thresholds) {
      if (threshold.thresholdType === 'count-drop' && currentCount <= threshold.value) {
        threshold.lastTriggeredAt = new Date();
        await threshold.save();
      }
    }
  } catch (error) {
    console.error('Alert processing error:', error.message);
  }
};

module.exports = {
  getStates,
  getDistrictsByState,
  getTaluksByDistrict,
  getPincodes,
  searchPincodes,
  getPincodeDetail,
  getStats,
  getStateDistribution,
  getDeliveryDistribution,
  getOfficeTypeBreakdown,
  getOfficeTypeDistribution,
  getDivisionStats,
  getRegionCoverage,
  getSearchAnalytics,
  getHeatmapData,
  getMonthlyGrowth,
  getTopDistricts,
  getCircleDistribution,
  getRealTimeStats,
  getNearbyPincodes,
  autocompletePincodes,
  bulkSearchPincodes,
  addressAutofill,
  getDeliveryEstimate,
  getMapData,
  comparePincodes,
  printLabelData,
  exportCsv,
  getThresholds,
  upsertThreshold,
  runAlerts
};
