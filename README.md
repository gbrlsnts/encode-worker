## Description

The encode worker is based on NestJS and its purpose is to encode any media file to a desired format.

It is connected to a BullMQ queue, fed by another NestJS instance which creates the jobs from user input. Each created job represents one output format while the API is able to create multiple jobs, according to the desired outputs.

This is an hobby project which I decided to turn public and will be working when I have free time, so don't expect it to be near production-ready (yet).

**While I'm not happy with the end result, all development will be on master only.**

This is part of a bundle:

- API (not public yet)
- Worker
- Chunking service (Todo; think of it like a map-reduce)

## Roadmap

- &#9745; Basic video encoding
- &#9745; Report back encoding progress
- &#9745; Support S3, FTP, HTTP sources/destinations
- &#9744; Audio-only encoding
- &#9744; Hardware acceleration
- &#9744; Advanced video formats
- &#9744; Docker
- &#9744; Add proper test coverage (yes, I know...)

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## License

This project is [MIT licensed](LICENSE).
