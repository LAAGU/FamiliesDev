
import admin from 'firebase-admin';

const serviceAccount: any = JSON.parse(import.meta.env["VITE_FIREBASE_ADMIN_KEY"] as string)


if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const db = admin.firestore();
