# Table of contents
0. [Cypress + Cucumber Demo](#exercise)
   - [Assumptions](#exercise-assumptions)
   - [How to run](#exercise-run)
   - [Coverage matrix](#exercise-coverage)
1. [QA Strategy](#paragraph1)
   - [Automation vs Manual Testing](#qa-automation-vs-manual)
     - [What Should Be Automated](#qa-what-automate)
     - [What Should Remain Manual or Semi-Automated](#qa-what-manual)
   - [Prioritization Framework: Risk-Value Matrix](#qa-prioritization)
   - [CI/CD Integration Strategy](#qa-ci)
2. [Repository & Team Structure](#paragraph2)
   - [Proposed Repository Organization](#paragraph2-structure)
   - [Naming Conventions](#paragraph2-naming)
     - [Feature Files](#naming-feature-files)
     - [Step Definition Files](#naming-step-definitions)
     - [Page Objects](#naming-page-objects)
     - [Test Data Fixtures](#naming-fixtures)
   - [Tagging Strategy](#paragraph2-tagging)
   - [Maintainability Principles](#paragraph2-maintainability)
3. [Mentoring & Collaboration](#paragraph3)
   - [Junior QA Onboarding Plan](#paragraph3-onboarding)
     - [Week 1](#onboarding-week1)
     - [Week 2](#onboarding-week2)
     - [PR Review](#junior-pr)
   - [Collaboration: Quality as a Shared Responsibility](#paragraph3-collaboration)
     - [Working with Developers](#paragraph3-collab-devs)
     - [Working with Product Managers](#paragraph3-collab-pm)
4. [Vision & Continuous Improvement](#paragraph4)
   - [QA Metrics](#paragraph4-metrics)
     - [Test Suite Health Metrics](#paragraph4-health)
     - [Quality Coverage Metrics](#paragraph4-coverage)
     - [Velocity & Efficiency Metrics](#paragraph4-velocity)
   - [Improvement Initiatives](#paragraph4-initiatives)
     - [Initiative 1: Regular Bug Bash Program](#paragraph4-initiative1)
     - [Initiative 2: Test Strategy Template for New Features](#paragraph4-initiative2)
     - [Initiative 3: QA Knowledge Hub](#paragraph4-initiative3)




# 0. Cypress + Cucumber demo — Bank Transfer <a name="exercise"></a>

## Assumptions <a name="exercise-assumptions"></a>
- Tests execute against a tiny static app served from `public/`.
- Different roles are simulated via `window.__setRole(role)`.
- Stable selectors use `data-testid` attributes in `public/index.html`
- Dynamic dates: steps compute `tomorrow`/`yesterday` at runtime
- Tests are written in TypeScript and use `@badeball/cypress-cucumber-preprocessor`

## How to run <a name="exercise-run"></a>
1. Install dependencies

```bash
npm install
```

2. Run full test suite (starts a static server and runs Cypress headless)

```bash
npm test
```

3. Or run server and tests separately

```bash
npm run start
npm run test:cypress:run
```

### Troubleshooting & selective runs

- If port 8080 is in use: change `-p 8080` in `package.json` or stop the process.
- If Cypress binary missing: run `npx cypress install`.
- Run only happy-path tests: `npx cypress run -e TAGS='@happy'`.
- Run only boundary tests: `npx cypress run -e TAGS='@boundary'`.

## Coverage matrix <a name="exercise-coverage"></a>

| Criteria | Scenario/Notes |
| --- | --- |
| Happy path – Instant | Scenario: Happy path - Instant transfer with valid data |
| Happy path – Scheduled (tomorrow) | Scenario: Happy path - Scheduled transfer for tomorrow |
| Invalid case – IBAN | Scenario: Invalid IBAN length (short) |
| Invalid case – Label | Scenario: Invalid label with special characters |
| Amount boundaries | Scenario Outline: Amount boundary checks |
| IBAN boundaries | Scenario Outline: IBAN boundary length |
| Date boundaries | Scenario Outline: Date boundary checks (tomorrow/yesterday) |
| RBAC access control | Scenario: Access control - non-authorized user cannot create transfer |

# 1. QA Strategy <a name="paragraph1"></a>

## Automation vs Manual Testing <a name="qa-automation-vs-manual"></a>

### What Should Be Automated <a name="qa-what-automate"></a>
**Priority 1 - Critical Business Flows**
- User authentication and authorization 
- Core transaction flows 
- Data validation rules 
- API contract tests for critical endpoints
- Smoke tests for deployment verification

**Priority 2 - Performance & Integration**
- API response times (performance benchmarks)
- App launch time and responsiveness
- App installation and update
- Memory usage monitoring
- Third-party integrations (eg: payment gateways)

**Priority 3 - UX Regression Prevention**
- Desktop: Keyboard shortcuts, window management, copy/paste
- Mobile: Touch gestures, orientation changes, app lifecycle
- Cross-platform: Navigation flows, form validations

### What Should Remain Manual or Semi-Automated <a name="qa-what-manual"></a>
**User Acceptance and Exploratory Testing** 
- New feature exploration 
- User acceptance testing with Product team
- User experience and usability issues 
- Complex user journeys with variable paths
- Edge cases
- Security testing (penetration, vulnerability scanning)

**Device/Platform Fragmentation Testing** (Can be semi-automated)
- Mobile: Test on real devices with different:
  - Screen sizes 
  - OS versions 
  - Manufacturers 
  - Network conditions (airplane mode, slow 3G, WiFi)
- Desktop: Different OS versions

**Visual Regression** (Can be tool-assisted manual) 
- UI component appearance 
- Responsive design across devices (desktop resolutions, mobile screen sizes)
- Accessibility compliance 
- Brand consistency and design system adherence
- Native platform conventions (eg: iOS vs Android design patterns)
- Dark mode vs Light mode appearance


### Prioritization Framework: Risk-Value Matrix <a name="qa-prioritization"></a>

```
High Risk, High Value → AUTOMATE FIRST (Critical paths)
High Risk, Low Value  → AUTOMATE (Performance, Regression prevention)
Low Risk, High Value  → MANUAL + AUTOMATION WHERE POSSIBLE (UX, new features, Edge cases)
Low Risk, Low Value   → SKIP or MINIMAL MANUAL TESTS (Non-critical edge cases)
```
### CI/CD Integration Strategy <a name="qa-ci"></a>

```yaml
# .github/workflows/qa-pipeline.yml (example)
stages:
  - smoke:    Run on every commit (3-5 min) 
  - regression-all:   Run on PR merge (15-30)
  - nightly:      Run nightly (60-90 min)
```

| Pipeline Stage | Tags | Frequency | Goal |
| -------------- | ---- | --------- | ---- |
| **Smoke** | `@smoke @critical` | Every commit | Fast feedback (5 min) |
| **Regression** | `@regression` | Every PR merge | Full confidence on merge |
| **Nightly** | `@e2e @integration` | Nightly 2 AM | Catch integration issues |

(More details on test tagging below)

# 2. Repository & Team Structure <a name="paragraph2"></a>

## Proposed Repository Organization <a name="paragraph2-structure"></a>

```
qa-automation/
├── .github/
│   └── workflows/
│       ├── smoke-tests.yml          # Runs on every commit
│       ├── regression-tests.yml      # Runs on PR merge
│       └── nightly-tests.yml         # Runs daily at 2 AM
│
├── cypress/
│   ├── e2e/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   ├── login.feature
│   │   │   │   └── rbac.feature
│   │   │   ├── transfers/
│   │   │   │   ├── bank_transfer_creation.feature
│   │   │   │   ├── bank_transfer_validation.feature
│   │   │   │   └── bank_transfer_scheduling.feature
│   │   │   └── payments/
│   │   │       └── ...
│   │   │
│   │   ├── step_definitions/
│   │   │   ├── auth/
│   │   │   │   └── login.steps.ts
│   │   │   ├── transfers/
│   │   │   │   └── bank_transfer.steps.ts
│   │   │   └── common/
│   │   │       └── navigation.steps.ts
│   │   │
│   │   └── pages/                    # Page Object Models
│   │       ├── LoginPage.ts
│   │       ├── TransferPage.ts
│   │       └── BasePage.ts
│   │
│   ├── fixtures/
│   │   ├── users/
│   │   │   ├── admin.json
│   │   │   └── purchase_manager.json
│   │   ├── transfers/
│   │   │   └── valid_transfers.json
│   │   └── test_data.json
│   │
│   ├── support/
│   │   ├── commands.ts               # Custom Cypress commands
│   │   ├── selectors.ts              # Centralized selector map
│   │   ├── helpers/
│   │   │   ├── dateHelpers.ts
│   │   │   ├── currencyHelpers.ts
│   │   │   └── validationHelpers.ts
│   │   └── e2e.ts                    # Global hooks
│   │
│   └── plugins/
│       └── index.ts
│
├── docs/
│   ├── CONTRIBUTING.md               # How to write tests
│   ├── CONVENTIONS.md                # Naming & tagging rules
│   ├── ONBOARDING.md                 # Junior QA guide
│   └── ARCHITECTURE.md               # Repository structure
│
├── scripts/
│   ├── generate-report.js            # Test report generator
│   └── check-flaky-tests.js          # Flakiness detector
│
├── .eslintrc.js                      # Code quality
├── .prettierrc                       # Code formatting
├── cypress.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Naming Conventions <a name="paragraph2-naming"></a>

### Feature Files <a name="naming-feature-files"></a>
**Pattern**: `[domain]_[action]_[context].feature`

Examples:
- `bank_transfer_creation.feature`
- `user_authentication.feature`
- `invoice_payment_validation.feature`

### Step Definition Files <a name="naming-step-definitions"></a>
**Pattern**: `[feature_name].steps.ts`

Examples:
- `bank_transfer.steps.ts`
- `login.steps.ts`

### Page Objects <a name="naming-page-objects"></a>
**Pattern**: `[PageName]Page.ts`

Examples:
- `TransferPage.ts`
- `LoginPage.ts`

### Test Data Fixtures <a name="naming-fixtures"></a>
**Pattern**: `[entity]_[context].json`

Examples:
- `users_admin.json`
- `transfers_valid.json`
- `transfers_invalid.json`

## Tagging Strategy <a name="paragraph2-tagging"></a>

**Test Level Tags**
- `@smoke` - Critical path tests (5 min suite)
- `@regression` - Full regression suite
- `@integration` - Tests involving multiple systems
- `@e2e` - Full end-to-end user journeys

**Feature Domain Tags**
- `@auth` - Authentication/authorization
- `@transfer` - Bank transfer features
- `@payment` - Payment processing

**Test Type Tags**
- `@happy-path` - Successful scenarios
- `@validation` - Input validation tests
- `@boundary` - Edge case testing
- `@error-handling` - Error scenarios
- `@rbac` - Role-based access control

**Priority Tags**
- `@critical` - Cannot ship without these passing
- `@high` - Important but not blocking
- `@medium` - Not blocking but should pass
- `@low` - Nice to have

**Maintenance Tags**
- `@flaky` - Known flaky tests (quarantine)
- `@wip` - Work in progress (skip in CI)
- `@skip` - Temporarily disabled

**Environment Tags**
- `@staging-only` - Only runs in staging
- `@production-safe` - Safe to run in prod

### Tag Usage Example
```gherkin
@transfer @smoke @critical @happy-path
Scenario: Create instant bank transfer with valid data
```
## Maintainability Principles <a name="paragraph2-maintainability"></a>

**Separation of Concerns**
- **Feature files**: Business logic only (what to test)
- **Step definitions**: Test implementation (how to test)
- **Page Objects**: UI interactions (where to interact)
- **Helpers**: Reusable utilities (shared logic)

**DRY (Don't Repeat Yourself)**
- Shared step definitions in `common/`
- Reusable helpers
- Custom Cypress commands for frequent actions
- Centralized selectors in `selectors.ts`

**Single Responsibility**
- One feature file per major functionality
- One step definition file per feature domain
- One Page Object per application page

**Version Control**
- Feature branches: `feature/QA-123-add-transfer-tests`
- PR template requires: test coverage, tags, documentation
- Mandatory code review

# 3. Mentoring & Collaboration <a name="paragraph3"></a>

## Junior QA Onboarding Plan (First 2 Weeks) <a name="paragraph3-onboarding"></a>

### Week 1: <a name="onboarding-week1"></a>
**Day 1-3: Welcome, Setup, Learn Product**
- Meet the squad (QA, Dev, PM)
- Setup development environment (Node, Cypress, IDE)
- Clone repos, run existing tests locally
- Read documentation
- Product walkthrough with PM
- Explore product to understand key user journeys
- Exercise: Manually test feature, document findings
- Exercise: Verify recent bugfixes

**Day 4-5: Learn the Tools**
- Get familiar with internal project/test management tools (JIRA, Bug Backlogs, Test management tools, etc)
- Cypress fundamentals workshop with senior QA
- Gherkin syntax and best practices
- Pair programming: Modify existing test with senior QA
- Exercise: Add one new scenario to existing feature

### Week 2: <a name="onboarding-week2"></a>
**Day 6-7: Guided Test Writing**
- Assign: Write tests for a small, low-risk feature
- Provide: Detailed requirements, example tests
- Check-in: Daily 30-min pairing session
- Goal: Complete 2-3 basic scenarios

**Day 8-9: Code Review & Iteration**
- Submit first PR
- Receive detailed code review
- Iterate: Apply feedback, ask questions
- Learn: PR template, CI pipeline, test execution

**Day 10: Present Work, Feedback on Onboarding**
- Present tests to the team
- Participate in QA chapter meeting, share learnings
- Discuss: What was challenging about onboarding? What helped? What can we improve?
- Next steps: Assign next ticket, set goals for week 3

### Code Review Checklist for Junior QA PRs <a name="junior-pr"></a>

**Gherkin Quality**
- [ ] Scenarios written in business language (no technical details)
- [ ] Given/When/Then structure followed correctly
- [ ] Appropriate tags applied
- [ ] Scenario names clearly describe the test case
- [ ] No duplication with existing scenarios

**Code Quality**
- [ ] Step definitions reuse existing steps when possible
- [ ] Selectors use data-testid or stable attributes
- [ ] No hard-coded waits (use assertions instead)
- [ ] Error messages are clear and actionable
- [ ] Code follows naming conventions

**Test Design**
- [ ] Tests are independent (no dependencies between scenarios)
- [ ] Test data is dynamic (no hard-coded dates)
- [ ] Positive and negative cases covered
- [ ] Tests run quickly
- [ ] Tests clean up after themselves

**Documentation**
- [ ] README updated if needed
- [ ] Comments explain "why" not "what"
- [ ] Coverage matrix updated

### Review Process
1. **Async review first**: Leave comments in GitHub
2. **Sync discussion**: In person discussion/feedback if needed
3. **Pair debugging**: If tests fail, debug together
4. **Re-review**: Check iterations
5. **Merge & celebrate**: Acknowledge the contribution publicly

## Collaboration: Quality as a Shared Responsibility <a name="paragraph3-collaboration"></a>

### Working with Developers <a name="paragraph3-collab-devs"></a>

**1. Shift Left: Early Collaboration**
- **Requirement Review**: QA joins refinement meetings
- **Testability Review**: QA reviews technical designs for test hooks, suggests testability/debugging improvements
- **Definition of Done**: Tests written before deployment
- **Quality Gates**: Agree on expected test coverage in line with testing pyramid 

**2. Test-Friendly Development**
- **Test Hooks Convention**: All interactive elements have `data-testid`
- **API Contracts**: API specs for contract testing
- **Test Environments**: Devs maintain staging environment quality and reliability

**3. Shared Rituals**
- **Test Retrospective**: Regular review of test suite health
- **Knowledge Sharing**: Devs and QA present and share knowledge on testing tools/techniques

### Working with Product Managers <a name="paragraph3-collab-pm"></a>

**1. Requirements Clarification**
- **Gherkin as Specification**: PMs review feature files before coding
- **Edge Case Discovery**: QA asks "what if..." questions early
- **Acceptance Criteria**: QA helps PMs write testable acceptance criteria
- **Test Documentation**: QA demonstrates test coverage to PMs

**2. Risk Assessment**
- **Impact Analysis**: QA identifies high-risk changes
- **Testing Strategy**: QA proposes manual vs automated split
- **Release Confidence**: QA provides go/no-go recommendation

**3. Metrics Review**
- **Monthly Business Review**: QA presents quality metrics to PMs
- **Feature Quality**: Test coverage, bug counts, user issues
- **Velocity Impact**: How testing affects delivery speed

# 4. Vision & Continuous Improvement <a name="paragraph4"></a>

## QA Metrics <a name="paragraph4-metrics"></a>

### Test Suite Health Metrics <a name="paragraph4-health"></a>

**Flaky Test Rate** (Target: <2%)
```
Flaky Rate = (Flaky Tests / Total Tests) × 100
```
- **Track**: Which tests fail inconsistently
- **Action**: Quarantine flaky tests, fix within 1 week

**Test Execution Time** (Target: <20 min for regression)
```
CI Duration by Pipeline:
- Smoke: 3-5 min
- Regression: 15-20 min
- Full: 45-60 min
```
- **Track**: Duration trends over time
- **Action**: Parallelize slow tests, remove redundant tests


**Test Maintenance Cost** (Target: <10% of QA time)
```
Maintenance % = (Hours on Test Fixes / Total QA Hours) × 100
```
- **Track**: Time spent fixing broken tests vs writing new tests
- **Action**: If >10%, refactor flaky tests

### Quality Coverage Metrics <a name="paragraph4-coverage"></a>

**Critical Path Coverage** (Target: 100%)
```
Coverage = (Automated Critical Scenarios / Total Critical Scenarios) × 100
```
- **Track**: Coverage matrix (business critical → test scenario)
- **Action**: Ensure coverage for critical flows


**Code Coverage** (Target: >80% for E2E-testable code)
- **Track**: Which areas lack coverage
- **Action**: Integrate with code coverage reports from unit tests, fill gaps with E2E tests

**Bug Escape Rate** (Target: <5%)
```
Escape Rate = (Bugs Found in Prod / Total Bugs) × 100
```
- **Track**: Bugs that passed testing and reached production
- **Action**: Root cause analysis, add regression tests


### Velocity & Efficiency Metrics <a name="paragraph4-velocity"></a>

**Test Automation Ratio** (Target: 70-80%)
```
Automation % = (Automated Tests / Total Test Cases) × 100
```
- **Track**: Balance between automated and manual tests
- **Action**: Automate repetitive, high-value scenarios

**Mean Time to Detect (MTTD)** (Target: <1 hour)
```
MTTD = Average time from deployment to test failure detection
```
- **Track**: How quickly CI catches regressions
- **Action**: Modify tags to ensure automated coverage of fragile areas

**Mean Time to Resolve (MTTR)** (Target: <4 hours)
```
MTTR = Average time from test failure to fix deployed
```
- **Track**: How quickly team fixes broken tests
- **Action**: Clear failure messages, good debugging tools

**Metrics on Bug Backlogs** 
```
Open Bugs Count per squad, per platform, etc
Bug Age / Time in Backlog
Bug Resolution Rate (Burndown Rates of Open vs Closed Bugs)
Bug Severity Distribution
```
- **Track**: Trends on bug backlogs
- **Action**: Identify priority areas for improvements

## Improvement Initiatives <a name="paragraph4-initiatives"></a>

### Initiative 1: Regular Bug Bash Program <a name="paragraph4-initiative1"></a>

**Problem**: Undiscovered bugs in production, inconsistent exploratory testing, lack of shared ownership of quality

**Solution**: Recurring, cross-functional Bug Bash sessions to encourage collaborative exploratory testing, leverage different perspectives to uncover edge cases, foster quality ownership among all team members

**Implementation Plan:**
- **Phase 1**: Schedule Bug Bash events, define target scope (feature, release, area)
- **Phase 2**: Provide testing charters, clear reporting instructions, incentives to participants
- **Phase 3**: Review findings, triage bugs, and assign follow-ups
- **Ongoing**: Track trends in bug quality/volume, improve sessions based on feedback

**Success Metrics:**
- Number of valid bugs found per session
- % of critical bugs found pre-release
- Reduction in escaped defects over time
- Participation rate

**Risks and Mitigation:**
- Risk: Low engagement or lack of participation
- Mitigation: Involve cross-functional leads, offer small incentives and recognition (best bug, best repro steps, etc)

- Risk: Bug reports are low-quality or duplicated
- Mitigation: Provide clear bug reporting guidelines and examples, assign a QA lead to triage bugs in real-time

- Risk: Time-consuming to organize and follow up
- Mitigation: Standardize planning materials (charters, bug reports templates), embed follow-ups into existing squad workflows

### Initiative 2: Test Strategy Template for New Features <a name="paragraph4-initiative2"></a>

**Problem**: New features often lack a clearly defined and consistent test strategy upfront, gaps in coverage, duplicated test efforts, delays in identifying risks

**Solution**: Test strategy template to be filled out during kickoff or early project planning, the template will define what will be tested, how it will be tested (manual vs automation), by whom, and at which levels (unit, integration, end-to-end)

**Implementation Plan:**
- **Phase 1**: Create a lightweight, reusable test strategy template to include: test types and ownership, tooling, automated vs manual, known risks and untestable areas
- **Phase 2**: Embed template usage into project kickoff docs, tech specs, or Jira tickets; onboard squads with examples (one squad can serve as pilot)
- **Phase 3**: Require test strategy completion before development begins; 3 amigos reviews for alignment on strategy
- **Ongoing**: Iterate based on feedback and findings, adapt to squad needs, audit adoption rate, and integrate into definition of ready

**Success Metrics:**
- % of new features/projects with a documented test strategy before dev starts
- Reduction in late-cycle test coverage gaps or testing scope creep
- Improved clarity of test responsibilities across QA and dev
- Increased automation coverage aligned with strategy

**Risks and Mitigation:**
- Risk: Teams view the template as overhead or skip it
- Mitigation: Keep the template lightweight, embed it in existing planning rituals, and show benefits (eg: fewer missed edge cases)

- Risk: Strategies are filled out superficially or copy-pasted
- Mitigation: QA reviewers provide feedback and examples; reinforce accountability by tying quality issues back to incomplete planning

- Risk: Misalignment between QA and dev on testing scope
- Mitigation: Use the template as a collaboration tool during kickoffs, with both dev and QA contributing and reviewing together

### Initiative 3: QA Knowledge Hub <a name="paragraph4-initiative3"></a>

**Problem**: Knowledge scattered (Slack, code comments, various documents, etc)

**Solution**: Centralized, searchable QA documentation hub

**Implementation Plan:**
- **Phase 1**: Audit existing docs, identify and fill gaps
- **Phase 2**: Migrate all existing docs to Centralized hub
- **Phase 3**: Present new documentation to all relevant stakeholders (inside and outside of QA)
- **Ongoing**: Update and maintain, assign doc owners

**Success Metrics:**
- % of QA questions answered by docs (instead of pings on Slack, etc)
- New QA hires onboarding time reduced

**Risks and Mitigation:**
- Risk: Documentation becomes bloated and hard to maintain
- Mitigation: Doc owners ensure only re-usable and relevant information is documented, regular clean-ups of obsolete or redundant info
