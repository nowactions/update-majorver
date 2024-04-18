"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const core = __importStar(require("@actions/core"));
const github_1 = require("@actions/github");
const REFS_TAG = "refs/tags/";
function run() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const token = core.getInput("github_token");
            const octokit = new github_1.GitHub(token);
            if (!github_1.context.ref.startsWith(REFS_TAG)) {
                core.setFailed("ref is not a tag");
                return;
            }
            const tag = github_1.context.ref.substring(REFS_TAG.length);
            const regex = /^v?(?<major>\d+)\.\d+\.\d+$/;
            const match = tag.match(regex);
            if (((_a = match === null || match === void 0 ? void 0 : match.groups) === null || _a === void 0 ? void 0 : _a.major) == null) {
                core.setFailed("tags require semantic versioning format like v1.2.3 or 1.2.3");
                return;
            }
            const major = `v${match.groups.major}`;
            const sha = github_1.context.payload.head_commit.id;
            const refParams = {
                owner: github_1.context.repo.owner,
                repo: github_1.context.repo.repo,
                ref: REFS_TAG + major,
            };
            let ref;
            try {
                ref = yield octokit.git.getRef(refParams);
                core.info(`tag ${major} already exists`);
            }
            catch (error) {
                core.info(`tag ${major} does not exist yet`);
            }
            if (ref) {
                yield octokit.git.updateRef(Object.assign(Object.assign({}, refParams), { sha, force: true }));
            }
            else {
                yield octokit.git.createRef(Object.assign(Object.assign({}, refParams), { sha }));
            }
        }
        catch (error) {
            core.setFailed(error.message);
        }
        return;
    });
}
exports.default = run;
