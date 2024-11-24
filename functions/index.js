/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { google } = require("googleapis");

admin.initializeApp();
const db = admin.firestore();
// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
exports.archiveRecords = functions.https.onCall(async (data, context) => {
  try {
    const { year } = data;
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    // Query records for the specified year
    const snapshot = await db.collection("attendance")
      .where("timestamp", ">=", startDate)
      .where("timestamp", "<=", endDate)
      .get();

    // Rest of archive code...
  } catch (error) {
    console.error("Archive operation failed:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});