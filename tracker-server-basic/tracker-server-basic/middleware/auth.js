const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const client = jwksClient({
  jwksUri: 'https://dev-xxjgz6slv15o564e.eu.auth0.com/.well-known/jwks.json',
  requestHeaders: {}, // Optional
  timeout: 30000, // Defaults to 30s
  // Docker-specific options
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 5,
  jwksUri: 'https://dev-xxjgz6slv15o564e.eu.auth0.com/.well-known/jwks.json'
});

function getKey(header, callback) {
  console.log('🔍 Getting signing key for kid:', header.kid);
  
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      console.error('❌ JWKS error:', err.message);
      console.error('❌ JWKS error details:', err);
      return callback(err);
    }
    console.log('✅ Successfully retrieved signing key');
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

const authenticateToken = (req, res, next) => {
  console.log('🔍 Auth middleware called for:', req.method, req.url);
  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('🔍 Auth header present:', !!authHeader);
  console.log('🔍 Token present:', !!token);
  
  if (token) {
    console.log('🔍 Token start:', token.substring(0, 20) + '...');
    console.log('🔍 Token length:', token.length);
  }

  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({ error: 'Access token required' });
  }

  // Add more detailed logging
  console.log('🔍 Attempting to verify token...');
  console.log('🔍 Expected audience: https://tracker-api');
  console.log('🔍 Expected issuer: https://dev-xxjgz6slv15o564e.eu.auth0.com/');

  jwt.verify(token, getKey, {
    audience: 'https://tracker-api',
    issuer: 'https://dev-xxjgz6slv15o564e.eu.auth0.com/',
    algorithms: ['RS256']
  }, (err, decoded) => {
    if (err) {
      console.error('❌ Token verification failed:', err.name);
      console.error('❌ Token verification error:', err.message);
      console.error('❌ Full error:', err);
      
      // Provide more specific error responses
      let errorMessage = 'Invalid token';
      if (err.message.includes('ECONNREFUSED')) {
        errorMessage = 'Cannot connect to Auth0 for token verification';
      } else if (err.message.includes('audience')) {
        errorMessage = 'Token audience mismatch';
      } else if (err.message.includes('issuer')) {
        errorMessage = 'Token issuer mismatch';
      }
      
      return res.status(403).json({ 
        error: errorMessage,
        details: err.message,
        type: err.name
      });
    }
    
    console.log('✅ Token verified successfully!');
    console.log('✅ User ID:', decoded.sub);
    console.log('✅ Token audience:', decoded.aud);
    console.log('✅ Token scope:', decoded.scope);
    req.user = decoded;
    next();
  });
};

module.exports = { authenticateToken };