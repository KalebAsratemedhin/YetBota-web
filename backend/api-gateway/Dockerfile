FROM nginx:1.27-alpine

RUN apk add --no-cache gettext \
  && mkdir -p /var/cache/nginx /var/run/nginx \
  && chown -R nginx:nginx /var/cache/nginx /var/run/nginx

COPY nginx.conf.template /etc/nginx/nginx.conf.template
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["/docker-entrypoint.sh"]
