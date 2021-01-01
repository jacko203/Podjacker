// Include the AWS SDK module
const AWS = require('aws-sdk');
// Instantiate a DynamoDB document client with the SDK
let dynamodb = new AWS.DynamoDB.DocumentClient();
// Use built-in module to get current date & time
let date = new Date();
// Store date and time in human-readable format in a variable
let now = date.toISOString();

exports.handler = async (event) => {

    var write_cubicle = JSON.stringify(event.cubicle);

    let params = {
        TableName:'pjcovid-vaccines',
        Item: {
            'cubicle': write_cubicle,
            'timestamp': now
        }
    };
    // Using await, make sure object writes to DynamoDB table before continuing execution
    await dynamodb.put(params).promise();


    // TODO implement
    var response = {
        statusCode: 200,
        body: JSON.stringify(write_cubicle+" at "+now),
    };
    return response;
};
