/**
 * Service for the filter resource
 */
'use strict';

angular.module('matchminerUiApp')
    .factory('EmailsREST',
        ['$http', '$resource', 'ENV',
            function ($http, $resource, ENV) {
                return $resource(ENV.api.endpoint + '/eap_email', {
                    'email_address': '@email_address'
                }, {
                    'post': {
                        method: 'POST',
                        isArray: false
                    }
                });
            }
        ]);
