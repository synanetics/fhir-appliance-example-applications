/*
 * File: /services/adapters/ui.encounters.service.js
 * Project: ward-watcher
 * Created Date: Sunday July 18th 2021
 * Author: Rob Organ
 * -----
 * Last Modified: Sunday July 18th 2021 9:37:07 pm
 * Modified By: Rob Organ
 * -----
 * Copyright (c) 2021 Synanetics Ltd
 * MIT License
 */

"use strict";

const UIServiceAdapter = require("./mixins/ui.service.adapter.mixin");
const ServiceAdapter = require("./mixins/service.adapter.mixin");

module.exports = {
    name: "ui.encounters",
    mixins: [UIServiceAdapter, ServiceAdapter],
    actions: {
        async get(ctx) {
            //Fetch totals by site for St. Mungos

            //Return the view for rendering
            return { view: "encounter", data: {} };
        },
    },
};
