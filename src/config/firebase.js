import { initializeApp } from 'firebase/app';
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut
} from 'firebase/auth';
import {
    getFirestore,
    doc,
    setDoc,
    collection,
    addDoc
} from 'firebase/firestore';
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
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

export const createAdminUser = async (email, password) => {
    try {
        // First check if email is already in use
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Create admin document
        await setDoc(doc(db, 'admins', user.uid), {
            email: user.email,
            role: 'admin',
            createdAt: new Date().toISOString(),
            uid: user.uid
        });

        console.log('Admin user created successfully:', user.email);
        return user;
    } catch (error) {
        console.error('Error creating admin:', error);
        throw error;
    }
};

export default app;