module.exports = {
    requestDetection: {
        minTimeBetweenRequests: 2,
        maxRequestsInWindow: 5,
        requestWindowTime: 10
    },
    blocking: {
        temporaryBlockHours: 2,
        maxBlocksBeforePermanent: 3,
        blockCountWindowDays: 7
    },
    hardware: {
        enabled: true,
        required: false
    }
};
