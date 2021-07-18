/*
 * File: /services/adapters/mixins/ui.service.adapter.mixin.js
 * Project: ward-watcher
 * Created Date: Thursday July 15th 2021
 * Author: Rob Organ
 * -----
 * Last Modified: Friday July 16th 2021 2:11:29 pm
 * Modified By: Rob Organ
 * -----
 * Copyright (c) 2021 Synanetics Ltd
 * MIT License
 */

"use strict";

const getKeypath = require("keypather/get");
const nunjucks = require("nunjucks");
const path = require("path");
const pkg = require(path.join(__dirname, "../../../package.json"));
const fs = require("fs");
const moment = require("moment-timezone");

const { MoleculerError } = require("moleculer").Errors;

module.exports = {
    name: "ui.service.adapter.mixin",
    hooks: {
        after: {
            "*": async function (ctx, response) {
                let { data, view } = response;
                //Extract the response from a service action using this mixin
                const uiServiceAdapterResponse = Object.assign({ opts: { responseType: "text/html", headers: {}, statusCode: 200 } }, response);
                //Only render if there is something to render
                if (view) {
                    if (!view.endsWith("njk")) view = `${view}.njk`;
                    //Test template exists, if not return rendered html and a 404
                    if (!fs.existsSync(path.join(__dirname, `../../../views/${view}`))) {
                        uiServiceAdapterResponse.opts.statusCode = 404;
                        uiServiceAdapterResponse.data = this.nunjucks.render(this.errorView, {
                            error: { message: `Page not found: ${view}` },
                        });
                    } else {
                        try {
                            //Scope to set additional view properties here
                            if (data) {
                                //Add logged in user (if present) to view data
                                data.user = ctx.meta?.session?.user ?? {};
                            }
                            uiServiceAdapterResponse.data = this.nunjucks.render(view, data ?? {});
                        } catch (err) {
                            uiServiceAdapterResponse.opts.statusCode = 500;
                            uiServiceAdapterResponse.data = this.nunjucks.render(this.errorView, {
                                error: { message: err.message },
                            });
                        }
                    }
                }
                return uiServiceAdapterResponse;
            },
        },
        error: {
            "*": function (ctx, error) {
                //Render error page and re-throw - this will be caught and processed in service.adapter.mixin
                const uiServiceAdapterError = { opts: { responseType: "text/html" } };
                const errorData = {
                    error: { message: `An unhandled error was thrown in ${ctx.action.name}: ${error.data?.message ?? error.message}` },
                };
                uiServiceAdapterError.data = this.nunjucks.render(this.errorView, errorData);
                throw new MoleculerError(`${errorData.error.message}`, 500, "SERVICE_ACTION_UNHANDLED_EXCEPTION", uiServiceAdapterError);
            },
        },
    },
    methods: {
        /**
         * Configuration methods for nunjucks
         * No need to call by services that use this mixin
         *
         * 🗣 Credits/kudos:
         * See lib/utils in https://github.com/nhsuk/nhsuk-prototype-kit
         *
         */
        $addLogFilter(env) {
            //https://github.com/nhsuk/nhsuk-prototype-kit/blob/master/lib/core_filters.js
            const safe = env.getFilter("safe");
            env.addFilter("log", function (a) {
                return safe(`<script>console.log('${JSON.stringify(a, null, "\t")}');</script>`);
            });
        },
        $addCheckedFunction(env) {
            //https://github.com/nhsuk/nhsuk-prototype-kit/blob/master/lib/utils.js
            env.addGlobal("checked", function (root, name, value) {
                // Check data exists
                let data = this.ctx[root] || this.ctx.data || this.ctx.context;
                if (!data) return "";
                // Use string keys or object notation to support:
                // checked("field-name")
                // checked("['field-name']")
                // checked("['parent']['field-name']")
                name = !name.match(/[.[]/g) ? `['${name}']` : name;
                let storedValue = getKeypath(data, name);
                // Check the requested data exists
                if (storedValue === undefined) {
                    return "";
                }
                let checked = "";
                // If data is an array, check it exists in the array
                if (Array.isArray(storedValue)) {
                    if (storedValue.indexOf(value) !== -1) {
                        checked = "checked";
                    }
                } else {
                    // The data is just a simple value, check it matches
                    if (storedValue.toString() === value) {
                        checked = "checked";
                    }
                }
                return checked;
            });
        },
        $addGlobals(env) {
            env.addGlobal("version", pkg.version);
            //baseUrl
            env.addGlobal("baseUrl", process.env.APP_BASE_URL ?? "http://localhost:3000/");
        },
    },
    async created() {
        /**
         * Configure nunjucks view engine (once)
         *
         * 1. Create basic configuration: https://mozilla.github.io/nunjucks/api.html#configure
         * 2. Fetch paths to all the views/templates. This includes the app views as well as the templates in the fhir-frontend package
         * 3. Configure nunjucks and capture the environment response in a service level variable (will last the lifetime of the service)
         * 4. Add a couple of useful nunjucks filters developed as part of the NHS prototype toolkit: https://mozilla.github.io/nunjucks/api.html#custom-filters
         *
         */
        if (!this.nunjucks) {
            //Basic configuration
            this.configuration = { autoescape: true, trimBlocks: true, lstripBlocks: true, watch: true };
            //Paths to all views/nj templates
            this.views = [path.join(__dirname, "../../../views"), path.join(__dirname, "../../../node_modules/nhsuk-frontend/packages/components")];
            //Configure a nunjucks environment
            this.nunjucks = nunjucks.configure(this.views, this.configuration);
            //Error view
            this.errorView = "error.njk";
            //Add global vars (available in all views)
            this.$addGlobals(this.nunjucks);
            //Add custom filters
            this.$addLogFilter(this.nunjucks);
            this.$addCheckedFunction(this.nunjucks);
        }
    },
    async started() {},
};
