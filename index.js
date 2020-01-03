"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var core = require("@actions/core");
var github = require("@actions/github");
var defaultMethod = "merge";
function getConfig() {
    var token = core.getInput('token');
    var labelString = core.getInput('labels');
    var bareMethod = core.getInput('method');
    var commitTitle = core.getInput('title');
    var commitMessage = core.getInput('message');
    var labels = JSON.parse(labelString);
    var method = fetchMethod(bareMethod);
    return {
        token: token,
        labels: labels,
        method: method,
        commitTitle: commitTitle,
        commitMessage: commitMessage
    };
}
function fetchMethod(method) {
    switch (method) {
        case "squash":
            return "squash";
        case "merge":
            return "merge";
        case "rebase":
            return "rebase";
        default:
            return defaultMethod;
    }
}
function setOutput(output) {
    for (var o in output) {
        core.setOutput(o, output[o]);
    }
}
function getLabels() {
    var pullRequest = github.context.payload.pull_request;
    if (pullRequest == undefined) {
        return [];
    }
    else {
        var bareLabels = pullRequest.labels;
        var labels_1 = bareLabels.map(function (label) { return label.name; });
        return labels_1;
    }
}
function mergeableByLabel(needLabel, currentLabel) {
    var filterdLabel = needLabel.filter(function (label) { return currentLabel.indexOf(label) != -1; });
    if (filterdLabel.length == needLabel.length) {
        return true;
    }
    else {
        return false;
    }
}
function mergePullRequest(conf) {
    return __awaiter(this, void 0, void 0, function () {
        var failureOutput, successOutput, client, pullRequest;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    failureOutput = {
                        result: "failure"
                    };
                    successOutput = {
                        result: "success"
                    };
                    client = new github.GitHub(conf.token);
                    pullRequest = github.context.payload.pull_request;
                    if (pullRequest == undefined) {
                        return [2 /*return*/, failureOutput];
                    }
                    return [4 /*yield*/, client.pulls.merge({
                            owner: pullRequest.head.repo.owner.login,
                            repo: pullRequest.head.repo.name,
                            pull_number: pullRequest.number,
                            commit_title: conf.commitTitle,
                            commit_message: conf.commitMessage,
                            merge_method: conf.method
                        })["catch"](function (e) {
                            console.log(e.message);
                            return failureOutput;
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/, successOutput];
            }
        });
    });
}
var conf = getConfig();
var labels = getLabels();
if (mergeableByLabel(conf.labels, labels)) {
    var result = mergePullRequest(conf);
    result.then(function (output) {
        setOutput(output);
    });
}
else {
    setOutput({ result: "skipped" });
}
