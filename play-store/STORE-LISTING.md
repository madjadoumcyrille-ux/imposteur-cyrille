# Préparation de la fiche Google Play — IMPOSTEUR

Application : jeu web multijoueur IMPOSTEUR  
URL du jeu : https://madjadoumcyrille-ux.github.io/imposteur-cyrille/  
Politique de confidentialité : https://madjadoumcyrille-ux.github.io/imposteur-cyrille/privacy.html  
Dépôt source public : https://github.com/madjadoumcyrille-ux/imposteur-cyrille

## Texte proposé

**Nom**  
IMPOSTEUR — Jeu entre amis

**Description courte**  
Le jeu du mot secret : trouve l’imposteur avec tes amis, chacun sur son téléphone.

**Description complète**  
Jouez ensemble à IMPOSTEUR, le jeu de déduction où tout le monde connaît un mot secret… sauf l’imposteur.

Crée une salle, partage le lien ou le code, puis rejoins tes amis depuis vos téléphones. Chaque joueur reçoit son rôle en privé. Donnez des indices, discutez et votez pour découvrir qui bluffe.

• 3 à 12 joueurs  
• Plusieurs thèmes de mots  
• Rôles transmis en privé  
• Partie multijoueur en ligne  
• Aucun compte à créer

Une connexion Internet est nécessaire. Le relais de partie peut mettre quelques instants à répondre après une période sans activité.

## Éléments à fournir dans Play Console

- Icône d’application PNG 512 × 512, conforme aux consignes graphiques Google Play.
- Captures d’écran réelles du jeu sur Android, sans maquette trompeuse.
- Image de présentation 1 024 × 500 si Play Console la demande pour la fiche.
- Nom public du développeur, adresse de contact requise par la console et classification du contenu via le questionnaire IARC.
- Déclaration « Sécurité des données » remplie d’après la version réellement envoyée et les services inclus.

## Vérifications de confidentialité à faire dans la console

Le jeu envoie un pseudo, un code de salle et des données de partie au relais Render pour fournir le multijoueur. Les pseudos sont visibles dans la salle. Les rôles restent privés au joueur concerné; les votes sont traités par le relais et le jeu montre le décompte puis le résultat. Les données de partie résident en mémoire pendant la session et ne sont pas enregistrées dans une base de données par le code du relais.

À confirmer avant de remplir le formulaire : les catégories exactes demandées par Play Console, les journaux techniques conservés par les hébergeurs, et les composants présents dans le paquet Android final. Ne coche pas « aucune collecte » sans vérifier comment Play Console qualifie les données envoyées au relais. La politique de confidentialité doit rester cohérente avec ces réponses.

## Version Android à créer

La voie prévue est une application Android Trusted Web Activity qui ouvre le jeu publié. Pour la générer, il faudra fixer l’identifiant Android du paquet, créer et signer l’application, puis publier la bonne empreinte SHA-256 dans `.well-known/assetlinks.json` à la racine du domaine HTTPS. La clé de signature utilisée par Google Play doit correspondre à cette déclaration. Le compte développeur n’étant pas encore créé, l’identifiant, l’empreinte définitive et le fichier Digital Asset Links ne sont pas encore disponibles.

Ce dépôt ne contient pas encore de fichier Android App Bundle (.aab). Aucun dépôt Play Console ni aucune publication Google Play n’a été effectué.
