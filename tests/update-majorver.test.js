jest.mock("@actions/core");
jest.mock("@actions/github");

const core = require("@actions/core");
const { GitHub, context } = require("@actions/github");
const run = require("../src/update-majorver");

describe("Update Major Version", () => {
  let updateRef, createRef;

  beforeEach(() => {
    core.getInput = jest.fn().mockReturnValueOnce("mygithubtoken");
    context.ref = "refs/tags/v1.2.3";
    context.repo = { owner: "nowactions", repo: "update-majorver" };
    context.payload = { head_commit: { id: "commit_sha" } };

    updateRef = jest.fn();
    createRef = jest.fn();
  });

  test("Create a new major tag", async () => {
    const github = {
      git: {
        getRef: async () => {
          throw "error";
        },
        createRef
      }
    };
    GitHub.mockImplementation(() => github);

    await run();

    expect(createRef).toHaveBeenCalledWith({
      owner: "nowactions",
      repo: "update-majorver",
      ref: "refs/tags/v1",
      sha: "commit_sha"
    });
  });

  test("Update an existing major tag", async () => {
    const github = {
      git: {
        getRef: async () => true,
        updateRef
      }
    };
    GitHub.mockImplementation(() => github);

    await run();

    expect(updateRef).toHaveBeenCalledWith({
      owner: "nowactions",
      repo: "update-majorver",
      ref: "tags/v1",
      sha: "commit_sha",
      force: true
    });
  });

  test("Fails", async () => {
    const github = {
      git: {
        getRef: async () => true,
        updateRef: jest.fn().mockRejectedValue(new Error("error"))
      }
    };
    GitHub.mockImplementation(() => github);
    core.setFailed = jest.fn();

    await run();

    expect(core.setFailed).toHaveBeenCalledWith("error");
  });

  test("Fails with not tag reference", async () => {
    context.ref = "refs/heads/master";
    core.setFailed = jest.fn();

    await run();

    expect(core.setFailed).toHaveBeenCalledWith("ref is not a tag");
  });

  test("Fails with not semantic versioning tag", async () => {
    context.ref = "refs/tags/v1.2";
    core.setFailed = jest.fn();

    await run();

    expect(core.setFailed).toHaveBeenCalledWith(
      "tags require semantic versioning format like v1.2.3"
    );
  });
});
