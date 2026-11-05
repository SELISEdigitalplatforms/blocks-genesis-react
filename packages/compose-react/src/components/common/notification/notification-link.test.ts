import { describe, expect, it } from "vitest";
import { getNotificationHref, getNotificationLink } from "./notification-link";

const payload = (fields: Record<string, unknown>) => JSON.stringify(fields);
const PROJECT = "project-1";
const LOGIC = "blocks-logic";
const FUNCTION_RUN_FAILED = "FunctionRunFailed";
const FUNCTION_ID = "fn-1";

describe("getNotificationHref", () => {
  it("opens the failed workflow run on the executions tab", () => {
    const raw = payload({
      event: "WorkflowRunFailed",
      workflowId: "wf-1",
      executionId: "ex-1",
    });

    expect(getNotificationHref(raw, LOGIC, PROJECT)).toBe(
      "/app/project-1/workflow/wf-1?tab=executions&executionId=ex-1",
    );
  });

  it("opens the failed function run", () => {
    const raw = payload({
      event: FUNCTION_RUN_FAILED,
      functionId: FUNCTION_ID,
      runId: "run-1",
    });

    expect(getNotificationHref(raw, LOGIC, PROJECT)).toBe(
      "/app/project-1/functions/fn-1?tab=runs&runId=run-1",
    );
  });

  it("opens nothing when the page lives in another app", () => {
    const raw = payload({
      event: FUNCTION_RUN_FAILED,
      functionId: FUNCTION_ID,
      runId: "run-1",
    });

    expect(getNotificationHref(raw, "blocks-data", PROJECT)).toBeNull();
  });

  it("opens nothing for a project page when no project is open", () => {
    const raw = payload({
      event: FUNCTION_RUN_FAILED,
      functionId: FUNCTION_ID,
    });

    expect(getNotificationHref(raw, LOGIC, undefined)).toBeNull();
  });

  it("opens a project-group page without an open project", () => {
    const raw = payload({
      event: "project-setup-failed",
      tenantGroupId: "g-1",
    });

    expect(getNotificationHref(raw, "blocks-os", undefined)).toBe(
      "/app/project/g-1/environments",
    );
  });

  it("encodes ids so a payload cannot change the path", () => {
    const raw = payload({
      event: "FunctionBuildFinished",
      functionId: "../../console?x=1",
    });

    expect(getNotificationHref(raw, LOGIC, PROJECT)).toBe(
      "/app/project-1/functions/..%2F..%2Fconsole%3Fx%3D1",
    );
  });
});

describe("getNotificationLink", () => {
  it("ignores a redirectPath in the payload", () => {
    expect(
      getNotificationLink(
        payload({ event: "unknown", redirectPath: "https://evil.example" }),
      ),
    ).toBeNull();
  });

  it("opens nothing when the id is missing or blank", () => {
    expect(
      getNotificationLink(
        payload({ event: "WorkflowRunFailed", workflowId: " " }),
      ),
    ).toBeNull();
  });

  it("opens nothing for a payload that is not JSON", () => {
    expect(getNotificationLink("not json")).toBeNull();
  });

  it("does not treat object prototype keys as events", () => {
    expect(getNotificationLink(payload({ event: "toString" }))).toBeNull();
  });

  it("opens the function list when the function was deleted", () => {
    const raw = payload({
      event: "FunctionChangedByOther",
      functionId: FUNCTION_ID,
      action: "deleted",
    });

    expect(getNotificationLink(raw)?.path).toBe("functions");
  });

  it("opens the repository when an auto deploy did not start a build", () => {
    const raw = payload({
      event: "release-auto-deploy-status",
      repoId: "r-1",
      buildId: null,
    });

    expect(getNotificationLink(raw)?.path).toBe("deployment/repo/r-1");
  });

  it("opens the analysis tab of the build", () => {
    const raw = payload({
      event: "release-code-analysis-finished",
      repoId: "r-1",
      buildId: "b-1",
      analysisType: "SCA",
    });

    expect(getNotificationLink(raw)?.path).toBe(
      "deployment/repo/r-1/deployment-logs/b-1?tab=sca",
    );
  });
});
