[![Codacy Badge](https://app.codacy.com/project/badge/Grade/81b64f43874e40b192556cc626214a98)](https://www.codacy.com/gh/Universalis-FFXIV/mogboard-next/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=Universalis-FFXIV/mogboard-next&amp;utm_campaign=Badge_Grade)

# mogboard-next
Mogboard, the frontend for the [Universalis](https://github.com/Universalis-FFXIV/Universalis) crowdsourced market data API.

## Acknowledgements
Mogboard was originally written by Vekien, and its original source code can be found [here](https://github.com/xivapi/mogboard). With his permission, we borrowed Mogboard as a frontend for Universalis after Mogboard became defunct in August 2019. We have since rewritten the website from the ground up to better suit our needs. The existing version of the website would not have been possible without Vekien's work on Mogboard.

## Development

### Getting started
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
| `DATABASE_CONN`         | Database maximum connections.                       | 2-4x your number of CPU cores.                                                                                                                                  |
| `LODESTONE_API`         | Lodestone scraper API address.                      | `https://lodestone.universalis.app`                                                                                                                             |