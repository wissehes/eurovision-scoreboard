export const rankToPoints = (rank: number) => {
  if (rank <= 2) {
    return 12 - (rank - 1) * 2;
  } else if (rank <= 10) {
    return 10 - (rank - 1);
  } else return 0;
};
