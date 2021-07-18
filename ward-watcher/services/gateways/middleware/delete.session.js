/*
 * File: /services/gateways/middleware/delete.session.js
 * Project: ward-watcher
 * Created Date: Thursday July 15th 2021
 * Author: Rob Organ
 * -----
 * Last Modified: Thursday July 15th 2021 8:10:49 pm
 * Modified By: Rob Organ
 * -----
 * Copyright (c) 2021 Synanetics Ltd
 * MIT License
 */

"use strict";

const deleteSession = function (key) {
    return async (req, res, next) => {
        /**
         * Routes can request that the session state is cleared for a given key. This may happen, for example, at the end of a transaction,
         * once that transaction has been successfully committed/finished for example.
         **/
        try {
            if (req.$ctx.session) {
                const keys = Array.isArray(key) ? key : [key];
                if (req.$ctx.session) {
                    for (const k of keys) {
                        delete req.$ctx.session[k];
                    }
                }
                delete req.$ctx.session[k];
            }
            next();
        } catch (err) {
            next(err);
        }
    };
};

module.exports = deleteSession;
