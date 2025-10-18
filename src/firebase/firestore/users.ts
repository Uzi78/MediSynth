'use client';
import { Auth, User, updateProfile } from "firebase/auth";
import { Firestore, doc, setDoc } from "firebase/firestore";
import { FirebaseStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface FirebaseServices {
    firestore: Firestore;
    auth: Auth;
    storage: FirebaseStorage;
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
    newImage?: File | null
) {
    const { firestore, auth, storage } = services;
    const authUpdateData: { displayName?: string, photoURL?: string } = {};
    let imageUrl = user.photoURL;

    // 1. Upload new image if it exists
    if (newImage) {
        const imagePath = `profile-pictures/${user.uid}/${newImage.name}`;
        const imageRef = ref(storage, imagePath);
        const uploadResult = await uploadBytes(imageRef, newImage);
        imageUrl = await getDownloadURL(uploadResult.ref);
        authUpdateData.photoURL = imageUrl;
    }

    // 2. Update Auth profile
    if (data.displayName && data.displayName !== user.displayName) {
        authUpdateData.displayName = data.displayName;
    }
    
    if (Object.keys(authUpdateData).length > 0) {
        await updateProfile(user, authUpdateData);
    }
    

    // 3. Update Firestore user document
    const userDocRef = doc(firestore, 'users', user.uid);
    const firestoreUpdate: Record<string, any> = {
        // The user's role should be preserved, so we merge.
    };

    if (data.displayName) {
        firestoreUpdate.displayName = data.displayName;
    }
    if (imageUrl) {
        firestoreUpdate.photoURL = imageUrl;
    }
    if (data.phoneNumber) {
        firestoreUpdate.phoneNumber = data.phoneNumber;
    }

    if (Object.keys(firestoreUpdate).length > 0) {
        await setDoc(userDocRef, firestoreUpdate, { merge: true });
    }

    // The onAuthStateChanged listener will handle the local user state update automatically.
}
