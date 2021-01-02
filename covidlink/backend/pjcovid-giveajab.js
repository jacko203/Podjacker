// Include the AWS SDK module
const AWS = require('aws-sdk');
// Instantiate a DynamoDB document client with the SDK
let dynamodb = new AWS.DynamoDB.DocumentClient();
// Use built-in module to get current date & time
let date = new Date();
// Store date and time in human-readable format in a variable
let now = date.toISOString();
var testreturn = 0;
var json_return_array;

exports.handler = async (event) => {

    //make this better
    if(event.operation == "dovaccinate")
    {
      console.log("in do-vaccinate");



    var int_cubicle = event.cubicle;

    let params = {
        TableName:'text-pjcovid-vaccines',
        Item: {
            'cubicle': int_cubicle,
            'timestamp': now
        }
    };
    // Using await, make sure object writes to DynamoDB table before continuing execution
    console.log("Putting item:" +int_cubicle);

    var docClient = new AWS.DynamoDB.DocumentClient();

    var readparams = {
          TableName : "text-pjcovid-vaccines",
          KeyConditionExpression: "cubicle = :cubval",
          ExpressionAttributeValues: {
              ":cubval": int_cubicle
              }
            };

    console.log("Getting item:"+int_cubicle);

    try {

          await dynamodb.put(params).promise();
          console.log("put promise resolved");
        // Now query for all from this cubicle
          let data = await docClient.query(readparams).promise();

          console.log("about to create return array");
          json_return_array = JSON.stringify(data.Items);

        } catch (err) { console.log(err) }

    console.log("Returning");

      var response = {
        statusCode: 200,
        body: json_return_array
      }

      return response;
    }
};
