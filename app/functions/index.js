const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.onUserCreate = functions.firestore
  .document("users/{userId}")
  .onCreate((snap, context) => {
    const userId = context.params.userId;
    const db = admin.firestore();

    // Define default appliances
    const appliances = {
      appliance_id_1: {
        name: "Light",
        status: "off",
        power_consumption: 0,
        location: "Living Room",
      },
      appliance_id_2: {
        name: "Fan",
        status: "off",
        power_consumption: 0,
        location: "Bedroom",
      },
      // Add more default appliances as needed
    };

    // Add the appliances to the user's subcollection
    const appliancePromises = Object.keys(appliances).map((applianceId) => {
      return db
        .collection("users")
        .doc(userId)
        .collection("appliances")
        .doc(applianceId)
        .set(appliances[applianceId]);
    });

    // Return a promise to ensure the function completes
    return Promise.all(appliancePromises);
  });
