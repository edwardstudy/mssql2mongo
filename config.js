exports.config = {
    mongodb: "mongodb://222.31.76.102/test",
    mssqlconfig: {
        userName: 'sa',
        password: '1q2w3e4r/',
        server: '222.31.76.92',
        options: {
          database: 'alarmos',
          debug: {
            data: true,
            payload: false,
            token: false,
            packet: true,
            log: true
          }
        }
    },
    poolConfig: {
      min:2,
      max: 4,
      log: true
    }

};

