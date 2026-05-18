FROM nginx:alpine
COPY dist/task-manager-frontend/browser /usr/share/nginx/html
EXPOSE 80