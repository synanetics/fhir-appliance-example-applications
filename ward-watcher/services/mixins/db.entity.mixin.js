/*
 * File: /services/mixins/server.mixin.js
 * Project: fhir-control
 * Created Date: Monday July 5th 2021
 * Author: Rob Organ
 * -----
 * Last Modified: Sunday July 11th 2021 10:37:43 am
 * Modified By: Rob Organ
 * -----
 * Copyright (c) 2021 Synanetics Ltd
 * MIT License
 */

"use strict";

//Node/npm modules
const Validator = require("fastest-validator");
//Moleculer mods
const { MoleculerError } = require("moleculer").Errors;

module.exports = {
    name: "db.entity",
    hooks: {
        before: {
            create: async function (ctx) {
                //Validate
                await this.validate(ctx);
            },
            update: async function (ctx) {
                //Validate
                await this.validate(ctx);
            },
        },
        error: {
            "*": function (ctx, err) {
                if (err?.type === "VALIDATION_ERROR") {
                    const endpoint = { validation: { errors: {} } };
                    for (const error in err.data) {
                        const field = error.substr(error.indexOf(".") + 1);
                        endpoint.validation.errors[field] = err.data[error];
                    }
                    return endpoint;
                } else {
                    //Log error
                    const message = `Call to ${ctx.action.name}: ${err.message}. See log for further details.`;
                    this.logger.error(`Call to ${ctx.action.name} failed: ${message}: ${err.stack}`);
                    //Rethrow as codeless moleculer error
                    throw new MoleculerError(message);
                }
            },
        },
    },
    methods: {
        async validate(ctx) {
            //If no params, throw
            const params = ctx.params;
            if (!params) {
                throw new MoleculerError(`ctx.params cannot be undefined for this action.`);
            }
            const validationResult = {};
            validationResult.isValid = true;
            const validation = this.settings?.validation;
            if (validation) {
                const parameters = Object.keys(params ?? []);
                if (parameters.length === 0) {
                    throw new MoleculerError(`ctx.params cannot be empty or undefined`);
                }
                for (const param of parameters) {
                    const schema = validation[param]?.schema;
                    if (!schema) {
                        //schema not found for param - throw
                        throw new MoleculerError(`Validation schema for parameter ${param} does not exist. Check the name of this parameter in ctx.params`);
                    } else {
                        const subject = {};
                        subject[param] = params[param];
                        const result = this.validator.validate(subject, schema);
                        if (Array.isArray(result)) {
                            validationResult.errors = validation.errors ?? {};
                            //Failed
                            for (const res of result) {
                                validationResult.errors[res.field] = res.message;
                            }
                        }
                    }
                }
                validationResult.isValid = !(Object.keys(validationResult.errors ?? {}).length > 0);
            }
            if (!validationResult.isValid) {
                throw new MoleculerError(`Call to ${ctx.action.name} failed: invalid parameters.`, 422, "VALIDATION_ERROR", validationResult.errors);
            }
            ctx.locals.validation = validationResult;
        },
    },
    async started() {
        const validatorOpts = {
            useNewCustomCheckerFunction: true,
            messages: {},
        };
        try {
            const types = Object.keys(this.settings?.validation ?? []);
            for (const type of types) {
                const typeValidation = this.settings.validation[type] ?? {};
                const { messages } = typeValidation;
                if (messages) {
                    for (const message in messages) {
                        if (!validatorOpts.messages[message]) {
                            validatorOpts.messages[message] = messages[message];
                        } else {
                            validatorOpts.messages[`${type}.${message}`] = messages[message];
                            this.logger.warn(
                                `Duplicate validation message detected: ${messages[message]} was added to validation messages as key ${type}.${message}.`
                            );
                        }
                    }
                }
            }
            this.validator = new Validator(validatorOpts);
        } catch (err) {
            //Log error
            const message = `Failed initalising validation for ${this.name}, reason: ${err.message}. See log for further details.`;
            this.logger.error(`${message}: ${err.stack}`);
            //Rethrow as codeless moleculer error
            throw new MoleculerError(message);
        }
    },
};
