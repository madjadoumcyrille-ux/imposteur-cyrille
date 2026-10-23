# Étapes restantes pour Google Play

1. Le propriétaire doit créer son compte développeur Google Play avec son propre compte Google, choisir personnel ou organisation selon sa situation, accepter les conditions, payer le frais affiché par Google, et terminer la vérification d’identité.
2. Confirmer le nom public du développeur, l’identifiant Android souhaité (qui ne pourra pas être choisi au hasard après publication) et les coordonnées demandées par la console.
3. Générer le projet Android Trusted Web Activity, installer le JDK et Android SDK nécessaires, puis produire et signer un fichier Android App Bundle (.aab).
4. Déterminer où le fichier Digital Asset Links peut être hébergé à la racine de l’origine HTTPS, puis y publier le certificat SHA-256 correspondant à la signature Google Play.
5. Charger le .aab dans la piste de test fermé, compléter la fiche, les déclarations de confidentialité et le questionnaire IARC.
6. Pour un nouveau compte personnel, Google demande actuellement au moins 12 testeurs inscrits sans interruption pendant 14 jours, puis une demande d’accès à la production.
7. Après autorisation de production, soumettre la version à l’examen Google Play et attendre le statut affiché dans Play Console.

La clé de signature et les identifiants Google restent sous le contrôle du propriétaire du compte. La génération Android et la publication finale ne sont pas terminées dans ce dépôt.
