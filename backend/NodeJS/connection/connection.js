require('dotenv').config();
const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: "cashapp-cashapp-9667.b.aivencloud.com",
    user: "avnadmin",
    password: "AVNS_5S6QYQE-TygM_BSYuNy",
    database: "defaultdb", 
    port: 17091, 
    ssl: {
        rejectUnauthorized: false,
        ca: `-----BEGIN CERTIFICATE-----
MIIEQTCCAqmgAwIBAgIUQS/xkpkLY9gqFXnb/Nowi8vXBrowDQYJKoZIhvcNAQEM
BQAwOjE4MDYGA1UEAwwvOWVhMjRmOTMtYmEyMi00YmExLThkYjQtMTMyZTdkMmJm
N2MxIFByb2plY3QgQ0EwHhcNMjQwOTI5MjIxMzUxWhcNMzQwOTI3MjIxMzUxWjA6
MTgwNgYDVQQDDC85ZWEyNGY5My1iYTIyLTRiYTEtOGRiNC0xMzJlN2QyYmY3YzEg
UHJvamVjdCBDQTCCAaIwDQYJKoZIhvcNAQEBBQADggGPADCCAYoCggGBAJR/L5/m
q/JfzKFtEjidZwh0SOfg6dCkqsZzAzkL0ggfh0WS8fNQld0a60cY1DoDp0nHSR/6
+BqlwC8wxrLSPtX961UhxPx3C1RfJvQqSxfmRMAVnC8O9AcqVXNPHLgyu1koSvwt
LBdEZ7kIXw7d2Wujeme5avnrb2SODQU/7xhUMZ1m05x7Sp4ckOHz4ikswwR1NK3f
TbqjBeH3ExfgRLNM2vgGdI5dLNZKGMtmOpoBBueGrahzMymIANkzZ8wtz/Ke3uMQ
5FQ3Xt+o0Ypyk6z1AWcM0+VplQo7cB7WiFccIZMoyRO7F+S/e9j28gtchVSEQFoP
RIbJ1lOn/xPgJVWI6I4GVtIIMgzuvgGVekYhQqDGgrWY0hEuzPyqblY41G2OPhko
Fa5lfYxYaRtp840SSw4O7ZgUHpMYGajprnrpyAMGyABRybdd+ik6LkQGWVfqYR0n
uA/nIEvka6RjFuTPauNZ1pJ+clrazxPUm9r8IlTG/TpoYUdDMUHvpRsSewIDAQAB
oz8wPTAdBgNVHQ4EFgQU1keChiDpuujvnM2UHT42xVVN6l0wDwYDVR0TBAgwBgEB
/wIBADALBgNVHQ8EBAMCAQYwDQYJKoZIhvcNAQEMBQADggGBADa0dxcPQAcqQngs
LPGzoxgnsTUCMQOUZgNA6/i/mETVG+QPk0Qq9Nx0HOCmJO/iMaVZZqkHZldsTZ0s
vsEIfs/rCx6pQ2OExW+SfSMvEAUhIwArAHhuXF+xZYTOd+tgfLytVyEu5xx9kLKK
7OV3sTA7f9T2A6leVuLXDLUNtWp/IpkFJ1/qENCWBphKPUCOUK3tgJ4GZFqeaBN3
5ftLdDqiYUtaqgkM0G+DSAv2U9V4alOLl5smG3wmh1+lnk+9bHldTPOYvutwgexC
TL0ls5/orYcc8QxD8723e81p1ATzI46GycsuvLQq9plf7LDokHd0y4zLgKnC+WmS
Hal3IGQCskgQXWx2yUdQ58DtY6UqJ4MYzy5bjvm6SMuwC2iEqbmX35lXIA86HryL
0bbLNVVesdrXv/0lNAdEJC4HJe78CkLIXoJUd4vrx9OQjhc5vSgVgB+z5Eg+Q+Kr
TT1lVN9DcCR7COm0uZXbjibENC1XETRMAe0Vjs2WLnmESTxR7w==
-----END CERTIFICATE-----`
    }
});

connection.connect((error) => {
    if (error) {
        console.error('Database connection failed:', error.message);
    } else {
        console.log("Database Connected");
    }
});

module.exports = connection;
