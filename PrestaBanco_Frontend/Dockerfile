FROM nginx:stable-alpine

COPY dist /usr/share/nginx/html

COPY frontend.conf /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]