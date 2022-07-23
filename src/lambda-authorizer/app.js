const jwt = require('jsonwebtoken');
const manager = require('./manager');

const secretsPromise = manager.getSecret('JWT_SECRET');
let jwtSecret;

exports.lambdaHandler = async (event) => {
  if (!jwtSecret) {
    try {
      jwtSecret = await secretsPromise;
    } catch (error) {
      console.error('Getting credentials', error);

      throw new Error('500');
    }
  }

  const policyStatements = [];
  let policyStatement = null;
  let authData = null;

  try {
    const authHeader = event.authorizationToken;

    if (authHeader.startsWith('Basic ')) {
      // in case we use Basic schema in the future
    } else if (authHeader.startsWith('Bearer ')) {
      authData = jwt.verify(authHeader.split(' ')[1], jwtSecret);
    } else {
      throw new Error('No token or invalid token found');
    }

    policyStatement = generatePolicyStatement('*', 'Allow');
    policyStatements.push(policyStatement);

    return generatePolicy(policyStatements, authData);
  } catch (err) {
    console.error(err);

    // Generate default deny all policy statement if there is an error
    policyStatement = generatePolicyStatement('*', 'Deny');
    policyStatements.push(policyStatement);

    return generatePolicy(policyStatements);
  }
};

function generatePolicyStatement(resource, effect) {
  return {
    Action: 'execute-api:Invoke',
    Effect: effect,
    Resource: resource,
  };
}

function generatePolicy(policyStatements, authData) {
  // Generate a fully formed IAM policy
  const policyDocument = {
    Version: '2012-10-17',
    Statement: policyStatements,
  };
  const context = {
    ...authData,
  };
  return {
    principalId: 'user',
    policyDocument,
    context,
  };
}
