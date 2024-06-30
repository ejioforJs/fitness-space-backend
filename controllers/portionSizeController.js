const User = require("../models/userModel");

const getPortionSize = (weight, healthIssues, unitOfMeasurement) => {
  try {
    const healthIssuesMap = {
      PCOS: "P1",
      "Insulin Resistance": "P1",
      "High Blood Sugar": "P1",
      "High Blood Pressure": "P1",
      TTC: "P1",
      NAFLD: "P1",
      Endometritis: "P2",
      Diabetes: "P2",
      "Pre-diabetes": "P2",
    };

    let portionSize;

    if (Array.isArray(healthIssues)) {
      portionSize = healthIssues.reduce((size, issue) => {
        return healthIssuesMap[issue] || size;
      }, null);

      if (
        healthIssues.length > 1 &&
        healthIssues.includes("P1") &&
        healthIssues.includes("P2")
      ) {
        portionSize += 0.5;
      }
    }

    if (!portionSize) {
      if (weight >= 90) {
        portionSize = "P1";
      } else if (weight >= 71) {
        portionSize = "P2";
      } else {
        portionSize = "P3";
      }
    }

    const applyMultipliers = (size) => {
      const multipliers = {
        P1: 1,
        P2: 1.5,
        P3: 2,
      };

      const result = {
        cupSize: multipliers[size],
        fistSize: multipliers[size],
        slices: 5,
      };
      const selectedResult = result[unitOfMeasurement]
      return selectedResult;
    };

    const result = applyMultipliers(portionSize);
    return result
  } catch (error) {
    console.error("Error in getPortionSize:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  getPortionSize,
};