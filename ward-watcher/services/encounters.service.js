/*
 * File: /services/ward.service.js
 * Project: ward-watcher
 * Created Date: Friday July 16th 2021
 * Author: Rob Organ
 * -----
 * Last Modified: Tuesday July 20th 2021 5:45:25 pm
 * Modified By: Rob Organ
 * -----
 * Copyright (c) 2021 Synanetics Ltd
 * MIT License
 */

"use strict";

//Helpers
const { getReference, getPatientAgeInYears, getIdentifier, formatNHSNumberForDisplay } = require("../utils/fhir");
//Node modules
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
            getEncounterTotalsGroupedByServiceProvider: {
                interaction: "search",
                search: {
                    status: "in-progress",
                },
            },
            getEncounterTotalsGroupedBySite: {
                interaction: "search",
                search: {
                    status: "in-progress",
                    "service-provider": "organization",
                },
            },
            getEncounterTotalsGroupedBySiteAndWard: {
                interaction: "search",
                search: {
                    status: "in-progress",
                    location: "site",
                },
            },
            getEncountersByWard: {
                interaction: "search",
                search: {
                    status: "in-progress",
                    location: "ward",
                },
            },
            getEncounterDetails: {
                interaction: "search",
                search: {
                    _id: "encounterId",
                    _include: "Encounter:patient",
                    "_include:recurse": "Patient:general-practitioner",
                },
            },
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
        async getEncounterDetails(ctx) {
            //Bundle results will contain encounter, patient, general practice
            const encounter = {};
            //Extract and transform what is needed from the encounter
            const encounterDetail = ctx.locals.fhir.response.entry
                .filter((e) => e.resource.resourceType.toLowerCase() === "encounter")
                .map((e) => {
                    return {
                        status: e.resource.status,
                        startDate: moment(e.resource.period.start).format("DD MMMM YYYY"),
                        startTime: moment.tz(e.resource.period.start, process.env.APP_TZ ?? "Europe/London").format("HH:mm"),
                        consultant: e.resource.participant[0].individual.display,
                        specialty: `${e.resource.type[0].text} (${e.resource.type[0].coding[0].code})`,
                        class: e.resource.class.display,
                        admitSource: `${e.resource.hospitalization.admitSource.text} (${e.resource.hospitalization.admitSource.coding[0].code})`,
                        bed: e.resource.location[2].location.display,
                        ward: e.resource.location[1].location.display,
                        site: e.resource.location[0].location.display,
                    };
                })[0];
            Object.assign(encounter, encounterDetail);
            //Extract patient details
            const patient = ctx.locals.fhir.response.entry
                .filter((e) => e.resource.resourceType.toLowerCase() === "patient")
                .map((e) => {
                    return {
                        name: `${e.resource.name[0].family.toUpperCase()}, ${e.resource.name[0].given[0]
                            .substr(0, 1)
                            .toUpperCase()}${e.resource.name[0].given[0].substr(1).toLowerCase()}`,
                        dob: moment(e.resource.birthDate).format("DD MMMM YYYY"),
                        ageInYears: getPatientAgeInYears(e.resource.birthDate),
                        gender: `${e.resource.gender.substr(0, 1).toUpperCase()}${e.resource.gender.substr(1).toLowerCase()}`,
                        nhsNumber: formatNHSNumberForDisplay(getIdentifier(e.resource.identifier, "https://fhir.nhs.uk/Id/nhs-number")),
                    };
                })[0];
            encounter.patient = patient;
            //Extract general practice
            const generalPractice = ctx.locals.fhir.response.entry
                .filter((e) => e.resource.resourceType.toLowerCase() === "organization")
                .map((e) => {
                    return {
                        name: e.resource.name,
                        ods: getIdentifier(e.resource.identifier, "https://fhir.nhs.uk/Id/ods-organization-code"),
                        phone: e.resource.telecom ? e.resource.telecom[0].value : "",
                        address: e.resource.address ? e.resource.address[0] : {},
                    };
                })[0];
            encounter.generalPractice = generalPractice;
            //Return transformed encounter
            return encounter;
        },
    },
};
