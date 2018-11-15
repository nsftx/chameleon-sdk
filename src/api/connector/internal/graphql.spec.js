/* eslint import/no-unresolved:"off" */
import axiosMock from 'axios';
import sourcesMock from 'data/graphql-sources.json';
import graphql from './graphql';

const connectorMock = {
  type: {
    name: 'chameleon',
    type: 'graphql',
    disabled: false,
    options: {
      endpoint: null,
    },
  },
};

describe('graphql connector', () => {
  it('should have methods exposed', () => {
    const compareType = 'function';
    expect(typeof graphql.getSources).toEqual(compareType);
    expect(typeof graphql.getSourceSchema).toEqual(compareType);
    expect(typeof graphql.getSourceData).toEqual(compareType);
  });

  it('should get sources', (done) => {
    axiosMock.post.mockImplementation(() => Promise.resolve({
      data: sourcesMock,
    }));

    const optionsMock = {};
    graphql.getSources(connectorMock, optionsMock).then((result) => {
      expect(result.noYesChoices.model).toEqual('NoYesChoice');
      done();
    });
  });
});
