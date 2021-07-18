/*
 * File: /services/adapters/mixins/service.adapter.mixin.js
 * Project: ward-watcher
 * Created Date: Thursday July 15th 2021
 * Author: Rob Organ
 * -----
 * Last Modified: Thursday July 15th 2021 12:51:57 pm
 * Modified By: Rob Organ
 * -----
 * Copyright (c) 2021 Synanetics Ltd
 * MIT License
 */

"use strict";

module.exports = {
    name: "service.adapter.mixin",
    hooks: {
        before: {
            "*": async function (ctx) {
                const serviceRequest = {};
                serviceRequest.user = ctx.meta?.session?.user ?? {};
                serviceRequest.request = ctx.meta?.request ?? {};
                serviceRequest.data = Object.assign(ctx.params.body, ctx.params.query, ctx.params.params);
                ctx.params = serviceRequest;
            },
        },
        after: {
            "*": async function (ctx, response) {
                //If no opts then default to json
                const serviceResponse = Object.assign(response);
                if (!serviceResponse.opts) {
                    serviceResponse.opts = { responseType: "application/json", statusCode: 200 };
                }
                return serviceResponse;
            },
        },
        error: {
            "*": async function (ctx, error) {
                //Has the error already been handled by a derivative mixin?
                if (error?.data?.opts && error?.data?.data) {
                    //If so, simply rethrow
                    throw error;
                }
                //Else assume it has not been handled so create a service error response and rethrow
                const serviceResponse = { opts: { responseType: "application/json", statusCode: 500 } };
                serviceResponse.data = {
                    error: { message: `An unhandled error was thrown in ${ctx.action.name}: ${error.message}` },
                };
                throw serviceResponse;
            },
        },
    },
};
