# Mockingbird

[![GoDoc Widget]][GoDoc] [![CII Best Practices](https://bestpractices.coreinfrastructure.org/projects/569/badge)](https://bestpractices.coreinfrastructure.org/projects/569)

<img src="https://github.com/kubernetes/kubernetes/raw/master/logo/logo.png" width="100">

----

Mockingbird is an open source distributed and programmable fault simulation mocking service.

It provides an extensible set of middleware layers that enable the simulation of
variety of different service faults. The primary purpose of the framework is to
allow consumers to test the way they handle services that exhibit uncertainty and
instability.

Mockingbird is built so that it can be used as an [NPM] package. It can also be
used as a stand-alone `cli` as well as part of a [Serverless] ecosystem by deploying
it using `serverless framework`.

The current version supports adding new simulation layers. Future version will allow for
extension of exhisting layers through extnesion of `classes` and `interfaces`.

----
## Mockingbird simulation layers
Mockingbird comes with a number of simulation middleware layers. As HTTP requests are
traversed through the different layers, a probability of fault occurence is calculated.

You have the option to control the probability of failure, from `0.0` (no failure) to
`1.0` (absolute failure).

Below are the layers currently supported by the framework.

### Body fault simulation

#### Random content type

#### Random property remove

### Header fault simulation

#### Inject extra headers

#### Inject random headers

#### Permutate headers

### Delay fault simulation

#### Fixed delay

#### Uniform delay
TBA

#### Lognormal delay
TBA

#### Chunk dribble delay
TBA

### Connection fault simulation

#### Connection reset by peer

#### Empty response

## To start using Mockingbird as a stand-alone cli

## To run Mockingbird as a Serverless app

## To start developing Mockingbird using the npm package

The [community repository] hosts all information about
building Kubernetes from source, how to contribute code
and documentation, who to contact about what, etc.

If you want to build Kubernetes right away there are two options:

##### You have a working [Go environment].

```

```

##### You have a working [Docker environment].

```

```


## Support

If you need support, please ping me on [LinkedIn],
and I will try and get back to you asap :)


[NPM]: https://www.npmjs.com/
[Serverless]: https://serverless.com/
[LinkedIn]: https://www.linkedin.com/in/sasasavic/