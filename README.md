# MatchMiner UI

## Table of Contents
- [Introduction](#introduction)
- [Clinical Trials](#clinical-trials)
- [User roles](#user-roles)
  - [Admin](#user-role-admin)
  - [Clinical Trial Investigator](#user-role-cti)
  - [Oncologist](#user-role-oncologist)
- [Setup MatchMiner](#setup-matchminer)
- [Deploying MatchMiner](#deploy-matchminer)
- [Contributing](../blob/master/CONTRIBUTING.md)
- [License](../blob/master/LICENSE)

## <a name="introduction"></a>Introduction
MatchMiner UI is a front end implementation written in Angular 1.x with a partial Material Design design philosophy and gives access to data calculated by the MatchMiner Engine using the MatchMiner API.
Designed to be intuitive and keeping user-friendliness in mind, users are able to perform prospective patient matching using genomic filters and immediately
see clinical trial patient matches based on the genomic profile and demographic information derived from one or more tumor screening panels (Oncopanels).

#### <a name="clinical-trials"></a>Clinical Trials
Data managers and curators are able to add Clinical Trials to MatchMiner using a structured YAML format which are in turn are available in the UI. Clinical Trials are designed to be a public resource meaning that no authentication is required before a visitor can access it.

#### <a name="user-authentication"></a>User Authentication
Currently MatchMiner uses a federated SAML authentication method to register and authorize users to gain access to the system. The codebase has been setup in a flexible manner so that integrating additional authentication methods should be relatively easy.  

### <a name="user-roles"></a>User roles
MatchMiner supports several user role levels which will allow for granular access control in what the users get to see and what actions they can perform. See the list of user access levels below.

##### <a name="user-role-admin"></a>Admin
The 'Admin' user role is the most unrestricted role available in MatchMiner. Admin users will have the ability to create the trial centric genomic filters and review the patient matches, view the patient records and their trial matches, search for patients and search and view all clinical trials.

##### <a name="user-role-cti"></a>Clinical Trial Investigator
By creating **genomic filters** Clinical Trial Investigators can use genomic (Gene, protein change, transcript exon and various mutation types) and demographic (tumor type, gender, age)
criteria to create a set of patient matches. Throughout the genomic filter setup process the user is presented with visualizations of the  gain insight in accrual rates based on historical data
and current number of matches based on the selected criteria.

##### <a name="user-role-oncologist"></a>Oncologist
For Oncologists it is important that they are able to search for their patients, review them and view the matches they have with any registered clinical trials.

## <a name="developing-matchminer"></a>Developing MatchMiner
Before the UI can be started (in a development or production environment) the dependencies will have to be installed.

MatchMiner UI has been setup with a hot reloading build automated development environment. A development server called BrowserSync is used to detect any changes in the html, javascript and css files and will reload the open sockets in the browser automatically.

First download and install the toolset and bower library dependencies.

    npm install && bower install

Second run the tests to see if everything still works.

    gulp test


If you do not have SSL certificates you would like to use you can, generate them:
```
  mkdir -p ../certificates
  openssl genrsa 2048 > ../certificates/matchminer.key
  chmod 400 ../certificates/matchminer.key
  openssl req -new -x509 -nodes -sha256 -days 365 -key ../certificates/matchminer.key -out ../certificates/matchminer.crt -subj "/C=US/ST=CA/L=MyCity/O=MyCompany/OU=ACC/CN=myemail@someemailprovider.com"
```

After all these steps you can start the hot reloading development server

    gulp serve
    
In order to devlop features which are behind the login, a dev user must be inserted into the database with the credentials found in config.json
This is an example:

```
db.user.insertOne({
    "_id": ObjectId("577cf6ef2b9920002cef0337"),
	"last_name" : "Doe",
	"teams" : [
		ObjectId("5a8ede8f4e0cce002dd5913c")
	],
	"_updated" : ISODate("2018-02-22T10:15:27.000-05:00"),
	"first_name" : "John",
	"roles" : [
		"user",
		"cti",
		"oncologist",
		"admin"
	],
	"title" : "",
	"email" : "fake_email@dfci.harvard.edu",
	"_created" : ISODate("2018-02-22T10:15:27.000-05:00"),
	"user_name" : "du123",
	"token" : "fb4d6830-d3aa-481b-bcd6-270d69790e11",
	"oncore_token" : "5f3c2421-271c-41ba-ac14-899f214d49b9"
})
```

## <a name="setup-matchminer"></a>Building MatchMiner UI
_Several tasks have been built into the build automation system gulp to help with preparing and packaging the required code._

#### Important
Prior to building MatchMiner the respective properties in the 'properties/config.json' will have to be set.
Please click [here](mm-properties-setup) to read up on what the property configuration expects.

#### Gulp tasks and environments
As mentioned before gulp has several tasks to aid in the process of development and deploying.
Any gulp task can be run by argumenting the desired task to gulp itself i.e. 'gulp build'

The most useful tasks are:
- serve (setup a live reloading development environment which detects changes)
- test (run the defined jasmine tests with the karma test runner)
- build (create folder containing all preprocessed files ready to be used in production).

An additional argument can be given to gulp which defines the environment, or set of property variables, that has to be used for that specific task.
These are read from the 'properties/config.json' file and can be argumented to gulp by defining '--env {environment}' where the environment is one of the following variables:

- development (selected by default)
- test (test runner environment)
- production (build environment)

An example of preparing MatchMiner for production would be `gulp --env production build`

## Configuring MatchMiner UI
MatchMiner UI has several profiles which it uses for configuration. These can be found in `properties/config.json`.


| Property           	| Description                                                                                                                                                                                                                                                                                              	| Example                                                                   	|
|--------------------	|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------	|---------------------------------------------------------------------------	|
| name               	| Name of the profile                                                                                                                                                                                                                                                                                      	| `development, staging, production`                                        	|
| **elasticsearch**  	|                                                                                                                                                                                                                                                                                                          	|                                                                           	|
| host               	| The ElasticSearch host URL                                                                                                                                                                                                                                                                               	| `http://myelasticsearchserver.com:9200`                                   	|
| proxy              	| The ElasticSearch development proxy URL. Only used for BrowserSync in the development profile. To ensure correct connections use the external IP of the server the UI is running on. This path should be postfixed with `/elasticsearch` which will be stripped off by the BrowserSync proxy middleware 	| `http://192.168.0.1:8001/elasticsearch`                                   	|
| index              	| The ElasticSearch index                                                                                                                                                                                                                                                                                  	| `matchminer`                                                              	|
| **api**            	|                                                                                                                                                                                                                                                                                                          	|                                                                           	|
| host               	| The MatchMiner API host URL                                                                                                                                                                                                                                                                              	| `https://mymatchminerapi.com`                                             	|
| endpoint           	| The MatchMiner UI endpoint for API resources. With the development environment this serves as a proxy path which is redirected to the `ENV.api.host` url. In staging or production environments this should be a fully qualified path to the API endpoint                                                	| `development:` /api `staging/production:` https://mymatchminerapi.com/api 	|
| samlAuthentication 	| Should SAML authentication be used                                                                                                                                                                                                                                                                       	| `true / false`                                                            	|
| **devUser**        	|                                                                                                                                                                                                                                                                                                          	|                                                                           	|
| token              	| Credential token for a development user available in the API database. <br /> **DO NOT USE IN PRODUCTION.**                                                                                                                                                                                                  	| `fb4dd28s0-d3aa-481b-bcd6-270hhs8s90e11`                                  	|
| user_id            	| Credential user ID for the development user. <br /> **DO NOT USE IN PRODUCTION.**                                                                                                                                                                                                                            	| `577cf6ef2b8192642cef0337`                                                	|
| **certificate**    	|                                                                                                                                                                                                                                                                                                          	|                                                                           	|
| key                	| Relative path to the SSL certificate key to setup a secure connection to the API                                                                                                                                                                                                                         	| `../certificates/matchminer.key`                                          	|
| cert               	| Relative path to the SSL certificate                                                                                                                                                                                                                                                                     	| `../certificates/matchminer.crt`                                          	|
| **sessionTimeout** 	|                                                                                                                                                                                                                                                                                                          	|                                                                           	|
| idleAllowed        	| Number of seconds of allowed idle time before a session in invalidated                                                                                                                                                                                                                                   	| `2700`                                                                    	|
| idleCountdown      	| Number of seconds that the timeout notification is shown to the user telling them that an action is required to reset the session timeout                                                                                                                                                                	| `30`                                                                      	|
| **tracking**       	|                                                                                                                                                                                                                                                                                                          	|                                                                           	|
| piwik_site_id      	| The Piwik tracking site ID to track user behaviour in MatchMiner                                                                                                                                                                                                                                         	| `1`                                                                       	|
| slsUrl             	| The SAML authentication endpoint URL that the user should be redirected to for login                                                                                                                                                                                                                     	| `https://saml-portal.com/redirect.aspx?target=MatchMiner`                 	|
| **resources**      	|                                                                                                                                                                                                                                                                                                          	|                                                                           	|
| oncopro_base       	| The external URL of an OncPro instance used for protocol lookups. Used in the Clinical Trial details page as an external resource. This URL will be postfixed with the protocol ID of the clinical trial.                                                                                                	| `https://trialportal.myresource.com/protocols.asp?protid=`                	|
| ctgov_base         	| The external URL of the ClinicalTrials.gov website. This URL will be postfixed with the protocol ID of the clinical trial.                                                                                                                                                                               	| `https://clinicaltrials.gov/ct2/show/`                                    	|
| **ui**      	|                                                                                                                                                                                                                                                                                                          	|                                                                           	|
| logo       	| Should point to an image file which will be placed in upper left hand corner of the site e.g. DFCI.jpg                                                                                                	| `https://trialportal.myresource.com/protocols.asp?protid=`                	|
| institution         	| The name of the hosting institution e.g. 'DFCI'                                                                                                                                                                               	| `https://clinicaltrials.gov/ct2/show/`                                    	|
| accessRequestFormLink         	| A link to a google form which may be used to control access to the application.                                                                                                                                                                               	| `https://google_form_url.com`                                    	|


## Deploying MatchMiner UI
After building the MatchMiner UI with the `gulp --env production build` command, a new `dist/` folder will have been generated with the production optimized version of MatchMiner. This includes .js minification, uglification, .html template caching libraries and revision versioning. 

The contents of this folder can be deployed in a webserver folder.

## Built with
* node@v10.16.0 
* npm
* Bower
* AngularJS
* Gulp@v3.9.1
* Karma
