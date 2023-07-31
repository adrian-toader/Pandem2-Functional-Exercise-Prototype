# Pandem2 Prototype-1 API

## Configuration

Project configuration settings need to be specified in the config.json under the dist/config directory.
An example for this configuration file can be found in their related .default file, which can be used as a startup for the actual configuration.

Required properties are marked with `*`.

### `config.json`

- serviceName`*` - Name of the service. API "Server" response header will contain this value
- server`*` - Server configuration
    - hostname`*` - Hostname on which the server will accept requests ("::" value allows connections on any hostname)
    - port`*` - Port on which the server will accept requests
    - apiRoot`*` - Prefix for all API endpoints
    - cors - Cross-Origin Resource Sharing configuration (CORS is disabled by default)
        - enabled - Flag specifying whether CORS is enabled
        - allowOrigins - Array containing allowed origins
        - allowHeaders - Array containing allowed headers
- logging`*` - Logging options (stdout logging is enabled by default)
    - level`*` - Logging level as described [here](https://github.com/winstonjs/winston#logging-levels)
    - fileTransport - Container for logger file transport options (file logging is disabled by default)
        - enabled - Flag specifying whether log messages should be captured in files inside the "logs" directory
        - maxSize - Maximum size in bytes of a log file (required`*` when fileTransport is enabled)
        - maxFiles - Maximum number of files to be used for log rotation (required`*` when fileTransport is enabled)
    - trimRequestResponse - Container for trimming request/response log messages options
        - enabled - Flag specifying whether request/response log messages should trimmed to a maximum length
        - maxLength - Maximum length for request/response information in log messages (required`*` when trimRequestResponse is enabled)
- bcrypt`*` - Bcrypt options
    - saltRounds`*` - bcrypt salt rounds number
- jwt`*` - JWT generation options
    - expirationSeconds`*` - Generated JWT token availability period
    - secret `*` - Secret used for signing generated JWT tokens. Details [here](https://www.npmjs.com/package/jsonwebtoken#jwtsignpayload-secretorprivatekey-options-callback)
- mongodb`*` - MongoDB database connection options
    - uri`*` - URI of the MongoDB server
    - dbName`*` - Database name

## Accessing the API documentation

To access the API documentation access the following path:
- ${SERVER_URL}/${API_ROOT}/api-documentation

## Loading Data into DB

### Setting up the first admin user

To create/update the admin user, run the following command:

``` sh
$ npm run initAdminUser -- --email={myEmail} --password={myPassword}
```
Note: The admin email and password can also be retrieved from the "ADMIN_EMAIL" and "ADMIN_PASSWORD" environment variables when the "--email" or "--password" options are omitted.


### Load NUTS Data
NUTS data required for the map is currently stored in files under src/resources/nuts. To load the data into the database, 
you will need to send a POST request to ${SERVER_URL}/api/data/nuts. The request should contain a JSON object with the 
property named "type" and the value for this property should be the name of the file to load.

### Generate dummy data
Each resource type has an API exposed to generate dummy data. This API follows the following convention:

URL: ${SERVER_URL}/${API_ROOT}/${DATA_TYPE}/generate-dummy

For more info about these APIs, please check the API documentation.
