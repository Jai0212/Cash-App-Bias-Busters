// __mocks__/chart.js
const Chart = jest.fn(() => ({
  destroy: jest.fn(),
  update: jest.fn(),
}));

export default Chart;
