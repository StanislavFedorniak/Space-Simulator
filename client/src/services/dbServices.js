import { collection, doc, setDoc, getDoc, getDocs } from "firebase/firestore";
import { db, auth } from "../firebase"; 

export const fetchMissions = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "missions"));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Помилка читання місій: ", error);
    return [];
  }
};

export const saveShipData = async (shipName, fuelLevel) => {
  if (!auth.currentUser) return;
  try {
    const shipRef = doc(db, "user_ships", auth.currentUser.uid);
    await setDoc(shipRef, {
      name: shipName,
      fuel: fuelLevel,
      updatedAt: new Date()
    }, { merge: true }); 
    console.log("Дані корабля збережено!");
  } catch (error) {
    console.error("Помилка запису корабля: ", error);
  }
};

export const fetchShipData = async () => {
  if (!auth.currentUser) return null;
  
  try {
    const shipRef = doc(db, "user_ships", auth.currentUser.uid);
    const docSnap = await getDoc(shipRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.log("Корабель ще не створено");
      return null;
    }
  } catch (error) {
    console.error("Помилка читання корабля: ", error);
    return null;
  }
};
