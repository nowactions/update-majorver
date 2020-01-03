const core = require("@actions/core");

async function run() {
  try {
    const name = core.getInput("name");
    console.log(`Hello, ${name}`);
    core.setOutput("result", `Hello, ${name}`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

module.exports = run;
