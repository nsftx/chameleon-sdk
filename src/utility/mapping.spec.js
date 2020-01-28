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

  it('should return the same source because schema is not an array', () => {
    const expected = [{
      title: 'Frozen Yogurt',
      summary: 'calories: 159',
    }];
    const testSchema = {};
    const expression = mapping.mapWithSchema(testSchema, source);

    expect(expression).toEqual(expected);
  });

  it('should not map anything because of mismatching names', () => {
    const expected = {};
    const testSource = {
      a: 'Frozen Yogurt',
      b: 'calories: 159',
    };
    const expression = mapping.mapWithSchema(schema, testSource);

    expect(expression).toEqual(expected);
  });

  it('should return the same source because there is no mapName nor mask property', () => {
    const expected = [{
      title: 'Frozen Yogurt',
      summary: 'calories: 159',
    }];
    const testSchema = [
      {
        name: 'title',
        type: 'String',
        title: null,
        mapType: null,
      },
    ];
    const expression = mapping.mapWithSchema(testSchema, source);

    expect(expression).toEqual(expected);
  });
});
