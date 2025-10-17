@transfer @rbac
Feature: Bank transfer creation
  Background:
    Given the bank transfer page is open

  @happy
  Scenario: Happy path - Instant transfer with valid data
    When I set my role to "Administrator"
    And I fill the form with valid instant transfer data
    And I submit the form
    Then I should see a success message

  @happy @date
  Scenario: Happy path - Scheduled transfer for tomorrow
    When I set my role to "Purchase Manager"
    And I choose scheduled transfer mode
    And I set the transfer date to tomorrow
    And I fill the rest of the form with valid data
    And I submit the form
    Then I should see a success message

  @invalid @boundary
  Scenario Outline: Invalid IBAN length
    When I set my role to "Administrator"
    And I fill the form with IBAN "<iban>"
    And I submit the form
    Then I should see an invalid message

    Examples:
      | iban           |
      | SHORTIBAN123   |

  @rbac
  Scenario: Access control - non-authorized user cannot create transfer
    When I set my role to "Guest"
    And I fill the form with valid instant transfer data
    And I submit the form
    Then I should see an access denied message

  @boundary @amount
  Scenario Outline: Amount boundary checks
    When I set my role to "Administrator"
    And I fill the form with amount "<amount>"
    And I submit the form
    Then I should see "<result>" message

    Examples:
      | amount     | result  |
      | 0.01       | success |
      | 100000     | success |
      | 100000.01  | Invalid |

  @boundary @iban
  Scenario Outline: IBAN boundary length
    When I set my role to "Administrator"
    And I fill the form with IBAN "<iban>"
    And I submit the form
    Then I should see "<result>" message

    Examples:
      | iban                       | result  |
      | A23456789012345            | success |
      | A234567890123456789012345678901234 | success |
      | SHORTIBAN123               | Invalid |

  @boundary @date
  Scenario Outline: Date boundary checks
    When I set my role to "Administrator"
    And I fill the scheduled form with date "<date>"
    And I submit the form
    Then I should see "<result>" message

    Examples:
      | date     | result  |
      | tomorrow | success |
      | yesterday | Invalid |

  @invalid @label
  Scenario: Invalid label with special characters
    When I set my role to "Administrator"
    And I fill the form with label "Invoice #1!"
    And I submit the form
    Then I should see an invalid message
