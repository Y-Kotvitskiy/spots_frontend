import styles from "./Welcome.module.scss";
import { usePageError } from "@/modules/hooks";
import Button from "@/modules/shared/Button";

const Welcome = () => {
  const [error] = usePageError("");

  return (
    <main className={styles.WelcomePage}>
      <div className={styles.container}>

        {/* Hero Section */}
        <section className={styles.content}>
          <div className={styles.content__infoWrapper}>
            <div className={styles.content__infoWrapper__box}>
              <h1 className={styles.content__infoWrapper__title}>
                Find your <span>spots</span> <br />
                Share them with your people
              </h1>
              <p className={styles.content__infoWrapper__description}>
                Spots is a community map where you discover interesting places, 
                add your own and share them with like-minded people.
              </p>
            </div>

            <div className={styles.content__infoWrapper__buttons}>
              <Button 
                type="button"
                text="See how it works"
                variant="default"
                onClick={() => {
                  const element = document.getElementById("how-it-works");
                  if (element) {
                    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;

                    const isMobile = window.innerWidth < 640;
                    const headerOffset = isMobile ? 20 : 180; 

                    window.scrollTo({
                      top: elementPosition - headerOffset,
                      behavior: "smooth"
                    });
                  }
                }}
              />
            </div>
          </div>

          <div className={styles.content__imageWrapper}>
            <img
              src="public\illustration.png"
              alt="Welcome illustration"
              className={styles.content__imageWrapper__image}
            />
          </div>
        </section>

        {/* How it works Section */}

        <section id="how-it-works" className={styles.howItWorks}>
          <h3 className={styles.sectionTitle}>How it works</h3>
          <div className={styles.howItWorks__steps}>
            <div className={styles.stepCard}>
              <div className={styles.stepCard__number}>1</div>
              <div className={styles.stepCard__textBox}>
                <h3 className={styles.stepCard__title}>Discover</h3>
                <p className={styles.stepCard__text}>Search and filter places on the map.</p>
              </div>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepCard__number}>2</div>
              <div className={styles.stepCard__textBox}>
                <h3 className={styles.stepCard__title}>Add</h3>
                <p className={styles.stepCard__text}>Add places you love with photos and details.</p>
              </div>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepCard__number}>3</div>
              <div className={styles.stepCard__textBox}>
                <h3 className={styles.stepCard__title}>Share</h3>
                <p className={styles.stepCard__text}>Share selected places with your groups.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Why SPOTS & Who is SPOTS for Info Sections (Адаптивна ширина) */}
        <section className={styles.infoSection}>
          <div className={styles.infoBlock}>
            <h3 className={styles.sectionTitle}>Why SPOTS?</h3>
            <p>Keep your favorite places in one place, discover new recommendations from people you trust, and make it easier to find places worth visiting.</p>
            <p>Whether you're looking for a cozy café, a restaurant for dinner, or somewhere new to explore, SPOTS helps you organize interesting locations and share them with your community.</p>
          </div>

          <div className={styles.infoBlock}>
            <h3 className={styles.sectionTitle}>Who is SPOTS for?</h3>
            <p>SPOTS is designed for friends planning their next outing, local communities sharing recommendations, and people who love exploring new places.</p>
            <p>Discover locations that match your interests, add your own favorite spots, and connect with others through shared places and experiences.</p>
          </div>
        </section>

        {error && <p className={styles.error}>{error}</p>}

        
        {/* Footer */}

        <footer className={styles.footer}>
          <div className={styles.footerContainer}>
            <div className={styles.ctaCard}>
              <h2 className={styles.ctaCard__title}>Ready to find your spots?</h2>
            </div>
          </div>
        </footer>
      </div>

    </main>
  );
};

export default Welcome;