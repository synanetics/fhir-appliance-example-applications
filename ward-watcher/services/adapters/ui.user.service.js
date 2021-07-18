/*
 * File: /services/adapters/ui.server.service.js
 * Project: ward-watcher
 * Created Date: Thursday July 15th 2021
 * Author: Rob Organ
 * -----
 * Last Modified: Friday July 16th 2021 9:36:52 am
 * Modified By: Rob Organ
 * -----
 * Copyright (c) 2021 Synanetics Ltd
 * MIT License
 */

"use strict";

const UIServiceAdapter = require("./mixins/ui.service.adapter.mixin");
const ServiceAdapter = require("./mixins/service.adapter.mixin");

module.exports = {
    name: "ui.user",
    mixins: [UIServiceAdapter, ServiceAdapter],
    dependencies: ["user"],
    actions: {
        async login(ctx) {
            //UIServiceAdapter will deal with unhandled exceptions
            //Extract serviceRequest params that are needed by this action
            const { action, username, password } = ctx.params.data;
            //Inititalise response
            const response = {};
            if (action?.toLowerCase() === "do") {
                //Ask user.authenticate() to authenticate the user
                const user = await ctx.call("user.authenticate", { credentials: { username, password } });
                if (user?.validation?.errors) {
                    response.view = "login";
                    response.data = { errors: user?.validation?.errors };
                } else {
                    response.user = user;
                    response.opts = { statusCode: 303, headers: { location: "/ward-watcher/" } }; //Redirect to home page
                }
            } else {
                //Nothing submitted so want to re-render the view
                response.view = "login";
            }
            //Return ui service response
            return response;
        },
        async logout(ctx) {
            //Destroy ctx.session
            ctx?.meta?.session?.destroy();
            delete ctx.session;
            //Redirect to login
            return { opts: { statusCode: 303, headers: { location: "/auth/login" } } };
        },
    },
};
