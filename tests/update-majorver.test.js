jest.mock("@actions/core");

const core = require("@actions/core");
const run = require("../src/update-majorver");

describe("Update Major Version", () => {
  test("Greet is returned", async () => {
    core.getInput = jest.fn().mockReturnValueOnce("world");

    core.setOutput = jest.fn();

    await run();

    expect(core.setOutput).toHaveBeenNthCalledWith(1, "result", "Hello, world");
  });
});
