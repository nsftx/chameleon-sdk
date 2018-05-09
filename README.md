[![CircleCI](https://circleci.com/gh/chmjs/chameleon-sdk/tree/master.svg?style=shield)](https://circleci.com/gh/chmjs/chameleon-sdk/tree/master)
[![Build Status](https://travis-ci.org/chmjs/chameleon-sdk.svg?branch=master)](https://travis-ci.org/chmjs/chameleon-sdk) 
[![codebeat badge](https://codebeat.co/badges/690f689b-87eb-42f4-a656-cc3400ac3c0d)](https://codebeat.co/projects/github-com-chmjs-chameleon-sdk-master)
[![codecov](https://codecov.io/gh/chmjs/chameleon-sdk/branch/master/graph/badge.svg)](https://codecov.io/gh/chmjs/chameleon-sdk)
[![npm](https://img.shields.io/npm/v/@nsoft/chameleon-sdk.svg)](https://www.npmjs.com/package/@nsoft/chameleon-sdk) 

# chameleon-sdk
Chameleon Software Development Kit is a package for rapid development of Chameleon bundles. It also serves as an integral part of Chameleon Builder. This package is already used if you use [chameleon-bundle](https://github.com/chmjs/chameleon-bundle) for scaffolding bundle projects.

## Installing

The preferred way to install the Chameleon SDK for is to use the [npm](http://npmjs.org) package manager. Simply type the following into a terminal window:

```sh
npm install @nsoft/chameleon-sdk
```

## Modules

### API

This module contains implemented data connectors. These connectors are used by `sourceable` mixin to load local and remote data. Currently we support only internal connectors to Chameleon and Ride infrastructure. Also, we have `local` connector that loads dummy data which can be used in local development of bundle.

### Mixins

Apply mixins to get out of the box functionality for bundle and interaction with Chameleon Builder. Basic mixin is `elementable` and each element in bundle should apply it. Some other mixins depend on `elementable` mixin.

- `elementable`: Basic mixin for all elements used in Builder
- `bindable`: Adds support for dynamic value binding of options
- `dependable`: Lazy loads external dependencies like Quill, GoogleMaps API, etc.
- `reactionable`: Adds support for Chameleon reaction system
- `sourceable`: Add helper methods for loading local and remote data sources

### Utility

Module for commom utility functions that are used internally or can be used in third-party bundle:

- `localStorage`: Writing and reading data from localStorage
