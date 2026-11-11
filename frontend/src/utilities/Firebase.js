
import { initializeApp } from "firebase/app";
import { getStorage } from 'firebase/storage';
import {
    getAuth,
    GoogleAuthProvider,
    signInWithRedirect,
    signInWithPopup,
    signOut,
  } from "firebase/auth";
  
import {
    getFirestore,
    addDoc,
    collection,
    getDocs,
    doc,
  } from "firebase/firestore";

  const firebaseConfig = {
    apiKey: "AIzaSyBCm2j-pWB2cSlfJ3KPTtgHTwNZYrZOdZQ",
    authDomain: "accio-2f266.firebaseapp.com",
    projectId: "accio-2f266",
    storageBucket: "accio-2f266.appspot.com",
    messagingSenderId: "49985640801",
    appId: "1:49985640801:web:b902284195aff880f70d20"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const imageDb = getStorage(app)

const googleProvider = new GoogleAuthProvider();
// Sign in and sign out functions
export const signInWithGoogleRedirect = () =>
signInWithPopup(auth, googleProvider);

export const signUserAccountOut = () => signOut(auth);

//create cloud database
export const db=getFirestore(app);

const location = collection(db, "locations");
const Afterprocess = collection(db, "AfterProcess");


// Add location to firestore database
export const addLocationtoDb = async (lati,longi) => {
    await addDoc(location, {
      lati,
      longi,
      date: new Date().toJSON().slice(0, 10).replace(/-/g, "/"),
    });
  };

  // Get coordinate from firestore database
export const getCoordinate = async () => {
    const data = await getDocs(Afterprocess);
    return data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
  };

//forms data into the firebase
const formdata = collection(db, "form");
export const addFormdata = async (name,email,phoneNumber,message,address,city,district,state,pincode,ImgUrl,pothole) => {
  await addDoc(formdata, {
    name,email,phoneNumber,message,address,city,district,state,pincode,ImgUrl,pothole,
    date: new Date().toJSON().slice(0, 10).replace(/-/g, "/"),
  });
};

export const getFormdata = async () => {
  const data = await getDocs(formdata);
  return data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
};

//now comes something else
