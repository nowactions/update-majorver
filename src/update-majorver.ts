import * as core from "@actions/core";
import { getOctokit, context } from "@actions/github";

const REFS_TAG = "refs/tags/";

export default async function run(): Promise<void> {
  try {
    const token = core.getInput("github_token");
    const octokit = getOctokit(token);

    if (!context.ref.startsWith(REFS_TAG)) {
      core.setFailed("ref is not a tag");
      return;
    }

    const tag = context.ref.substring(REFS_TAG.length);
    const regex = /^v?(?<major>\d+)\.\d+\.\d+$/;
    const match = tag.match(regex);
    if (match?.groups?.major == null) {
      core.setFailed(
        "tags require semantic versioning format like v1.2.3 or 1.2.3"
      );
      return;
    }

    const major = `v${match.groups.major}`;
    const sha = context.payload.head_commit.id;

    const refParams = {
      owner: context.repo.owner,
      repo: context.repo.repo,
      ref: REFS_TAG + major,
    };

    let ref;
    try {
      ref = await octokit.git.getRef(refParams);
      core.info(`tag ${major} already exists`);
    } catch (error) {
      core.info(`tag ${major} does not exist yet`);
    }

    if (ref) {
      await octokit.git.updateRef({
        ...refParams,
        sha,
        force: true,
      });
    } else {
      await octokit.git.createRef({
        ...refParams,
        sha,
      });
    }
  } catch (error) {
    core.setFailed(error.message);
  }
  return;
}
