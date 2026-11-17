import { useState, useRef, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Loader from "@/modules/shared/Loader";
import styles from "./AuthContainer.module.scss";

const AuthContainer = () => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      setIsImageLoaded(true);
    }
  }, []);

  return (
    <main className={styles.AuthContainer}>
      <section className={styles.AuthContainer__wrapper}>
        <div className={styles.AuthContainer__form}>
          <Outlet />
        </div>

        <div className={styles.AuthContainer__photoWrapper}>
          {!isImageLoaded && (
            <div className={styles.AuthContainer__placeholderContainer}>
              <Loader className={styles.AuthContainer__loaderOverlay} />
            </div>
          )}

          <img
            ref={imgRef}
            className={`${styles.AuthContainer__photo} ${
              isImageLoaded ? styles.AuthContainer__photoLoaded : styles.AuthContainer__photoHidden
            }`}
            alt="Registration Photo"
            src="/registration.png"
            onLoad={() => setIsImageLoaded(true)}
          />
        </div>
      </section>
    </main>
  );
};

export default AuthContainer;