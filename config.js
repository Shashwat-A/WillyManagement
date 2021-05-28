import * as firebase from 'firebase'
require('@firebase/firestore')

var firebaseConfig = {
    apiKey: "AIzaSyDlH2aOA47WrtsaLSF2X-8Gxs9tQtnFXjI",
    authDomain: "willymanagement-84e14.firebaseapp.com",
    projectId: "willymanagement-84e14",
    storageBucket: "willymanagement-84e14.appspot.com",
    messagingSenderId: "242240123419",
    appId: "1:242240123419:web:e6d4810cef35f638f67ebe",
    measurementId: "G-XSYSS15P03"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  export default firebase.firestore()