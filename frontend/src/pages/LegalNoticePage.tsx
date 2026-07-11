import { Link, useNavigate } from 'react-router-dom'

export function LegalNoticePage() {
  const navigate = useNavigate()

  return (
    <div className="pb-10">
      <div className="sticky top-0 z-40 flex items-center gap-3.5 border-b border-line bg-white px-4.5 py-4">
        <button
          onClick={() => navigate(-1)}
          aria-label="Retour"
          className="flex h-9.5 w-9.5 flex-shrink-0 items-center justify-center rounded-[10px] border border-line bg-app-bg"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-ink">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="flex-1 text-[17px] font-extrabold text-ink">Mentions légales</h1>
      </div>

      <div className="flex flex-col gap-5 px-4.5 py-5 text-[15px] leading-relaxed text-ink">
        <section>
          <h2 className="mb-1.5 text-[13px] font-bold uppercase tracking-wide text-brand-green-vivid">Éditeur du site</h2>
          <p>
            GabonPrice est édité à titre non professionnel par Mohamed Camara.
            <br />
            Contact : <a href="mailto:camaramohamed96@yahoo.com" className="text-brand-green-vivid underline">camaramohamed96@yahoo.com</a>
          </p>
        </section>

        <section>
          <h2 className="mb-1.5 text-[13px] font-bold uppercase tracking-wide text-brand-green-vivid">Directeur de publication</h2>
          <p>Mohamed Camara.</p>
        </section>

        <section>
          <h2 className="mb-1.5 text-[13px] font-bold uppercase tracking-wide text-brand-green-vivid">Hébergement</h2>
          <p>
            Application (frontend) : Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis.
            <br />
            Base de données et authentification : Supabase Inc., hébergée sur des serveurs situés dans l'Union
            européenne (région eu-west-3, Paris).
            <br />
            Suivi des erreurs techniques : Sentry (Functional Software, Inc.).
          </p>
        </section>

        <section>
          <h2 className="mb-1.5 text-[13px] font-bold uppercase tracking-wide text-brand-green-vivid">Propriété intellectuelle</h2>
          <p>
            La structure générale du site, les textes, le logo et la charte graphique de GabonPrice sont la
            propriété de l'éditeur, sauf mention contraire. Les prix, avis et photos publiés par les utilisateurs
            restent leur propriété ; en les publiant, l'utilisateur autorise GabonPrice à les afficher publiquement
            dans le cadre du service.
          </p>
        </section>

        <section>
          <h2 className="mb-1.5 text-[13px] font-bold uppercase tracking-wide text-brand-green-vivid">Contenu généré par les utilisateurs</h2>
          <p>
            GabonPrice est un service communautaire : les prix affichés sont soumis par les utilisateurs et ne sont
            pas vérifiés individuellement avant publication. L'éditeur ne garantit pas l'exactitude des informations
            publiées et met en place des mécanismes de signalement et de modération pour limiter les abus (voir la{' '}
            <Link to="/confidentialite" className="text-brand-green-vivid underline">politique de confidentialité</Link>
            {' '}pour la gestion des données associées).
          </p>
        </section>

        <section>
          <h2 className="mb-1.5 text-[13px] font-bold uppercase tracking-wide text-brand-green-vivid">Contact</h2>
          <p>
            Pour toute question, signalement ou demande relative à ce site :{' '}
            <a href="mailto:camaramohamed96@yahoo.com" className="text-brand-green-vivid underline">camaramohamed96@yahoo.com</a>
          </p>
        </section>
      </div>
    </div>
  )
}
