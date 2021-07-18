/*
 * File: /services/mixins/db.mssql.adapter.mixin.js
 * Project: fhir-control
 * Created Date: Sunday June 20th 2021
 * Author: Rob Organ
 * -----
 * Last Modified: Friday July 16th 2021 9:22:15 am
 * Modified By: Rob Organ
 * -----
 * Copyright (c) 2021 Synanetics Ltd
 * MIT License
 */

"use strict";

const SqlAdapter = require("moleculer-db-adapter-sequelize");

module.exports = {
    name: "mssql.db.adapter",
    adapter: new SqlAdapter(process.env.APP_DATABASE_DATABASE_NAME, process.env.APP_DATABASE_USERNAME, process.env.APP_DATABASE_PASSWORD, {
        host: process.env.APP_DATABASE_HOST ?? "localhost",
        port: process.env.APP_DATABASE_PORT ?? 1433,
        dialect: "mssql",
    }),
};
