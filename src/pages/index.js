import Head from "next/head";
import styles from "@/styles/Home.module.css";
import { useState, useEffect } from "react";
import { initFirebase } from "../../firebase/firebaseApp";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import {
  collection,
  onSnapshot,
  query,
  addDoc,
  doc,
  serverTimestamp,
  setDoc,
  getDocs,
  deleteDoc,
  orderBy,
} from "firebase/firestore";
import { db } from "../../firebase/firebaseApp";

export default function Home() {
  initFirebase();
  const provider = new GoogleAuthProvider();
  const auth = getAuth();

  const [currObj, setCurrObj] = useState({ name: "" });
  const [remArr, setRemArr] = useState([]);

  const [user, setUser] = useState();
  useEffect(() => {
    setUser(JSON.parse(localStorage.getItem("user")));
  }, []);

  const loginHandler = async () => {
    signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user;
        const userDetails = {
          imageURL: result.user.photoURL,
          name: result.user.displayName,
          uid: result.user.uid,
        };
        await localStorage.setItem("user", JSON.stringify(userDetails));
        setDoc(doc(db, "users", user.uid));
        window.location.reload(false);
      })
      .catch((error) => {
        const errorMessage = error.message;
        console.log(errorMessage);
      });
  };

  const logoutHandler = () => {
    auth.signOut().then(() => {
      localStorage.removeItem("user");
      setUser(null);
    });
    window.location.reload(false);
  };

  useEffect(() => {
    if (user) {
      const pathToTask = "users/" + user.uid + "/reminder";
      const q = query(collection(db, pathToTask), orderBy("timestamp", "desc"));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        let tempArr = [];
        querySnapshot.forEach((doc) => {
          tempArr.push({ ...doc.data(), id: doc.id });
        });
        setRemArr(tempArr);
      });
      return () => unsubscribe();
    }
  }, []);

  const addReminderData = async () => {
    await addDoc(collection(db, `users/${user.uid}/reminder`), {
      ...currObj,
      timestamp: serverTimestamp(),
    });
    console.log("Your task has been saved to DB!");
  };

  const refresh = () => {
    if (user) {
      const pathToTask = "users/" + user.uid + "/reminder";
      const q = query(collection(db, pathToTask), orderBy("timestamp", "desc"));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        let tempArr = [];
        querySnapshot.forEach((doc) => {
          tempArr.push({ ...doc.data(), id: doc.id });
        });
        setRemArr(tempArr);
      });
      return () => unsubscribe();
    }
  };

  return (
    <>
      <Head>
        <title>Reminder App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div className={styles.navMain}>
          <div className={styles.logo}>REMINDER APP</div>

          {!user ? (
            <button className={styles.loginButton} onClick={loginHandler}>
              LOGIN
            </button>
          ) : (
            <div className={styles.rhs}>
              <div>{user.name}</div>
              <button className={styles.loginButton} onClick={logoutHandler}>
                Logout
              </button>
            </div>
          )}
        </div>
        <form className={styles.inputSection}>
          <label className={styles.inputSectionLabel}>Name</label>
          <input
            className={styles.inputSectionInput}
            type="text"
            onChange={(e) => {
              setCurrObj((curr) => {
                return { ...curr, name: e.target.value };
              });
            }}
          />
          <label className={styles.inputSectionLabel}>Date</label>
          <input
            className={styles.inputSectionInput}
            type="date"
            onChange={(e) => {
              setCurrObj((curr) => {
                return { ...curr, date: e.target.value };
              });
            }}
          />
          <label className={styles.inputSectionLabel}>Time</label>
          <input
            className={styles.inputSectionInput}
            type="time"
            onChange={(e) => {
              setCurrObj((curr) => {
                return { ...curr, time: e.target.value };
              });
            }}
          />
          <button
            className={styles.inputSectionButton}
            onClick={addReminderData}
            type="button"
          >
            Add Reminder
          </button>
          <button
            className={styles.inputSectionButton}
            onClick={refresh}
            type="button"
          >
            Refresh
          </button>
        </form>
        <div className={styles.outputSection}>
          {remArr.map((obj, i) => {
            return (
              <div
                className={styles.remItem}
                key={i}
                delid={user ? obj.id : ""}
              >
                <div className={styles.remItemName}>{obj.name}</div>
                <div className={styles.remItemSub}>{obj.date}</div>
                <div className={styles.remItemSub}>{obj.time}</div>
                <button
                  className={styles.deleteButton}
                  onClick={async () => {
                    const pathToTask =
                      "users/" + user.uid + "/reminder/" + obj.id;
                    await deleteDoc(doc(db, pathToTask));
                  }}
                >
                  del
                </button>
                <button className={styles.completeButton}>com</button>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
