export const tabColor = (progressionStatus) => {
  switch (progressionStatus) {
    case 'Pass + Proceed':
      return 'success';
    case 'pending':
      return 'default';
    case 'Fail + Supplement':
      return 'warning';
    case 'Fail + Repeat':
      return 'error';
    default:
      return 'default';
  }
};
