# On part d'une image PHP en ligne de commande
FROM php:8.4-cli
# Installation des dépendances système et des extensions PHP pour PostgreSQL
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql

# Installation de Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# On se place dans le dossier de travail
WORKDIR /app

# Commande par défaut au lancement du conteneur :
# On utilise le serveur interne de PHP pointant vers le dossier public de Symfony
CMD ["php", "-S", "0.0.0.0:8000", "-t", "public"]