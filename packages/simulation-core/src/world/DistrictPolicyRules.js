/**
 * CITYMIND District Policy Rules & Boundary Constraint System
 * Manages localized municipal district policy enforcement (e.g. Quiet Night Ordinances, Heavy Truck Bans),
 * polygon spatial lookup for district membership, and local tax multiplier rules.
 */

export class DistrictPolicyRuleItem {
  constructor(policyId, districtName, taxMultiplier = 1.0) {
    this.policyId = policyId;
    this.districtName = districtName;
    this.taxMultiplier = taxMultiplier;
    this.isEnforced = true;
  }
}

export class DistrictPolicyRulesEngine {
  constructor(simulation) {
    this.simulation = simulation;
    this.districtRules = new Map();
  }

  setDistrictPolicy(districtName, policyId, taxMultiplier = 1.0) {
    const key = `${districtName}:${policyId}`;
    const rule = new DistrictPolicyRuleItem(policyId, districtName, taxMultiplier);
    this.districtRules.set(key, rule);
    return rule;
  }

  getTaxMultiplierForDistrict(districtName) {
    let multiplier = 1.0;
    this.districtRules.forEach((rule) => {
      if (rule.districtName === districtName && rule.isEnforced) {
        multiplier *= rule.taxMultiplier;
      }
    });
    return multiplier;
  }
}

export default DistrictPolicyRulesEngine;
