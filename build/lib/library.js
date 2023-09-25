"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var library_exports = {};
__export(library_exports, {
  BaseClass: () => BaseClass,
  Library: () => Library
});
module.exports = __toCommonJS(library_exports);
var import_jsonata = __toESM(require("jsonata"));
var import_definitionen = require("./def/definitionen");
var _adapter, _prefix;
class BaseClass {
  unload = false;
  log;
  adapter;
  name = ``;
  constructor(adapter, name = "") {
    this.name = name;
    this.log = new CustomLog(adapter, this.name);
    this.adapter = adapter;
  }
  delete() {
    this.unload = true;
  }
}
class CustomLog {
  constructor(adapter, text = "") {
    __privateAdd(this, _adapter, void 0);
    __privateAdd(this, _prefix, void 0);
    __privateSet(this, _adapter, adapter);
    __privateSet(this, _prefix, text);
  }
  getName() {
    return __privateGet(this, _prefix);
  }
  debug(log, log2 = "") {
    __privateGet(this, _adapter).log.debug(log2 ? `[${log}] ${log2}` : `[${__privateGet(this, _prefix)}] ${log}`);
  }
  info(log, log2 = "") {
    __privateGet(this, _adapter).log.info(log2 ? `[${log}] ${log2}` : `[${__privateGet(this, _prefix)}] ${log}`);
  }
  warn(log, log2 = "") {
    __privateGet(this, _adapter).log.warn(log2 ? `[${log}] ${log2}` : `[${__privateGet(this, _prefix)}] ${log}`);
  }
  error(log, log2 = "") {
    __privateGet(this, _adapter).log.error(log2 ? `[${log}] ${log2}` : `[${__privateGet(this, _prefix)}] ${log}`);
  }
  setLogPrefix(text) {
    __privateSet(this, _prefix, text);
  }
}
_adapter = new WeakMap();
_prefix = new WeakMap();
class Library extends BaseClass {
  stateDataBase = {};
  constructor(adapter, _options = null) {
    super(adapter, "library");
    this.stateDataBase = {};
  }
  async writeFromJson(prefix, objNode, def, data, expandTree = false) {
    if (!def || typeof def !== "object")
      return;
    if (data === void 0 || ["string", "number", "boolean", "object"].indexOf(typeof data) == -1)
      return;
    const objectDefinition = objNode ? await this.getObjectDefFromJson(`${objNode}`, def) : null;
    if (objectDefinition)
      objectDefinition.native = { ...objectDefinition.native || {}, objectDefinitionReference: objNode };
    if (typeof data === "object" && data !== null) {
      if (Array.isArray(data)) {
        if (!objectDefinition)
          return;
        if (this.adapter.config.expandArray || objectDefinition.type !== "state" || expandTree) {
          let a = 0;
          for (const k in data) {
            const defChannel = this.getChannelObject(objectDefinition);
            const dp = `${prefix}${`00${a++}`.slice(-2)}`;
            await this.writedp(dp, null, defChannel);
            await this.writeFromJson(dp, `${objNode}`, def, data[k], expandTree);
          }
        } else {
          this.writeFromJson(prefix, objNode, def, JSON.stringify(data) || "[]", expandTree);
        }
      } else {
        if (objectDefinition) {
          const defChannel = this.getChannelObject(objectDefinition);
          await this.writedp(prefix, null, defChannel);
        }
        if (data === null)
          return;
        for (const k in data) {
          await this.writeFromJson(`${prefix}.${k}`, `${objNode}.${k}`, def, data[k], expandTree);
        }
      }
    } else {
      if (!objectDefinition)
        return;
      await this.writedp(prefix, data, objectDefinition);
    }
  }
  async getObjectDefFromJson(key, data) {
    let result = await (0, import_jsonata.default)(`${key}`).evaluate(data);
    if (result === null || result === void 0) {
      this.log.warn(`No definition for ${key}!`);
      result = import_definitionen.genericStateObjects.state;
    }
    return this.cloneObject(result);
  }
  getChannelObject(definition = null) {
    const def = definition && definition._channel || null;
    const result = {
      _id: def ? def._id : "",
      type: def && def.type != "device" ? "channel" : "device",
      common: {
        name: def && def.common && def.common.name || "no definition"
      },
      native: def && def.native || {}
    };
    return result;
  }
  async writedp(dp, val, obj = null) {
    dp = this.cleandp(dp);
    let node = this.readdp(dp);
    if (node === void 0) {
      if (!obj) {
        throw new Error("writedp try to create a state without object informations.");
      }
      obj._id = `${this.adapter.name}.${this.adapter.instance}.${dp}`;
      await this.adapter.setObjectNotExistsAsync(dp, obj);
      node = this.setdb(dp, obj.type, void 0, true);
    }
    if (obj && obj.type !== "state")
      return;
    if (node && node.val != val) {
      if (obj && obj.common && obj.common.type != typeof val && val !== void 0)
        val = this.convertToType(val, obj.common.type);
      await this.adapter.setStateAsync(dp, { val, ts: Date.now(), ack: true });
    }
    if (node)
      this.setdb(dp, node.type, val, true);
  }
  cleandp(string, lowerCase = false) {
    if (!string && typeof string != "string")
      return string;
    string = string.replace(this.adapter.FORBIDDEN_CHARS, "#");
    return lowerCase ? string.toLowerCase() : string;
  }
  convertToType(value, type) {
    if (value === null)
      return null;
    if (type === void 0) {
      throw new Error("convertToType type undefifined not allowed!");
    }
    if (value === void 0)
      value = "";
    const old_type = typeof value;
    let newValue = typeof value == "object" ? JSON.stringify(value) : value;
    if (type !== old_type) {
      switch (type) {
        case "string":
          newValue = value.toString() || "";
          break;
        case "number":
          newValue = value ? Number(value) : 0;
          break;
        case "boolean":
          newValue = !!value;
          break;
        case "array":
        case "json":
          break;
      }
    }
    return newValue;
  }
  setdb(dp, type, val, ack = true, ts = Date.now()) {
    this.stateDataBase[dp] = { type, val, ack, ts: ts ? ts : Date.now() };
    return this.stateDataBase[dp];
  }
  cloneObject(obj) {
    if (typeof obj !== "object") {
      this.log.error(`Error clone object target is type: ${typeof obj}`);
      return obj;
    }
    return JSON.parse(JSON.stringify(obj));
  }
  cloneGenericObject(obj) {
    if (typeof obj !== "object") {
      this.log.error(`Error clone object target is type: ${typeof obj}`);
      return obj;
    }
    return JSON.parse(JSON.stringify(obj));
  }
  readdp(dp) {
    return this.stateDataBase[this.cleandp(dp)];
  }
  async readWithJsonata(data, cmd) {
    let result;
    if (typeof cmd === "string") {
      if (cmd === "")
        return "";
      try {
        result = await (0, import_jsonata.default)(cmd).evaluate(data);
      } catch (error) {
        this.log.error(error.message);
        this.log.error(`The cmd: ${cmd} is invaild Message: ${error.message}.`);
      }
    } else {
      result = {};
      for (const k in cmd) {
        if (cmd[k]) {
          try {
            result[k] = await (0, import_jsonata.default)(cmd[k]).evaluate(data);
          } catch (error) {
            this.log.error(error);
            this.log.error(`The cmd: ${cmd[k]} for key ${k} is invaild.`);
          }
        }
      }
    }
    return result;
  }
  initStates(states) {
    if (!states)
      return;
    for (const state in states) {
      const dp = state.replace(`${this.adapter.name}.${this.adapter.instance}.`, "");
      this.setdb(
        dp,
        "state",
        states[state] && states[state].val ? states[state].val : void 0,
        states[state] && states[state].ack,
        states[state] && states[state].ts ? states[state].ts : Date.now()
      );
    }
  }
  async garbageColleting(prefix, offset = 2e3) {
    if (!prefix)
      return;
    if (this.stateDataBase) {
      for (const id in this.stateDataBase) {
        if (id.startsWith(prefix)) {
          const state = this.stateDataBase[id];
          if (!state || state.val == void 0)
            continue;
          if (state.ts < Date.now() - offset) {
            let newVal;
            switch (typeof state.val) {
              case "string":
                if (state.val.startsWith("{") && state.val.endsWith("}"))
                  newVal = "{}";
                else if (state.val.startsWith("[") && state.val.endsWith("]"))
                  newVal = "[]";
                else
                  newVal = "";
                break;
              case "bigint":
              case "number":
                newVal = -1;
                break;
              case "boolean":
                newVal = false;
                break;
              case "symbol":
              case "object":
              case "function":
                newVal = null;
                break;
              case "undefined":
                newVal = void 0;
                break;
            }
            await this.writedp(id, newVal);
          }
        }
      }
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BaseClass,
  Library
});
//# sourceMappingURL=library.js.map