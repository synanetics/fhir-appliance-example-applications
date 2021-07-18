/*
 * File: /services/gateways/middleware/save.session.js
 * Project: ward-watcher
 * Created Date: Thursday July 15th 2021
 * Author: Rob Organ
 * -----
 * Last Modified: Thursday July 15th 2021 8:11:09 pm
 * Modified By: Rob Organ
 * -----
 * Copyright (c) 2021 Synanetics Ltd
 * MIT License
 */

"use strict";

const $save = (session, key, data) => {
    for (const k in data) {
        //k === key in object hash
        const v = data[k]; //v === value at data[k]
        // Delete values when users unselect checkboxes
        if (v === "_unchecked" || v === ["_unchecked"]) {
            delete session[key][k];
            continue;
        }
        // Remove _unchecked from arrays of checkboxes
        if (Array.isArray(v)) {
            const index = v.indexOf("_unchecked");
            if (index !== -1) {
                v.splice(index, 1);
            }
        } else if (typeof v === "object") {
            // Store nested objects that aren't arrays
            if (typeof session[key][k] !== "object") {
                session[key][k] = {};
            }
            // Add nested values
            _save(session, key, data[k]);
            continue;
        }
        session[key][k] = v;
    }
};

const saveSession = function (key) {
    return async (req, res, next) => {
        /**
         * Extracts the body of form submissions and persists this data to the current user session (on every POST).
         * Once the data is written to the current session, req.$ctx.ui.session is updated. The current session can then be accessed by
         * service actions via a call to ctx.ui.session. If data from a specific form is required then it can be accessed from ctx.ui.session
         * using ctx.ui.session[key]. Key can be anything that identifies what a user has done and could be a form name, a task name, a transaction id.
         * A key effectively partititions data according to some logical grouping as required by the application.
         **/
        //If key is not defined use req.$alias.action ot req.$action.name
        try {
            if (req.method.toLowerCase() === "post") {
                const { body: data } = req.body;
                if (data) {
                    const session = req.$ctx.session ?? {};
                    $save(this, session, key, data);
                }
            }
            next();
        } catch (err) {
            next(err);
        }
    };
};

module.exports = saveSession;
