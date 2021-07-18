/*
 * File: /services/user.service.js
 * Project: ward-watcher
 * Created Date: Thursday July 15th 2021
 * Author: Rob Organ
 * -----
 * Last Modified: Friday July 16th 2021 9:32:56 am
 * Modified By: Rob Organ
 * -----
 * Copyright (c) 2021 Synanetics Ltd
 * MIT License
 */

"use strict";

//Node modules
const bcrypt = require("bcrypt");
const moment = require("moment-timezone");
//Moleculer modules
const DbService = require("moleculer-db");
const DbAdapter = require("./mixins/mssql.db.adapter.mixin");
const Sequelize = require("sequelize");
const { MoleculerError } = require("moleculer").Errors;
//App modules
const DbEntity = require("./mixins/db.entity.mixin");

module.exports = {
    name: "user",
    mixins: [DbEntity, DbAdapter, DbService],
    hooks: {
        after: {
            "*": function (ctx, res) {
                //Delete password
                delete res.password;
                return res;
            },
        },
    },
    settings: {
        ROLES: {
            ADMIN: "administrator",
            USER: "user",
        },
        fields: ["_id", "name", "given", "family", "username", "password", "role", "created", "lastUpdated"],
        validation: {
            userInfo: {
                schema: {
                    userInfo: {
                        type: "object",
                        optional: false,
                        props: {
                            given: { type: "string", empty: false, max: 85, optional: false },
                            family: { type: "string", empty: false, max: 85, optional: false },
                            username: { type: "string", empty: false, max: 155, optional: false },
                            password: { type: "string", empty: false, max: 155, optional: false },
                            role: {
                                type: "custom",
                                roles: process.env.APP_VALIDATION_USER_ROLES?.split(",") ?? ["user", "administrator"],
                                check(value, errors, schema) {
                                    //sanitise value
                                    value = value?.toLowerCase();
                                    //quick type validation check then return
                                    const validationResults = this.validate(
                                        {
                                            role: value,
                                        },
                                        {
                                            role: { type: "enum", values: schema.roles },
                                        }
                                    );
                                    if (Array.isArray(validationResults)) {
                                        errors.push(...validationResults);
                                    }
                                    return value;
                                },
                            },
                            enabled: { type: "boolean", optional: true },
                        },
                    },
                },
            },
            credentials: {
                schema: {
                    credentials: {
                        type: "object",
                        optional: false,
                        $$strict: true,
                        props: {
                            username: { type: "string", empty: false, max: 155, optional: false },
                            password: { type: "string", empty: false, max: 155, optional: false },
                        },
                    },
                },
            },
        },
    },
    model: {
        name: "user",
        define: {
            _id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
                field: "ID",
            },
            name: {
                type: Sequelize.VIRTUAL,
                get() {
                    return {
                        given: this.given,
                        family: this.family,
                    };
                },
            },
            given: {
                type: Sequelize.STRING(85, false),
                allowNull: false,
                field: "GIVEN_NAME",
            },
            family: {
                type: Sequelize.STRING(85, false),
                allowNull: false,
                field: "FAMILY_NAME",
            },
            username: {
                type: Sequelize.STRING(155, false),
                allowNull: false,
                field: "USER_NAME",
            },
            password: {
                type: Sequelize.STRING(155, false),
                allowNull: false,
                field: "PASSWORD",
            },
            role: {
                type: Sequelize.STRING(15, false),
                allowNull: false,
                field: "ROLE",
            },
            lastLogin: {
                type: Sequelize.DATE,
                allowNull: true,
                field: "LAST_LOGIN",
            },
            enabled: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                field: "ENABLED",
            },
            defaultUser: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                field: "DEFAULT_USER",
            },
            created: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW,
                allowNull: false,
                field: "CREATED",
            },
            lastUpdated: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW,
                allowNull: true,
                field: "LAST_UPDATED",
            },
        },
        options: {
            tableName: "USERS",
            timestamps: false,
        },
    },
    async afterConnected() {
        try {
            //If no users, seed db with a default admin account
            const count = await this._count();
            if (count === 0) {
                this.logger.info(`Creating default admin user...`);
                //Use adapter direct here as no context (ctx)
                //Note direct calls to the adapter bypass validation checks
                const defaultAdminUser = await this.adapter.insert({
                    given: process.env.APP_DEFAULT_USER_NAME ?? "Default",
                    family: process.env.APP_DEFAULT_USER_NAME ?? "User",
                    username: process.env.APP_DEFAULT_USER_NAME ?? "admin",
                    password: await bcrypt.hash(process.env.APP_DEFAULT_USER_PASSWORD ?? "admin", 10),
                    role: this.settings.ROLES.ADMIN,
                    enabled: true,
                    defaultUser: true,
                });
                this.logger.info(`Default admin user created: ${defaultAdminUser.given} ${defaultAdminUser.family}, username: ${defaultAdminUser.username}`);
            }
        } catch (err) {
            //Log error
            const message = `Failed to create default user in user service: ${err.message}. See log for further details.`;
            this.logger.error(`${message}: ${err.stack}`);
            //Rethrow as codeless moleculer error
            throw new MoleculerError(message);
        }
    },
    actions: {
        insert: false,
        update: false,
        remove: false,

        async create(ctx) {
            const { userInfo } = ctx.params;
            //Password needs to be hashed so must exist
            let { password } = userInfo;
            password = await bcrypt.hash(password, 10);
            const { _id: id } = await this._create(ctx, {
                given: userInfo.given,
                family: userInfo.family,
                username: userInfo.username,
                password,
                role: userInfo.role,
                enabled: userInfo.enabled ?? true,
                defaultUser: false,
            });
            //Fetch created db record and return
            return await this._get(ctx, { id });
        },
        authenticate: {
            hooks: {
                before: async function (ctx) {
                    await this.validate(ctx);
                },
            },
            async handler(ctx) {
                //Destructure ctx.params.credentials and obtain email (username) and a clear text password
                const { credentials } = ctx.params;
                let result = (await this._find(ctx, { query: { username: credentials.username, enabled: true } }))[0];
                if (!result || !(await bcrypt.compare(credentials.password, result.password))) {
                    //Log warning
                    this.logger.warn(
                        `Failed login attempt - invalid username/email address provided is not registered or password for user was incorrect: ${credentials.emailAddress}`
                    );
                    //Throw unauthorized
                    throw new MoleculerError("Unauthorised: invalid username or password", 401, "UNAUTHORIZED");
                }
                //Update last login for this user
                return await this._update(ctx, { id: result._id, lastLogin: moment.utc().format("YYYY-MM-DDTHH:mm:ss.SSSZ") });
            },
        },
    },
};
