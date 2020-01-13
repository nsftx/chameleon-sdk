import mapping from './mapping';

describe('mapping utility', () => {
  const source = [
    {
      title: 'Frozen Yogurt',
      summary: 'calories: 159',
    },
  ];

  const schema = [
    {
      name: 'title',
      type: 'String',
      title: null,
      mapName: 'name',
      mapType: null,
    },
    {
      name: 'summary',
      type: 'String',
      title: null,
      mapName: 'description',
      mapType: null,
    },
  ];
  it('should map summary to description and title to name', () => {
    const expected = [{
      name: 'Frozen Yogurt',
      description: 'calories: 159',
    }];

    const expression = mapping.mapWithSchema(schema, source);
    expect(expression).toEqual(expected);
  });
});
