/*
 * File: /services/mixins/jwt.client.mixin.js
 * Project: ward-watcher
 * Created Date: Friday July 16th 2021
 * Author: Rob Organ
 * -----
 * Last Modified: Friday July 16th 2021 12:58:14 pm
 * Modified By: Rob Organ
 * -----
 * Copyright (c) 2021 Synanetics Ltd
 * MIT License
 */

"use strict";

//Node Modules
const { cloneDeep } = require("lodash");
const fs = require("fs");
const uuid = require("uuid");
const jwt = require("jsonwebtoken");

module.exports = {
    name: "jwt.client.mixin",
    settings: { JWT: {} },
    hooks: {
        before: {
            "*": function (ctx) {
                const payload = cloneDeep(JSON.parse(this.settings.JWT.ASSERTION));
                payload.iss = this.settings.JWT.CLIENT_ID;
                payload.exp = Math.floor(Date.now() / 1000) + 3600;
                payload.iat = Math.floor(Date.now() / 1000);
                payload.jti = uuid.v4();
                payload.ods = process.env.APP_NHS_ORGANIZATION_ODS_CODE;
                payload.usr.org = process.env.APP_NHS_ORGANIZATION_ODS_CODE;
                //Sign assertion/payload
                const jwtSigningKey = fs.readFileSync(process.env.APP_FHIR_APPLIANCE_AUTH_JWT_SIGNING_KEY).toString("utf-8");
                //Set ctx.locals.token so that action methods can use
                ctx.locals.token = jwt.sign(payload, jwtSigningKey, { algorithm: this.settings.JWT.ALGORITHM });
            },
        },
    },
    async created() {
        this.settings.JWT.CLIENT_ID = uuid.v4();
        this.settings.JWT.ALGORITHM = "RS256";
        this.settings.JWT.GRANT_TYPE = "urn:ietf:params:oauth:grant-type:jwt-bearer";
        this.settings.JWT.KID = "YHCR_DEV";
        this.settings.JWT.ASSERTION =
            '{"iss":"","scope":"fhir.*","aud":"IAM","ods":"","sub":"regional-exchange","rsn":"3","usr":{"rol":"4","org":""},"exp":"","iat":"","jti":""}';
    },
};
