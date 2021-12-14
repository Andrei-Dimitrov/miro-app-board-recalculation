require("dotenv").config();

const rally = require("./rally-api");

const main = async () => {
  const workspaceRef = `/workspace/${process.env.WORKSPACE_ID}`;

  const rallyApi = rally({
    requestOptions: {
      headers: {
        "X-RallyIntegrationName": "Andrew's miro plugin integration",
        "X-RallyIntegrationVendor": "EBSCO",
        "X-RallyIntegrationVersion": "1.0",
      },
    },
  });

  const refUtils = rally.util.ref;
  const queryUtils = rally.util.query;

  const { Results: iterations } = await rallyApi.query({
    type: "iteration",
    limit: 1,
    query: queryUtils
      .where("Project.Name", "contains", "UX.Codebots")
      .and("Name", "contains", "PI24 I6.1"),
    fetch: ["FormattedID", "Name", "Project"],
    scope: {
      workspace: workspaceRef,
    },
  });

  const i6Iteration = iterations[0];

  const { Results: releases } = await rallyApi.query({
    type: "release",
    limit: 1,
    query: queryUtils
      .where("Project.Name", "contains", "UX.Codebots")
      .and("Name", "contains", "PI 24"),
    fetch: ["FormattedID", "Name"],
    scope: {
      workspace: workspaceRef,
    },
  });

  const latestRelease = releases[0];

  const {
    Results: [predecessor],
  } = await rallyApi.query({
    type: "hierarchicalrequirement",
    limit: 1,
    query: queryUtils.where("FormattedID", "=", "US888745"),
    fetch: ["Name", "Successors"],
    scope: {
      workspace: workspaceRef,
    },
  });

  console.debug("predecessor", predecessor);

  const {
    Results: [successor],
  } = await rallyApi.query({
    ref: refUtils.getRef(predecessor.Successors),
    fetch: ["FormattedID", "Name", "Predecessors"],
  });

  const { Object } = await rallyApi.get({
    ref: refUtils.getRef(successor),
    fetch: ["FormattedID", "Name", "Predecessors"],
  });

  console.debug("Object", Object);

  // if (i6Iteration && latestRelease) {
  //   const result = await rallyApi.create({
  //     type: "hierarchicalrequirement",
  //     fetch: ["FormattedID", "Name"],
  //     data: {
  //       Name: "This story was created by the Rally API",
  //       Iteration: i6Iteration,
  //       Release: latestRelease,
  //       Project: i6Iteration.Project,
  //     },
  //   });
  //
  //   console.debug("result", result);
  // }
};

main();
