// Quick test of the challenge generator
import { generateDailyChallenges, getChallengeStats } from './src/data/challengeGenerator.js';

console.log('🎯 ASHVEIL DAILY CHALLENGE GENERATOR TEST');
console.log('=========================================\n');

// Generate 6 challenges
const challenges = generateDailyChallenges(6);
const stats = getChallengeStats(challenges);

console.log(`📊 Generated ${challenges.length} challenges:\n`);

challenges.forEach((challenge, index) => {
  console.log(`${index + 1}. ${challenge.title} [${challenge.difficulty}]`);
  console.log(`   Category: ${challenge.category}`);
  console.log(`   Description: ${challenge.description}`);
  console.log(`   Reward: ${challenge.reward.amount} ${challenge.reward.currency}`);
  console.log(`   Time Limit: ${challenge.timeLimit}`);
  if (challenge.requiredDino) {
    console.log(`   Required Dinosaur: ${challenge.requiredDino}`);
  }
  console.log('');
});

console.log('📈 CHALLENGE STATISTICS:');
console.log('=========================');
console.log('By Difficulty:', stats.byDifficulty);
console.log('By Category:', stats.byCategory);
console.log('By Type:', stats.byType);
console.log('Total Rewards:', stats.totalRewards);

export { challenges, stats };