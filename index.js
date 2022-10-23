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
Object.defineProperty(exports, "__esModule", { value: true });
const core = require("@actions/core");
const github = require("@actions/github");
const defaultMethod = "merge";
function getConfig() {
    let token = core.getInput('token');
    let labelString = core.getInput('labels');
    let bareMethod = core.getInput('method');
    let commitTitle = core.getInput('title');
    let commitMessage = core.getInput('message');
    let labels = JSON.parse(labelString);
    let method = fetchMethod(bareMethod);
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
    for (let o in output) {
        core.setOutput(o, output[o]);
    }
}
function getLabels() {
    let pullRequest = github.context.payload.pull_request;
    if (pullRequest == undefined) {
        return [];
    }
    else {
        let bareLabels = pullRequest.labels;
        let labels = bareLabels.map(label => label.name);
        return labels;
    }
}
function mergeableByLabel(needLabel, currentLabel) {
    let filterdLabel = needLabel.filter(label => currentLabel.indexOf(label) != -1);
    if (filterdLabel.length == needLabel.length) {
        return true;
    }
    else {
        return false;
    }
}
function mergePullRequest(conf) {
    return __awaiter(this, void 0, void 0, function* () {
        let failureOutput = {
            result: "failure"
        };
        let successOutput = {
            result: "success"
        };
        let client = github.getOctokit(core.getInput('token'));
        let pullRequest = github.context.payload.pull_request;
        if (pullRequest == undefined) {
            return failureOutput;
        }
        yield client.rest.pulls.merge({
            owner: pullRequest.head.repo.owner.login,
            repo: pullRequest.head.repo.name,
            pull_number: pullRequest.number,
            commit_title: conf.commitTitle,
            commit_message: conf.commitMessage,
            merge_method: conf.method
        }).catch(e => {
            core.setFailed(e.message);
            return failureOutput;
        });
        return successOutput;
    });
}
const conf = getConfig();
const labels = getLabels();
if (mergeableByLabel(conf.labels, labels)) {
    const result = mergePullRequest(conf);
    result.then(function (output) {
        setOutput(output);
    });
}
else {
    setOutput({ result: "skipped" });
}
