export const getPriorityRewards = (priority) => {
  // Matches backend base values. 
  // Actual payout may be higher if the user has an active daily streak!
  switch (priority) {
    case 'HIGH':   return { xp: 100, gems: 3 };
    case 'MEDIUM': return { xp: 75,  gems: 2 };
    case 'LOW':
    default:       return { xp: 50,  gems: 1 };
  }
};