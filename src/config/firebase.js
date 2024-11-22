import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyC9rNjdt3kWQvTPafPXl-YOxxWi2PLVn1M",
    authDomain: "sjmc-staff-attendance.firebaseapp.com",
    projectId: "sjmc-staff-attendance",
    storageBucket: "sjmc-staff-attendance.firebasestorage.app",
    messagingSenderId: "49225540641",
    appId: "1:49225540641:web:b04e432b3d373749faaf60",
    measurementId: "G-LRNJH5JW24"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export { db };
export const auth = getAuth(app);
export const analytics = getAnalytics(app);