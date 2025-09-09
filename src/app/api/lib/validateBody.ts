export default (requiredData: string[], requestBody: string[]) => {
  if (!Object.keys(requestBody).length) {
    return {
      message: "ERR_REQBODY_EMPTY",
      results: { required: requiredData },
    };
  }

  const validation = requiredData.filter((field) =>
    Object.keys(requestBody).includes(field),
  );

  if (validation.length < requiredData.length) {
    return {
      message: "ERR_REQBODY_INC",
      results: {
        missing: requiredData.filter((field) => !validation.includes(field)),
      },
    };
  }

  return {
    message: "PROCEED",
    results: null,
  };
};
