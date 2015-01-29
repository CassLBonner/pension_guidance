Feature: Guides
  As a visitor to the website
  I want informative content on the website
  So that I can educate myself about pensions and retirement

  Scenario Outline: Load a guide
    When I visit the <id> guide
    Then the guide is displayed

  Examples:
    | id                                   |
    | 7-things-to-get-you-started          |
    | check-the-value-of-your-pension-pot  |
    | how-long-your-money-needs-to-last    |
    | how-to-shop-around-for-the-best-deal |
    | know-your-pension-type               |
    | tax-you-pay-on-your-pension          |

  Scenario: Display guide title and heading
    When I visit a guide
    Then the page title corresponds to the title of the guide
    And the page heading corresponds to the title of the guide
