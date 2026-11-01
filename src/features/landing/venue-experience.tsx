import Image from "next/image";
import styles from "./venue-experience.module.css";

const PHOTO_BASE =
  "https://gfbixkddumsqlfrfbsmp.supabase.co/storage/v1/object/public/landing";

interface ExperienceFilmProps {
  src: string;
  poster: string;
  label: string;
  title: string;
  duration: string;
  muted?: boolean;
}

function ExperienceHeading() {
  return (
    <div className={styles.introduction}>
      <p className={styles.eyebrow}>El lugar también se siente</p>
      <h2 id="experience-title">Aquí empieza <em>tu celebración.</em></h2>
      <p className={styles.description}>
        Los jardines para tus fotos. El salón listo para recibir a los tuyos.
        Y ese primer baile que vas a recordar siempre.
      </p>
      <a href="#recorrido-360" className={styles.textLink}>
        Recorre Villaverde en 360° <span aria-hidden="true">↗</span>
      </a>
    </div>
  );
}

function ExperienceFilm({ src, poster, label, title, duration, muted }: ExperienceFilmProps) {
  return (
    <figure className={styles.film}>
      <div className={styles.filmFrame}>
        <video
          src={src}
          poster={poster}
          controls
          preload="none"
          muted={muted}
          playsInline
          aria-label={label}
        >
          Tu navegador no puede reproducir el video. Puedes conocer el salón en nuestra galería.
        </video>
      </div>
      <figcaption>
        <span>{title}</span>
        <span>{duration}</span>
      </figcaption>
    </figure>
  );
}

function TourIntroduction() {
  return (
    <div className={styles.tourIntroduction}>
      <p className={styles.eyebrow}>Mira cada detalle</p>
      <h3>Conoce el salón <em>por dentro.</em></h3>
      <p>
        Recorre el montaje, los espacios y los detalles del salón antes
        de venir a conocernos.
      </p>
    </div>
  );
}

export function VenueExperience() {
  return (
    <section className={styles.experience} id="experiencia" aria-labelledby="experience-title">
      <div className={styles.inner}>
        <ExperienceHeading />
        <ExperienceFilm
          src="/landing/celebracion.mp4"
          poster="/landing/celebracion-poster.webp"
          label="Vals de quinceañera en una fiesta real en Salón Villaverde (8 segundos)"
          title="Tu celebración en Villaverde"
          duration="Fiesta real · 8 segundos"
          muted
        />
        <TourIntroduction />
        <ExperienceFilm
          src="/informes/assets/gardenia-muestra.mp4"
          poster="/informes/assets/gardenia-muestra-poster.jpg"
          label="Recorrido en video por el salón de Villaverde (2 minutos y 9 segundos)"
          title="Recorrido del salón"
          duration="Recorrido · 2:09"
        />
        <figure className={styles.garden}>
          <div className={styles.gardenFrame}>
            <Image
              src={`${PHOTO_BASE}/jardines.webp`}
              alt="Jardín y fuente del Salón Villaverde, rodeados de vegetación"
              fill
              sizes="(max-width: 760px) 48vw, 30vw"
            />
          </div>
          <figcaption>Un respiro entre tantos momentos.</figcaption>
        </figure>
        <div className={styles.detail}>
          <span className={styles.detailNumber} aria-hidden="true">V.</span>
          <h3>Tu gente. Tu música.<br /><em>Tu manera de celebrar.</em></h3>
          <p>
            Arquitectura estilo hacienda, jardines con fuente y un montaje
            que acompaña lo más importante: estar juntos.
          </p>
          <a href="#galeria" className={styles.textLink}>
            Ver más fotos del salón <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}
