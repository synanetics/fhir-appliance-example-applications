/*
 * File: /services/adapters/ui.home.service.js
 * Project: ward-watcher
 * Created Date: Thursday July 15th 2021
 * Author: Rob Organ
 * -----
 * Last Modified: Monday July 19th 2021 11:05:00 am
 * Modified By: Rob Organ
 * -----
 * Copyright (c) 2021 Synanetics Ltd
 * MIT License
 */

"use strict";

const UIServiceAdapter = require("./mixins/ui.service.adapter.mixin");
const ServiceAdapter = require("./mixins/service.adapter.mixin");

module.exports = {
    name: "ui.home",
    mixins: [UIServiceAdapter, ServiceAdapter],
    actions: {
        async get(ctx) {
            //Fetch totals by site for St. Mungos
            const totals = await ctx.call("encounters.getEncounterTotalsGroupedByServiceProvider");
            //Return the view for rendering
            return { view: "home", data: { totals } };
        },
    },
};
