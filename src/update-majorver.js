const core = require("@actions/core");
const { GitHub, context } = require("@actions/github");

async function run() {
  try {
    const token = core.getInput("github_token");
    const octokit = new GitHub(token);

    if (!context.ref.match(/^refs\/tags\/.+$/)) {
      core.setFailed("ref is not a tag");
      return;
    }

    if (!context.ref.match(/^refs\/tags\/v\d+\.\d+\.\d+$/)) {
      core.setFailed("tags require semantic versioning format like v1.2.3");
      return;
    }

    const tag = context.ref.split("/")[2];
    const major = tag.split(".")[0];
    const sha = context.payload.head_commit.id;

    const getRefParams = {
      owner: context.repo.owner,
      repo: context.repo.repo,
      ref: `tags/${major}`
    };

    let ref;
    try {
      ref = await octokit.git.getRef(getRefParams);
      core.info(`tag ${major} already exists`);
    } catch (error) {
      core.info(`tag ${major} does not exist yet`);
    }

    if (ref) {
      await octokit.git.updateRef({
        ...getRefParams,
        sha,
        force: true
      });
    } else {
      await octokit.git.createRef({
        ...getRefParams,
        sha,
        ref: `refs/tags/${major}`
      });
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

module.exports = run;
