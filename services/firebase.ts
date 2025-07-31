// import { initializeApp } from 'firebase/app';
// import { getFirestore } from 'firebase/firestore';

// // IMPORTANT: Replace with your app's Firebase project configuration.
// // You can get this from the Firebase console for your project.
// // See: https://firebase.google.com/docs/web/setup#available-libraries
// const firebaseConfig = {
//   apiKey: "AIzaSyADZUr1k10og-c9lufNa5GBGNFfllfPwXY",
//   authDomain: "devroyale-71fb3.firebaseapp.com",
//   projectId: "devroyale-71fb3",
//   storageBucket: "devroyale-71fb3.appspot.com",
//   messagingSenderId: "475387028144",
//   appId: "1:475387028144:web:98bda819740a6d3fb09175",
//   measurementId: "G-JL6MFTXFGG"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);

// // Initialize Cloud Firestore and get a reference to the service
// export const db = getFirestore(app);

import { initializeApp, type FirebaseOptions } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  onSnapshot,
  arrayUnion,
  arrayRemove,
  increment,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import type { User, Idea, ChatConversation, ChatMessage } from "../types";


// NOTE: In a real app, these values MUST be in environment variables.
const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyDqUkNk-8PBeOCNxeY3PqyRVQqeARATgeI",
  authDomain: "devroyale-71fb3.firebaseapp.com",
  databaseURL: "https://devroyale-71fb3-default-rtdb.firebaseio.com",
  projectId: "devroyale-71fb3",
  storageBucket: "devroyale-71fb3.appspot.com",
  messagingSenderId: "475387028144",
  appId: "1:475387028144:web:bf0b0817a4459907b09175",
  measurementId: "G-Y1SJ7RNGY0",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app); 

const usersCollection = collection(db, "users");
const ideasCollection = collection(db, "ideas");
const chatsCollection = collection(db, "chats");

const dataFromSnapshot = <T>(docSnap: any): T => {
  const data = docSnap.data();

  const convertTimestamps = (fieldValue: any): any => {
    if (!fieldValue) return fieldValue;
    if (fieldValue instanceof Timestamp) return fieldValue.toDate();
    if (Array.isArray(fieldValue))
      return fieldValue.map((item) => convertTimestamps(item));
    if (typeof fieldValue === "object") {
      const newObj: { [key: string]: any } = {};
      for (const key in fieldValue) {
        newObj[key] = convertTimestamps(fieldValue[key]);
      }
      return newObj;
    }
    return fieldValue;
  };
  return convertTimestamps(data) as T;
};

export const getFeaturedBuilders = async (): Promise<User[]> => {
  const q = query(usersCollection, orderBy("followersCount", "desc"), limit(4));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    ...dataFromSnapshot<Omit<User, "uid">>(doc),
    uid: doc.id,
  }));
};

export const getAllBuilders = async (): Promise<User[]> => {
  const snapshot = await getDocs(usersCollection);
  return snapshot.docs.map((doc) => ({
    ...dataFromSnapshot<Omit<User, "uid">>(doc),
    uid: doc.id,
  }));
};

export const getFeaturedIdeas = async (): Promise<Idea[]> => {
  const q = query(ideasCollection, orderBy("createdAt", "desc"), limit(3));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    ...dataFromSnapshot<Omit<Idea, "id">>(doc),
    id: doc.id,
  }));
};

export const getAllIdeas = async (): Promise<Idea[]> => {
  const q = query(ideasCollection, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    ...dataFromSnapshot<Omit<Idea, "id">>(doc),
    id: doc.id,
  }));
};

export const getUserProfile = async (
  uid: string
): Promise<User | undefined> => {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { ...dataFromSnapshot<Omit<User, "uid">>(docSnap), uid: docSnap.id };
  }
  return undefined;
};

export const updateUserProfile = async (
  uid: string,
  data: Partial<User>
): Promise<void> => {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, data);
};

export const getIdeaById = async (id: string): Promise<Idea | undefined> => {
  const docRef = doc(db, "ideas", id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { ...dataFromSnapshot<Omit<Idea, "id">>(docSnap), id: docSnap.id };
  }
  return undefined;
};

export const getChatsForUser = async (
  uid: string
): Promise<ChatConversation[]> => {
  const q = query(
    chatsCollection,
    where("participants", "array-contains", uid),
    orderBy("lastMessage.timestamp", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    ...dataFromSnapshot<Omit<ChatConversation, "id">>(doc),
    id: doc.id,
  }));
};

export const onChatUpdate = (
  chatId: string,
  callback: (chat: ChatConversation) => void
) => {
  const docRef = doc(db, "chats", chatId);
  const unsubscribe = onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const chatData = {
        ...dataFromSnapshot<Omit<ChatConversation, "id">>(docSnap),
        id: docSnap.id,
      };
      chatData.messages.sort(
        (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
      );
      callback(chatData);
    }
  });
  return unsubscribe;
};

export const listenToChatsForUser = (
  uid: string,
  callback: (chats: ChatConversation[]) => void
) => {
  const q = query(
    collection(db, "chats"),
    where("participants", "array-contains", uid),
    orderBy("lastMessage.timestamp", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const chats = snapshot.docs.map((doc) => ({
      ...dataFromSnapshot<ChatConversation>(doc),
      id: doc.id,
    }));
    callback(chats);
  });
};

// NEW: Listen to chat messages specifically
export const listenToChatMessages = (
  chatId: string,
  callback: (messages: ChatMessage[]) => void
) => {
  const docRef = doc(db, "chats", chatId);
  const unsubscribe = onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const chatData = {
        ...dataFromSnapshot<Omit<ChatConversation, "id">>(docSnap),
        id: docSnap.id,
      };
      const sortedMessages = chatData.messages.sort(
        (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
      );
      callback(sortedMessages);
    } else {
      callback([]);
    }
  });
  return unsubscribe;
};

export const createIdea = async (
  ideaData: Omit<Idea, "id" | "createdAt" | "creatorInfo">
): Promise<Idea> => {
  const creator = await getUserProfile(ideaData.creatorUid);
  if (!creator) throw new Error("Creator not found");

  const newIdeaData = {
    ...ideaData,
    createdAt: new Date(),
    creatorInfo: {
      displayName: creator.displayName,
      pfpUrl: creator.pfpUrl,
    },
  };
  const docRef = await addDoc(ideasCollection, newIdeaData);
  return { ...newIdeaData, id: docRef.id };
};

export const findOrCreateChat = async (
  user1Uid: string,
  user2Uid: string
): Promise<string> => {
  const chatId = [user1Uid, user2Uid].sort().join("_");
  const chatRef = doc(db, "chats", chatId);
  const chatSnap = await getDoc(chatRef);

  if (!chatSnap.exists()) {
    const user1 = await getUserProfile(user1Uid);
    const user2 = await getUserProfile(user2Uid);
    if (!user1 || !user2)
      throw new Error("One or more users not found for chat creation");

    const newChat: Omit<ChatConversation, "id" | "messages"> = {
      participants: [user1Uid, user2Uid],
      participantInfo: {
        [user1Uid]: { displayName: user1.displayName, pfpUrl: user1.pfpUrl },
        [user2Uid]: { displayName: user2.displayName, pfpUrl: user2.pfpUrl },
      },
      lastMessage: {
        text: "Chat created.",
        timestamp: new Date(),
      },
    };
    await setDoc(chatRef, { ...newChat, messages: [] });
  }
  return chatId;
};

export const sendMessage = async (
  chatId: string,
  senderUid: string,
  text: string
): Promise<void> => {
  const message: ChatMessage = {
    id: `${Date.now()}_${senderUid}`, // Simple ID generation
    senderUid,
    text,
    timestamp: new Date(),
  };

  const chatRef = doc(db, "chats", chatId);
  // Firestore's arrayUnion is atomic and adds elements to an array field.
  // We also update the `lastMessage` for the conversation list preview.
  await updateDoc(chatRef, {
    messages: arrayUnion(message),
    lastMessage: {
      text: message.text,
      timestamp: message.timestamp,
    },
  });
};

export const followUser = async (
  currentUserId: string,
  targetUserId: string
): Promise<void> => {
  const currentUserRef = doc(db, "users", currentUserId);
  const targetUserRef = doc(db, "users", targetUserId);

  await updateDoc(currentUserRef, {
    following: arrayUnion(targetUserId),
  });
  await updateDoc(targetUserRef, {
    followersCount: increment(1),
  });
};

export const unfollowUser = async (
  currentUserId: string,
  targetUserId: string
): Promise<void> => {
  const currentUserRef = doc(db, "users", currentUserId);
  const targetUserRef = doc(db, "users", targetUserId);

  await updateDoc(currentUserRef, {
    following: arrayRemove(targetUserId),
  });
  await updateDoc(targetUserRef, {
    followersCount: increment(-1),
  });
};

// ========================================================================
// === NEW: The fully implemented Profile Picture Upload Function ===
// ========================================================================

/**
 * Uploads a profile picture to Firebase Storage and returns the public URL.
 * @param uid - The user's unique ID.
 * @param file - The image File object to upload.
 * @returns A promise that resolves with the public download URL of the uploaded image.
 */
export const uploadProfilePicture = async (
  uid: string,
  file: File
): Promise<string> => {
  // 1. Define the storage path. This creates a folder for each user.
  // Using a consistent name like 'pfp' ensures the old picture is overwritten.
  const filePath = `profilePictures/${uid}/pfp`;
  
  // 2. Create a reference to the file location in Firebase Storage.
  const storageRef = ref(storage, filePath);

  try {
    // 3. Upload the file to the specified reference.
    // `uploadBytes` returns a snapshot of the upload, including metadata.
    const snapshot = await uploadBytes(storageRef, file);
    console.log("Uploaded profile picture!", snapshot.metadata.fullPath);

    // 4. Get the public download URL for the uploaded file.
    // This URL can be used directly in an <img> tag.
    const downloadURL = await getDownloadURL(snapshot.ref);

    // 5. Return the URL so it can be saved to the user's profile in Firestore.
    return downloadURL;
  } catch (error) {
    console.error("Error uploading profile picture: ", error);
    // Throw an error to be caught by the calling component's try/catch block.
    throw new Error("Could not upload profile picture. Please try again.");
  }
};

export const updateIdea = async (
  ideaId: string,
  data: Partial<Omit<Idea, 'id' | 'creatorInfo' | 'creatorUid'>>
): Promise<void> => {
  const ideaRef = doc(db, "ideas", ideaId);
  await updateDoc(ideaRef, data);
};