const { Parser } = require('json2csv');
const Pincode = require('../models/pincode');
const SearchLog = require('../models/SearchLog');
const AlertThreshold = require('../models/AlertThreshold');

const STATE_KEY = "stateName                                       ";
const DISTRICT_KEY = "districtName";
const TALUK_KEY = "taluk";

const normalizeQueryValue = (value) => {
  if (Array.isArray(value)) {
    value = value[0];
  }
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim();
};

const toTitleCase = (str) => {
  if (!str) return '';
  return str.replace(
    /\w\S*/g,
    function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
};

const STATE_NORMALIZATION_MAP = {
  'Andaman & Nicoba': 'Andaman & Nicobar Islands',
  'Andaman & Nicobar Islands': 'Andaman & Nicobar Islands',
  'Andaman And Nicobar Islands': 'Andaman & Nicobar Islands',
  'Andaman & Nicobar': 'Andaman & Nicobar Islands',
  'Andhra Pr': 'Andhra Pradesh',
  'Andhra Pra': 'Andhra Pradesh',
  'Andhra Prade': 'Andhra Pradesh',
  'Andhra Pradesh': 'Andhra Pradesh',
  'Chattisgarh': 'Chhattisgarh',
  'Chhattisgarh': 'Chhattisgarh',
  'Dadra & Nagar Haveli': 'Dadra & Nagar Haveli and Daman & Diu',
  'Daman & Diu': 'Dadra & Nagar Haveli and Daman & Diu',
  'Dadra And Nagar Haveli': 'Dadra & Nagar Haveli and Daman & Diu',
  'Delhi': 'Delhi',
  'New Delhi': 'Delhi',
  'Jammu & Kashmir': 'Jammu & Kashmir',
  'Jammu And Kashmir': 'Jammu & Kashmir',
  'Odisha': 'Odisha',
  'Orissa': 'Odisha',
  'Puducherry': 'Puducherry',
  'Pondicherry': 'Puducherry',
  'Telangana': 'Telangana',
  'Telengana': 'Telangana',
  'Uttarakhand': 'Uttarakhand',
  'Uttaranchal': 'Uttarakhand',
  'West': 'West Bengal',
  'West Bengal': 'West Bengal'
};

const normalizeStateName = (stateName) => {
  if (!stateName) return '';
  const titleCased = toTitleCase(stateName.trim());
  return STATE_NORMALIZATION_MAP[titleCased] || titleCased;
};

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildRegexFilter = (value) => {
  const normalized = normalizeQueryValue(value);
  if (!normalized) return null;
  return new RegExp(`^${escapeRegExp(normalized)}\\s*$`, 'i');
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

  const sourceState = (sourcePin.stateName || sourcePin[STATE_KEY] || '').trim().toLowerCase();
  const destState = (destPin.stateName || destPin[STATE_KEY] || '').trim().toLowerCase();
  const sameState = sourceState === destState;
  
  const sourceDistrict = (sourcePin.districtName || sourcePin[DISTRICT_KEY] || '').trim().toLowerCase();
  const destDistrict = (destPin.districtName || destPin[DISTRICT_KEY] || '').trim().toLowerCase();
  const sameDistrict = sourceDistrict === destDistrict;

  let estimatedDays, minDays, maxDays, serviceType;

  // Modern Logistics Strategy
  if (distance < 50 && sameDistrict) {
    serviceType = 'Hyperlocal Delivery';
    minDays = 1;
    maxDays = 1;
    estimatedDays = 1;
  } else if (distance < 200 && sameState) {
    serviceType = 'Intra-City Delivery';
    minDays = 1;
    maxDays = 2;
    estimatedDays = 1;
  } else if (sameState || distance < 500) {
    serviceType = 'Regional Delivery';
    minDays = 2;
    maxDays = 3;
    estimatedDays = 2;
  } else if (distance < 1500) {
    serviceType = 'Inter-State Delivery';
    minDays = 3;
    maxDays = 5;
    estimatedDays = 4;
  } else {
    serviceType = 'National Long-Haul';
    minDays = 5;
    maxDays = 8;
    estimatedDays = 6;
  }

  return {
    estimatedDays,
    minDays,
    maxDays,
    serviceType,
    factors: {
      sameState,
      distance: Math.round(distance * 100) / 100,
      isLongHaul: distance > 1000
    }
  };
};

const getStates = async (req, res) => {
  try {
    const states = await Pincode.distinct(STATE_KEY);
    const cleanStates = [...new Set(states.filter(Boolean).map(s => normalizeStateName(s)))];
    res.json(cleanStates.sort());
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
    if (stateFilter) query[STATE_KEY] = stateFilter;
    const districts = await Pincode.distinct(DISTRICT_KEY, query);
    const cleanDistricts = [...new Set(districts.filter(Boolean).map(d => toTitleCase(d.trim())))];
    res.json(cleanDistricts.sort());
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
    if (stateFilter) query[STATE_KEY] = stateFilter;
    if (districtFilter) query[DISTRICT_KEY] = districtFilter;
    const taluks = await Pincode.distinct(TALUK_KEY, query);
    const cleanTaluks = [...new Set(taluks.filter(Boolean).map(t => toTitleCase(t.trim())))];
    res.json(cleanTaluks.sort());
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

    if (stateFilter) query[STATE_KEY] = stateFilter;
    if (districtFilter) query[DISTRICT_KEY] = districtFilter;
    if (talukFilter) query[TALUK_KEY] = talukFilter;
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
      Pincode.find(query).skip(skip).limit(parseInt(limit)).sort({ pincode: 1 }).lean(),
      Pincode.countDocuments(query)
    ]);

    const normalizedData = data.map(p => ({
      ...p,
      stateName: p[STATE_KEY] ? p[STATE_KEY].trim() : '',
      districtName: p[DISTRICT_KEY] ? p[DISTRICT_KEY].trim() : '',
      Taluk: p[TALUK_KEY] ? p[TALUK_KEY].trim() : '',
      officeName: p.officeName ? p.officeName.trim() : '',
      state: p[STATE_KEY] ? p[STATE_KEY].trim() : '', 
      district: p[DISTRICT_KEY] ? p[DISTRICT_KEY].trim() : '',
      taluk: p[TALUK_KEY] ? p[TALUK_KEY].trim() : ''
    }));

    res.json({
      success: true,
      data: normalizedData,
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
        { pincode: isNaN(parseInt(q)) ? regex : parseInt(q) },
        { [TALUK_KEY]: regex },
        { [DISTRICT_KEY]: regex },
        { [STATE_KEY]: regex }
      ]
    })
      .limit(15)
      .lean();

    const normalizedResults = results.map(p => ({
      ...p,
      stateName: p[STATE_KEY] ? p[STATE_KEY].trim() : '',
      districtName: p[DISTRICT_KEY] ? p[DISTRICT_KEY].trim() : '',
      Taluk: p[TALUK_KEY] ? p[TALUK_KEY].trim() : '',
      officeName: p.officeName ? p.officeName.trim() : '',
      state: p[STATE_KEY] ? p[STATE_KEY].trim() : '',
      district: p[DISTRICT_KEY] ? p[DISTRICT_KEY].trim() : '',
      taluk: p[TALUK_KEY] ? p[TALUK_KEY].trim() : ''
    }));

    await SearchLog.create({
      searchTerm: q,
      pincode: normalizedResults.length === 1 ? normalizedResults[0].pincode : null,
      ip: req.ip,
      userAgent: req.headers['user-agent'] || null
    });

    res.json(normalizedResults);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPincodeDetail = async (req, res) => {
  try {
    const pincodeData = await Pincode.findOne({ pincode: req.params.pincode }).lean();
    if (!pincodeData) {
      return res.status(404).json({ message: 'PIN Code not found' });
    }
    
    const normalizedData = {
      ...pincodeData,
      stateName: pincodeData[STATE_KEY] ? pincodeData[STATE_KEY].trim() : '',
      districtName: pincodeData[DISTRICT_KEY] ? pincodeData[DISTRICT_KEY].trim() : '',
      Taluk: pincodeData[TALUK_KEY] ? pincodeData[TALUK_KEY].trim() : '',
      officeName: pincodeData.officeName ? pincodeData.officeName.trim() : '',
      state: pincodeData[STATE_KEY] ? pincodeData[STATE_KEY].trim() : '',
      district: pincodeData[DISTRICT_KEY] ? pincodeData[DISTRICT_KEY].trim() : '',
      taluk: pincodeData[TALUK_KEY] ? pincodeData[TALUK_KEY].trim() : ''
    };
    
    res.json(normalizedData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStats = async (req, res) => {
  try {
    const [totalPincodes, statesRaw, deliveryOffices, nonDeliveryOffices] = await Promise.all([
      Pincode.countDocuments(),
      Pincode.distinct(STATE_KEY),
      Pincode.countDocuments({ deliveryStatus: 'Delivery' }),
      Pincode.countDocuments({ deliveryStatus: 'Non-Delivery' })
    ]);

    const cleanStates = new Set(statesRaw.filter(Boolean).map(s => normalizeStateName(s)));

    res.json({ success: true, totalPincodes, totalStates: 36, deliveryOffices, nonDeliveryOffices });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStateDistribution = async (req, res) => {
  try {
    const rawDistribution = await Pincode.aggregate([
      { $group: { _id: `$${STATE_KEY}`, count: { $sum: 1 } } }
    ]);

    const merged = {};
    rawDistribution.forEach(item => {
      if (!item._id) return;
      const stateName = toTitleCase(item._id.trim());
      merged[stateName] = (merged[stateName] || 0) + item.count;
    });

    const distribution = Object.keys(merged).map(state => ({
      state,
      count: merged[state]
    })).sort((a, b) => b.count - a.count);

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
      Pincode.countDocuments({ officeType: { $in: [/^Head Office\s*$/i, 'H.O'] } }),
      Pincode.countDocuments({ officeType: { $in: [/^Sub Office\s*$/i, 'S.O'] } }),
      Pincode.countDocuments({ officeType: { $in: [/^Branch Office\s*$/i, 'B.O'] } })
    ]);
    res.json({ success: true, delivery, nonDelivery, headOffice, subOffice, branchOffice });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOfficeTypeDistribution = async (req, res) => {
  try {
    const [headOffice, subOffice, branchOffice] = await Promise.all([
      Pincode.countDocuments({ officeType: { $in: [/^Head Office\s*$/i, 'H.O'] } }),
      Pincode.countDocuments({ officeType: { $in: [/^Sub Office\s*$/i, 'S.O'] } }),
      Pincode.countDocuments({ officeType: { $in: [/^Branch Office\s*$/i, 'B.O'] } }),
    ]);
    res.json({ success: true, headOffice, subOffice, branchOffice });
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
    const rawDistribution = await Pincode.aggregate([
      { $group: { _id: `$${STATE_KEY}`, count: { $sum: 1 } } }
    ]);

    const merged = {};
    rawDistribution.forEach(item => {
      if (!item._id) return;
      const stateName = toTitleCase(item._id.trim());
      merged[stateName] = (merged[stateName] || 0) + item.count;
    });

    const heatmap = Object.keys(merged).map(state => ({
      state,
      count: merged[state]
    })).sort((a, b) => b.count - a.count);

    res.json({ success: true, heatmap: heatmap });
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
      { $group: { _id: { state: `$${STATE_KEY}`, district: `$${DISTRICT_KEY}` }, pincodeCount: { $sum: 1 }, deliveryOffices: { $sum: { $cond: [{ $eq: ['$deliveryStatus', 'Delivery'] }, 1, 0] } } } },
      { $sort: { pincodeCount: -1, deliveryOffices: -1 } },
      { $limit: 20 },
      { $project: { state: { $trim: { input: '$_id.state' } }, district: { $trim: { input: '$_id.district' } }, pincodeCount: 1, deliveryOffices: 1, _id: 0 } }
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

// const getOfficeTypeDistribution = getOfficeTypeBreakdown;

const getDivisionStats = async (req, res) => {
  try {
    const stats = await Pincode.aggregate([
      {
        $group: {
          _id: '$divisionName',
          totalPincodes: { $sum: 1 },
          deliveryOffices: { $sum: { $cond: [{ $eq: ['$deliveryStatus', 'Delivery'] }, 1, 0] } },
          nonDeliveryOffices: { $sum: { $cond: [{ $eq: ['$deliveryStatus', 'Non-Delivery'] }, 1, 0] } },
          states: { $addToSet: `$${STATE_KEY}` },
          districts: { $addToSet: `$${DISTRICT_KEY}` }
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
          states: { $addToSet: `$${STATE_KEY}` },
          districts: { $addToSet: `$${DISTRICT_KEY}` },
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
          _id: 0,
          pincode: 1,
          officeName: 1,
          officeType: 1,
          deliveryStatus: 1,
          taluk: { $trim: { input: "$taluk" } },
          district: { $trim: { input: `$${DISTRICT_KEY}` } },
          state: { $trim: { input: `$${STATE_KEY}` } },
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

    // Prefix search on numeric pincode using aggregate and $toString
    const suggestions = await Pincode.aggregate([
      { 
        $match: { 
          $expr: { 
            $regexMatch: { 
              input: { $toString: "$pincode" }, 
              regex: `^${q}` 
            } 
          } 
        } 
      },
      { $limit: parseInt(limit) },
      {
        $project: {
          _id: 0,
          pincode: 1,
          officeName: 1,
          district: { $trim: { input: `$${DISTRICT_KEY}` } },
          state: { $trim: { input: `$${STATE_KEY}` } },
          latitude: 1,
          longitude: 1
        }
      },
      { $sort: { pincode: 1 } }
    ]);

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
    const results = await Pincode.find({ pincode: { $in: pincodes } }).lean();
    const resultMap = {};
    results.forEach(pin => {
      const normalized = {
        ...pin,
        officeName: (pin.officeName || '').trim(),
        state: (pin[STATE_KEY] || pin.stateName || '').trim(),
        district: (pin[DISTRICT_KEY] || pin.districtName || '').trim(),
        taluk: (pin[TALUK_KEY] || pin.Taluk || '').trim(),
        divisionName: (pin.divisionName || '').trim(),
        regionName: (pin.regionName || '').trim(),
        circleName: (pin.circleName || '').trim(),
      };
      resultMap[pin.pincode] = normalized;
    });
    const orderedResults = pincodes.map(pincode => ({ pincode, found: !!resultMap[pincode], data: resultMap[pincode] || null }));
    res.json({ success: true, totalRequested: pincodes.length, totalFound: results.length, results: orderedResults });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addressAutofill = async (req, res) => {
  try {
    const pincodeData = await Pincode.findOne({ pincode: req.params.pincode }).lean();
    if (!pincodeData) {
      return res.status(404).json({ message: 'PIN Code not found' });
    }
    res.json({
      success: true,
      address: {
        pincode: pincodeData.pincode,
        postOffice: (pincodeData.officeName || '').trim(),
        taluk: (pincodeData[TALUK_KEY] || pincodeData.Taluk || '').trim(),
        district: (pincodeData[DISTRICT_KEY] || pincodeData.districtName || '').trim(),
        state: (pincodeData[STATE_KEY] || pincodeData.stateName || '').trim(),
        division: (pincodeData.divisionName || '').trim(),
        region: (pincodeData.regionName || '').trim(),
        circle: (pincodeData.circleName || '').trim(),
        country: (pincodeData.country || 'India').trim()
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDeliveryEstimate = async (req, res) => {
  try {
    const { from, to, source, destination } = req.query;
    const fromPin = source || from;
    const toPin = destination || to;

    if (!fromPin || !toPin) {
      return res.status(400).json({ message: 'Both source and destination PIN codes are required' });
    }

    // Input might be string from query, convert to Number to match schema
    const sourceNum = parseInt(fromPin);
    const destNum = parseInt(toPin);

    const [sourcePin, destPin] = await Promise.all([
      Pincode.findOne({ pincode: sourceNum }).select('latitude longitude stateName districtName regionName ' + STATE_KEY + ' ' + DISTRICT_KEY).lean(),
      Pincode.findOne({ pincode: destNum }).select('latitude longitude stateName districtName regionName ' + STATE_KEY + ' ' + DISTRICT_KEY).lean()
    ]);

    if (!sourcePin || !destPin) {
      return res.status(404).json({ message: 'One or both PIN codes not found / Invalid coordinates' });
    }

    if (sourcePin.latitude === null || destPin.latitude === null) {
        return res.status(400).json({ message: 'Precision coordinate data not yet seeded for these nodes. Please try 110001 or 400001.' });
    }

    sourcePin.stateName = (sourcePin[STATE_KEY] || sourcePin.stateName || '').trim();
    sourcePin.districtName = (sourcePin[DISTRICT_KEY] || sourcePin.districtName || '').trim();
    destPin.stateName = (destPin[STATE_KEY] || destPin.stateName || '').trim();
    destPin.districtName = (destPin[DISTRICT_KEY] || destPin.districtName || '').trim();
    
    const distance = calculateDistance(sourcePin.latitude, sourcePin.longitude, destPin.latitude, destPin.longitude);
    const estimate = calculateDeliveryTime(sourcePin, destPin, distance);
    res.json({ 
      success: true, 
      source: { pincode: fromPin, state: sourcePin.stateName, district: sourcePin.districtName, region: sourcePin.regionName }, 
      destination: { pincode: toPin, state: destPin.stateName, district: destPin.districtName, region: destPin.regionName }, 
      distance: Math.round(distance * 100) / 100, 
      estimate,
      deliveryEstimate: estimate // Include both for frontend compatibility
    });
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
    if (stateFilter) query[STATE_KEY] = stateFilter;
    if (districtFilter) query[DISTRICT_KEY] = districtFilter;
    if (talukFilter) query[TALUK_KEY] = talukFilter;
    const pincodes = await Pincode.find(query).sort({ pincode: 1 }).lean();
    const mapData = pincodes.map(pin => ({ 
      id: pin._id, 
      pincode: pin.pincode, 
      officeName: pin.officeName ? pin.officeName.trim() : '', 
      officeType: pin.officeType, 
      deliveryStatus: pin.deliveryStatus, 
      taluk: pin[TALUK_KEY] ? pin[TALUK_KEY].trim() : '', 
      district: pin[DISTRICT_KEY] ? pin[DISTRICT_KEY].trim() : '', 
      state: pin[STATE_KEY] ? pin[STATE_KEY].trim() : '', 
      position: { lat: pin.latitude || 0, lng: pin.longitude || 0 } 
    }));
    res.json({ success: true, count: mapData.length, data: mapData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const comparePincodes = async (req, res) => {
  try {
    const { pincodes: pcQuery } = req.query;
    const { pincodes: pcBody } = req.body;
    let pincodes = pcBody || (pcQuery ? pcQuery.split(',') : []);

    if (!Array.isArray(pincodes) || pincodes.length < 2) {
      return res.status(400).json({ success: false, message: 'Provide at least 2 PIN codes' });
    }

    const results = await Pincode.find({ pincode: { $in: pincodes } }).lean();
    const normalizedResults = results.map(r => ({
      ...r,
      stateName: (r[STATE_KEY] || r.stateName || '').trim(),
      districtName: (r[DISTRICT_KEY] || r.districtName || '').trim(),
      Taluk: (r[TALUK_KEY] || r.Taluk || '').trim(),
      officeName: (r.officeName || '').trim(),
      state: (r[STATE_KEY] || r.stateName || '').trim(),
      district: (r[DISTRICT_KEY] || r.districtName || '').trim(),
      taluk: (r[TALUK_KEY] || r.Taluk || '').trim(),
    }));

    // Calculate pairwise distances
    const distances = {};
    let minDistance = Infinity;
    let maxDistance = 0;
    let totalDist = 0;
    let pairs = 0;

    for (let i = 0; i < normalizedResults.length; i++) {
      for (let j = i + 1; j < normalizedResults.length; j++) {
        const p1 = normalizedResults[i];
        const p2 = normalizedResults[j];
        if (p1.latitude && p1.longitude && p2.latitude && p2.longitude) {
          const d = calculateDistance(p1.latitude, p1.longitude, p2.latitude, p2.longitude);
          const key = [p1.pincode, p2.pincode].sort().join('-');
          distances[key] = d;
          
          if (d < minDistance) minDistance = d;
          if (d > maxDistance) maxDistance = d;
          totalDist += d;
          pairs++;
        }
      }
    }

    res.json({
      success: true,
      data: normalizedResults,
      distances,
      averageDistance: pairs > 0 ? totalDist / pairs : 0,
      closestPair: minDistance !== Infinity ? { distance: minDistance } : null,
      furthestPair: maxDistance > 0 ? { distance: maxDistance } : null,
      coverage: pairs > 0 ? (maxDistance > 500 ? 'National' : maxDistance > 100 ? 'Regional' : 'Local') : 'N/A'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const printLabelData = async (req, res) => {
  try {
    const pincodeData = await Pincode.findOne({ pincode: isNaN(parseInt(req.params.pincode)) ? req.params.pincode : parseInt(req.params.pincode) }).lean();
    if (!pincodeData) {
      return res.status(404).json({ message: 'PIN Code not found' });
    }
    
    const stateNameStr = pincodeData[STATE_KEY] ? pincodeData[STATE_KEY].trim() : '';
    const districtNameStr = pincodeData[DISTRICT_KEY] ? pincodeData[DISTRICT_KEY].trim() : '';
    const talukStr = pincodeData[TALUK_KEY] ? pincodeData[TALUK_KEY].trim() : '';
    const officeNameStr = pincodeData.officeName ? pincodeData.officeName.trim() : '';
    
    const qrData = `PIN:${pincodeData.pincode}|PO:${officeNameStr}|DIST:${districtNameStr}|STATE:${stateNameStr}`;
    const labelData = {
      pincode: pincodeData.pincode,
      officeName: officeNameStr,
      officeType: pincodeData.officeType,
      deliveryStatus: pincodeData.deliveryStatus,
      address: {
        taluk: talukStr,
        district: districtNameStr,
        state: stateNameStr,
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
    if (stateFilter) query[STATE_KEY] = stateFilter;
    if (districtFilter) query[DISTRICT_KEY] = districtFilter;
    if (talukFilter) query[TALUK_KEY] = talukFilter;

    const pincodes = await Pincode.find(query)
      .sort({ pincode: 1 })
      .lean();
      
    const normalizedPincodes = pincodes.map(p => ({
      ...p,
      stateName: p[STATE_KEY] ? p[STATE_KEY].trim().toUpperCase() : '',
      districtName: p[DISTRICT_KEY] ? toTitleCase(p[DISTRICT_KEY].trim()) : '',
      Taluk: p[TALUK_KEY] ? toTitleCase(p[TALUK_KEY].trim()) : '',
      officeName: p.officeName ? toTitleCase(p.officeName.trim()) : '',
      pincode: p.pincode,
      officeType: p.officeType || '',
      deliveryStatus: p.deliveryStatus || '',
      divisionName: p.divisionName || '',
      regionName: p.regionName || '',
      circleName: p.circleName || ''
    }));

    const fields = [
      { label: 'Office Name', value: 'officeName' },
      { label: 'Pincode', value: 'pincode' },
      { label: 'Office Type', value: 'officeType' },
      { label: 'Delivery Status', value: 'deliveryStatus' },
      { label: 'Division', value: 'divisionName' },
      { label: 'Region', value: 'regionName' },
      { label: 'Circle', value: 'circleName' },
      { label: 'Taluk', value: 'Taluk' },
      { label: 'District', value: 'districtName' },
      { label: 'State', value: 'stateName' }
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(normalizedPincodes);
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
