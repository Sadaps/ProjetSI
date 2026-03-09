# On part d'une image Node.js légère
FROM node:22-alpine

# Installation globale de l'outil Angular CLI
RUN npm install -g @angular/cli

# On se place dans le dossier de travail
WORKDIR /app

# Copie des fichiers de dépendances (si existants)
COPY package*.json ./

# Installation des dépendances
RUN npm install

# Commande par défaut pour lancer le serveur de développement Angular
# --host 0.0.0.0 permet d'y accéder depuis l'extérieur du conteneur
CMD ["ng", "serve", "--host", "0.0.0.0", "--poll", "2000"]