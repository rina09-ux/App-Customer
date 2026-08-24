# Stage 4 — App-Customer Core Contract Review

## Scope

The customer application must treat NusaSec-Core as the authoritative mutation plane. Customer UI state must not become an alternate source of truth.

## Completed in this branch

- Billing checkout, subscription change, cancel/reactivate, and payment setup now use `requestCore`, which automatically obtains and sends the Core CSRF token for state-changing requests.
- PQC Migration Center plan creation, simulation, and lifecycle transition now use `requestCore` for the same mutation boundary.
- Organization member invitations already use `requestCore` and therefore preserve the Core CSRF contract.
- Customer tenant settings already use `requestCore` for persistence.
- Cloud account create/validate/scan APIs already use `requestCore` through `assetsCloudApi.ts`.

## Read-only direct fetches

Read-only GET requests may use direct fetch because CSRF is not required by the Core request contract. They must still read from Core and must not invent local authoritative data.

## Verification rule

For every customer mutation:

1. UI submits to Core.
2. Core validates authorization, tenant, billing/security policy, and CSRF.
3. Core persists the state.
4. UI refreshes from Core/readback after success.
5. On failure, UI must not close/commit as if the mutation succeeded.

## Remaining runtime verification

The code-level contract is complete for the reviewed customer mutation surfaces. Runtime verification must still prove the complete path against a live Core + PostgreSQL environment before production deployment.
