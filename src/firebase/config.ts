import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, doc, getDocs, setDoc, updateDoc, onSnapshot, query, where, orderBy, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import firebaseConfigJson from '../../firebase-applet-config.json';

// Default config loaded from AI Studio Firebase setup
// User specified custom project name: "bemestarsaudemental"
export interface FirebaseConfigOptions {
  projectId: string;
  appId?: string;
  apiKey?: string;
  authDomain?: string;
  firestoreDatabaseId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
}

const STORAGE_KEY_CUSTOM_CONFIG = 'bemestar_firebase_custom_config';

export const getSavedFirebaseConfig = (): FirebaseConfigOptions => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_CUSTOM_CONFIG);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Could not read custom Firebase config from localStorage:', e);
  }

  // If user requested bemestarsaudemental, prioritize that identifier while keeping active keys
  return {
    projectId: firebaseConfigJson.projectId || 'bemestarsaudemental',
    appId: firebaseConfigJson.appId || '',
    apiKey: firebaseConfigJson.apiKey || '',
    authDomain: `${firebaseConfigJson.projectId || 'bemestarsaudemental'}.firebaseapp.com`,
    firestoreDatabaseId: firebaseConfigJson.firestoreDatabaseId || '(default)',
    storageBucket: firebaseConfigJson.storageBucket || `${firebaseConfigJson.projectId || 'bemestarsaudemental'}.firebasestorage.app`,
    messagingSenderId: firebaseConfigJson.messagingSenderId || '',
  };
};

export const saveCustomFirebaseConfig = (config: FirebaseConfigOptions) => {
  localStorage.setItem(STORAGE_KEY_CUSTOM_CONFIG, JSON.stringify(config));
};

let app: any = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

try {
  const currentConfig = getSavedFirebaseConfig();
  if (!getApps().length) {
    app = initializeApp(currentConfig);
  } else {
    app = getApp();
  }
  const dbId = currentConfig.firestoreDatabaseId && currentConfig.firestoreDatabaseId !== '(default)'
    ? currentConfig.firestoreDatabaseId
    : undefined;
  db = dbId ? getFirestore(app, dbId) : getFirestore(app);
  auth = getAuth(app);
} catch (error) {
  console.warn('Firebase initialization notice (falling back to memory & localStorage state):', error);
}

export { app, db, auth };
export { collection, doc, getDocs, setDoc, updateDoc, onSnapshot, query, where, orderBy };
