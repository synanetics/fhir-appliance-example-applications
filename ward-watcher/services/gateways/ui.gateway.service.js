/*
 * File: /services/gateways/ui.gateway.service.js
 * Project: ward-watcher
 * Created Date: Thursday July 15th 2021
 * Author: Rob Organ
 * -----
 * Last Modified: Sunday July 18th 2021 9:33:40 pm
 * Modified By: Rob Organ
 * -----
 * Copyright (c) 2021 Synanetics Ltd
 * MIT License
 */

"use strict";

//Middleware modules
const uniqid = require("uniqid");
const path = require("path");
const redis = require("redis");
const connect = require("connect-redis");
const session = require("express-session");
const serveStatic = require("serve-static");
//Shared route level middleware
this.middleware = [];
//Setup redis session store
const host = process.env.APP_UI_SESSION_STORE_REDIS_HOST ?? "localhost";
const port = process.env.APP_UI_SESSION_STORE_REDIS_PORT ?? 6379;
const RedisStore = connect(session);
const redisClient = redis.createClient(port, host);
const redisSession = {
    name: process.env.APP_UI_SESSION_NAME ?? process.env.APP_NAME ?? this.name,
    secret: process.env.APP_UI_SESSION_SECRET ?? uniqid(`${this.name}-`),
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: false,
        secure: !!(process.env.APP_UI_SESSION_COOKIE_SECURE && process.env.APP_UI_SESSION_COOKIE_SECURE.toLowerCase() === "true"),
        samesite: true,
        domain: process.env.APP_UI_SESSION_COOKIE_DOMAIN ?? "localhost",
    },
    store: new RedisStore({ client: redisClient }),
};
this.middleware.push(session(redisSession));
//Assets
this.middleware.push(serveStatic(path.join(__dirname, "../../public/css/")));
this.middleware.push(serveStatic(path.join(__dirname, "../../node_modules/nhsuk-frontend/dist/")));
this.middleware.push(serveStatic(path.join(__dirname, "../../node_modules/nhsuk-frontend/packages/")));
//Moleculer modules
const ApiGateway = require("moleculer-web");
const { MoleculerError } = require("moleculer").Errors;
/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 * @typedef {import('http').IncomingMessage} IncomingRequest Incoming HTTP Request
 * @typedef {import('http').ServerResponse} ServerResponse HTTP Server Response
 */
module.exports = {
    name: "ui.gateway",
    mixins: [ApiGateway],
    // More info about settings: https://moleculer.services/docs/0.14/moleculer-web.html
    settings: {
        port: process.env.APP_UI_TRANSPORT_PORT ?? 3000,
        routes: [
            {
                path: "",
                mappingPolicy: "restrict",
                autoAliases: false,
                mergeParams: false,
                aliases: {
                    "GET /"(req, res) {
                        res.writeHead(301, { location: "/ward-watcher" });
                        res.end();
                    },
                },
                logging: false,
            },
            {
                path: "/ward-watcher",
                mappingPolicy: "restrict",
                use: this.middleware,
                authorization: true,
                autoAliases: false,
                mergeParams: false,
                bodyParsers: {
                    urlencoded: {
                        extended: true,
                        limit: "1MB",
                    },
                },
                aliases: {
                    "GET /": "ui.home.get", //Show total at service provider level
                    "GET service-providers/:serviceProviderId/sites": "ui.sites.get", //Show totals by service provider site level
                    "GET service-providers/:serviceProviderId/sites/:siteId/wards": "ui.wards.get", //Show totals by service provider site and ward level
                    "GET service-providers/:serviceProviderId/sites/:siteId/wards/:wardId": "ui.wards.get", //Show encounters at ward level (no grouping)
                    "GET service-providers/:serviceProviderId/sites/:siteId/wards/:wardId/encounters/:encounterId": "ui.encounters.get", //Show encounter detail
                },
                onBeforeCall(ctx, route, req, res) {
                    this.before(ctx, route, req, res);
                },
                onAfterCall(ctx, route, req, res, data) {
                    return this.after(ctx, route, req, res, data);
                },
                onError(req, res, error) {
                    this.error(req, res, error);
                },
            },
            {
                path: "/auth",
                mappingPolicy: "restrict",
                use: this.middleware,
                autoAliases: false,
                mergeParams: false,
                bodyParsers: {
                    urlencoded: {
                        extended: true,
                        limit: "1MB",
                    },
                },
                aliases: {
                    "GET login": "ui.user.login",
                    "POST login": "ui.user.login",
                },
                onAfterCall(ctx, route, req, res, data) {
                    return this.after(ctx, route, req, res, data);
                },
                onError(req, res, err) {
                    this.error(req, res, err);
                },
            },
            {
                path: "/users",
                mappingPolicy: "restrict",
                use: this.middleware,
                authorization: true,
                autoAliases: false,
                mergeParams: false,
                bodyParsers: {
                    urlencoded: {
                        extended: true,
                        limit: "1MB",
                    },
                },
                aliases: {
                    "GET logout": "ui.user.logout",
                },
                onAfterCall(ctx, route, req, res, data) {
                    return this.after(ctx, route, req, res, data);
                },
                onError(req, res, err) {
                    this.error(req, res, err);
                },
            },
        ],
    },
    methods: {
        before(ctx, route, req, res) {
            //Attach anything that might be useful for ui services to ctx.meta
            ctx.meta.request = {
                method: req.method,
            };
        },
        after(ctx, route, req, res, data) {
            const serviceResponse = data;
            ctx.meta.$statusCode = serviceResponse.opts.statusCode;
            ctx.meta.$responseType = serviceResponse.opts.responseType;
            ctx.meta.$location = serviceResponse.opts?.headers?.location;
            //req.session check is necessary - logout route, for example, will destroy session
            if (req.session) {
                req.session.user = serviceResponse.user ?? req?.session?.user;
            }
            return serviceResponse.data ?? "";
        },
        error(req, res, err) {
            const headers = err?.data?.headers;
            if (headers) {
                for (const h in headers) {
                    res.setHeader(h, headers[h]);
                }
            }
            res.writeHead(err.code ?? 500);
            res.end(err?.data?.data || err.message || err.stack);
        },
        async authorize(ctx, route, req, res) {
            if (req?.session?.user) {
                //Assign ctx.meta.session to req.session
                ctx.meta.session = req.session;
                //Authenticated...
                return Promise.resolve(ctx);
            } else {
                //Reject and redirect to login
                return Promise.reject(
                    new MoleculerError("Unauthorized request - redirecting to /auth/login", 303, "REDIRECT_UNAUTHORIZED", {
                        headers: { location: "/auth/login" },
                    })
                );
            }
        },
    },
    // Do not log client side errors (does not log an error response when the error.code is 400<=X<500)
    log4XXResponses: false,
    // Logging the request parameters. Set to any log level to enable it. E.g. "info"
    logRequestParams: process.env.APP_LOG_REQUEST_PARAMS,
    // Logging the response data. Set to any log level to enable it. E.g. "info"
    logResponseData: process.env.APP_LOG_RESPONSE_DATA,
    //Service methods
    async created() {},
    async started() {},
};
