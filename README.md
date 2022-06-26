# mogboard-next

## Getting started
```bash
cd devenv
docker-compose up -d
cd ..
yarn dev
```

### Environment variables
| Name                    | Description                                         | Recommended development value                                                                                                                                   |
| ----------------------- | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `APP_ENV`               | Makes the favicon red when not set to `prod`.       | `dev`                                                                                                                                                           |
| `DISCORD_CLIENT_ID`     | Discord application client ID, used for OAuth2.     | Create a Discord Application, register `http://localhost:3000/api/auth/callback/discord` as an OAuth2 callback URL, and paste the application's client ID here. |
| `DISCORD_CLIENT_SECRET` | Discord application client secret, used for OAuth2. |
| `NEXTAUTH_URL`          | Website base URL.                                   | `http://localhost:3000`                                                                                                                                         |
| `NEXTAUTH_SECRET`       | JWT secret.                                         | Whatever you want, as long as it's not empty.                                                                                                                   |
| `DATABASE_HOST`         | Database server hostname.                           | `localhost`                                                                                                                                                     |
| `DATABASE_PORT`         | Database server port.                               | `4003`                                                                                                                                                          |
| `DATABASE_USER`         | Database user username.                             | `dalamud`                                                                                                                                                       |
| `DATABASE_PASS`         | Database user password.                             | `dalamud`                                                                                                                                                       |
| `DATABASE_NAME`         | Database name.                                      | `dalamud`                                                                                                                                                       |
| `LODESTONE_HOST`        | Lodestone scraper API hostname.                     | `localhost`                                                                                                                                                     |
| `LODESTONE_PORT`        | Lodestone scraper API port.                         | `5022`                                                                                                                                                          |