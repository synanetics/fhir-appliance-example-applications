/*
 * File: /services/adapters/ui.encounters.service.js
 * Project: ward-watcher
 * Created Date: Sunday July 18th 2021
 * Author: Rob Organ
 * -----
 * Last Modified: Monday July 19th 2021 10:48:39 am
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
            const { encounterId } = ctx.params.data;
            const encounter = await ctx.call("encounters.getEncounterDetails", {
                search: { encounterId },
            });
            //Return the view for rendering
            return { view: "encounter", data: { encounter } };
        },
    },
};
