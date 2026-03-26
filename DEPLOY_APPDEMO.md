# Deploy appdemo.thinkcollegelevel.com

## 1) DNS
Create an `A` record:
- Host: `appdemo`
- Value: `<your server public IP>`

## 2) App env
```bash
cp .env.production.example .env
# then edit .env with real secrets
```

## 3) Build and run app
```bash
npm install
npx prisma generate
npx prisma db push
npm run build
$env:PORT=3000
pm2 start npm --name edutech-demo -- start
pm2 save
```

The production start script listens on `PORT`. For this VPS setup, use `PORT=3000` and proxy to that port.

## 4) TLS + domain reverse proxy
Install nginx (if not installed), then use this server block:

```nginx
server {
  server_name appdemo.thinkcollegelevel.com;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

Then issue cert:
```bash
certbot --nginx -d appdemo.thinkcollegelevel.com
```
