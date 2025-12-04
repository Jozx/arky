const { pool } = require('../config/db');

const idempotencyMiddleware = async (req, res, next) => {
    // Only apply to mutating methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }

    const key = req.headers['idempotency-key'];
    if (!key) {
        // If no key is provided, proceed as normal (or enforce it if strict mode is desired)
        // For now, we'll allow requests without keys but maybe log a warning
        return next();
    }

    const userId = req.user ? req.user.id : null; // Assuming authMiddleware runs before this
    const path = req.originalUrl;
    const method = req.method;
    const params = JSON.stringify(req.body);

    try {
        // Check if key exists
        const result = await pool.query(
            'SELECT * FROM idempotency_keys WHERE key = $1',
            [key]
        );

        if (result.rows.length > 0) {
            const entry = result.rows[0];

            // If locked, it means the request is still processing
            if (entry.locked_at && !entry.response_code) {
                return res.status(409).json({
                    message: 'Request is currently being processed. Please retry later.'
                });
            }

            // If we have a response, return it
            if (entry.response_code) {
                // Return cached response
                return res.status(entry.response_code).json(JSON.parse(entry.response_body));
            }
        }

        // Create a new entry (lock it)
        await pool.query(
            'INSERT INTO idempotency_keys (key, user_id, path, method, params, locked_at) VALUES ($1, $2, $3, $4, $5, NOW())',
            [key, userId, path, method, params]
        );

        // Override res.send/res.json to capture the response
        const originalSend = res.send;
        const originalJson = res.json;

        res.send = function (body) {
            // Restore original to avoid infinite loop if we use it inside
            res.send = originalSend;

            // Capture response
            const responseBody = body;
            const responseCode = res.statusCode;

            // Update DB asynchronously (fire and forget, or await if critical)
            // We should probably await to ensure consistency, but for performance we might not want to block too long.
            // However, for idempotency, we MUST save it.

            // Note: body might be a string or object depending on how it was called.
            // Express res.json calls res.send with a stringified object.

            let storedBody = responseBody;
            if (typeof responseBody === 'object') {
                storedBody = JSON.stringify(responseBody);
            }

            pool.query(
                'UPDATE idempotency_keys SET response_code = $1, response_body = $2, locked_at = NULL WHERE key = $3',
                [responseCode, storedBody, key]
            ).catch(err => console.error('Failed to update idempotency key:', err));

            return originalSend.call(this, body);
        };

        res.json = function (body) {
            res.json = originalJson;
            // Capture response
            const responseBody = JSON.stringify(body);
            const responseCode = res.statusCode;

            pool.query(
                'UPDATE idempotency_keys SET response_code = $1, response_body = $2, locked_at = NULL WHERE key = $3',
                [responseCode, responseBody, key]
            ).catch(err => console.error('Failed to update idempotency key:', err));

            return originalJson.call(this, body);
        };

        next();

    } catch (error) {
        console.error('Idempotency middleware error:', error);
        // If DB fails, we probably should fail the request or proceed without idempotency?
        // Safer to fail if we can't guarantee idempotency.
        next(error);
    }
};

module.exports = idempotencyMiddleware;
