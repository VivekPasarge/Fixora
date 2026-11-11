
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
const DEFAULT_WORKING_RADIUS = 10;

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
// ==========================================================

const getExperienceYears = (experience) => {
  const match = String(experience || "").match(/\d+(\.\d+)?/);

  return match ? Number(match[0]) : 0;
};

// ==========================================================
// SERVICE AND PROFESSION ALIASES
// ==========================================================

const SERVICE_ALIASES = {
  painter: "painting",
  paint: "painting",
  painting: "painting",

  plumber: "plumbing",
  plumbing: "plumbing",

  electrician: "electrical",
  electric: "electrical",
  electrical: "electrical",

  cleaner: "cleaning",
  clean: "cleaning",
  cleaning: "cleaning",

  carpenter: "carpentry",
  carpentry: "carpentry",

  appliance: "appliance",
  "ac repair": "ac repair",
};

// ==========================================================
// EXTRACT SERVICE TYPES FROM TEXT
// ==========================================================

const getServiceTypes = (values) => {
  const result = new Set();

  const allText = values
    .flatMap((value) =>
      Array.isArray(value) ? value : [value]
    )
    .map(normalizeText)
    .filter(Boolean);

  for (const text of allText) {
    const paddedText = ` ${text} `;

    for (const [alias, type] of Object.entries(SERVICE_ALIASES)) {
      if (paddedText.includes(` ${alias} `)) {
        result.add(type);
      }
    }
  }

  return result;
};

// ==========================================================
// CHECK SERVICE EXPERTISE
// ==========================================================

const hasMatchingExpertise = (technician, service) => {
  if (!technician || !service) {
    return false;
  }

  const serviceTypes = getServiceTypes([
    service.name,
    service.category,
    service.description,
    service.includedServices,
  ]);

  const technicianTypes = getServiceTypes([
    technician.profession,
    technician.skills,
  ]);

  if (!serviceTypes.size || !technicianTypes.size) {
    return false;
  }

  return [...serviceTypes].some((type) =>
    technicianTypes.has(type)
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
// VALIDATE CUSTOMER LOCATION
// ==========================================================

const getValidLocation = (location) => {
  if (!location) {
    return null;
  }

  const latitude = Number(location.latitude);
  const longitude = Number(location.longitude);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }

  return { latitude, longitude };
};

// ==========================================================
// BUILD RANKED TECHNICIAN QUEUE
// ==========================================================

const buildTechnicianQueue = async (booking, service) => {
  try {
    console.log("\n========== FIXORA MATCHING STARTED ==========");

    console.log("Booking ID:", booking?._id);
    console.log("Service:", service?.name);
    console.log("Category:", service?.category);

    if (!booking || !service) {
      console.log("Matching stopped: Booking or service missing.");
      return [];
    }

    // Validate customer GPS.
    const customerLocation = getValidLocation(
      booking.customerLocation
    );

    if (!customerLocation) {
      console.log("Matching stopped: Invalid customer GPS.");
      return [];
    }

    const { latitude: customerLatitude, longitude: customerLongitude } =
      customerLocation;

    // Recent GPS cutoff.
    const gpsCutoff = new Date(
      Date.now() - GPS_MAX_AGE_MINUTES * 60 * 1000
    );

    // Find available technicians with recent GPS.
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

    console.log(
      "Available technicians found:",
      technicians.length
    );

    if (!technicians.length) {
      console.log("No available technicians with recent GPS.");
      return [];
    }

    // Get technician ratings.
    const technicianIds = technicians.map(
      (technician) => technician._id
    );

    const ratingMap = await getTechnicianRatings(
      technicianIds
    );

    const rankedTechnicians = [];

    // Check every technician.
    for (const technician of technicians) {
      console.log("\nChecking technician:", technician._id);
      console.log("Profession:", technician.profession);
      console.log("Skills:", technician.skills);

      // Validate technician GPS.
      const technicianLocation = getValidLocation(
        technician.technicianLocation
      );

      if (!technicianLocation) {
        console.log("REJECTED: Invalid technician GPS.");
        continue;
      }

      // Check profession and skills.
      const expertiseMatches = hasMatchingExpertise(
        technician,
        service
      );

      if (!expertiseMatches) {
        console.log("REJECTED: Service expertise mismatch.");
        continue;
      }

      // Calculate distance.
      const distanceKm = calculateDistance(
        customerLatitude,
        customerLongitude,
        technicianLocation.latitude,
        technicianLocation.longitude
      );

      // Validate working radius.
      const configuredRadius = Number(
        technician.workingRadius
      );

      const workingRadius = Number.isFinite(configuredRadius)
        ? configuredRadius
        : DEFAULT_WORKING_RADIUS;

      if (workingRadius <= 0) {
        console.log("REJECTED: Invalid working radius.");
        continue;
      }

      if (distanceKm > workingRadius) {
        console.log(
          `REJECTED: Outside working radius. Distance: ${distanceKm.toFixed(2)} km`
        );
        continue;
      }

      // Distance score.
      const distanceScore =
        Math.max(0, 1 - distanceKm / workingRadius) * 100;

      // Expertise score.
      const expertiseScore = 100;

      // Rating score.
      const averageRating =
        ratingMap.get(technician._id.toString()) || 0;

      const ratingScore = Math.min(
        100,
        Math.max(0, (averageRating / 5) * 100)
      );

      // Experience score.
      const experienceYears = getExperienceYears(
        technician.experience
      );

      const experienceScore = Math.min(
        100,
        (experienceYears / 10) * 100
      );

      // Calculate final score.
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

      console.log("ELIGIBLE TECHNICIAN");
      console.log("Distance:", distanceKm.toFixed(2), "km");
      console.log("Score:", totalScore.toFixed(2));
    }

    // Sort by highest score.
    rankedTechnicians.sort(
      (a, b) => b.score - a.score
    );

    console.log("\n========== MATCHING RESULTS ==========");
    console.log("Eligible technicians:", rankedTechnicians.length);
    console.log("Matching queue:", rankedTechnicians);

    return rankedTechnicians;

  } catch (error) {
    console.error("TECHNICIAN MATCHING ERROR:", error);
    throw error;
  }
};

// ==========================================================
// EXPORTS
// ==========================================================

module.exports = {
  calculateDistance,
  hasMatchingExpertise,
  buildTechnicianQueue,
};
