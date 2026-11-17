import { useEffect, useState } from 'react';
import { Navigation, ONGLETS, type OngletId } from './components/layout/Navigation';
import { ProfilPage } from './components/profile/ProfilPage';
import { MenusPage } from './components/menus/MenusPage';
import { CoursesPage } from './components/shopping/CoursesPage';
import { PoidsPage } from './components/weight/PoidsPage';
import { ExercicesPage } from './components/exercises/ExercicesPage';
import { useStore } from './store';

function ongletDepuisHash(): OngletId {
  const h = window.location.hash.replace('#/', '') as OngletId;
  return ONGLETS.some((o) => o.id === h) ? h : 'profil';
}

export default function App() {
  const { data, maj } = useStore();
  const [onglet, setOnglet] = useState<OngletId>(ongletDepuisHash);

  // Synchronisation onglet <-> URL (#/menus…) pour garder l'onglet au rechargement
  useEffect(() => {
    const onHash = () => setOnglet(ongletDepuisHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const changerOnglet = (id: OngletId) => {
    window.location.hash = `/${id}`;
    setOnglet(id);
    window.scrollTo({ top: 0 });
  };

  // Thème : choix explicite de l'utilisateur, sinon préférence du système
  const sombreSysteme = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  const sombre = data.theme ? data.theme === 'sombre' : sombreSysteme;
  useEffect(() => {
    document.documentElement.classList.toggle('dark', sombre);
  }, [sombre]);

  const basculerTheme = () => maj((d) => ({ ...d, theme: sombre ? 'clair' : 'sombre' }));

  return (
    <div className="min-h-screen md:pl-64">
      <Navigation actif={onglet} onChange={changerOnglet} sombre={sombre} onTheme={basculerTheme} />
      <main className="mx-auto max-w-5xl px-4 pb-28 pt-5 sm:px-6 md:pb-12 md:pt-8 print:max-w-none print:p-0">
        {onglet === 'profil' && <ProfilPage />}
        {onglet === 'menus' && <MenusPage />}
        {onglet === 'courses' && <CoursesPage />}
        {onglet === 'poids' && <PoidsPage />}
        {onglet === 'exercices' && <ExercicesPage />}

        <footer className="mt-10 border-t border-stone-200 pt-4 text-xs leading-relaxed muted dark:border-stone-800 print:mt-4">
          Les valeurs nutritionnelles et les besoins caloriques sont <strong>indicatifs</strong> (tables moyennes,
          formule de Mifflin-St Jeor). Cette application ne remplace pas l’avis d’un médecin ou d’un diététicien.
          Données stockées uniquement sur cet appareil.
        </footer>
      </main>
    </div>
  );
}
