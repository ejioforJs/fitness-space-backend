const isUserInTrialPeriod = (user) => {
    const trialStartDate = user.trialStartDate;
    if (!trialStartDate) return false;
  
    const trialEndDate = new Date(trialStartDate);
    trialEndDate.setDate(trialStartDate.getDate() + 15);
  
    return new Date() < trialEndDate;
  };
  
  module.exports = {
    isUserInTrialPeriod,
  };
  