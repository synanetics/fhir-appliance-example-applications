/*
 * File: /utils/fhir.js
 * Project: ward-watcher
 * Created Date: Sunday July 18th 2021
 * Author: Rob Organ
 * -----
 * Last Modified: Sunday July 18th 2021 6:14:30 pm
 * Modified By: Rob Organ
 * -----
 * Copyright (c) 2021 Synanetics Ltd
 * MIT License
 */

"use strict";

module.exports = {
    getReference: (value) => {
        var reference = { original: value, contained: false, version: 1 };
        var parts = value.split("/");
        var offset = 0;
        if (value[0] === "#") {
            reference.contained = true;
            reference.id = value.substring(1);
        } else {
            if (parts[parts.length - 2] === "_history") {
                reference.version = parts[parts.length - 1];
                offset = 2;
            }
            if (value.includes("?")) {
                reference.type = value.split("?")[0];
                reference.criteria = value.split("?")[1];
            } else {
                reference.type = parts[parts.length - 2 - offset];
                reference.id = parts[parts.length - 1 - offset];
                if (parts.length > 2 + offset) reference.url = parts.slice(0, parts.length - offset).join("/");
            }
        }

        if (reference.type && reference.id) {
            reference.relative = `${reference.type}/${reference.id}`;
        }

        return reference;
    },
    /** Given a value, this will extract a provider prefix if it can
     * E.g. Patient/TEST1:abcdef will return TEST1
     */
    getPrefix: (value) => {
        if (!value) return undefined;
        const match = value.match(new RegExp(constants.PREFIX_REGEX));
        return get(match, "groups.prefix");
    },
    /**
     * Searches idents array (or object) for matches system / value combo
     */
    hasIdentifier: (idents = [], system, value) => {
        if (!Array.isArray(idents)) idents = [idents];
        for (const ident of idents) {
            // If system is supplied, make sure it matches
            if (system && ident.system !== system) continue;
            if (ident.value === value) return true;
        }
        return false;
    },
    /**
     * Searches idents array (or object) for matches system and returns value.
     * If no system, then return first ident
     * @param strict - if true, don't return value unless system matches. if false, return first value with no system if can't find a match
     */
    getIdentifier: (idents = [], system, strict = true) => {
        if (!Array.isArray(idents)) idents = [idents];
        let noSystem = null;
        for (const ident of idents) {
            // If system is supplied, make sure it matches
            if (!ident.system) {
                noSystem = ident.value;
                if (!system) break;
            } else if (system === ident.system) return ident.value;
        }
        return noSystem;
    },
};
