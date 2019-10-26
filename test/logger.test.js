const { Logger } = require('../index')

let logger;

let timer = (callback, delay) => {
  console.log('Ready....go!');
  setTimeout(() => {
    console.log("Time's up -- stop!");
    callback && callback();
  }, delay);
}

describe('Logger tests', () => {
  beforeAll(() => {
    logger = new Logger({
      namespace: 'imbue.test'
    });
  });

  test('Print a pageView output', () => {
    expect(logger).toBeDefined();
    logger.pageView(5);
  });

  test('Print a latency output', () => {
    expect(logger).toBeDefined();
    logger.latency(30);
  });

  test('Print a send output', () => {
    expect(logger).toBeDefined();
    logger.send('jump', 5, 'jumps');
  });

  describe('Calculated metrics', () => {
    test('Create a calculated metric and measure it', async () => {
      expect(logger).toBeDefined();

      let handle = logger.startCalculation();

      expect(logger.queueSize()).toBe(1);

      await new Promise((r) => setTimeout(r, 2000));

      let item = logger.endCalculation(handle);

      console.log(
        JSON.stringify(item, null, 2));

      expect(item.handle).toBe(handle);
      expect(item.calculated).toBeGreaterThan(2000)

    });
  });
});
