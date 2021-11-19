// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, child, get } from 'firebase/database'
import { getFirestore, doc, getDoc,getDocs, query, collection, where, setDoc, deleteDoc } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: "AIzaSyBzyQCY01AI8nuQheTLjPXxCcgtNy82CX4",
	authDomain: "invoice-automation-teronext.firebaseapp.com",
	databaseURL: "https://invoice-automation-teronext-default-rtdb.firebaseio.com",
	projectId: "invoice-automation-teronext",
	storageBucket: "invoice-automation-teronext.appspot.com",
	messagingSenderId: "890668541129",
	appId: "1:890668541129:web:7b0409f948225a1ca21918",
	measurementId: "G-XRYFBBTF2K"
};

// Initialize Firebase

export const useFirebase = () => {
	const app = initializeApp(firebaseConfig);
	const analytics = getAnalytics(app);

	const dbRef = ref(getDatabase(app))
	const fireStore = getFirestore(app)

	const getTestData = () => get(child(dbRef, 'test'))

	const getProjectsList = async () => getDocs(collection(fireStore, "project"))

	const getUser = async (username) => getDocs(query(collection(fireStore, "user"), where('username', '==', username)))

	const setProject = (id, data) => setDoc(doc(fireStore, "project", id), data);
	const addProject = (data) => setDoc(doc(collection(fireStore, 'project')), data)
	const deleteProject = (id) => deleteDoc(doc(fireStore, "project", id))

	const getInvoiceAppInfo = () => getDoc(doc(fireStore, "app", "invoice"))

	return {
		app,
		analytics,
		dbRef,
		fireStore,
		getTestData,
		getProjectsList,
		setProject,
		addProject,
		getUser,
		deleteProject,
		getInvoiceAppInfo,
	}
}
