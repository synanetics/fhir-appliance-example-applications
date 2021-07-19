/*
 * File: /services/adapters/ui.services.get.js
 * Project: ward-watcher
 * Created Date: Sunday July 18th 2021
 * Author: Rob Organ
 * -----
 * Last Modified: Monday July 19th 2021 11:03:11 am
 * Modified By: Rob Organ
 * -----
 * Copyright (c) 2021 Synanetics Ltd
 * MIT License
 */

"use strict";

const UIServiceAdapter = require("./mixins/ui.service.adapter.mixin");
const ServiceAdapter = require("./mixins/service.adapter.mixin");

module.exports = {
    name: "ui.sites",
    mixins: [UIServiceAdapter, ServiceAdapter],
    actions: {
        async get(ctx) {
            //Fetch totals by site for St. Mungos
            const { serviceProviderId } = ctx.params.data;
            const totals = await ctx.call("encounters.getEncounterTotalsGroupedBySite", {
                search: { organization: `Organization/${serviceProviderId}` },
            });
            //Return the view for rendering
            return { view: "sites", data: { serviceProvider: serviceProviderId, totals } };
        },
    },
};
