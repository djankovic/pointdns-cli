# pointdns-cli

An interactive or non-interactive CLI app for managing your PointDNS zones and records in bulk.

[![npm version](https://badge.fury.io/js/pointdns-cli.svg)](https://badge.fury.io/js/pointdns-cli)

## Install

```sh
npm i -g pointdns-cli
```

## Usage

Most command parameters will, if omitted, be requested interactively.

### Credentials

Managing zones and records requires an API token available on the [PointDNS profile page](https://app.pointhq.com/profile).

**Credentials are saved as plain text** in `$XDG_CONFIG_HOME/configstore/pointdns-cli.json`. Feel free to submit an issue if you require some form of encryption.

#### Listing credentials

> While API tokens are currently saved as plain text, they will be omitted from the credential listing.

> The current default credentials will be marked with a tick symbol.

```sh
pdns credentials list
```

#### Adding credentials

> First added credentials will be set as default automatically.

```sh
pdns credentials add [username] [apitoken]
```

#### Setting default credentials

> Default credentials are used for all zone and record management commands.

```sh
pdns credentials set [username]
```

#### Removing credentials

> Deleting a default credentials will automatically set the first available credentials as default.

```sh
pdns credentials remove [username]
```

### Zones

#### Listing zones

```sh
pdns zones list
```

#### Adding a zone

> Coming soon

#### Bulk adding zones

> Coming soon

#### Deleting zones

> This command only works interactively.

```sh
pdns zones delete
```

### Records

#### Listing records

```sh
pdns records list [zone]
```

#### Adding records

> Coming soon

#### Bulk adding records

> Coming soon

#### Deleting records

> This command only works interactively.

```sh
pdns records delete [zone]
```

## Contributing

Pull requests and issues are very much welcome.

This project adheres to the [Javascript Standard Style](https://standardjs.com/).

## License

Apache License 2.0

