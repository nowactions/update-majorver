import * as core from "@actions/core";
import { getOctokit, context } from "@actions/github";

const TAGS = "tags/";
const REFS_TAGS = "refs/" + TAGS;

export default async function run(): Promise<void> {
  try {
    const token = core.getInput("github_token");
    const octokit = getOctokit(token);

    if (!context.ref.startsWith(REFS_TAGS)) {
      core.setFailed("ref is not a tag");
      return;
    }

    const tag = context.ref.substring(REFS_TAGS.length);
    const regex = /^v?(?<major>\d+)\.\d+\.\d+$/;
    const match = tag.match(regex);
    if (match?.groups?.major == null) {
      core.setFailed(
        "tags require semantic versioning format like v1.2.3 or 1.2.3"
      );
      return;
    }

    const major = `v${match.groups.major}`;

    const refParams = {
      owner: context.repo.owner,
      repo: context.repo.repo,
    };

    let ref;
    try {
      ref = await octokit.git.getRef({
        ...refParams,
        ref: TAGS + major,
      });
      core.info(`tag ${major} already exists`);
    } catch (error) {
      if (core.isDebug()) {
        core.debug(error);
      }
      core.info(`tag ${major} does not exist yet`);
    }

    if (ref) {
      await octokit.git.updateRef({
        ...refParams,
        ref: TAGS + major,
        sha: context.sha,
        force: true,
      });
    } else {
      await octokit.git.createRef({
        ...refParams,
        ref: REFS_TAGS + major,
        sha: context.sha,
      });
    }
  } catch (error) {
    if (core.isDebug()) {
      core.debug(error);
    }
    core.setFailed(error.message);
  }
  return;
}
