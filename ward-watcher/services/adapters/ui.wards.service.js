/*
 * File: /services/adapters/ui.wards.service.js
 * Project: ward-watcher
 * Created Date: Sunday July 18th 2021
 * Author: Rob Organ
 * -----
 * Last Modified: Sunday July 18th 2021 8:34:36 pm
 * Modified By: Rob Organ
 * -----
 * Copyright (c) 2021 Synanetics Ltd
 * MIT License
 */

"use strict";

const UIServiceAdapter = require("./mixins/ui.service.adapter.mixin");
const ServiceAdapter = require("./mixins/service.adapter.mixin");

module.exports = {
    name: "ui.wards",
    mixins: [UIServiceAdapter, ServiceAdapter],
    actions: {
        async get(ctx) {
            //Fetch totals by site for St. Mungos
            const { serviceProviderId, siteId, wardId } = ctx.params.data;
            const data = {
                serviceProvider: serviceProviderId,
                site: siteId,
            };
            if (!wardId) {
                data.totals = await ctx.call("encounters.getEncounterTotalsGroupedBySiteAndWard", {
                    search: { location: `Location/${siteId}`, status: "in-progress" },
                });
            } else {
                //Fetch all the encounters for the given ward
                data.ward = wardId;
                data.encounters = await ctx.call("encounters.getEncountersByWard", {
                    search: { location: `Location/${wardId}`, status: "in-progress" },
                });
            }
            //Return the view for rendering
            return { view: "wards", data };
        },
    },
};
