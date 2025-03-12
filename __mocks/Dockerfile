# Utiliser l'image Nginx officielle
FROM nginx:alpine

# Copier la configuration personnalisée de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copier le fichier HTML dans le dossier de Nginx
COPY approved_document.html /usr/share/nginx/html/

# Exposer le port 80 pour accéder au site
EXPOSE 80

# Démarrer Nginx en mode foreground
CMD ["nginx", "-g", "daemon off;"]
