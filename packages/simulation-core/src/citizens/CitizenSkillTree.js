/**
 * CITYMIND Citizen Skill Progression & Vocational Expertise Engine
 * Tracks individual citizen skill points across Software, Electrical, Civil Engineering, Medicine, Agriculture, and Management,
 * computes experience gain rates ($XP = Base \cdot (1 + IntelligenceBonus)$), and skill level unlocks.
 */

export class SkillNode {
  constructor(skillName, initialLevel = 1) {
    this.skillName = skillName;
    this.level = initialLevel; // 1 to 100
    this.currentXp = 0;
    this.xpToNextLevel = 100 * initialLevel;
  }

  addXp(amount) {
    this.currentXp += amount;
    while (this.currentXp >= this.xpToNextLevel && this.level < 100) {
      this.currentXp -= this.xpToNextLevel;
      this.level += 1;
      this.xpToNextLevel = Math.round(100 * Math.pow(1.15, this.level));
    }
  }
}

export class CitizenSkillTree {
  constructor(citizenId) {
    this.citizenId = citizenId;
    this.skills = new Map();
    this.initializeSkills();
  }

  initializeSkills() {
    this.skills.set('SoftwareEng', new SkillNode('SoftwareEng', 1));
    this.skills.set('ElectricalSys', new SkillNode('ElectricalSys', 1));
    this.skills.set('CivilArch', new SkillNode('CivilArch', 1));
    this.skills.set('Medicine', new SkillNode('Medicine', 1));
  }

  gainSkillXp(skillName, xpAmount) {
    if (this.skills.has(skillName)) {
      this.skills.get(skillName).addXp(xpAmount);
    }
  }

  getSkillLevel(skillName) {
    return this.skills.has(skillName) ? this.skills.get(skillName).level : 1;
  }
}

export default CitizenSkillTree;
