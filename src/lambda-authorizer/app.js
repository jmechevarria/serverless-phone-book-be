exports.lambdaHandler = async (event) => {
  const policyStatements = [];
  let policyStatement = null;
  let authData = null;

  try {
    if (event.authorizationToken.startsWith('Basic')) {
      // in case we use Basic schema in the future
    } else if (event.authorizationToken.startsWith('Bearer')) {
      authData = await verifyBearerToken(event.authorizationToken);
    } else {
      throw new Error('No token or invalid token found');
    }

    policyStatement = generatePolicyStatement('*', 'Allow');
    policyStatements.push(policyStatement);

    return generatePolicy('user', policyStatements, authData.id);
  } catch (err) {
    console.error(err);

    // Generate default deny all policy statement if there is an error
    policyStatement = generatePolicyStatement('*', 'Deny');
    policyStatements.push(policyStatement);

    return generatePolicy('user', policyStatements);
  }
};

function generatePolicyStatement(resource, effect) {
  return {
    Action: 'execute-api:Invoke',
    Effect: effect,
    Resource: resource,
  };
}

function generatePolicy(principalId, policyStatements, userId) {
  // Generate a fully formed IAM policy
  const policyDocument = {
    Version: '2012-10-17',
    Statement: policyStatements,
  };
  const context = {
    userId,
  };
  return {
    principalId,
    policyDocument,
    context,
  };
}

function verifyBearerToken(accessToken) {
  // TODO
  return { id: 0 };
}
