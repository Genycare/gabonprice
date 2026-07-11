import { useNavigate } from 'react-router-dom'

export function PrivacyPolicyPage() {
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
        <h1 className="flex-1 text-[17px] font-extrabold text-ink">Politique de confidentialité</h1>
      </div>

      <div className="flex flex-col gap-5 px-4.5 py-5 text-[15px] leading-relaxed text-ink">
        <p className="text-[13px] text-muted">Dernière mise à jour : 11 juillet 2026.</p>

        <section>
          <h2 className="mb-1.5 text-[13px] font-bold uppercase tracking-wide text-brand-green-vivid">Qui sommes-nous</h2>
          <p>
            GabonPrice est une application communautaire de comparaison de prix, éditée par Mohamed Camara
            (contact : <a href="mailto:camaramohamed96@yahoo.com" className="text-brand-green-vivid underline">camaramohamed96@yahoo.com</a>).
            Cette page explique quelles données sont collectées lorsque vous utilisez GabonPrice, pourquoi, et
            comment les contrôler.
          </p>
        </section>

        <section>
          <h2 className="mb-1.5 text-[13px] font-bold uppercase tracking-wide text-brand-green-vivid">Données collectées</h2>
          <ul className="ml-4 list-disc space-y-1">
            <li><b>Compte</b> : adresse email (utilisée uniquement pour la connexion par code à usage unique), nom d'utilisateur.</li>
            <li><b>Contributions</b> : prix, magasin, ville/province/quartier et date d'achat que vous publiez ; photo de ticket si vous choisissez d'en ajouter une.</li>
            <li><b>Géolocalisation</b> : si vous l'autorisez, votre position est utilisée une seule fois pour pré-remplir la ville/province d'un prix ajouté — elle n'est jamais enregistrée telle quelle, seule la ville détectée est utilisée.</li>
            <li><b>Activité communautaire</b> : votes utile/pas utile, signalements, karma et niveau calculés à partir de votre activité.</li>
            <li><b>Données techniques</b> : journaux d'erreurs (Sentry) en cas de bug, contenant le message d'erreur technique et le contexte de navigation — pas de contenu personnel au-delà de ce qui est déjà visible dans l'app.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-1.5 text-[13px] font-bold uppercase tracking-wide text-brand-green-vivid">Pourquoi ces données</h2>
          <p>
            Ces données servent uniquement à faire fonctionner GabonPrice : vous authentifier, afficher les prix
            comparés par ville, calculer votre karma, modérer les contenus signalés, et corriger les bugs
            techniques. Aucune donnée n'est vendue ni utilisée à des fins publicitaires.
          </p>
        </section>

        <section>
          <h2 className="mb-1.5 text-[13px] font-bold uppercase tracking-wide text-brand-green-vivid">Qui y a accès</h2>
          <p>
            Votre nom d'utilisateur, karma et contributions (prix, ville, magasin) sont publics au sein de
            l'application, comme sur toute plateforme communautaire. Votre email n'est jamais affiché aux autres
            utilisateurs. Les données sont hébergées chez Supabase (base de données, région Union européenne) et
            Vercel (application), qui agissent comme sous-traitants techniques et n'utilisent pas vos données à
            d'autres fins.
          </p>
        </section>

        <section>
          <h2 className="mb-1.5 text-[13px] font-bold uppercase tracking-wide text-brand-green-vivid">Stockage local et hors-ligne</h2>
          <p>
            GabonPrice fonctionne aussi hors connexion : les produits déjà consultés et les prix en attente d'envoi
            sont temporairement stockés sur votre appareil (localStorage). Ces données restent sur votre appareil et
            sont supprimées automatiquement après synchronisation ou expiration. GabonPrice n'utilise aucun cookie
            publicitaire ni traceur tiers.
          </p>
        </section>

        <section>
          <h2 className="mb-1.5 text-[13px] font-bold uppercase tracking-wide text-brand-green-vivid">Durée de conservation</h2>
          <p>
            Vos données sont conservées tant que votre compte existe. Un prix retiré par modération reste visible
            uniquement par vous et les administrateurs, à des fins de transparence de la modération.
          </p>
        </section>

        <section>
          <h2 className="mb-1.5 text-[13px] font-bold uppercase tracking-wide text-brand-green-vivid">Vos droits</h2>
          <p>
            Vous pouvez à tout moment modifier votre nom d'utilisateur et votre province préférée, ou supprimer
            définitivement votre compte et toutes les données associées, depuis Profil → Paramètres. Vous pouvez
            aussi nous écrire à{' '}
            <a href="mailto:camaramohamed96@yahoo.com" className="text-brand-green-vivid underline">camaramohamed96@yahoo.com</a>
            {' '}pour toute question sur vos données.
          </p>
        </section>

        <section>
          <h2 className="mb-1.5 text-[13px] font-bold uppercase tracking-wide text-brand-green-vivid">Sécurité</h2>
          <p>
            L'accès aux données est protégé par des règles de sécurité au niveau de la base de données (chaque
            utilisateur ne peut modifier que ses propres contributions), et les échanges avec l'application sont
            chiffrés (HTTPS).
          </p>
        </section>
      </div>
    </div>
  )
}
