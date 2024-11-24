const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { google } = require("googleapis");

admin.initializeApp();
const db = admin.firestore();

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

    if (snapshot.empty) {
      return { status: "success", message: "No records to archive", count: 0 };
    }

    // Process in batches
    const batchSize = 500;
    const batches = [];
    let batch = db.batch();
    let operationCount = 0;
    let totalRecords = 0;

    // Create archive records and delete originals
    for (const doc of snapshot.docs) {
      const archiveRef = db.collection("attendance_archive").doc(doc.id);
      batch.set(archiveRef, {
        ...doc.data(),
        archivedAt: admin.firestore.FieldValue.serverTimestamp(),
        archiveYear: year
      });
      batch.delete(doc.ref);

      operationCount++;
      totalRecords++;

      if (operationCount === batchSize) {
        batches.push(batch.commit());
        batch = db.batch();
        operationCount = 0;
      }
    }

    if (operationCount > 0) {
      batches.push(batch.commit());
    }

    await Promise.all(batches);

    // Create archive summary
    await db.collection("archive_summaries").add({
      year,
      recordCount: totalRecords,
      archivedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: "completed"
    });

    return {
      status: "success",
      message: `Successfully archived ${totalRecords} records`,
      count: totalRecords
    };

  } catch (error) {
    console.error("Archive operation failed:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});