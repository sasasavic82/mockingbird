
let { MockingServer } = require('../dist/lib/server');
let { SourceLayer } = require('../dist/lib/engine/extesions/source');
let { MockingEngine } = require('../dist/lib/engine/mockEngine');

let request = require('request-promise-native');

let simulators = require('../dist/lib/engine/simulators');

const { MOCKINGBIRD_SERVICE_PORT = 3333 } = process.env;

let mockingServer;
let url = `http://localhost:${MOCKINGBIRD_SERVICE_PORT}/api/v1/mock`

describe('Mockingbird Tests', () => {
  beforeAll(() => {

    let sourceLayer = new SourceLayer(require('./test_data.json'));
    let engineConfig = {
      sourceLayer: sourceLayer
    }
    let engine = new MockingEngine(engineConfig);

    engine.loadSimulators([
      new simulators.BodySimulator({ namespace: "body" })]
    );

    let serverConfig = {
      port: MOCKINGBIRD_SERVICE_PORT,
      debug: true,
      engine: engine
    }

    mockingServer = new MockingServer(serverConfig);

    mockingServer.startService();

  });

  afterAll(() => {
    mockingServer.stopService();
  });

  test('Simulator tests', async () => {

    var options = {
      method: 'POST',
      uri: url,
      body: require('./payload.json'),
      json: true
    };

    let data = await request(options);

    expect(data).toBeDefined();
    expect(Object.keys(data).length).toBe(2);

  });

});
