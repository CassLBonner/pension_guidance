(function() {
  'use strict';

  function TakeWholePotCalculator() {
    this.standardPersonalAllowance = 10600;
    this.personalAllowanceReductionThreshold = 100000;
    this.personalAllowanceReductionRatio = 2;

    this.basicRateUpperLimit = 31785;
    this.basicRateTax = 0.2;

    this.higherRateUpperLimit = 150000;
    this.higherRateTax = 0.4;

    this.additionalRateTax = 0.45;

    this.taxablePotPortion = 0.75;
  }

  TakeWholePotCalculator.prototype.round = function(num) {
    return Math.round(num * 100) / 100;
  };

  TakeWholePotCalculator.prototype.personalAllowanceFor = function(totalIncome) {
    if (totalIncome <= this.personalAllowanceReductionThreshold) {
      return this.standardPersonalAllowance;
    } else {
      var overThreshold = totalIncome - this.personalAllowanceReductionThreshold,
          reduction = Math.min(Math.floor(overThreshold / this.personalAllowanceReductionRatio),
                               this.standardPersonalAllowance);

      return this.standardPersonalAllowance - reduction;
    }
  };

  TakeWholePotCalculator.prototype.marginalTaxForIncomeWithAllowance = function(income, allowance) {
    var taxableIncome,
        subjectToBasicRate = 0,
        subjectToHigherRate = 0,
        subjectToAdditionalRate = 0;

    if (income <= allowance) {
      taxableIncome = 0;
    } else if (income <= this.higherRateUpperLimit) {
      taxableIncome = income - allowance;
    } else {
      taxableIncome = income;
    }

    subjectToBasicRate = Math.min(taxableIncome, this.basicRateUpperLimit);

    if (taxableIncome > this.basicRateUpperLimit) {
      subjectToHigherRate = Math.min(taxableIncome - this.basicRateUpperLimit,
                                     this.higherRateUpperLimit - this.basicRateUpperLimit);
    }

    subjectToAdditionalRate = Math.max(taxableIncome - this.higherRateUpperLimit, 0);

    return {
      basic: this.round(subjectToBasicRate * this.basicRateTax),
      higher: this.round(subjectToHigherRate * this.higherRateTax),
      additional: this.round(subjectToAdditionalRate * this.additionalRateTax)
    };
  };

  TakeWholePotCalculator.prototype.marginalTaxForPotWithIncome = function(pot, income) {
    var potentiallyTaxablePot,
        remainingTaxablePot,
        incomeAboveAllowance,
        allowance,
        effectiveAllowance,
        effectiveBasicRateUpperLimit,
        effectiveHigherRateUpperLimit,
        subjectToBasicRate = 0,
        subjectToHigherRate = 0,
        subjectToAdditionalRate = 0;

    potentiallyTaxablePot = pot * this.taxablePotPortion;
    allowance = this.personalAllowanceFor(potentiallyTaxablePot + income);

    // adjust bands according to income
    incomeAboveAllowance = Math.max(income - allowance, 0);
    effectiveAllowance = Math.max(allowance - income, 0);
    effectiveBasicRateUpperLimit = Math.max(this.basicRateUpperLimit - incomeAboveAllowance, 0);
    effectiveHigherRateUpperLimit = Math.max(this.higherRateUpperLimit - incomeAboveAllowance, 0);

    remainingTaxablePot = potentiallyTaxablePot;

    // personal allowance
    if (remainingTaxablePot <= effectiveAllowance) {
      remainingTaxablePot = 0;
    } else {
      remainingTaxablePot = Math.max(remainingTaxablePot - effectiveAllowance, 0);
    }

    // basic rate
    subjectToBasicRate = Math.min(remainingTaxablePot, effectiveBasicRateUpperLimit);
    remainingTaxablePot -= subjectToBasicRate;

    // higher rate
    subjectToHigherRate = Math.min(remainingTaxablePot, (effectiveHigherRateUpperLimit - effectiveBasicRateUpperLimit));
    remainingTaxablePot -= subjectToHigherRate;

    // additional rate
    subjectToAdditionalRate = remainingTaxablePot;

    return {
      basic: this.round(subjectToBasicRate * this.basicRateTax),
      higher: this.round(subjectToHigherRate * this.higherRateTax),
      additional: this.round(subjectToAdditionalRate * this.additionalRateTax)
    };
  };

  window.PWPG = window.PWPG || {};
  window.PWPG.takeWholePotCalculator = TakeWholePotCalculator;
})();