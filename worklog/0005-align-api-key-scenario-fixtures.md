# Commit Title

fix(api-key): align existing scenario fixtures with reconciliation

# Changed File Scope

Existing SettingsPage component scenarios and this worklog.

# Reason

PR #3 CI found four existing scenario failures: two profile badge scenarios
waited for an unrelated eager API Key fetch, pagination assumed ascending IDs,
and status mutations did not persist into the mocked server list.

# Design

Keep the existing six scenarios. Remove unrelated fetch waits from badge cases,
assert descending created-at/ID ordering, and persist status mutation results in
the same mock list returned by subsequent reloads.

# Verification Plan

Run make check and make build; required PR CI exercises the existing scenarios.
No new test cases or local test execution requested.

# Impact

Existing mocks now represent persisted server state. Production code is unchanged.

# Loop Alignment

Scenario fixtures follow authoritative HTTP list reconciliation. Backend and UI
composition loops are unchanged; no background task change applies.

# Verification

Initial required PR CI: 47 passed, four failed with the causes described above.
make check and make build passed. Subsequent required CI results are recorded
in PR history.
