/*
 * File: /services/mixins/fhir.client.mixin.js
 * Project: ward-watcher
 * Created Date: Friday July 16th 2021
 * Author: Rob Organ
 * -----
 * Last Modified: Sunday July 18th 2021 8:31:02 pm
 * Modified By: Rob Organ
 * -----
 * Copyright (c) 2021 Synanetics Ltd
 * MIT License
 */

//Node modules
const fs = require("fs");
const got = require("got");

module.exports = {
    name: "fhir.client.mixin",
    settings: {
        interactionHttpMethods: {
            create: "_post",
            search: "_get",
            read: "_get",
            update: "_put",
            delete: "_delete",
        },
    },
    hooks: {
        before: {
            "*": async function (ctx) {
                /**
                 * Build and execute a fhir request from service configuration and ctx.params (arguments)
                 * 1. Construct barebones request including https opts for mutual tls
                 * 2. Construct url
                 * 3. Set request body (if create or update)
                 * 4. Execute request and set ctx.locals.fhir.data to result
                 */
                //Initialise fhir response
                ctx.locals.fhir = {};
                //1
                const { interaction } = this.settings.fhir[ctx.action.rawName];
                const method = this.settings.interactionHttpMethods[interaction];
                const fhirRequest = {
                    method: method.substr(method.indexOf("_") + 1),
                    retry: 0,
                    timeout: 60000,
                    throwHttpErrors: false,
                    headers: {
                        authorization: `Bearer ${ctx.locals.token}`, //token is set by jwt client and will be present in ctx.locals
                        accept: "application/fhir+json",
                        "content-type": "application/fhir+json",
                    },
                    https: {
                        rejectUnauthorized: !!(
                            process.env.APP_FHIR_APPLIANCE_VERIFY_CERTIFICATES && process.env.APP_FHIR_APPLIANCE_VERIFY_CERTIFICATES.toLowerCase() === "true"
                        ),
                        key: this.settings.tls.key,
                        certificate: this.settings.tls.certificate,
                        certificateAuthority: this.settings.tls.ca,
                    },
                    resolveBodyOnly: true,
                    responseType: "json",
                };
                //2 Construct the url and either the query string (for searches) and resource id (read, update, delete)
                let url = `${process.env.APP_FHIR_APPLIANCE_HOST}:${process.env.APP_FHIR_APPLIANCE_PORT}/${process.env.APP_FHIR_APPLIANCE_PATH}/${this.settings.fhir.resourceType}`;
                if (interaction === "search") {
                    //Extract parameters from ctx.params
                    const { search } = ctx.params;
                    let queryString = "";
                    for (const param in search) {
                        queryString = `${queryString}&${param}=${search[param]}`;
                    }
                    url = `${url}?${queryString}`;
                } else if (["read", "update", "delete"].includes(interaction.toLowerCase())) {
                    const { resourceId } = ctx.params;
                    url = `${url}/${resourceId}`;
                }
                //3 If interaction is an update or create then extract the body
                if (["create", "update"].includes(interaction.toLowerCase())) {
                    const { resource } = ctx.params;
                    fhirRequest.opt.json = resource;
                }
                ctx.locals.fhir.request = fhirRequest;
                //4 Execute the request based on the interaction type
                ctx.locals.fhir.response = await got(url, fhirRequest);
            },
        },
    },
    async started(ctx) {
        //Read in client certs
        this.settings.tls = {};
        this.settings.tls.certificate = fs.readFileSync(process.env.APP_FHIR_APPLIANCE_AUTH_MUTAL_TLS_CLIENT_CERTIFICATE).toString("utf-8");
        this.settings.tls.key = fs.readFileSync(process.env.APP_FHIR_APPLIANCE_AUTH_MUTAL_TLS_CLIENT_CERTIFICATE_KEY).toString("utf-8");
        this.settings.tls.ca = fs.readFileSync(process.env.APP_FHIR_APPLIANCE_AUTH_MUTAL_TLS_CLIENT_ROOT_CA).toString("utf-8");
    },
};
