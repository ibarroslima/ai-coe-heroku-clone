# AI LATAM CoE - Heroku

Replica funcional de catalogo com:
- listagem de casos
- cadastro de novos casos
- busca por texto
- favorito/desfavorito
- login de administrador
- edicao/exclusao de casos
- upload de imagem por caso

## Rodar local

```bash
cd "/Users/ibarroslima/ai-coe-heroku-clone"
npm install
npm start
```

Abra `http://localhost:3000`.

Sem `DATABASE_URL`, roda em memoria (nao persiste ao reiniciar).

## Deploy no Heroku

1. Instale e autentique Heroku CLI
2. Execute:

```bash
cd "/Users/ibarroslima/ai-coe-heroku-clone"
git init
git add .
git commit -m "Initial AI CoE catalog app"
git branch -M main
heroku create
heroku addons:create heroku-postgresql:mini
heroku config:set ADMIN_PASSWORD="troque-esta-senha"
heroku config:set SESSION_SECRET="$(openssl rand -hex 32)"
git push heroku main
heroku open
```

O app usa `DATABASE_URL` automaticamente em producao.
