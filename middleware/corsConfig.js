const cors = require('cors');

const ALLOWED_ORIGINS = [
    'http://localhost:2000',
    'http://localhost:3000',
    'http://localhost:54673',
    'http://localhost:5000',
    'http://192.168.157.198:2000',
    'http://10.0.2.2:2000',
    'http://localhost:8000',
];

const corsOptions = {
    origin: function(origin, callback) {
        if (!origin || ALLOWED_ORIGINS.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
};

module.exports = cors(corsOptions);