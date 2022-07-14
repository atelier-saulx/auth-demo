module.exports = {
  schema: {
    types: {
      todo: {
        fields: {
          funLevel: {
            type: "int",
            meta: {
              values: { 1: "high", 2: "low", 3: "medium" },
            },
          },
          done: {
            type: "boolean",
          },
          name: {
            type: "string",
          },
          description: {
            type: "string",
          },
          priority: {
            type: "number",
            // validation: { range: [0, 5] },
          },
        },
      },
    },
  },
};
