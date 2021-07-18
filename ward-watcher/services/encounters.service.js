/*
 * File: /services/ward.service.js
 * Project: ward-watcher
 * Created Date: Friday July 16th 2021
 * Author: Rob Organ
 * -----
 * Last Modified: Sunday July 18th 2021 10:03:34 pm
 * Modified By: Rob Organ
 * -----
 * Copyright (c) 2021 Synanetics Ltd
 * MIT License
 */

"use strict";

//Helpers
const { getReference } = require("../utils/fhir");
//Node modules
const bcrypt = require("bcrypt");
const moment = require("moment-timezone");
//Mixins
const JWTClient = require("./mixins/jwt.client.mixin");
const FHIRClient = require("./mixins/fhir.client.mixin");
//Moleculer modules
const { MoleculerError } = require("moleculer").Errors;

module.exports = {
    name: "encounters",
    mixins: [FHIRClient, JWTClient],
    settings: {
        fhir: {
            resourceType: "Encounter",
            getEncounterTotalsGroupedByServiceProvider: { interaction: "search" },
            getEncounterTotalsGroupedBySite: { interaction: "search" },
            getEncounterTotalsGroupedBySiteAndWard: { interaction: "search" },
            getEncountersByWard: { interaction: "search" },
        },
    },
    actions: {
        async getEncounterTotalsGroupedByServiceProvider(ctx) {
            //FHIR Client will execute the request and attach results to ctx.locals.fhir.data before this action is called
            //In this case, a FHIR search will be executed and a bundle of encounters attached
            const providers = ctx.locals.fhir.response.entry.map((e) => {
                return {
                    reference: e.resource.serviceProvider.reference,
                    display: e.resource.serviceProvider.display,
                };
            });
            //Aggregate the number of patients currently on each ward
            //Acc = accumlator (running total)
            const totals = Object.values(
                providers.reduce((acc, provider) => {
                    if (!acc[provider.reference]) {
                        acc[provider.reference] = { id: getReference(provider.reference).id, name: provider.display, total: 1 };
                    } else {
                        acc[provider.reference].total += 1;
                    }
                    return acc;
                }, Object.create(null))
            );
            return totals;
        },
        async getEncounterTotalsGroupedBySite(ctx) {
            //FHIR Client will execute the request and attach results to ctx.locals.fhir.data before this action is called
            //In this case, a FHIR search will be executed and a bundle of encounters attached
            const sites = ctx.locals.fhir.response.entry.map((e) => {
                return {
                    reference: e.resource.location[0].location.reference,
                    display: e.resource.location[0].location.display,
                };
            });
            //Aggregate the number of patients currently on each ward
            //Acc = accumlator (running total)
            const totals = Object.values(
                sites.reduce((acc, site) => {
                    if (!acc[site.reference]) {
                        acc[site.reference] = { id: getReference(site.reference).id, name: site.display, total: 1 };
                    } else {
                        acc[site.reference].total += 1;
                    }
                    return acc;
                }, Object.create(null))
            );
            return totals;
        },
        async getEncounterTotalsGroupedBySiteAndWard(ctx) {
            //FHIR Client will execute the request and attach results to ctx.locals.fhir.data before this action is called
            //In this case, a FHIR search will be executed and a bundle of encounters attached
            //Extract and map ward info from the fhir encounter resource
            const wards = ctx.locals.fhir.response.entry.map((e) => {
                return {
                    reference: e.resource.location[1].location.reference,
                    display: e.resource.location[1].location.display,
                };
            });
            //Aggregate the number of patients currently on each ward
            //Acc = accumlator (running total)
            const totals = Object.values(
                wards.reduce((acc, ward) => {
                    if (!acc[ward.reference]) {
                        acc[ward.reference] = { id: getReference(ward.reference).id, name: ward.display, total: 1 };
                    } else {
                        acc[ward.reference].total += 1;
                    }
                    return acc;
                }, Object.create(null))
            );
            return totals;
        },
        async getEncountersByWard(ctx) {
            //FHIR Client will execute the request and attach results to ctx.locals.fhir.data before this action is called
            //In this case, a FHIR search will be executed and a bundle of encounters attached
            //Extract and map ward info from the fhir encounter resource
            const encounters = ctx.locals.fhir.response.entry.map((e) => {
                return {
                    id: e.resource.id,
                    subject: e.resource.subject,
                    type: e.resource.type,
                    reason: e.resource.reason,
                    location: e.resource.location,
                };
            });
            return encounters;
        },
        async getEncounter(ctx) {},
    },
};
