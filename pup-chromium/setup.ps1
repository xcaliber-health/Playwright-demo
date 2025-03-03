docker build -t server . 
docker run -p 3000:3000 -p 8080:8080 -p 5900:5900 server