// src/graphql.ts
var TypedDocumentString = class extends String {
  constructor(value, __meta__) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }
  __apiType;
  toString() {
    return this.value;
  }
};

export {
  TypedDocumentString
};
