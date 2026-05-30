const state = {
  page: 'home',
  selectedMovieId: 1,
  currentEpisodeId: 's1e1',
  filters: {
    genre: 'Tất cả',
    country: 'Tất cả',
    year: 'Tất cả',
    type: 'Tất cả',
    sort: 'Mới nhất',
    keyword: ''
  },
  detailTab: 'overview',
  accountTab: 'profile',
  season: 1
};

export function getState() {
  return state;
}

export function setState(nextState) {
  Object.keys(state).forEach(key => delete state[key]);
  Object.assign(state, nextState);
  return state;
}

export function updateState(patch) {
  Object.assign(state, patch);
  return state;
}

export { state };
