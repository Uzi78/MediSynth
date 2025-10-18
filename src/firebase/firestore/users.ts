'use client';
import { Auth, User, updateProfile } from "firebase/auth";
import { Firestore, doc, setDoc } from "firebase/firestore";
import { FirebaseStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface FirebaseServices {
    firestore: Firestore;
}

interface UserProfileData {
    displayName?: string;
    phoneNumber?: string | null;
    photoURL?: string;
}

/**
 * Updates a user's profile across Firebase Auth and Firestore.
 * @param services - The core Firebase services.
 * @param user - The Firebase User object to update.
 * @param data - The profile data to update.
 * @param newImage - An optional new image file to upload.
 */
export async function updateUserProfile(
    services: FirebaseServices,
    user: User,
    data: { displayName?: string, phoneNumber?: string | null },
) {
    const { firestore } = services;
    const updateData: UserProfileData = {};

    
    // Note: Phone number is not directly updatable via updateProfile from client SDK
    // It requires a more complex verification flow. We'll store it in Firestore.

    // 3. Update Firestore user document
    const userDocRef = doc(firestore, 'users', user.uid);
    const firestoreUpdate: Record<string, any> = {
        // The user's role should be preserved, so we merge.
    };

    if (data.displayName) {
        firestoreUpdate.displayName = data.displayName;
    }
    if (updateData.photoURL) {
        firestoreUpdate.photoURL = updateData.photoURL;
    }
    if (data.phoneNumber) {
        firestoreUpdate.phoneNumber = data.phoneNumber;
    }

    if (Object.keys(firestoreUpdate).length > 0) {
        await setDoc(userDocRef, firestoreUpdate, { merge: true });
    }

    // The onAuthStateChanged listener will handle the local user state update automatically.
}
