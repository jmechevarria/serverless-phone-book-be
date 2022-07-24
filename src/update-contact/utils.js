exports.buildQuery = (columns) => {
  const {
    id, userId, name, phone, addressLines,
  } = columns;

  let index = 1;
  const setValues = [];
  const params = [];

  if (name) {
    setValues.push(`name = $${index++}`);
    params.push(name);
  }
  if (phone) {
    setValues.push(`phone = $${index++}`);
    params.push(phone);
  }

  if (addressLines) {
    setValues.push(`address_lines = $${index++}`);
    params.push(addressLines.join('|||'));
  }

  params.push(userId, id);

  return {
    querystring: `UPDATE contact SET ${setValues.join(',')} WHERE user_id=$${index++} AND id=$${index++} RETURNING *;`,
    params,
  };
};
