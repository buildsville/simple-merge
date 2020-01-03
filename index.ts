import * as core from '@actions/core'
import * as github from '@actions/github'

type Labels = string[]
type Method = "squash" | "merge" | "rebase"
const defaultMethod:Method = "merge"

type Config = {
    token: string
    labels: Labels
    method: Method
    commitTitle: string
    commitMessage: string
}

type Output = {
    result: string
}

function getConfig():Config {
    let token: string = core.getInput('token')
    let labelString: string = core.getInput('labels')
    let bareMethod: string = core.getInput('method')
    let commitTitle: string = core.getInput('title')
    let commitMessage: string = core.getInput('message')
    let labels: Labels = JSON.parse(labelString) as Labels
    let method: Method = fetchMethod(bareMethod)
    return {
        token: token,
        labels: labels,
        method: method,
        commitTitle: commitTitle,
        commitMessage: commitMessage
    } as Config
}

function fetchMethod(method: string): Method {
    switch (method) {
        case "squash":
            return "squash"
        case "merge":
            return "merge"
        case "rebase":
            return "rebase"
        default:
            return defaultMethod
    }
}

function setOutput(output: Output) {
    for ( let o in output) {
        core.setOutput(o, output[o])
    }
}

function getLabels():Labels {
    let pullRequest = github.context.payload.pull_request
    if (pullRequest == undefined) {
        return []
    } else {
        let bareLabels = pullRequest.labels
        let labels = bareLabels.map(
            label => label.name
        )
        return labels
    }
}

function mergeableByLabel(needLabel:Labels,currentLabel:Labels): boolean {
    let filterdLabel: Labels = needLabel.filter(
        label => currentLabel.indexOf(label) != -1
    )
    if ( filterdLabel.length == needLabel.length ){
        return true
    } else {
        return false
    }
}

async function mergePullRequest(conf: Config): Promise<Output> {
    let failureOutput: Output = {
        result: "failure"
    }
    let successOutput: Output = {
        result: "success"
    }

    let client = new github.GitHub(conf.token)
    let pullRequest = github.context.payload.pull_request 
    if ( pullRequest == undefined ) {
        return failureOutput
    }
    await client.pulls.merge({
        owner: pullRequest.head.repo.owner.login,
        repo: pullRequest.head.repo.name,
        pull_number: pullRequest.number,
        commit_title: conf.commitTitle,
        commit_message: conf.commitMessage,
        merge_method: conf.method
    }).catch(
        e => {
            console.log(e.message)
            return failureOutput
        }
    )
    return successOutput;
}

const conf = getConfig()
const labels = getLabels()
if ( mergeableByLabel(conf.labels, labels) ) {
    const result:Promise<Output> = mergePullRequest(conf)
    result.then(function(output){
        setOutput(output)
    })
} else {
    setOutput({result: "skipped"} as Output)
}
