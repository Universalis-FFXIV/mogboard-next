# Deployment
To clone this folder independently, run the following commands:
```sh
mkdir mogboard-next
cd mogboard-next
git init
git remote add origin https://github.com/Universalis-FFXIV/mogboard-next
git fetch origin
git checkout origin/main -- deployment
```

To update this folder, run the following commands in the root of the git repository:
```sh
git fetch
git reset --hard
git checkout origin/main -- deployment
```

## NGINX
The application is configured with compression disabled. This is intentional; it is up to the egress to determine
what the appropriate compression settings are for each type of resource. Ensure that these settings are appropriately
configured on the host.