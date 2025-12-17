const path = require('path');

/** @type {import('orval').Options} */
module.exports = {
  backend: {
    output: {
      mode: 'single',

      client: 'react-query',

      prettier: true,

      target: path.resolve(__dirname, './query/index.ts'),

      packageJson: require.resolve('./package.json'),

      tsconfig: require.resolve('./tsconfig.json'),

      override: {
        mutator: {
          path: require.resolve('./api/axios.ts'),
          name: 'request'
        },
        query: {
          useQuery: true,
        },
        header: () => '//@ts-nocheck\n'
      }
    },

    input: {
      target: require.resolve('./swagger.json')
    }
  }
};
