
const User = require("../models/User");
const Review = require("../models/reviewModel");

// ==========================================================
// MATCHING CONFIGURATION
// ==========================================================

const MATCHING_WEIGHTS = {
  distance: 40,
  expertise: 30,
  rating: 20,
  experience: 10,
};

const GPS_MAX_AGE_MINUTES = 5;

// ==========================================================
// DISTANCE CALCULATION: HAVERSINE FORMULA
// ==========================================================

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const toRadians = (degrees) => (degrees * Math.PI) / 180;

  const earthRadiusKm = 6371;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
};

// ==========================================================
// NORMALIZE TEXT
// ==========================================================

const normalizeText = (value) => {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
};

// ==========================================================
// EXPERIENCE CONVERSION
// Examples: "5 Years", "2+ Years", "Fresher"
// ==========================================================

const getExperienceYears = (experience) => {
  const match = String(experience || "").match(/\d+(\.\d+)?/);

  return match ? Number(match[0]) : 0;
};

// ==========================================================
// CHECK SERVICE EXPERTISE
// ==========================================================

const hasMatchingExpertise = (technician, service) => {
  const serviceTerms = [
    service?.name,
    service?.category,
  ]
    .map(normalizeText)
    .filter(Boolean);

  const technicianTerms = [
    technician?.profession,
    technician?.skills,
  ]
    .map(normalizeText)
    .filter(Boolean);

  if (!serviceTerms.length || !technicianTerms.length) {
    return false;
  }

  return serviceTerms.some((serviceTerm) =>
    technicianTerms.some(
      (technicianTerm) =>
        technicianTerm.includes(serviceTerm) ||
        serviceTerm.includes(technicianTerm)
    )
  );
};

// ==========================================================
// CALCULATE AVERAGE TECHNICIAN RATINGS
// ==========================================================

const getTechnicianRatings = async (technicianIds) => {
  const ratings = await Review.aggregate([
    {
      $match: {
        technician: { $in: technicianIds },
      },
    },
    {
      $group: {
        _id: "$technician",
        averageRating: { $avg: "$rating" },
      },
    },
  ]);

  const ratingMap = new Map();

  ratings.forEach((item) => {
    ratingMap.set(
      item._id.toString(),
      Number(item.averageRating || 0)
    );
  });

  return ratingMap;
};

// ==========================================================
// BUILD RANKED TECHNICIAN QUEUE
// ==========================================================

const buildTechnicianQueue = async (booking, service) => {
  if (
    !booking?.customerLocation?.latitude &&
    booking?.customerLocation?.latitude !== 0
  ) {
    return [];
  }

  if (
    booking?.customerLocation?.longitude == null
  ) {
    return [];
  }

  const customerLatitude = Number(
    booking.customerLocation.latitude
  );

  const customerLongitude = Number(
    booking.customerLocation.longitude
  );

  if (
    !Number.isFinite(customerLatitude) ||
    !Number.isFinite(customerLongitude) ||
    customerLatitude < -90 ||
    customerLatitude > 90 ||
    customerLongitude < -180 ||
    customerLongitude > 180
  ) {
    return [];
  }

  const gpsCutoff = new Date(
    Date.now() - GPS_MAX_AGE_MINUTES * 60 * 1000
  );

  // Find online technicians with recent GPS locations.
  const technicians = await User.find({
    role: "technician",

    $or: [
      { isAvailable: true },
      { availability: "Available" },
    ],

    "technicianLocation.latitude": {
      $exists: true,
      $ne: null,
    },

    "technicianLocation.longitude": {
      $exists: true,
      $ne: null,
    },

    "technicianLocation.updatedAt": {
      $gte: gpsCutoff,
    },
  }).select(
    "_id profession skills experience workingRadius isAvailable availability technicianLocation"
  );

  if (!technicians.length) {
    return [];
  }

  // Get ratings for all matching technicians in one query.
  const technicianIds = technicians.map(
    (technician) => technician._id
  );

  const ratingMap = await getTechnicianRatings(
    technicianIds
  );

  const rankedTechnicians = [];

  for (const technician of technicians) {
    const latitude = Number(
      technician.technicianLocation?.latitude
    );

    const longitude = Number(
      technician.technicianLocation?.longitude
    );

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      continue;
    }

    // Exclude technicians without matching expertise.
    if (!hasMatchingExpertise(technician, service)) {
      continue;
    }

    const distanceKm = calculateDistance(
      customerLatitude,
      customerLongitude,
      latitude,
      longitude
    );

    const workingRadius = Math.max(
      0,
      Number(technician.workingRadius || 10)
    );

    // Exclude technicians outside their working radius.
    if (
      workingRadius <= 0 ||
      distanceKm > workingRadius
    ) {
      continue;
    }

    // Distance score: closer technicians receive higher scores.
    const distanceScore =
      Math.max(
        0,
        1 - distanceKm / workingRadius
      ) * 100;

    // Expertise score: eligible matching technicians receive 100.
    const expertiseScore = 100;

    // Rating score: normalize rating to a percentage.
    const averageRating =
      ratingMap.get(technician._id.toString()) || 0;

    const ratingScore = Math.min(
      100,
      Math.max(0, (averageRating / 5) * 100)
    );

    // Experience score: 10 years or more receives 100.
    const experienceYears = getExperienceYears(
      technician.experience
    );

    const experienceScore = Math.min(
      100,
      (experienceYears / 10) * 100
    );

    // Final weighted score.
    const totalScore =
      (distanceScore * MATCHING_WEIGHTS.distance) / 100 +
      (expertiseScore * MATCHING_WEIGHTS.expertise) / 100 +
      (ratingScore * MATCHING_WEIGHTS.rating) / 100 +
      (experienceScore * MATCHING_WEIGHTS.experience) / 100;

    rankedTechnicians.push({
      technician: technician._id,
      score: Number(totalScore.toFixed(2)),
      distanceKm: Number(distanceKm.toFixed(2)),
    });
  }

  // Highest matching score receives the first offer.
  rankedTechnicians.sort(
    (a, b) => b.score - a.score
  );

  return rankedTechnicians;
};

// ==========================================================
// EXPORTS
// ==========================================================

module.exports = {
  calculateDistance,
  buildTechnicianQueue,
};
