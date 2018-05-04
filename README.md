# Perficient - TrainingAgreementNew System

build: [![build status] (https://gdcgit.perficient.com/training/TrainingAgreementNew/badges/master/build.svg)](https://gdcgit.perficient.com/training/TrainingAgreementNew/commits/master)
test: [![coverage report] (https://gdcgit.perficient.com/training/TrainingAgreementNew/badges/master/coverage.svg)](https://gdcgit.perficient.com/training/TrainingAgreementNew/commits/master)

=============================

## Vision
    An upgrade version based on old `Traning Agreement System` , fixed issues left over from history, add some NEW exciting features.
    Of course, `More Humanized`, `More Easy To Use` AND `More Values` are the core targets WE always purshuing.

=============================

## Technology
    This application is built on `NodeJS` `Express` `AngularJS` `JQuery` `MongoDB`

=============================

## Usage
    `NOTE` NodeJS & MongDB must be installed in your local machine with appropriately configured.

    Once you get the package file of this application, you can start it with shell command
    `npm start`

=============================

## Port
    - `3000` is the web server's port. In most case, use the url `http://localhost:3000` to access TrainingAgreementNew system.

=============================

## VOLUME

    - `bin/conf/conf.properties` is the main configuration file.

    You can configure the following:

        authentication = CAS
        cas_url = https://gdccas.perficient.com
        mongodb_host = mongo
        mongodb_port = 27017

    - `config/DBConfig.js` is used to configure MongoDB connection.

    You can configure the following:

        mongoose.connect('mongodb://127.0.0.1:27017/test');
